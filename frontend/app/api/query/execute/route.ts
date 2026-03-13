import { NextRequest, NextResponse } from "next/server"
import { queryTable } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const { sql } = await req.json()
    if (!sql?.trim()) return NextResponse.json({ error: "No SQL provided" }, { status: 400 })

    const upper = sql.trim().toUpperCase()
    if (!upper.startsWith("SELECT") && !upper.startsWith("WITH")) {
      return NextResponse.json({ error: "Only SELECT queries are allowed" }, { status: 400 })
    }

    const data = queryTable(sql)
    return NextResponse.json({ success: true, data, rowCount: data.length })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Query failed" }, { status: 500 })
  }
}