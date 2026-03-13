import { NextRequest, NextResponse } from "next/server"
import { getTables, getUserTables } from "@/lib/db"
import fs from "fs"
import path from "path"

const DB_PATH = path.join(process.cwd(), ".data", "queryflow.db.json")

function loadStore() {
  try {
    if (fs.existsSync(DB_PATH)) return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"))
  } catch (_) {}
  return { users: [], uploaded_tables: [], tables: {} }
}

// ── Simple Linear Regression ──────────────────────────────────────────────────
function linearRegression(xs: number[], ys: number[]) {
  const n = xs.length
  const sumX = xs.reduce((a, b) => a + b, 0)
  const sumY = ys.reduce((a, b) => a + b, 0)
  const sumXY = xs.reduce((a, b, i) => a + b * ys[i], 0)
  const sumX2 = xs.reduce((a, b) => a + b * b, 0)
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  return { slope, intercept }
}

// ── Moving Average ─────────────────────────────────────────────────────────────
function movingAverage(values: number[], window: number) {
  return values.map((_, i) => {
    if (i < window - 1) return null
    const slice = values.slice(i - window + 1, i + 1)
    return slice.reduce((a, b) => a + b, 0) / window
  }).filter((v): v is number => v !== null)
}

// ── Z-score anomaly detection ──────────────────────────────────────────────────
function detectAnomalies(values: number[], labels: string[], threshold = 2.5) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length)
  return values
    .map((v, i) => ({ value: v, label: labels[i], zScore: Math.abs((v - mean) / (std || 1)) }))
    .filter((r) => r.zScore > threshold)
    .sort((a, b) => b.zScore - a.zScore)
    .slice(0, 10)
}

// ── Category breakdown ─────────────────────────────────────────────────────────
function categoryInsights(rows: Record<string, any>[], catCol: string, valCol: string) {
  const map: Record<string, number[]> = {}
  for (const row of rows) {
    const cat = String(row[catCol] ?? "Unknown")
    const val = parseFloat(row[valCol])
    if (!isNaN(val)) {
      if (!map[cat]) map[cat] = []
      map[cat].push(val)
    }
  }
  return Object.entries(map).map(([cat, vals]) => ({
    category: cat,
    total: Math.round(vals.reduce((a, b) => a + b, 0) * 100) / 100,
    avg: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100,
    count: vals.length,
    trend: vals[vals.length - 1] > vals[0] ? "up" : "down",
  })).sort((a, b) => b.total - a.total).slice(0, 10)
}

