import type { ReactNode } from "react"
import LayoutShell from "../layout-shell" // same component you were using before

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <LayoutShell>{children}</LayoutShell>
}
