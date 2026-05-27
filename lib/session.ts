import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const SESSION_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "fallback-secret-change-in-prod"
)
const OTP_SECRET = new TextEncoder().encode(
  process.env.OTP_SECRET ?? "fallback-otp-secret-change-in-prod"
)

export type Role = "admin" | "funeral-home"

export interface SessionPayload {
  email: string
  role: Role
}

export interface OtpPayload {
  email: string
  code: string
}

function getRole(email: string): Role {
  return email.endsWith("@ememories.pl") ? "admin" : "funeral-home"
}

export async function createOtpToken(email: string, code: string): Promise<string> {
  return new SignJWT({ email, code } satisfies OtpPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("10m")
    .sign(OTP_SECRET)
}

export async function verifyOtpToken(
  token: string,
  inputCode: string
): Promise<{ email: string; role: Role } | null> {
  try {
    const { payload } = await jwtVerify(token, OTP_SECRET)
    const { email, code } = payload as unknown as OtpPayload
    if (code !== inputCode) return null
    return { email, role: getRole(email) }
  } catch {
    return null
  }
}

export async function createSession(email: string): Promise<void> {
  const role = getRole(email)
  const token = await new SignJWT({ email, role } satisfies SessionPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SESSION_SECRET)

  const cookieStore = await cookies()
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, SESSION_SECRET)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}
