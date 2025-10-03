// src/hooks/use-toast.ts
"use client"

import { toast as sonnerToast, type ExternalToast } from "sonner"

type Variant =
  | "default"
  | "destructive"
  | "success"
  | "warning"
  | "info"

type ShadcnToastInput = {
  title?: string
  description?: string
  variant?: Variant
  duration?: number
  // you can add fields later as needed (e.g., action), they’ll be ignored by Sonner unless mapped
}

export function useToast() {
  const toast = (input: ShadcnToastInput) => {
    const message = input.title ?? ""
    const options: ExternalToast = {
      description: input.description,
      duration: input.duration,
    }

    // Map shadcn-style variants to Sonner
    switch (input.variant) {
      case "destructive":
        return sonnerToast.error(message, options)
      case "success":
        return sonnerToast.success(message, options)
      case "warning":
        return sonnerToast.warning?.(message, options) ?? sonnerToast(message, options)
      case "info":
        return sonnerToast.info?.(message, options) ?? sonnerToast(message, options)
      default:
        return sonnerToast(message, options)
    }
  }

  return { toast }
}
