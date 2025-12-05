"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Bell,
  ChevronDown,
  Moon,
  Sun,
  PanelLeftOpen,
  PanelLeftClose,
  MessageSquare,
} from "lucide-react"
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
import ChangePasswordDrawer from "@/components/change-password"
import { useToast } from "@/hooks/use-toast"

interface TopNavProps {
  collapsed?: boolean
  onToggleSidebar: () => void
  isAnalyticsPage?: boolean
}

interface CurrentUser {
  email?: string
  first_name?: string
  last_name?: string
  team_number?: number | null
  avatar_url?: string
}

function getInitials(user: CurrentUser | null) {
  if (!user) return "NA"
  const f = user.first_name?.trim() || ""
  const l = user.last_name?.trim() || ""
  if (f || l) return `${f.charAt(0)}${l.charAt(0)}`.toUpperCase()
  if (user.email) return user.email.charAt(0).toUpperCase()
  return "NA"
}

export function TopNav({ collapsed = false, onToggleSidebar, isAnalyticsPage = false }: TopNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [user, setUser] = useState<CurrentUser | null>(null)
  const { toast } = useToast()

  const [open, setOpen] = useState(false)
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:5001"
  const USE_PROXY = process.env.NEXT_PUBLIC_USE_PROXY === "true"
  const getApiUrl = (path: string) =>
    USE_PROXY ? `/api/proxy${path}` : `${API_BASE}${path}`

  useEffect(() => {
    setMounted(true)

    const el = document.documentElement
    const update = () => setIsDark(el.classList.contains("dark"))

    const loadTheme = async () => {
      const token = localStorage.getItem("access_token")

      // Demo user: use local storage only
      if (token === "demo-token") {
        try {
          const saved = localStorage.getItem("theme")
          const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
          const next = saved ? saved === "dark" : prefersDark
          el.classList.toggle("dark", next)
          setIsDark(next)
        } catch {}
        return
      }

      // Authenticated users: try backend
      if (token) {
        try {
          const res = await fetch(getApiUrl("/user/theme"), {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (res.ok) {
            const data = await res.json()
            if (data.theme) {
              const next = data.theme === "dark"
              el.classList.toggle("dark", next)
              setIsDark(next)
              localStorage.setItem("theme", data.theme)
              return
            }
          }
        } catch (error) {
          console.error("Error fetching theme from backend:", error)
        }
      }

      // Fallback: local storage or system
      try {
        const saved = localStorage.getItem("theme")
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        const next = saved ? saved === "dark" : prefersDark
        el.classList.toggle("dark", next)
        setIsDark(next)
      } catch {}
    }

    loadTheme()

    const obs = new MutationObserver(update)
    obs.observe(el, { attributes: true, attributeFilter: ["class"] })
    return () => obs.disconnect()
  }, [])

  // Load user
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    if (!token) return

    fetch(getApiUrl("/auth/me"), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) return
        const data = await res.json()
        setUser(data)
      })
      .catch(() => {})
  }, [])

  const handleChangePassword = async (data: {
    currentPassword: string
    newPassword: string
  }) => {
    const res = await fetch(getApiUrl("/user/updatePassword"), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userEmail: user?.email,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    })

    if (!res.ok) {
      toast({
        title: "Error updating the password ",
      })
    } else {
      toast({
        title: "Password Update Successful",
      })
    }
  }

  const toggleTheme = async () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle("dark", next)
    const themeValue = next ? "dark" : "light"

    try {
      localStorage.setItem("theme", themeValue)
    } catch {}

    const token = localStorage.getItem("access_token")
    if (token && token !== "demo-token") {
      try {
        await fetch(getApiUrl("/user/theme"), {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ theme: themeValue }),
        })
      } catch (error) {
        console.error("Error saving theme to backend:", error)
      }
    }
  }

  const displayName =
    user?.first_name
      ? user.last_name
        ? `${user.first_name} ${user.last_name}`
        : user.first_name
      : user?.email
        ? user.email
        : "User"

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 border-b border-sidebar-border bg-card transition-[left] duration-300 ease-in-out ${
        collapsed ? "left-16" : "left-64"
      }`}
    >
      <div className="absolute inset-y-0 left-0 border-l border-sidebar-border" aria-hidden />

      <div className="relative flex h-full items-center justify-between px-6">
        {/* LEFT: sidebar toggle + top tabs (Interactions like NICE UI) */}
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={onToggleSidebar}
            disabled={isAnalyticsPage}
            className={isAnalyticsPage ? "opacity-50 cursor-not-allowed" : ""}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </Button>

          {/* Top bar nav – Search and Replay pill replaces "Dashboard" */}
          <nav className="flex items-center gap-.5 text-base font-semibold">
           <Link
              href="/SearchandReplay"
              className="flex items-center gap-1 px-2 py-3 text-primary tracking-wide"
            >
              <span className="text-lg font-semibold">Search and Replay</span>
            </Link>

            {/* QAi logo replaces text label, switches with theme */}
            <Image
              key={isDark ? "qai-dark" : "qai-light"}
              src={isDark ? "/QAi_white.svg" : "/QAi_black.svg"}
              alt="QAi"
              width={32}
              height={16}
              className="h-4 w-auto"
            />
          </nav>
        </div>

        {/* CENTER LOGO */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Image
            key={isDark ? "dark" : "light"}
            src={isDark ? "/Ai-icon_white.svg" : "/Ai-icon_blk.svg"}
            alt="NiCE"
            width={120}
            height={40}
            priority
            className="h-8 w-auto"
          />
        </div>

        {/* RIGHT: notifications, theme toggle, user menu */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
          </Button>

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

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 hover:bg-accent">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{displayName}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/support">Support</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="w-full text-left"
                >
                  Change Password
                </button>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  localStorage.removeItem("access_token")
                  setUser(null)
                  router.push("/auth/login")
                }}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ChangePasswordDrawer
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleChangePassword}
      />
    </header>
  )
}