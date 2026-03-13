import { NextRequest, NextResponse } from "next/server"
import { createUser } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()
    if (!name || !email || !password) return NextResponse.json({ error: "All fields required" }, { status: 400 })

    createUser(name, email, password)
    const token = Buffer.from(`${email}:${Date.now()}`).toString("base64")
    return NextResponse.json({ token, name, email })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 })
  }
}