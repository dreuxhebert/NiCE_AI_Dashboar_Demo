"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { SentimentBadge } from "@/components/sentiment-badge"
import { InteractionDrawer } from "@/components/interaction-drawer"
import { Search, Filter } from "lucide-react"
import { cn } from "@/lib/utils"

// Environment-based API configuration
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
};

export default function InteractionsPage() {

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
    stored_audio: string;
  }

  const [interactions, setInteractions] = useState<any[]>([])
  const [selectedInteraction, setSelectedInteraction] = useState<CallData | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [callTypeFilter, setCallTypeFilter] = useState<string>("all")

  const handleRowClick = (interaction: CallData) => {
    console.log(selectedInteraction?.call_id)
    setSelectedInteraction(interaction)
    setDrawerOpen(true)
  }

  const fetchInteractions = async () => {
  try {
    const apiUrl = getApiUrl('/calls/');
    const res = await fetch(apiUrl, { cache: 'no-store' });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`GET /api/proxy/calls/ → ${res.status} ${res.statusText}\n${text}`);
    }

    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      const text = await res.text();
      throw new Error(`Expected JSON but got "${ct}". Body:\n${text}`);
    }

    const data = await res.json();

    const mappedData = (Array.isArray(data) ? data : []).map((item: any) => ({
      _id: item._id,
      id: item.id,  // this is your interaction_id
      dispatcher_id: item.dispatcher_id,
      call_id: item.call_id,  // <-- THIS exists in your CallData
      duration_seconds: item.duration_seconds,
      direction: item.direction,
      language: item.language,
      model: item.model,
      callType: item.callType,
      status: item.status,
      sentiment: item.sentiment,
      transcript: item.transcript,
      summary: item.summary,
      created_at: item.created_at,
      callEvaluationType: item.callEvaluationType,
      qa_analysis: item.qa_analysis,
      score: item.score,
      scores: item.scores,
      stored_audio: item.stored_audio,   // ✅ IMPORTANT
    }));

    setInteractions(mappedData);
  } catch (error) {
    console.error('Error fetching interactions:', error);
  }
};

  useEffect(() => {
    fetchInteractions()
  }, [])

  const filteredInteractions = interactions.filter((interaction) => {
    const matchesSearch =
      interaction.fileName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interaction.dispatcher?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interaction.callType?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || interaction.status === statusFilter
    const matchesCallType = callTypeFilter === "all" || interaction.callType === callTypeFilter
    return matchesSearch && matchesStatus && matchesCallType
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground">Interactions</h1>
        <p className="text-muted-foreground">View and manage all 911 call interactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Call Interactions</CardTitle>
          <CardDescription>Complete list of processed and queued calls</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by File Name or Operator or call type..."
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
                <SelectItem value="Medical">Medical</SelectItem>
                <SelectItem value="Fire">Fire</SelectItem>
                <SelectItem value="Shooting">Shooting</SelectItem>
                <SelectItem value="Traffic">Traffic</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
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
                  filteredInteractions.map((interaction, idx) => (
                    <TableRow
                      key={interaction.id}
                      className={cn(
                        "cursor-pointer",
                        idx % 2 !== 1 && "bg-muted/40",
                        "hover:bg-muted/80"
                      )}
                      onClick={() => handleRowClick(interaction)}
                    >
                      <TableCell 
                        className="font-medium">{interaction.call_id}
                      </TableCell>
                      <TableCell>{interaction.dispatcher_id}</TableCell>
                      <TableCell>{interaction.language}</TableCell>
                      <TableCell>{interaction.model}</TableCell>
                      <TableCell>{interaction.callType}</TableCell>
                      <TableCell>{interaction.duration} sec</TableCell>
                      <TableCell>
                        <StatusBadge status={interaction.status} />
                      </TableCell>
                      <TableCell>
                        <SentimentBadge sentiment={interaction.sentiment} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredInteractions.length} of {interactions.length} interactions
          </div>
        </CardContent>
      </Card>

      <InteractionDrawer
        interaction={selectedInteraction}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  )
}
