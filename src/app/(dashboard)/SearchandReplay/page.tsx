"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge, type Status } from "@/components/status-badge"
import { SentimentBadge } from "@/components/sentiment-badge"
import { InteractionDrawer } from "@/components/interaction-drawer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Filter, X, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import ProtectedPage from "@/components/protectedPage"

// ---------------- API helper ----------------
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "https://inform-ai-backend.onrender.com"
const USE_PROXY = process.env.NEXT_PUBLIC_USE_PROXY === "true"

const getApiUrl = (path: string) => {
  if (USE_PROXY) {
    return `/api/proxy${path}`
  }
  return `${API_BASE}${path}`
}

type QaValue = "yes" | "no" | "refused" | "na" | "Yes" | "No" | "Refused" | "N/A"

// ---------------- Types ----------------
interface EmergencyType {
  agency: string
  specific_emergency: string
  confidence: string
}

interface QAResult {
  Answer: QaValue
  Proof: string
}

interface CallData {
  _id: string
  dispatcher_id?: string
  call_id?: string
  duration_seconds?: number
  score?: number
  callEvaluationType?: string
  direction?: string
  language?: string
  model?: string

  callType?: EmergencyType[]

  status?: string

  // Sentiment block
  sentiment?: string
  sentimentDescription?: string | null
  sentimentScore?: number | null
  sentimentRawScore?: number | null

  transcript?: string
  summary?: string

  qa_analysis?: {
    [question: string]: QAResult
  }

  created_at?: string // ISO string from backend

  stored_audio?: string
}

interface RowSentiment {
  sentiment: string
  sentimentScore: number | null
}

type TimeMode = "last" | "range"

