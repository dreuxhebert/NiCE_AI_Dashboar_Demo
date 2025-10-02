import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Sentiment = "positive" | "neutral" | "negative"

interface SentimentBadgeProps {
  sentiment: Sentiment
  score?: number
}

const sentimentConfig = {
  positive: {
    label: "Positive",
    className: "bg-green-500/20 text-green-300 hover:bg-green-500/30",
  },
  neutral: {
    label: "Neutral",
    className: "bg-gray-500/20 text-gray-300 hover:bg-gray-500/30",
  },
  negative: {
    label: "Negative",
    className: "bg-red-500/20 text-red-300 hover:bg-red-500/30",
  },
}

export function SentimentBadge({ sentiment, score }: SentimentBadgeProps) {
  const config = sentimentConfig[sentiment]

  return (
    <Badge variant="secondary" className={cn("font-medium", config.className)}>
      {config.label} {score !== undefined && `(${score})`}
    </Badge>
  )
}
