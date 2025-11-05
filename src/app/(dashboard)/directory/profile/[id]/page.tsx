"use client"

import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { dispatcherLeaderboard } from "@/lib/sample-data"

interface Props {
  params: { id: string }
}

export default function DirectoryProfilePage({ params }: Props) {
  const id = Number(params.id)
  const dispatcher = dispatcherLeaderboard.find((d) => d.rank === id)
  if (!dispatcher) return notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground">{dispatcher.name}</h1>
        <p className="text-muted-foreground">Dispatcher profile</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>Quick stats and contact</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Rank</div>
            <div className="text-lg font-medium">#{dispatcher.rank}</div>

            <div className="text-sm text-muted-foreground">Total Calls</div>
            <div className="text-lg font-medium">{dispatcher.totalCalls}</div>

            <div className="text-sm text-muted-foreground">Average Score</div>
            <div className="text-lg font-medium">{dispatcher.avgScore}</div>

            <div className="pt-4">
              <Link href="/directory" className="text-sm text-primary hover:underline">Back to directory</Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
