import { NextRequest, NextResponse } from "next/server"
import { getUser, createUser } from "@/lib/db"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")

  if (!code) return NextResponse.redirect(new URL("/login?error=no_code", req.url))

  try {
    // Exchange code for access token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/github`,
      }),
    })

    const tokens = await tokenRes.json()
    if (!tokens.access_token) throw new Error("No access token from GitHub")

    // Get user profile
    const userRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${tokens.access_token}`, Accept: "application/vnd.github+json" },
    })
    const profile = await userRes.json()

    // Get primary email if not public
    let email = profile.email
    if (!email) {
      const emailRes = await fetch("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${tokens.access_token}`, Accept: "application/vnd.github+json" },
      })
      const emails = await emailRes.json()
      email = emails.find((e: any) => e.primary)?.email ?? emails[0]?.email
    }

    if (!email) throw new Error("Could not get email from GitHub")

    const name = profile.name ?? profile.login ?? email.split("@")[0]

    // Create user if doesn't exist
    let user = getUser(email)
    if (!user) {
      try { createUser(name, email, `github_oauth_${Date.now()}`) } catch (_) {}
    }

    const token = Buffer.from(`${email}:${name}:${Date.now()}`).toString("base64")

    return NextResponse.redirect(
      new URL(`/auth/complete?token=${encodeURIComponent(token)}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`, req.url)
    )
  } catch (err: any) {
    console.error("GitHub OAuth error:", err)
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(err.message)}`, req.url))
  }
}