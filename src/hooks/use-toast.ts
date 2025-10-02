"use client"

import { toast as sonnerToast } from "sonner"

/**
 * Minimal shadcn-style toast hook that forwards to `sonner`.
 * Usage in components:
 *   const { toast } = useToast()
 *   toast("Uploaded!")
 */
export function useToast() {
  return {
    toast: sonnerToast,
  }
}

// Optional: named export for direct imports if you ever want it.
// export const toast = sonnerToast
