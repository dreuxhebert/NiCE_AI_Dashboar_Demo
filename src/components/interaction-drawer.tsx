"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { StatusBadge } from "@/components/status-badge"
import { SentimentBadge } from "@/components/sentiment-badge"
import { AudioPlayerWithWaveform } from "@/components/audio-player-with-waveform"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import image from "@/components/callLogo.png"
import {
  ClipboardList,
  Info,
  Languages,
  List,
  Brain,
  X,
  Settings,
  Save,
  RotateCcw,
  Smile,
  CheckCircle,
  Volume2,
} from "lucide-react"

// --- Props ---
interface InteractionDrawerProps {
  interaction: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
  logoUrl?: string
}

// --- Grading ---
interface GradingCriterion {
  id: string
  label: string
  checked: boolean
  notes: string
  weight: number
}

const initialCriteria: GradingCriterion[] = [
  { id: "address", label: "Captured Caller Address", checked: false, notes: "", weight: 20 },
  { id: "name", label: "Captured Caller Name", checked: false, notes: "", weight: 15 },
  { id: "callType", label: "Confirmed Call Type", checked: false, notes: "", weight: 20 },
  { id: "tone", label: "Maintained Professional Tone", checked: false, notes: "", weight: 15 },
  { id: "clarity", label: "Clear Communication", checked: false, notes: "", weight: 15 },
  { id: "response", label: "Appropriate Response Time", checked: false, notes: "", weight: 15 },
]

// --- Scores ---
interface ScoreItem {
  label: string
  sentiment: "Positive" | "Negative" | "Neutral" | "Mod. Positive" | "Mod. Negative"
  score: number
}

const agentBehaviorScores: ScoreItem[] = [
  { label: "Listens and Comprehends", sentiment: "Negative", score: -3.87 },
  { label: "Be Empathetic", sentiment: "Positive", score: 23.77 },
  { label: "Build Rapport", sentiment: "Neutral", score: -0.05 },
  { label: "Takes control of call using good judgment", sentiment: "Mod. Positive", score: 9.27 },
  { label: "Effective Questioning", sentiment: "Neutral", score: 5.7 },
  { label: "Inappropriate Action", sentiment: "Mod. Negative", score: 1.26 },
  { label: "Proper tone of voice used", sentiment: "Neutral", score: 2.77 },
  { label: "Professional language used", sentiment: "Positive", score: 9.74 },
]

const salesEffectivenessScores: ScoreItem[] = [
  { label: "Acknowledge Request for Service", sentiment: "Mod. Positive", score: -0.13 },
  { label: "Request Critical Information", sentiment: "Mod. Negative", score: -0.03 },
  { label: "Confirm Dispatch/Assistance", sentiment: "Neutral", score: -0.37 },
  { label: "Demonstrate Empathy and Support", sentiment: "Positive", score: 17.82 },
]
// --- Tabs ---
type TabType =
  | "summary"
  | "details"
  | "scores"
  | "grading"
  | "sentiment"
  | "transcript"
  | "audio-player"

