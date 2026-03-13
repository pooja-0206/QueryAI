import { NextRequest, NextResponse } from "next/server"
import { getUser, createUser } from "@/lib/db"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")

  if (!code) return NextResponse.redirect(new URL("/login?error=no_code", req.url))

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`,
        grant_type: "authorization_code",
      }),
    })

    const tokens = await tokenRes.json()
    if (!tokens.access_token) throw new Error("No access token")

    // Get user info
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const profile = await userRes.json()

    const email = profile.email
    const name = profile.name ?? email.split("@")[0]

    // Create user if doesn't exist
    let user = getUser(email)
    if (!user) {
      try { createUser(name, email, `google_oauth_${Date.now()}`) } catch (_) {}
      user = getUser(email)
    }

    // Create token — embed name so frontend can read it
    const token = Buffer.from(`${email}:${name}:${Date.now()}`).toString("base64")

    // Redirect to dashboard with token in URL (frontend stores it)
    return NextResponse.redirect(
      new URL(`/auth/complete?token=${encodeURIComponent(token)}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`, req.url)
    )
  } catch (err: any) {
    console.error("Google OAuth error:", err)
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(err.message)}`, req.url))
  }
}