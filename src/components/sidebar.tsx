"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, MessageSquare, Upload, BarChart3, ClipboardCheck, Settings } from "lucide-react"
import Image from "next/image"

const menuItems = [
  {
    title: "Overview",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Interactions",
    href: "/interactions",
    icon: MessageSquare,
  },
  {
    title: "Upload",
    href: "/upload",
    icon: Upload,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Dispatcher Grading",
    href: "/grading",
    icon: ClipboardCheck,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  
]

export function Sidebar() {
  const pathname = usePathname()

   return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo/Brand */}
        <div className="flex h-16 items-center border-b border-sidebar-border px-6 gap-3">
  <Image
    src="/NiCE_ELEVATE.svg"
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
    const isActive = pathname === item.href
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