export function InteractionDrawer({ interaction, open, onOpenChange, logoUrl }: InteractionDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabType>("summary")
  const [criteria, setCriteria] = useState<GradingCriterion[]>(initialCriteria)
  const [overallScore, setOverallScore] = useState(0)
  const { toast } = useToast()

  // --- Effects ---
  useEffect(() => {
    const checkedCriteria = criteria.filter((c) => c.checked)
    const totalWeight = checkedCriteria.reduce((sum, c) => sum + c.weight, 0)
    setOverallScore(totalWeight)
  }, [criteria])

  const calTime = (givenTime?: number) => {
    const time_sec = givenTime ?? 0;

    if (time_sec < 60) {
      return `${time_sec}s`;
    }

    if (time_sec < 3600) {
      const min = Math.floor(time_sec / 60);
      const sec = time_sec % 60;
      return `${min}m ${sec}s`;
    }

    const hr = Math.floor(time_sec / 3600);
    const min = Math.floor((time_sec % 3600) / 60);
    return `${hr}h ${min}m`;
  };

  useEffect(() => {
    if (!open) {
      setActiveTab("summary")
      setCriteria(initialCriteria)
    }
  }, [open])

  if (!interaction) return null

  // --- Handlers ---
  const handleCheckChange = (id: string, checked: boolean) => {
    setCriteria((prev) => prev.map((criterion) => (criterion.id === id ? { ...criterion, checked } : criterion)))
  }

  const handleNotesChange = (id: string, notes: string) => {
    setCriteria((prev) => prev.map((criterion) => (criterion.id === id ? { ...criterion, notes } : criterion)))
  }

  const handleReset = () => {
    setCriteria(initialCriteria)
    toast({ title: "Grading reset", description: "All criteria have been reset to default" })
  }

  const handleSave = () => {
    toast({ title: "Grading saved", description: `Score of ${overallScore}/100 has been saved` })
  }



  // --- Utils ---
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "Positive":
        return "text-green-400"
      case "Mod. Positive":
        return "text-green-300"
      case "Negative":
        return "text-red-400"
      case "Mod. Negative":
        return "text-red-300"
      default:
        return "text-muted-foreground"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-amber-400"
    return "text-red-400"
  }

  // Parse the transcript and split long speaker lines into smaller "bubbles" of words
  // chunkSize controls how many words per bubble
  const parseTranscript = (transcript: string, chunkSize = 30) => {
    if (!transcript) return null

    const lines = transcript.split("\n")
    return lines.map((line, index) => {
      const match = line.match(/^(Dispatcher|Caller):\s*(.+)$/)
      let speaker = null
      let text = line
      if (match) {
        speaker = match[1]
        text = match[2]
      }

      const words = String(text || "").trim().split(/\s+/).filter(Boolean)
      const chunks: string[] = []
      for (let i = 0; i < words.length; i += chunkSize) {
        chunks.push(words.slice(i, i + chunkSize).join(" "))
      }

      const isDispatcher = speaker === "Dispatcher"
      const speakerLabel = speaker ? (speaker === "Dispatcher" ? "Operator" : speaker) : null

      return (
        <div key={index} className="mb-4">
          {speakerLabel && (
            <div className="mb-1.5 flex items-center gap-2">
              <span className="text-xs font-semibold text-primary">{speakerLabel}</span>
            </div>
          )}

          <div className={cn("flex flex-col gap-2", isDispatcher ? "items-start" : "items-end")}>
            {chunks.length > 0 ? (
              chunks.map((chunk, ci) => (
                <div key={ci} className={cn("flex flex-col mb-2 last:mb-0", isDispatcher ? "items-start" : "items-end")}>
                  <div
                    className={cn(
                      "max-w-[82%] px-3 py-2 rounded-lg text-sm leading-relaxed",
                      // left = dispatcher/operator, right = caller
                      isDispatcher
                        ? "bg-muted/30 text-foreground border border-border"
                        : "bg-primary/10 text-foreground border border-primary/20"
                    )}
                  >
                    {chunk}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">{text}</div>
            )}
          </div>
        </div>
      )
    })
  }

  const isAudioPlayerActive = activeTab === "audio-player"
  const leftPanelWidth = isAudioPlayerActive ? "w-[40%]" : "w-[60%]"
  const rightPanelWidth = isAudioPlayerActive ? "w-[60%]" : "w-[40%]"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="p-0 gap-0 overflow-hidden max-w-none"
        style={{ width: "min(96vw, 1400px)", maxWidth: "min(96vw, 1400px)", height: "90vh" }}
      >
        {/* Header (compact, plain logo) */}
        <div className="relative flex items-center justify-between border-b border-border px-6 py-4 shrink-0 bg-gradient-to-r from-background via-muted/30 to-background overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl">
              <img
                src={logoUrl || "/callLogo.png"}
                alt="Company Logo"
                className="h-8 w-8 object-contain"
              />
            </div>

            <div className="space-y-0.5">
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                {interaction.call_id}
              </h2>
              <p className="text-xs text-muted-foreground font-medium">
                Call Analysis & Quality Assurance
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="relative z-10 h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Left Side - Transcript / Info */}
          <div className={cn("border-r border-border flex flex-col overflow-hidden transition-all duration-300", leftPanelWidth)}>
            <div className="border-b border-border bg-gradient-to-br from-muted/50 via-muted/30 to-background px-6 py-4 shrink-0">
              {/* ---------------------------------------------------------------------------------------------------------------------------------------------------------------- */}
              {/* Audio Player */}
              <div className="rounded-lg bg-muted/1 p-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong>Audio Player:</strong> Play the call recording at any point in time by clicking over the audio track.
                  </p>
                </div>
              <div className="space-y-4">
                <AudioPlayerWithWaveform
                  audioUrl={`/calls/audio/${interaction.call_id}`}
                  fileName={interaction.call_id}
                  className="space-y-4"
                  callDuration={interaction.duration_seconds}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="h-7 w-1 rounded-full bg-gradient-to-b from-primary to-primary/50" />
                  <h3 className="text-base font-bold text-foreground">Call Transcript</h3>
                </div>
                <div className="space-y-5">{parseTranscript(interaction.transcript)}</div>
              </div>
            </div>
          </div>

          {/* Right Side - Tabs */}
          <div className={cn("flex flex-col overflow-hidden transition-all duration-300", rightPanelWidth)}>
            {/* Tab Header (compact) */}
            <div className="border-b border-border bg-gradient-to-br from-muted/50 via-muted/30 to-background px-6 py-4 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Brain className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">AI Analysis</h3>
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-muted transition-all">
                  <Settings className="h-4.5 w-4.5" />
                </Button>
              </div>
            </div>

            {/* Tab Icons (smaller) */}
            <div className="flex items-center justify-around border-b border-border bg-muted/20 px-4 py-3 shrink-0">
              {/* Summary */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-xl transition-all duration-200 hover:scale-110 hover:bg-primary/5",
                  activeTab === "summary" &&
                    "bg-primary/15 text-primary border-2 border-primary/30 shadow-lg shadow-primary/10 scale-105",
                )}
                onClick={() => setActiveTab("summary")}
              >
                <ClipboardList className="h-5 w-5" />
              </Button>

              {/* Scores */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-xl transition-all duration-200 hover:scale-110 hover:bg-primary/5",
                  activeTab === "scores" &&
                    "bg-primary/15 text-primary border-2 border-primary/30 shadow-lg shadow-primary/10 scale-105",
                )}
                onClick={() => setActiveTab("scores")}
              >
                <List className="h-5 w-5" />
              </Button>

              {/* Sentiment */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-xl transition-all duration-200 hover:scale-110 hover:bg-primary/5",
                  activeTab === "sentiment" &&
                    "bg-primary/15 text-primary border-2 border-primary/30 shadow-lg shadow-primary/10 scale-105",
                )}
                onClick={() => setActiveTab("sentiment")}
              >
                <Smile className="h-5 w-5" />
              </Button>

              {/* Details (moved to last) */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-xl transition-all duration-200 hover:scale-110 hover:bg-primary/5",
                  activeTab === "details" &&
                    "bg-primary/15 text-primary border-2 border-primary/30 shadow-lg shadow-primary/10 scale-105",
                )}
                onClick={() => setActiveTab("details")}
              >
                <Info className="h-5 w-5" />
              </Button>
            </div>


            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              <div className={cn("px-8 py-8", activeTab === "audio-player" && "px-6 py-5")}>
                {/* Summary */}
                {activeTab === "summary" && (
                  <div className="space-y-6">
                    <div className="rounded-2xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border border-primary/20 p-5">
                      <h4 className="mb-3 text-base font-bold text-foreground flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        Call Summary
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">{interaction.summary}</p>
                    </div>

                    <Separator className="bg-border/50" />

                    <div>
                      <h4 className="mb-4 text-base font-bold text-foreground flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        Key Points
                      </h4>
                      <ul className="space-y-3 text-sm text-muted-foreground">
                        {[
                          "Emergency type identified and confirmed",
                          "Caller location obtained successfully",
                          "Professional tone maintained throughout",
                          "Appropriate resources dispatched",
                        ].map((kp) => (
                          <li key={kp} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors">
                            <div className="mt-0.5 h-5 w-5 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                              <CheckCircle className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="leading-relaxed">{kp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Details */}
                {activeTab === "details" && (
                  <div className="space-y-5">
                    <h4 className="text-base font-semibold text-foreground flex items-center gap-2">
                      <Info className="h-5 w-5 text-primary" />
                      Call Metadata
                    </h4>
                    <div className="space-y-5">
                      <div className="flex justify-between items-center">
                        <span className="text-base text-muted-foreground">Operator</span>
                        <span className="text-base font-medium text-foreground">{interaction.dispatcher}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-base text-muted-foreground">Call Type</span>
                        <Badge variant="outline" className="text-sm">
                          {interaction.callType}
                        </Badge>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-base text-muted-foreground">Language</span>
                        <span className="text-base font-medium text-foreground">{interaction.language}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-base text-muted-foreground">Model</span>
                        <span className="text-base font-medium text-foreground">{interaction.model}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-base text-muted-foreground">Duration</span>
                        <span className="text-base font-medium text-foreground">{calTime(interaction?.duration_seconds)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-base text-muted-foreground">Status</span>
                        <StatusBadge status={interaction.status} />
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-base text-muted-foreground">Submitted</span>
                        <span className="text-base font-medium text-foreground">{interaction.submitted}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-base text-muted-foreground">Processed</span>
                        <span className="text-base font-medium text-foreground">{interaction.processed}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Transcript */}
                {activeTab === "transcript" && (
                  <div className="space-y-5">
                    <h4 className="text-base font-semibold text-foreground flex items-center gap-2">
                      <Languages className="h-5 w-5 text-primary" />
                      Full Transcript
                    </h4>
                    <div className="rounded-lg bg-muted/50 p-6">
                      <div className="space-y-4 text-sm text-foreground">{parseTranscript(interaction.transcript)}</div>
                    </div>
                  </div>
                )}

                {/* Scores */}
                {activeTab === "scores" && (
                  <div className="space-y-8">
                    <div>
                      <h4 className="mb-5 text-base font-semibold text-foreground flex items-center gap-2">
                        <List className="h-5 w-5 text-primary" />
                         Telephone Skills
                      </h4>
                      <div className="mb-6 rounded-lg bg-muted/50 p-6">
                        <div className="flex items-baseline gap-3">
                          <span className="text-4xl font-bold text-foreground">54</span>
                          <span className="text-base text-muted-foreground">/ 100</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {agentBehaviorScores.map((item, index) => (
                          <div key={index} className="flex items-center justify-between py-2">
                            <span className="text-base text-muted-foreground">{item.label}</span>
                            <div className="flex items-center gap-6">
                              <span className={cn("text-base font-medium min-w-[140px] text-right", getSentimentColor(item.sentiment))}>
                                {item.sentiment}
                              </span>
                              <span className="w-16 text-right font-mono text-base text-foreground">{item.score}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="mb-5 text-base font-semibold text-foreground flex items-center gap-2">
                        <List className="h-5 w-5 text-primary" />
                       Call Performance Review
                      </h4>
                      <div className="space-y-4">
                        {salesEffectivenessScores.map((item, index) => (
                          <div key={index} className="flex items-center justify-between py-2">
                            <span className="text-base text-muted-foreground">{item.label}</span>
                            <div className="flex items-center gap-6">
                              <span className={cn("text-base font-medium min-w-[140px] text-right", getSentimentColor(item.sentiment))}>
                                {item.sentiment}
                              </span>
                              <span className="w-16 text-right font-mono text-base text-foreground">{item.score}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sentiment */}
                {activeTab === "sentiment" && (
                  <div className="space-y-5">
                    <h4 className="text-base font-semibold text-foreground flex items-center gap-2">
                      <Smile className="h-5 w-5 text-primary" />
                      Sentiment Analysis
                    </h4>
                    <div className="rounded-lg bg-muted/50 p-8">
                      <div className="mb-8 flex items-center justify-between">
                        <span className="text-base text-muted-foreground">Overall Sentiment</span>
                        <SentimentBadge sentiment={interaction.sentiment} score={interaction.sentimentScore} />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <div className="mb-3 flex justify-between text-base">
                            <span className="text-muted-foreground">Confidence</span>
                            <span className="text-foreground font-medium">{interaction.sentimentScore}%</span>
                          </div>
                          <div className="h-3 overflow-hidden rounded-full bg-muted">
                            <div className="h-full bg-primary" style={{ width: `${interaction.sentimentScore}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4 text-base">
                      <p className="leading-relaxed text-muted-foreground">
                        The conversation shows a {interaction.sentiment} sentiment with a confidence score of {interaction.sentimentScore}%.
                        The operator maintained a professional and empathetic tone throughout the call.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}