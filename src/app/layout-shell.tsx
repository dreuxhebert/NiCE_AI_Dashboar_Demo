// app/layout-shell.tsx
"use client"

import { Suspense, useEffect, useState, type ReactNode } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { Toaster } from "@/components/ui/toaster"

export default function LayoutShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [isNarrow, setIsNarrow] = useState(false)

  // ✅ NEW: track admin
  const [isAdmin, setIsAdmin] = useState(false)

  // figure out screen size
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1024px)")

    const handleChange = (event: MediaQueryListEvent) => {
      const matches = event.matches
      setIsNarrow(matches)
      setCollapsed(matches ? true : false)
    }

    setIsNarrow(mediaQuery.matches)
    setCollapsed(mediaQuery.matches ? true : false)
    mediaQuery.addEventListener("change", handleChange)
    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  // ✅ NEW: fetch user once to see if admin
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    if (!token) return

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:5001"
    const USE_PROXY = process.env.NEXT_PUBLIC_USE_PROXY === "true"
    const getApiUrl = (path: string) =>
      USE_PROXY ? `/api/proxy${path}` : `${API_BASE}${path}`

    fetch(getApiUrl("/auth/me"), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) return
        const data = await res.json()
        if (data.is_admin) {
          setIsAdmin(true)
        }
      })
      .catch(() => {
        // ignore for now
      })
  }, [])

  const handleToggleSidebar = () => {
    if (isNarrow) return
    setCollapsed((prev) => !prev)
  }

  return (
    <div className="overflow-x-hidden">
      {/* ✅ pass isAdmin into Sidebar */}
      <Sidebar collapsed={collapsed} isAdmin={isAdmin} />
      <TopNav collapsed={collapsed} onToggleSidebar={handleToggleSidebar} />
      <main
        className={`mt-16 min-h-screen p-6 transition-[margin-left] duration-200 ${
          collapsed ? "ml-16" : "ml-64"
        }`}
      >
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </main>
      <Toaster />
    </div>
  )
}