"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BrainCircuit, TrendingUp, TrendingDown, AlertTriangle, Users,
  BarChart3, Sparkles, RefreshCw, ChevronDown, Activity,
  ArrowUpRight, ArrowDownRight, Minus, Database
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

function getToken() {
  if (typeof window === "undefined") return ""
  return localStorage.getItem("token") ?? ""
}

interface PredictionResult {
  meta: { tableName: string; totalRows: number; numericColumn: string; categoryColumn: string; customerColumn: string }
  summary: { total: number; avg: number; max: number; min: number; trendDirection: string; growthRate: number }
  forecast: { historical: { period: string; value: number }[]; predictions: { period: string; predicted: number; confidence: number }[] }
  categoryInsights: { category: string; total: number; avg: number; count: number; trend: string }[]
  anomalies: { value: number; label: string; zScore: number }[]
  customerBehavior: { topCustomers: { name: string; total: number; avg: number; count: number }[]; segments: { label: string; count: number; color: string }[] }
}

interface UploadedTable { tableName: string; fileName: string; columns: string[] }

const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } }

function StatCard({ label, value, sub, trend }: { label: string; value: string; sub?: string; trend?: "up" | "down" | "flat" }) {
  return (
    <motion.div {...fadeUp} className="p-5 rounded-2xl bg-card/80 border border-border/40 backdrop-blur-sm">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {sub && (
        <p className={`text-sm mt-1 flex items-center gap-1 ${trend === "up" ? "text-emerald-500" : trend === "down" ? "text-rose-500" : "text-muted-foreground"}`}>
          {trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : trend === "down" ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
          {sub}
        </p>
      )}
    </motion.div>
  )
}

// Mini bar chart using SVG
function MiniBar({ values, color = "#8b5cf6" }: { values: number[]; color?: string }) {
  const max = Math.max(...values, 1)
  const w = 100 / values.length
  return (
    <svg viewBox={`0 0 100 40`} className="w-full h-16" preserveAspectRatio="none">
      {values.map((v, i) => (
        <rect key={i} x={i * w + 0.5} y={40 - (v / max) * 38} width={w - 1} height={(v / max) * 38}
          fill={color} opacity={0.7 + (i / values.length) * 0.3} rx="1" />
      ))}
    </svg>
  )
}

// Sparkline SVG
function Sparkline({ values, color = "#8b5cf6" }: { values: number[]; color?: string }) {
  if (values.length < 2) return null
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = max - min || 1
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${40 - ((v - min) / range) * 38}`).join(" ")
  return (
    <svg viewBox="0 0 100 40" className="w-full h-12" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function PredictionsPage() {
  const [tables, setTables] = useState<UploadedTable[]>([])
  const [selectedTable, setSelectedTable] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  // Load tables from localStorage (same source as upload page)
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("uploadedTables") ?? "[]")
    const seen = new Set()
    const unique = saved.filter((t: UploadedTable) => {
      if (seen.has(t.tableName)) return false
      seen.add(t.tableName)
      return true
    })
    setTables(unique)
    if (unique.length > 0) setSelectedTable(unique[0].tableName)
  }, [])

  const runPredictions = async () => {
    if (!selectedTable) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch("/api/ml/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ tableName: selectedTable }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Prediction failed")
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const trendIcon = result?.summary.trendDirection === "upward"
    ? <TrendingUp className="w-4 h-4 text-emerald-500" />
    : result?.summary.trendDirection === "downward"
    ? <TrendingDown className="w-4 h-4 text-rose-500" />
    : <Minus className="w-4 h-4 text-muted-foreground" />

  return (
    <div className="p-6 lg:p-8 space-y-8 min-h-screen">
      {/* Header */}
      <motion.div {...fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <BrainCircuit className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">ML Predictions</h1>
            <p className="text-muted-foreground">AI-powered forecasting & insights from your data</p>
          </div>
        </div>

        {/* Table selector + Run button */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border/50 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors min-w-[200px] justify-between"
            >
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-muted-foreground" />
                {selectedTable || "Select dataset"}
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute top-full mt-2 left-0 right-0 bg-card border border-border/50 rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  {tables.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-4">No datasets uploaded yet</p>
                  ) : (
                    tables.map((t) => (
                      <button
                        key={t.tableName}
                        onClick={() => { setSelectedTable(t.tableName); setShowDropdown(false) }}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors ${selectedTable === t.tableName ? "text-primary font-medium bg-primary/5" : "text-foreground"}`}
                      >
                        {t.fileName ?? t.tableName}
                      </button>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button
            onClick={runPredictions}
            disabled={loading || !selectedTable}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "Analyzing..." : "Run Predictions"}
          </Button>
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div {...fadeUp} className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </motion.div>
      )}

      {/* Empty state */}
      {!result && !loading && !error && (
        <motion.div {...fadeUp}>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                <BrainCircuit className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="font-semibold text-foreground text-lg">Ready to analyze your data</p>
              <p className="text-muted-foreground text-sm max-w-md">
                Select a dataset and click "Run Predictions" to get sales forecasts, category insights, anomaly detection, and customer behavior analysis.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 rounded-2xl bg-muted/40 animate-pulse" />)}
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-8">
          {/* Meta banner */}
          <motion.div {...fadeUp} className="flex flex-wrap gap-3 p-4 rounded-xl bg-muted/30 border border-border/30 text-sm text-muted-foreground">
            <span>📊 <strong className="text-foreground">{result.meta.totalRows.toLocaleString()}</strong> rows</span>
            <span>·</span>
            <span>💰 Numeric: <strong className="text-foreground">{result.meta.numericColumn}</strong></span>
            <span>·</span>
            <span>🏷️ Category: <strong className="text-foreground">{result.meta.categoryColumn}</strong></span>
            <span>·</span>
            <span>👤 Customer: <strong className="text-foreground">{result.meta.customerColumn}</strong></span>
          </motion.div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total" value={result.summary.total.toLocaleString()} />
            <StatCard label="Average" value={result.summary.avg.toLocaleString()} />
            <StatCard label="Peak" value={result.summary.max.toLocaleString()} />
            <StatCard
              label="Growth Rate"
              value={`${result.summary.growthRate > 0 ? "+" : ""}${result.summary.growthRate}%`}
              sub={result.summary.trendDirection}
              trend={result.summary.trendDirection === "upward" ? "up" : result.summary.trendDirection === "downward" ? "down" : "flat"}
            />
          </div>

          {/* Forecast + Historical */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Historical trend */}
            <motion.div {...fadeUp}>
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Activity className="w-5 h-5 text-violet-500" />
                    Historical Trend
                  </CardTitle>
                  <CardDescription>Sampled values across your dataset</CardDescription>
                </CardHeader>
                <CardContent>
                  <Sparkline values={result.forecast.historical.map(h => h.value)} color="#8b5cf6" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>{result.forecast.historical[0]?.period}</span>
                    <span>{result.forecast.historical[result.forecast.historical.length - 1]?.period}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Forecast */}
            <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    Sales Forecast
                  </CardTitle>
                  <CardDescription>Next 6 periods via linear regression</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.forecast.predictions.map((p, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-16 shrink-0">{p.period}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${p.confidence}%` }}
                          transition={{ delay: i * 0.08, duration: 0.5 }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                        />
                      </div>
                      <span className="text-sm font-semibold text-foreground w-24 text-right">{p.predicted.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground w-12">{p.confidence}%</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Category Insights */}
          <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="w-5 h-5 text-amber-500" />
                  Category / Segment Insights
                </CardTitle>
                <CardDescription>Top segments by total {result.meta.numericColumn}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.categoryInsights.map((cat, i) => {
                    const maxTotal = result.categoryInsights[0]?.total || 1
                    const pct = (cat.total / maxTotal) * 100
                    return (
                      <div key={i} className="flex items-center gap-4">
                        <span className="text-sm text-foreground w-36 truncate shrink-0">{cat.category}</span>
                        <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ delay: i * 0.05, duration: 0.5 }}
                            className="h-full rounded-full"
                            style={{ background: `hsl(${40 + i * 22}, 80%, 55%)` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-foreground w-24 text-right">{cat.total.toLocaleString()}</span>
                        <span className={`text-xs w-6 ${cat.trend === "up" ? "text-emerald-500" : "text-rose-500"}`}>
                          {cat.trend === "up" ? "↑" : "↓"}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Anomalies + Customer Behavior */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Anomalies */}
            <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                    Anomaly Detection
                  </CardTitle>
                  <CardDescription>Outliers by Z-score (threshold 2.5σ)</CardDescription>
                </CardHeader>
                <CardContent>
                  {result.anomalies.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No significant anomalies detected 🎉</p>
                  ) : (
                    <div className="space-y-3">
                      {result.anomalies.map((a, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-rose-500/5 border border-rose-500/20">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{a.label}</p>
                            <p className="text-xs text-muted-foreground">Z-score: {a.zScore.toFixed(2)}</p>
                          </div>
                          <span className="text-sm font-bold text-rose-500 ml-3 shrink-0">{a.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Customer Behavior */}
            <motion.div {...fadeUp} transition={{ delay: 0.25 }}>
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="w-5 h-5 text-cyan-500" />
                    Customer Behavior
                  </CardTitle>
                  <CardDescription>Top customers & value segments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Segments */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {result.customerBehavior.segments.map((s, i) => (
                      <div key={i} className={`p-3 rounded-xl text-center bg-${s.color}-500/10 border border-${s.color}-500/20`}>
                        <p className="text-lg font-bold text-foreground">{s.count}</p>
                        <p className="text-xs text-muted-foreground leading-tight">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  {/* Top customers */}
                  <div className="space-y-2">
                    {result.customerBehavior.topCustomers.slice(0, 5).map((c, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-foreground truncate max-w-[140px]">{c.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">{c.count} orders</span>
                          <span className="font-semibold text-foreground">{c.total.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  )
}