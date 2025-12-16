"use client";

import { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import CustomDataTable from "@/components/custom-data-table";
import { ColumnDef } from "@tanstack/react-table";
import DateInput from "@/components/ui/date-input";

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
  Filter,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AddQuestionDrawer } from "@/components/add-question-drawer";
import AudioPlayerWithWaveformV2 from "@/components/audio-player-with-waveform-v2";
import ProgressBar from "@/components/progress-bar";
import { ExportReportDialog } from "@/components/export-report-dialog";
import ProtectedPage from "@/components/protectedPage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Environment-based API configuration (same pattern as other pages)
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "https://inform-ai-backend.onrender.com";
const USE_PROXY = process.env.NEXT_PUBLIC_USE_PROXY === "true";

// Helper to get the correct API URL based on environment
const getApiUrl = (path: string) => {
  if (USE_PROXY) {
    // In production, route through Next.js API proxy
    return `/api/proxy${path}`;
  }
  // In development, connect directly to backend
  return `${API_BASE}${path}`;
};

// ------- QA state (view vs draft) -------
type QaValue =
  | "yes"
  | "no"
  | "refused"
  | "na"
  | "Yes"
  | "No"
  | "Refused"
  | "N/A"
  | "";
type QaResults = Record<string, QaValue>;

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
  source?: "ai" | "human";
  comment?: string;
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

    //Required sampling fields (from backend)
  required?: boolean;
  required_strategy?: string | null;
  required_assigned_at?: string | null;


  created_at?: string; // ISO string from backend

  stored_audio?: string; // if we later store audio URL
}

interface CallAnalysis {
  [question_id: string]: {
    Answer: QaValue;
    Proof: string;
    source?: "ai" | "human";
    comment?: string;
  };
}

// 🔹 Flattened protocol question interface from /protocols/forCall/{callId}
interface ProtocolFlatQuestion {
  protocolId: string;
  protocolName: string;
  sectionId: string;
  sectionTitle: string;
  questionId: string;
  question: string;
  points?: number;
  prompt?: string;
  isActive?: boolean;
  allowedAnswers?: [string];
}