// ── Customer segments ──────────────────────────────────────────────────────────
function customerBehavior(rows: Record<string, any>[], custCol: string, valCol: string) {
  const map: Record<string, number[]> = {}
  for (const row of rows) {
    const cust = String(row[custCol] ?? "Unknown")
    const val = parseFloat(row[valCol])
    if (!isNaN(val)) {
      if (!map[cust]) map[cust] = []
      map[cust].push(val)
    }
  }
  const customers = Object.entries(map).map(([name, vals]) => ({
    name,
    total: vals.reduce((a, b) => a + b, 0),
    count: vals.length,
    avg: vals.reduce((a, b) => a + b, 0) / vals.length,
  })).sort((a, b) => b.total - a.total)

  const totalRevenue = customers.reduce((a, b) => a + b.total, 0)
  let cumulative = 0
  const segments = { high: 0, mid: 0, low: 0 }
  for (const c of customers) {
    cumulative += c.total
    const pct = cumulative / totalRevenue
    if (pct <= 0.2) segments.high++
    else if (pct <= 0.5) segments.mid++
    else segments.low++
  }

  return {
    topCustomers: customers.slice(0, 8).map(c => ({
      ...c,
      total: Math.round(c.total * 100) / 100,
      avg: Math.round(c.avg * 100) / 100,
    })),
    segments: [
      { label: "High Value (Top 20%)", count: segments.high, color: "emerald" },
      { label: "Mid Value", count: segments.mid, color: "amber" },
      { label: "Low Value", count: segments.low, color: "rose" },
    ],
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? ""
    let userEmail = "guest"
    try { userEmail = Buffer.from(token, "base64").toString().split(":")[0] } catch (_) {}

    const { tableName } = await req.json()
    if (!tableName) return NextResponse.json({ error: "tableName required" }, { status: 400 })

    const store = loadStore()
    const rows: Record<string, any>[] = store.tables[tableName]
    if (!rows || rows.length === 0) return NextResponse.json({ error: "Table not found or empty" }, { status: 404 })

    const columns = Object.keys(rows[0])

    // Auto-detect numeric column (sales / revenue / amount / price / value)
    const numericKeywords = ["sales", "revenue", "amount", "price", "value", "profit", "cost", "total"]
    const numCol = columns.find(c => numericKeywords.some(k => c.toLowerCase().includes(k)))
      ?? columns.find(c => rows.slice(0, 20).filter(r => !isNaN(parseFloat(r[c]))).length > 15)
      ?? columns[columns.length - 1]

    // Auto-detect date column
    const dateCol = columns.find(c => c.toLowerCase().includes("date") || c.toLowerCase().includes("time"))

    // Auto-detect category column
    const catKeywords = ["category", "segment", "type", "region", "state", "product", "sub_category", "ship_mode"]
    const catCol = columns.find(c => catKeywords.some(k => c.toLowerCase().includes(k))) ?? columns[1]

    // Auto-detect customer column
    const custKeywords = ["customer", "client", "name", "user"]
    const custCol = columns.find(c => custKeywords.some(k => c.toLowerCase().includes(k))) ?? columns[2]

    // Extract numeric values
    const numericValues = rows.map(r => parseFloat(r[numCol])).filter(v => !isNaN(v))
    const xs = numericValues.map((_, i) => i)

    // ── 1. Sales Forecast (linear regression, predict next 6 periods) ──────────
    const { slope, intercept } = linearRegression(xs, numericValues)
    const lastIdx = numericValues.length
    const forecast = Array.from({ length: 6 }, (_, i) => ({
      period: `Period +${i + 1}`,
      predicted: Math.max(0, Math.round((slope * (lastIdx + i) + intercept) * 100) / 100),
      confidence: Math.max(60, Math.round(85 - i * 3)),
    }))

    // Historical trend (sample every N rows to keep response lean)
    const step = Math.max(1, Math.floor(numericValues.length / 30))
    const historical = numericValues
      .filter((_, i) => i % step === 0)
      .map((v, i) => ({
        period: dateCol ? String(rows[i * step]?.[dateCol] ?? `#${i + 1}`) : `#${i + 1}`,
        value: Math.round(v * 100) / 100,
      }))

    const maValues = movingAverage(numericValues, Math.min(7, Math.floor(numericValues.length / 5)))
    const trendDirection = slope > 0 ? "upward" : slope < 0 ? "downward" : "flat"
    const growthRate = numericValues.length > 1
      ? ((numericValues[numericValues.length - 1] - numericValues[0]) / (numericValues[0] || 1)) * 100
      : 0

    // ── 2. Category / Segment Insights ────────────────────────────────────────
    const catData = categoryInsights(rows, catCol, numCol)

    // ── 3. Anomaly Detection ──────────────────────────────────────────────────
    const labels = rows.map((r, i) => String(r[catCol] ?? r[custCol] ?? `Row ${i + 1}`))
    const anomalies = detectAnomalies(numericValues, labels)

    // ── 4. Customer Behavior ──────────────────────────────────────────────────
    const custData = customerBehavior(rows, custCol, numCol)

    // ── Summary stats ─────────────────────────────────────────────────────────
    const total = numericValues.reduce((a, b) => a + b, 0)
    const avg = total / numericValues.length
    const max = Math.max(...numericValues)
    const min = Math.min(...numericValues)

    return NextResponse.json({
      meta: {
        tableName,
        totalRows: rows.length,
        numericColumn: numCol,
        dateColumn: dateCol ?? null,
        categoryColumn: catCol,
        customerColumn: custCol,
      },
      summary: {
        total: Math.round(total * 100) / 100,
        avg: Math.round(avg * 100) / 100,
        max: Math.round(max * 100) / 100,
        min: Math.round(min * 100) / 100,
        trendDirection,
        growthRate: Math.round(growthRate * 10) / 10,
      },
      forecast: { historical, predictions: forecast, slope: Math.round(slope * 1000) / 1000 },
      categoryInsights: catData,
      anomalies,
      customerBehavior: custData,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Prediction failed" }, { status: 500 })
  }
}