"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import {
  Sparkles,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ClipboardCheck,
  Search,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "https://inform-ai-backend.onrender.com"
const USE_PROXY = process.env.NEXT_PUBLIC_USE_PROXY === "true"
const getApiUrl = (path: string) => (USE_PROXY ? `/api/proxy${path}` : `${API_BASE}${path}`)

type TaskStatus = "pending" | "in-progress" | "completed"
type TaskPriority = "low" | "medium" | "high"

interface CoachingTask {
  id: string
  callId: string | null
  callTakerId: string | null
  callTakerName: string | null
  focusArea: string | null
  issueDescription: string | null
  coachingSuggestions: string[]
  actionItems: { text: string; completed: boolean }[]
  priority: TaskPriority
  status: TaskStatus
  dueDate: string | null
  completionNotes?: string | null
  completedDate?: string | null
  created_at?: string
  updated_at?: string
}

interface CallOption {
  callId: string
  dispatcherId: string
  callType: string
  summary: string | null
}

/**
 * Replace backend wording with desired terminology for display:
 * - "agent"   -> "operator"
 * - "customer" -> "caller"
 */
const replaceTerms = (text: string): string => {
  if (!text) return text

  return text
    // Agent → Operator
    .replace(/\bAgent\b/g, "Operator")
    .replace(/\bagent\b/g, "operator")
    // Customer → Caller
    .replace(/\bCustomer\b/g, "Caller")
    .replace(/\bcustomer\b/g, "caller")
}

/**
 * Normalize all text fields of a CoachingTask before putting it into state.
 */
const normalizeTaskText = (task: CoachingTask): CoachingTask => ({
  ...task,
  issueDescription: task.issueDescription ? replaceTerms(task.issueDescription) : task.issueDescription,
  coachingSuggestions: (task.coachingSuggestions ?? []).map((s) => replaceTerms(s)),
  actionItems: (task.actionItems ?? []).map((item) => ({
    ...item,
    text: replaceTerms(item.text),
  })),
})