export default function EvaluationsPage() {
  // switched to string keys so we can group questions and still track expand/collapse
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set()
  );
  // collapsedSections holds sectionId strings for sections that are collapsed
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [agencyFilter, setAgencyFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [showTable, setShowTable] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [qaQuestionsSet, setQaQuestionsSet] = useState<QAQuestion[]>([]);
  const [callList, setCallList] = useState<CallData[]>([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState<CallData | null>(
    null
  );
  const [metStandards, setMetStandards] = useState<number>(0);
  const [criticalViolations, setCriticalViolations] = useState<number>(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 🔄 DEFAULT TAB NOW FULL FORM
  const [activeTab, setActiveTab] = useState<string>("fullform");

  const { toast } = useToast();
  const router = useRouter();
  const [score, setScore] = useState<number>(0);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [qaAnalysisTemp, setQaAnalysisTemp] = useState<CallAnalysis>({});
  const [qaAnalysis, setQaAnalysis] = useState<CallAnalysis>({});
  const [protocolQuestions, setProtocolQuestions] = useState<
    ProtocolFlatQuestion[]
  >([]);
  const [progressRefreshKey, setProgressRefreshKey] = useState<number>(0);
  const [humanEditedKeys, setHumanEditedKeys] = useState<Set<string>>(new Set());

  // Existing mock waveform bars (still unused but left in case)
  const bars = [...Array(60)].map(() => Math.floor(Math.random() * 100));

  const qaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    getCallData();
    getQaQuestions();
    setIsEditing(false);
      setHumanEditedKeys(new Set());
  }, []);

  const handleClickSave = async () => {
  if (!selectedEvaluation?._id) return;

  const cleanedAnalysis = Object.fromEntries(
    Object.entries(qaAnalysisTemp ?? {}).map(([key, value]) => {
      const ans = (value as any)?.Answer ?? "";
      const normalized = String(ans ?? "").trim();

      // Get original values to check if anything changed
      const originalAnswer = (qaAnalysis as any)?.[key]?.Answer ?? "";
      const originalComment = (qaAnalysis as any)?.[key]?.comment ?? "";
      const currentComment = (value as any)?.comment ?? "";

      // Check if answer or comment was modified
      const answerChanged = String(normalized).trim() !== String(originalAnswer).trim();
      const commentChanged = String(currentComment).trim() !== String(originalComment).trim();
      const isHumanEdited = humanEditedKeys.has(key);
// Determine source:
// - If user touched it (answer/comment changed) OR in humanEditedKeys, force "human"
// - Else if answered, keep existing source or default to "ai"
// - Else (blank + untouched), omit source
const touched = isHumanEdited || answerChanged || commentChanged;

const existingSource =
  (value as any)?.source ?? (qaAnalysis as any)?.[key]?.source;

// Keep a source even when Answer is blank.
// If we truly don't know, default to "human" (matches your backend behavior).
const source = touched ? "human" : existingSource;

const commentRaw = currentComment;
const comment =
  typeof commentRaw === "string" && commentRaw.trim().length > 0
    ? commentRaw
    : undefined;

const payload: any = {
  Answer: (value as any)?.Answer ?? "",
  Proof: (value as any)?.Proof ?? "",
  comment,
};

if (source) {
  payload.source = source;
}

return [key, payload];
    })
  );

  try {
    const res = await fetch(getApiUrl(`/calls/update`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedEvaluation._id,
        changedAnalysis: cleanedAnalysis,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast({ title: "Failed to save changes", variant: "destructive" });
      return;
    }

    toast({
      title: "Saved",
      description: "QA Evaluation Updated (Status: Validating)",
    });

    const updatedEvaluation = {
      ...selectedEvaluation,
      qa_analysis: cleanedAnalysis,
      score: data.newScore,
      callEvaluationType: "Validating",
    };

    const updatedCallList = callList.map((call) =>
      call._id === selectedEvaluation._id ? updatedEvaluation : call
    );

    setCallList(updatedCallList);
    setSelectedEvaluation(updatedEvaluation);
    setScore(data.newScore);
    setQaAnalysis(cleanedAnalysis);
    setQaAnalysisTemp(cleanedAnalysis);
    setIsEditing(false);
    setHumanEditedKeys(new Set()); // Clear edited keys after save

    const yesCount = Object.values(cleanedAnalysis ?? {}).filter(
      (item) => item.Answer === "Yes"
    ).length;

    const noCount = Object.values(cleanedAnalysis ?? {}).filter(
      (item) => item.Answer === "No"
    ).length;

    setMetStandards(yesCount);
    setCriticalViolations(noCount);

    setProgressRefreshKey((prev) => prev + 1);
  } catch (error) {
    console.error(error);
    toast({ title: "Unexpected error", variant: "destructive" });
  }
};

  const handleMarkCompleted = async () => {
    if (!selectedEvaluation) return;

    const res = await fetch(
      getApiUrl(`/calls/updateEvaluationStatus?id=${selectedEvaluation._id}`),
      {
        method: "PATCH",
      }
    );

    const data = await res.json();

    if (res.ok) {
      toast({ title: "Updated Evaluation Status (Status: Completed)" });
    }

    const updatedEvaluation = {
      ...selectedEvaluation,
      callEvaluationType: "Completed",
    };

    const merged = callList.map((call) =>
      call._id === selectedEvaluation._id ? updatedEvaluation : call
    );

    // ✅ Both states must be updated
    setCallList(merged);
    setSelectedEvaluation(updatedEvaluation);
    setProgressRefreshKey((prev) => prev + 1);
  };

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
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const handleSelectEvaluationChange = (evaluation: CallData) => {
    setSelectedEvaluation(evaluation);
    setHumanEditedKeys(new Set());

    const qa = evaluation.qa_analysis ?? {};

    const yesCount = Object.values(qa).filter(
      (item) => item.Answer?.toLowerCase() === "yes"
    ).length;

    const noCount = Object.values(qa).filter(
      (item) => item.Answer?.toLowerCase() === "no"
    ).length;

    setMetStandards(yesCount);
    setCriticalViolations(noCount);
    setScore(evaluation.score ?? 0);

    setQaAnalysisTemp(qa);
    setQaAnalysis(qa);
    setProtocolQuestions([]);

    // 🔥 Append protocol questions for this specific call
    loadProtocolQuestionsForCall(evaluation);

    // Collapse the top table so the QA/Audio section has focus
    setShowTable(false);
  };

  const updateQaDraft = (key: string, value: QaValue) => {
  if (!isEditing) return;

  // Touch = human immediately (even if value is blank/unchanged)
  setHumanEditedKeys((prev) => {
    const next = new Set(prev);
    next.add(key);
    return next;
  });

  setQaAnalysisTemp((prev) => ({
    ...(prev ?? {}),
    [key]: {
      Answer: value,
      Proof: prev?.[key]?.Proof ?? "",
      source: "human", // always human once touched
      comment: prev?.[key]?.comment ?? "",
    },
  }));
};

const updateQaComment = (key: string, comment: string) => {
  if (!isEditing) return;

  // Touch = human immediately (even if comment is blank/unchanged)
  setHumanEditedKeys((prev) => {
    const next = new Set(prev);
    next.add(key);
    return next;
  });

  setQaAnalysisTemp((prev) => ({
    ...(prev ?? {}),
    [key]: {
      Answer: prev?.[key]?.Answer ?? "",
      Proof: prev?.[key]?.Proof ?? "",
      source: "human", // always human once touched
      comment,
    },
  }));
};

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  const handleExportReport = () => {
    setExportDialogOpen(true);
  };

  const handleDialogExport = async (options: {
    includeForm: boolean;
    includeTranscript: boolean;
    includeAudioLink: boolean;
  }) => {
    if (!selectedEvaluation) {
      toast({
        title: "No call selected",
        description: "Please select an evaluation before exporting.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      const doc = new jsPDF();
      const qaSource = qaAnalysisTemp ?? qaAnalysis ?? {};
      let y = 10;
      const left = 10;
      const lineHeight = 7;
      const maxWidth = 180; // page width minus margins
      const bottomMargin = 280; // when to start a new page

      // Helper: add wrapped text with per-line page break handling
      const addWrappedText = (text: string, opts: { bold?: boolean } = {}) => {
        if (opts.bold) {
          doc.setFont("helvetica", "bold");
        } else {
          doc.setFont("helvetica", "normal");
        }

        const lines = doc.splitTextToSize(text, maxWidth);

        lines.forEach((line: string) => {
          if (y > bottomMargin) {
            doc.addPage();
            y = 10;
          }
          doc.text(line, left, y);
          y += lineHeight;
        });
      };

      const addLine = (text: string, opts: { bold?: boolean } = {}) => {
        addWrappedText(text, opts);
      };

      const addSectionTitle = (title: string) => {
        if (y + lineHeight > bottomMargin) {
          doc.addPage();
          y = 10;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(title, left, y);
        y += lineHeight;
        doc.setFontSize(11);
      };

      // -------- HEADER --------
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Evaluation Report", left, y);
      y += 10;
      doc.setFontSize(11);

      addSectionTitle("Call Information");
      addLine(`Operator: ${selectedEvaluation.dispatcher_id || "N/A"}`);
      addLine(`Call ID: ${selectedEvaluation.call_id || "N/A"}`);
      addLine(`Call Type: ${selectedEvaluation.callType || "N/A"}`);
      addLine(
        `Evaluation Type: ${selectedEvaluation.callEvaluationType || "N/A"}`
      );
      addLine(
        `Date / Time: ${selectedEvaluation.created_at
          ? new Date(selectedEvaluation.created_at).toLocaleString()
          : "N/A"
        }`
      );
      addLine(`Duration: ${calTime(selectedEvaluation.duration_seconds)}`);

      // -------- SCORES --------
      addSectionTitle("Scores & Compliance");
      addLine(`Overall Score: ${score}%`);
      addLine(`Standards Met: ${metStandards}`);
      addLine(`Not Met (Critical): ${criticalViolations}`);
      addLine(
        `Total Standards Evaluated: ${metStandards + criticalViolations || "N/A"
        }`
      );

      // -------- SUMMARY --------
      addSectionTitle("Call Summary");
      addLine(selectedEvaluation.summary || "No summary available");

      // -------- QA FORM --------
      if (options.includeForm) {
        addSectionTitle("QA Evaluation");

        qaQuestionsSet.forEach((q, index) => {
          const a = qaSource[q._id]?.Answer ?? "";
          const proof = qaSource[q._id]?.Proof ?? "";

          addLine(`Q${index + 1}: ${q.editedQuestion}`, { bold: true });
          addLine(`Answer: ${a}`);
          addLine(`AI Confidence: ${q.confidence}%`);
          if (proof) {
            addLine(`Evidence: ${proof}`);
          }
          y += 3; // small spacer between questions
        });
      }

      // -------- TRANSCRIPT --------
      if (options.includeTranscript && selectedEvaluation.transcript) {
        addSectionTitle("Call Transcript");
        addWrappedText(selectedEvaluation.transcript);
      }

      // -------- AUDIO LINK --------
      if (options.includeAudioLink && selectedEvaluation.stored_audio) {
        addSectionTitle("Audio Recording");
        addLine(`URL: ${selectedEvaluation.stored_audio}`);
      }

      const fileName = `evaluation-${selectedEvaluation.call_id || selectedEvaluation._id
        }.pdf`;

      doc.save(fileName);

      toast({
        title: "Export complete",
        description: "Your evaluation report PDF has been downloaded.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Export failed",
        description: "There was a problem generating the report.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setExportDialogOpen(false);
    }
  };

  const handleGenerateCoaching = () => {
    toast({
      title: "AI Coaching Task Created",
      description: `Coaching task created for ${selectedEvaluation?.dispatcher_id}`,
    });
    router.push("/coaching");
  };

  const handleResetChanges = () => {
    setQaAnalysisTemp(selectedEvaluation?.qa_analysis ?? {});
    setHumanEditedKeys(new Set());
    toast({
      title: "Draft reset",
      description: "Reverted to last saved answers.",
    });
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setAgencyFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  // Update filtered evaluations
  const filteredEvaluations = callList.filter((evaluation) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q.length === 0 ||
      (evaluation.dispatcher_id?.toLowerCase().includes(q) ?? false) ||
      (evaluation.call_id?.toLowerCase().includes(q) ?? false);

    const matchesStatus =
      statusFilter === "all" || evaluation.callEvaluationType === statusFilter;

    const matchesAgency =
      agencyFilter === "all" ||
      evaluation.callType?.some((ct) => ct.agency === agencyFilter);

    // Date range filter
    let matchesDate = true;
    if (evaluation.created_at) {
      const createdAt = new Date(evaluation.created_at);
      if (!isNaN(createdAt.getTime())) {
        if (dateFrom) {
          const from = new Date(dateFrom);
          if (!isNaN(from.getTime())) {
            matchesDate = matchesDate && createdAt >= from;
          }
        }
        if (matchesDate && dateTo) {
          const to = new Date(dateTo);
          if (!isNaN(to.getTime())) {
            to.setHours(23, 59, 59, 999);
            matchesDate = matchesDate && createdAt <= to;
          }
        }
      }
    }

    return matchesSearch && matchesStatus && matchesAgency && matchesDate;
  });

  const qaQuestions = [
    {
      confidence: 95,
      evidence:
        "Operator: 'Can you tell me your exact address?' Caller: '123 Main Street, apartment 4B.'",
    },
    {
      confidence: 88,
      evidence: "Operator confirmed callback number at 00:45 in the call.",
    },
    {
      confidence: 92,
      evidence:
        "Caller: 'I'm having chest pain, it's really bad.' Nature clearly identified as medical emergency.",
    },
    {
      confidence: 45,
      evidence: "No explicit request for caller's name found in transcript.",
    },
    {
      confidence: 78,
      evidence:
        "Operator: 'Are you having trouble breathing?' Safety assessment performed.",
    },
    {
      confidence: 52,
      evidence: "Callback number not explicitly confirmed in transcript.",
    },
    {
      confidence: 98,
      evidence:
        "Operator: 'Help is on the way.' Ambulance dispatched at 00:30.",
    },
  ] as const;

  const getQaQuestions = async () => {
    const res = await fetch(getApiUrl("/questionSet"));
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
    if (!evaluation?._id) return;

    try {
      const res = await fetch(
        getApiUrl(`/protocols/forCall/${evaluation._id}`),
        {
          cache: "no-store",
        }
      );

      if (!res.ok) {
        console.error(
          "Failed to fetch protocol questions for call",
          evaluation._id
        );
        return;
      }

      const protocolQs: ProtocolFlatQuestion[] = await res.json();

      if (!protocolQs || protocolQs.length === 0) {
        setProtocolQuestions([]);
        return;
      }

      setProtocolQuestions(protocolQs);

      // Merge into QA analysis as additional questions (default N/A, empty Proof)
      setQaAnalysis((prev) => {
        const base = { ...(prev ?? {}) };
        for (const q of protocolQs) {
          if (!base[q.question]) {
            base[q.question] = {
              Answer: "",
              Proof: "",
            };
          }
        }
        return base;
      });

      setQaAnalysisTemp((prev) => {
        const base = { ...(prev ?? {}) };
        for (const q of protocolQs) {
          if (!base[q.question]) {
            base[q.question] = {
              Answer: "",
              Proof: "",
            };
          }
        }
        return base;
      });

      // We do NOT touch metStandards / criticalViolations here.
      // These protocol questions start as N/A and don't affect scoring
      // until the evaluator manually selects Yes / No.
    } catch (err) {
      console.error("Error loading protocol questions for call:", err);
    }
  };

  const getCallData = async () => {
    const res = await fetch(getApiUrl("/calls"), { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch call data");
    const data = await res.json();
    setCallList(data);
    try {
      if (data?.length > 0) {
        const first = data[0];

        const analysis: CallAnalysis = first?.qa_analysis ?? {};

        const answers = Object.values(analysis).map((item) => item.Answer);

        const score = first?.score ?? 0;

        setSelectedEvaluation(first);

        const met = answers.filter((ans) => ans === "Yes").length;
        const crit = answers.filter((ans) => ans === "No").length;

        setMetStandards(met);
        setCriticalViolations(crit);

        setQaAnalysisTemp(analysis);
        setQaAnalysis(analysis);
        setScore(score);
        setProtocolQuestions([]);

        // 🔥 NEW: also load protocol-specific questions (Fire / Medical / Police)
        await loadProtocolQuestionsForCall(first);
      }
    } catch (error) {
      console.error("Error fetching calls:", error);
    }
  };

  // Buttons: look normal when locked, shrink & wrap on small screens
  const qaBtn = (active: boolean, kind: QaValue) => {
    const base = "h-7 px-2 text-[11px] sm:text-xs sm:px-2.5 border";
    if (!active) return base;
    switch (kind) {
      case "yes":
      case "Yes":
        return cn(
          base,
          "bg-primary text-primary-foreground border-transparent hover:opacity-90"
        );
      case "no":
      case "No":
        return cn(
          base,
          "bg-red-600 text-white border-transparent hover:bg-red-700"
        );
      case "refused":
      case "Refused":
        return cn(
          base,
          "bg-amber-500 text-white border-transparent hover:bg-amber-600"
        );
      case "na":
      case "N/A":
        return cn(
          base,
          "bg-violet-600 text-white border-transparent hover:bg-violet-700"
        );
    }
  };

  //Core QA questions we always want in the Core QA Checklist
  const CORE_QUESTIONS = new Set<string>([
    "Did the dispatcher ask for or confirm the location of the incident (street name, number, landmark, etc)?",
    "Were safety concerns for the caller assessed?",
    "Did the dispatcher ask or confirm the caller's phone number?",
    "Did the dispatcher ask or confirm the caller's name?",
  ]);

  // ---- Derived grouping for protocol-style layout ----

  // Current protocol questions (from /protocols/forCall)
  const protocolQuestionTexts = new Set(
    protocolQuestions.map((q) => q.question)
  );

  // All QA entries stored on the call (may include old legacy keys)
  const allEntries = Object.entries(qaAnalysis ?? {});

  // Core QA: only the 4 whitelisted questions
  //    This prevents old, no-longer-used keys from flooding the Core section.
  const coreEntries = allEntries.filter(([question]) =>
    CORE_QUESTIONS.has(question)
  );

  // Protocol sections stay the same – they use protocolQuestions.
  // Any legacy QA keys that are not in the current protocol are simply not rendered anywhere.
  const sectionsMap = new Map<
    string,
    { sectionId: string; title: string; questions: ProtocolFlatQuestion[] }
  >();
  protocolQuestions.forEach((q) => {
    const existing = sectionsMap.get(q.sectionId);
    if (existing) {
      existing.questions.push(q);
    } else {
      sectionsMap.set(q.sectionId, {
        sectionId: q.sectionId,
        title: q.sectionTitle,
        questions: [q],
      });
    }
  });
  const protocolSections = Array.from(sectionsMap.values());

  const protocolColorClass = (() => {
    if (!protocolQuestions.length) return "bg-slate-400";
    const pid = protocolQuestions[0].protocolId;
    if (pid === "protocol-fire") return "bg-red-500";
    if (pid === "protocol-police") return "bg-blue-500";
    if (pid === "protocol-ems") return "bg-green-500";
    return "bg-slate-400";
  })();

  // Hard-coded height per protocol / tab
  const getBottomHeightClass = () => {
    if (activeTab !== "fullform") {
      return "h-[60vh]"; // evaluation info height
    }
    const pid = protocolQuestions[0]?.protocolId;

    if (pid === "protocol-police") return "h-[345vh]"; // police height
    if (pid === "protocol-ems") return "h-[340vh]"; // medical height
    if (pid === "protocol-fire") return "h-[304vh]"; // fire height

    // fallback if no protocol or a new type shows up
    return "h-[250vh]";
  };

  // ---- Helpers ----
  const renderTranscript = (transcript?: string) => {
    if (!transcript) return "No transcript available";
    const lines = transcript.split("\n");
    return (
      <div className="space-y-5">
        {lines.map((line, index) => {
          // 🔥 Normalize speaker names
          line = line.replace(/^Operator:/, "Dispatcher:");
          line = line.replace(/^Call\s*Taker:/i, "Dispatcher:");
          line = line.replace(/^Customer:/, "Caller:");

          const match = line.match(/^(Dispatcher|Caller):\s*(.+)$/);
          let speaker: string | null = null;
          let text = line;
          if (match) {
            speaker = match[1];
            text = match[2];
          }

          const words = String(text || "")
            .trim()
            .split(/\s+/)
            .filter(Boolean);
          const chunks: string[] = [];
          for (let i = 0; i < words.length; i += 30) {
            chunks.push(words.slice(i, i + 30).join(" "));
          }

          const isDispatcher = speaker === "Dispatcher";

          return (
            <div key={index} className="mb-4">
              <div
                className={cn(
                  "flex flex-col gap-2",
                  isDispatcher ? "items-start" : "items-end"
                )}
              >
                {chunks.map((chunk, ci) => (
                  <div
                    key={ci}
                    className={cn(
                      "flex flex-col mb-2 last:mb-0",
                      isDispatcher ? "items-start" : "items-end"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[82%] px-3 py-2 rounded-lg text-sm leading-relaxed",
                        isDispatcher
                          ? "bg-muted/30 text-foreground border border-border" // LEFT (Dispatcher)
                          : "bg-primary/10 text-foreground border border-primary/20" // RIGHT (Caller)
                      )}
                    >
                      <>
                        <span
                          className={cn(
                            "font-semibold",
                            isDispatcher ? "text-blue-600" : "text-purple-600"
                          )}
                        >
                          {isDispatcher ? "Dispatcher:" : "Caller:"}
                        </span>{" "}
                        {chunk}
                      </>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Define table row shape for the data table
  type EvalRow = {
    id: string;
    date: string;
    dispatcher: string;
    agencies: string;
    callTypes: string;
    status: string;
    score: number;
  };

  // Build rows from filteredEvaluations
  const rows: any[] = filteredEvaluations.map((evaluation) => ({
    id: evaluation._id,
    date: evaluation.created_at
      ? new Date(evaluation.created_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      : "-",
    dispatcher: evaluation.dispatcher_id ?? "-",
    cadAgencies: (evaluation.callType ?? []).map((x) => x.agency).join(", "),
    aiAgencies: (evaluation.callType ?? []).map((x) => x.agency).join(", "),
    CallTypes: (evaluation.callType ?? [])
      .map((x) => x.specific_emergency)
      .join(", "),
      required: Boolean(evaluation.required),
    status: evaluation.callEvaluationType ?? "-",
    score: evaluation.score ?? 0,
  }));

  // Configure columns (enableSorting selectively)
  const columns: ColumnDef<EvalRow>[] = [
    {
      header: "Date",
      accessorFn: (row) => {
        const raw = (row as any)?.created_at ?? null
        const ts = raw ? new Date(raw).getTime() : new Date(row.date).getTime()
        return isNaN(ts) ? 0 : ts
      },
      id: "date",
      enableSorting: true,
      meta: { width: 110 },
      cell: ({ row }) => {
  const ts = row.getValue<number>("date")
  if (!ts) return "-"

  const formatted = new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

  const required = Boolean((row.original as any)?.required)

  return (
    <div className={cn(required ? "border-l-4 border-red-600 pl-2" : "")}>
      {formatted}
    </div>
  )
},
      sortingFn: "basic",
    },
    { header: "Resource", accessorKey: "dispatcher", enableSorting: true, meta: { width: 90, maxWidth: 90 } },
    { header: "CAD - Call Agency", accessorKey: "cadAgencies", meta: { width: 160, maxWidth: 160 } },
    { header: "AI - Call Agency", accessorKey: "aiAgencies", meta: { width: 150, maxWidth: 150 } },
    { header: "Call Type", accessorKey: "CallTypes", meta: { width: 100, maxWidth: 100 } },
    {
  header: "Required",
  accessorKey: "required",
  meta: { width: 90, maxWidth: 90 },
  cell: ({ row }) => {
    const required = Boolean((row.original as any)?.required)
    return (
      <div className="flex justify-center">
        {required ? (
          <CheckCircle className="h-4 w-4 text-red-600" />
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
      </div>
    )
  },
},

    {
      header: "Status",
      accessorKey: "status",
      meta: { width: 120 },
      cell: ({ getValue }) => (
        <Badge variant="outline" className="text-xs">
          {String(getValue() ?? "-")}
        </Badge>
      ),
    },
    {
      header: "Score",
      accessorKey: "score",
      meta: { width: 90 },
      cell: ({ getValue }) => (
        <Badge
          variant={getScoreBadgeVariant(Number(getValue()) || 0)}
          className="text-xs font-semibold"
        >
          {Number(getValue()) || 0}%
        </Badge>
      ),
      enableSorting: true,
    },
  ];

  
 const renderAnswerSourceIcon = (key: string, val?: QaValue) => {
  const effectiveAnswer = String(val ?? "").trim();

  const tempSource = (qaAnalysisTemp as any)?.[key]?.source;
  const storedSource = (qaAnalysis as any)?.[key]?.source;
  const isInEditedSet = humanEditedKeys.has(key);

  const isHuman = isInEditedSet || tempSource === "human" || storedSource === "human";

  // If there's no answer and nobody marked it human, no icon.
  if (!effectiveAnswer && !isHuman) return null;

  // If human, show human icon (whether answered or not).
  if (isHuman) {
    return (
      <span
        className="inline-flex items-center justify-center h-5 w-5"
        title="Manually set by human"
      >
        <User className="h-4 w-4 text-muted-foreground" />
      </span>
    );
  }

  // Otherwise it's AI (answered + not human)
  return (
    <span
      className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-slate-900/80"
      title="Auto-scored by AI"
    >
      <img
        src="/Ai-icon_white.svg"
        alt="Auto-scored by AI"
        className="h-3.5 w-3.5"
      />
    </span>
  );
};

return (
    <ProtectedPage required={["Evaluations"]}>
      <>
        <div className="w-full overflow-auto">
          <div className="mobile-scale">
            <div className="flex min-h-[calc(100vh-4rem)] bg-muted/30 rounded-lg">
              {/* LEFT & CENTER */}
              <div className="flex-1 flex flex-col overflow-hidden p-3 sm:p-4 gap-4">
                {/* Recent Evaluations */}
                <Card className="shrink-0 border border-border/50 bg-card rounded-lg">
                  <div className="px-3 sm:px-6 h-12 flex items-center justify-between border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-border/50">
                        <CheckCircle className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="text-sm sm:text-lg font-bold text-foreground">
                        Evaluations
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={showTable ? "Collapse" : "Expand"}
                        title={showTable ? "Collapse" : "Expand"}
                        onClick={() => setShowTable((v) => !v)}
                      >
                        {showTable ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Collapsible content wrapper */}
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-in-out",
                      showTable ? "max-h-[78vh] opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    {/* Filter section */}
                    <div className="px-3 sm:px-6 py-4 border-b border-border/50">
                      <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap lg:flex-wrap">

                        {/* Search */}
                        <div className="relative w-[250px] flex-shrink-0">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Search by operator or call ID"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                          />
                        </div>

                        {/* Status */}
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-[140px] flex-shrink-0">
                            <div className="flex items-center gap-2">
                              <Filter className="h-4 w-4" />
                              <SelectValue placeholder="All Status" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Validating">Validating</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Agency */}
                        <Select value={agencyFilter} onValueChange={setAgencyFilter}>
                          <SelectTrigger className="w-[160px] flex-shrink-0">
                            <div className="flex items-center gap-2">
                              <Filter className="h-4 w-4" />
                              <SelectValue placeholder="All CAD Agency" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All AI Agency</SelectItem>
                            <SelectItem value="Police">Police</SelectItem>
                            <SelectItem value="Medical">Medical</SelectItem>
                            <SelectItem value="Fire">Fire</SelectItem>
                          </SelectContent>
                        </Select>

                        <span className="text-sm flex-shrink-0">Date Range:</span>

                        <DateInput
                          // title="dd-mm-yyyy"
                          mode="date"
                          value={dateFrom}
                          onChange={setDateFrom}
                          className="w-[140px] flex-shrink-0"
                          placeholder="From Date"
                        />

                        <DateInput
                          // title="dd-mm-yyyy"
                          mode="date"
                          value={dateTo}
                          onChange={setDateTo}
                          className="w-[140px] flex-shrink-0"
                          placeholder="To Date"
                        />

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-xs font-medium text-primary ml-auto"
                          onClick={handleResetFilters}
                        >
                          Reset All Filters
                        </Button>
                      </div>
                    </div>


                    {/* Table section */}
                    <div
                      className={cn(
                        "px-3 sm:px-6 transition-all",
                        showTable ? "py-4 h-[44vh] sm:h-[50vh] md:h-[56vh]" : "py-0 h-0"
                      )}
                    >
                      <div className="border border-border/50 rounded-lg bg-card overflow-hidden h-full">
                        <CustomDataTable
                          columns={columns}
                          data={rows}
                          enableSorting={true}
                          enablePagination={true}
                          initialPageSize={10}
                          emptyMessage="No evaluations found"
                          tableHeight={showTable ? "h-full" : "h-0"}
                          stickyPagination={true}
                          onRowClick={(row: EvalRow) => {
                            const ev = callList.find(c => c._id === row.id);
                            if (ev) handleSelectEvaluationChange(ev);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Bottom: grid that collapses on small screens */}
                <div
                  className={cn(
                    "grid grid-cols-1 md:grid-cols-3 gap-4 h-[100vh]"
                  )}
                >
                  {/* LEFT: Audio + Tabs in one card; remove fixed height on mobile */}
                  <Card className="flex flex-col h-full border border-border/50 bg-card rounded-lg overflow-hidden">
                    {/* Audio */}
                    <div className="p-3 sm:p-4 border-b border-border/50">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-foreground">
                          Audio Player
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {calTime(selectedEvaluation?.duration_seconds) || 0}
                        </span>
                      </div>

                      <AudioPlayerWithWaveformV2 />
                    </div>

                    {/* Tabs */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <Tabs
                        defaultValue="transcript"
                        className="flex flex-col flex-1 overflow-hidden"
                      >
                        <div className="shrink-0 border-b border-border/50 bg-card px-3">
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
                        </div>
                        {/* Transcript Content */}
                        <TabsContent
                          value="transcript"
                          className="flex-1 overflow-y-auto p-3 sm:p-4 mt-0 bg-card"
                        >
                          <h3 className="text-xs font-semibold text-foreground mb-2">
                            Call Transcript
                          </h3>
                          <div className="text-xs text-foreground leading-relaxed">
                            {renderTranscript(selectedEvaluation?.transcript)}
                          </div>
                        </TabsContent>

                        {/* Summary Content */}
                        <TabsContent
                          value="summary"
                          className="flex-1 overflow-y-auto p-3 sm:p-4 mt-0 bg-card"
                        >
                          <h3 className="text-xs font-semibold text-foreground mb-2">
                            Call Summary
                          </h3>
                          <p className="text-xs text-foreground leading-relaxed bg-muted rounded-lg p-3">
                            {selectedEvaluation?.summary ||
                              "No summary available"}
                          </p>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </Card>

                  {/* RIGHT: QA (now includes right-column summary/actions merged in) */}
                  <Card className="md:col-span-2 flex flex-col h-full overflow-hidden border border-border/50 bg-card rounded-lg">
                    <div
                      ref={qaRef}
                      className="shrink-0 border-b border-border/50 bg-card px-4 py-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center border border-border/50 shrink-0">
                          <CheckCircle className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-sm font-bold text-foreground">
                            QA Evaluation
                          </h2>
                          <p className="text-[11px] text-muted-foreground truncate">
                            Automated evaluation based on ANS 1.107.1-2015
                            standards
                          </p>
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
                                setIsEditing((v) => !v);
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

                    <div className="flex-1 overflow-y-auto px-3 sm:px-4 bg-card">
                      {/* 🔄 Tabs: Full Form (left, default) + Evaluation Info (right) */}
                      <Tabs
                        defaultValue="fullform"
                        className="flex flex-col h-full"
                        onValueChange={setActiveTab}
                      >
                        <TabsList className="w-full bg-muted/50 p-1 rounded-lg mb-4">
                          <TabsTrigger
                            value="fullform"
                            className="flex-1 data-[state=active]:bg-card"
                          >
                            Full Form
                          </TabsTrigger>
                          <TabsTrigger
                            value="summary"
                            className="flex-1 data-[state=active]:bg-card"
                          >
                            Evaluation Information
                          </TabsTrigger>
                        </TabsList>

                        {/* ▶️ Evaluation Information TAB (right) */}
                        <TabsContent
                          value="summary"
                          className="flex-1 overflow-y-auto mt-0"
                        >
                          <Card className="p-4 bg-card border border-border/50 rounded-lg">
                            <h3 className="text-sm font-semibold text-foreground mb-3">
                              Evaluation Information
                            </h3>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">
                                  Operator
                                </span>
                                <span className="text-xs font-medium text-foreground">
                                  {selectedEvaluation?.dispatcher_id}
                                </span>
                              </div>
                              <Separator className="bg-border/50" />
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">
                                  Call ID
                                </span>
                                <span className="text-xs font-medium text-foreground">
                                  {selectedEvaluation?.call_id}
                                </span>
                              </div>
                              <Separator className="bg-border/50" />
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">
                                  Evaluation Type
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {selectedEvaluation?.callEvaluationType}
                                </Badge>
                              </div>
                              <Separator className="bg-border/50" />
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">
                                  Date / Time
                                </span>
                                <span className="text-xs font-medium text-foreground">
                                  {selectedEvaluation?.created_at
                                    ? new Date(
                                      selectedEvaluation.created_at
                                    ).toLocaleString()
                                    : "N/A"}
                                </span>
                              </div>
                              <Separator className="bg-border/50" />
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">
                                  Duration
                                </span>
                                <span className="text-xs font-medium text-foreground">
                                  {calTime(
                                    selectedEvaluation?.duration_seconds
                                  )}
                                </span>
                              </div>
                            </div>
                          </Card>
                        </TabsContent>

                        {/* ▶️ FULL FORM TAB (left / default) */}
                        <TabsContent
                          value="fullform"
                          className="flex-1 overflow-y-auto mt-0"
                        >
                          {/* 🔹 Row of summary cards now above form */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            {/* Compliance Summary */}
                            <Card className="p-3 bg-card border border-border/50 rounded-lg">
                              <h3 className="text-[12px] font-semibold text-foreground mb-1.5">
                                Compliance Summary
                              </h3>
                              <div className="flex items-center justify-around">
                                <div className="flex items-center gap-2">
                                  <div className="h-6 w-6 rounded bg-green-500/10 flex items-center justify-center border border-border/50">
                                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                  </div>
                                  <div>
                                    <p className="text-lg font-bold text-green-500 leading-none">
                                      {metStandards}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                      Met
                                    </p>
                                  </div>
                                </div>
                                <Separator
                                  orientation="vertical"
                                  className="h-8 bg-border/50"
                                />
                                <div className="flex items-center gap-2">
                                  <div className="h-6 w-6 rounded bg-red-500/10 flex items-center justify-center border border-border/50">
                                    <XCircle className="h-3.5 w-3.5 text-red-500" />
                                  </div>
                                  <div>
                                    <p className="text-lg font-bold text-red-500 leading-none">
                                      {criticalViolations}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                      Not Met
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </Card>

                            {/* QA Protocol Evaluation */}
                            <Card className="p-3 bg-card border border-border/50 rounded-lg">
                              <h3 className="text-[12px] font-semibold text-foreground mb-1.5">
                                QA Protocol Evaluation
                              </h3>
                              <div className="text-center">
                                <div
                                  className={cn(
                                    "text-3xl font-bold mb-0.5",
                                    getScoreColor(score)
                                  )}
                                >
                                  {score}%
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                  {metStandards} of{" "}
                                  {metStandards + criticalViolations} Standards
                                </p>
                              </div>
                            </Card>

                            {/* Progress Bar */}
                            <Card className="text-card-foreground flex flex-col gap-6 shadow-sm p-3 bg-card border border-border/50 rounded-lg col-span-2">
                              <h3 className="text-[12px] font-semibold text-foreground mb-1">
                                Evaluation Status
                              </h3>
                              <div className="text-center">
                                <ProgressBar
                                  key={progressRefreshKey}
                                  currentStep={
                                    selectedEvaluation?.callEvaluationType ||
                                    "Unable to load Status Bar"
                                  }
                                />
                              </div>
                            </Card>

                            {/* Quick Actions for small screens */}
                            <Card className="p-3 bg-card border border-border/50 rounded-lg sm:hidden">
                              <h3 className="text-[12px] font-semibold text-foreground mb-1.5">
                                Actions
                              </h3>
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

                          {/* ---- FULL FORM CONTENT (Core QA + protocol sections) ---- */}
                          <div className="space-y-4">
                            {/* Core QA (first 4 AI/standard questions) */}
                            {coreEntries.length > 0 && (
                              <Card className="p-0 bg-card border border-border/50 rounded-lg overflow-hidden">
                                <div
                                  className={cn(
                                    "flex items-center justify-between cursor-pointer",
                                    collapsedSections.has("core")
                                      ? "py-1 px-3"
                                      : "py-1.5 px-3"
                                  )}
                                  onClick={() => toggleSection("core")}
                                >
                                  <h3 className="text-xs font-semibold text-foreground">
                                    Core QA Checklist
                                  </h3>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[11px] text-muted-foreground">
                                      {coreEntries.length} items
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 w-7 p-0"
                                    >
                                      {collapsedSections.has("core") ? (
                                        <ChevronDown className="h-3.5 w-3.5" />
                                      ) : (
                                        <ChevronUp className="h-3.5 w-3.5" />
                                      )}
                                    </Button>
                                  </div>
                                </div>

                                <div
                                  className={cn(
                                    "grid transition-all duration-300 ease-in-out overflow-hidden",
                                    collapsedSections.has("core")
                                      ? "grid-rows-[0fr] opacity-0"
                                      : "grid-rows-[1fr] opacity-100"
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "overflow-hidden transition-all duration-200",
                                      collapsedSections.has("core")
                                        ? "p-0 max-h-0"
                                        : "pt-1 pb-3 px-3 max-h-[200vh]"
                                    )}
                                  >
                                    <div className="space-y-2">
                                      {coreEntries.map(([question, qa]) => {
                                        const val = (
                                          isEditing
                                            ? qaAnalysisTemp?.[question]?.Answer
                                            : qa.Answer
                                        ) as QaValue;
                                        const key = question;
                                        const proof = qa.Proof || "";
                                        const comment = (
                                          isEditing
                                            ? (qaAnalysisTemp as any)?.[question]?.comment
                                            : (qa as any)?.comment
                                        ) as string | undefined;

                                        return (
                                          <div
                                            key={question}
                                            className="border border-border/50 rounded-lg bg-card overflow-hidden"
                                          >
                                            <div className="flex items-center justify-between p-3 gap-3">
                                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <span className="text-sm text-foreground">
                                                  {question}
                                                </span>
                                              </div>

                                              <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                                                {renderAnswerSourceIcon(key, val)}

                                                <Button
                                                  size="sm"
                                                  variant={
                                                    val === "Yes"
                                                      ? "default"
                                                      : "outline"
                                                  }
                                                  className={qaBtn(
                                                    val === "Yes",
                                                    "Yes"
                                                  )}
                                                  onClick={() =>
                                                    updateQaDraft(
                                                      question,
                                                      "Yes"
                                                    )
                                                  }
                                                  aria-disabled={!isEditing}
                                                >
                                                  Yes
                                                </Button>

                                                <Button
                                                  size="sm"
                                                  variant={
                                                    val === "No"
                                                      ? "destructive"
                                                      : "outline"
                                                  }
                                                  className={qaBtn(
                                                    val === "No",
                                                    "No"
                                                  )}
                                                  onClick={() =>
                                                    updateQaDraft(
                                                      question,
                                                      "No"
                                                    )
                                                  }
                                                  aria-disabled={!isEditing}
                                                >
                                                  No
                                                </Button>

                                                <Button
                                                  size="sm"
                                                  variant={
                                                    val === "Refused"
                                                      ? "default"
                                                      : "outline"
                                                  }
                                                  className={qaBtn(
                                                    val === "Refused",
                                                    "Refused"
                                                  )}
                                                  onClick={() =>
                                                    updateQaDraft(
                                                      question,
                                                      "Refused"
                                                    )
                                                  }
                                                  aria-disabled={!isEditing}
                                                >
                                                  Refused
                                                </Button>

                                                <Button
                                                  size="sm"
                                                  variant={
                                                    val === "N/A"
                                                      ? "default"
                                                      : "outline"
                                                  }
                                                  className={qaBtn(
                                                    val === "N/A",
                                                    "N/A"
                                                  )}
                                                  onClick={() =>
                                                    updateQaDraft(
                                                      question,
                                                      "N/A"
                                                    )
                                                  }
                                                  aria-disabled={!isEditing}
                                                >
                                                  N/A
                                                </Button>

                                                <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  className="h-7 w-7 p-0"
                                                  onClick={() =>
                                                    toggleQuestion(question)
                                                  }
                                                >
                                                  {expandedQuestions.has(
                                                    question
                                                  ) ? (
                                                    <ChevronUp className="h-3.5 w-3.5" />
                                                  ) : (
                                                    <ChevronDown className="h-3.5 w-3.5" />
                                                  )}
                                                </Button>
                                              </div>
                                            </div>

                                            <div
                                              className={cn(
                                                "grid transition-all duration-300 ease-in-out overflow-hidden",
                                                expandedQuestions.has(question)
                                                  ? "grid-rows-[1fr] opacity-100"
                                                  : "grid-rows-[0fr] opacity-0"
                                              )}
                                            >
                                              <div className="overflow-hidden">
                                                <div className="px-3 pb-3 pt-0 border-t border-border/50 bg-muted">
                                                  <div className="mt-2">
                                                    <p className="text-xs text-muted-foreground mb-1">
                                                      Evidence from Transcript:
                                                    </p>
                                                    <p className="text-xs text-foreground bg-muted/70 rounded p-2 leading-relaxed border border-border/50">
                                                      {proof}
                                                    </p>

                                                    <div className="mt-3">
                                                      <p className="text-xs text-muted-foreground mb-1">
                                                        Comment:
                                                      </p>
                                                      <textarea
                                                        className="w-full rounded-md border border-border/50 bg-card p-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
                                                        placeholder="Add a comment (saved with this evaluation)"
                                                        value={comment ?? ""}
                                                        onChange={(e) =>
                                                          updateQaComment(key, e.target.value)
                                                        }
                                                        disabled={!isEditing}
                                                      />
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            )}

                            {/* Protocol sections: Interview, CAD, Telephone, Supervisor etc. */}
                            {protocolSections.map((section) => (
                              <Card
                                key={section.sectionId}
                                className="p-0 bg-card border border-border/50 rounded-lg overflow-hidden"
                              >
                                {/* Section Header */}
                                <div
                                  className={cn(
                                    "flex items-center justify-between cursor-pointer",
                                    collapsedSections.has(section.sectionId)
                                      ? "py-1.5 px-3"
                                      : "py-2 px-3"
                                  )}
                                  onClick={() =>
                                    toggleSection(section.sectionId)
                                  }
                                >
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={cn(
                                        "h-2.5 w-2.5 rounded-full",
                                        protocolColorClass
                                      )}
                                    />
                                    <span className="text-xs font-semibold text-foreground">
                                      {section.title}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <span className="text-[11px] text-muted-foreground">
                                      {section.questions.length} items
                                    </span>

                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 w-7 p-0"
                                    >
                                      {collapsedSections.has(
                                        section.sectionId
                                      ) ? (
                                        <ChevronDown className="h-3.5 w-3.5" />
                                      ) : (
                                        <ChevronUp className="h-3.5 w-3.5" />
                                      )}
                                    </Button>
                                  </div>
                                </div>

                                {/* Section Questions */}
                                <div
                                  className={cn(
                                    "grid transition-all duration-300 ease-in-out overflow-hidden",
                                    collapsedSections.has(section.sectionId)
                                      ? "grid-rows-[0fr] opacity-0"
                                      : "grid-rows-[1fr] opacity-100"
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "overflow-hidden transition-all duration-200",
                                      collapsedSections.has(section.sectionId)
                                        ? "p-0 max-h-0"
                                        : "pt-2 pb-3 px-3 max-h-[200vh]"
                                    )}
                                  >
                                    <div className="space-y-2">
                                      {section.questions.map((q) => {
                                        const qaObj =
                                          qaAnalysis[q.question] ??
                                          ({ Answer: "N/A", Proof: "" } as {
                                            Answer: QaValue;
                                            Proof: string;
                                          });

                                        const val = (
                                          isEditing
                                            ? qaAnalysisTemp?.[q.question]
                                              ?.Answer ?? qaObj.Answer
                                            : qaObj.Answer
                                        ) as QaValue;

                                        const proof = qaObj.Proof || "";
                                        const key = q.question;
                                        const comment = (
                                          isEditing
                                            ? (qaAnalysisTemp as any)?.[key]?.comment
                                            : (qaObj as any)?.comment
                                        ) as string | undefined;

                                        const match = protocolQuestions.find(
                                          (p) => p.questionId === q.questionId
                                        );

                                        const allowedAnswers =
                                          (match?.allowedAnswers ??
                                            []) as QaValue[];

                                        // 🔥 Proper Button variant typing (shadcn)
                                        type ButtonVariant =
                                          import("@/components/ui/button").ButtonProps["variant"];

                                        const answerStyles: Record<
                                          QaValue,
                                          { variant: ButtonVariant }
                                        > = {
                                          "": { variant: "outline" },
                                          Yes: {
                                            variant:
                                              val === "Yes"
                                                ? "default"
                                                : "outline",
                                          },
                                          No: {
                                            variant:
                                              val === "No"
                                                ? "destructive"
                                                : "outline",
                                          },
                                          Refused: {
                                            variant:
                                              val === "Refused"
                                                ? "default"
                                                : "outline",
                                          },
                                          "N/A": {
                                            variant:
                                              val === "N/A"
                                                ? "default"
                                                : "outline",
                                          },

                                          // lowercase versions (fallback)
                                          yes: {
                                            variant:
                                              val === "yes"
                                                ? "default"
                                                : "outline",
                                          },
                                          no: {
                                            variant:
                                              val === "no"
                                                ? "destructive"
                                                : "outline",
                                          },
                                          refused: {
                                            variant:
                                              val === "refused"
                                                ? "default"
                                                : "outline",
                                          },
                                          na: {
                                            variant:
                                              val === "na"
                                                ? "default"
                                                : "outline",
                                          },
                                        };

                                        return (
                                          <div
                                            key={key}
                                            className="border border-border/50 rounded-lg bg-card overflow-hidden"
                                          >
                                            {/* Question + Buttons */}
                                            <div className="flex items-center justify-between p-3 gap-3">
                                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <span className="text-sm text-foreground">
                                                  {q.question}
                                                </span>
                                              </div>

                                              <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                                                {/* Dynamic answer buttons */}
                                                {renderAnswerSourceIcon(key, val)}
                                                {allowedAnswers.map((ans) => (
                                                  <Button
                                                    key={ans}
                                                    size="sm"
                                                    variant={
                                                      answerStyles[ans]
                                                        ?.variant ?? "outline"
                                                    }
                                                    className={qaBtn(
                                                      val === ans,
                                                      ans
                                                    )}
                                                    onClick={() =>
                                                      updateQaDraft(
                                                        key,
                                                        ans as QaValue
                                                      )
                                                    }
                                                    aria-disabled={!isEditing}
                                                  >
                                                    {ans}
                                                  </Button>
                                                ))}

                                                {/* Expand */}
                                                <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  className="h-7 w-7 p-0"
                                                  onClick={() =>
                                                    toggleQuestion(key)
                                                  }
                                                >
                                                  {expandedQuestions.has(
                                                    key
                                                  ) ? (
                                                    <ChevronUp className="h-3.5 w-3.5" />
                                                  ) : (
                                                    <ChevronDown className="h-3.5 w-3.5" />
                                                  )}
                                                </Button>
                                              </div>
                                            </div>

                                            {/* Proof */}
                                            <div
                                              className={cn(
                                                "grid transition-all duration-300 ease-in-out overflow-hidden",
                                                expandedQuestions.has(key)
                                                  ? "grid-rows-[1fr] opacity-100"
                                                  : "grid-rows-[0fr] opacity-0"
                                              )}
                                            >
                                              <div className="overflow-hidden">
                                                <div className="px-3 pb-3 pt-0 border-t border-border/50 bg-muted">
                                                  <div className="mt-2">
                                                    <p className="text-xs text-muted-foreground mb-1">
                                                      Evidence from Transcript:
                                                    </p>
                                                    <p className="text-xs text-foreground bg-muted/70 rounded p-2 leading-relaxed border border-border/50">
                                                      {proof}
                                                    </p>

                                                    <div className="mt-3">
                                                      <p className="text-xs text-muted-foreground mb-1">
                                                        Comment:
                                                      </p>
                                                      <textarea
                                                        className="w-full rounded-md border border-border/50 bg-card p-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
                                                        placeholder="Add a comment (saved with this evaluation)"
                                                        value={comment ?? ""}
                                                        onChange={(e) =>
                                                          updateQaComment(key, e.target.value)
                                                        }
                                                        disabled={!isEditing}
                                                      />
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>

                          {/* Action bar: sticky on mobile, normal on md+ */}
                          {isEditing && (
                            <div className="md:static md:mt-4 sticky bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border/50 px-3 py-2 flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleResetChanges}
                              >
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
                              <p className="text-[11px] text-muted-foreground truncate content-center">
                                On completing the evalution mark it as Completed
                              </p>
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
            onAdded={() => {
              getQaQuestions();
            }}
          />

          {/*Export dialog */}
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
            .mobile-scale {
              --ui-scale: 0.95;
            }
          }
          @media (max-width: 768px) {
            .mobile-scale {
              --ui-scale: 0.9;
            }
          }
          @media (max-width: 480px) {
            .mobile-scale {
              --ui-scale: 0.85;
            }
          } 
        `}</style>
      </>
      {/* Disclaimer Footer */}
      <div className="mt-8 p-4 border-2 border-yellow-600 bg-yellow-100/85 text-yellow-900 rounded-md text-center">
        <p className="text-sm font-medium">
          Disclaimer: AI-generated information should be reviewed for accuracy
          before finalizing.
        </p>
      </div>
    </ProtectedPage>
  );
}