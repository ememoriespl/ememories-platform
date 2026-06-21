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
        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px">
          <tr>
            <td valign="middle" style="padding-right:10px">
              <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDYiIGhlaWdodD0iNDYiIHZpZXdCb3g9IjAgMCA0NiA0NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzE0XzEyNCkiPgo8cGF0aCBkPSJNMzcuOTkwNiAxMS42NzlDMzguMTQ0MSAxMS44MTY2IDM2LjM0MTggMTQuODgxNyAzNi4yNTk1IDE1LjQwN0MzNS40NDc3IDIwLjU3OTggMzcuODcxOSAyNi4zOTQ5IDMzLjk1NzEgMzAuOTg1NEMzMC44MTMgMzQuNjcwNyAyNi43MjczIDM0LjM2ODUgMjIuMjc5MyAzNC4zNEMyMS4wNDgyIDM0Ljk3NDUgMTguODYzIDM3Ljc0ODQgMTcuNjQ2MSAzNy45MzUxQzE0LjgyOTUgMzguMzY4NyAxMC41OTY3IDM2LjY2MjkgOC43OTI4NCAzNC40NjY2QzguMzEwMjIgMzMuODc5NSA3LjYzNzcxIDMzLjA2MTQgOC4yMzI2OCAzMi4zNjA0QzguNzQ2OTUgMzEuNzU0NCAxNS44NDg2IDMwLjUzNiAxNy4xMDE4IDMwLjAzMjhDMTEuMjkxNCAyNS43OTIxIDguMTg4MzcgMTkuMDg5MiAxMC42NjE2IDExLjk2MzhDMTAuOTQxNyAxMS4xNTY4IDExLjYyNjggOC45OTIxMiAxMi44MjQ3IDEwLjAyNTRDMTMuMTM0OCAxMC4yOTI4IDEzLjkxNDkgMTIuMTEyNSAxNC4yODUyIDEyLjY3OUMxNi43MDk0IDE2LjM5NiAyMS4wMDM5IDE5LjE1ODggMjUuNDMxNCAxOS43Mjg0QzI1LjgxMjcgMTkuNzc3NSAyNi41MjY0IDE5Ljk0ODQgMjYuNzU1OCAxOS42NzE1VjE2LjI3NDJDMjYuNzU1OCAxNS45Njg4IDI2LjcxMTUgMTUuNjE5MSAyNi43ODI3IDE1LjMyMTZDMjcuMTQ1MSAxMy43OTE0IDI4LjQ1ODQgMTIuNDg3NiAyOS44OTIgMTEuOTA1M0MzMC40MTExIDExLjY5NDggMzAuOTEyNyAxMS42NzkgMzEuNDU4NiAxMS42NzlIMzcuOTkwNlpNMzEuMTQyMSAxNS41MDUxQzMwLjIxMDEgMTUuNzc3MyAzMC40MTkgMTcuNDMyNCAzMS40MDk1IDE3LjM3ODZDMzIuODAyIDE3LjMwMjcgMzIuNDU1NSAxNS4xMjM4IDMxLjE0MjEgMTUuNTA1MVoiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl8xNF8xMjQpIi8+CjxwYXRoIGQ9Ik0yNC44NTUyIDE3LjY5MzZDMjEuODcwOSAxNy4yODY5IDE5LjIyOTkgMTUuNTU1OCAxNy4xODM5IDEzLjQyNkMxNi45ODYxIDEyLjkwMjIgMTkuNTU5IDguMzk0MDYgMjAuMTQ2MSA4LjE0NTYzQzIxLjg4MDQgNy40MTI5OSAyMS43NDExIDkuNjIxOTcgMjIuMDg3NyAxMC43Mjk2QzIyLjMyNjYgMTEuNDkyMyAyMi41OTcyIDEyLjMyNzggMjIuOTMxMSAxMy4wNTA5QzIzLjY3IDE0LjY1MzkgMjUuMTcxNyAxNS44Mzc1IDI0Ljg1NjggMTcuNjkyTDI0Ljg1NTIgMTcuNjkzNloiIGZpbGw9InVybCgjcGFpbnQxX2xpbmVhcl8xNF8xMjQpIi8+CjwvZz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl8xNF8xMjQiIHgxPSIyMi45OTk0IiB5MT0iOS43NTE0MyIgeDI9IjIyLjk5OTQiIHkyPSIzOC4wMDI4IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNDMDkxRkYiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjN0MyQ0U4Ii8+CjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQxX2xpbmVhcl8xNF8xMjQiIHgxPSIyMS4wMzYzIiB5MT0iNy45OTk3NSIgeDI9IjIxLjAzNjMiIHkyPSIxNy42OTM2IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNDMDkxRkYiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjN0MyQ0U4Ii8+CjwvbGluZWFyR3JhZGllbnQ+CjxjbGlwUGF0aCBpZD0iY2xpcDBfMTRfMTI0Ij4KPHJlY3Qgd2lkdGg9IjMwIiBoZWlnaHQ9IjMwLjAwNDciIGZpbGw9IndoaXRlIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg4IDgpIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg==" alt="eMemories" width="36" height="36" style="display:block"/>
            </td>
            <td valign="middle">
              <span style="font-size:20px;font-weight:700;color:#111;font-family:sans-serif">eMemories</span>
            </td>
          </tr>
        </table>
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
