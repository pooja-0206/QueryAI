"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Database, LayoutDashboard, Upload, MessageSquare, Lightbulb, Settings, LogOut, ChevronLeft, ChevronRight, Sparkles, Zap, BrainCircuit } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", gradient: "from-violet-500 to-purple-600" },
  { icon: Upload, label: "Upload Data", href: "/upload", gradient: "from-cyan-500 to-teal-600" },
  { icon: MessageSquare, label: "Query Assistant", href: "/query", gradient: "from-rose-500 to-pink-600" },
  { icon: Lightbulb, label: "Insights", href: "/insights", gradient: "from-amber-500 to-orange-600" },
  { icon: BrainCircuit, label: "ML Predictions", href: "/predictions", gradient: "from-emerald-500 to-teal-600" },
  { icon: Settings, label: "Settings", href: "/settings", gradient: "from-slate-500 to-slate-600" },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [userName, setUserName] = useState("User")
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    const storedName = localStorage.getItem("userName")
    const storedEmail = localStorage.getItem("userEmail")
    if (storedName) {
      setUserName(storedName)
      if (storedEmail) setUserEmail(storedEmail)
    } else {
      const token = localStorage.getItem("token")
      if (token) {
        try {
          const decoded = atob(token)
          const parts = decoded.split(":")
          const email = parts[0] ?? ""
          setUserEmail(email)
          setUserName(email.split("@")[0] ?? "User")
        } catch (_) {}
      }
    }
  }, [])

  const initials = userName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) || "U"

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userName")
    localStorage.removeItem("userEmail")
    router.push("/")
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen bg-gradient-to-b from-violet-50/80 via-purple-50/50 to-cyan-50/60 backdrop-blur-xl border-r border-violet-200/40 flex flex-col sticky top-0 relative"
    >
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `linear-gradient(rgba(139,92,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.05) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Logo */}
      <div className="p-5 border-b border-violet-200/40 relative">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary via-violet-500 to-cyan-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-primary via-violet-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <Database className="w-5 h-5 text-white" />
            </div>
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                QueryFlow
              </span>
              <span className="block text-xs text-muted-foreground">AI-Powered Analytics</span>
            </motion.div>
          )}
        </Link>
      </div>

      {/* Pro Badge */}
      {!collapsed && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mx-4 mt-4">
          <div className="p-3 rounded-xl bg-white/60 backdrop-blur-sm shadow-md shadow-violet-200/30 border border-violet-200/40">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Pro Features</span>
            </div>
            <p className="text-xs text-muted-foreground">Unlimited queries & AI insights</p>
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto relative">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
          {collapsed ? "" : "Menu"}
        </p>
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                    isActive
                      ? "bg-gradient-to-r from-primary/10 to-violet-500/10 text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-violet-500 rounded-full"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300",
                    isActive ? `bg-gradient-to-br ${item.gradient} shadow-lg` : "bg-muted/50 group-hover:bg-muted"
                  )}>
                    <item.icon className={cn(
                      "w-4 h-4 transition-colors",
                      isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                    )} />
                  </div>
                  {!collapsed && (
                    <span className={cn("font-medium transition-colors", isActive ? "text-foreground" : "")}>
                      {item.label}
                    </span>
                  )}
                  {isActive && !collapsed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto w-2 h-2 rounded-full bg-primary"
                    />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-24 w-6 h-6 rounded-full bg-card border border-border shadow-lg flex items-center justify-center hover:bg-muted hover:scale-110 transition-all z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3 text-muted-foreground" /> : <ChevronLeft className="w-3 h-3 text-muted-foreground" />}
      </button>

      {/* Quick Action */}
      {!collapsed && (
        <div className="px-4 mb-4">
          <Link href="/query">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 rounded-xl bg-gradient-to-r from-primary via-violet-500 to-primary bg-[length:200%_100%] hover:bg-[position:100%_0] transition-all duration-500 cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">New Query</p>
                  <p className="text-xs text-white/70">Voice or text</p>
                </div>
              </div>
            </motion.div>
          </Link>
        </div>
      )}

      {/* User Section */}
      <div className="p-4 border-t border-violet-200/40 relative">
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-xl bg-white/50 hover:bg-white/70 shadow-sm shadow-violet-200/20 transition-colors",
          collapsed && "justify-center"
        )}>
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
              <span className="text-sm font-bold text-white">{initials}</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{userEmail || "Pro Member"}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  )
}