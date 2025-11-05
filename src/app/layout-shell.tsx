// app/layout-shell.tsx
"use client"

import { Suspense, useEffect, useState, type ReactNode } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { Toaster } from "@/components/ui/toaster"

export default function LayoutShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [isNarrow, setIsNarrow] = useState(false)

  useEffect(() => {
    // match the tailwind lg breakpoint(~1024px)
    const mediaQuery = window.matchMedia("(max-width: 1024px)")

    const handleChange = (event: MediaQueryListEvent) => {
      const matches = event.matches
      setIsNarrow(matches)
      setCollapsed(matches ? true : false)
    }

    // run once on mount
    setIsNarrow(mediaQuery.matches)
    setCollapsed(mediaQuery.matches ? true : false)

    // modern way
    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  const handleToggleSidebar = () => {
    // don’t allow expanding on narrow screens
    if (isNarrow) return
    setCollapsed((prev) => !prev)
  }

  return (
    <div className="overflow-x-hidden">
      <Sidebar collapsed={collapsed} />
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