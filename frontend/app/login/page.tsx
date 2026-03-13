"use client"

import { login } from "@/lib/api"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Database, Mail, Lock, ArrowRight, Eye, EyeOff, Github, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

// ─── OAuth config ────────────────────────────────────────────────────────────
// Set these in your .env.local:
//   NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
//   NEXT_PUBLIC_GITHUB_CLIENT_ID=...
//   NEXT_PUBLIC_APP_URL=http://localhost:3000
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""
const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID ?? ""
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

function handleGoogleLogin() {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: `${APP_URL}/api/auth/callback/google`,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  })
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

function handleGithubLogin() {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: `${APP_URL}/api/auth/callback/github`,
    scope: "read:user user:email",
  })
  window.location.href = `https://github.com/login/oauth/authorize?${params}`
}
// ─────────────────────────────────────────────────────────────────────────────

function DataFlowLines() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 400 600" preserveAspectRatio="none">
      {[...Array(6)].map((_, i) => (
        <motion.path
          key={i}
          d={`M${60 + i * 50} 0 Q ${100 + i * 40} ${200 + i * 30}, ${80 + i * 45} 350 T ${50 + i * 55} 600`}
          stroke="url(#flowGrad)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 0], opacity: [0, 0.6, 0] }}
          transition={{ duration: 5, delay: i * 0.6, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <defs>
        <linearGradient id="flowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    try {
      const response = await login(email, password)
      if (response.token) {
        localStorage.setItem("token", response.token)
        if (response.name) localStorage.setItem("userName", response.name)
        if (response.email) localStorage.setItem("userEmail", response.email)
        router.push("/dashboard")
      } else {
        setError(response.error || "Invalid email or password.")
      }
    } catch {
      setError("Server error. Please try again.")
    }
    setIsLoading(false)
  }

  const onGoogleClick = () => {
    if (!GOOGLE_CLIENT_ID) {
      setError("Google login is not configured. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to .env.local")
      return
    }
    setOauthLoading("google")
    handleGoogleLogin()
  }

  const onGithubClick = () => {
    if (!GITHUB_CLIENT_ID) {
      setError("GitHub login is not configured. Add NEXT_PUBLIC_GITHUB_CLIENT_ID to .env.local")
      return
    }
    setOauthLoading("github")
    handleGithubLogin()
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-violet-100 via-purple-50 to-cyan-100 overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `linear-gradient(rgba(139,92,246,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <DataFlowLines />

        {[
          { top: "15%", left: "10%", delay: 0 },
          { top: "25%", right: "15%", delay: 0.5 },
          { bottom: "30%", left: "20%", delay: 1 },
          { bottom: "15%", right: "10%", delay: 1.5 },
        ].map((pos, i) => (
          <motion.div
            key={i}
            className="absolute w-14 h-14 rounded-2xl bg-white/70 backdrop-blur-sm border border-violet-200/50 shadow-lg flex items-center justify-center"
            style={pos as React.CSSProperties}
            animate={{ y: [0, -12, 0], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 4, delay: pos.delay, repeat: Infinity, ease: "easeInOut" }}
          >
            {i % 2 === 0
              ? <Database className="w-7 h-7 text-violet-500" />
              : <Sparkles className="w-7 h-7 text-cyan-500" />}
          </motion.div>
        ))}

        <div className="relative z-10 flex flex-col justify-between p-12 text-foreground w-full">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center group-hover:bg-white transition-colors">
              <Database className="w-6 h-6 text-violet-600" />
            </div>
            <span className="text-2xl font-bold text-violet-700">QueryFlow</span>
          </Link>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-md">
            <h1 className="text-4xl font-bold mb-6 leading-tight text-violet-800">
              Welcome back to your data intelligence hub
            </h1>
            <p className="text-violet-600/80 text-lg leading-relaxed">
              Continue exploring your data with voice queries and AI-powered insights that transform how you understand your business.
            </p>
          </motion.div>

          <motion.div className="flex gap-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            {[["10k+", "Active Users"], ["1M+", "Queries Run"], ["99%", "Satisfaction"]].map(([val, label]) => (
              <div key={label} className="bg-white/60 backdrop-blur-sm px-5 py-3 rounded-xl shadow-md">
                <div className="text-3xl font-bold text-violet-700">{val}</div>
                <div className="text-violet-500/80 text-sm">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl" />
        </div>

        <motion.div className="w-full max-w-md relative z-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Mobile logo */}
          <div className="lg:hidden mb-10 flex justify-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-violet-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <Database className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-foreground">QueryFlow</span>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Sign in</h2>
            <p className="text-muted-foreground">Enter your credentials to continue</p>
          </div>

          {/* Error banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {/* OAuth buttons */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Button
              variant="outline"
              onClick={onGoogleClick}
              disabled={oauthLoading !== null}
              className="h-12 rounded-xl border-border/50 hover:bg-muted/50 hover:border-primary/30 transition-all"
            >
              {oauthLoading === "google" ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Google
            </Button>

            <Button
              variant="outline"
              onClick={onGithubClick}
              disabled={oauthLoading !== null}
              className="h-12 rounded-xl border-border/50 hover:bg-muted/50 hover:border-primary/30 transition-all"
            >
              {oauthLoading === "github" ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Github className="w-5 h-5 mr-2" />
              )}
              GitHub
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-4 text-muted-foreground">or continue with email</span>
            </div>
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-12 pl-12 rounded-xl bg-muted/30 border-border/50 focus:border-primary/50 focus:bg-background transition-all" required />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-foreground">Password</label>
                <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/80 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password"
                  className="h-12 pl-12 pr-12 rounded-xl bg-muted/30 border-border/50 focus:border-primary/50 focus:bg-background transition-all" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="remember" className="rounded-md border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
              <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">Remember me for 30 days</label>
            </div>

            <Button type="submit" disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-primary via-violet-500 to-primary bg-[length:200%_100%] hover:bg-[position:100%_0] text-white shadow-lg shadow-primary/25 transition-all duration-500 rounded-xl text-base font-medium">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-5 h-5 ml-2" /></>
              )}
            </Button>
          </form>

          <p className="text-center mt-8 text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary font-semibold hover:text-primary/80 transition-colors">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}