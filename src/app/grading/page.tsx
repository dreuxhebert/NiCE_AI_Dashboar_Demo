"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function TranscriptionPage() {
  const { toast } = useToast()
  const [audioUrl, setAudioUrl] = useState("")
  const [lines, setLines] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!audioUrl) {
      toast({ title: "Error", description: "Please provide an audio file link." })
      return
    }

    setLoading(true)
    setLines([])

    try {
      const resp = await fetch("http://127.0.0.1:8000/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ downloadUri: audioUrl }),
      })

      if (!resp.ok) throw new Error(await resp.text())
      const data = await resp.json()

      // Prefer the clean, sentence-level array from the backend.
      let nextLines: string[] = Array.isArray(data.transcript_lines) ? data.transcript_lines : []

      // Fallback: if only {speaker,text} items are returned, map to plain strings.
      if ((!nextLines || nextLines.length === 0) && Array.isArray(data.transcript)) {
        nextLines = data.transcript
          .map((t: any) => (t && typeof t.text === "string" ? t.text.trim() : ""))
          .filter(Boolean)
      }

      setLines(nextLines || [])
      toast({ title: "Transcript Ready", description: "Your transcript is ready." })
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Something went wrong." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground">
          Call Transcript
        </h1>
        <p className="text-muted-foreground">
          Paste an audio file link and get a clean, readable transcript.
        </p>
      </div>

      {/* Audio Link Input */}
      <Card>
        <CardHeader>
          <CardTitle>Submit Call</CardTitle>
          <CardDescription>Paste an audio file link to transcribe</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3 flex-col sm:flex-row">
          <Input
            placeholder="https://example.com/call.mp3"
            value={audioUrl}
            onChange={(e) => setAudioUrl(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Processing..." : "Submit"}
          </Button>
        </CardContent>
      </Card>

      {/* Clean Transcript */}
      <Card>
        <CardHeader>
          <CardTitle>Transcript</CardTitle>
          <CardDescription>Clean, single-stream text</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-[600px] overflow-y-auto rounded-lg bg-muted/50 p-5 space-y-3">
            {Array.isArray(lines) && lines.length > 0 ? (
              <div className="space-y-3">
                {lines.map((line, i) => (
                  <p
                    key={i}
                    className={cn(
                      "text-sm sm:text-base leading-relaxed text-foreground",
                      "bg-background rounded-lg px-4 py-2 border border-border"
                    )}
                  >
                    {line}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No transcript yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