export default function CoachingPage() {
  const [activeTab, setActiveTab] = useState<TaskStatus>("pending")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [tasks, setTasks] = useState<CoachingTask[]>([])
  const [selectedTask, setSelectedTask] = useState<CoachingTask | null>(null)

  const [showAIModal, setShowAIModal] = useState(false)
  const [availableCalls, setAvailableCalls] = useState<CallOption[]>([])
  const [selectedCallId, setSelectedCallId] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)

  const { toast } = useToast()
  const [showAll, setShowAll] = useState(false)
  const ITEMS_TO_SHOW = 7

  // -------------------------
  // Fetch Tasks
  // -------------------------
  useEffect(() => {
    let mounted = true

    const fetchTasks = async () => {
      try {
        const res = await fetch(getApiUrl("/coaching/tasks"), { cache: "no-store" })
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
        const data: CoachingTask[] = await res.json()

        // Normalize wording before putting into state
        const normalized = data.map(normalizeTaskText)

        if (mounted) {
          setTasks(normalized)
          setSelectedTask(normalized[0] ?? null)
        }
      } catch (e: any) {
        toast({
          title: "Could not load coaching tasks",
          description: e?.message,
          variant: "destructive",
        })
      }
    }

    fetchTasks()
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // -------------------------
  // Fetch Calls
  // -------------------------
  useEffect(() => {
    let mounted = true

    const fetchCalls = async () => {
      try {
        const res = await fetch(getApiUrl("/calls"), { cache: "no-store" })
        if (!res.ok) throw new Error(`Failed to fetch calls: ${res.status}`)
        const data: any[] = await res.json()

        if (!mounted) return

        const options: CallOption[] = data.map((c) => ({
          callId: c.call_id,
          dispatcherId: c.dispatcher_id ?? "Unknown",
          callType: c.callType ?? "General",
          summary: c.summary ?? null,
        }))

        setAvailableCalls(options)
      } catch (e: any) {
        toast({
          title: "Could not load calls",
          description: e?.message,
          variant: "destructive",
        })
      }
    }

    fetchCalls()
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // -------------------------
  // Derived UI State
  // -------------------------
  const filteredTasks = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return tasks.filter((t) => {
      const matchesStatus = t.status === activeTab
      const name = (t.callTakerName || "").toLowerCase()
      return matchesStatus && (!q || name.includes(q))
    })
  }, [tasks, activeTab, searchQuery])

  const displayedTasks = useMemo(
    () => (showAll ? filteredTasks : filteredTasks.slice(0, ITEMS_TO_SHOW)),
    [filteredTasks, showAll]
  )

  const highPriorityTasks = useMemo(
    () => tasks.filter((t) => t.priority === "high" && t.status !== "completed").slice(0, 3),
    [tasks]
  )

  const pendingCount = tasks.filter((t) => t.status === "pending").length
  const inProgressCount = tasks.filter((t) => t.status === "in-progress").length
  const completedCount = tasks.filter((t) => t.status === "completed").length

  // -------------------------
  // Helpers
  // -------------------------
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "medium":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "low":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20"
      case "in-progress":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  // Build Call Label (if you ever want richer labels in the select)
  const getCallLabel = (c: CallOption) => {
    const base = `${c.dispatcherId} • ${c.callType}`
    if (!c.summary) return base
    const trimmed = c.summary.length > 80 ? `${c.summary.slice(0, 80)}…` : c.summary
    return `${base} • ${trimmed}`
  }

  // -------------------------
  // Mark as Scheduled
  // -------------------------
  const handleMarkAsScheduled = async () => {
    if (!selectedTask) return

    try {
      const prev = selectedTask
      setSelectedTask({ ...prev, status: "in-progress" })
      setTasks((arr) => arr.map((t) => (t.id === prev.id ? { ...t, status: "in-progress" } : t)))

      await fetch(getApiUrl(`/coaching/tasks/${selectedTask.id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "in-progress" }),
      })

      toast({
        title: "Task Updated",
        description: `Coaching task for ${prev.callTakerName} marked as scheduled.`,
      })
    } catch (e: any) {
      toast({
        title: "Update failed",
        description: e?.message,
        variant: "destructive",
      })
    }
  }

  // -------------------------
  // AI Coaching
  // -------------------------
  const handleGenerateAICoaching = async () => {
    if (!selectedCallId) {
      toast({
        title: "Select a call",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const res = await fetch(getApiUrl("/coaching/ai-generate/call"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId: selectedCallId }),
      })

      if (!res.ok) throw new Error(`AI generation failed: ${res.status}`)

      const result = await res.json()
      const newTask: CoachingTask | null = result.task ?? null

      if (newTask) {
        // Normalize wording before adding to state
        const normalized = normalizeTaskText(newTask)
        setTasks((prev) => [normalized, ...prev])
        setSelectedTask(normalized)
        toast({ title: "AI Coaching Task Created" })
      }
    } catch (e: any) {
      toast({
        title: "Generation failed",
        description: e?.message,
        variant: "destructive",
      })
    }

    setIsGenerating(false)
    setShowAIModal(false)
    setSelectedCallId("")
  }

  // Ensure any open portalized controls (like Select) are blurred/closed when dialog closes
  const handleAIModalOpenChange = (open: boolean) => {
    setShowAIModal(open)
    if (!open && typeof document !== "undefined") {
      const ae = document.activeElement as HTMLElement | null
      ae?.blur()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coaching Management</h1>
          <p className="text-muted-foreground">Provide targeted feedback and development opportunities</p>
        </div>

        <Button
          onClick={() => setShowAIModal(true)}
          className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          AI Coaching Assistant
        </Button>
      </div>

      {/* High Priority Tasks */}
      {highPriorityTasks.length > 0 && searchQuery === "" && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500 text-lg">
              <AlertCircle className="h-5 w-5" />
              High Priority Tasks Requiring Attention
            </CardTitle>
            <CardDescription>These tasks need immediate action</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {highPriorityTasks.map((task) => (
                <Card
                  key={task.id}
                  className="cursor-pointer hover:border-red-500/50"
                  onClick={() => {
                    setSelectedTask(task)
                    setActiveTab(task.status)
                  }}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{task.callTakerName || "Unknown"}</h4>
                        <p className="text-sm">{task.focusArea || "General"}</p>
                      </div>
                      <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-xs">HIGH</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Due:{" "}
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">Search Employee:</span>
        </div>

        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Type to search employees…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {searchQuery && (
          <span className="text-sm text-muted-foreground">
            {filteredTasks.length} result{filteredTasks.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TaskStatus)}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({inProgressCount})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedCount})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Main Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Task List */}
        <Card className="lg:col-span-1 self-start">
          {filteredTasks.length === 0 ? (
            <div className="py-12 flex flex-col items-center">
              <CheckCircle2 className="h-12 w-12 mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchQuery
                  ? `No ${activeTab.replace("-", " ")} tasks found for "${searchQuery}"`
                  : `No ${activeTab.replace("-", " ")} coaching tasks`}
              </p>
            </div>
          ) : (
            <div>
              {/* Header */}
              <div className="border-b px-4 py-3 grid grid-cols-12 text-xs font-medium text-muted-foreground">
                <div className="col-span-4">Name</div>
                <div className="col-span-3">Focus</div>
                <div className="col-span-3">Due</div>
                <div className="col-span-2">Priority</div>
              </div>

              {/* Scrollable List */}
              <div
                className={
                  filteredTasks.length > ITEMS_TO_SHOW ? "max-h-[calc(100vh-22rem)] overflow-y-auto pr-2" : ""
                }
              >
                {displayedTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className={cn(
                      "grid grid-cols-12 gap-2 px-4 py-3 text-sm border-b cursor-pointer hover:bg-muted/50",
                      selectedTask?.id === task.id && "bg-primary/5"
                    )}
                  >
                    <div className="col-span-4 font-medium">{task.callTakerName || "Unknown"}</div>
                    <div className="col-span-3 text-muted-foreground">{task.focusArea || "General"}</div>
                    <div className="col-span-3 text-muted-foreground">
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </div>
                    <div className="col-span-2">
                      <Badge className={cn("text-xs", getPriorityColor(task.priority))}>{task.priority}</Badge>
                    </div>
                  </div>
                ))}
              </div>

              {/* Show More */}
              {filteredTasks.length > ITEMS_TO_SHOW && (
                <div className="px-4 py-3">
                  <Button variant="ghost" size="sm" className="w-full" onClick={() => setShowAll((s) => !s)}>
                    {showAll ? "Show less" : `Show more (${filteredTasks.length - ITEMS_TO_SHOW} more)`}
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Details Panel */}
        <div className="lg:col-span-2">
          {selectedTask ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className={cn("text-xs", getPriorityColor(selectedTask.priority))}>
                        {selectedTask.priority} priority
                      </Badge>
                      <Badge className={cn("text-xs", getStatusColor(selectedTask.status))}>
                        {selectedTask.status.replace("-", " ")}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl">{selectedTask.callTakerName || "Unknown"}</CardTitle>
                    <CardDescription>
                      Focus Area: {selectedTask.focusArea || "General"} • Due:{" "}
                      {selectedTask.dueDate
                        ? new Date(selectedTask.dueDate).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                {/* ISSUE DESCRIPTION */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <h3 className="font-semibold">Issue Description</h3>
                  </div>

                  <div className="leading-relaxed text-muted-foreground prose prose-sm max-w-none">
                    {selectedTask.issueDescription ? (
                      <div dangerouslySetInnerHTML={{ __html: selectedTask.issueDescription }} />
                    ) : (
                      "—"
                    )}
                  </div>
                </div>

                {/* COACHING SUGGESTIONS */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold">Coaching Suggestions</h3>
                  </div>

                  <ul className="space-y-2">
                    {(selectedTask.coachingSuggestions ?? []).map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="mt-1 text-blue-500">💡</span>
                        <span
                          className="leading-relaxed text-muted-foreground"
                          dangerouslySetInnerHTML={{ __html: suggestion }}
                        />
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ACTION ITEMS */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold">Action Items</h3>
                  </div>

                  <div className="space-y-3">
                    {(selectedTask.actionItems ?? []).map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        {item.completed ? (
                          <CheckCircle2 className="h-5 w-5 mt-1 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 mt-1 text-muted-foreground" />
                        )}

                        <span
                          className={cn(
                            "leading-relaxed",
                            item.completed ? "line-through text-muted-foreground" : ""
                          )}
                          dangerouslySetInnerHTML={{ __html: item.text }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                {selectedTask.status === "pending" && (
                  <Button onClick={handleMarkAsScheduled} className="w-full">
                    Mark as Scheduled
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-24 flex flex-col items-center">
                <ClipboardCheck className="mb-4 h-16 w-16 text-muted-foreground" />
                <p className="text-muted-foreground text-lg">Select a coaching task to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* AI Coaching Modal */}
      <Dialog open={showAIModal} onOpenChange={handleAIModalOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI Coaching Assistant
            </DialogTitle>
            <DialogDescription>
              Generate personalized coaching recommendations based on a specific 911 call.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <label className="text-sm font-medium">Select Call</label>

            <Select value={selectedCallId} onValueChange={setSelectedCallId}>
              <SelectTrigger className="w-full truncate">
                <SelectValue placeholder="Choose a call..." />
              </SelectTrigger>

              <SelectContent className="w-[480px] max-h-72">
                {availableCalls.map((c) => (
                  <SelectItem key={c.callId} value={c.callId} className="py-2">
                    {/* You could use getCallLabel(c) if you want more detail */}
                    <span className="block text-sm font-medium text-foreground">{c.dispatcherId}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                The AI will analyze the transcript, QA results, and context, then generate coaching suggestions.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowAIModal(false)} className="flex-1">
              Cancel
            </Button>

            <Button
              onClick={handleGenerateAICoaching}
              disabled={!selectedCallId || isGenerating}
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
            >
              {isGenerating ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Generate Coaching
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}