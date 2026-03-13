"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Mic, MicOff, Send, Code2, Table2, BarChart3, Lightbulb, Loader2, 
  Sparkles, RefreshCw, Copy, Check, Download, Share2, Wand2, 
  TrendingUp, Zap, ChevronRight
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
} from "recharts"

interface QueryResult {
  query: string
  sql: string
  data: Array<Record<string, string | number>>
  chartType: "bar" | "pie" | "line" | "area"
  insight: string
}

const mockQueries: Record<string, QueryResult> = {
  default: {
    query: "Show total sales by region",
    sql: `SELECT region, SUM(sales) as total_sales\nFROM orders\nGROUP BY region\nORDER BY total_sales DESC;`,
    data: [
      { name: "North", value: 45000 },
      { name: "South", value: 32000 },
      { name: "East", value: 28000 },
      { name: "West", value: 25000 },
    ],
    chartType: "bar",
    insight: "North region leads with $45,000 in sales, contributing 35% of total revenue. Consider expanding marketing efforts in the West region which shows growth potential.",
  },
  monthly: {
    query: "Show monthly sales trends",
    sql: `SELECT DATE_TRUNC('month', date) as month, SUM(sales) as total\nFROM orders\nGROUP BY month\nORDER BY month;`,
    data: [
      { name: "Jan", value: 12000 },
      { name: "Feb", value: 19000 },
      { name: "Mar", value: 15000 },
      { name: "Apr", value: 25000 },
      { name: "May", value: 22000 },
      { name: "Jun", value: 30000 },
    ],
    chartType: "area",
    insight: "Sales show a positive trend with 150% growth from January to June. The spike in April correlates with your spring promotion campaign.",
  },
  products: {
    query: "Top products by profit",
    sql: `SELECT product_name, SUM(profit) as total_profit\nFROM orders\nGROUP BY product_name\nORDER BY total_profit DESC\nLIMIT 5;`,
    data: [
      { name: "Product A", value: 15000 },
      { name: "Product B", value: 12000 },
      { name: "Product C", value: 9000 },
      { name: "Product D", value: 7500 },
      { name: "Product E", value: 5500 },
    ],
    chartType: "pie",
    insight: "Product A is your top performer with $15,000 profit, representing 30% of total profits. Consider bundling Product D and E to boost their sales.",
  },
}

const exampleQueries = [
  { text: "Show total sales by region", icon: BarChart3 },
  { text: "Monthly sales trends", icon: TrendingUp },
  { text: "Top products by profit", icon: Sparkles },
  { text: "Compare Q1 vs Q2 revenue", icon: Zap },
]

const COLORS = ["#8B5CF6", "#06B6D4", "#F43F5E", "#F59E0B", "#10B981"]

const LANGUAGES = [
  { code: "en-US", label: "EN", full: "English" },
  { code: "hi-IN", label: "हि", full: "Hindi" },
  { code: "te-IN", label: "తె", full: "Telugu" },
]

// Animated voice waveform
function VoiceWaveform() {
  return (
    <div className="flex items-center justify-center gap-0.5 h-5">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="w-0.5 bg-white rounded-full"
          animate={{ height: [4, 16, 4] }}
          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
        />
      ))}
    </div>
  )
}

// Interim transcript indicator
function InterimBadge({ text }: { text: string }) {
  if (!text) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className="absolute -bottom-8 left-0 right-0 text-xs text-muted-foreground italic truncate px-1"
    >
      {text}…
    </motion.div>
  )
}

// SQL typing animation
function SQLTypingAnimation({ sql }: { sql: string }) {
  const [displayedText, setDisplayedText] = useState("")
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    setDisplayedText("")
    setIsComplete(false)
    let i = 0
    const interval = setInterval(() => {
      if (i < sql.length) {
        setDisplayedText(sql.slice(0, i + 1))
        i++
      } else {
        setIsComplete(true)
        clearInterval(interval)
      }
    }, 20)
    return () => clearInterval(interval)
  }, [sql])

  return (
    <pre className="p-5 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto">
      <code className="text-sm font-mono">
        {displayedText.split("\n").map((line, i) => (
          <div key={i} className="flex">
            <span className="text-slate-600 select-none w-8">{i + 1}</span>
            <span className="text-emerald-400">{line}</span>
          </div>
        ))}
        {!isComplete && <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-0.5" />}
      </code>
    </pre>
  )
}

