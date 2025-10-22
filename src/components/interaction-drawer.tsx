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
  AlertCircle,
  XCircle,
  MinusCircle,
  ChevronDown,
  ChevronUp,
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

// --- QA Evaluation ---
interface QAQuestion {
  id: string
  question: string
  result: "Yes" | "No" | "Refused"
  confidence: number
  evidence: string
  category: string
}

const qaEvaluationData: QAQuestion[] = [
  // hardcoded data for display for you to remove
  {
    id: "location",
    question: "Was the location of the incident obtained?",
    result: "Yes",
    confidence: 95,
    evidence: "Operator: 'Can you tell me your exact address?' Caller: '123 Main Street, apartment 4B'",
    category: "All Call Interrogation",
  },
  {
    id: "phone",
    question: "Was the phone number verified?",
    result: "Yes",
    confidence: 88,
    evidence: "Operator: 'What's the best callback number?' Caller: '555-0123'",
    category: "All Call Interrogation",
  },
  {
    id: "emergency",
    question: "Was the nature of the emergency determined?",
    result: "Yes",
    confidence: 98,
    evidence: "Operator: 'What's your emergency?' Caller: 'My friend is having chest pain'",
    category: "All Call Interrogation",
  },
  {
    id: "name",
    question: "Was the caller's name gathered?",
    result: "Yes",
    confidence: 92,
    evidence: "Operator: 'Can I have your name please?' Caller: 'Rachel Johnson'",
    category: "All Call Interrogation",
  },
  {
    id: "safety",
    question: "Were safety concerns assessed?",
    result: "Yes",
    confidence: 85,
    evidence: "Operator: 'Is the scene safe? Are there any weapons or threats?' Caller: 'Yes, it's safe'",
    category: "All Call Interrogation",
  },
  {
    id: "callback",
    question: "Was callback information confirmed?",
    result: "Yes",
    confidence: 90,
    evidence: "Operator: 'I have your number as 555-0123, is that correct?' Caller: 'Yes, that's right'",
    category: "All Call Interrogation",
  },
  {
    id: "responders",
    question: "Were responders appropriately notified?",
    result: "Yes",
    confidence: 100,
    evidence: "Operator: 'I'm sending paramedics to your location now'",
    category: "All Call Interrogation",
  },
]

// --- Tabs ---
type TabType =
  | "summary"
  | "details"
  | "scores"
  | "grading"
  | "sentiment"
  | "transcript"
  | "qa-evaluation"

