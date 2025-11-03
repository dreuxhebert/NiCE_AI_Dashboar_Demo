// app/layout-shell.tsx
"use client"

import { Suspense, useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { Toaster } from "@/components/ui/toaster"

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [isNarrow, setIsNarrow] = useState(false)

  // Auto-collapse sidebar below the breakpoint and lock it collapsed
  useEffect(() => {
    // Tailwind lg breakpoint ~1024px; collapse below this width
    const mq = window.matchMedia("(max-width: 1024px)")
    const apply = (matches: boolean) => {
      setIsNarrow(matches)
      setCollapsed(matches ? true : false)
    }
    // Initialize on mount
    apply(mq.matches)
    const onChange = (e: MediaQueryListEvent) => apply(e.matches)
    if (mq.addEventListener) {
      mq.addEventListener("change", onChange)
    } else if (mq.addListener) {
      mq.addListener(onChange)
    }
    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener("change", onChange)
      } else if (mq.removeListener) {
        mq.removeListener(onChange)
      }
    }
  }, [])

  const handleToggleSidebar = () => {
    // Prevent expanding when screen is narrow (forced collapsed)
    if (isNarrow) return
    setCollapsed((v) => !v)
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
