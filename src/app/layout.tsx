import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "NiCE - 911 Call Management Dashboard",
  description:
    "Professional dashboard for managing and reviewing 911 phone call transcripts",
  icons: {
    icon: "/NiCE_SMILE.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <Sidebar />
          <TopNav />
          <main className="ml-64 mt-16 min-h-screen p-6">{children}</main>
          <Toaster />
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
