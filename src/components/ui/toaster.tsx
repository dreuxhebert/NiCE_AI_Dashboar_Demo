"use client"

import * as React from "react"
import { Toaster as SonnerToaster } from "sonner"

/**
 * Wrapper so the app can import `@/components/ui/toaster`
 * without caring which toast lib we use under the hood.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      expand
      theme="system"
    />
  )
}

export default Toaster
