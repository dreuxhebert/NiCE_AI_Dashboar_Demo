"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { evaluations, type Evaluation } from "@/lib/sample-data"
import {
  FileDown,
  Sparkles,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Play,
  Pause,
  Volume2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export default function EvaluationsPage() {
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation>(evaluations[0])
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [showTable, setShowTable] = useState(true) // NEW: collapse control
  const { toast } = useToast()
  const router = useRouter()

  const [qaResults, setQaResults] = useState({
    location: "yes",
    phoneNumber: "yes",
    emergencyNature: "yes",
    callerName: "no",
    safetyConcerns: "yes",
    callbackInfo: "no",
    respondersNotified: "yes",
  })

  const toggleQuestion = (index: number) => {
    const s = new Set(expandedQuestions)
    s.has(index) ? s.delete(index) : s.add(index)
    setExpandedQuestions(s)
  }

  const updateQaResult = (key: string, value: "yes" | "no" | "refused" | "na") => {
    setQaResults((prev) => ({ ...prev, [key]: value }))
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-amber-400"
    return "text-red-400"
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "destructive"
  }

  const handleExportReport = () => {
    toast({ title: "Export initiated", description: "Your evaluation report is being generated..." })
  }

  const handleGenerateCoaching = () => {
    toast({
      title: "AI Coaching Task Created",
      description: `Coaching task created for ${selectedEvaluation.callTakerName}`,
    })
    router.push("/coaching")
  }

  const filteredEvaluations = evaluations.filter(
    (evaluation) =>
      evaluation.callTakerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evaluation.callId.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const qaQuestions = [
    { key: "location", question: "Was the location of the incident obtained?", confidence: 95, evidence: "Operator: 'Can you tell me your exact address?' Caller: '123 Main Street, apartment 4B.'" },
    { key: "phoneNumber", question: "Was the phone number verified?", confidence: 88, evidence: "Operator confirmed callback number at 00:45 in the call." },
    { key: "emergencyNature", question: "Was the nature of the emergency determined?", confidence: 92, evidence: "Caller: 'I'm having chest pain, it's really bad.' Nature clearly identified as medical emergency." },
    { key: "callerName", question: "Was the caller's name gathered?", confidence: 45, evidence: "No explicit request for caller's name found in transcript." },
    { key: "safetyConcerns", question: "Were safety concerns assessed?", confidence: 78, evidence: "Operator: 'Are you having trouble breathing?' Safety assessment performed." },
    { key: "callbackInfo", question: "Was callback information confirmed?", confidence: 52, evidence: "Callback number not explicitly confirmed in transcript." },
    { key: "respondersNotified", question: "Were responders appropriately notified?", confidence: 98, evidence: "Operator: 'Help is on the way.' Ambulance dispatched at 00:30." },
  ] as const

  // Distinct active colors for QA buttons
  const qaBtn = (active: boolean, kind: "yes" | "no" | "refused" | "na") => {
    if (!active) return "h-7 px-2.5 text-xs"
    switch (kind) {
      case "yes": return "h-7 px-2.5 text-xs bg-primary text-primary-foreground border-0 hover:opacity-90"
      case "no": return "h-7 px-2.5 text-xs bg-red-600 text-white border-0 hover:bg-red-700"
      case "refused": return "h-7 px-2.5 text-xs bg-amber-500 text-white border-0 hover:bg-amber-600"
      case "na": return "h-7 px-2.5 text-xs bg-violet-600 text-white border-0 hover:bg-violet-700"
    }
  }

  // Stable waveform bars (optional nicety)
  const bars = useMemo(() => Array.from({ length: 80 }, () => Math.random() * 60 + 20), [])

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background">
      {/* LEFT COLUMN: table (collapsible) + bottom row */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top: Recent Evaluations (collapsible) */}
        <div
          className={cn(
            "shrink-0 border-b border-border/50 bg-background transition-[height] duration-200",
            showTable ? "h-[48vh]" : "h-12"
          )}
        >
          {/* Header row for the table section */}
          <div className="px-6 h-12 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">Recent Evaluations</h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-64 sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by operator or call ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-card border-border/50"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label={showTable ? "Collapse" : "Expand"}
                onClick={() => setShowTable((v) => !v)}
              >
                {showTable ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Table container */}
          {showTable && (
            <div className="h-[calc(48vh-3rem)] px-6 pb-4 overflow-hidden">
              <div className="border border-border/50 rounded-lg bg-card overflow-hidden h-full">
                <div className="h-full overflow-y-auto">
                  <table className="w-full">
                    {/* SOLID sticky header (non-transparent) */}
                    <thead className="sticky top-0 z-10 bg-card">
                      <tr className="border-b border-border/50">
                        <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-2.5">Date</th>
                        <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-2.5">Evaluator</th>
                        <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-2.5">Type</th>
                        <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-2.5">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEvaluations.map((evaluation, idx) => (
                        <tr
                          key={evaluation.id}
                          onClick={() => setSelectedEvaluation(evaluation)}
                          className={cn(
                            "border-b border-border/50 cursor-pointer transition-colors hover:bg-muted/50",
                            idx % 2 === 1 && "bg-muted/20",
                            selectedEvaluation.id === evaluation.id && "bg-primary/10"
                          )}
                        >
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-foreground">{evaluation.date}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-foreground">{evaluation.callTakerName}</p>
                            <p className="text-xs text-muted-foreground">{evaluation.callId}</p>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="text-xs">
                              {evaluation.type}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={getScoreBadgeVariant(evaluation.score)} className="text-xs font-semibold">
                              {evaluation.score}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom: two panes (Audio, QA) grow when table collapsed */}
        <div className="flex-1 flex overflow-hidden">
          {/* Audio (left) */}
          <div className="w-[30%] min-w-[260px] max-w-[360px] flex flex-col border-r border-border/50 overflow-hidden">
            <div className="shrink-0 border-b border-border/50 bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">Audio Player</h3>
                <span className="text-xs text-muted-foreground">4:32</span>
              </div>

              <div className="relative h-16 bg-muted rounded-lg overflow-hidden mb-3 border border-border/50">
                <div className="absolute inset-0 flex items-center justify-center gap-[2px] px-2">
                  {bars.map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-primary/80 to-primary/40 rounded-full"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 bg-transparent"
                  aria-label={isPlaying ? "Pause audio" : "Play audio"}
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-1/3" />
                </div>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" aria-label="Volume">
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Tabs defaultValue="transcript" className="flex-1 flex flex-col">
              <div className="shrink-0 border-b border-border/50 bg-card px-3">
                <TabsList className="h-10 bg-transparent">
                  <TabsTrigger value="transcript" className="text-xs data-[state=active]:bg-muted">Transcript</TabsTrigger>
                  <TabsTrigger value="summary" className="text-xs data-[state=active]:bg-muted">Summary</TabsTrigger>
                  <TabsTrigger value="details" className="text-xs data-[state=active]:bg-muted">Details</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="transcript" className="flex-1 overflow-y-auto p-4 mt-0 bg-card">
                <h3 className="text-xs font-semibold text-foreground mb-2">Call Transcript</h3>
                <div className="space-y-3">
                  {selectedEvaluation.transcript.split("\n").map((line, index) => {
                    const isOperator = line.startsWith("Dispatcher:")
                    const isCaller = line.startsWith("Caller:")
                    const text = line.replace(/^(Dispatcher:|Caller:)\s*/, "")
                    return (
                      <div key={index}>
                        <p className="text-xs font-semibold text-primary mb-1">
                          {isOperator ? "Operator" : isCaller ? "Caller" : ""}
                        </p>
                        <p className="text-xs text-foreground leading-relaxed bg-muted rounded p-2">{text}</p>
                      </div>
                    )
                  })}
                </div>
              </TabsContent>

              <TabsContent value="summary" className="flex-1 overflow-y-auto p-4 mt-0 bg-card">
                <h3 className="text-xs font-semibold text-foreground mb-2">Call Summary</h3>
                <p className="text-xs text-foreground leading-relaxed bg-muted rounded p-3">
                  {selectedEvaluation.summary}
                </p>
              </TabsContent>

              <TabsContent value="details" className="flex-1 overflow-y-auto p-4 mt-0 bg-card">
                <h3 className="text-xs font-semibold text-foreground mb-2">Call Details</h3>
                <div className="space-y-2 bg-muted rounded p-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Call ID</span>
                    <span className="text-xs font-medium text-foreground">{selectedEvaluation.callId}</span>
                  </div>
                  <Separator className="bg-border/50" />
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Duration</span>
                    <span className="text-xs font-medium text-foreground">{selectedEvaluation.duration}</span>
                  </div>
                  <Separator className="bg-border/50" />
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Date</span>
                    <span className="text-xs font-medium text-foreground">{selectedEvaluation.date}</span>
                  </div>
                  <Separator className="bg-border/50" />
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Operator</span>
                    <span className="text-xs font-medium text-foreground">{selectedEvaluation.callTakerName}</span>
                  </div>
                  <Separator className="bg-border/50" />
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Type</span>
                    <span className="text-xs font-medium text-foreground">{selectedEvaluation.type}</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* QA (center) */}
          <div className="flex-1 flex flex-col overflow-hidden bg-background">
            <div className="shrink-0 border-b border-border/50 bg-card px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">APCO/NENA QA Evaluation</h2>
                  <p className="text-[11px] text-muted-foreground">Automated evaluation based on ANS 1.107.1-2015 standards</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-card">
              <div className="space-y-2">
                {qaQuestions.map((q, index) => {
                  const val = qaResults[q.key as keyof typeof qaResults] as "yes" | "no" | "refused" | "na" | string
                  return (
                    <div key={index} className="border border-border/50 rounded-lg bg-card overflow-hidden">
                      <div className="flex items-center justify-between p-3 gap-3">
                        <span className="text-sm text-foreground flex-1">{q.question}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            size="sm"
                            variant={val === "yes" ? "default" : "outline"}
                            className={qaBtn(val === "yes", "yes")}
                            onClick={() => updateQaResult(q.key, "yes")}
                          >
                            Yes
                          </Button>
                          <Button
                            size="sm"
                            variant={val === "no" ? "destructive" : "outline"}
                            className={qaBtn(val === "no", "no")}
                            onClick={() => updateQaResult(q.key, "no")}
                          >
                            No
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className={qaBtn(val === "refused", "refused")}
                            onClick={() => updateQaResult(q.key, "refused")}
                          >
                            Refused
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className={qaBtn(val === "na", "na")}
                            onClick={() => updateQaResult(q.key, "na")}
                          >
                            N/A
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => toggleQuestion(index)}>
                            {expandedQuestions.has(index) ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      </div>

                      {expandedQuestions.has(index) && (
                        <div className="px-3 pb-3 pt-0 border-t border-border/50 bg-muted">
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">AI Confidence</span>
                              <span className="text-xs font-semibold text-foreground">{q.confidence}%</span>
                            </div>
                            <div className="h-1 overflow-hidden rounded-full bg-muted/70">
                              <div className="h-full bg-primary transition-all" style={{ width: `${q.confidence}%` }} />
                            </div>
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground mb-1">Evidence from Transcript:</p>
                              <p className="text-xs text-foreground bg-muted/70 rounded p-2 leading-relaxed">{q.evidence}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Filter*/}
      <div className="w-[25%] min-w-[280px] max-w-[360px] flex flex-col border-l border-border/50 overflow-hidden bg-background">
        <div className="shrink-0 border-b border-border/50 bg-card px-4 py-3">
          <div className="space-y-2">
            <Button
              size="sm"
              onClick={handleExportReport}
              className="w-full h-9 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0 shadow-md"
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <Button
              size="sm"
              onClick={handleGenerateCoaching}
              className="w-full h-9 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate AI Coaching
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-card">
          {/* QA Protocol Evaluation Score */}
          <Card className="p-4 bg-card border-primary/20">
            <h3 className="text-sm font-semibold text-foreground mb-2">QA Protocol Evaluation</h3>
            <div className="text-center">
              <div className={cn("text-4xl font-bold mb-1", getScoreColor(selectedEvaluation.score))}>
                {selectedEvaluation.score}%
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {selectedEvaluation.metStandards.length} of{" "}
                {selectedEvaluation.metStandards.length + selectedEvaluation.criticalViolations.length} Standards
              </p>
            </div>
          </Card>

          {/* Call Information */}
          <Card className="p-4 bg-card border-border/50">
            <h3 className="text-sm font-semibold text-foreground mb-3">Call Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Call Taker</span>
                <span className="font-semibold text-foreground">{selectedEvaluation.callTakerName}</span>
              </div>
              <Separator className="bg-border/50" />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Date</span>
                <span className="font-semibold text-foreground">{selectedEvaluation.date}</span>
              </div>
              <Separator className="bg-border/50" />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-semibold text-foreground">{selectedEvaluation.duration}</span>
              </div>
            </div>
          </Card>

          {/* Compliance Summary */}
          <Card className="p-4 bg-card border-border/50">
            <h3 className="text-sm font-semibold text-foreground mb-3">Compliance Summary</h3>

            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-green-500">{selectedEvaluation.metStandards.length}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Standards Met</p>
                </div>
              </div>
              <Separator orientation="vertical" className="h-8 bg-border/50" />
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-red-500/10 flex items-center justify-center">
                  <XCircle className="h-3.5 w-3.5 text-red-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-red-500">{selectedEvaluation.criticalViolations.length}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Not Met</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              <p className="text-sm font-semibold text-foreground">Standards Met</p>
              {selectedEvaluation.metStandards.slice(0, 5).map((standard: string, index: number) => (
                <div key={index} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                  <span className="leading-tight">{standard}</span>
                </div>
              ))}
            </div>

            {selectedEvaluation.criticalViolations.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Areas for Improvement</p>
                {selectedEvaluation.criticalViolations.map((violation: string, index: number) => (
                  <div key={index} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                    <XCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                    <span className="leading-tight">{violation}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
          {/* Removed duplicate coaching button at bottom */}
        </div>
      </div>
    </div>
  )
}