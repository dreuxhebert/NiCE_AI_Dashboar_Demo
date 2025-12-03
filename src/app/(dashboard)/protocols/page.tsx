"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, ChevronUp, Power } from "lucide-react"
import ProtectedPage from "@/components/protectedPage"

// ---- API / proxy logic (same pattern as other pages) ----
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "https://inform-ai-backend.onrender.com"
const USE_PROXY = process.env.NEXT_PUBLIC_USE_PROXY === "true"

const getApiUrl = (path: string) => {
  if (USE_PROXY) {
    // In production, route through Next.js API proxy
    return `/api/proxy${path}`
  }
  // In development, connect directly to backend
  return `${API_BASE}${path}`
}

// ---- Types that match backend protocol schema ----
type AllowedAnswer = "Yes" | "No" | "Refused" | "N/A"
const ANSWER_CHOICES = ["Yes", "No", "Refused", "N/A"] as const

interface ProtocolQuestion {
  id: string
  question: string
  points: number
  isActive?: boolean
  prompt?: string
  allowedAnswers?: AllowedAnswer[]
  showInForm?: boolean
}

interface ProtocolSection {
  id: string
  title: string
  totalPoints: number
  questions: ProtocolQuestion[]
}

interface Protocol {
  _id?: string
  id: string
  type: "Fire" | "Police" | "EMS" | string
  name: string
  color: string
  sections: ProtocolSection[]
}

interface EditingQuestion extends ProtocolQuestion {
  sectionId: string
  protocolId: string
}

type QuestionFormState = {
  question: string
  points: number
  prompt: string
  isActive: boolean
  allowedAnswers: AllowedAnswer[]
  showInForm: boolean
}

type NewQuestionFormState = {
  question: string
  points: number
  prompt: string
  section: string
  isActive: boolean
  allowedAnswers: AllowedAnswer[]
  showInForm: boolean
}

