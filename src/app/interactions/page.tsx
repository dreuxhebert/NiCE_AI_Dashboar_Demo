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


export default function InteractionsPage() {
  const [interactions, setInteractions] = useState<any[]>([])
  const [selectedInteraction, setSelectedInteraction] = useState<any | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [callTypeFilter, setCallTypeFilter] = useState<string>("all")

  const handleRowClick = (interaction: any) => {
    setSelectedInteraction(interaction)
    setDrawerOpen(true)
  }

  const fetchInteractions = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5001/calls")       // After Uploading on render -> "https://inform-ai-backend.onrender.com/calls"
      const data = await res.json()
      const mappedData = data.map((item: any) => ({
        id: item.id || item._id,
        dispatcher: item.dispatcher_id,
        language: item.language,
        model: item.model,
        callType: item.callType,
        duration: item.duration_seconds,
        status: item.status,
        sentiment: item.sentiment,
        fileName: item.call_id,
        transcript: item.transcript,
        summary: item.summary,
      }))
      setInteractions(mappedData)
    } catch (error) {
      console.error("Error fetching interactions:", error)
    }
  }

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
                placeholder="Search by file name or dispatcher or call type..."
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
                  <TableHead>Dispatcher</TableHead>
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
                  filteredInteractions.map((interaction) => (
                    <TableRow
                      key={interaction.id}
                      className="cursor-pointer"
                      onClick={() => handleRowClick(interaction)}
                    >
                      <TableCell className="font-medium">{interaction.fileName}</TableCell>
                      <TableCell>{interaction.dispatcher}</TableCell>
                      <TableCell>{interaction.language}</TableCell>
                      <TableCell>{interaction.model}</TableCell>
                      <TableCell>{interaction.callType}</TableCell>
                      <TableCell>{interaction.duration}</TableCell>
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
