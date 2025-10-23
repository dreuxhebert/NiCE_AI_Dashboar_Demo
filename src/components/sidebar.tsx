"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  MessageSquare,
  Upload,
  BarChart3,
  ClipboardCheck,
  Settings,
  FileCheck,
  Users,
} from "lucide-react"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"

const menuItems = [
  { title: "Overview", href: "/", icon: LayoutDashboard },
  { title: "Evaluations", href: "/evaluations", icon: FileCheck },
  { title: "Coaching", href: "/coaching", icon: ClipboardCheck },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Interactions", href: "/interactions", icon: MessageSquare },
  { title: "Directory", href: "/directory", icon: Users },
  { title: "Settings", href: "/settings", icon: Settings },
]

interface SidebarProps {
  collapsed: boolean
}

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

export function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname()
  const isDark = useIsDark()

  const logoSrc = useMemo(
    () => (isDark ? "/Inform-QAi_white.svg" : "/Inform-QAi_blk.svg"),
    [isDark]
  )

  const isActive = (href: string) =>
    href === "/" ? pathname === href : pathname?.startsWith(href)

  const linkTextSize = collapsed ? "text-sm" : "text-lg"

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar transition-[width] duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Brand */}
        <div
          className={cn(
            "flex items-center border-b border-sidebar-border transition-all",
            collapsed ? "h-12 px-2 justify-center" : "h-16 px-4"
          )}
        >
          {/* Hide the big logo when collapsed */}
          {!collapsed && (
            <Image
              src={logoSrc}
              alt="Company Logo"
              width={60}
              height={60}
              priority
              className="h-8 w-auto"
            />
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.title}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-3 font-semibold transition-colors",
                    linkTextSize,
                    active
                      ? "bg-sidebar-accent text-primary"
                      : "text-primary hover:bg-sidebar-accent/50 hover:text-primary"
                  )}
                >
                  <Icon className="h-6 w-6 text-primary" />
                  {/* Hide label when collapsed, keep for screen readers */}
                  <span className={cn("whitespace-nowrap", collapsed ? "sr-only" : "inline")}>
                    {item.title}
                  </span>

                  {/* Tooltip when collapsed */}
                  {collapsed && (
                    <span className="pointer-events-none absolute left-14 z-50 hidden rounded-md bg-popover px-2 py-1 text-sm text-popover-foreground shadow group-hover:block">
                      {item.title}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Upload pinned bottom */}
        <div className="border-t border-sidebar-border p-2">
          <Link
            href="/upload"
            aria-label="Upload"
            className={cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-3 font-semibold transition-colors",
              linkTextSize,
              isActive("/upload")
                ? "bg-sidebar-accent text-primary"
                : "text-primary hover:bg-sidebar-accent/50 hover:text-primary"
            )}
          >
            <Upload className="h-6 w-6 text-primary" />
            <span className={cn("whitespace-nowrap", collapsed ? "sr-only" : "inline")}>
              Upload
            </span>
            {collapsed && (
              <span className="pointer-events-none absolute left-14 z-50 hidden rounded-md bg-popover px-2 py-1 text-sm text-popover-foreground shadow group-hover:block">
                Upload
              </span>
            )}
          </Link>
        </div>
      </div>
    </aside>
  )
}