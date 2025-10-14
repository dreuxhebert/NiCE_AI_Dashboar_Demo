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
    // light: soft green background, dark: stronger green background with readable foreground
    className:
      "bg-green-500/10 text-green-700 dark:bg-green-600/30 dark:text-green-200 hover:dark:bg-green-600/40",
  },
  neutral: {
    label: "Neutral",
    className:
      "bg-gray-500/10 text-gray-700 dark:bg-gray-600/30 dark:text-gray-200 hover:dark:bg-gray-600/40",
  },
  negative: {
    label: "Negative",
    className:
      "bg-red-500/10 text-red-700 dark:bg-red-600/30 dark:text-red-200 hover:dark:bg-red-600/40",
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
