"use client"

// src/hooks/use-toast.ts
import { toast as sonnerToast, type ExternalToast } from "sonner"

type ShadcnToastInput = {
  title?: string
  description?: string
  // keep room for future fields if you add them later:
  duration?: number
  action?: React.ReactNode
  // etc.
}

export function useToast() {
  const toast = (input: ShadcnToastInput) => {
    const message = input.title ?? "" // shadcn uses title as the main line
    const options: ExternalToast = {
      description: input.description,
      duration: input.duration,
      // Sonner doesn't support arbitrary React children as "action" in the same way,
      // so keep it minimal unless you add a custom renderer.
    }
    return sonnerToast(message, options)
  }

  return { toast }
}

// If you also export a Toaster component via "@/components/ui/toaster",
// just ensure it's rendering Sonner's <Toaster /> (see below).
