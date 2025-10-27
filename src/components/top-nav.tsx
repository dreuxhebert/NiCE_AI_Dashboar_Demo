"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Bell, ChevronDown, Moon, Sun, PanelLeftOpen, PanelLeftClose } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

interface TopNavProps {
  collapsed?: boolean
  onToggleSidebar: () => void
}

export function TopNav({ collapsed = false, onToggleSidebar }: TopNavProps) {
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem("theme")
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      const next = saved ? saved === "dark" : prefersDark
      document.documentElement.classList.toggle("dark", next)
      setIsDark(next)
    } catch {}
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle("dark", next)
    try { localStorage.setItem("theme", next ? "dark" : "light") } catch {}
  }

  return (
    <header className={`fixed top-0 right-0 z-30 h-16 border-b border-border bg-card ${collapsed ? "left-16" : "left-64"}`}>
      <div className="relative flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost" size="icon"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={onToggleSidebar}
          >
            {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </Button>
          <h2 className="font-sans text-lg font-medium text-foreground">Dashboard</h2>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2">
          <Image src="/NiCE_SMILE.svg" alt="NiCE" width={120} height={40} priority className="h-8 w-auto" />
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
          </Button>

          {mounted && (
            <Button
              variant="ghost" size="icon" onClick={toggleTheme}
              className="relative rounded-full border border-transparent transition-all hover:border-border"
              aria-label={isDark ? "Switch to Light" : "Switch to Dark"}
              title={isDark ? "Switch to Light" : "Switch to Dark"}
            >
              <Sun className={`h-5 w-5 transition-all ${isDark ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"}`} />
              <Moon className={`absolute h-5 w-5 transition-all ${isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"}`} />
            </Button>
          )}

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 hover:bg-accent">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback className="bg-primary text-primary-foreground">DH</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">Demo</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/settings">Settings</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/support">Support</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); /* logout here */ }}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}