export function InteractionDrawer({ interaction, open, onOpenChange, logoUrl }: InteractionDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabType>("summary")
  const [criteria, setCriteria] = useState<GradingCriterion[]>(initialCriteria)
  const [overallScore, setOverallScore] = useState(0)
  const [qaQuestions, setQaQuestions] = useState<QAQuestion[]>(qaEvaluationData)
  const [hasQaChanges, setHasQaChanges] = useState(false)
  const [expandedEvidence, setExpandedEvidence] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  // --- Effects ---
  useEffect(() => {
    const checkedCriteria = criteria.filter((c) => c.checked)
    const totalWeight = checkedCriteria.reduce((sum, c) => sum + c.weight, 0)
    setOverallScore(totalWeight)
  }, [criteria])

  useEffect(() => {
    if (!open) {
      setActiveTab("summary")
      setCriteria(initialCriteria)
      setQaQuestions(qaEvaluationData)
      setHasQaChanges(false)
      setExpandedEvidence(new Set())
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

  const handleQaResultChange = (id: string, newResult: "Yes" | "No" | "Refused") => {
    setQaQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, result: newResult } : q)))
    setHasQaChanges(true)
  }

  const toggleEvidence = (id: string) => {
    setExpandedEvidence((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  const handleSaveQaChanges = () => {
    // Hook for DB save/patch if needed
    toast({ title: "QA Evaluation saved", description: "Manual overrides have been saved successfully" })
    setHasQaChanges(false)
  }

  const handleResetQaChanges = () => {
    setQaQuestions(qaEvaluationData)
    setHasQaChanges(false)
    setExpandedEvidence(new Set())
    toast({ title: "QA Evaluation reset", description: "All changes have been reverted to AI evaluation" })
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

  const parseTranscript = (transcript: string) => {
  const lines = transcript.split("\n")
  return lines.map((line, index) => {
    const match = line.match(/^(Dispatcher|Caller):\s*(.+)$/)
    if (match) {
      return (
        <div key={index} className="mb-5">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-xs font-semibold text-primary">
              {match[1] === "Dispatcher" ? "Operator" : match[1]}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-foreground">{match[2]}</p>
        </div>
      )
    }
    return null
  })
}

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-400"
    if (confidence >= 75) return "text-amber-400"
    return "text-red-400"
  }

  const isQaEvaluationActive = activeTab === "qa-evaluation"
  const leftPanelWidth = isQaEvaluationActive ? "w-[40%]" : "w-[60%]"
  const rightPanelWidth = isQaEvaluationActive ? "w-[60%]" : "w-[40%]"

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
                src={logoUrl || "/NiCE_SMILE.svg"}
                alt="Company Logo"
                className="h-8 w-8 object-contain"
              />
            </div>

            <div className="space-y-0.5">
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                {interaction.fileName}
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
              <div className="grid grid-cols-2 gap-3">
                {/* Duration Card */}
                <div className="rounded-xl bg-background/60 backdrop-blur-sm border border-border p-3 hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <svg className="h-4.5 w-4.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground font-medium mb-0.5">Duration</p>
                      <p className="text-sm font-bold text-foreground">{interaction.duration}</p>
                    </div>
                  </div>
                </div>

                {/* Model Card */}
                <div className="rounded-xl bg-background/60 backdrop-blur-sm border border-border p-3 hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Brain className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground font-medium mb-0.5">AI Model</p>
                      <p className="text-sm font-bold text-foreground">{interaction.model}</p>
                    </div>
                  </div>
                </div>

                {/* Language Card */}
                <div className="rounded-xl bg-background/60 backdrop-blur-sm border border-border p-3 hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Languages className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground font-medium mb-0.5">Language</p>
                      <p className="text-sm font-bold text-foreground">{interaction.language}</p>
                    </div>
                  </div>
                </div>

                {/* ID Card */}
                <div className="rounded-xl bg-background/60 backdrop-blur-sm border border-border p-3 hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <svg className="h-4.5 w-4.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-muted-foreground font-medium mb-0.5">Call ID</p>
                      <p className="text-[11px] font-mono font-bold text-foreground truncate">{String(interaction.id).slice(0, 12)}...</p>
                    </div>
                  </div>
                </div>
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

              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-xl transition-all duration-200 hover:scale-110 hover:bg-primary/5",
                  activeTab === "qa-evaluation" &&
                    "bg-primary/15 text-primary border-2 border-primary/30 shadow-lg shadow-primary/10 scale-105",
                )}
                onClick={() => setActiveTab("qa-evaluation")}
              >
                <CheckCircle className="h-5 w-5" />
              </Button>

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

              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-xl transition-all duration-200 hover:scale-110 hover:bg-primary/5",
                  activeTab === "grading" &&
                    "bg-primary/15 text-primary border-2 border-primary/30 shadow-lg shadow-primary/10 scale-105",
                )}
                onClick={() => setActiveTab("grading")}
              >
                <Brain className="h-5 w-5" />
              </Button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              <div className={cn("px-8 py-8", activeTab === "qa-evaluation" && "px-6 py-5")}>
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

                {/* QA Evaluation (compact) */}
                {activeTab === "qa-evaluation" && (
                  <div className="space-y-3">
                    <div className="rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/30 p-2.5 shadow-md shadow-primary/5">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-primary" />
                        </div>
                        <h4 className="text-base font-bold text-foreground">APCO/NENA QA Evaluation</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1.5 leading-relaxed">
                        Automated evaluation based on ANS 1.107.1-2015 standards
                      </p>
                      <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900/50">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span className="font-medium">Click buttons to override AI evaluations</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {qaQuestions.map((qa) => (
                        <div
                          key={qa.id}
                          className="rounded-lg border border-border/50 bg-gradient-to-br from-card to-card/50 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all duration-200"
                        >
                          <div className="flex items-center justify-between gap-3 p-2.5">
                            {/* bumped from text-xs → text-sm */}
                            <p className="text-sm font-medium text-foreground leading-relaxed flex-1">{qa.question}</p>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* buttons bumped to text-sm, h-8, wider widths */}
                              <Button
                                size="sm"
                                variant={qa.result === "Yes" ? "default" : "outline"}
                                className={cn(
                                  "h-8 w-20 rounded-md text-sm font-semibold transition-all",
                                  qa.result === "Yes" &&
                                    "bg-green-600 hover:bg-green-700 border-green-600 shadow-sm shadow-green-600/20",
                                )}
                                onClick={() => handleQaResultChange(qa.id, "Yes")}
                              >
                                Yes
                              </Button>
                              <Button
                                size="sm"
                                variant={qa.result === "No" ? "default" : "outline"}
                                className={cn(
                                  "h-8 w-20 rounded-md text-sm font-semibold transition-all",
                                  qa.result === "No" &&
                                    "bg-red-600 hover:bg-red-700 border-red-600 shadow-sm shadow-red-600/20",
                                )}
                                onClick={() => handleQaResultChange(qa.id, "No")}
                              >
                                No
                              </Button>
                              <Button
                                size="sm"
                                variant={qa.result === "Refused" ? "default" : "outline"}
                                className={cn(
                                  "h-8 w-24 rounded-md text-sm font-semibold transition-all",
                                  qa.result === "Refused" &&
                                    "bg-gray-600 hover:bg-gray-700 border-gray-600 shadow-sm shadow-gray-600/20",
                                )}
                                onClick={() => handleQaResultChange(qa.id, "Refused")}
                              >
                                Refused
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 rounded-md hover:bg-muted transition-all"
                                onClick={() => toggleEvidence(qa.id)}
                              >
                                {expandedEvidence.has(qa.id) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {expandedEvidence.has(qa.id) && (
                            <div className="border-t border-border/50 p-2.5 space-y-2 bg-muted/20">
                              <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-background/60">
                                <span className="text-xs text-muted-foreground font-medium">AI Confidence:</span>
                                <span className={cn("text-xs font-bold", getConfidenceColor(qa.confidence))}>
                                  {qa.confidence}%
                                </span>
                                <div className="flex-1 h-1 overflow-hidden rounded-full bg-muted ml-2">
                                  <div
                                    className={cn(
                                      "h-full transition-all duration-500",
                                      qa.confidence >= 90
                                        ? "bg-green-500"
                                        : qa.confidence >= 75
                                          ? "bg-amber-500"
                                          : "bg-red-500",
                                    )}
                                    style={{ width: `${qa.confidence}%` }}
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                  <AlertCircle className="h-3.5 w-3.5" />
                                  <span>Evidence from Transcript:</span>
                                </div>
                                <div className="rounded-md bg-background/80 p-2 border-l-2 border-primary/50">
                                  <p className="text-xs leading-relaxed text-foreground italic">{qa.evidence}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 p-2.5 mt-2 shadow-md">
                      <div className="flex items-center justify-between mb-1.5">
                        <h5 className="text-sm font-bold text-foreground">Overall Compliance</h5>
                        <Badge variant="default" className="text-xs px-3 py-0.5 rounded-lg font-bold shadow-md">
                          {qaQuestions.filter((q) => q.result === "Yes").length} / {qaQuestions.length}
                        </Badge>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted shadow-inner mb-1.5">
                        <div
                          className="h-full bg-gradient-to-r from-primary via-primary/80 to-green-500 shadow-sm transition-all duration-500"
                          style={{
                            width: `${(qaQuestions.filter((q) => q.result === "Yes").length / qaQuestions.length) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        This call meets{" "}
                        <span className="font-bold text-foreground">
                          {((qaQuestions.filter((q) => q.result === "Yes").length / qaQuestions.length) * 100).toFixed(0)}%
                        </span>{" "}
                        of APCO/NENA standards.
                      </p>
                    </div>

                    {hasQaChanges && (
                      <div className="flex gap-2 pt-2 sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent backdrop-blur-sm border-t border-border/50 -mx-6 px-6 py-2.5 shadow-xl">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleResetQaChanges}
                          className="flex-1 h-9 rounded-lg text-xs font-semibold hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all bg-transparent"
                        >
                          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                          Reset
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveQaChanges}
                          className="flex-1 h-9 rounded-lg text-xs font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
                        >
                          <Save className="mr-1.5 h-3.5 w-3.5" />
                          Save
                        </Button>
                      </div>
                    )}
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

                {/* Transcript */}
                {activeTab === "transcript" && (
                  <div className="space-y-5">
                    <h4 className="text-base font-semibold text-foreground flex items-center gap-2">
                      <Languages className="h-5 w-5 text-primary" />
                      Full Transcript
                    </h4>
                    <div className="rounded-lg bg-muted/50 p-6">
                      <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground">
                        {interaction.transcript}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Scores */}
                {activeTab === "scores" && (
                  <div className="space-y-8">
                    <div>
                      <h4 className="mb-5 text-base font-semibold text-foreground flex items-center gap-2">
                        <List className="h-5 w-5 text-primary" />
                        Agent Behavior Score
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
                        Sales Effectiveness
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

                {/* Grading */}
                {activeTab === "grading" && (
                  <div className="space-y-8">
                    <div className="rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 p-6">
                      <div className="mb-3 text-base text-muted-foreground">Overall Score</div>
                      <div className="flex items-baseline gap-3">
                        <span className={cn("text-5xl font-bold", getScoreColor(overallScore))}>{overallScore}</span>
                        <span className="text-2xl text-muted-foreground">/100</span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-base font-semibold text-foreground flex items-center gap-2">
                        <List className="h-5 w-5 text-primary" />
                        Grading Criteria
                      </h4>
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
                              <Label htmlFor={criterion.id} className="flex items-center justify-between text-base font-medium leading-relaxed cursor-pointer">
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