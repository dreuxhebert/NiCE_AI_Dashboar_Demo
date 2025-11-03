"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
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
  PencilLine,
  Save,
  RotateCcw,
  Plus,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { AddQuestionDrawer } from "@/components/add-question-drawer"

export default function EvaluationsPage() {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [showTable, setShowTable] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [qaQuestionsSet, setQaQuestionsSet] = useState<QAQuestion[]>([])
  const [callList, setCallList] = useState<CallData[]>([])
  const [selectedEvaluation, setSelectedEvaluation] = useState<CallData>(callList[0])
  const [metStandards, setMetStandards] = useState<number>(0)
  const [criticalViolations, setCriticalViolations] = useState<number>(0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [qaAnswers, setQaAnswers] = useState<String[]>([])
  const [qaAnswerDraft, setQaAnswersDraft] = useState<String[]>([])
  const [callId, setCallId] = useState("")
  const [activeTab, setActiveTab] = useState<string>("summary")
  const { toast } = useToast()
  const router = useRouter()
  const qaRef = useRef<HTMLDivElement | null>(null)

  // Environment-based API configuration (same pattern as other pages)
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "https://inform-ai-backend.onrender.com";
  const USE_PROXY = process.env.NEXT_PUBLIC_USE_PROXY === "true";

  // Helper to get the correct API URL based on environment
  const getApiUrl = (path: string) => {
    if (USE_PROXY) {
      // In production, route through Next.js API proxy
      return `/api/proxy${path}`;
    }
    // In development, connect directly to backend
    return `${API_BASE}${path}`;
  }

  // ------- QA state (view vs draft) -------
  type QaValue = "yes" | "no" | "refused" | "na" | "Yes" | "No" | "Refused" | "N/A"
  type QaResults = Record<string, QaValue>

  const initialQa: QaResults = {
    location: "yes",
    phoneNumber: "yes",
    emergencyNature: "yes",
    callerName: "no",
    safetyConcerns: "yes",
    callbackInfo: "no",
    respondersNotified: "yes",
  }

  interface QAQuestion {
    _id: string;
    originalQuestion: string;
    editedQuestion: string;
    questionDescription: string;
    type: string;
    evidence: string;
    confidence: number;
  }

  
  interface CallData {
    _id: string;
    id: string;
    dispatcher_id: string;
    call_id: string;
    duration_seconds: number;
    direction: string;
    language: string;
    model: string;
    callType: string;
    status: string;
    sentiment: string;
    transcript: string;
    summary: string;
    created_at: Date;
    callEvaluationType: string;
    qa_analysis: {
      [question_id: string]: {
        answer: string;
        proof: string;
      };
    };
    score: number;
    scores: string[];
  }


  const [qaResults, setQaResults] = useState<QaResults>(initialQa)
  const [qaDraft, setQaDraft] = useState<QaResults>(initialQa)

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const data = await getCallData()
        if (data?.length > 0) {
          
          const first = data[0];
          const next =
            Array.isArray(first?.scores) && first.scores.length > 0
              ? [...first.scores]
              : ["Empty"];

          const newId = first?._id ?? "";

          setSelectedEvaluation(first);
          setQaAnswers(next);
          setQaAnswersDraft(next);
          setCallId(newId);
          const met = next.filter((score) => score === "yes").length;
          const crit = next.filter((score) => score === "no").length;
          setMetStandards(met);
          setCriticalViolations(crit);
        }
      } catch (error) {
        console.error("Error fetching calls:", error)
      }
    }

    fetchCalls()
    getQaQuestions()
    setQaResults(initialQa) //setQaAnswers
    setQaDraft(initialQa)
    setIsEditing(false)
  }, [])

  const toggleQuestion = (index: number) => {
    const s = new Set(expandedQuestions)
    s.has(index) ? s.delete(index) : s.add(index)
    setExpandedQuestions(s)
  }

  const handleAddQuestion = () => {
    setDrawerOpen(true)
  }

  const handleSelectEvaluationChange = (evaluation: CallData) => {
    const newId = evaluation._id
    setSelectedEvaluation(evaluation)
    const yesCount = Object.values(evaluation.qa_analysis).filter(
      (item) => item.answer?.toLowerCase() === "yes"
    ).length;

    const noCount = Object.values(evaluation.qa_analysis).filter(
      (item) => item.answer?.toLowerCase() === "no"
    ).length;

    setMetStandards(yesCount);
    setCriticalViolations(noCount);
    setQaAnswers(evaluation.scores)
    setQaAnswersDraft(evaluation.scores)
    setCallId(newId)
    // Smoothly scroll to the QA form section
    qaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const updateQaDraft = (key: string, index: number, value: QaValue) => {
    if (!isEditing) return
    qaAnswers[index] = value
    qaAnswerDraft[index] = value
    setQaDraft((prev) => ({ ...prev, [key]: value }))
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-amber-500"
    return "text-red-500"
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
      description: `Coaching task created for ${selectedEvaluation.dispatcher_id}`,
    })
    router.push("/coaching")
  }

  const handleSaveChanges = async () => {
    await fetch(getApiUrl('/calls/'), { cache: 'no-store' })
    setQaResults(qaDraft)
    setQaAnswers(qaAnswerDraft)
    setIsEditing(false)
    toast({ title: "Changes saved" })
  }

  const handleResetChanges = () => {
    setQaDraft(qaResults)
    setQaAnswersDraft(qaAnswers)
    toast({ title: "Draft reset", description: "Reverted to last saved answers." })
  }

  const filteredEvaluations = callList.filter(
    (evaluation) =>
      evaluation.dispatcher_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evaluation.call_id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const qaQuestions = [
    { confidence: 95, evidence: "Operator: 'Can you tell me your exact address?' Caller: '123 Main Street, apartment 4B.'" },
    { confidence: 88, evidence: "Operator confirmed callback number at 00:45 in the call." },
    { confidence: 92, evidence: "Caller: 'I'm having chest pain, it's really bad.' Nature clearly identified as medical emergency." },
    { confidence: 45, evidence: "No explicit request for caller's name found in transcript." },
    { confidence: 78, evidence: "Operator: 'Are you having trouble breathing?' Safety assessment performed." },
    { confidence: 52, evidence: "Callback number not explicitly confirmed in transcript." },
    { confidence: 98, evidence: "Operator: 'Help is on the way.' Ambulance dispatched at 00:30." },
  ] as const

  const getQaQuestions = async () => {
    const res = await fetch(getApiUrl('/questionSet'));
    if (!res.ok) throw new Error("Failed to fetch question set");
    const data: QAQuestion[] = await res.json();

    // Merge with evidence
    const merged = data.map((q, idx) => ({
      ...q,
      evidence: qaQuestions[idx]?.evidence ?? "",
      confidence: qaQuestions[idx]?.confidence ?? 0,
    }));

    setQaQuestionsSet(merged);

    return merged;
  };



  const getCallData = async () => {
    const res = await fetch(getApiUrl('/calls/'), { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch call data");
    const data = await res.json();
    setCallList(data);
    return data
  };

  // Buttons: look normal when locked, shrink & wrap on small screens
  const qaBtn = (active: boolean, kind: QaValue) => {
    const base = "h-7 px-2 text-[11px] sm:text-xs sm:px-2.5 border"
    if (!active) return base
    switch (kind) {
      case "yes":
        return cn(base, "bg-primary text-primary-foreground border-transparent hover:opacity-90")
      case "no":
        return cn(base, "bg-red-600 text-white border-transparent hover:bg-red-700")
      case "refused":
        return cn(base, "bg-amber-500 text-white border-transparent hover:bg-amber-600")
      case "na":
        return cn(base, "bg-violet-600 text-white border-transparent hover:bg-violet-700")
    }
  }

  // Stable waveform bars (optional nicety)
  const bars = useMemo(() => Array.from({ length: 80 }, () => Math.random() * 60 + 20), [])

  // ---- Helpers ----
  const renderTranscript = (transcript?: string) => {
    if (!transcript) return "No transcript available"
    const lines = transcript.split("\n")
    return (
      <div className="space-y-5">
        {lines.map((line, index) => {
          const match = line.match(/^(Dispatcher|Caller):\s*(.+)$/)
          let speaker: string | null = null
          let text = line
          if (match) {
            speaker = match[1]
            text = match[2]
          }

          const words = String(text || "").trim().split(/\s+/).filter(Boolean)
          const chunks: string[] = []
          for (let i = 0; i < words.length; i += 30) {
            chunks.push(words.slice(i, i + 30).join(" "))
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
                          isDispatcher
                            ? "bg-muted/30 text-foreground border border-border"
                            : "bg-primary/10 text-foreground border border-primary/20",
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
        })}
      </div>
    )
  }

 return (
    <>
      {/* Outer scroll to avoid clipping when scaled down */}
      <div className="w-full overflow-auto">
        {/* SCALE WRAPPER: keeps desktop look, shrinks on smaller breakpoints */}
        <div className="mobile-scale">
          <div className="flex min-h-[calc(100vh-4rem)] bg-muted/30 rounded-lg p-3 sm:p-4 md:p-6">
            {/* LEFT & CENTER */}
            <div className="flex-1 flex flex-col overflow-hidden p-3 sm:p-4 gap-4">
              {/* Recent Evaluations */}
              <Card className="shrink-0 border border-border/50 bg-card rounded-lg">
                <div className="px-3 sm:px-6 h-12 flex items-center justify-between border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-border/50">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-sm sm:text-lg font-bold text-foreground">Evaluations</h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative w-[190px] sm:w-80">
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

                {showTable && (
                  <div className="px-3 sm:px-6 py-4 overflow-hidden h-[32vh] sm:h-[38vh] md:h-[46vh]">
                    <div className="border border-border/50 rounded-lg bg-card overflow-hidden h-full">
                      <div className="h-full overflow-y-auto">
                        <table className="w-full">
                          <thead className="sticky top-0 z-10 bg-card">
                            <tr className="border-b border-border/50">
                              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-2.5">Date</th>
                              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-2.5">Evaluator</th>
                              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-2.5">Incident Type</th>
                              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-2.5">Status</th>
                              <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-2.5">Score</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredEvaluations.map((evaluation, idx) => (
                              <tr
                                key={evaluation.id}
                                onClick={() => handleSelectEvaluationChange(evaluation)}
                                className={cn(
                                  "border-b border-border/50 cursor-pointer transition-colors hover:bg-muted/50",
                                  idx % 2 === 1 && "bg-muted/20",
                                  selectedEvaluation.id === evaluation.id && "bg-primary/10"
                                )}
                              >
                                <td className="px-4 py-3">
                                  <p className="text-sm font-medium text-foreground">
                                    {new Date(evaluation.created_at).toDateString()}
                                  </p>
                                </td>
                                <td className="px-4 py-3">
                                  <p className="text-sm font-medium text-foreground">{evaluation.dispatcher_id}</p>
                                  <p className="text-xs text-muted-foreground">{evaluation.call_id}</p>
                                </td>
                                <td className="px-4 py-3">
                                  <p className="text-sm font-medium text-foreground">{evaluation.callType}</p>
                                </td>
                                <td className="px-4 py-3">
                                  <Badge variant="outline" className="text-xs">
                                    {evaluation.callEvaluationType}
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
              </Card>

              {/* Bottom: grid that collapses on small screens */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-hidden">
                {/* LEFT: Audio + Tabs in one card; remove fixed height on mobile */}
                <Card className="flex flex-col border border-border/50 bg-card rounded-lg md:h-[min(64vh,100%)]">
                  {/* Audio */}
                  <div className="p-3 sm:p-4 border-b border-border/50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-foreground">Audio Player</h3>
                      <span className="text-xs text-muted-foreground">4:32</span>
                    </div>

                    <div className="relative h-14 sm:h-16 bg-muted rounded-lg overflow-hidden mb-3 border border-border/50">
                      <div className="absolute inset-0 flex items-center justify-center gap-[2px] px-2">
                        {bars.map((height, i) => (
                          <div key={i} className="flex-1 bg-gradient-to-t from-primary/80 to-primary/40 rounded-full" style={{ height: `${height}%` }} />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-transparent" aria-label={isPlaying ? "Pause audio" : "Play audio"} onClick={() => setIsPlaying(!isPlaying)}>
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

                  {/* Tabs */}
                  <div className="flex-1 flex flex-col">
                    <div className="shrink-0 border-b border-border/50 bg-card px-3">
                      <Tabs defaultValue="transcript" className="flex-1 flex flex-col">
                        <TabsList className="h-10 bg-transparent flex-nowrap overflow-x-auto -mx-3 px-3 md:overflow-visible">
                          <TabsTrigger value="transcript" className="text-[11px] sm:text-xs px-2 sm:px-3 data-[state=active]:bg-muted">
                            Transcript
                          </TabsTrigger>
                          <TabsTrigger value="summary" className="text-[11px] sm:text-xs px-2 sm:px-3 data-[state=active]:bg-muted">
                            Summary
                          </TabsTrigger>
                          <TabsTrigger value="details" className="text-[11px] sm:text-xs px-2 sm:px-3 data-[state=active]:bg-muted">
                            Details
                          </TabsTrigger>
                        </TabsList>

                        {/* Transcript Content */}
                        <TabsContent value="transcript" className="flex-1 overflow-y-auto p-3 sm:p-4 mt-0 bg-card">
                          <h3 className="text-xs font-semibold text-foreground mb-2">Call Transcript</h3>
                          <div className="text-xs text-foreground leading-relaxed max-h-64 overflow-y-auto">
                            {renderTranscript(selectedEvaluation?.transcript)}
                          </div>
                        </TabsContent>

                        {/* Summary Content */}
                        <TabsContent value="summary" className="flex-1 overflow-y-auto p-3 sm:p-4 mt-0 bg-card">
                          <h3 className="text-xs font-semibold text-foreground mb-2">Call Summary</h3>
                          <p className="text-xs text-foreground leading-relaxed bg-muted rounded-lg p-3">
                            {selectedEvaluation?.summary || "No summary available"}
                          </p>
                        </TabsContent>

                        {/* Details Content */}
                        <TabsContent value="details" className="flex-1 overflow-y-auto p-3 sm:p-4 mt-0 bg-card">
                          <h3 className="text-xs font-semibold text-foreground mb-2">Call Details</h3>
                          <div className="space-y-2 bg-muted rounded-lg p-3 border border-border/50">
                            <div className="flex justify-between">
                              <span className="text-xs text-muted-foreground">Call ID</span>
                              <span className="text-xs font-medium text-foreground">{selectedEvaluation?.call_id}</span>
                            </div>
                            <Separator className="bg-border/50" />
                            <div className="flex justify-between">
                              <span className="text-xs text-muted-foreground">Duration</span>
                              <span className="text-xs font-medium text-foreground">{selectedEvaluation?.duration_seconds}</span>
                            </div>
                            <Separator className="bg-border/50" />
                            <div className="flex justify-between">
                              <span className="text-xs text-muted-foreground">Date</span>
                              <span className="text-xs font-medium text-foreground">
                                {new Date(selectedEvaluation?.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <Separator className="bg-border/50" />
                            <div className="flex justify-between">
                              <span className="text-xs text-muted-foreground">Operator</span>
                              <span className="text-xs font-medium text-foreground">{selectedEvaluation?.dispatcher_id}</span>
                            </div>
                            <Separator className="bg-border/50" />
                            <div className="flex justify-between">
                              <span className="text-xs text-muted-foreground">Type</span>
                              <span className="text-xs font-medium text-foreground">{selectedEvaluation?.callEvaluationType}</span>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </Card>

                {/* RIGHT: QA (now includes right-column summary/actions merged in) */}
                <Card className="md:col-span-2 flex flex-col overflow-hidden border border-border/50 bg-card rounded-lg">
                  <div ref={qaRef} className="shrink-0 border-b border-border/50 bg-card px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center border border-border/50">
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-foreground">APCO/NENA QA Evaluation</h2>
                        <p className="text-[11px] text-muted-foreground">Automated evaluation based on ANS 1.107.1-2015 standards</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {activeTab === "fullform" && (
                        <>
                          <Button
                            size="sm"
                            variant={isEditing ? "secondary" : "outline"}
                            className="h-8 text-xs px-2"
                            onClick={() => {
                              if (!isEditing) setQaDraft(qaResults); setQaAnswersDraft(qaAnswers)
                              setIsEditing((v) => !v)
                            }}
                          >
                            <PencilLine className="h-3.5 w-3.5 mr-1.5" />
                            {isEditing ? "Done" : "Edit"}
                          </Button>
                          <Button
                            size="sm"
                            variant={"outline"}
                            className="h-8 text-xs px-2"
                            onClick={() => {
                              handleAddQuestion()
                            }}
                          >
                            <Plus className="h-3.5 w-3.5 mr-1.5" />
                            {"Add"}
                          </Button>
                        </>
                      )}
                      {/* Actions moved from right column */}
                      <Button
                        size="sm"
                        onClick={handleExportReport}
                        className="h-8 text-xs px-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0 shadow-md"
                      >
                        <FileDown className="mr-1.5 h-3.5 w-3.5" />
                        Export
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleGenerateCoaching}
                        className="h-8 text-xs px-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md"
                      >
                        <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                        Coach
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-card">
                    <Tabs defaultValue="summary" className="flex flex-col h-full" onValueChange={setActiveTab}>
                      <TabsList className="w-full bg-muted/50 p-1 rounded-lg mb-4">
                        <TabsTrigger value="summary" className="flex-1 data-[state=active]:bg-card">
                          Summary
                        </TabsTrigger>
                        <TabsTrigger value="fullform" className="flex-1 data-[state=active]:bg-card">
                          Full Form
                        </TabsTrigger>
                      </TabsList>

                      {/* Summary Tab */}
                      <TabsContent value="summary" className="flex-1 overflow-y-auto mt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                          {/* Compliance Summary */}
                          <Card className="p-3 bg-card border border-border/50 rounded-lg">
                            <h3 className="text-[12px] font-semibold text-foreground mb-1.5">Compliance Summary</h3>
                            <div className="flex items-center justify-around">
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded bg-green-500/10 flex items-center justify-center border border-border/50">
                                  <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                </div>
                                <div>
                                  <p className="text-lg font-bold text-green-500 leading-none">{metStandards}</p>
                                  <p className="text-[11px] text-muted-foreground">Met</p>
                                </div>
                              </div>
                              <Separator orientation="vertical" className="h-8 bg-border/50" />
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded bg-red-500/10 flex items-center justify-center border border-border/50">
                                  <XCircle className="h-3.5 w-3.5 text-red-500" />
                                </div>
                                <div>
                                  <p className="text-lg font-bold text-red-500 leading-none">{criticalViolations}</p>
                                  <p className="text-[11px] text-muted-foreground">Not Met</p>
                                </div>
                              </div>
                            </div>
                          </Card>

                          {/* QA Protocol Evaluation */}
                          <Card className="p-3 bg-card border border-border/50 rounded-lg">
                            <h3 className="text-[12px] font-semibold text-foreground mb-1.5">QA Protocol Evaluation</h3>
                            <div className="text-center">
                              <div className={cn("text-3xl font-bold mb-0.5", getScoreColor(selectedEvaluation?.score))}>
                                {selectedEvaluation?.score}%
                              </div>
                              <p className="text-[11px] text-muted-foreground">
                                {metStandards} of {metStandards + criticalViolations} Standards
                              </p>
                            </div>
                          </Card>

                          {/* Quick Actions for small screens */}
                          <Card className="p-3 bg-card border border-border/50 rounded-lg sm:hidden">
                            <h3 className="text-[12px] font-semibold text-foreground mb-1.5">Actions</h3>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={handleExportReport}
                                className="flex-1 h-8 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0 shadow-md"
                              >
                                <FileDown className="mr-2 h-3.5 w-3.5" />
                                Export
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleGenerateCoaching}
                                className="flex-1 h-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md"
                              >
                                <Sparkles className="mr-2 h-3.5 w-3.5" />
                                Coaching
                              </Button>
                            </div>
                          </Card>
                        </div>

                        {/* Additional summary information */}
                        <Card className="p-4 bg-card border border-border/50 rounded-lg">
                          <h3 className="text-sm font-semibold text-foreground mb-3">Evaluation Information</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Operator</span>
                              <span className="text-xs font-medium text-foreground">{selectedEvaluation?.dispatcher_id}</span>
                            </div>
                            <Separator className="bg-border/50" />
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Call ID</span>
                              <span className="text-xs font-medium text-foreground">{selectedEvaluation?.call_id}</span>
                            </div>
                            <Separator className="bg-border/50" />
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Evaluation Type</span>
                              <Badge variant="outline" className="text-xs">{selectedEvaluation?.callEvaluationType}</Badge>
                            </div>
                            <Separator className="bg-border/50" />
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Date / Time</span>
                              <span className="text-xs font-medium text-foreground">
                                {selectedEvaluation?.created_at ? new Date(selectedEvaluation.created_at).toLocaleString() : 'N/A'}
                              </span>
                            </div>
                            <Separator className="bg-border/50" />
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Duration</span>
                              <span className="text-xs font-medium text-foreground">{selectedEvaluation?.duration_seconds}s</span>
                            </div>
                          </div>
                        </Card>
                      </TabsContent>

                      {/* Full Form Tab */}
                      <TabsContent value="fullform" className="flex-1 overflow-y-auto mt-0">
                        <div className="space-y-2">
                      {qaQuestionsSet.map((q, index) => {
                        const qaAnalysis = selectedEvaluation?.qa_analysis
                        let answer = qaAnalysis?.[q._id]?.answer || ""
                        let proof = qaAnalysis?.[q._id]?.proof || ""

                        const val = (isEditing ? qaAnswerDraft[index] : answer) as QaValue
                        return (
                          <div key={index} className="border border-border/50 rounded-lg bg-card overflow-hidden">
                            <div className="flex items-center justify-between p-3 gap-3">
                              <span className="text-sm text-foreground flex-1">{q.editedQuestion}</span>
                              <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                                <Button
                                  size="sm"
                                  variant={val === "Yes" ? "default" : "outline"}
                                  className={qaBtn(val === "Yes", "Yes")}
                                  onClick={() => {updateQaDraft(callId, index, "Yes")}}
                                  aria-disabled={!isEditing}
                                  tabIndex={isEditing ? 0 : -1}
                                >
                                  Yes
                                </Button>
                                <Button
                                  size="sm"
                                  variant={val === "No" ? "destructive" : "outline"}
                                  className={qaBtn(val === "No", "No")}
                                  onClick={() => updateQaDraft(callId, index, "No")}
                                  aria-disabled={!isEditing}
                                  tabIndex={isEditing ? 0 : -1}
                                >
                                  No
                                </Button>
                                <Button
                                  size="sm"
                                  variant={val === "Refused" ? "default" : "outline"}
                                  className={qaBtn(val === "Refused", "Refused")}
                                  onClick={() => updateQaDraft(callId, index, "Refused")}
                                  aria-disabled={!isEditing}
                                  tabIndex={isEditing ? 0 : -1}
                                >
                                  Refused
                                </Button>
                                <Button
                                  size="sm"
                                  variant={val === "N/A" ? "default" : "outline"}
                                  className={qaBtn(val === "N/A", "N/A")}
                                  onClick={() => updateQaDraft(callId, index, "N/A")}
                                  aria-disabled={!isEditing}
                                  tabIndex={isEditing ? 0 : -1}
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
                                    <p className="text-xs text-foreground bg-muted/70 rounded p-2 leading-relaxed border border-border/50">{proof}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                        </div>

                        {/* Action bar: sticky on mobile, normal on md+ */}
                        {isEditing && (
                          <div className="md:static md:mt-4 sticky bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border/50 px-3 py-2 flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={handleResetChanges}>
                              <RotateCcw className="h-3.5 w-3.5 mr-2" />
                              Reset Changes
                            </Button>
                            <Button size="sm" onClick={handleSaveChanges}>
                              <Save className="h-3.5 w-3.5 mr-2" />
                              Save Changes
                            </Button>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                </Card>
              </div>
            </div>

            {/* RIGHT COLUMN removed: content merged into QA card above */}
          </div>
        </div>
        <AddQuestionDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onAdded={() => { getQaQuestions() }} />
      </div>

      {/* Responsive scaling styles */}
      <style jsx global>{`
        /* The trick:
           - We scale the entire UI down on smaller screens
           - We expand width by the inverse factor so layout doesn't get cut off
           - Keeps your desktop look untouched, but "mini" on mobile
        */
        .mobile-scale {
          --ui-scale: 1;
          transform: scale(var(--ui-scale));
          transform-origin: top left;
          width: calc(100% / var(--ui-scale));
        }

        @media (max-width: 1024px) {
          .mobile-scale { --ui-scale: 0.95; }
        }
        @media (max-width: 768px) {
          .mobile-scale { --ui-scale: 0.9; }
        }
        @media (max-width: 480px) {
          .mobile-scale { --ui-scale: 0.85; }
        }
      `}</style>
    </>
  )
}