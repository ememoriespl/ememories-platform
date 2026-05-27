import { NextRequest, NextResponse } from "next/server"
import { verifyOtpToken, createSession } from "@/lib/session"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  const { code } = await req.json()
  const cookieStore = await cookies()
  const otpToken = cookieStore.get("otp_token")?.value

  if (!otpToken) {
    return NextResponse.json({ error: "Sesja wygasła. Wyślij kod ponownie." }, { status: 400 })
  }

  if (!code || typeof code !== "string" || code.length !== 6) {
    return NextResponse.json({ error: "Nieprawidłowy kod" }, { status: 400 })
  }

  const result = await verifyOtpToken(otpToken, code)
  if (!result) {
    return NextResponse.json({ error: "Nieprawidłowy lub wygasły kod" }, { status: 401 })
  }

  cookieStore.delete("otp_token")
  await createSession(result.email)

  return NextResponse.json({ ok: true, role: result.role })
}
