"use client"

import { KpiCard } from "@/components/kpi-card"
import { StatusBadge } from "@/components/status-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, TrendingUp, AlertCircle, Clock, TrendingDown, } from "lucide-react"
import { recentActivities, callsChartData } from "@/lib/sample-data"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useEffect, useState } from "react"

export default function OverviewPage() {

  const [callsToday, setCallsToday] = useState<number>(0)
  const [callsYesterday, setCallsYesterday] = useState<number>(0)

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

  const totalCallsToday = async () => {
    const resT = await fetch(
      getApiUrl("/calls/callsToday"),{
        method: "GET"
      }
    )
    const dataT =await resT.json()
    const resY = await fetch(
      getApiUrl("/calls/callsToday"),{
        method: "GET"
      }
    )
    const dataY =await resY.json()
    setCallsToday(dataT.total_calls_today)
    setCallsYesterday(dataY.total_calls_yesterday)
  }
  const trendCallToday = () => {
    if(callsToday < callsYesterday){
      return {"trend": (callsYesterday - callsToday), "bool": false}
    }else{
      return {"trend": (callsToday - callsYesterday), "bool": true}
    }
  }

  useEffect(() => {
    totalCallsToday()
    trendCallToday()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground">Overview</h1>
        <p className="text-muted-foreground">Monitor your 911 call processing system</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Calls Today"
          value={361}
          icon={Phone}
          trend={{ value: "43 calls", isPositive: trendCallToday()["bool"] } }
        />
        <KpiCard
          title="Average Operator Score"
          value="87.5"
          icon={TrendingUp}
          trend={{ value: "2.3 points", isPositive: true }}
        />
        <KpiCard
          title="Calls Processed"
          value="8"
          icon={AlertCircle}
          trend={{ value: "3 from yesterday", isPositive: true }}
        />
        <KpiCard title="Active Queue" value="23" icon={Clock} description="Currently processing" />
      </div>

      {/* Calls Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Calls Processed - Last 24 Hours</CardTitle>
          <CardDescription>Real-time monitoring of call processing volume</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={callsChartData}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2f87df" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#2f87df" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--foreground)", padding: 8 }} />
                <Area type="monotone" dataKey="calls" stroke="#2f87df" fillOpacity={1} fill="url(#areaGradient)" />
            </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest 5 call processing activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
              >
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-foreground">{activity.fileName}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{activity.dispatcher}</span>
                    <span>•</span>
                    <span>{activity.callType}</span>
                    <span>•</span>
                    <span>{activity.duration}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                  <StatusBadge status={activity.status} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
