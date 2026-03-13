"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { 
  Database, Upload, MessageSquare, TrendingUp, BarChart3, FileSpreadsheet, 
  ArrowUpRight, Clock, Sparkles, Zap, Activity, ChevronRight, Play, 
  CircleDot, Layers, Target, Mic
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const stats = [
  { 
    label: "Total Datasets", 
    value: "12", 
    change: "+3 this week",
    icon: Database, 
    gradient: "from-violet-500 to-purple-600",
    bgGradient: "from-violet-500/10 via-purple-500/5 to-transparent"
  },
  { 
    label: "Queries Run", 
    value: "248", 
    change: "+24 today",
    icon: MessageSquare, 
    gradient: "from-cyan-500 to-teal-600",
    bgGradient: "from-cyan-500/10 via-teal-500/5 to-transparent"
  },
  { 
    label: "Charts Created", 
    value: "86", 
    change: "+12 this week",
    icon: BarChart3, 
    gradient: "from-rose-500 to-pink-600",
    bgGradient: "from-rose-500/10 via-pink-500/5 to-transparent"
  },
  { 
    label: "AI Insights", 
    value: "42", 
    change: "+8 today",
    icon: Sparkles, 
    gradient: "from-amber-500 to-orange-600",
    bgGradient: "from-amber-500/10 via-orange-500/5 to-transparent"
  },
]

const recentQueries = [
  { query: "Show total sales by region", time: "2 mins ago", result: "Bar Chart", status: "success" },
  { query: "Compare Q1 vs Q2 revenue", time: "15 mins ago", result: "Table", status: "success" },
  { query: "Top 10 products by profit margin", time: "1 hour ago", result: "Ranked List", status: "success" },
  { query: "Monthly customer growth rate", time: "3 hours ago", result: "Line Chart", status: "success" },
]

const datasets = [
  { name: "sales_data_2024.csv", rows: "12,450", columns: 8, uploaded: "2 days ago", status: "active" },
  { name: "customer_analytics.xlsx", rows: "8,320", columns: 15, uploaded: "5 days ago", status: "active" },
  { name: "inventory_report.csv", rows: "3,200", columns: 6, uploaded: "1 week ago", status: "idle" },
]

// Animated number counter
function AnimatedNumber({ value }: { value: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-4xl font-bold text-foreground"
    >
      {value}
    </motion.span>
  )
}

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">Welcome back, John</h1>
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-2xl"
            >
              👋
            </motion.div>
          </div>
          <p className="text-muted-foreground">Here is what is happening with your data today</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/query">
            <Button className="bg-gradient-to-r from-primary via-violet-500 to-primary bg-[length:200%_100%] hover:bg-[position:100%_0] text-white shadow-lg shadow-primary/25 transition-all duration-500 gap-2">
              <Mic className="w-4 h-4" />
              New Query
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1 group">
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <CardContent className="p-6 relative">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    {stat.change}
                  </div>
                </div>
                <AnimatedNumber value={stat.value} />
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions - Bento Grid Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        {/* Upload Card - Large */}
        <Link href="/upload" className="md:col-span-1 md:row-span-2">
          <Card className="h-full relative overflow-hidden border-border/50 bg-gradient-to-br from-violet-500/5 via-card to-purple-500/5 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-500 cursor-pointer group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-violet-500/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
            <CardContent className="p-8 flex flex-col h-full relative">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl shadow-violet-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 mb-6">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Upload Dataset</h3>
              <p className="text-muted-foreground mb-6 flex-1">Import your CSV or Excel files and start analyzing with AI</p>
              <div className="flex items-center gap-2 text-violet-500 font-medium group-hover:gap-4 transition-all">
                <span>Get Started</span>
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Query Card */}
        <Link href="/query" className="md:col-span-2">
          <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-cyan-500/5 via-card to-teal-500/5 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-500 cursor-pointer group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <CardContent className="p-6 flex items-center gap-6 relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform duration-500">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-1">Ask a Question</h3>
                <p className="text-sm text-muted-foreground">Query your data with natural language or voice</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 text-sm text-muted-foreground">
                  <Mic className="w-4 h-4" />
                  Voice ready
                </div>
                <ArrowUpRight className="w-6 h-6 text-muted-foreground group-hover:text-cyan-500 transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Insights Card */}
        <Link href="/insights">
          <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-amber-500/5 via-card to-orange-500/5 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-500 cursor-pointer group">
            <CardContent className="p-6 flex items-center gap-5 relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform duration-500">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-0.5">View AI Insights</h3>
                <p className="text-sm text-muted-foreground">42 new recommendations</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </Link>

        {/* Analytics Card */}
        <Link href="/insights">
          <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-rose-500/5 via-card to-pink-500/5 hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-500 cursor-pointer group">
            <CardContent className="p-6 flex items-center gap-5 relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform duration-500">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-0.5">Analytics</h3>
                <p className="text-sm text-muted-foreground">Track performance</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Queries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  Recent Queries
                </CardTitle>
                <Link href="/query">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 gap-1">
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentQueries.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">{item.query}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">{item.time}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center gap-1">
                          <CircleDot className="w-3 h-3" />
                          {item.result}
                        </span>
                      </div>
                    </div>
                    <Play className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Datasets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <FileSpreadsheet className="w-4 h-4 text-violet-500" />
                  </div>
                  Datasets
                </CardTitle>
                <Link href="/upload">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 gap-1">
                    Manage
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {datasets.map((dataset, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Database className="w-5 h-5 text-violet-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate group-hover:text-violet-500 transition-colors">{dataset.name}</p>
                        <p className="text-xs text-muted-foreground">{dataset.uploaded}</p>
                      </div>
                      {dataset.status === "active" && (
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        {dataset.rows} rows
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {dataset.columns} cols
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Performance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Card className="relative overflow-hidden border-border/50 bg-card/80">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-violet-500/5" />
          <CardContent className="p-6 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg">System Performance</h3>
                  <p className="text-sm text-muted-foreground">All systems operational</p>
                </div>
              </div>
              <div className="flex items-center gap-8 md:gap-12">
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">98.5%</p>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">1.2s</p>
                  <p className="text-xs text-muted-foreground">Avg. Response</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">99.9%</p>
                  <p className="text-xs text-muted-foreground">Uptime</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
