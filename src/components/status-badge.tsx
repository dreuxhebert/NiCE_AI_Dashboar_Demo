import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Status = "queued" | "processing" | "processed" | "failed"

interface StatusBadgeProps {
  status: Status
}

const statusConfig = {
  queued: {
    label: "Queued",
    className:
      "bg-gray-500/10 text-gray-700 dark:bg-gray-600/30 dark:text-gray-200 hover:dark:bg-gray-600/40",
  },
  processing: {
    label: "Processing",
    className:
      "bg-amber-500/10 text-amber-700 dark:bg-amber-600/30 dark:text-amber-200 hover:dark:bg-amber-600/40",
  },
  processed: {
    label: "Processed",
    className:
      "bg-green-500/10 text-green-700 dark:bg-green-600/30 dark:text-green-200 hover:dark:bg-green-600/40",
  },
  failed: {
    label: "Failed",
    className:
      "bg-red-500/10 text-red-700 dark:bg-red-600/30 dark:text-red-200 hover:dark:bg-red-600/40",
  },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge variant="secondary" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  )
}
