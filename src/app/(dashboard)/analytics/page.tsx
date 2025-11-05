"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
}
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { dispatcherLeaderboard, callsByTypeData, evaluations } from "@/lib/sample-data";
import { TrendingUp, TrendingDown, Minus, Trophy, Medal, Award, Target, Users, Phone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Responsive, WidthProvider } from "react-grid-layout";

const ResponsiveGridLayout = WidthProvider(Responsive);

type CallData = {
  date: string;
  calls: number;
};

// Sample data for call duration over time
const callDurationData = [
  { date: "Jan 8", avgDuration: 4.2 },
  { date: "Jan 9", avgDuration: 3.8 },
  { date: "Jan 10", avgDuration: 4.5 },
  { date: "Jan 11", avgDuration: 4.1 },
  { date: "Jan 12", avgDuration: 3.9 },
  { date: "Jan 13", avgDuration: 4.3 },
  { date: "Jan 14", avgDuration: 4.6 },
  { date: "Jan 15", avgDuration: 4.0 },
];

// Calculate average QA scores by incident type from evaluations
const getQAScoresByIncidentType = () => {
  const scoresByType: { [key: string]: { total: number; count: number } } = {};
  
  evaluations.forEach((evaluation) => {
    const type = evaluation.callType;
    if (!scoresByType[type]) {
      scoresByType[type] = { total: 0, count: 0 };
    }
    scoresByType[type].total += evaluation.score;
    scoresByType[type].count += 1;
  });
  
  return Object.entries(scoresByType).map(([type, data]) => ({
    type,
    avgScore: Math.round((data.total / data.count) * 10) / 10,
    totalEvaluations: data.count,
  }));
};

