"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { dispatcherLeaderboard, callsByTypeData, evaluations } from "@/lib/sample-data";
import { TrendingUp, TrendingDown, Minus, Trophy, Medal, Award, RotateCcw, Save, GripVertical, Users, Phone, Star, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";

const ResponsiveGridLayout = WidthProvider(Responsive);

// Environment-based API configuration
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "https://inform-ai-backend.onrender.com";
const USE_PROXY = process.env.NEXT_PUBLIC_USE_PROXY === "true";

const getApiUrl = (path: string) => {
  if (USE_PROXY) {
    return `/api/proxy${path}`;
  }
  return `${API_BASE}${path}`;
};

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

// Default grid layout configuration for Performance Overview
const DEFAULT_LAYOUTS = {
  lg: [
    { i: "auto-qa", x: 0, y: 0, w: 3, h: 4, minH: 4, minW: 2 },
    { i: "manual-qa", x: 3, y: 0, w: 3, h: 4, minH: 4, minW: 2 },
    { i: "avg-call-duration", x: 6, y: 0, w: 3, h: 4, minH: 4, minW: 2 },
    { i: "qa-by-tag", x: 9, y: 0, w: 3, h: 7, minH: 6, minW: 2 },
    { i: "qa-by-taker", x: 0, y: 4, w: 3, h: 7, minH: 6, minW: 2 },
    { i: "call-duration-chart", x: 3, y: 4, w: 6, h: 7, minH: 6, minW: 3 },
    { i: "calls-processed", x: 0, y: 11, w: 6, h: 9, minH: 8, minW: 3 },
    { i: "calls-by-type", x: 6, y: 11, w: 6, h: 9, minH: 8, minW: 3 },
    { i: "qa-by-type", x: 0, y: 20, w: 6, h: 6, minH: 6, minW: 3 },
    { i: "leaderboard", x: 6, y: 20, w: 6, h: 9, minH: 8, minW: 3 },
  ],
  md: [
    { i: "auto-qa", x: 0, y: 0, w: 4, h: 4, minH: 4, minW: 3 },
    { i: "manual-qa", x: 4, y: 0, w: 4, h: 4, minH: 4, minW: 3 },
    { i: "avg-call-duration", x: 8, y: 0, w: 4, h: 4, minH: 4, minW: 3 },
    { i: "qa-by-tag", x: 0, y: 4, w: 6, h: 7, minH: 6, minW: 3 },
    { i: "qa-by-taker", x: 6, y: 4, w: 6, h: 7, minH: 6, minW: 3 },
    { i: "call-duration-chart", x: 0, y: 11, w: 12, h: 7, minH: 6, minW: 6 },
    { i: "calls-processed", x: 0, y: 18, w: 6, h: 9, minH: 8, minW: 3 },
    { i: "calls-by-type", x: 6, y: 18, w: 6, h: 9, minH: 8, minW: 3 },
    { i: "qa-by-type", x: 0, y: 27, w: 12, h: 6, minH: 6, minW: 6 },
    { i: "leaderboard", x: 0, y: 33, w: 12, h: 9, minH: 8, minW: 6 },
  ],
  sm: [
    { i: "auto-qa", x: 0, y: 0, w: 12, h: 4, minH: 4, minW: 6 },
    { i: "manual-qa", x: 0, y: 4, w: 12, h: 4, minH: 4, minW: 6 },
    { i: "avg-call-duration", x: 0, y: 8, w: 12, h: 4, minH: 4, minW: 6 },
    { i: "qa-by-tag", x: 0, y: 12, w: 12, h: 7, minH: 6, minW: 6 },
    { i: "qa-by-taker", x: 0, y: 19, w: 12, h: 7, minH: 6, minW: 6 },
    { i: "call-duration-chart", x: 0, y: 26, w: 12, h: 7, minH: 6, minW: 6 },
    { i: "calls-processed", x: 0, y: 33, w: 12, h: 9, minH: 8, minW: 6 },
    { i: "calls-by-type", x: 0, y: 42, w: 12, h: 9, minH: 8, minW: 6 },
    { i: "qa-by-type", x: 0, y: 51, w: 12, h: 6, minH: 6, minW: 6 },
    { i: "leaderboard", x: 0, y: 57, w: 12, h: 9, minH: 8, minW: 6 },
  ],
};

// Default grid layout configuration for Directory
const DEFAULT_DIRECTORY_LAYOUTS = {
  lg: [
    { i: "dir-total-operators", x: 0, y: 0, w: 3, h: 4, minH: 4, minW: 2 },
    { i: "dir-total-calls", x: 3, y: 0, w: 3, h: 4, minH: 4, minW: 2 },
    { i: "dir-avg-score", x: 6, y: 0, w: 3, h: 4, minH: 4, minW: 2 },
    { i: "dir-top-performers", x: 9, y: 0, w: 3, h: 4, minH: 4, minW: 2 },
    { i: "dir-performance-dist", x: 0, y: 4, w: 6, h: 8, minH: 7, minW: 3 },
    { i: "dir-call-volume", x: 6, y: 4, w: 6, h: 8, minH: 7, minW: 3 },
    { i: "dir-employee-table", x: 0, y: 12, w: 12, h: 15, minH: 12, minW: 6 },
  ],
  md: [
    { i: "dir-total-operators", x: 0, y: 0, w: 3, h: 4, minH: 4, minW: 2 },
    { i: "dir-total-calls", x: 3, y: 0, w: 3, h: 4, minH: 4, minW: 2 },
    { i: "dir-avg-score", x: 6, y: 0, w: 3, h: 4, minH: 4, minW: 2 },
    { i: "dir-top-performers", x: 9, y: 0, w: 3, h: 4, minH: 4, minW: 2 },
    { i: "dir-performance-dist", x: 0, y: 4, w: 6, h: 8, minH: 7, minW: 3 },
    { i: "dir-call-volume", x: 6, y: 4, w: 6, h: 8, minH: 7, minW: 3 },
    { i: "dir-employee-table", x: 0, y: 12, w: 12, h: 15, minH: 12, minW: 6 },
  ],
  sm: [
    { i: "dir-total-operators", x: 0, y: 0, w: 6, h: 4, minH: 4, minW: 6 },
    { i: "dir-total-calls", x: 6, y: 0, w: 6, h: 4, minH: 4, minW: 6 },
    { i: "dir-avg-score", x: 0, y: 4, w: 6, h: 4, minH: 4, minW: 6 },
    { i: "dir-top-performers", x: 6, y: 4, w: 6, h: 4, minH: 4, minW: 6 },
    { i: "dir-performance-dist", x: 0, y: 8, w: 12, h: 8, minH: 7, minW: 6 },
    { i: "dir-call-volume", x: 0, y: 16, w: 12, h: 8, minH: 7, minW: 6 },
    { i: "dir-employee-table", x: 0, y: 24, w: 12, h: 15, minH: 12, minW: 6 },
  ],
};

export default function AnalyticsV2Page() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "overview";
  
  const [mounted, setMounted] = useState(false);
  const [callsData, setCallsData] = useState<any[]>([]);
  const [callsByDateData, setCallsByDateData] = useState<CallData[]>([]);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "1y" | "custom">("7d");
  const [layouts, setLayouts] = useState(DEFAULT_LAYOUTS);
  const [isSaved, setIsSaved] = useState(false);
  const [directoryLayouts, setDirectoryLayouts] = useState(DEFAULT_DIRECTORY_LAYOUTS);
  const [isDirectorySaved, setIsDirectorySaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [trendFilter, setTrendFilter] = useState<"all" | "up" | "down" | "stable">("all");
  const [sortBy, setSortBy] = useState<"rank" | "calls" | "score">("rank");
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  // Update active tab when URL changes
  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Load saved layouts from localStorage on mount
  useEffect(() => {
    const savedLayout = localStorage.getItem("analyticsv2-layout");
    if (savedLayout) {
      try {
        const parsed = JSON.parse(savedLayout);
        setLayouts(parsed);
        setIsSaved(true);
      } catch (e) {
        console.error("Failed to parse saved layout", e);
      }
    }

    const savedDirectoryLayout = localStorage.getItem("analyticsv2-directory-layout");
    if (savedDirectoryLayout) {
      try {
        const parsed = JSON.parse(savedDirectoryLayout);
        setDirectoryLayouts(parsed);
        setIsDirectorySaved(true);
      } catch (e) {
        console.error("Failed to parse saved directory layout", e);
      }
    }
  }, []);

  // Calculate average Auto QA Score
  const averageAutoQAScore = useMemo(() => {
    const autoQAEvaluations = evaluations.filter(
      (evaluation) => evaluation.evaluatorType === "AI QA System"
    );
    if (autoQAEvaluations.length === 0) return 0;
    const total = autoQAEvaluations.reduce((sum, evaluation) => sum + evaluation.score, 0);
    return Math.round((total / autoQAEvaluations.length) * 10) / 10;
  }, []);

  // Calculate average manual QA score
  const averageManualQAScore = useMemo(() => {
    const manualQAEvaluations = evaluations.filter(
      (evaluation) => evaluation.evaluatorType === "Human"
    );
    if (manualQAEvaluations.length === 0) return 0;
    const total = manualQAEvaluations.reduce((sum, evaluation) => sum + evaluation.score, 0);
    return Math.round((total / manualQAEvaluations.length) * 10) / 10;
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

  // Calculate directory stats
  const directoryStats = useMemo(() => {
    const totalOperators = dispatcherLeaderboard.length;
    const totalCalls = dispatcherLeaderboard.reduce((sum, d) => sum + d.totalCalls, 0);
    const avgScore = dispatcherLeaderboard.reduce((sum, d) => sum + d.avgScore, 0) / totalOperators;
    const topPerformers = dispatcherLeaderboard.filter(d => d.avgScore >= 90).length;
    
    return { totalOperators, totalCalls, avgScore: avgScore.toFixed(1), topPerformers };
  }, []);

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
        throw new Error(`GET ${apiUrl} → ${res.status}`);
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
        throw new Error(`GET ${apiUrl} → ${res.status}`);
      }
      const data = await res.json();
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

  const filteredCallsTrendData = useMemo(() => {
    const len = callsByDateData.length;
    if (timeRange === "7d") return callsByDateData.slice(Math.max(len - 7, 0));
    if (timeRange === "30d") return callsByDateData.slice(Math.max(len - 30, 0));
    if (timeRange === "1y") return callsByDateData.slice(Math.max(len - 365, 0));
    return callsByDateData;
  }, [timeRange, callsByDateData]);

  const rangeLabel = useMemo(() => {
    if (timeRange === "7d") return "Last 7 Days";
    if (timeRange === "30d") return "Last 30 Days";
    if (timeRange === "1y") return "Last Year";
    return "";
  }, [timeRange]);

  // Handle layout change for Performance Overview
  const onLayoutChange = (_: Layout[], allLayouts: any) => {
    setLayouts(allLayouts);
    setIsSaved(false);
  };

  // Save layout to localStorage for Performance Overview
  const saveLayout = () => {
    localStorage.setItem("analyticsv2-layout", JSON.stringify(layouts));
    setIsSaved(true);
  };

  // Reset to default layout for Performance Overview
  const resetLayout = () => {
    setLayouts(DEFAULT_LAYOUTS);
    localStorage.removeItem("analyticsv2-layout");
    setIsSaved(false);
  };

  // Handle layout change for Directory
  const onDirectoryLayoutChange = (_: Layout[], allLayouts: any) => {
    setDirectoryLayouts(allLayouts);
    setIsDirectorySaved(false);
  };

  // Save layout to localStorage for Directory
  const saveDirectoryLayout = () => {
    localStorage.setItem("analyticsv2-directory-layout", JSON.stringify(directoryLayouts));
    setIsDirectorySaved(true);
  };

  // Reset to default layout for Directory
  const resetDirectoryLayout = () => {
    setDirectoryLayouts(DEFAULT_DIRECTORY_LAYOUTS);
    localStorage.removeItem("analyticsv2-directory-layout");
    setIsDirectorySaved(false);
  };

  // Prevent hydration errors by only rendering grid on client
  if (!mounted) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground">Analytics V2</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground">Analytics V2</h1>
        <p className="text-muted-foreground">Customizable analytics dashboard with performance metrics and operator directory</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Performance Overview</TabsTrigger>
          <TabsTrigger value="directory">Operator Directory</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetLayout}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Layout
            </Button>
            <Button
              variant={isSaved ? "secondary" : "default"}
              size="sm"
              onClick={saveLayout}
              disabled={isSaved}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaved ? "Layout Saved" : "Save Layout"}
            </Button>
          </div>

          <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768 }}
        cols={{ lg: 12, md: 12, sm: 12 }}
        rowHeight={30}
        isDraggable={true}
        isResizable={true}
        onLayoutChange={onLayoutChange}
        draggableHandle=".drag-handle"
        margin={[16, 16]}
        containerPadding={[0, 0]}
        compactType="vertical"
        preventCollision={false}
      >
        {/* Auto QA Score Card */}
        <div key="auto-qa">
          <Card className="h-full overflow-hidden flex flex-col group">
            <CardHeader className="pb-2 flex-row items-start justify-between space-y-0">
              <CardTitle className="text-sm font-medium line-clamp-2">Average Auto QA Score - This Week</CardTitle>
              <div className="drag-handle cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>
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

        {/* Manual QA Score Card */}
        <div key="manual-qa">
          <Card className="h-full overflow-hidden flex flex-col group">
            <CardHeader className="pb-2 flex-row items-start justify-between space-y-0">
              <CardTitle className="text-sm font-medium line-clamp-2">Average Manual QA Score - This Week</CardTitle>
              <div className="drag-handle cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>
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

        {/* Average Call Duration Card */}
        <div key="avg-call-duration">
          <Card className="h-full overflow-hidden flex flex-col group">
            <CardHeader className="pb-2 flex-row items-start justify-between space-y-0">
              <CardTitle className="text-sm font-medium line-clamp-2">Average Call Duration - Last 24 Hours</CardTitle>
              <div className="drag-handle cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>
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

        {/* QA Score by Tag Card */}
        <div key="qa-by-tag">
          <Card className="h-full overflow-hidden flex flex-col group">
            <CardHeader className="pb-2 flex-row items-start justify-between space-y-0 flex-shrink-0">
              <CardTitle className="text-sm font-medium line-clamp-1">Auto QA score by Tag</CardTitle>
              <div className="drag-handle cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>
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

        {/* QA Score by Call Taker Card */}
        <div key="qa-by-taker">
          <Card className="h-full overflow-hidden flex flex-col group">
            <CardHeader className="pb-2 flex-row items-start justify-between space-y-0 flex-shrink-0">
              <CardTitle className="text-sm font-medium line-clamp-1">Auto QA Score by Call Taker</CardTitle>
              <div className="drag-handle cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>
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

        {/* Call Duration Chart */}
        <div key="call-duration-chart">
          <Card className="h-full overflow-hidden flex flex-col group">
            <CardHeader className="pb-2 flex-row items-start justify-between space-y-0 flex-shrink-0">
              <div>
                <CardTitle className="text-sm font-medium line-clamp-1">Call Duration - Last 90 Days</CardTitle>
                <CardDescription className="text-xs line-clamp-1">Week over Week</CardDescription>
              </div>
              <div className="drag-handle cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>
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

        {/* Calls Processed Timeline */}
        <div key="calls-processed">
          <Card className="h-full overflow-hidden flex flex-col group">
            <CardHeader className="pb-2 flex-row items-start justify-between space-y-0 flex-shrink-0">
              <div>
                <CardTitle className="text-sm font-medium line-clamp-1">Calls Processed - {rangeLabel}</CardTitle>
                <CardDescription className="text-xs line-clamp-1">Daily call volume trend</CardDescription>
              </div>
              <div className="drag-handle cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>
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

        {/* Calls by Type */}
        <div key="calls-by-type">
          <Card className="h-full overflow-hidden flex flex-col group">
            <CardHeader className="pb-2 flex-row items-start justify-between space-y-0 flex-shrink-0">
              <div>
                <CardTitle className="text-sm font-medium line-clamp-1">Calls by Type</CardTitle>
                <CardDescription className="text-xs line-clamp-1">Distribution of call categories</CardDescription>
              </div>
              <div className="drag-handle cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>
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

        {/* QA Score by Incident Type */}
        <div key="qa-by-type">
          <Card className="h-full overflow-hidden flex flex-col group">
            <CardHeader className="pb-2 flex-row items-start justify-between space-y-0 flex-shrink-0">
              <CardTitle className="text-sm font-medium line-clamp-1">Average QA Score by Incident Type</CardTitle>
              <div className="drag-handle cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>
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

        {/* Operator Leaderboard */}
        <div key="leaderboard">
          <Card className="h-full overflow-hidden flex flex-col group">
            <CardHeader className="pb-2 flex-row items-start justify-between space-y-0 flex-shrink-0">
              <div>
                <CardTitle className="text-sm font-medium line-clamp-1">Operator Leaderboard</CardTitle>
                <CardDescription className="text-xs line-clamp-1">Top performers ranked by average score</CardDescription>
              </div>
              <div className="drag-handle cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>
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
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetDirectoryLayout}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Layout
            </Button>
            <Button
              variant={isDirectorySaved ? "secondary" : "default"}
              size="sm"
              onClick={saveDirectoryLayout}
              disabled={isDirectorySaved}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isDirectorySaved ? "Layout Saved" : "Save Layout"}
            </Button>
          </div>

          <ResponsiveGridLayout
            className="layout"
            layouts={directoryLayouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768 }}
            cols={{ lg: 12, md: 12, sm: 12 }}
            rowHeight={30}
            isDraggable={true}
            isResizable={true}
            onLayoutChange={onDirectoryLayoutChange}
            draggableHandle=".drag-handle"
            margin={[16, 16]}
            containerPadding={[0, 0]}
            compactType="vertical"
            preventCollision={false}
          >
            {/* KPI Cards */}
            <div key="dir-total-operators">
              <Card className="h-full overflow-hidden flex flex-col group">
                <CardHeader className="pb-2 flex-row items-start justify-between space-y-0">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Total Operators
                  </CardTitle>
                  <div className="drag-handle cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="pb-3 flex-1">
                  <div className="text-3xl font-bold">{directoryStats.totalOperators}</div>
                  <p className="text-xs text-muted-foreground mt-1">Active call takers</p>
                </CardContent>
              </Card>
            </div>

            <div key="dir-total-calls">
              <Card className="h-full overflow-hidden flex flex-col group">
                <CardHeader className="pb-2 flex-row items-start justify-between space-y-0">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Total Calls Handled
                  </CardTitle>
                  <div className="drag-handle cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="pb-3 flex-1">
                  <div className="text-3xl font-bold">{directoryStats.totalCalls.toLocaleString()}</div>
                  <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +8% from last period
                  </p>
                </CardContent>
              </Card>
            </div>

            <div key="dir-avg-score">
              <Card className="h-full overflow-hidden flex flex-col group">
                <CardHeader className="pb-2 flex-row items-start justify-between space-y-0">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    Average Score
                  </CardTitle>
                  <div className="drag-handle cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="pb-3 flex-1">
                  <div className="text-3xl font-bold">{directoryStats.avgScore}%</div>
                  <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +2.1% improvement
                  </p>
                </CardContent>
              </Card>
            </div>

            <div key="dir-top-performers">
              <Card className="h-full overflow-hidden flex flex-col group">
                <CardHeader className="pb-2 flex-row items-start justify-between space-y-0">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    Top Performers
                  </CardTitle>
                  <div className="drag-handle cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="pb-3 flex-1">
                  <div className="text-3xl font-bold">{directoryStats.topPerformers}</div>
                  <p className="text-xs text-muted-foreground mt-1">Score ≥ 90%</p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Distribution Chart */}
            <div key="dir-performance-dist">
              <Card className="h-full overflow-hidden flex flex-col group">
                <CardHeader className="pb-2 flex-row items-start justify-between space-y-0 flex-shrink-0">
                  <div>
                    <CardTitle className="text-sm font-medium">Performance Distribution</CardTitle>
                    <CardDescription className="text-xs">Operators by score range</CardDescription>
                  </div>
                  <div className="drag-handle cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="pb-4 flex-1 min-h-0">
                  <div className="h-full min-h-[150px]">
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
            </div>

            {/* Call Volume Chart */}
            <div key="dir-call-volume">
              <Card className="h-full overflow-hidden flex flex-col group">
                <CardHeader className="pb-2 flex-row items-start justify-between space-y-0 flex-shrink-0">
                  <div>
                    <CardTitle className="text-sm font-medium">Call Volume by Operator</CardTitle>
                    <CardDescription className="text-xs">Top 8 operators by total calls</CardDescription>
                  </div>
                  <div className="drag-handle cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="pb-4 flex-1 min-h-0">
                  <div className="h-full min-h-[150px]">
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
            <div key="dir-employee-table">
              <Card className="h-full overflow-hidden flex flex-col group">
                <CardHeader className="pb-2 flex-row items-start justify-between space-y-0 flex-shrink-0">
                  <div>
                    <CardTitle className="text-sm font-medium">Employee Directory</CardTitle>
                    <CardDescription className="text-xs">Search and filter operators</CardDescription>
                  </div>
                  <div className="drag-handle cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="pb-4 flex-1 overflow-hidden flex flex-col">
                  {/* Filters */}
                  <div className="mb-3 flex flex-col sm:flex-row gap-2 flex-shrink-0">
                    <Input 
                      placeholder="Search employees..." 
                      value={searchQuery} 
                      onChange={(e: any) => setSearchQuery(e.target.value)}
                      className="sm:max-w-xs text-xs h-8"
                    />
                    
                    <Select value={trendFilter} onValueChange={(v: any) => setTrendFilter(v)}>
                      <SelectTrigger className="sm:w-[120px] text-xs h-8">
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
                      <SelectTrigger className="sm:w-[120px] text-xs h-8">
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
                        size="sm"
                        onClick={() => {
                          setSearchQuery("");
                          setTrendFilter("all");
                          setSortBy("rank");
                        }}
                        className="sm:ml-auto h-8 text-xs"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>

                  {/* Table */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="rounded-md border border-border">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[60px] text-xs">Rank</TableHead>
                            <TableHead className="text-xs">Operator</TableHead>
                            <TableHead className="text-right text-xs">Calls</TableHead>
                            <TableHead className="text-right text-xs">Score</TableHead>
                            <TableHead className="text-center text-xs">Trend</TableHead>
                            <TableHead className="text-right text-xs">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredDirectoryItems.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-muted-foreground py-6 text-xs">
                                No operators found matching your filters
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredDirectoryItems.map((d) => (
                              <TableRow key={d.rank}>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    {getRankIcon(d.rank)}
                                    <span className="font-semibold text-xs">#{d.rank}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium text-xs">{d.name}</TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-end">
                                    <span className="text-xs">{d.totalCalls}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-end">
                                    <Badge 
                                      variant="secondary" 
                                      className={cn("font-medium text-xs", getScoreBadgeColor(d.avgScore))}
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
                                      <Button variant="ghost" size="sm" className="h-7 text-xs px-2">
                                        View
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
                  </div>

                  {filteredDirectoryItems.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground flex-shrink-0">
                      Showing {filteredDirectoryItems.length} of {dispatcherLeaderboard.length} operators
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </ResponsiveGridLayout>
        </TabsContent>
      </Tabs>
    </div>
  );
}
