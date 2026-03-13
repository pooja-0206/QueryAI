import { NextRequest, NextResponse } from "next/server"
import { getTables, deleteTable } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? ""
    let userEmail = "guest"
    try { userEmail = Buffer.from(token, "base64").toString().split(":")[0] } catch (_) {}

    const tables = getTables(userEmail)
    return NextResponse.json({ tables })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to fetch tables" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? ""
    let userEmail = "guest"
    try { userEmail = Buffer.from(token, "base64").toString().split(":")[0] } catch (_) {}

    const { name } = await req.json()
    if (!name) return NextResponse.json({ error: "Missing table name" }, { status: 400 })

    deleteTable(userEmail, name)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Delete failed" }, { status: 500 })
  }
}