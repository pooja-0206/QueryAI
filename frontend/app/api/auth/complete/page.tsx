"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function AuthCompletePage() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const token = params.get("token")
    const name = params.get("name")
    const email = params.get("email")

    if (token) {
      localStorage.setItem("token", token)
      if (name) localStorage.setItem("userName", name)
      if (email) localStorage.setItem("userEmail", email)
    }

    router.replace("/dashboard")
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Signing you in...</p>
      </div>
    </div>
  )
}