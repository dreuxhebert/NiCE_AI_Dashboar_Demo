"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, MessageSquare, Upload, BarChart3, ClipboardCheck, Settings, Users } from "lucide-react"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"

const menuItems = [
  { title: "Overview", href: "/", icon: LayoutDashboard },
  { title: "Interactions", href: "/interactions", icon: MessageSquare },
  { title: "Upload", href: "/upload", icon: Upload },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Directory", href: "/directory", icon: Users },
  { title: "Coaching", href: "/coaching", icon: ClipboardCheck },
  { title: "Settings", href: "/settings", icon: Settings },
]

// Watch the <html> class for "dark" and expose a boolean
function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(false)
  useEffect(() => {
    const el = document.documentElement
    const update = () => setIsDark(el.classList.contains("dark"))
    update()
    const obs = new MutationObserver(update)
    obs.observe(el, { attributes: true, attributeFilter: ["class"] })
    return () => obs.disconnect()
  }, [])
  return isDark
}

export function Sidebar() {
  const pathname = usePathname()
  const isDark = useIsDark()

  const logoSrc = useMemo(
    () => (isDark ? "/Inform-QA_white.svg" : "/Inform-QA_blk.svg"),
    [isDark]
  )

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo/Brand */}
        <div className="flex h-16 items-center border-b border-sidebar-border px-6 gap-3">
          <Image
            src={logoSrc}
            alt="Company Logo"
            width={60}
            height={60}
            priority
            className="h-8 w-auto"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item) => {
            // root exact match, otherwise prefix match so children keep the parent active
            const isActive = item.href === "/" ? pathname === item.href : pathname?.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-lg font-semibold transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-primary"
                    : "text-primary hover:bg-sidebar-accent/50 hover:text-primary"
                )}
              >
                <Icon className="h-6 w-6 text-primary" />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

