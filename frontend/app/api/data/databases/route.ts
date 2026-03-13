import { NextRequest, NextResponse } from "next/server"
import { getUserTables } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? ""
    let userEmail = "guest"
    try { userEmail = Buffer.from(token, "base64").toString().split(":")[0] } catch (_) {}
    const tables = getUserTables(userEmail)
    return NextResponse.json({ tables })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}