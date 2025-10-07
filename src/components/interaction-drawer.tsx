"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { StatusBadge } from "@/components/status-badge"
import { SentimentBadge } from "@/components/sentiment-badge"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import type { Interaction } from "@/lib/sample-data"
import { ClipboardList, Info, Languages, List, Brain, X, Settings, Save, RotateCcw, Smile } from "lucide-react"

interface InteractionDrawerProps {
  interaction: Interaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

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

interface ScoreItem {
  label: string
  sentiment: "Positive" | "Negative" | "Neutral" | "Mod. Positive" | "Mod. Negative"
  score: number
}

const agentBehaviorScores: ScoreItem[] = [
  { label: "Acknowledge Loyalty", sentiment: "Mod. Negative", score: -3.41 },
  { label: "Active Listening", sentiment: "Negative", score: -3.87 },
  { label: "Be Empathetic", sentiment: "Positive", score: 23.77 },
  { label: "Build Rapport", sentiment: "Neutral", score: -0.05 },
  { label: "Demonstrate Ownership", sentiment: "Mod. Positive", score: 9.27 },
  { label: "Effective Questioning", sentiment: "Neutral", score: 5.7 },
  { label: "Inappropriate Action", sentiment: "Mod. Negative", score: 1.26 },
  { label: "Promote Self Service", sentiment: "Neutral", score: 0.3 },
  { label: "Sentiment", sentiment: "Neutral", score: 2.77 },
  { label: "Set Expectations", sentiment: "Positive", score: 9.74 },
]

const salesEffectivenessScores: ScoreItem[] = [
  { label: "Acknowledge Request", sentiment: "Mod. Positive", score: -0.13 },
  { label: "Ask For The Sale", sentiment: "Mod. Negative", score: -0.03 },
  { label: "Confirmed Sale", sentiment: "Neutral", score: -0.37 },
  { label: "Demonstrate Empathy", sentiment: "Positive", score: 17.82 },
]

type TabType = "summary" | "details" | "scores" | "grading" | "sentiment" | "transcript"

export function InteractionDrawer({ interaction, open, onOpenChange }: InteractionDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabType>("summary")
  const [criteria, setCriteria] = useState<GradingCriterion[]>(initialCriteria)
  const [overallScore, setOverallScore] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    const checkedCriteria = criteria.filter((c) => c.checked)
    const totalWeight = checkedCriteria.reduce((sum, c) => sum + c.weight, 0)
    setOverallScore(totalWeight)
  }, [criteria])

  useEffect(() => {
    if (!open) {
      setActiveTab("summary")
      setCriteria(initialCriteria)
    }
  }, [open])

  if (!interaction) return null

  const handleCheckChange = (id: string, checked: boolean) => {
    setCriteria((prev) => prev.map((criterion) => (criterion.id === id ? { ...criterion, checked } : criterion)))
  }

  const handleNotesChange = (id: string, notes: string) => {
    setCriteria((prev) => prev.map((criterion) => (criterion.id === id ? { ...criterion, notes } : criterion)))
  }

  const handleReset = () => {
    setCriteria(initialCriteria)
    toast({
      title: "Grading reset",
      description: "All criteria have been reset to default",
    })
  }

  const handleSave = () => {
    toast({
      title: "Grading saved",
      description: `Score of ${overallScore}/100 has been saved`,
    })
  }

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

  const parseTranscript = (transcript: string) => {
    const lines = transcript.split("\n")
    return lines.map((line, index) => {
      const match = line.match(/^(Dispatcher|Caller):\s*(.+)$/)
      if (match) {
        return (
          <div key={index} className="mb-6">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-semibold text-primary">{match[1]}</span>
            </div>
            <p className="text-sm leading-relaxed text-foreground">{match[2]}</p>
          </div>
        )
      }
      return null
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
  showCloseButton={false}
  className="p-0 gap-0 overflow-hidden max-w-none"
  style={{
    width: "min(96vw, 1400px)",   // responsive width cap
    maxWidth: "min(96vw, 1400px)",// ensure no shrink issues
    height: "90vh"             // a little taller but still safe
  }}
>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">Ai</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{interaction.fileName}</h2>
              <p className="text-sm text-muted-foreground">Call Analysis</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden min-h-0 min-w-0">
          {/* Left Side - Transcript */}
          <div className="w-[60%] min-w-0 border-r border-border flex flex-col overflow-hidden">
            <div className="border-b border-border bg-muted/30 px-6 py-5 shrink-0">
              <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-base">
                <div>
                  <span className="text-muted-foreground">Duration: </span>
                  <span className="text-foreground font-medium">{interaction.duration}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Silence: </span>
                  <span className="text-foreground font-medium">0%</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Identifier: </span>
                  <span className="text-foreground font-mono text-xs">{interaction.id}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">File: </span>
                  <span className="text-foreground font-medium">{interaction.fileName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Model: </span>
                  <span className="text-foreground font-medium">{interaction.model}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Initial Language: </span>
                  <span className="text-foreground font-medium">{interaction.language}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Detected Language: </span>
                  <span className="text-foreground font-medium">{interaction.language}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-8">
                <h3 className="mb-8 text-base font-semibold text-foreground">Participant One</h3>
                {parseTranscript(interaction.transcript)}
              </div>
            </div>
          </div>

          {/* Right Side - Tabbed Content */}
          <div className="flex w-[40%] min-w-0 flex-col overflow-hidden">
            {/* Tab Header */}
            <div className="border-b border-border bg-muted/30 px-6 py-5 shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-foreground">AI Scores</h3>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>

            
            {/* Tab Icons */}
<div className="flex items-center justify-around border-b border-border bg-muted/20 px-6 py-4 shrink-0">
  <Button
    variant="ghost"
    size="icon"
    className={cn("h-12 w-12 cursor-pointer", activeTab === "summary" && "bg-muted")}
    onClick={() => setActiveTab("summary")}
  >
    <ClipboardList className="h-6 w-6" />
  </Button>
  <Button
    variant="ghost"
    size="icon"
    className={cn("h-12 w-12 cursor-pointer", activeTab === "details" && "bg-muted")}
    onClick={() => setActiveTab("details")}
  >
    <Info className="h-6 w-6" />
  </Button>
  <Button
    variant="ghost"
    size="icon"
    className={cn("h-12 w-12 cursor-pointer", activeTab === "transcript" && "bg-muted")}
    onClick={() => setActiveTab("transcript")}
  >
    <Languages className="h-6 w-6" />
  </Button>
  <Button
    variant="ghost"
    size="icon"
    className={cn("h-12 w-12 cursor-pointer", activeTab === "scores" && "bg-muted")}
    onClick={() => setActiveTab("scores")}
  >
    <List className="h-6 w-6" />
  </Button>
  <Button
    variant="ghost"
    size="icon"
    className={cn("h-12 w-12 cursor-pointer", activeTab === "sentiment" && "bg-muted")}
    onClick={() => setActiveTab("sentiment")}
  >
    <Smile className="h-6 w-6" />
  </Button>
  <Button
    variant="ghost"
    size="icon"
    className={cn("h-12 w-12 cursor-pointer", activeTab === "grading" && "bg-muted")}
    onClick={() => setActiveTab("grading")}
  >
    <Brain className="h-6 w-6" />
  </Button>
</div>


            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-8">
                {/* Summary Tab */}
                {activeTab === "summary" && (
                  <div className="space-y-8">
                    <div>
                      <h4 className="mb-5 text-base font-semibold text-foreground">Call Summary</h4>
                      <p className="text-base leading-relaxed text-muted-foreground">{interaction.summary}</p>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="mb-5 text-base font-semibold text-foreground">Key Points</h4>
                      <ul className="space-y-4 text-base text-muted-foreground">
                        <li className="flex items-start gap-4">
                          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                          <span className="leading-relaxed">Emergency type identified and confirmed</span>
                        </li>
                        <li className="flex items-start gap-4">
                          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                          <span className="leading-relaxed">Caller location obtained successfully</span>
                        </li>
                        <li className="flex items-start gap-4">
                          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                          <span className="leading-relaxed">Professional tone maintained throughout</span>
                        </li>
                        <li className="flex items-start gap-4">
                          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                          <span className="leading-relaxed">Appropriate resources dispatched</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Details Tab */}
                {activeTab === "details" && (
                  <div className="space-y-5">
                    <h4 className="text-base font-semibold text-foreground">Call Metadata</h4>
                    <div className="space-y-5">
                      <div className="flex justify-between items-center">
                        <span className="text-base text-muted-foreground">Dispatcher</span>
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
                        <span className="text-base font-medium text-foreground">{interaction.duration}</span>
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

                {/* Transcript Tab */}
                {activeTab === "transcript" && (
                  <div className="space-y-5">
                    <h4 className="text-base font-semibold text-foreground">Full Transcript</h4>
                    <div className="rounded-lg bg-muted/50 p-6">
                      <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground">
                        {interaction.transcript}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Scores Tab */}
                {activeTab === "scores" && (
                  <div className="space-y-8">
                    <div>
                      <h4 className="mb-5 text-base font-semibold text-foreground">Agent Behavior Score</h4>
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
                              <span
                                className={cn(
                                  "text-base font-medium min-w-[140px] text-right",
                                  getSentimentColor(item.sentiment),
                                )}
                              >
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
                      <h4 className="mb-5 text-base font-semibold text-foreground">Sales Effectiveness</h4>
                      <div className="space-y-4">
                        {salesEffectivenessScores.map((item, index) => (
                          <div key={index} className="flex items-center justify-between py-2">
                            <span className="text-base text-muted-foreground">{item.label}</span>
                            <div className="flex items-center gap-6">
                              <span
                                className={cn(
                                  "text-base font-medium min-w-[140px] text-right",
                                  getSentimentColor(item.sentiment),
                                )}
                              >
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

                {/* Sentiment Tab */}
                {activeTab === "sentiment" && (
                  <div className="space-y-5">
                    <h4 className="text-base font-semibold text-foreground">Sentiment Analysis</h4>
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
                        The conversation shows a {interaction.sentiment} sentiment with a confidence score of{" "}
                        {interaction.sentimentScore}%. The dispatcher maintained a professional and empathetic tone
                        throughout the call.
                      </p>
                    </div>
                  </div>
                )}

                {/* Grading Tab */}
                {activeTab === "grading" && (
                  <div className="space-y-8">
                    <div className="rounded-lg bg-muted/50 p-6">
                      <div className="mb-3 text-base text-muted-foreground">Overall Score</div>
                      <div className="flex items-baseline gap-3">
                        <span className={cn("text-5xl font-bold", getScoreColor(overallScore))}>{overallScore}</span>
                        <span className="text-2xl text-muted-foreground">/100</span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-base font-semibold text-foreground">Grading Criteria</h4>
                      {criteria.map((criterion) => (
                        <div key={criterion.id} className="space-y-4">
                          <div className="flex items-start gap-4">
                            <Checkbox
                              id={criterion.id}
                              checked={criterion.checked}
                              onCheckedChange={(checked) => handleCheckChange(criterion.id, checked as boolean)}
                              className="mt-1.5"
                            />
                            <div className="flex-1">
                              <Label
                                htmlFor={criterion.id}
                                className="flex items-center justify-between text-base font-medium leading-relaxed cursor-pointer"
                              >
                                <span>{criterion.label}</span>
                                <span className="text-base text-muted-foreground ml-3">{criterion.weight} pts</span>
                              </Label>
                            </div>
                          </div>
                          <Textarea
                            placeholder="Add notes..."
                            value={criterion.notes}
                            onChange={(e) => handleNotesChange(criterion.id, e.target.value)}
                            rows={3}
                            className="ml-10 text-base"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button variant="outline" size="default" onClick={handleReset} className="flex-1 bg-transparent">
                        <RotateCcw className="mr-2 h-5 w-5" />
                        Reset
                      </Button>
                      <Button size="default" onClick={handleSave} className="flex-1">
                        <Save className="mr-2 h-5 w-5" />
                        Save
                      </Button>
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