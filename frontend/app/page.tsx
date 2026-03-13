"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  Database, Mic, BarChart3, Sparkles, ArrowRight, ChevronRight, 
  Upload, MessageSquare, PieChart, Lightbulb, Zap, Shield, Globe,
  Play, Star, TrendingUp, Users, Code2, Layers, Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const exampleQueries = [
  "Show monthly sales trends",
  "Compare revenue by region", 
  "Which product has highest profit?",
  "Top 10 customers by purchase",
]

const features = [
  {
    icon: Mic,
    title: "Voice Queries",
    description: "Speak naturally and let AI understand your business questions instantly",
    gradient: "from-rose-400/20 via-pink-400/20 to-fuchsia-400/20",
    iconBg: "from-rose-400 to-pink-500",
  },
  {
    icon: Database,
    title: "Smart SQL Generation",
    description: "No coding required - plain English to powerful SQL queries automatically",
    gradient: "from-violet-400/20 via-purple-400/20 to-indigo-400/20",
    iconBg: "from-violet-400 to-purple-500",
  },
  {
    icon: BarChart3,
    title: "Instant Visualizations",
    description: "Beautiful auto-generated charts that make your data come alive",
    gradient: "from-cyan-400/20 via-teal-400/20 to-emerald-400/20",
    iconBg: "from-cyan-400 to-teal-500",
  },
  {
    icon: Sparkles,
    title: "AI Insights",
    description: "Intelligent analysis and recommendations to drive better decisions",
    gradient: "from-amber-400/20 via-orange-400/20 to-yellow-400/20",
    iconBg: "from-amber-400 to-orange-500",
  },
]

const stats = [
  { value: "10x", label: "Faster Analysis", icon: Zap },
  { value: "99%", label: "Query Accuracy", icon: Shield },
  { value: "50+", label: "Data Sources", icon: Globe },
]

const steps = [
  { icon: Upload, title: "Upload Data", description: "CSV, Excel, or connect your database", num: "01" },
  { icon: MessageSquare, title: "Ask Questions", description: "Voice or text in natural language", num: "02" },
  { icon: Code2, title: "AI Generates SQL", description: "Smart query building in seconds", num: "03" },
  { icon: PieChart, title: "Get Insights", description: "Charts, tables & AI explanations", num: "04" },
]

function FloatingNodes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-primary/30"
          initial={{ 
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * 600,
            scale: Math.random() * 0.5 + 0.5,
            opacity: 0.3
          }}
          animate={{ 
            y: [null, Math.random() * 600],
            x: [null, Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000)],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: Math.random() * 20 + 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

function SQLAnimation() {
  const [currentLine, setCurrentLine] = useState(0)
  const sqlLines = [
    "SELECT product_name, SUM(revenue)",
    "FROM sales_data",
    "WHERE date >= '2024-01-01'",
    "GROUP BY product_name",
    "ORDER BY SUM(revenue) DESC",
    "LIMIT 10;"
  ]
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLine(prev => (prev + 1) % sqlLines.length)
    }, 800)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="font-mono text-xs sm:text-sm space-y-1">
      {sqlLines.map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: i <= currentLine ? 1 : 0.3 }}
          className={`${i <= currentLine ? 'text-primary' : 'text-muted-foreground/50'} transition-colors`}
        >
          <span className="text-muted-foreground/40 mr-3">{i + 1}</span>
          {line}
        </motion.div>
      ))}
    </div>
  )
}

function ChartAnimation() {
  return (
    <div className="flex items-end gap-2 h-24">
      {[65, 85, 45, 90, 70, 55, 80].map((height, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-t-md bg-gradient-to-t from-primary/60 to-primary/20"
          initial={{ height: 0 }}
          animate={{ height: `${height}%` }}
          transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
        />
      ))}
    </div>
  )
}

