"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/status-badge"
import { SentimentBadge } from "@/components/sentiment-badge"
import { Separator } from "@/components/ui/separator"
import type { Interaction } from "@/lib/sample-data"

interface InteractionDrawerProps {
  interaction: Interaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InteractionDrawer({ interaction, open, onOpenChange }: InteractionDrawerProps) {
  if (!interaction) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">{interaction.fileName}</SheetTitle>
          <SheetDescription>Call details and transcript</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Metadata */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Call Metadata</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Dispatcher</p>
                <p className="text-sm font-medium text-foreground">{interaction.dispatcher}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Call Type</p>
                <Badge variant="outline">{interaction.callType}</Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Language</p>
                <p className="text-sm font-medium text-foreground">{interaction.language}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Model</p>
                <p className="text-sm font-medium text-foreground">{interaction.model}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-sm font-medium text-foreground">{interaction.duration}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <StatusBadge status={interaction.status} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Submitted</p>
                <p className="text-sm font-medium text-foreground">{interaction.submitted}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Processed</p>
                <p className="text-sm font-medium text-foreground">{interaction.processed}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sentiment</p>
                <SentimentBadge sentiment={interaction.sentiment} score={interaction.sentimentScore} />
              </div>
              {interaction.gradeScore && (
                <div>
                  <p className="text-xs text-muted-foreground">Grade Score</p>
                  <p className="text-sm font-medium text-foreground">{interaction.gradeScore}/100</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Summary */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Summary</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{interaction.summary}</p>
          </div>

          <Separator />

          {/* Transcript */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Full Transcript</h3>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground">
                {interaction.transcript}
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
