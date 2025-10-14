"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { dispatcherLeaderboard } from "@/lib/sample-data"

export default function DirectoryPage() {
  const [q, setQ] = useState("")

  const items = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return dispatcherLeaderboard
    return dispatcherLeaderboard.filter((d) => {
      return (
        String(d.rank).includes(term) ||
        d.name.toLowerCase().includes(term) ||
        String(d.totalCalls).includes(term) ||
        String(d.avgScore).includes(term)
      )
    })
  }, [q])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground">Directory</h1>
        <p className="text-muted-foreground">Lookup employees and see summary stats</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
          <CardDescription>Search by name, rank, total calls or score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 max-w-sm">
            <Input placeholder="Search employees (name, rank, calls, score)" value={q} onChange={(e: any) => setQ(e.target.value)} />
          </div>

          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[80px]">Rank</TableHead>
                  <TableHead>Dispatcher</TableHead>
                  <TableHead className="text-right">Total Calls</TableHead>
                  <TableHead className="text-right">Avg Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((d) => (
                  <TableRow key={d.rank}>
                    <TableCell>#{d.rank}</TableCell>
                    <TableCell>
                      <Link href={`/directory/profile/${d.rank}`} className="font-medium hover:underline">
                        {d.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">{d.totalCalls}</TableCell>
                    <TableCell className="text-right">{d.avgScore}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
