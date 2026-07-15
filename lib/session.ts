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

async function getRole(email: string): Promise<Role> {
  try {
    const { createServerClient } = await import("@/lib/supabase")
    const supabase = createServerClient()
    const { data } = await supabase
      .from("admin_emails")
      .select("email")
      .eq("email", email)
      .single()
    if (data) return "admin"
  } catch {}
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
    return { email, role: await getRole(email) }
  } catch {
    return null
  }
}

// Sessions expire at the end of the calendar day (23:59:59) in this timezone,
// so everyone is signed out at day's end instead of carrying a rolling session.
const APP_TIME_ZONE = "Europe/Warsaw"

/** Offset in ms of `timeZone` from UTC at the given instant (positive = ahead of UTC). */
function timeZoneOffsetMs(at: Date, timeZone: string): number {
  const inTz = new Date(at.toLocaleString("en-US", { timeZone }))
  const inUtc = new Date(at.toLocaleString("en-US", { timeZone: "UTC" }))
  return inTz.getTime() - inUtc.getTime()
}

/** Epoch seconds for 23:59:59 of `now`'s calendar day in the app timezone. */
function endOfDayExpirySeconds(now: Date): number {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now)
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value)
  // UTC instant whose wall-clock reading in the app timezone is Y-M-D 23:59:59.
  const naiveUtc = Date.UTC(get("year"), get("month") - 1, get("day"), 23, 59, 59)
  const offsetMs = timeZoneOffsetMs(new Date(naiveUtc), APP_TIME_ZONE)
  return Math.floor((naiveUtc - offsetMs) / 1000)
}

/** Instant at which a session created `now` should expire (this day's 23:59:59). */
function sessionExpirySeconds(now: Date = new Date()): number {
  const nowSec = Math.floor(now.getTime() / 1000)
  let expiresAt = endOfDayExpirySeconds(now)
  // If we're in the final minute of the day, carry to the next day's end so a
  // fresh login isn't immediately expired (which would loop the user back to login).
  if (expiresAt <= nowSec + 60) {
    expiresAt = endOfDayExpirySeconds(new Date(now.getTime() + 24 * 60 * 60 * 1000))
  }
  return expiresAt
}

export async function createSession(email: string): Promise<void> {
  const role = await getRole(email)
  const expiresAt = sessionExpirySeconds()
  const token = await new SignJWT({ email, role } satisfies SessionPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresAt)
    .sign(SESSION_SECRET)

  const cookieStore = await cookies()
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(expiresAt * 1000),
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
