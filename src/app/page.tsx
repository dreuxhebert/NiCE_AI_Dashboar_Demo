"use client"

import { KpiCard } from "@/components/kpi-card"
import { StatusBadge } from "@/components/status-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, TrendingUp, AlertCircle, Clock } from "lucide-react"
import { recentActivities, callsChartData } from "@/lib/sample-data"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function OverviewPage() {
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
          value="342"
          icon={Phone}
          trend={{ value: "12% from yesterday", isPositive: true }}
        />
        <KpiCard
          title="Average Dispatcher Score"
          value="87.5"
          icon={TrendingUp}
          trend={{ value: "2.3 points", isPositive: true }}
        />
        <KpiCard
          title="Calls Failed Processing"
          value="8"
          icon={AlertCircle}
          trend={{ value: "3 from yesterday", isPositive: false }}
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
              <LineChart data={callsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border))" />
                <XAxis dataKey="time" stroke="var(--muted-foreground))" fontSize={12} />
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
