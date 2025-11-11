"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import LayoutShell from "../layout-shell" // ✅ keep this import

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      router.replace("/auth/login")
      return
    }

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:5001"
    const USE_PROXY = process.env.NEXT_PUBLIC_USE_PROXY === "true"
    const getApiUrl = (path: string) =>
      USE_PROXY ? `/api/proxy${path}` : `${API_BASE}${path}`

    // ✅ Verify token and check admin flag
    fetch(getApiUrl("/auth/me"), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("unauthorized")
        const user = await res.json()
        if (user.is_admin) {
          setAuthorized(true)
        } else {
          router.replace("/dashboard/overview") // non-admins go here
        }
      })
      .catch(() => router.replace("/auth/login"))
      .finally(() => setLoading(false))
  }, [router])

  if (loading) return null // optional loading spinner later

  return authorized ? <LayoutShell>{children}</LayoutShell> : null
}