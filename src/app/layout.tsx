// app/layout.tsx
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "NiCE - 911 Call Management Dashboard",
  description: "Professional dashboard for managing and reviewing 911 phone call transcripts",
  icons: { icon: "/NiCE_SMILE.svg" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