// ---------------- Component ----------------
export default function InteractionsPage() {
  const [interactions, setInteractions] = useState<CallData[]>([])
  const [selectedInteraction, setSelectedInteraction] =
    useState<CallData | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [keywordInput, setKeywordInput] = useState("")
  const [keywords, setKeywords] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [callTypeFilter, setCallTypeFilter] = useState<string>("all")

  // operator filter
  const [operatorFilter, setOperatorFilter] = useState<string>("all")

  // time filter state
  const [timeFilterMode, setTimeFilterMode] = useState<TimeMode>("last")
  const [showLastAmount, setShowLastAmount] = useState<string>("60")
  const [showLastUnit, setShowLastUnit] = useState<"minutes" | "hours" | "days">(
    "minutes",
  )
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")

  // per-row sentiment from ElevateAI (future use)
  const [rowSentiments] = useState<Record<string, RowSentiment>>({})

  // -------- Fetch interactions list --------
  const fetchInteractions = async () => {
    try {
      const apiUrl = getApiUrl("/calls")
      const res = await fetch(apiUrl, { cache: "no-store" })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(
          `GET /calls → ${res.status} ${res.statusText}\n${text}`,
        )
      }

      const ct = res.headers.get("content-type") || ""
      if (!ct.includes("application/json")) {
        const text = await res.text()
        throw new Error(`Expected JSON but got "${ct}". Body:\n${text}`)
      }

      const data = await res.json()

      const mappedData: CallData[] = (Array.isArray(data) ? data : []).map(
        (item: any) => ({
          _id: item._id,
          id: item.id,
          dispatcher_id: item.dispatcher_id,
          call_id: item.call_id,
          duration_seconds: item.duration_seconds,
          direction: item.direction,
          language: item.language,
          model: item.model,
          callType: item.callType,
          status: item.status as Status,
          sentiment: item.sentiment,
          transcript: item.transcript,
          summary: item.summary,
          created_at: item.created_at,
          callEvaluationType: item.callEvaluationType,
          qa_analysis: item.qa_analysis,
          score: item.score,
          scores: item.scores,
          stored_audio: item.stored_audio,
        }),
      )

      setInteractions(mappedData)
    } catch (error) {
      console.error("Error fetching interactions:", error)
    }
  }

  useEffect(() => {
    fetchInteractions()
  }, [])

  // -------- Handlers --------
  const handleRowClick = (interaction: CallData) => {
    setSelectedInteraction(interaction)
    setDrawerOpen(true)
  }

  const addKeyword = () => {
    const trimmed = keywordInput.trim()
    if (trimmed && !keywords.includes(trimmed.toLowerCase())) {
      setKeywords((prev) => [...prev, trimmed.toLowerCase()])
      setKeywordInput("")
    }
  }

  const removeKeyword = (keywordToRemove: string) => {
    setKeywords((prev) => prev.filter((k) => k !== keywordToRemove))
  }

  const handleKeywordInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addKeyword()
    }
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setKeywordInput("")
    setKeywords([])
    setStatusFilter("all")
    setCallTypeFilter("all")
    setOperatorFilter("all")
    setTimeFilterMode("last")
    setShowLastAmount("60")
    setShowLastUnit("minutes")
    setDateFrom("")
    setDateTo("")
  }

  const calTime = (givenTime?: number) => {
    const time_sec = givenTime ?? 0

    if (time_sec < 60) {
      return `${time_sec}s`
    }

    if (time_sec < 3600) {
      const min = Math.floor(time_sec / 60)
      const sec = time_sec % 60
      return `${min}m  ${sec}s`
    }

    const hr = Math.floor(time_sec / 3600)
    const min = Math.floor((time_sec % 3600) / 60)
    return `${hr}h ${min}m`
  }

  // build operator list from data
  const operatorOptions = Array.from(
    new Set(
      interactions
        .map((i) => i.dispatcher_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ).sort()

  // -------- Filtering --------
  const filteredInteractions = interactions.filter((interaction) => {
    const q = searchQuery.toLowerCase()

    const matchesSearch =
      interaction.call_id?.toLowerCase().includes(q) ||
      interaction.dispatcher_id?.toLowerCase().includes(q) ||
      interaction.callType?.some(
        (ct) =>
          ct.agency.toLowerCase().includes(q) ||
          ct.specific_emergency.toLowerCase().includes(q),
      )

    const matchesStatus =
      statusFilter === "all" || interaction.status === statusFilter

    const matchesCallType =
      callTypeFilter === "all" ||
      interaction.callType?.some((ct) => ct.agency === callTypeFilter)

    const matchesOperator =
      operatorFilter === "all" ||
      interaction.dispatcher_id === operatorFilter

    const matchesKeywords =
      keywords.length === 0 ||
      keywords.every((keyword) =>
        interaction.transcript?.toLowerCase().includes(keyword),
      )

    // time filter
    let matchesTime = true
    if (interaction.created_at) {
      const createdAt = new Date(interaction.created_at)
      if (!isNaN(createdAt.getTime())) {
        if (timeFilterMode === "last") {
          const amount = Number(showLastAmount)
          if (amount > 0) {
            const now = new Date()
            let ms = 0
            if (showLastUnit === "minutes") ms = amount * 60 * 1000
            if (showLastUnit === "hours") ms = amount * 60 * 60 * 1000
            if (showLastUnit === "days") ms = amount * 24 * 60 * 60 * 1000

            const cutoff = new Date(now.getTime() - ms)
            matchesTime = createdAt >= cutoff
          }
        } else {
          if (dateFrom) {
            const from = new Date(dateFrom)
            if (!isNaN(from.getTime())) {
              matchesTime = matchesTime && createdAt >= from
            }
          }
          if (matchesTime && dateTo) {
            const to = new Date(dateTo)
            if (!isNaN(to.getTime())) {
              to.setHours(23, 59, 59, 999)
              matchesTime = matchesTime && createdAt <= to
            }
          }
        }
      }
    }

    return (
      matchesSearch &&
      matchesStatus &&
      matchesCallType &&
      matchesOperator &&
      matchesKeywords &&
      matchesTime
    )
  })

  return (
    <ProtectedPage required={["Interactions"]}>
      <div className="space-y-6">
        <div>
          <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground">
            Search and Replay
          </h1>
          <p className="text-muted-foreground">
            View and manage all 911 call interactions
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Call Interactions</CardTitle>
            <CardDescription>
              Complete list of processed and queued calls
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-6 space-y-4">
              {/* Top row: search + status + call type */}
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by File Name, Operator, or Call Type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="queued">Queued</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="processed">Processed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={callTypeFilter} onValueChange={setCallTypeFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Call Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="EMS">EMS</SelectItem>
                    <SelectItem value="Fire">Fire</SelectItem>
                    <SelectItem value="Police">Police</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Keyword Search (2nd row, full width) */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Add keyword to search transcripts..."
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={handleKeywordInputKeyDown}
                      className="pl-9"
                    />
                  </div>
                  <Button
                    onClick={addKeyword}
                    disabled={!keywordInput.trim()}
                    size="default"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                {keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword) => (
                      <Badge
                        key={keyword}
                        variant="secondary"
                        className="pl-3 pr-1 py-1 text-sm"
                      >
                        {keyword}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 ml-2 hover:bg-transparent"
                          onClick={() => removeKeyword(keyword)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Operator row + Reset button (3rd row) */}
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div className="flex-1 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Operator
                  </p>
                  <Select
                    value={operatorFilter}
                    onValueChange={setOperatorFilter}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Operators" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Operators</SelectItem>
                      {operatorOptions.map((op) => (
                        <SelectItem key={op} value={op}>
                          {op}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-1 self-start text-xs font-medium text-primary md:self-auto"
                  onClick={handleResetFilters}
                >
                  Reset All Filters
                </Button>
              </div>

              {/* Time Filter (4th row, full width, stacked like reference) */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Time Filter
                </p>

                {/* Radio-style options */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      className="h-4 w-4 cursor-pointer accent-primary"
                      checked={timeFilterMode === "last"}
                      onChange={() => setTimeFilterMode("last")}
                    />
                    <span>Show Last</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      className="h-4 w-4 cursor-pointer accent-primary"
                      checked={timeFilterMode === "range"}
                      onChange={() => setTimeFilterMode("range")}
                    />
                    <span>Date Range</span>
                  </label>
                </div>

                {timeFilterMode === "last" ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Show Last
                    </p>
                    <div className="flex gap-2 max-w-md">
                      <Input
                        type="number"
                        min={1}
                        value={showLastAmount}
                        onChange={(e) => setShowLastAmount(e.target.value)}
                        className="w-28"
                        placeholder="Value"
                      />
                      <Select
                        value={showLastUnit}
                        onValueChange={(val) =>
                          setShowLastUnit(
                            val as "minutes" | "hours" | "days",
                          )
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Minutes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-w-xl sm:flex-row">
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full"
                    />
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>File Name</TableHead>
                    <TableHead>Operator</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Call Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sentiment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInteractions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No interactions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInteractions.map((interaction, idx) => {
                      const rowSentiment = rowSentiments[interaction._id]

                      return (
                        <TableRow
                          key={interaction._id}
                          className={cn(
                            "cursor-pointer",
                            idx % 2 !== 1 && "bg-muted/40",
                            "hover:bg-muted/80",
                          )}
                          onClick={() => handleRowClick(interaction)}
                        >
                          <TableCell className="font-medium">
                            {interaction.call_id}
                          </TableCell>
                          <TableCell>{interaction.dispatcher_id}</TableCell>
                          <TableCell>{interaction.language}</TableCell>
                          <TableCell>{interaction.model}</TableCell>
                          <TableCell>
                            <div className="flex flex-col text-sm">
                              {interaction.callType?.map((ct, i) => (
                                <span key={i}>
                                  {ct.agency} - {ct.specific_emergency}
                                </span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            {calTime(interaction.duration_seconds)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge
                              status={
                                (interaction.status ?? "failed") as Status
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <SentimentBadge
                              sentiment={
                                (rowSentiment?.sentiment ||
                                  interaction.sentiment) as any
                              }
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredInteractions.length} of {interactions.length}{" "}
              interactions
            </div>
          </CardContent>
        </Card>

        <InteractionDrawer
          interaction={selectedInteraction}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
        />
      </div>
    </ProtectedPage>
  )
}