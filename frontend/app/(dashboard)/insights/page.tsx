"use client"

import { motion } from "framer-motion"
import { Lightbulb, TrendingUp, TrendingDown, AlertCircle, Target, ArrowUpRight, BarChart3, Users, DollarSign, Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const insights = [
  {
    id: 1,
    type: "growth",
    title: "Sales Growing in North Region",
    description: "North region shows 23% increase in sales compared to last quarter. This is driven primarily by Product A and B categories.",
    metric: "+23%",
    icon: TrendingUp,
    color: "from-chart-2/30 to-chart-2/5",
    iconBg: "bg-chart-2/20",
    iconColor: "text-chart-2",
    action: "View breakdown",
  },
  {
    id: 2,
    type: "warning",
    title: "Inventory Alert: Low Stock",
    description: "Product C is running low on inventory with only 12 units remaining. Consider reordering to avoid stockouts.",
    metric: "12 units",
    icon: AlertCircle,
    color: "from-chart-4/30 to-chart-4/5",
    iconBg: "bg-chart-4/20",
    iconColor: "text-chart-4",
    action: "Check inventory",
  },
  {
    id: 3,
    type: "decline",
    title: "Customer Churn Detected",
    description: "15% of customers from Q1 haven't made a purchase in the last 60 days. Consider running a re-engagement campaign.",
    metric: "-15%",
    icon: TrendingDown,
    color: "from-destructive/20 to-destructive/5",
    iconBg: "bg-destructive/20",
    iconColor: "text-destructive",
    action: "View customers",
  },
  {
    id: 4,
    type: "opportunity",
    title: "Cross-sell Opportunity",
    description: "Customers who buy Product A are 3x more likely to buy Product D. Consider bundling these products.",
    metric: "3x",
    icon: Target,
    color: "from-primary/20 to-primary/5",
    iconBg: "bg-primary/20",
    iconColor: "text-primary",
    action: "Create bundle",
  },
]

const kpis = [
  { label: "Total Revenue", value: "$125,400", change: "+12.5%", positive: true, icon: DollarSign },
  { label: "Active Customers", value: "2,340", change: "+8.2%", positive: true, icon: Users },
  { label: "Products Sold", value: "8,450", change: "+15.3%", positive: true, icon: Package },
  { label: "Avg. Order Value", value: "$53.50", change: "-2.1%", positive: false, icon: BarChart3 },
]

export default function InsightsPage() {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">AI Insights</h1>
        <p className="text-muted-foreground">Automated recommendations based on your data analysis</p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                    <kpi.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <span className={`text-sm font-medium ${kpi.positive ? "text-chart-2" : "text-destructive"}`}>
                    {kpi.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground mb-1">{kpi.value}</p>
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Insights List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-chart-4" />
                Recent Insights
              </CardTitle>
              <span className="text-sm text-muted-foreground">{insights.length} new insights</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.map((insight, i) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                  className={`p-5 rounded-2xl bg-gradient-to-r ${insight.color} border border-border/30 hover:shadow-md transition-all duration-300`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${insight.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <insight.icon className={`w-6 h-6 ${insight.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{insight.title}</h3>
                        <span className={`text-sm font-bold ${
                          insight.type === "decline" ? "text-destructive" :
                          insight.type === "warning" ? "text-chart-4" :
                          "text-chart-2"
                        }`}>
                          {insight.metric}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {insight.description}
                      </p>
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 -ml-3">
                        {insight.action}
                        <ArrowUpRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Card className="border-border/50 bg-gradient-to-r from-primary/5 via-card to-chart-2/5">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center shadow-lg shadow-primary/25">
                <Lightbulb className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Want more insights?</h3>
                <p className="text-sm text-muted-foreground">Ask specific questions about your data</p>
              </div>
            </div>
            <Link href="/query">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/25">
                Go to Query Assistant
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
