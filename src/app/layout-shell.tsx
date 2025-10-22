// app/layout-shell.tsx
"use client"

import { Suspense, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { Toaster } from "@/components/ui/toaster"

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      <Sidebar collapsed={collapsed} />
      <TopNav
        collapsed={collapsed}
        onToggleSidebar={() => setCollapsed(v => !v)}
      />
      <main
        className={`mt-16 min-h-screen p-6 transition-[margin-left] duration-200 ${
          collapsed ? "ml-16" : "ml-64"
        }`}
      >
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </main>
      <Toaster />
    </>
  )
}
