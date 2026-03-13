import { NextRequest, NextResponse } from "next/server"
import { saveTable } from "@/lib/db"

function parseCSV(text: string) {
  const lines = text.trim().split("\n").map((l) => l.trim()).filter(Boolean)
  if (lines.length < 2) throw new Error("CSV must have headers and at least one row")
  const headers = lines[0].split(",").map((h) => h.trim().replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase())
  const rows = lines.slice(1).map((line) => {
    const vals = line.split(",").map((v) => v.trim())
    const row: Record<string, any> = {}
    headers.forEach((h, i) => { row[h] = vals[i] ?? "" })
    return row
  })
  return { headers, rows }
}

function toTableName(filename: string) {
  return filename.replace(/\.csv$/i, "").replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? ""

    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 })

    let userEmail = "guest"
    try { userEmail = Buffer.from(token, "base64").toString().split(":")[0] } catch (_) {}

    const text = await file.text()
    const { headers, rows } = parseCSV(text)
    const tableName = toTableName(file.name)

    saveTable(userEmail, tableName, file.name, headers, rows)

    return NextResponse.json({ success: true, tableName, columns: headers, rowCount: rows.length })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Upload failed" }, { status: 500 })
  }
}