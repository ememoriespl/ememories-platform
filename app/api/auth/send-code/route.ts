import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { createOtpToken } from "@/lib/session"
import { cookies } from "next/headers"

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Nieprawidłowy email" }, { status: 400 })
  }

  const code = generateCode()
  const token = await createOtpToken(email.toLowerCase(), code)

  const cookieStore = await cookies()
  cookieStore.set("otp_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  })

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })

  await transporter.sendMail({
    from: `"eMemories" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Twój kod logowania — eMemories",
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 8px;font-size:20px">Kod logowania</h2>
        <p style="color:#666;margin:0 0 24px;font-size:14px">
          Użyj poniższego kodu, aby zalogować się do eMemories.<br>
          Kod jest ważny przez <strong>10 minut</strong>.
        </p>
        <div style="background:#f4f4f5;border-radius:8px;padding:20px;text-align:center;letter-spacing:8px;font-size:32px;font-weight:700">
          ${code}
        </div>
        <p style="color:#999;font-size:12px;margin:16px 0 0">
          Jeśli nie prosiłeś/aś o ten kod, zignoruj tę wiadomość.
        </p>
      </div>
    `,
  })

  return NextResponse.json({ ok: true })
}
