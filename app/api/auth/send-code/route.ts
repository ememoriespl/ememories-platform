import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { createOtpToken } from "@/lib/session"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase"

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

async function isAllowedEmail(email: string): Promise<boolean> {
  if (email.endsWith("@ememories.pl")) return true
  const supabase = createServerClient()
  const [{ data: admin }, { data: funeralHome }] = await Promise.all([
    supabase.from("admin_emails").select("email").eq("email", email).maybeSingle(),
    supabase.from("funeral_homes").select("id").eq("email", email).eq("status", "active").maybeSingle(),
  ])
  return !!admin || !!funeralHome
}

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Nieprawidłowy email" }, { status: 400 })
  }

  const normalized = email.toLowerCase()

  if (!(await isAllowedEmail(normalized))) {
    return NextResponse.json({ error: "Brak dostępu. Skontaktuj się z administratorem." }, { status: 403 })
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
      <div style="font-family:sans-serif;max-width:420px;margin:0 auto;padding:32px 24px">
        <div style="margin-bottom:28px">
          <img src="https://ememoriespl.vercel.app/logo-light-2x.png" alt="eMemories" width="178" height="46" style="display:block;border:0;text-decoration:none;outline:none"/>
        </div>
        <h2 style="margin:0 0 8px;font-size:20px;color:#111">Kod logowania</h2>
        <p style="color:#666;margin:0 0 24px;font-size:14px">
          Użyj poniższego kodu, aby zalogować się do eMemories.<br>
          Kod jest ważny przez <strong>10 minut</strong>.
        </p>
        <div style="background:#f4f4f5;border-radius:8px;padding:20px;text-align:center;letter-spacing:8px;font-size:32px;font-weight:700;color:#111">
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
