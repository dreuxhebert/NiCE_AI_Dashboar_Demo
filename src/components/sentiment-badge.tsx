import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Sentiment = "positive" | "neutral" | "negative"

interface SentimentBadgeProps {
  // allow any string coming from backend / UI
  sentiment?: string | null
  score?: number
}

const sentimentConfig: Record<Sentiment, { label: string; className: string }> = {
  positive: {
    label: "Positive",
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

// Turn things like "Mod. Positive", "Strongly Negative", etc. into our 3 buckets
function normalizeSentiment(raw?: string | null): Sentiment {
  const s = (raw || "").toLowerCase().trim()

  if (!s) return "neutral"

  if (s.includes("pos")) {
    // matches "positive", "mod. positive", "strongly positive", etc.
    return "positive"
  }

  if (s.includes("neg")) {
    // matches "negative", "mod. negative", "strongly negative", etc.
    return "negative"
  }

  // "neutral", unknown strings, or anything else -> neutral
  return "neutral"
}

export function SentimentBadge({ sentiment, score }: SentimentBadgeProps) {
  const normalized = normalizeSentiment(sentiment)
  const config = sentimentConfig[normalized]

  return (
    <Badge variant="secondary" className={cn("font-medium", config.className)}>
      {config.label} {typeof score === "number" && `(${score})`}
    </Badge>
  )
}