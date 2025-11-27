"use client"

import { useState, useEffect, useRef } from "react"
import { jsPDF } from "jspdf"
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
  PencilLine,
  Save,
  RotateCcw,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { AddQuestionDrawer } from "@/components/add-question-drawer"
import AudioPlayerWithWaveformV2 from "@/components/audio-player-with-waveform-v2"
import ProgressBar from "@/components/progress-bar"
import { ExportReportDialog } from "@/components/export-report-dialog"

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

interface QAQuestion {
  _id: string;
  originalQuestion: string;
  editedQuestion: string;
  questionDescription: string;
  type: string;
  evidence: string;
  confidence: number;
  score: number;
}

interface EmergencyType {
  agency: string;
  specific_emergency: string;
  confidence: string;
}

interface QAResult {
  Answer: QaValue;
  Proof: string;
}

interface CallData {
  _id: string;
  dispatcher_id?: string;
  call_id?: string;
  duration_seconds?: number;
  score?: number;
  callEvaluationType?: string;
  direction?: string;
  language?: string;
  model?: string;

  callType?: EmergencyType[];

  status?: string;

  // Sentiment block
  sentiment?: string;
  sentimentDescription?: string | null;
  sentimentScore?: number | null;
  sentimentRawScore?: number | null;

  transcript?: string;
  summary?: string;

  qa_analysis?: {
    [question: string]: QAResult;
  };

  created_at?: string; // ISO string from backend

  stored_audio?: string; // if you later store audio URL
}

interface CallAnalysis {
  [question_id: string]: {
    Answer: QaValue;
    Proof: string;
  };
}

// 🔹 Flattened protocol question interface from /protocols/forCall/{callId}
interface ProtocolFlatQuestion {
  protocolId: string
  protocolName: string
  sectionId: string
  sectionTitle: string
  questionId: string
  question: string
  points?: number
  prompt?: string
  isActive?: boolean
}

