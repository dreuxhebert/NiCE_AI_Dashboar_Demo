"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { callsTrendData, callsByTypeData, dispatcherLeaderboard } from "@/lib/sample-data"
import { TrendingUp, TrendingDown, Minus, Trophy, Medal, Award } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AnalyticsPage() {
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
    if (score >= 90) return "bg-green-500/20 text-green-300 hover:bg-green-500/30"
    if (score >= 85) return "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
    return "bg-red-500/20 text-red-300 hover:bg-red-500/30"
  }

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
            <CardTitle>Calls Processed - Last 7 Days</CardTitle>
            <CardDescription>Daily call volume trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={callsTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border))" />
                  <XAxis dataKey="date" stroke="var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card))",
                      border: "1px solid var(--border))",
                      borderRadius: "var(--radius)",
                      color: "var(--foreground))",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="calls"
                    stroke="var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "var(--primary))", r: 4 }}
                    activeDot={{ r: 6 }}
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
                <BarChart data={callsByTypeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border))" />
                  <XAxis dataKey="type" stroke="var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card))",
                      border: "1px solid var(--border))",
                      borderRadius: "var(--radius)",
                      color: "var(--foreground))",
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} />
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