export default function AnalyticsPage() {
  const [callsData, setCallsData] = useState<any[]>([]);
  const [callsByDateData, setCallsByDateData] = useState<CallData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [trendFilter, setTrendFilter] = useState<"all" | "up" | "down" | "stable">("all");
  const [sortBy, setSortBy] = useState<"rank" | "calls" | "score">("rank");
  
  // Calculate average Auto QA Score
  const averageAutoQAScore = useMemo(() => {
    const autoQAEvaluations = evaluations.filter(
      (evaluation) => evaluation.evaluatorType === "AI QA System"
    );
    if (autoQAEvaluations.length === 0) return 0;
    const total = autoQAEvaluations.reduce((sum, evaluation) => sum + evaluation.score, 0);
    return Math.round((total / autoQAEvaluations.length) * 10) / 10;
  }, []);

  // Calculate directory stats
  const directoryStats = useMemo(() => {
    const totalOperators = dispatcherLeaderboard.length;
    const totalCalls = dispatcherLeaderboard.reduce((sum, d) => sum + d.totalCalls, 0);
    const avgScore = dispatcherLeaderboard.reduce((sum, d) => sum + d.avgScore, 0) / totalOperators;
    const topPerformers = dispatcherLeaderboard.filter(d => d.avgScore >= 90).length;
    
    return { totalOperators, totalCalls, avgScore: avgScore.toFixed(1), topPerformers };
  }, []);
  
  // Get QA scores by incident type
  const qaScoresByIncidentType = useMemo(() => getQAScoresByIncidentType(), []);
  
  // Sample data for QA scores by tag
  const qaScoresByTag = useMemo(() => [
    { tag: "Information Gathering", avgScore: 92.5 },
    { tag: "Caller Management", avgScore: 88.3 },
    { tag: "Protocol Compliance", avgScore: 85.7 },
    { tag: "Communication Clarity", avgScore: 90.2 },
    { tag: "Response Time", avgScore: 79.8 },
  ], []);

  // Performance distribution data for directory
  const performanceDistribution = useMemo(() => {
    return [
      { range: "90-100", count: dispatcherLeaderboard.filter(d => d.avgScore >= 90).length, fill: "#10b981" },
      { range: "85-89", count: dispatcherLeaderboard.filter(d => d.avgScore >= 85 && d.avgScore < 90).length, fill: "#3b82f6" },
      { range: "80-84", count: dispatcherLeaderboard.filter(d => d.avgScore >= 80 && d.avgScore < 85).length, fill: "#8b5cf6" },
      { range: "75-79", count: dispatcherLeaderboard.filter(d => d.avgScore >= 75 && d.avgScore < 80).length, fill: "#f59e0b" },
      { range: "<75", count: dispatcherLeaderboard.filter(d => d.avgScore < 75).length, fill: "#ef4444" },
    ];
  }, []);

  // Calls by operator data
  const callsByOperator = useMemo(() => {
    return dispatcherLeaderboard.slice(0, 8).map(d => ({
      name: d.name.split(' ')[0],
      calls: d.totalCalls,
      score: d.avgScore
    }));
  }, []);

  // Filter and sort directory items
  const filteredDirectoryItems = useMemo(() => {
    let filtered = dispatcherLeaderboard;
    
    // Search filter
    const term = searchQuery.trim().toLowerCase();
    if (term) {
      filtered = filtered.filter((d) => {
        return (
          String(d.rank).includes(term) ||
          d.name.toLowerCase().includes(term) ||
          String(d.totalCalls).includes(term) ||
          String(d.avgScore).includes(term)
        );
      });
    }
    
    // Trend filter
    if (trendFilter !== "all") {
      filtered = filtered.filter(d => d.trend === trendFilter);
    }
    
    // Sort
    const sorted = [...filtered];
    if (sortBy === "calls") {
      sorted.sort((a, b) => b.totalCalls - a.totalCalls);
    } else if (sortBy === "score") {
      sorted.sort((a, b) => b.avgScore - a.avgScore);
    }
    
    return sorted;
  }, [searchQuery, trendFilter, sortBy]);

  const fetchCallsByTypeData = async () => {
    try {
      const apiUrl = getApiUrl('/calls/byType');
      const res = await fetch(apiUrl, { cache: "no-store" });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`GET /api/proxy/calls/byType → ${res.status} ${res.statusText}\n${t}`);
      }
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const t = await res.text();
        throw new Error(`Expected JSON but got "${ct}". Body:\n${t}`);
      }
      const data = await res.json();
      setCallsData(data);
    } catch (error) {
      console.error("Error fetching calls by type:", error);
    }
  };

  const fetchCallsByDateData = async () => {
    try {
      const apiUrl = getApiUrl('/calls/byDate');
      const res = await fetch(apiUrl, { cache: "no-store" });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`GET /api/proxy/calls/byDate → ${res.status} ${res.statusText}\n${t}`);
      }
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const t = await res.text();
        throw new Error(`Expected JSON but got "${ct}". Body:\n${t}`);
      }

      const data = await res.json();
      // Map to chart format expected by the line chart
      const formatted: CallData[] = (Array.isArray(data) ? data : []).map(
        (item: { type: string; count: number }) => ({
          date: item.type,
          calls: item.count,
        })
      );
      setCallsByDateData(formatted);
    } catch (error) {
      console.error("Error fetching calls by date:", error);
    }
  };

  useEffect(() => {
    fetchCallsByTypeData();
    fetchCallsByDateData();
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-amber-400" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-orange-600" />;
    return null;
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-400" />;
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90)
      return "bg-green-500/10 text-green-700 dark:bg-green-600/30 dark:text-green-200 hover:dark:bg-green-600/40";
    if (score >= 85)
      return "bg-amber-500/10 text-amber-700 dark:bg-amber-600/30 dark:text-amber-200 hover:dark:bg-amber-600/40";
    return "bg-red-500/10 text-red-700 dark:bg-red-600/30 dark:text-red-200 hover:dark:bg-red-600/40";
  };

  const chartColors = useMemo(() => {
    return ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
  }, []);

  const tooltipStyle = useMemo(
    () => ({
      backgroundColor: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      color: "var(--foreground)",
      padding: 8,
    }),
    []
  );

  const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const item = payload[0];
    const key = item.payload?.type ?? item.name ?? label;
    const payloadColor = item.color || item.fill || item.stroke;
    const dataIndex = callsData.findIndex((d) => d.type === key);
    const paletteColor = chartColors[dataIndex >= 0 ? dataIndex % chartColors.length : 0] || "var(--primary)";
    const color = payloadColor || paletteColor;

    return (
      <div style={tooltipStyle}>
        <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{key}</div>
        <div style={{ fontWeight: 700, color }}>{item.value}</div>
      </div>
    );
  };

  const renderPieLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, index } = props;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill="var(--muted-foreground)"
        fontSize={12}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {callsByTypeData[index]?.type}
      </text>
    );
  };

  // Time range controls for calls trend chart
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "1y" | "custom">("7d");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");

  const filteredCallsTrendData = useMemo(() => {
    const len = callsByDateData.length;
    if (timeRange === "7d") return callsByDateData.slice(Math.max(len - 7, 0));
    if (timeRange === "30d") return callsByDateData.slice(Math.max(len - 30, 0));
    if (timeRange === "1y") return callsByDateData.slice(Math.max(len - 365, 0));
    if (timeRange === "custom") {
      if (!customStart || !customEnd) return callsByDateData;
      const start = new Date(customStart);
      const end = new Date(customEnd);
      end.setHours(23, 59, 59, 999);
      return callsByDateData.filter((d) => {
        const parsed = new Date(d.date);
        if (isNaN(parsed.getTime())) return false;
        return parsed >= start && parsed <= end;
      });
    }
    return callsByDateData;
  }, [timeRange, customStart, customEnd, callsByDateData]);

  const rangeLabel = useMemo(() => {
    if (timeRange === "7d") return "Last 7 Days";
    if (timeRange === "30d") return "Last 30 Days";
    if (timeRange === "1y") return "Last Year";
    if (timeRange === "custom") {
      if (customStart && customEnd) return `${customStart} to ${customEnd}`;
      if (customStart) return `From ${customStart}`;
      if (customEnd) return `Until ${customEnd}`;
      return "Custom Range";
    }
    return "";
  }, [timeRange, customStart, customEnd]);

  // Calculate average manual QA score
  const averageManualQAScore = useMemo(() => {
    const manualQAEvaluations = evaluations.filter(
      (evaluation) => evaluation.evaluatorType === "Human"
    );
    if (manualQAEvaluations.length === 0) return 0;
    const total = manualQAEvaluations.reduce((sum, evaluation) => sum + evaluation.score, 0);
    return Math.round((total / manualQAEvaluations.length) * 10) / 10;
  }, []);

  // Grid layout configuration
  const layouts = {
    lg: [
      { i: "auto-qa", x: 0, y: 0, w: 6, h: 4, minH: 4, minW: 3 },
      { i: "manual-qa", x: 6, y: 0, w: 6, h: 4, minH: 4, minW: 3 },
      { i: "qa-by-tag", x: 0, y: 4, w: 6, h: 7, minH: 6, minW: 3 },
      { i: "qa-by-taker", x: 6, y: 4, w: 6, h: 7, minH: 6, minW: 3 },
      { i: "qa-by-type", x: 0, y: 11, w: 12, h: 6, minH: 6, minW: 6 },
      { i: "call-duration-chart", x: 0, y: 17, w: 6, h: 7, minH: 6, minW: 3 },
      { i: "avg-call-duration", x: 6, y: 17, w: 6, h: 4, minH: 4, minW: 3 },
      { i: "calls-processed", x: 0, y: 24, w: 6, h: 9, minH: 8, minW: 3 },
      { i: "calls-by-type", x: 6, y: 24, w: 6, h: 9, minH: 8, minW: 3 },
      { i: "leaderboard", x: 0, y: 33, w: 12, h: 9, minH: 8, minW: 6 },
    ],
    md: [
      { i: "auto-qa", x: 0, y: 0, w: 6, h: 4, minH: 4, minW: 3 },
      { i: "manual-qa", x: 6, y: 0, w: 6, h: 4, minH: 4, minW: 3 },
      { i: "qa-by-tag", x: 0, y: 4, w: 6, h: 7, minH: 6, minW: 3 },
      { i: "qa-by-taker", x: 6, y: 4, w: 6, h: 7, minH: 6, minW: 3 },
      { i: "qa-by-type", x: 0, y: 11, w: 12, h: 6, minH: 6, minW: 6 },
      { i: "call-duration-chart", x: 0, y: 17, w: 6, h: 7, minH: 6, minW: 3 },
      { i: "avg-call-duration", x: 6, y: 17, w: 6, h: 4, minH: 4, minW: 3 },
      { i: "calls-processed", x: 0, y: 24, w: 6, h: 9, minH: 8, minW: 3 },
      { i: "calls-by-type", x: 6, y: 24, w: 6, h: 9, minH: 8, minW: 3 },
      { i: "leaderboard", x: 0, y: 33, w: 12, h: 9, minH: 8, minW: 6 },
    ],
    sm: [
      { i: "auto-qa", x: 0, y: 0, w: 12, h: 4, minH: 4, minW: 6 },
      { i: "manual-qa", x: 0, y: 4, w: 12, h: 4, minH: 4, minW: 6 },
      { i: "qa-by-tag", x: 0, y: 8, w: 12, h: 7, minH: 6, minW: 6 },
      { i: "qa-by-taker", x: 0, y: 15, w: 12, h: 7, minH: 6, minW: 6 },
      { i: "qa-by-type", x: 0, y: 22, w: 12, h: 6, minH: 6, minW: 6 },
      { i: "call-duration-chart", x: 0, y: 28, w: 12, h: 7, minH: 6, minW: 6 },
      { i: "avg-call-duration", x: 0, y: 35, w: 12, h: 4, minH: 4, minW: 6 },
      { i: "calls-processed", x: 0, y: 39, w: 12, h: 9, minH: 8, minW: 6 },
      { i: "calls-by-type", x: 0, y: 48, w: 12, h: 9, minH: 8, minW: 6 },
      { i: "leaderboard", x: 0, y: 57, w: 12, h: 9, minH: 8, minW: 6 },
    ],
    xs: [
      { i: "auto-qa", x: 0, y: 0, w: 12, h: 4, minH: 4, minW: 4 },
      { i: "manual-qa", x: 0, y: 4, w: 12, h: 4, minH: 4, minW: 4 },
      { i: "qa-by-tag", x: 0, y: 8, w: 12, h: 7, minH: 6, minW: 4 },
      { i: "qa-by-taker", x: 0, y: 15, w: 12, h: 7, minH: 6, minW: 4 },
      { i: "qa-by-type", x: 0, y: 22, w: 12, h: 6, minH: 6, minW: 4 },
      { i: "call-duration-chart", x: 0, y: 28, w: 12, h: 7, minH: 6, minW: 4 },
      { i: "avg-call-duration", x: 0, y: 35, w: 12, h: 4, minH: 4, minW: 4 },
      { i: "calls-processed", x: 0, y: 39, w: 12, h: 9, minH: 8, minW: 4 },
      { i: "calls-by-type", x: 0, y: 48, w: 12, h: 9, minH: 8, minW: 4 },
      { i: "leaderboard", x: 0, y: 57, w: 12, h: 9, minH: 8, minW: 4 },
    ],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Performance metrics, insights, and operator directory</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Performance Overview</TabsTrigger>
          <TabsTrigger value="directory">Operator Directory</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
        cols={{ lg: 12, md: 12, sm: 12, xs: 12 }}
        rowHeight={30}
        isDraggable={false}
        isResizable={false}
        margin={[24, 24]}
        containerPadding={[0, 0]}
        compactType="vertical"
        useCSSTransforms={true}
      >
        {/* Top Row: Auto QA Score KPIs */}
        <div key="auto-qa">
          <Card className="h-full overflow-hidden flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium line-clamp-2">Average Auto QA Score - This Week</CardTitle>
            </CardHeader>
            <CardContent className="pb-3 flex-1">
              <div className="text-3xl font-bold text-foreground">{averageAutoQAScore}%</div>
              <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +1%, compared to previous 7 days
              </p>
            </CardContent>
          </Card>
        </div>

        <div key="manual-qa">
          <Card className="h-full overflow-hidden flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium line-clamp-2">Average Manual QA Score - This Week</CardTitle>
            </CardHeader>
            <CardContent className="pb-3 flex-1">
              <div className="text-3xl font-bold text-foreground">{averageManualQAScore}%</div>
              <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +12%, compared to previous 7 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Second Row: Auto QA Score Breakdowns */}
        <div key="qa-by-tag">
          <Card className="h-full overflow-hidden flex flex-col">
            <CardHeader className="pb-2 flex-shrink-0">
              <CardTitle className="text-sm font-medium line-clamp-1">Auto QA score in the past 7 days by Tag</CardTitle>
            </CardHeader>
            <CardContent className="pb-3 flex-1 overflow-y-auto">
              <div className="space-y-2">
                {qaScoresByTag.map((item) => (
                  <div key={item.tag} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{item.tag}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.avgScore}%</span>
                      {item.avgScore >= 90 ? (
                        <span className="text-xs text-green-400">+2.1%</span>
                      ) : item.avgScore >= 80 ? (
                        <span className="text-xs text-green-400">+1.5%</span>
                      ) : (
                        <span className="text-xs text-red-400">-3.2%</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div key="qa-by-taker">
          <Card className="h-full overflow-hidden flex flex-col">
            <CardHeader className="pb-2 flex-shrink-0">
              <CardTitle className="text-sm font-medium line-clamp-1">Auto QA Score by Call Taker</CardTitle>
            </CardHeader>
            <CardContent className="pb-3 flex-1 overflow-y-auto">
              <div className="space-y-2">
                {dispatcherLeaderboard.slice(0, 5).map((dispatcher) => (
                  <div key={dispatcher.rank} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{dispatcher.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{dispatcher.avgScore}%</span>
                      {dispatcher.trend === "up" ? (
                        <span className="text-xs text-green-400">↑</span>
                      ) : dispatcher.trend === "down" ? (
                        <span className="text-xs text-red-400">↓</span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Third Row: Average QA Score by Incident Type Table */}
        <div key="qa-by-type">
          <Card className="h-full overflow-hidden flex flex-col">
            <CardHeader className="pb-2 flex-shrink-0">
              <CardTitle className="text-sm font-medium line-clamp-1">Average QA Score by Incident Type - This Week</CardTitle>
            </CardHeader>
            <CardContent className="pb-4 flex-1 overflow-y-auto">
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Incident Type</TableHead>
                      <TableHead className="text-right">Auto QA Score</TableHead>
                      <TableHead className="text-right">Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {qaScoresByIncidentType.map((item, idx) => (
                      <TableRow key={item.type}>
                        <TableCell className="font-medium">{item.type}</TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm font-medium">{item.avgScore}%</span>
                        </TableCell>
                        <TableCell className="text-right">
                          {idx % 3 === 0 ? (
                            <span className="text-xs text-red-400">+0.85%</span>
                          ) : idx % 3 === 1 ? (
                            <span className="text-xs text-green-400">-0%</span>
                          ) : (
                            <span className="text-xs text-amber-400">+1.6%</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fourth Row: Call Duration Metrics */}
        <div key="call-duration-chart">
          <Card className="h-full overflow-hidden flex flex-col">
            <CardHeader className="pb-2 flex-shrink-0">
              <CardTitle className="text-sm font-medium line-clamp-1">Call Duration - Last 90 Days</CardTitle>
              <CardDescription className="text-xs line-clamp-1">Week over Week</CardDescription>
            </CardHeader>
            <CardContent className="pb-4 flex-1 min-h-0">
              <div className="h-full min-h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={callDurationData}>
                    <defs>
                      <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={10} hide />
                    <YAxis stroke="var(--muted-foreground)" fontSize={10} hide />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="avgDuration"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorDuration)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div key="avg-call-duration">
          <Card className="h-full overflow-hidden flex flex-col">
            <CardHeader className="pb-2 flex-shrink-0">
              <CardTitle className="text-sm font-medium line-clamp-2">Average Call Duration - Last 24 Hours</CardTitle>
            </CardHeader>
            <CardContent className="pb-4 flex-1">
              <div className="text-3xl font-bold text-foreground">2.80 min(s)</div>
              <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +31%, compared to previous 24 hours
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Sections: Calls Processed Timeline and Calls by Type */}
        <div key="calls-processed">
          <Card className="h-full overflow-hidden flex flex-col">
            <CardHeader className="pb-2 flex-shrink-0">
              <CardTitle className="text-sm font-medium line-clamp-1">Calls Processed - {rangeLabel}</CardTitle>
              <CardDescription className="text-xs line-clamp-1">Daily call volume trend</CardDescription>
            </CardHeader>
            <CardContent className="pb-4 flex-1 min-h-0 flex flex-col">
              <div className="flex items-center justify-end gap-2 mb-2 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Button size="sm" variant={timeRange === "7d" ? "secondary" : "ghost"} onClick={() => setTimeRange("7d")}>
                    7d
                  </Button>
                  <Button size="sm" variant={timeRange === "30d" ? "secondary" : "ghost"} onClick={() => setTimeRange("30d")}>
                    30d
                  </Button>
                  <Button size="sm" variant={timeRange === "1y" ? "secondary" : "ghost"} onClick={() => setTimeRange("1y")}>
                    1y
                  </Button>
                </div>
              </div>
              <div className="flex-1 min-h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredCallsTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={10} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={10} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="calls"
                      stroke="#2f87df"
                      strokeWidth={2}
                      dot={{ fill: "var(--primary)", r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div key="calls-by-type">
          <Card className="h-full overflow-hidden flex flex-col">
            <CardHeader className="pb-2 flex-shrink-0">
              <CardTitle className="text-sm font-medium line-clamp-1">Calls by Type</CardTitle>
              <CardDescription className="text-xs line-clamp-1">Distribution of call categories</CardDescription>
            </CardHeader>
            <CardContent className="pb-4 flex-1 min-h-0">
              <div className="h-full min-h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={callsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="type" stroke="var(--muted-foreground)" fontSize={10} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={10} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
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

        {/* Operator Leaderboard */}
        <div key="leaderboard">
          <Card className="h-full overflow-hidden flex flex-col">
            <CardHeader className="pb-2 flex-shrink-0">
              <CardTitle className="text-sm font-medium line-clamp-1">Operator Leaderboard</CardTitle>
              <CardDescription className="text-xs line-clamp-1">Top performers ranked by average score</CardDescription>
            </CardHeader>
            <CardContent className="pb-4 flex-1 overflow-y-auto">
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[80px]">Rank</TableHead>
                      <TableHead>Operator</TableHead>
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
                            <span className="font-semibold text-sm">#{dispatcher.rank}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-sm">{dispatcher.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end">
                            <span className="text-sm">{dispatcher.totalCalls}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end">
                            <Badge variant="secondary" className={cn("font-medium text-xs", getScoreBadgeColor(dispatcher.avgScore))}>
                              {dispatcher.avgScore}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            {getTrendIcon(dispatcher.trend)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </ResponsiveGridLayout>
        </TabsContent>

        <TabsContent value="directory" className="space-y-6">
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
                <div className="text-3xl font-bold">{directoryStats.totalOperators}</div>
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
                <div className="text-3xl font-bold">{directoryStats.totalCalls.toLocaleString()}</div>
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
                <div className="text-3xl font-bold">{directoryStats.avgScore}%</div>
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
                <div className="text-3xl font-bold">{directoryStats.topPerformers}</div>
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
                  value={searchQuery} 
                  onChange={(e: any) => setSearchQuery(e.target.value)}
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

                {(searchQuery || trendFilter !== "all" || sortBy !== "rank") && (
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setSearchQuery("");
                      setTrendFilter("all");
                      setSortBy("rank");
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
                    {filteredDirectoryItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No operators found matching your filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDirectoryItems.map((d) => (
                        <TableRow key={d.rank}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getRankIcon(d.rank)}
                              <span className="font-semibold">#{d.rank}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{d.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end">
                              {d.totalCalls}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end">
                              <Badge 
                                variant="secondary" 
                                className={cn("font-medium", getScoreBadgeColor(d.avgScore))}
                              >
                                {d.avgScore}%
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center">
                              {getTrendIcon(d.trend)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end">
                              <Link href={`/directory/profile/${d.rank}`}>
                                <Button variant="ghost" size="sm">
                                  View Profile
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {filteredDirectoryItems.length > 0 && (
                <div className="mt-4 text-sm text-muted-foreground">
                  Showing {filteredDirectoryItems.length} of {dispatcherLeaderboard.length} operators
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}