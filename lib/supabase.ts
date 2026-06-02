import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const secretKey = process.env.SUPABASE_SECRET_KEY!
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

// Server-side client with secret key — bypasses RLS, use only in API routes/server components
export function createServerClient() {
  return createClient(url, secretKey)
}

// Client-side client with publishable key
export function createBrowserClient() {
  return createClient(url, publishableKey)
}
