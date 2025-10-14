"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState, useMemo, useEffect } from "react"
import { LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { dispatcherLeaderboard, callsByTypeData, callsTrendData } from "@/lib/sample-data"
import { TrendingUp, TrendingDown, Minus, Trophy, Medal, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function AnalyticsPage() {

  
  type CallData = {
    date: string;
    calls: number;
  };

// Base URL for the API (Vercel uses the env var; local dev can use fallback)
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:5001";

  const [callsData, setCallsData] = useState<any[]>([])
  const [callsByDateData, setCallsByDateData] = useState<CallData[]>([])

  const fetchCallsByTypeData = async () => {
    try {
      const res = await fetch(`${API_BASE}/calls/byType`)        
      if(res.ok !== true) {
        throw new Error(`Error fetching calls by type: ${res.status} ${res.statusText}`);
      }
      const data = await res.json()
      setCallsData(data)
    } catch (error) {
      console.error("Error fetching calls by type:", error)
    }
  }

  const fetchCallsByDateData = async () => {
    try {
      const res = await fetch(`${API_BASE}/calls/byDate`);                   
      if (!res.ok) {
        throw new Error(`Error fetching calls by date: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();

      // Map to expected format
      
      const formatted = data.map((item: { type: string; count: number }) => ({
        date: item.type,
        calls: item.count,
      }));
      setCallsByDateData(formatted);
    } catch (error) {
      console.error("Error fetching calls by date:", error);
    }
  };


  useEffect(() => {
    fetchCallsByTypeData()
    fetchCallsByDateData()
  }, [])


  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-amber-400" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Award className="h-5 w-5 text-orange-600" />
    return null
  }

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-400" />
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-400" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  const getScoreBadgeColor = (score: number) => {
    // Use the same light/dark-aware utility classes used by Sentiment/Status badges
    if (score >= 90)
      return "bg-green-500/10 text-green-700 dark:bg-green-600/30 dark:text-green-200 hover:dark:bg-green-600/40"
    if (score >= 85)
      return "bg-amber-500/10 text-amber-700 dark:bg-amber-600/30 dark:text-amber-200 hover:dark:bg-amber-600/40"
    return "bg-red-500/10 text-red-700 dark:bg-red-600/30 dark:text-red-200 hover:dark:bg-red-600/40"
  }

  const chartColors = useMemo(() => {
    // Use CSS variables so colors update with dark/light theme
    return [
      "var(--chart-1)",
      "var(--chart-2)",
      "var(--chart-3)",
      "var(--chart-4)",
      "var(--chart-5)",
    ]
  }, [])

  const tooltipStyle = useMemo(() => ({
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    color: "var(--foreground)",
    padding: 8,
  }), [])

  const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null

    const item = payload[0]
    // determine the type key (bar uses payload.type, pie uses name)
    const key = item.payload?.type ?? item.name ?? label
    // prefer any color provided by the chart payload (many recharts shapes include stroke/fill)
    const payloadColor = item.color || item.fill || item.stroke
    const dataIndex = callsData.findIndex((d) => d.type === key)
    const paletteColor = chartColors[dataIndex >= 0 ? dataIndex % chartColors.length : 0] || "var(--primary)"
    const color = payloadColor || paletteColor

    return (
      <div style={tooltipStyle}>
        <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{key}</div>
        <div style={{ fontWeight: 700, color }}>{item.value}</div>
      </div>
    )
  }

  const renderPieLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, index } = props
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return (
      <text x={x} y={y} fill="var(--muted-foreground)" fontSize={12} textAnchor={x > cx ? "start" : "end"} dominantBaseline="central">
        {callsByTypeData[index]?.type}
      </text>
    )
  }

  // Time range controls for calls trend chart
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "1y" | "custom">("7d")
  const [customStart, setCustomStart] = useState<string>("")
  const [customEnd, setCustomEnd] = useState<string>("")

  const filteredCallsTrendData = useMemo(() => {
    const len = callsByDateData.length
    if (timeRange === "7d") return callsByDateData.slice(Math.max(len - 7, 0))
    if (timeRange === "30d") return callsByDateData.slice(Math.max(len - 30, 0))
    if (timeRange === "1y") return callsByDateData.slice(Math.max(len - 365, 0))
    // custom: filter by parsed date range when possible
    if (timeRange === "custom") {
      if (!customStart || !customEnd) return callsByDateData
      const start = new Date(customStart)
      const end = new Date(customEnd)
      end.setHours(23, 59, 59, 999)
      return callsByDateData.filter((d) => {
        const parsed = new Date(d.date)
        if (isNaN(parsed.getTime())) return false
        return parsed >= start && parsed <= end
      })
    }
    return callsByDateData
  }, [timeRange, customStart, customEnd, callsByDateData])

  const rangeLabel = useMemo(() => {
    if (timeRange === "7d") return "Last 7 Days"
    if (timeRange === "30d") return "Last 30 Days"
    if (timeRange === "1y") return "Last Year"
    if (timeRange === "custom") {
      if (customStart && customEnd) return `${customStart} to ${customEnd}`
      if (customStart) return `From ${customStart}`
      if (customEnd) return `Until ${customEnd}`
      return "Custom Range"
    }
    return ""
  }, [timeRange, customStart, customEnd])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Performance insights and trends</p>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Calls Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Calls Processed - {rangeLabel}</CardTitle>
            <CardDescription>Daily call volume trend ({rangeLabel})</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-end gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Button size="sm" variant={timeRange === "7d" ? "secondary" : "ghost"} onClick={() => setTimeRange("7d")}>7d</Button>
                <Button size="sm" variant={timeRange === "30d" ? "secondary" : "ghost"} onClick={() => setTimeRange("30d")}>30d</Button>
                <Button size="sm" variant={timeRange === "1y" ? "secondary" : "ghost"} onClick={() => setTimeRange("1y")}>1y</Button>
                <Button size="sm" variant={timeRange === "custom" ? "secondary" : "ghost"} onClick={() => setTimeRange("custom")}>Custom</Button>
              </div>
              {timeRange === "custom" && (
                <div className="flex items-center gap-2">
                  <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="input input-sm" />
                  <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="input input-sm" />
                </div>
              )}
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredCallsTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="calls"
                    stroke="#2f87df"
                    strokeWidth={2}
                    dot={{ fill: "var(--primary)", r: 4 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Calls by Type Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Calls by Type</CardTitle>
            <CardDescription>Distribution of call categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={callsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="type" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count">
                    {callsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Dispatcher Leaderboard</CardTitle>
          <CardDescription>Top performers ranked by average score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[80px]">Rank</TableHead>
                  <TableHead>Dispatcher</TableHead>
                  <TableHead className="text-right">Total Calls</TableHead>
                  <TableHead className="text-right">Avg Score</TableHead>
                  <TableHead className="text-center">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dispatcherLeaderboard.map((dispatcher) => (
                  <TableRow key={dispatcher.rank}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRankIcon(dispatcher.rank)}
                        <span className="font-semibold">#{dispatcher.rank}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{dispatcher.name}</TableCell>
                    <TableCell className="text-right">{dispatcher.totalCalls}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary" className={cn("font-medium", getScoreBadgeColor(dispatcher.avgScore))}>
                        {dispatcher.avgScore}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{getTrendIcon(dispatcher.trend)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Calls This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">2,418</div>
            <p className="text-xs text-green-400 mt-1">↑ 12.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">1.8s</div>
            <p className="text-xs text-green-400 mt-1">↓ 0.3s improvement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">97.2%</div>
            <p className="text-xs text-green-400 mt-1">↑ 1.2% from last month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
