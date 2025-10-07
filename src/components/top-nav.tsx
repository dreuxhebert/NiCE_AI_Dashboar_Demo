"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Bell, ChevronDown, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function TopNav() {
  // theme toggle state
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)

  // initialize from localStorage / prefers-color-scheme
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
    try {
      localStorage.setItem("theme", next ? "dark" : "light")
    } catch {}
  }

  return (
    // match your layout: fixed bar that starts after the 256px Sidebar (ml-64 in RootLayout main)
    <header className="fixed left-64 right-0 top-0 z-30 h-16 border-b border-border bg-card">
      {/* relative so the centered logo can be absolutely positioned */}
      <div className="relative flex h-full items-center justify-between px-6">
        {/* Left: page title (or put a menu button here later) */}
        <div className="flex items-center gap-4">
          <h2 className="font-sans text-lg font-medium text-foreground">Dashboard</h2>
        </div>

        {/* Center: logo */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Image
            src="/NiCE_SMILE.svg"
            alt="NiCE"
            width={120}
            height={40}
            priority
            className="h-8 w-auto"
          />
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
          </Button>

          {/* Theme toggle (no sr-only text leaking) */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="relative rounded-full border border-transparent transition-all hover:border-border"
              aria-label={isDark ? "Switch to Light" : "Switch to Dark"}
              title={isDark ? "Switch to Light" : "Switch to Dark"}
            >
              <Sun
                className={`h-5 w-5 transition-all ${
                  isDark ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
                }`}
              />
              <Moon
                className={`absolute h-5 w-5 transition-all ${
                  isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
                }`}
              />
            </Button>
          )}

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 hover:bg-accent">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback className="bg-primary text-primary-foreground">JD</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">John Doe</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}