export default function ProtocolsPage() {
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [activeProtocol, setActiveProtocol] = useState<string>("protocol-fire")
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set([
      "fire-interview",
      "fire-cad",
      "fire-telephone",
      "fire-supervisor",
      "police-interview",
      "police-cad",
      "police-telephone",
      "police-supervisor",
      "ems-interview",
      "ems-cad",
      "ems-telephone",
      "ems-supervisor",
    ]),
  )

  const [editingQuestion, setEditingQuestion] = useState<EditingQuestion | null>(null)
  const [isAddingProtocol, setIsAddingProtocol] = useState(false)

  const [newProtocolData, setNewProtocolData] = useState<NewQuestionFormState>({
    question: "",
    points: 0,
    prompt: "",
    section: "Interview Questions",
    isActive: true,
    allowedAnswers: ["Yes", "No", "Refused", "N/A"],
    showInForm: true,
  })

  const [formData, setFormData] = useState<QuestionFormState>({
    question: "",
    points: 0,
    prompt: "",
    isActive: true,
    allowedAnswers: ["Yes", "No", "Refused", "N/A"],
    showInForm: true,
  })

  const currentProtocol = protocols.find((p) => p.id === activeProtocol)

  // ---- Fetch protocols from backend ----
  useEffect(() => {
    const fetchProtocols = async () => {
      try {
        const res = await fetch(getApiUrl("/protocols"))
        if (!res.ok) {
          console.error("Failed to fetch protocols")
          return
        }
        const data: Protocol[] = await res.json()
        setProtocols(data)

        // Ensure activeProtocol is valid; if not, default to first protocol
        if (data.length > 0 && !data.find((p) => p.id === activeProtocol)) {
          setActiveProtocol(data[0].id)
        }
      } catch (err) {
        console.error("Error fetching protocols:", err)
      }
    }

    fetchProtocols()
  }, []) // run once

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const handleEditQuestion = (question: ProtocolQuestion, sectionId: string) => {
    setEditingQuestion({
      ...question,
      sectionId,
      protocolId: activeProtocol,
    })
    setFormData({
      question: question.question,
      points: question.points,
      prompt: question.prompt || "",
      isActive: question.isActive ?? true,
      allowedAnswers: question.allowedAnswers ?? ["Yes", "No", "Refused", "N/A"],
      showInForm: question.showInForm ?? true,
    })
  }

  const handleSave = async () => {
    if (!editingQuestion) return

    try {
      const res = await fetch(
        getApiUrl(
          `/protocols/${editingQuestion.protocolId}/sections/${editingQuestion.sectionId}/questions/${editingQuestion.id}`,
        ),
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: formData.question,
            points: formData.points,
            prompt: formData.prompt,
            isActive: formData.isActive,
            allowedAnswers: formData.allowedAnswers,
            showInForm: formData.showInForm,
          }),
        },
      )

      if (!res.ok) {
        console.error("Failed to update protocol question")
        return
      }

      // optional: you can read updated from backend if needed
      // const updated = await res.json()

      // Optimistically update local state so UI reflects the change
      setProtocols((prev) =>
        prev.map((protocol) => {
          if (protocol.id !== editingQuestion.protocolId) return protocol
          return {
            ...protocol,
            sections: protocol.sections.map((section) => {
              if (section.id !== editingQuestion.sectionId) return section
              return {
                ...section,
                questions: section.questions.map((q) =>
                  q.id === editingQuestion.id
                    ? {
                        ...q,
                        question: formData.question,
                        points: formData.points,
                        prompt: formData.prompt,
                        isActive: formData.isActive,
                        allowedAnswers: formData.allowedAnswers,
                        showInForm: formData.showInForm,
                      }
                    : q,
                ),
              }
            }),
          }
        }),
      )
    } catch (err) {
      console.error("Error updating protocol question", err)
    } finally {
      setEditingQuestion(null)
      setFormData({
        question: "",
        points: 0,
        prompt: "",
        isActive: true,
        allowedAnswers: ["Yes", "No", "Refused", "N/A"],
        showInForm: true,
      })
    }
  }

  const handleAddProtocol = async () => {
    if (!currentProtocol) return

    // Map dropdown "section" (title) to actual section id
    const targetSection =
      currentProtocol.sections.find((s) => s.title === newProtocolData.section) ??
      currentProtocol.sections[0]

    if (!targetSection) return

    try {
      const res = await fetch(
        getApiUrl(`/protocols/${currentProtocol.id}/sections/${targetSection.id}/questions`),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: newProtocolData.question,
            points: newProtocolData.points,
            prompt: newProtocolData.prompt,
            isActive: newProtocolData.isActive,
            allowedAnswers: newProtocolData.allowedAnswers,
            showInForm: newProtocolData.showInForm,
          }),
        },
      )

      if (!res.ok) {
        console.error("Failed to add protocol question")
        return
      }

      const created = await res.json()

      setProtocols((prev) =>
        prev.map((protocol) => {
          if (protocol.id !== currentProtocol.id) return protocol
          return {
            ...protocol,
            sections: protocol.sections.map((section) => {
              if (section.id !== targetSection.id) return section
              return {
                ...section,
                questions: [
                  ...section.questions,
                  {
                    id: created.id ?? crypto.randomUUID(),
                    question: created.question ?? newProtocolData.question,
                    points: created.points ?? newProtocolData.points,
                    prompt: created.prompt ?? newProtocolData.prompt,
                    isActive: created.isActive ?? newProtocolData.isActive,
                    allowedAnswers: created.allowedAnswers ?? newProtocolData.allowedAnswers,
                    showInForm: created.showInForm ?? newProtocolData.showInForm,
                  },
                ],
              }
            }),
          }
        }),
      )
    } catch (err) {
      console.error("Error adding protocol question", err)
    } finally {
      setIsAddingProtocol(false)
      setNewProtocolData({
        question: "",
        points: 0,
        prompt: "",
        section: "Interview Questions",
        isActive: true,
        allowedAnswers: ["Yes", "No", "Refused", "N/A"],
        showInForm: true,
      })
    }
  }

  return (
    <ProtectedPage required={["Protocol"]}>
      <main className="flex-1 overflow-auto bg-background">
        <div className="space-y-6 p-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Protocol Management</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Customize and review call taking standards and requirements.
              </p>
            </div>
            <Button onClick={() => setIsAddingProtocol(true)} size="lg">
              + Add a Protocol
            </Button>
          </div>

          {/* Protocol Tabs */}
          <div className="flex gap-3 border-b border-border">
            {protocols.map((protocol) => (
              <button
                key={protocol.id}
                onClick={() => setActiveProtocol(protocol.id)}
                className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                  activeProtocol === protocol.id
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${protocol.color}`} />
                  {protocol.name}
                </div>
                {activeProtocol === protocol.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>

          {/* Protocol Sections */}
          {currentProtocol && (
            <div className="space-y-4">
              {currentProtocol.sections.map((section) => (
                <div key={section.id} className="rounded-lg border border-border bg-card">
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="flex w-full items-center justify-between px-6 py-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                        {section.totalPoints} points
                      </span>
                    </div>
                    {expandedSections.has(section.id) ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>

                  {/* Section Content */}
                  {expandedSections.has(section.id) && (
                    <div className="border-t border-border overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-muted/50">
                            <th className="px-6 py-3 text-left font-semibold text-foreground">
                              Question
                            </th>
                            <th className="px-6 py-3 text-center font-semibold text-foreground w-20">
                              Points
                            </th>
                            <th className="px-6 py-3 text-center font-semibold text-foreground w-24">
                              Active
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {section.questions.map((question) => (
                            <tr
                              key={question.id}
                              onClick={() => handleEditQuestion(question, section.id)}
                              className="cursor-pointer border-b border-border hover:bg-accent/30 transition-colors"
                            >
                              <td className="px-6 py-3">
                                <p className="font-medium text-foreground">
                                  {question.question}
                                </p>
                              </td>
                              <td className="px-6 py-3 text-center">
                                <span className="rounded-lg bg-primary/10 px-2 py-1 text-sm font-semibold text-primary">
                                  {question.points}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-center">
                                <div className="flex justify-center">
                                  {question.isActive ? (
                                    <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-600">
                                      Active
                                    </span>
                                  ) : (
                                    <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-600">
                                      Inactive
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Question Dialog */}
        <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Protocol Question</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Enter question text"
                  className="h-20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="points">Points</Label>
                <Input
                  id="points"
                  type="number"
                  value={formData.points}
                  onChange={(e) =>
                    setFormData({ ...formData, points: Number.parseInt(e.target.value) || 0 })
                  }
                  placeholder="Enter points value"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt">AI Scoring Prompt</Label>
                <textarea
                  id="prompt"
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  placeholder="Enter the prompt that AI should use to score this question"
                  className="h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Allowed Answers</Label>
                <div className="flex flex-wrap gap-4">
                  {ANSWER_CHOICES.map((choice) => {
                    const checked = formData.allowedAnswers.includes(choice)
                    return (
                      <label key={choice} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) => {
                            setFormData((prev) => {
                              const isChecked = value === true
                              const current = prev.allowedAnswers
                              return {
                                ...prev,
                                allowedAnswers: isChecked
                                  ? Array.from(new Set([...current, choice]))
                                  : current.filter((c) => c !== choice),
                              }
                            })
                          }}
                        />
                        <span>{choice}</span>
                      </label>
                    )
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select which responses are valid for this question (Yes / No / Refused / N/A).
                </p>
              </div>

              {/* Status: Active / Inactive */}
              <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-muted/50">
                <div className="flex-1">
                  <Label className="text-sm font-semibold">AI Scored</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.isActive
                      ? "Question will be auto scored in evaluations form."
                      : "Question will not be auto scored in evaluations form."}
                  </p>
                </div>
                <button
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  className={`relative inline-flex items-center justify-center h-12 w-12 rounded-lg transition-all ${
                    formData.isActive
                      ? "bg-green-500/20 hover:bg-green-500/30"
                      : "bg-red-500/20 hover:bg-red-500/30"
                  }`}
                >
                  <Power
                    className={`h-6 w-6 ${
                      formData.isActive ? "text-green-600" : "text-red-600"
                    }`}
                  />
                </button>
              </div>

              {/* Enabled / Disabled: Shown in form */}
              <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-muted/50">
                <div className="flex-1">
                  <Label className="text-sm font-semibold">Enabled / Disabled</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.showInForm
                      ? "Shown in form - Question will appear on the evaluations form."
                      : "Not shown in form - Question will be hidden in the evaluations form."}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setFormData({ ...formData, showInForm: !formData.showInForm })
                  }
                  className={`relative inline-flex items-center justify-center h-12 w-12 rounded-lg transition-all ${
                    formData.showInForm
                      ? "bg-green-500/20 hover:bg-green-500/30"
                      : "bg-red-500/20 hover:bg-red-500/30"
                  }`}
                >
                  <Power
                    className={`h-6 w-6 ${
                      formData.showInForm ? "text-green-600" : "text-red-600"
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setEditingQuestion(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Protocol Question Dialog */}
        <Dialog open={isAddingProtocol} onOpenChange={setIsAddingProtocol}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add a New Protocol Question</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="newQuestion">Question</Label>
                <Input
                  id="newQuestion"
                  value={newProtocolData.question}
                  onChange={(e) =>
                    setNewProtocolData({ ...newProtocolData, question: e.target.value })
                  }
                  placeholder="Enter question text"
                  className="h-20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPoints">Points</Label>
                <Input
                  id="newPoints"
                  type="number"
                  value={newProtocolData.points}
                  onChange={(e) =>
                    setNewProtocolData({
                      ...newProtocolData,
                      points: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Enter points value"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="section">Section</Label>
                <select
                  id="section"
                  value={newProtocolData.section}
                  onChange={(e) =>
                    setNewProtocolData({ ...newProtocolData, section: e.target.value })
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option>Interview Questions</option>
                  <option>CAD Skills</option>
                  <option>Telephone Protocol</option>
                  <option>Supervisor Overview</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPrompt">AI Scoring Prompt</Label>
                <textarea
                  id="newPrompt"
                  value={newProtocolData.prompt}
                  onChange={(e) =>
                    setNewProtocolData({ ...newProtocolData, prompt: e.target.value })
                  }
                  placeholder="Enter the prompt that AI should use to score this question"
                  className="h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Allowed Answers</Label>
                <div className="flex flex-wrap gap-4">
                  {ANSWER_CHOICES.map((choice) => {
                    const checked = newProtocolData.allowedAnswers.includes(choice)
                    return (
                      <label key={choice} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) => {
                            setNewProtocolData((prev) => {
                              const isChecked = value === true
                              const current = prev.allowedAnswers
                              return {
                                ...prev,
                                allowedAnswers: isChecked
                                  ? Array.from(new Set([...current, choice]))
                                  : current.filter((c) => c !== choice),
                              }
                            })
                          }}
                        />
                        <span>{choice}</span>
                      </label>
                    )
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select which responses are valid for this question (Yes / No / Refused / N/A).
                </p>
              </div>

              {/* Status: Active / Inactive */}
              <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-muted/50">
                <div className="flex-1">
                  <Label className="text-sm font-semibold">Status</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {newProtocolData.isActive
                      ? "Active - Question will be used in evaluations"
                      : "Inactive - Question will not be used"}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setNewProtocolData({
                      ...newProtocolData,
                      isActive: !newProtocolData.isActive,
                    })
                  }
                  className={`relative inline-flex items-center justify-center h-12 w-12 rounded-lg transition-all ${
                    newProtocolData.isActive
                      ? "bg-green-500/20 hover:bg-green-500/30"
                      : "bg-red-500/20 hover:bg-red-500/30"
                  }`}
                >
                  <Power
                    className={`h-6 w-6 ${
                      newProtocolData.isActive ? "text-green-600" : "text-red-600"
                    }`}
                  />
                </button>
              </div>

              {/* Enabled / Disabled: Shown in form */}
              <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-muted/50">
                <div className="flex-1">
                  <Label className="text-sm font-semibold">Enabled / Disabled</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {newProtocolData.showInForm
                      ? "Shown in form - Question will appear on the evaluations form."
                      : "Not shown in form - Question will be hidden in the evaluations form."}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setNewProtocolData({
                      ...newProtocolData,
                      showInForm: !newProtocolData.showInForm,
                    })
                  }
                  className={`relative inline-flex items-center justify-center h-12 w-12 rounded-lg transition-all ${
                    newProtocolData.showInForm
                      ? "bg-green-500/20 hover:bg-green-500/30"
                      : "bg-red-500/20 hover:bg-red-500/30"
                  }`}
                >
                  <Power
                    className={`h-6 w-6 ${
                      newProtocolData.showInForm ? "text-green-600" : "text-red-600"
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsAddingProtocol(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddProtocol}>Add Protocol</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </ProtectedPage>
  )
}