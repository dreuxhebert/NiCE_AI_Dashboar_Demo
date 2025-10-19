"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { coachingTasks, callTakers, type CoachingTask } from "@/lib/sample-data"
import {
  Sparkles,
  Plus,
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

export default function CoachingPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "in-progress" | "completed">("pending")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedTask, setSelectedTask] = useState<CoachingTask | null>(null)
  const [showAIModal, setShowAIModal] = useState(false)
  const [selectedCallTaker, setSelectedCallTaker] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const filteredTasks = coachingTasks.filter((task) => {
    const matchesStatus = task.status === activeTab
    const matchesSearch = searchQuery === "" || task.callTakerName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const highPriorityTasks = coachingTasks
    .filter((task) => task.priority === "high" && task.status !== "completed")
    .slice(0, 3)

  const getPriorityColor = (priority: string) => {
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

  const getStatusColor = (status: string) => {
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

  const handleMarkAsScheduled = () => {
    if (!selectedTask) return

    toast({
      title: "Task Updated",
      description: `Coaching task for ${selectedTask.callTakerName} has been marked as scheduled.`,
    })

    setSelectedTask({ ...selectedTask, status: "in-progress" })
  }

  const handleGenerateAICoaching = async () => {
    if (!selectedCallTaker) {
      toast({
        title: "Selection Required",
        description: "Please select a call taker to generate coaching recommendations.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    setTimeout(() => {
      const callTaker = callTakers.find((ct) => ct.id === selectedCallTaker)

      toast({
        title: "AI Coaching Task Created",
        description: `Personalized coaching recommendations generated successfully for ${callTaker?.name}.`,
      })

      setIsGenerating(false)
      setShowAIModal(false)
      setSelectedCallTaker("")
    }, 2000)
  }

  const pendingCount = coachingTasks.filter((t) => t.status === "pending").length
  const inProgressCount = coachingTasks.filter((t) => t.status === "in-progress").length
  const completedCount = coachingTasks.filter((t) => t.status === "completed").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground">Coaching Management</h1>
          <p className="text-muted-foreground">Provide targeted feedback and development opportunities</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowAIModal(true)}
            className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            AI Coaching Assistant
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">
            <Plus className="mr-2 h-4 w-4" />
            New Coaching Task
          </Button>
        </div>
      </div>

      {highPriorityTasks.length > 0 && searchQuery === "" && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-red-500">
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
                  className="cursor-pointer transition-all hover:border-red-500/50"
                  onClick={() => {
                    setSelectedTask(task)
                    setActiveTab(task.status)
                  }}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground">{task.callTakerName}</h4>
                          <p className="text-sm text-muted-foreground">{task.focusArea}</p>
                        </div>
                        <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-xs">HIGH</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Due: {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Search Employee:</span>
        </div>
        <div className="relative flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Type to search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
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
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({inProgressCount})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedCount})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coaching Tasks List */}
        <div className="space-y-4 lg:col-span-1">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-center text-muted-foreground">
                  {searchQuery
                    ? `No ${activeTab.replace("-", " ")} tasks found for "${searchQuery}"`
                    : `No ${activeTab.replace("-", " ")} coaching tasks`}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <Card
                key={task.id}
                className={cn(
                  "cursor-pointer transition-all hover:border-primary/50",
                  selectedTask?.id === task.id && "border-primary ring-2 ring-primary/20",
                )}
                onClick={() => setSelectedTask(task)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{task.callTakerName}</h3>
                        <p className="text-sm text-muted-foreground">{task.focusArea}</p>
                      </div>
                      <Badge className={cn("text-xs", getPriorityColor(task.priority))}>{task.priority}</Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Due:{" "}
                        {new Date(task.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <Badge className={cn("text-xs", getStatusColor(task.status))}>
                      {task.status.replace("-", " ")}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Coaching Details Panel */}
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
                    <CardTitle className="text-2xl">{selectedTask.callTakerName}</CardTitle>
                    <CardDescription>
                      Focus Area: {selectedTask.focusArea} • Due:{" "}
                      {new Date(selectedTask.dueDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Issue Description */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <h3 className="font-semibold text-foreground">Issue Description</h3>
                  </div>
                  <p className="leading-relaxed text-muted-foreground">{selectedTask.issueDescription}</p>
                </div>

                {/* Coaching Suggestions */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold text-foreground">Coaching Suggestions</h3>
                  </div>
                  <ul className="space-y-2">
                    {selectedTask.coachingSuggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="mt-1 text-blue-500">💡</span>
                        <span className="leading-relaxed text-muted-foreground">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Items */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold text-foreground">Action Items</h3>
                  </div>
                  <div className="space-y-3">
                    {selectedTask.actionItems.map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        {item.completed ? (
                          <CheckCircle2 className="mt-1 h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="mt-1 h-5 w-5 text-muted-foreground" />
                        )}
                        <span
                          className={cn(
                            "leading-relaxed",
                            item.completed ? "text-muted-foreground line-through" : "text-foreground",
                          )}
                        >
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Completion Notes (if completed) */}
                {selectedTask.status === "completed" && selectedTask.completionNotes && (
                  <div className="space-y-2 rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                    <h3 className="font-semibold text-green-500">Completion Notes</h3>
                    <p className="leading-relaxed text-muted-foreground">{selectedTask.completionNotes}</p>
                    <p className="text-sm text-muted-foreground">
                      Completed on:{" "}
                      {selectedTask.completedDate &&
                        new Date(selectedTask.completedDate).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                    </p>
                  </div>
                )}

                {/* Actions */}
                {selectedTask.status === "pending" && (
                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleMarkAsScheduled} className="flex-1">
                      Mark as Scheduled
                    </Button>
                  </div>
                )}

                {selectedTask.status === "in-progress" && (
                  <div className="flex gap-3 pt-4">
                    <Button className="flex-1">Mark as Completed</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-24">
                <ClipboardCheck className="mb-4 h-16 w-16 text-muted-foreground" />
                <p className="text-center text-lg text-muted-foreground">Select a coaching task to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* AI Coaching Assistant Modal */}
      <Dialog open={showAIModal} onOpenChange={setShowAIModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI Coaching Assistant
            </DialogTitle>
            <DialogDescription>
              Generate personalized coaching recommendations based on performance data
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Select Call Taker</label>
              <Select value={selectedCallTaker} onValueChange={setSelectedCallTaker}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a call taker..." />
                </SelectTrigger>
                <SelectContent>
                  {callTakers.map((ct) => (
                    <SelectItem key={ct.id} value={ct.id}>
                      {ct.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                The AI will automatically retrieve recent evaluations, analyze missed standards or low-score criteria,
                and generate personalized coaching topics, suggestions, and action items.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowAIModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleGenerateAICoaching}
              disabled={!selectedCallTaker || isGenerating}
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
            >
              {isGenerating ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Coaching
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}