export default function QueryPage() {
  const [query, setQuery] = useState("")
  const [lang, setLang] = useState("en-US")
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<QueryResult | null>(null)
  const [copied, setCopied] = useState(false)
  const recognitionRef = useRef<any>(null)
  const shouldListenRef = useRef(false)
  const langRef = useRef("en-US")

  // Keep langRef in sync; restart mic if lang changes while listening
  useEffect(() => {
    langRef.current = lang
    if (shouldListenRef.current && recognitionRef.current) {
      try { recognitionRef.current.abort() } catch (_) {}
    }
  }, [lang])

  const buildAndStart = () => {
    if (typeof window === "undefined") return
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      alert("Speech recognition is not supported in this browser.")
      return
    }

    const recognition = new SR()
    recognition.continuous = false      // MORE reliable in Chrome on localhost
    recognition.interimResults = false  // only final results — fixes silent drop bug
    recognition.lang = langRef.current
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setInterimText("")
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0]?.[0]?.transcript ?? ""
      if (transcript.trim()) {
        setQuery((prev) => prev ? prev + " " + transcript.trim() : transcript.trim())
        setInterimText("")
      }
    }

    recognition.onerror = (e: any) => {
      // "no-speech" = silence timeout, just restart
      // "aborted"   = we called abort(), ignore
      if (e.error !== "no-speech" && e.error !== "aborted") {
        console.warn("Speech error:", e.error)
      }
    }

    recognition.onend = () => {
      // Auto-restart while user hasn't clicked Stop
      if (shouldListenRef.current) {
        setTimeout(() => {
          if (shouldListenRef.current) buildAndStart()
        }, 150)
      } else {
        setIsListening(false)
        setInterimText("")
      }
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
    } catch (_) {}
  }

  const startListening = () => {
    shouldListenRef.current = true
    buildAndStart()
  }

  const stopListening = () => {
    shouldListenRef.current = false
    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch (_) {}
    }
    setIsListening(false)
    setInterimText("")
  }

  const toggleVoice = () => {
    isListening ? stopListening() : startListening()
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    if (isListening) stopListening()

    setIsLoading(true)
    setResult(null)
    await new Promise((r) => setTimeout(r, 2000))

    const lower = query.toLowerCase()
    let mockResult = mockQueries.default
    if (lower.includes("monthly") || lower.includes("trend")) mockResult = mockQueries.monthly
    else if (lower.includes("product") || lower.includes("profit")) mockResult = mockQueries.products

    setResult({ ...mockResult, query })
    setIsLoading(false)
  }

  const copySQL = () => {
    if (result) {
      navigator.clipboard.writeText(result.sql)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const renderChart = () => {
    if (!result) return null
    switch (result.chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={result.data}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#6366F1" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
              <Bar dataKey="value" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie data={result.data} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 }}>
                {result.data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        )
      case "line":
        return (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={result.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
              <Line type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={3}
                dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 6 }} activeDot={{ r: 8, fill: "#8B5CF6" }} />
            </LineChart>
          </ResponsiveContainer>
        )
      case "area":
        return (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={result.data}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
              <Area type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={3} fill="url(#areaGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        )
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 min-h-screen">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/25">
            <Wand2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Query Assistant</h1>
            <p className="text-muted-foreground">Ask questions in natural language or use voice</p>
          </div>
        </div>
      </motion.div>

      {/* Query Input Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm shadow-2xl shadow-primary/10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 pointer-events-none" />
          <CardContent className="p-6 relative">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Input row */}
              <div className="flex items-center gap-3">
                <div className="flex-1 relative group">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask a question about your data..."
                    className="h-16 pl-6 pr-4 text-lg bg-background/50 border-border/50 focus:border-primary/50 rounded-2xl transition-all focus:shadow-lg focus:shadow-primary/10"
                    disabled={isLoading}
                  />
                  {/* Interim text shown below input while speaking */}
                  <AnimatePresence>
                    {isListening && <InterimBadge text={interimText} />}
                  </AnimatePresence>
                </div>

                {/* ── Language + Mic group ── */}
                <div className="flex items-center gap-1 h-16 px-2 rounded-2xl bg-background/50 border border-border/50">
                  {/* Language pills */}
                  <div className="flex gap-1">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        title={l.full}
                        onClick={() => setLang(l.code)}
                        className={`h-8 px-2.5 rounded-lg text-xs font-semibold transition-all ${
                          lang === l.code
                            ? "bg-primary text-white shadow-md shadow-primary/30"
                            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="w-px h-6 bg-border/50 mx-1" />

                  {/* Mic button */}
                  <button
                    type="button"
                    onClick={toggleVoice}
                    title={isListening ? "Stop listening" : `Start voice input (${LANGUAGES.find(l => l.code === lang)?.full})`}
                    className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      isListening
                        ? "bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/40 scale-105"
                        : "bg-gradient-to-br from-primary/10 to-violet-500/10 text-primary hover:from-primary/20 hover:to-violet-500/20"
                    }`}
                  >
                    {isListening ? <VoiceWaveform /> : <Mic className="w-5 h-5" />}
                    {/* Pulse ring when listening */}
                    {isListening && (
                      <motion.span
                        className="absolute inset-0 rounded-xl border-2 border-rose-400"
                        animate={{ scale: [1, 1.4], opacity: [0.8, 0] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      />
                    )}
                  </button>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="h-16 px-8 bg-gradient-to-r from-primary via-violet-500 to-primary bg-[length:200%_100%] hover:bg-[position:100%_0] text-white shadow-xl shadow-primary/25 transition-all duration-500 rounded-2xl"
                  disabled={isLoading || !query.trim()}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <><Send className="w-5 h-5 mr-2" />Analyze</>
                  )}
                </Button>
              </div>

              {/* Example queries */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground mr-2">Try:</span>
                {exampleQueries.map((q, i) => (
                  <motion.button
                    key={i}
                    type="button"
                    onClick={() => setQuery(q.text)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl transition-all border border-transparent hover:border-border/50"
                  >
                    <q.icon className="w-4 h-4" />
                    {q.text}
                  </motion.button>
                ))}
              </div>

              {/* Listening banner */}
              <AnimatePresence>
                {isListening && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-rose-500/10 border border-rose-500/20"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="w-3 h-3 rounded-full bg-rose-500 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-foreground font-medium">
                        Listening in {LANGUAGES.find((l) => l.code === lang)?.full}…
                      </span>
                      {interimText && (
                        <p className="text-sm text-muted-foreground italic truncate mt-0.5">{interimText}</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={stopListening}
                      className="text-rose-500 hover:text-rose-600 shrink-0"
                    >
                      <MicOff className="w-4 h-4 mr-1" />
                      Stop
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div key="loading" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/30 to-violet-500/30 blur-2xl animate-pulse" />
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center shadow-xl shadow-primary/30">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                  <Sparkles className="w-10 h-10 text-white" />
                </motion.div>
              </div>
            </div>
            <p className="text-xl font-semibold text-foreground mt-6 mb-2">Analyzing your question...</p>
            <p className="text-muted-foreground">Generating SQL and fetching results</p>
            <div className="flex gap-1 mt-4">
              {[...Array(3)].map((_, i) => (
                <motion.div key={i} className="w-2 h-2 rounded-full bg-primary"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
              ))}
            </div>
          </motion.div>
        )}

        {result && !isLoading && (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Query card */}
            <Card className="border-border/50 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Your Question</p>
                    <p className="text-lg font-semibold text-foreground">{result.query}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SQL card */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-emerald-500" />
                  Generated SQL
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={copySQL} className="gap-1">
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </CardHeader>
              <CardContent className="pt-0">
                <SQLTypingAnimation sql={result.sql} />
              </CardContent>
            </Card>

            {/* Results grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Table2 className="w-5 h-5 text-cyan-500" />
                    Results Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-xl border border-border/50 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-5 py-4 text-left text-sm font-semibold text-foreground">Name</th>
                          <th className="px-5 py-4 text-right text-sm font-semibold text-foreground">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.data.map((row, i) => (
                          <motion.tr key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="border-t border-border/30 hover:bg-muted/30 transition-colors">
                            <td className="px-5 py-4 text-sm text-foreground font-medium">{row.name}</td>
                            <td className="px-5 py-4 text-sm text-foreground text-right font-semibold">
                              ${typeof row.value === "number" ? row.value.toLocaleString() : row.value}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-violet-500" />
                    Visualization
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="gap-1"><Download className="w-4 h-4" />Export</Button>
                    <Button variant="ghost" size="sm" className="gap-1"><Share2 className="w-4 h-4" />Share</Button>
                  </div>
                </CardHeader>
                <CardContent>{renderChart()}</CardContent>
              </Card>
            </div>

            {/* AI Insight */}
            <Card className="relative overflow-hidden border-border/50 bg-gradient-to-r from-amber-500/5 via-card to-orange-500/5">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-3xl" />
              <CardHeader className="pb-3 relative">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-white" />
                  </div>
                  AI Insight
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-foreground leading-relaxed text-lg">{result.insight}</p>
                <div className="flex items-center gap-3 mt-4">
                  <Button variant="outline" size="sm" className="gap-1">
                    <ChevronRight className="w-4 h-4" />
                    Explore Further
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center pt-4">
              <Button variant="outline" size="lg" onClick={() => { setQuery(""); setResult(null) }} className="gap-2 rounded-xl">
                <RefreshCw className="w-5 h-5" />
                Ask Another Question
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!result && !isLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center py-20">
          <div className="relative inline-block">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-violet-500/20 blur-2xl" />
            <div className="relative w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-muted via-muted to-accent/30 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-foreground mt-8 mb-3">Ready to analyze your data</h3>
          <p className="text-muted-foreground max-w-md mx-auto text-lg">
            Type a question above or click the microphone to start querying your datasets with natural language.
          </p>
        </motion.div>
      )}
    </div>
  )
}