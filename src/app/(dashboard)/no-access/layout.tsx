import type { ReactNode } from "react"

export default function NoAccessLayout({ children }: { children: ReactNode }) {
  return children; // no sidebar, no nav, no LayoutShell
}