export default function LandingPage() {
  // ✅ All state declared at the top of the component
  const [query, setQuery] = useState("")
  const [lang, setLang] = useState("en-US")
  const [activeQueryIndex, setActiveQueryIndex] = useState(0)

  // ✅ startVoiceInput now correctly reads lang from component state
  const startVoiceInput = () => {
    if (typeof window === "undefined") return
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser")
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = lang
    recognition.start()

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript
      setQuery(text)
    }

    recognition.onerror = (event: any) => {
      console.error(event.error)
    }
  }

  // Auto-type effect for placeholder
  useEffect(() => {
    const queries = exampleQueries
    let currentIndex = activeQueryIndex
    let charIndex = 0
    let isDeleting = false
    
    const typeInterval = setInterval(() => {
      if (!isDeleting) {
        setQuery(queries[currentIndex].slice(0, charIndex + 1))
        charIndex++
        if (charIndex === queries[currentIndex].length) {
          setTimeout(() => { isDeleting = true }, 2000)
        }
      } else {
        setQuery(queries[currentIndex].slice(0, charIndex - 1))
        charIndex--
        if (charIndex === 0) {
          isDeleting = false
          currentIndex = (currentIndex + 1) % queries.length
          setActiveQueryIndex(currentIndex)
        }
      }
    }, isDeleting ? 30 : 80)
    
    return () => clearInterval(typeInterval)
  }, [])

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div 
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)" }}
          animate={{ scale: [1.2, 1, 1.2], x: [0, -30, 0], y: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(251,146,60,0.1) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        <FloatingNodes />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-4 mt-4">
          <div className="max-w-7xl mx-auto px-6 py-4 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/50 shadow-lg shadow-primary/5">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary via-violet-500 to-cyan-500 blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-violet-500 to-cyan-500 flex items-center justify-center shadow-lg">
                    <Database className="w-5 h-5 text-white" />
                  </div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  QueryFlow
                </span>
              </Link>
              
              <div className="hidden md:flex items-center gap-8">
                <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
                <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it Works</Link>
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Demo</Link>
              </div>
              
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-primary via-violet-500 to-primary bg-[length:200%_100%] hover:bg-[position:100%_0] text-white shadow-lg shadow-primary/25 transition-all duration-500">
                    Get Started Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 via-violet-500/10 to-cyan-500/10 border border-primary/20 mb-8"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                </motion.div>
                <span className="text-sm font-medium text-foreground/80">AI-Powered Business Intelligence</span>
                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-xs font-semibold text-primary">NEW</span>
              </motion.div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-8 text-balance">
                <span className="text-foreground">Talk to Your</span>
                <br />
                <span className="relative">
                  <span className="bg-gradient-to-r from-primary via-violet-500 to-cyan-500 bg-clip-text text-transparent">
                    Database
                  </span>
                  <motion.svg 
                    className="absolute -bottom-2 left-0 w-full" 
                    viewBox="0 0 300 12" 
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                  >
                    <motion.path 
                      d="M2 8 Q 75 2, 150 8 T 298 6" 
                      stroke="url(#gradient)" 
                      strokeWidth="3" 
                      strokeLinecap="round"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 1, duration: 1.5 }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="var(--primary)" />
                        <stop offset="50%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#06B6D4" />
                      </linearGradient>
                    </defs>
                  </motion.svg>
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed mb-10 max-w-lg text-pretty">
                Ask questions in plain English or use your voice. Get instant SQL queries, beautiful visualizations, and AI-powered insights.
              </p>
              
              {/* Stats */}
              <div className="flex flex-wrap gap-8 mb-10">
                {stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link href="/dashboard">
                  <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-primary via-violet-500 to-primary bg-[length:200%_100%] hover:bg-[position:100%_0] text-white shadow-xl shadow-primary/25 transition-all duration-500 rounded-xl text-lg group">
                    <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Try Live Demo
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="h-14 px-8 rounded-xl text-lg border-border/50 hover:bg-muted/50">
                    Start Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            {/* Right Content - Interactive Demo */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-violet-500/20 to-cyan-500/20 rounded-3xl blur-2xl opacity-50" />
              
              <div className="relative bg-card/80 backdrop-blur-xl rounded-3xl border border-border/50 shadow-2xl shadow-primary/10 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-rose-400/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">QueryFlow AI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-emerald-400"
                    />
                    <span className="text-xs text-muted-foreground">Live</span>
                  </div>
                </div>
                
                {/* Query Input */}
                <div className="p-6 border-b border-border/30">
                  <div className="relative flex items-center gap-2">
                    {/* ✅ Language Dropdown - now correctly uses component-level lang state */}
                    <select
                      value={lang}
                      onChange={(e) => setLang(e.target.value)}
                      className="h-10 px-2 rounded-md border border-border/50 bg-background/50 text-xs text-foreground"
                    >
                      <option value="en-US">English</option>
                      <option value="hi-IN">Hindi</option>
                      <option value="te-IN">Telugu</option>
                    </select>

                    <Input
                      value={query}
                      readOnly
                      className="h-14 flex-1 pl-4 pr-14 text-lg bg-background/50 border-border/50 rounded-xl"
                      placeholder="Ask anything..."
                    />

                    {/* Mic Button */}
                    <motion.button 
                      onClick={startVoiceInput}
                      title="Speak your query"
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-violet-500 flex items-center justify-center"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Mic className="w-5 h-5 text-white"/>
                    </motion.button>
                  </div>
                </div>
                
                {/* SQL Output */}
                <div className="p-6 border-b border-border/30 bg-muted/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Code2 className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Generated SQL</span>
                  </div>
                  <div className="p-4 rounded-xl bg-background/80 border border-border/30">
                    <SQLAnimation />
                  </div>
                </div>
                
                {/* Chart Preview */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Visualization</span>
                  </div>
                  <ChartAnimation />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span>
                    <span>May</span><span>Jun</span><span>Jul</span>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <motion.div
                className="absolute -top-6 -right-6 w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 backdrop-blur-sm border border-emerald-400/30 flex flex-col items-center justify-center"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <TrendingUp className="w-8 h-8 text-emerald-500 mb-1" />
                <span className="text-xs font-semibold text-emerald-600">+24%</span>
              </motion.div>
              
              <motion.div
                className="absolute -bottom-4 -left-4 w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-400/20 to-purple-400/20 backdrop-blur-sm border border-violet-400/30 flex flex-col items-center justify-center"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <Users className="w-6 h-6 text-violet-500 mb-1" />
                <span className="text-xs font-semibold text-violet-600">1.2k</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            >
              <Layers className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground/80">Powerful Features</span>
            </motion.div>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Everything you need to
              <br />
              <span className="bg-gradient-to-r from-primary via-violet-500 to-cyan-500 bg-clip-text text-transparent">
                unlock your data
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to make data analysis accessible to everyone
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative"
              >
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative p-8 rounded-3xl bg-card/60 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
                  <div className="flex items-start gap-6">
                    <div className="relative shrink-0">
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.iconBg} blur-lg opacity-50 group-hover:opacity-75 transition-opacity`} />
                      <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.iconBg} flex items-center justify-center shadow-lg`}>
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-32 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            >
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground/80">Simple Process</span>
            </motion.div>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              From data to insights in
              <br />
              <span className="bg-gradient-to-r from-primary via-violet-500 to-cyan-500 bg-clip-text text-transparent">
                four simple steps
              </span>
            </h2>
          </motion.div>

          <div className="relative">
            <div className="hidden lg:block absolute top-24 left-[10%] right-[10%] h-1 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary via-violet-500 to-cyan-500"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.5 }}
                style={{ transformOrigin: "left" }}
              />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="relative text-center group"
                >
                  <div className="relative mx-auto w-28 h-28 mb-6">
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/30 to-violet-500/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative w-full h-full rounded-3xl bg-card border border-border/50 shadow-lg group-hover:shadow-xl group-hover:shadow-primary/10 transition-all flex items-center justify-center group-hover:-translate-y-2 duration-500">
                      <step.icon className="w-12 h-12 text-primary" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-violet-500 text-white text-sm font-bold flex items-center justify-center shadow-lg">
                      {step.num}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-violet-500/20 to-cyan-500/20 rounded-[40px] blur-3xl" />
            
            <div className="relative p-12 md:p-16 rounded-[32px] bg-gradient-to-br from-card via-card to-muted/50 border border-border/50 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-primary via-violet-500 to-cyan-500 flex items-center justify-center mb-8 shadow-xl shadow-primary/30"
                >
                  <Lightbulb className="w-10 h-10 text-white" />
                </motion.div>
                
                <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                  Ready to unlock your data?
                </h2>
                <p className="text-xl text-muted-foreground max-w-xl mx-auto mb-10">
                  Start asking questions and discover insights you never knew existed in your business data.
                </p>
                
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/dashboard">
                    <Button size="lg" className="h-14 px-10 bg-gradient-to-r from-primary via-violet-500 to-primary bg-[length:200%_100%] hover:bg-[position:100%_0] text-white shadow-xl shadow-primary/30 transition-all duration-500 rounded-xl text-lg">
                      Open Dashboard
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="lg" variant="outline" className="h-14 px-10 rounded-xl text-lg border-border/50 bg-card/50 hover:bg-card">
                      Create Account
                    </Button>
                  </Link>
                </div>
                
                <div className="flex items-center justify-center gap-6 mt-10 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    <span className="text-sm">Secure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    <span className="text-sm">Free to Try</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    <span className="text-sm">Instant Setup</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/50 bg-muted/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-violet-500 to-cyan-500 flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-foreground">QueryFlow AI</span>
              <p className="text-xs text-muted-foreground">Voice-to-SQL Intelligence</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Built with love for AI Hackathon 2024
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          >
            <Star className="w-4 h-4" />
            Star on GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}