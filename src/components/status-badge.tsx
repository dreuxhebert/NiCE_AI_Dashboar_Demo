import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Status = "queued" | "processing" | "processed" | "failed"

interface StatusBadgeProps {
  status: Status
}

const statusConfig = {
  queued: {
    label: "Queued",
    className: "bg-gray-500/20 text-gray-300 hover:bg-gray-500/30",
  },
  processing: {
    label: "Processing",
    className: "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30",
  },
  processed: {
    label: "Processed",
    className: "bg-green-500/20 text-green-300 hover:bg-green-500/30",
  },
  failed: {
    label: "Failed",
    className: "bg-red-500/20 text-red-300 hover:bg-red-500/30",
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
