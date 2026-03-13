import { NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 })

    const user = getUser(email)
    if (!user || user.password !== password) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })

    // Embed name in token so Sidebar can decode it
    const token = Buffer.from(`${email}:${user.name}:${Date.now()}`).toString("base64")
    return NextResponse.json({ token, name: user.name, email: user.email })
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}