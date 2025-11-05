"use client"

import { useMemo, useState } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { dispatcherLeaderboard, evaluations, coachingTasks } from "@/lib/sample-data"
import { 
  Trophy, Medal, Award, TrendingUp, TrendingDown, Minus, 
  Phone, Star, Calendar, Clock, Award as AwardIcon, 
  AlertCircle, CheckCircle, Target, BarChart3, ArrowLeft,
  Users, Activity, MessageSquare
} from "lucide-react"
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts"
import { cn } from "@/lib/utils"

interface Props {
  params: { id: string }
}

export default function DirectoryProfilePage({ params }: Props) {
  const id = Number(params.id)
  const dispatcher = dispatcherLeaderboard.find((d) => d.rank === id)
  if (!dispatcher) return notFound()

  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d")

  // Get operator's evaluations
  const operatorEvaluations = useMemo(() => {
    return evaluations.filter(e => e.callTakerName === dispatcher.name)
  }, [dispatcher.name])

  // Get operator's coaching tasks
  const operatorCoachingTasks = useMemo(() => {
    return coachingTasks.filter(t => t.callTakerName === dispatcher.name)
  }, [dispatcher.name])

  // Calculate stats
  const stats = useMemo(() => {
    const avgAutoQA = operatorEvaluations
      .filter(e => e.evaluatorType === "AI QA System")
      .reduce((sum, e) => sum + e.score, 0) / operatorEvaluations.filter(e => e.evaluatorType === "AI QA System").length || 0
    
    const avgManualQA = operatorEvaluations
      .filter(e => e.evaluatorType === "Human")
      .reduce((sum, e) => sum + e.score, 0) / operatorEvaluations.filter(e => e.evaluatorType === "Human").length || 0

    const totalStandardsMet = operatorEvaluations.reduce((sum, e) => sum + e.standardsMet, 0)
    const totalStandardsNotMet = operatorEvaluations.reduce((sum, e) => sum + e.standardsNotMet, 0)
    const complianceRate = totalStandardsMet / (totalStandardsMet + totalStandardsNotMet) * 100 || 0

    return {
      avgAutoQA: avgAutoQA.toFixed(1),
      avgManualQA: avgManualQA.toFixed(1),
      complianceRate: complianceRate.toFixed(1),
      totalEvaluations: operatorEvaluations.length,
      criticalViolations: operatorEvaluations.reduce((sum, e) => sum + e.criticalViolations.length, 0)
    }
  }, [operatorEvaluations])

  // Performance trend data (mock data for visualization)
  const performanceTrend = useMemo(() => {
    return [
      { date: "Week 1", score: 85, calls: 68 },
      { date: "Week 2", score: 87, calls: 72 },
      { date: "Week 3", score: 89, calls: 75 },
      { date: "Week 4", score: dispatcher.avgScore, calls: dispatcher.totalCalls / 4 },
    ]
  }, [dispatcher])

  // Skills radar chart data
  const skillsData = useMemo(() => {
    return [
      { skill: "Information Gathering", score: 92 },
      { skill: "Caller Management", score: 88 },
      { skill: "Protocol Compliance", score: 85 },
      { skill: "Communication", score: 91 },
      { skill: "Response Time", score: 87 },
      { skill: "Documentation", score: 89 },
    ]
  }, [])

  // Compare with team average
  const teamAvgScore = useMemo(() => {
    return dispatcherLeaderboard.reduce((sum, d) => sum + d.avgScore, 0) / dispatcherLeaderboard.length
  }, [])

  // Recent call performance (mock data)
  const recentCalls = useMemo(() => {
    return [
      { date: "2025-01-15", time: "14:23", type: "Medical", duration: "4:32", score: 94, sentiment: "neutral" },
      { date: "2025-01-15", time: "13:45", type: "Fire", duration: "3:15", score: 87, sentiment: "negative" },
      { date: "2025-01-15", time: "12:18", type: "Traffic", duration: "2:48", score: 92, sentiment: "neutral" },
      { date: "2025-01-15", time: "11:52", type: "Police", duration: "6:21", score: 88, sentiment: "positive" },
      { date: "2025-01-15", time: "10:33", type: "Medical", duration: "5:12", score: 90, sentiment: "neutral" },
    ]
  }, [])

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-amber-400" />
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />
    if (rank === 3) return <Award className="h-6 w-6 text-orange-600" />
    return null
  }

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    if (trend === "up") return <TrendingUp className="h-5 w-5 text-green-400" />
    if (trend === "down") return <TrendingDown className="h-5 w-5 text-red-400" />
    return <Minus className="h-5 w-5 text-gray-400" />
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90)
      return "bg-green-500/10 text-green-700 dark:bg-green-600/30 dark:text-green-200"
    if (score >= 85)
      return "bg-amber-500/10 text-amber-700 dark:bg-amber-600/30 dark:text-amber-200"
    return "bg-red-500/10 text-red-700 dark:bg-red-600/30 dark:text-red-200"
  }

  const getStatusBadge = (status: string) => {
    if (status === "completed") return <Badge variant="secondary" className="bg-green-500/10 text-green-700">Completed</Badge>
    if (status === "in-progress") return <Badge variant="secondary" className="bg-blue-500/10 text-blue-700">In Progress</Badge>
    return <Badge variant="secondary" className="bg-amber-500/10 text-amber-700">Pending</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    if (priority === "high") return <Badge variant="destructive">High</Badge>
    if (priority === "medium") return <Badge variant="secondary" className="bg-amber-500/10 text-amber-700">Medium</Badge>
    return <Badge variant="secondary">Low</Badge>
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
    return (
      <div style={tooltipStyle}>
        <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{label}</div>
        {payload.map((item: any, idx: number) => (
          <div key={idx} style={{ fontWeight: 700, color: item.color || item.fill }}>{item.name}: {item.value}</div>
        ))}
      </div>
    )
  }

  const initials = dispatcher.name.split(' ').map(n => n[0]).join('')

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link href="/directory">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground">{dispatcher.name}</h1>
          <p className="text-muted-foreground">Operator Performance Profile</p>
        </div>
      </div>

      {/* Profile Summary Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start gap-4">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2">
                {getRankIcon(dispatcher.rank)}
                <div>
                  <div className="text-sm font-medium">Rank #{dispatcher.rank}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Performance Trend:</span>
                    {getTrendIcon(dispatcher.trend)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Total Calls
                </div>
                <div className="text-2xl font-bold">{dispatcher.totalCalls}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Avg Score
                </div>
                <div className="text-2xl font-bold">{dispatcher.avgScore}%</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Compliance
                </div>
                <div className="text-2xl font-bold">{stats.complianceRate}%</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <AwardIcon className="h-3 w-3" />
                  Evaluations
                </div>
                <div className="text-2xl font-bold">{stats.totalEvaluations}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Auto QA Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avgAutoQA}%</div>
            <p className="text-xs text-muted-foreground mt-1">AI-evaluated calls</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Violations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.criticalViolations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.criticalViolations === 0 ? "Excellent!" : "Needs attention"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">vs Team Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              {dispatcher.avgScore > teamAvgScore ? (
                <>
                  <TrendingUp className="h-6 w-6 text-green-400" />
                  +{(dispatcher.avgScore - teamAvgScore).toFixed(1)}%
                </>
              ) : (
                <>
                  <TrendingDown className="h-6 w-6 text-red-400" />
                  {(dispatcher.avgScore - teamAvgScore).toFixed(1)}%
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Team avg: {teamAvgScore.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
          <TabsTrigger value="coaching">Coaching</TabsTrigger>
          <TabsTrigger value="calls">Recent Calls</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Performance Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Performance Trend</CardTitle>
              <CardDescription className="text-xs">Score progression over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceTrend}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={10} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={10} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="score"
                      name="Score"
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorScore)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Skills Radar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Skills Assessment</CardTitle>
              <CardDescription className="text-xs">Breakdown by competency area</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={skillsData}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="skill" stroke="var(--muted-foreground)" fontSize={11} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={10} />
                    <Radar 
                      name="Score" 
                      dataKey="score" 
                      stroke="#8b5cf6" 
                      fill="#8b5cf6" 
                      fillOpacity={0.4}
                      strokeWidth={2}
                    />
                    <Tooltip content={<ChartTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evaluations Tab */}
        <TabsContent value="evaluations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evaluation History</CardTitle>
              <CardDescription>All QA evaluations for this operator</CardDescription>
            </CardHeader>
            <CardContent>
              {operatorEvaluations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No evaluations found for this operator
                </div>
              ) : (
                <div className="rounded-md border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Call Type</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                        <TableHead className="text-right">Standards Met</TableHead>
                        <TableHead className="text-right">Violations</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {operatorEvaluations.map((evaluation) => (
                        <TableRow key={evaluation.id}>
                          <TableCell className="text-sm">{evaluation.date}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {evaluation.evaluatorType === "AI QA System" ? "Auto" : "Manual"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{evaluation.callType}</TableCell>
                          <TableCell className="text-right">
                            <Badge 
                              variant="secondary" 
                              className={cn("font-medium", getScoreBadgeColor(evaluation.score))}
                            >
                              {evaluation.score}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {evaluation.standardsMet}/{evaluation.standardsMet + evaluation.standardsNotMet}
                          </TableCell>
                          <TableCell className="text-right">
                            {evaluation.criticalViolations.length > 0 ? (
                              <Badge variant="destructive" className="text-xs">
                                {evaluation.criticalViolations.length}
                              </Badge>
                            ) : (
                              <span className="text-sm text-green-400">None</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Coaching Tab */}
        <TabsContent value="coaching" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Coaching Tasks</CardTitle>
              <CardDescription>Development areas and action items</CardDescription>
            </CardHeader>
            <CardContent>
              {operatorCoachingTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-400" />
                  <div className="font-medium">No active coaching tasks</div>
                  <div className="text-sm">This operator is meeting all performance standards</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {operatorCoachingTasks.map((task) => (
                    <Card key={task.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-base">{task.focusArea}</CardTitle>
                            <CardDescription className="text-xs">
                              Due: {task.dueDate} • Created: {task.createdDate}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            {getPriorityBadge(task.priority)}
                            {getStatusBadge(task.status)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <div className="text-sm font-medium mb-1">Issue Description</div>
                          <p className="text-sm text-muted-foreground">{task.issueDescription}</p>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium mb-2">Action Items</div>
                          <div className="space-y-1">
                            {task.actionItems.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                {item.completed ? (
                                  <CheckCircle className="h-4 w-4 text-green-400" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-amber-400" />
                                )}
                                <span className={item.completed ? "line-through text-muted-foreground" : ""}>
                                  {item.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {task.completionNotes && (
                          <div>
                            <div className="text-sm font-medium mb-1">Completion Notes</div>
                            <p className="text-sm text-muted-foreground">{task.completionNotes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Calls Tab */}
        <TabsContent value="calls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Call Performance</CardTitle>
              <CardDescription>Last 5 calls handled by this operator</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                      <TableHead>Sentiment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentCalls.map((call, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-sm">
                          {call.date} <span className="text-muted-foreground">{call.time}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {call.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{call.duration}</TableCell>
                        <TableCell className="text-right">
                          <Badge 
                            variant="secondary" 
                            className={cn("font-medium", getScoreBadgeColor(call.score))}
                          >
                            {call.score}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-xs",
                              call.sentiment === "positive" && "bg-green-500/10 text-green-700",
                              call.sentiment === "neutral" && "bg-gray-500/10 text-gray-700",
                              call.sentiment === "negative" && "bg-red-500/10 text-red-700"
                            )}
                          >
                            {call.sentiment}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
