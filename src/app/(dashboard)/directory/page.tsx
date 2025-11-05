"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { dispatcherLeaderboard, evaluations } from "@/lib/sample-data"
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus, Users, Phone, Star, Target } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Cell } from "recharts"
import { cn } from "@/lib/utils"

export default function DirectoryPage() {
  const [q, setQ] = useState("")
  const [trendFilter, setTrendFilter] = useState<"all" | "up" | "down" | "stable">("all")
  const [sortBy, setSortBy] = useState<"rank" | "calls" | "score">("rank")

  // Calculate stats
  const stats = useMemo(() => {
    const totalOperators = dispatcherLeaderboard.length
    const totalCalls = dispatcherLeaderboard.reduce((sum, d) => sum + d.totalCalls, 0)
    const avgScore = dispatcherLeaderboard.reduce((sum, d) => sum + d.avgScore, 0) / totalOperators
    const topPerformers = dispatcherLeaderboard.filter(d => d.avgScore >= 90).length
    
    return { totalOperators, totalCalls, avgScore: avgScore.toFixed(1), topPerformers }
  }, [])

  // Filter and sort items
  const items = useMemo(() => {
    let filtered = dispatcherLeaderboard
    
    // Search filter
    const term = q.trim().toLowerCase()
    if (term) {
      filtered = filtered.filter((d) => {
        return (
          String(d.rank).includes(term) ||
          d.name.toLowerCase().includes(term) ||
          String(d.totalCalls).includes(term) ||
          String(d.avgScore).includes(term)
        )
      })
    }
    
    // Trend filter
    if (trendFilter !== "all") {
      filtered = filtered.filter(d => d.trend === trendFilter)
    }
    
    // Sort
    const sorted = [...filtered]
    if (sortBy === "calls") {
      sorted.sort((a, b) => b.totalCalls - a.totalCalls)
    } else if (sortBy === "score") {
      sorted.sort((a, b) => b.avgScore - a.avgScore)
    }
    // rank is default sort (already sorted)
    
    return sorted
  }, [q, trendFilter, sortBy])

  // Performance distribution data
  const performanceDistribution = useMemo(() => {
    return [
      { range: "90-100", count: dispatcherLeaderboard.filter(d => d.avgScore >= 90).length, fill: "#10b981" },
      { range: "85-89", count: dispatcherLeaderboard.filter(d => d.avgScore >= 85 && d.avgScore < 90).length, fill: "#3b82f6" },
      { range: "80-84", count: dispatcherLeaderboard.filter(d => d.avgScore >= 80 && d.avgScore < 85).length, fill: "#8b5cf6" },
      { range: "75-79", count: dispatcherLeaderboard.filter(d => d.avgScore >= 75 && d.avgScore < 80).length, fill: "#f59e0b" },
      { range: "<75", count: dispatcherLeaderboard.filter(d => d.avgScore < 75).length, fill: "#ef4444" },
    ]
  }, [])

  // Calls by operator data
  const callsByOperator = useMemo(() => {
    return dispatcherLeaderboard.slice(0, 8).map(d => ({
      name: d.name.split(' ')[0],
      calls: d.totalCalls,
      score: d.avgScore
    }))
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
    if (score >= 90)
      return "bg-green-500/10 text-green-700 dark:bg-green-600/30 dark:text-green-200 hover:dark:bg-green-600/40"
    if (score >= 85)
      return "bg-amber-500/10 text-amber-700 dark:bg-amber-600/30 dark:text-amber-200 hover:dark:bg-amber-600/40"
    return "bg-red-500/10 text-red-700 dark:bg-red-600/30 dark:text-red-200 hover:dark:bg-red-600/40"
  }

  const tooltipStyle = {
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    color: "var(--foreground)",
    padding: 8,
  }

  const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null
    const item = payload[0]
    const displayValue = item.value
    const displayLabel = label || item.name
    const color = item.color || item.fill || item.stroke || "#3b82f6"
    
    return (
      <div style={tooltipStyle}>
        <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 4 }}>{displayLabel}</div>
        <div style={{ fontWeight: 700, color }}>{displayValue}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground">Directory</h1>
        <p className="text-muted-foreground">Lookup employees and see summary stats</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Total Operators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalOperators}</div>
            <p className="text-xs text-muted-foreground mt-1">Active call takers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Total Calls Handled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalCalls.toLocaleString()}</div>
            <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +8% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avgScore}%</div>
            <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +2.1% improvement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.topPerformers}</div>
            <p className="text-xs text-muted-foreground mt-1">Score ≥ 90%</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Performance Distribution</CardTitle>
            <CardDescription className="text-xs">Operators by score range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="range" stroke="var(--muted-foreground)" fontSize={10} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {performanceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Call Volume by Operator</CardTitle>
            <CardDescription className="text-xs">Top 8 operators by total calls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={callsByOperator}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={10} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="calls" 
                    name="Calls"
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Directory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
          <CardDescription>Search and filter operators</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-4 flex flex-col sm:flex-row gap-3">
            <Input 
              placeholder="Search employees (name, rank, calls, score)" 
              value={q} 
              onChange={(e: any) => setQ(e.target.value)}
              className="sm:max-w-xs"
            />
            
            <Select value={trendFilter} onValueChange={(v: any) => setTrendFilter(v)}>
              <SelectTrigger className="sm:w-[150px]">
                <SelectValue placeholder="Trend" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trends</SelectItem>
                <SelectItem value="up">↑ Trending Up</SelectItem>
                <SelectItem value="down">↓ Trending Down</SelectItem>
                <SelectItem value="stable">→ Stable</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="sm:w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rank">Rank</SelectItem>
                <SelectItem value="calls">Total Calls</SelectItem>
                <SelectItem value="score">Score</SelectItem>
              </SelectContent>
            </Select>

            {(q || trendFilter !== "all" || sortBy !== "rank") && (
              <Button 
                variant="ghost" 
                onClick={() => {
                  setQ("")
                  setTrendFilter("all")
                  setSortBy("rank")
                }}
                className="sm:ml-auto"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Table */}
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[80px]">Rank</TableHead>
                  <TableHead>Operator</TableHead>
                  <TableHead className="text-right">Total Calls</TableHead>
                  <TableHead className="text-right">Avg Score</TableHead>
                  <TableHead className="text-center">Trend</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No operators found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((d) => (
                    <TableRow key={d.rank}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRankIcon(d.rank)}
                          <span className="font-semibold">#{d.rank}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{d.name}</TableCell>
                      <TableCell className="text-right">{d.totalCalls}</TableCell>
                      <TableCell className="text-right">
                        <Badge 
                          variant="secondary" 
                          className={cn("font-medium", getScoreBadgeColor(d.avgScore))}
                        >
                          {d.avgScore}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {getTrendIcon(d.trend)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/directory/profile/${d.rank}`}>
                          <Button variant="ghost" size="sm">
                            View Profile
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {items.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {items.length} of {dispatcherLeaderboard.length} operators
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
