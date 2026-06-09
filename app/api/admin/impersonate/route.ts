import { NextResponse } from "next/server"
import { getSession, createSession } from "@/lib/session"
import { SignJWT } from "jose"
import { cookies } from "next/headers"

const SESSION_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "fallback-secret-change-in-prod"
)

export async function POST(req: Request) {
  const session = await getSession()
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 })

  // Save admin session token as return cookie
  const cookieStore = await cookies()
  const currentToken = cookieStore.get("session")?.value
  if (currentToken) {
    cookieStore.set("admin_return_session", currentToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 4,
      path: "/",
    })
  }

  await createSession(email)
  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const cookieStore = await cookies()
  const adminToken = cookieStore.get("admin_return_session")?.value
  if (!adminToken) return NextResponse.json({ error: "No admin session" }, { status: 400 })

  cookieStore.set("session", adminToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })
  cookieStore.delete("admin_return_session")
  return NextResponse.json({ ok: true })
}