export default function EvaluationsPage() {
  // switched to string keys so we can group questions and still track expand/collapse
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [showTable, setShowTable] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [qaQuestionsSet, setQaQuestionsSet] = useState<QAQuestion[]>([])
  const [callList, setCallList] = useState<CallData[]>([])
  const [selectedEvaluation, setSelectedEvaluation] = useState<CallData | null>(null)
  const [metStandards, setMetStandards] = useState<number>(0)
  const [criticalViolations, setCriticalViolations] = useState<number>(0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("summary")
  const { toast } = useToast()
  const router = useRouter()
  const [score, setScore] = useState<number>(0)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [qaAnalysisTemp, setQaAnalysisTemp] = useState<CallAnalysis>({})
  const [qaAnalysis, setQaAnalysis] = useState<CallAnalysis>({})
  const [protocolQuestions, setProtocolQuestions] = useState<ProtocolFlatQuestion[]>([])
  const [progressRefreshKey, setProgressRefreshKey] = useState<number>(0)

  // This is your existing mock waveform bars (still unused but left in case)
  const bars = [...Array(60)].map(() => Math.floor(Math.random() * 100));

  const qaRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    getCallData()
    getQaQuestions()
    setIsEditing(false)
  }, [])

  const handleClickSave = async () => {
    if (!selectedEvaluation?._id) return

    const cleanedAnalysis = Object.fromEntries(
      Object.entries(qaAnalysisTemp ?? {}).map(([key, value]) => [
        key,
        {
          Answer: value.Answer,
          Proof: value.Proof ?? "",
        },
      ])
    )

    try {
      const res = await fetch(getApiUrl(`/calls/update`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedEvaluation._id,
          changedAnalysis: cleanedAnalysis,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast({ title: "Failed to save changes", variant: "destructive" })
        return
      }

      toast({ title: "Saved", description: "QA Evaluation Updated (Status: Validating)" })

      const updatedEvaluation = {
        ...selectedEvaluation,
        qa_analysis: qaAnalysisTemp ?? {},
        score: data.newScore,
        callEvaluationType: "Validating",
      }

      const updatedCallList = callList.map((call) =>
        call._id === selectedEvaluation._id ? updatedEvaluation : call
      )

      setCallList(updatedCallList)
      setSelectedEvaluation(updatedEvaluation)
      setScore(data.newScore)
      setQaAnalysis(qaAnalysisTemp ?? {})
      setIsEditing(false)

      const yesCount = Object.values(qaAnalysisTemp ?? {}).filter(
        (item) => item.Answer === "Yes"
      ).length

      const noCount = Object.values(qaAnalysisTemp ?? {}).filter(
        (item) => item.Answer === "No"
      ).length

      setMetStandards(yesCount)
      setCriticalViolations(noCount)

      setProgressRefreshKey((prev) => prev + 1)

    } catch (error) {
      console.error(error)
      toast({ title: "Unexpected error", variant: "destructive" })
    }
  }


  const handleMarkCompleted = async () => {
    if (!selectedEvaluation) return

    const res = await fetch(
      getApiUrl(`/calls/updateEvaluationStatus?id=${selectedEvaluation._id}`),
      {
        method: "PATCH",
      }
    )

    const data = await res.json()

    if (res.ok) {
      toast({ title: "Updated Evaluation Status (Status: Completed)" })
    }

    const updatedEvaluation = {
      ...selectedEvaluation,
      callEvaluationType: "Completed",
    }

    const merged = callList.map((call) =>
      call._id === selectedEvaluation._id ? updatedEvaluation : call
    )

    // ✅ Both states must be updated
    setCallList(merged)
    setSelectedEvaluation(updatedEvaluation)
    setProgressRefreshKey(prev => prev + 1)
  }

  const calTime = (givenTime?: number) => {
    const time_sec = givenTime ?? 0;

    if (time_sec < 60) {
      return `${time_sec}s`;
    }

    if (time_sec < 3600) {
      const min = Math.floor(time_sec / 60);
      const sec = time_sec % 60;
      return `${min}m  ${sec}s`;
    }

    const hr = Math.floor(time_sec / 3600);
    const min = Math.floor((time_sec % 3600) / 60);
    return `${hr}h ${min}m`;
  };

  const toggleQuestion = (key: string) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleSelectEvaluationChange = (evaluation: CallData) => {
    setSelectedEvaluation(evaluation)

    const qa = evaluation.qa_analysis ?? {}

    const yesCount = Object.values(qa).filter(
      (item) => item.Answer?.toLowerCase() === "yes"
    ).length

    const noCount = Object.values(qa).filter(
      (item) => item.Answer?.toLowerCase() === "no"
    ).length

    setMetStandards(yesCount)
    setCriticalViolations(noCount)
    setScore(evaluation.score ?? 0)

    setQaAnalysisTemp(qa)
    setQaAnalysis(qa)
    setProtocolQuestions([])

    // 🔥 Append protocol questions for this specific call
    loadProtocolQuestionsForCall(evaluation)

    // Smooth scroll
    qaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const updateQaDraft = (key: string, value: QaValue) => {
    if (!isEditing) return
    setQaAnalysisTemp(prev => ({
      ...(prev ?? {}),
      [key]: {
        Answer: value,
        Proof: prev?.[key]?.Proof ?? ""
      }
    }))
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
    setExportDialogOpen(true)
  }

  const handleDialogExport = async (options: {
    includeForm: boolean
    includeTranscript: boolean
    includeAudioLink: boolean
  }) => {
    if (!selectedEvaluation) {
      toast({
        title: "No call selected",
        description: "Please select an evaluation before exporting.",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)

    try {
      const doc = new jsPDF()
      const qaSource = qaAnalysisTemp ?? qaAnalysis ?? {}
      let y = 10
      const left = 10
      const lineHeight = 7
      const maxWidth = 180 // page width minus margins
      const bottomMargin = 280 // when to start a new page

      // Helper: add wrapped text with per-line page break handling
      const addWrappedText = (text: string, opts: { bold?: boolean } = {}) => {
        if (opts.bold) {
          doc.setFont("helvetica", "bold")
        } else {
          doc.setFont("helvetica", "normal")
        }

        const lines = doc.splitTextToSize(text, maxWidth)

        lines.forEach((line: string) => {
          if (y > bottomMargin) {
            doc.addPage()
            y = 10
          }
          doc.text(line, left, y)
          y += lineHeight
        })
      }

      const addLine = (text: string, opts: { bold?: boolean } = {}) => {
        addWrappedText(text, opts)
      }

      const addSectionTitle = (title: string) => {
        if (y + lineHeight > bottomMargin) {
          doc.addPage()
          y = 10
        }
        doc.setFont("helvetica", "bold")
        doc.setFontSize(14)
        doc.text(title, left, y)
        y += lineHeight
        doc.setFontSize(11)
      }

      // -------- HEADER --------
      doc.setFont("helvetica", "bold")
      doc.setFontSize(16)
      doc.text("Evaluation Report", left, y)
      y += 10
      doc.setFontSize(11)

      addSectionTitle("Call Information")
      addLine(`Operator: ${selectedEvaluation.dispatcher_id || "N/A"}`)
      addLine(`Call ID: ${selectedEvaluation.call_id || "N/A"}`)
      addLine(`Call Type: ${selectedEvaluation.callType || "N/A"}`)
      addLine(`Evaluation Type: ${selectedEvaluation.callEvaluationType || "N/A"}`)
      addLine(
        `Date / Time: ${
          selectedEvaluation.created_at
            ? new Date(selectedEvaluation.created_at).toLocaleString()
            : "N/A"
        }`
      )
      addLine(`Duration: ${calTime(selectedEvaluation.duration_seconds)}`)

      // -------- SCORES --------
      addSectionTitle("Scores & Compliance")
      addLine(`Overall Score: ${score}%`)
      addLine(`Standards Met: ${metStandards}`)
      addLine(`Not Met (Critical): ${criticalViolations}`)
      addLine(
        `Total Standards Evaluated: ${metStandards + criticalViolations || "N/A"}`
      )

      // -------- SUMMARY --------
      addSectionTitle("Call Summary")
      addLine(selectedEvaluation.summary || "No summary available")

      // -------- QA FORM --------
      if (options.includeForm) {
        addSectionTitle("QA Evaluation")

        qaQuestionsSet.forEach((q, index) => {
          const a = qaSource[q._id]?.Answer ?? "N/A"
          const proof = qaSource[q._id]?.Proof ?? ""

          addLine(`Q${index + 1}: ${q.editedQuestion}`, { bold: true })
          addLine(`Answer: ${a}`)
          addLine(`AI Confidence: ${q.confidence}%`)
          if (proof) {
            addLine(`Evidence: ${proof}`)
          }
          y += 3 // small spacer between questions
        })
      }

      // -------- TRANSCRIPT --------
      if (options.includeTranscript && selectedEvaluation.transcript) {
        addSectionTitle("Call Transcript")
        addWrappedText(selectedEvaluation.transcript)
      }

      // -------- AUDIO LINK --------
      if (options.includeAudioLink && selectedEvaluation.stored_audio) {
        addSectionTitle("Audio Recording")
        addLine(`URL: ${selectedEvaluation.stored_audio}`)
      }

      const fileName =
        `evaluation-${selectedEvaluation.call_id || selectedEvaluation._id}.pdf`

      doc.save(fileName)

      toast({
        title: "Export complete",
        description: "Your evaluation report PDF has been downloaded.",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Export failed",
        description: "There was a problem generating the report.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
      setExportDialogOpen(false)
    }
  }

  const handleGenerateCoaching = () => {
    toast({
      title: "AI Coaching Task Created",
      description: `Coaching task created for ${selectedEvaluation?.dispatcher_id}`,
    })
    router.push("/coaching")
  }

  const handleResetChanges = () => {
    setQaAnalysisTemp(selectedEvaluation?.qa_analysis ?? {});
    toast({ title: "Draft reset", description: "Reverted to last saved answers." })
  }

  const filteredEvaluations = callList.filter(
    (evaluation) =>
      evaluation.dispatcher_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evaluation.call_id?.toLowerCase().includes(searchQuery.toLowerCase())
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

  // 🔥 NEW: Fetch protocol questions for a given call and merge into QA state
  const loadProtocolQuestionsForCall = async (evaluation: CallData) => {
    if (!evaluation?._id) return

    try {
      const res = await fetch(getApiUrl(`/protocols/forCall/${evaluation._id}`), {
        cache: "no-store",
      })

      if (!res.ok) {
        console.error("Failed to fetch protocol questions for call", evaluation._id)
        return
      }

      const protocolQs: ProtocolFlatQuestion[] = await res.json()

      if (!protocolQs || protocolQs.length === 0) {
        setProtocolQuestions([])
        return
      }

      setProtocolQuestions(protocolQs)

      // Merge into QA analysis as additional questions (default N/A, empty Proof)
      setQaAnalysis(prev => {
        const base = { ...(prev ?? {}) }
        for (const q of protocolQs) {
          if (!base[q.question]) {
            base[q.question] = {
              Answer: "N/A",
              Proof: "",
            }
          }
        }
        return base
      })

      setQaAnalysisTemp(prev => {
        const base = { ...(prev ?? {}) }
        for (const q of protocolQs) {
          if (!base[q.question]) {
            base[q.question] = {
              Answer: "N/A",
              Proof: "",
            }
          }
        }
        return base
      })

      // We do NOT touch metStandards / criticalViolations here.
      // These protocol questions start as N/A and don't affect scoring
      // until the evaluator manually selects Yes / No.

    } catch (err) {
      console.error("Error loading protocol questions for call:", err)
    }
  }

  const getCallData = async () => {
    const res = await fetch(getApiUrl('/calls'), { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch call data");
    const data = await res.json();
    setCallList(data);
    try {
      if (data?.length > 0) {
        const first = data[0]

        const analysis: CallAnalysis = first?.qa_analysis ?? {}

        const answers = Object.values(analysis).map((item) => item.Answer)

        const score = first?.score ?? 0

        setSelectedEvaluation(first)

        const met = answers.filter((ans) => ans === "Yes").length
        const crit = answers.filter((ans) => ans === "No").length

        setMetStandards(met)
        setCriticalViolations(crit)

        setQaAnalysisTemp(analysis)
        setQaAnalysis(analysis)
        setScore(score)
        setProtocolQuestions([])

        // 🔥 NEW: also load protocol-specific questions (Fire / Medical / Police)
        await loadProtocolQuestionsForCall(first)
      }
    } catch (error) {
      console.error("Error fetching calls:", error)
    }
  };

  // Buttons: look normal when locked, shrink & wrap on small screens
  const qaBtn = (active: boolean, kind: QaValue) => {
    const base = "h-7 px-2 text-[11px] sm:text-xs sm:px-2.5 border"
    if (!active) return base
    switch (kind) {
      case "yes":
      case "Yes":
        return cn(base, "bg-primary text-primary-foreground border-transparent hover:opacity-90")
      case "no":
      case "No":
        return cn(base, "bg-red-600 text-white border-transparent hover:bg-red-700")
      case "refused":
      case "Refused":
        return cn(base, "bg-amber-500 text-white border-transparent hover:bg-amber-600")
      case "na":
      case "N/A":
        return cn(base, "bg-violet-600 text-white border-transparent hover:bg-violet-700")
    }
  }

  // ---- Derived grouping for protocol-style layout ----
  const protocolQuestionTexts = new Set(protocolQuestions.map(q => q.question))

  const coreEntries = Object.entries(qaAnalysis ?? {}).filter(
    ([question]) => !protocolQuestionTexts.has(question)
  )

  const sectionsMap = new Map<string, { sectionId: string; title: string; questions: ProtocolFlatQuestion[] }>()
  protocolQuestions.forEach(q => {
    const existing = sectionsMap.get(q.sectionId)
    if (existing) {
      existing.questions.push(q)
    } else {
      sectionsMap.set(q.sectionId, {
        sectionId: q.sectionId,
        title: q.sectionTitle,
        questions: [q],
      })
    }
  })
  const protocolSections = Array.from(sectionsMap.values())

  const protocolColorClass = (() => {
    if (!protocolQuestions.length) return "bg-slate-400"
    const pid = protocolQuestions[0].protocolId
    if (pid === "protocol-fire") return "bg-red-500"
    if (pid === "protocol-police") return "bg-blue-500"
    if (pid === "protocol-ems") return "bg-green-500"
    return "bg-slate-400"
  })()

  // ---- Helpers ----
  const renderTranscript = (transcript?: string) => {
    if (!transcript) return "No transcript available"
    const lines = transcript.split("\n")
    return (
      <div className="space-y-5">
        {lines.map((line, index) => {

          // 🔥 Normalize speaker names
          line = line.replace(/^Operator:/, "Dispatcher:");
          line = line.replace(/^Call\s*Taker:/i, "Dispatcher:");
          line = line.replace(/^Customer:/, "Caller:");

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

          return (
            <div key={index} className="mb-4">
              <div className={cn("flex flex-col gap-2", isDispatcher ? "items-start" : "items-end")}>
                {chunks.map((chunk, ci) => (
                  <div key={ci} className={cn("flex flex-col mb-2 last:mb-0", isDispatcher ? "items-start" : "items-end")}>
                    <div
                      className={cn(
                        "max-w-[82%] px-3 py-2 rounded-lg text-sm leading-relaxed",
                        isDispatcher
                          ? "bg-muted/30 text-foreground border border-border"   // LEFT (Dispatcher)
                          : "bg-primary/10 text-foreground border border-primary/20", // RIGHT (Caller)
                      )}
                    >
                      <>
                        <span className={cn(
                          "font-semibold",
                          isDispatcher ? "text-blue-600" : "text-purple-600"
                        )}>
                          {isDispatcher ? "Dispatcher:" : "Caller:"}
                        </span>{" "}
                        {chunk}
                      </>
                    </div>
                  </div>
                ))}
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

                <div className={cn(
                  "grid transition-all duration-300 ease-in-out overflow-hidden",
                  showTable ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}>
                  <div className="overflow-hidden">
                    <div className="px-3 sm:px-6 py-4 overflow-hidden h-[32vh] sm:h-[38vh] md:h-[46vh]">
                      <div className="border border-border/50 rounded-lg bg-card overflow-hidden h-full">
                        <div className="h-full overflow-y-auto">
                          <table className="w-full">
                            <thead className="sticky top-0 z-10 bg-card">
                              <tr className="border-b border-border/50">
                                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-2.5">Date</th>
                                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-2.5">Resource</th>
                                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-2.5">Agency</th>
                                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-2.5">Call Type</th>
                                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-2.5">Status</th>
                                <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-2.5">Score</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredEvaluations.map((evaluation, idx) => (
                                <tr
                                  key={evaluation._id}
                                  onClick={() => handleSelectEvaluationChange(evaluation)}
                                  className={cn(
                                    "border-b border-border/50 cursor-pointer transition-colors hover:bg-muted/80",
                                    idx % 2 !== 1 && "bg-muted/30",
                                    selectedEvaluation?._id === evaluation._id && "bg-primary/30"
                                  )}
                                >
                                  <td className="px-4 py-3">
                                    <p className="text-sm font-medium text-foreground">
                                      {evaluation.created_at
                                        ? new Date(evaluation.created_at).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                          })
                                        : "-"}
                                    </p>
                                  </td>
                                  <td className="px-4 py-3">
                                    <p className="text-sm font-medium text-foreground">{evaluation.dispatcher_id}</p>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex flex-col gap-1">
                                      {evaluation.callType?.map((item, index) => (
                                        <p key={index} className="text-sm font-medium text-foreground">
                                          {item.agency}
                                        </p>
                                      ))}
                                    </div>
                                  </td>

                                  <td className="px-4 py-3">
                                    <div className="flex flex-col gap-1">
                                      {evaluation.callType?.map((item, index) => (
                                        <p key={index} className="text-sm font-medium text-foreground">
                                          {item.specific_emergency}
                                        </p>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <Badge variant="outline" className="text-xs">
                                      {evaluation.callEvaluationType}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <Badge
                                      variant={getScoreBadgeVariant(evaluation.score ?? 0)}
                                      className="text-xs font-semibold"
                                    >
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
                  </div>
                </div>
              </Card>

              {/* Bottom: grid that collapses on small screens */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-hidden">
                {/* LEFT: Audio + Tabs in one card; remove fixed height on mobile */}
                <Card className="flex flex-col border border-border/50 bg-card rounded-lg md:h-[min(64vh,100%)]">
                  {/* Audio */}
                  <div className="p-3 sm:p-4 border-b border-border/50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-foreground">Audio Player</h3>
                      <span className="text-xs text-muted-foreground">
                        {calTime(selectedEvaluation?.duration_seconds) || 0}
                      </span>
                    </div>

                    <AudioPlayerWithWaveformV2 />
                  </div>

                  {/* Tabs */}
                  <div className="flex-1 flex flex-col">
                    <div className="shrink-0 border-b border-border/50 bg-card px-3">
                      <Tabs defaultValue="transcript" className="flex-1 flex flex-col">
                        <TabsList className="h-10 bg-transparent flex-nowrap overflow-x-auto -mx-3 px-3 md:overflow-visible flex w-full">
                          <TabsTrigger
                            value="transcript"
                            className="flex-1 text-center text-[11px] sm:text-xs px-2 sm:px-3 data-[state=active]:bg-muted"
                          >
                            Call Transcript
                          </TabsTrigger>

                          <TabsTrigger
                            value="summary"
                            className="flex-1 text-center text-[11px] sm:text-xs px-2 sm:px-3 data-[state=active]:bg-muted"
                          >
                            Call Summary
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
                      </Tabs>
                    </div>
                  </div>
                </Card>

                {/* RIGHT: QA (now includes right-column summary/actions merged in) */}
                <Card className="md:col-span-2 flex flex-col overflow-hidden border border-border/50 bg-card rounded-lg">
                  <div ref={qaRef} className="shrink-0 border-b border-border/50 bg-card px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center border border-border/50 shrink-0">
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-sm font-bold text-foreground">QA Evaluation</h2>
                        <p className="text-[11px] text-muted-foreground truncate">Automated evaluation based on ANS 1.107.1-2015 standards</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 shrink-0 lg:flex lg:flex-row lg:items-center">
                      {activeTab === "fullform" && (
                        <>
                          <Button
                            size="sm"
                            variant={isEditing ? "secondary" : "outline"}
                            className="h-8 text-xs px-2 animate-in fade-in slide-in-from-left-2 duration-200"
                            onClick={() => {
                              setIsEditing((v) => !v)
                            }}
                          >
                            <PencilLine className="h-3.5 w-3.5 mr-1.5" />
                            {isEditing ? "Cancel" : "Edit"}
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
                          Update Form
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
                              <div className={cn("text-3xl font-bold mb-0.5", getScoreColor(score))}>
                                {score}%
                              </div>
                              <p className="text-[11px] text-muted-foreground">
                                {metStandards} of {metStandards + criticalViolations} Standards
                              </p>
                            </div>
                          </Card>

                          {/* Progress Bar */}
                          <Card className="p-3 bg-card border border-border/50 rounded-lg">
                            <h3 className="text-[12px] font-semibold text-foreground mb-1">Evaluation Status</h3>
                            <div className="text-center">
                              <ProgressBar
                                key={progressRefreshKey}
                                currentStep={selectedEvaluation?.callEvaluationType || "Unable to load Status Bar"}
                              />
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
                              <span className="text-xs font-medium text-foreground">{calTime(selectedEvaluation?.duration_seconds)}</span>
                            </div>
                          </div>
                        </Card>
                      </TabsContent>

                      {/* Full Form Tab */}
                      <TabsContent value="fullform" className="flex-1 overflow-y-auto mt-0">
                        <div className="space-y-4">
                          {/* Core QA (first 4 AI/standard questions) */}
                          {coreEntries.length > 0 && (
                            <Card className="p-3 bg-card border border-border/50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xs font-semibold text-foreground">
                                  Core QA Checklist
                                </h3>
                                <span className="text-[11px] text-muted-foreground">
                                  {coreEntries.length} items
                                </span>
                              </div>
                              <div className="space-y-2">
                                {coreEntries.map(([question, qa]) => {
                                  const val = (isEditing ? qaAnalysisTemp?.[question]?.Answer : qa.Answer) as QaValue
                                  const proof = qa.Proof || ""

                                  return (
                                    <div key={question} className="border border-border/50 rounded-lg bg-card overflow-hidden">
                                      <div className="flex items-center justify-between p-3 gap-3">
                                        <span className="text-sm text-foreground flex-1">{question}</span>

                                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                                          <Button
                                            size="sm"
                                            variant={val === "Yes" ? "default" : "outline"}
                                            className={qaBtn(val === "Yes", "Yes")}
                                            onClick={() => updateQaDraft(question, "Yes")}
                                            aria-disabled={!isEditing}
                                          >
                                            Yes
                                          </Button>

                                          <Button
                                            size="sm"
                                            variant={val === "No" ? "destructive" : "outline"}
                                            className={qaBtn(val === "No", "No")}
                                            onClick={() => updateQaDraft(question, "No")}
                                            aria-disabled={!isEditing}
                                          >
                                            No
                                          </Button>

                                          <Button
                                            size="sm"
                                            variant={val === "Refused" ? "default" : "outline"}
                                            className={qaBtn(val === "Refused", "Refused")}
                                            onClick={() => updateQaDraft(question, "Refused")}
                                            aria-disabled={!isEditing}
                                          >
                                            Refused
                                          </Button>

                                          <Button
                                            size="sm"
                                            variant={val === "N/A" ? "default" : "outline"}
                                            className={qaBtn(val === "N/A", "N/A")}
                                            onClick={() => updateQaDraft(question, "N/A")}
                                            aria-disabled={!isEditing}
                                          >
                                            N/A
                                          </Button>

                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 w-7 p-0"
                                            onClick={() => toggleQuestion(question)}
                                          >
                                            {expandedQuestions.has(question) ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                          </Button>
                                        </div>
                                      </div>

                                      <div className={cn(
                                        "grid transition-all duration-300 ease-in-out overflow-hidden",
                                        expandedQuestions.has(question) ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                      )}>
                                        <div className="overflow-hidden">
                                          <div className="px-3 pb-3 pt-0 border-t border-border/50 bg-muted">
                                            <div className="mt-2">
                                              <p className="text-xs text-muted-foreground mb-1">Evidence from Transcript:</p>
                                              <p className="text-xs text-foreground bg-muted/70 rounded p-2 leading-relaxed border border-border/50">
                                                {proof}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </Card>
                          )}

                          {/* Protocol sections: Interview, CAD, Telephone, Supervisor etc. */}
                          {protocolSections.map(section => (
                            <Card key={section.sectionId} className="p-3 bg-card border border-border/50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className={cn("h-2.5 w-2.5 rounded-full", protocolColorClass)} />
                                  <span className="text-xs font-semibold text-foreground">
                                    {section.title}
                                  </span>
                                </div>
                                <span className="text-[11px] text-muted-foreground">
                                  {section.questions.length} items
                                </span>
                              </div>

                              <div className="space-y-2">
                                {section.questions.map(q => {
                                  const qaObj = qaAnalysis[q.question] ?? { Answer: "N/A" as QaValue, Proof: "" }
                                  const val = (isEditing
                                    ? (qaAnalysisTemp?.[q.question]?.Answer ?? qaObj.Answer)
                                    : qaObj.Answer) as QaValue
                                  const proof = qaObj.Proof || ""
                                  const key = q.question

                                  return (
                                    <div key={key} className="border border-border/50 rounded-lg bg-card overflow-hidden">
                                      <div className="flex items-center justify-between p-3 gap-3">
                                        <span className="text-sm text-foreground flex-1">{q.question}</span>

                                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                                          <Button
                                            size="sm"
                                            variant={val === "Yes" ? "default" : "outline"}
                                            className={qaBtn(val === "Yes", "Yes")}
                                            onClick={() => updateQaDraft(key, "Yes")}
                                            aria-disabled={!isEditing}
                                          >
                                            Yes
                                          </Button>

                                          <Button
                                            size="sm"
                                            variant={val === "No" ? "destructive" : "outline"}
                                            className={qaBtn(val === "No", "No")}
                                            onClick={() => updateQaDraft(key, "No")}
                                            aria-disabled={!isEditing}
                                          >
                                            No
                                          </Button>

                                          <Button
                                            size="sm"
                                            variant={val === "Refused" ? "default" : "outline"}
                                            className={qaBtn(val === "Refused", "Refused")}
                                            onClick={() => updateQaDraft(key, "Refused")}
                                            aria-disabled={!isEditing}
                                          >
                                            Refused
                                          </Button>

                                          <Button
                                            size="sm"
                                            variant={val === "N/A" ? "default" : "outline"}
                                            className={qaBtn(val === "N/A", "N/A")}
                                            onClick={() => updateQaDraft(key, "N/A")}
                                            aria-disabled={!isEditing}
                                          >
                                            N/A
                                          </Button>

                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 w-7 p-0"
                                            onClick={() => toggleQuestion(key)}
                                          >
                                            {expandedQuestions.has(key) ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                          </Button>
                                        </div>
                                      </div>

                                      <div className={cn(
                                        "grid transition-all duration-300 ease-in-out overflow-hidden",
                                        expandedQuestions.has(key) ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                      )}>
                                        <div className="overflow-hidden">
                                          <div className="px-3 pb-3 pt-0 border-t border-border/50 bg-muted">
                                            <div className="mt-2">
                                              <p className="text-xs text-muted-foreground mb-1">Evidence from Transcript:</p>
                                              <p className="text-xs text-foreground bg-muted/70 rounded p-2 leading-relaxed border border-border/50">
                                                {proof}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </Card>
                          ))}
                        </div>

                        {/* Action bar: sticky on mobile, normal on md+ */}
                        {isEditing && (
                          <div className="md:static md:mt-4 sticky bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border/50 px-3 py-2 flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={handleResetChanges}>
                              <RotateCcw className="h-3.5 w-3.5 mr-2" />
                              Reset Changes
                            </Button>
                            <Button size="sm" onClick={handleClickSave}>
                              <Save className="h-3.5 w-3.5 mr-2" />
                              Save Changes
                            </Button>
                          </div>
                        )}
                        {!isEditing && (
                          <div className="md:static md:mt-4 sticky bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border/50 px-3 py-2 flex justify-end gap-2">
                            <p className="text-[11px] text-muted-foreground truncate content-center">On completing the evalution mark it as Completed</p>
                            <Button size="sm" onClick={handleMarkCompleted}>
                              Mark Completed
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
        <AddQuestionDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onAdded={() => { getQaQuestions() }}
        />

        {/* ⬇️ NEW: Export dialog */}
        <ExportReportDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          onExport={handleDialogExport}
          isExporting={isExporting}
        />
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