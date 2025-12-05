"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"

  const ALL_PERMISSIONS  = [
    "Overview",
    "Evaluations",
    "Coaching",
    "Analytics",
    "Interactions",
    "Protocol",
    "Administrator",
    "Search and Replay"
  ];

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  // proxy-aware setup
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:5001"
  const USE_PROXY = process.env.NEXT_PUBLIC_USE_PROXY === "true"
  const getApiUrl = (path: string) =>
    USE_PROXY ? `/api/proxy${path}` : `${API_BASE}${path}`

  // secret demo credentials
  const DEMO_USER = "123"
  const DEMO_PASS = "123"

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // 1) demo path
    if (email === DEMO_USER && password === DEMO_PASS) {

    if (typeof window !== "undefined") {
      // Store fake token (needed so /auth/me isn't triggered)
      localStorage.setItem("access_token", "demo-token")

      // Store full permissions
      localStorage.setItem("current_user", JSON.stringify({
        email: "demo@nice.com",
        first_name: "Demo",
        last_name: "User",
        permissions: ALL_PERMISSIONS,
        is_admin: true,  // optional: give admin access too
      }))
    }

    router.push("/overview")
    return
  }

    // 2) real backend path
    try {
      const res = await fetch(getApiUrl("/auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data.detail || "Login failed")
        return
      }

      //backend returns: { message, access_token, token_type, user: {...} }
      if (typeof window !== "undefined") {
        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token)
        }
        // optional: keep user too
        if (data.user) {
          localStorage.setItem("current_user", JSON.stringify(data.user))
        }
      }

      router.push("/overview")
    } catch (err) {
      setError("Server is waking up — try again or use demo creds.")
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
        {/* Logo section */}
        <div className="flex justify-center mb-8">
          <img
            src="/Inform-QAi_white.svg"
            alt="Inform QAi Logo"
            className="h-12 object-contain"
          />
        </div>

        <div className="text-center mb-8">
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email
            </label>
            <Input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">OR</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account. Ask your superviser to register your details.
        </p>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-6">
        © 2025 NiCE. All rights reserved.
      </p>
    </div>
  )
}