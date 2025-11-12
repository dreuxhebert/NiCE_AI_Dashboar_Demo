// app/layout-shell.tsx
"use client"

import { Suspense, useEffect, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { Toaster } from "@/components/ui/toaster"

const ALL_PERMISSIONS  = ["Overview","Evaluations","Coaching","Analytics","Interactions","Protocol","Administrator"]

export default function LayoutShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [isNarrow, setIsNarrow] = useState(false)
  const [permissions, setPermissions] = useState<string[]>([])
  const [authStatus, setAuthStatus] = useState<"loading"|"authed"|"guest">("loading")
  const router = useRouter()
  const pathname = usePathname()

  // screen size
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1024px)")
    const onChange = (e: MediaQueryListEvent) => {
      setIsNarrow(e.matches)
      setCollapsed(e.matches ? true : false)
    }
    setIsNarrow(mq.matches)
    setCollapsed(mq.matches ? true : false)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  // auth & permissions
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null

    // Demo mode
    if (token === "demo-token") {
      const u = JSON.parse(localStorage.getItem("current_user") || "{}")
      setPermissions(u.permissions || ALL_PERMISSIONS)
      setAuthStatus("authed")
      return
    }

    if (!token) {
      setAuthStatus("guest")
      router.replace(`/login?next=${encodeURIComponent(pathname || "/")}`)
      return
    }

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:5001"
    const USE_PROXY = process.env.NEXT_PUBLIC_USE_PROXY === "true"
    const getApiUrl = (p: string) => (USE_PROXY ? `/api/proxy${p}` : `${API_BASE}${p}`)

    fetch(getApiUrl("/auth/me"), { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (!res.ok) {
          setAuthStatus("guest")
          router.replace(`/login?next=${encodeURIComponent(pathname || "/")}`)
          return
        }
        const data = await res.json()
        setPermissions(data.permissions || [])
        setAuthStatus("authed")
      })
      .catch(() => {
        setAuthStatus("guest")
        router.replace(`/login?next=${encodeURIComponent(pathname || "/")}`)
      })
  }, [router, pathname])

  const handleToggleSidebar = () => {
    if (isNarrow) return
    setCollapsed((prev) => !prev)
  }

  // Block UI until authenticated (prevents flash/bypass)
  if (authStatus !== "authed") {
    return <div className="p-6">Loading…</div>
  }

  return (
    <div className="overflow-x-hidden">
      <Sidebar collapsed={collapsed} permissions={permissions} />
      <TopNav collapsed={collapsed} onToggleSidebar={handleToggleSidebar} />
      <main className={`mt-16 min-h-screen p-6 transition-[margin-left] duration-200 ${collapsed ? "ml-16" : "ml-64"}`}>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </main>
      <Toaster />
    </div>
  )
}