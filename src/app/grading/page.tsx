"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Save, RotateCcw } from "lucide-react"

interface GradingCriterion {
  id: string
  label: string
  checked: boolean
  notes: string
  weight: number
}

const initialCriteria: GradingCriterion[] = [
  { id: "address", label: "Captured Caller Address", checked: false, notes: "", weight: 20 },
  { id: "name", label: "Captured Caller Name", checked: false, notes: "", weight: 15 },
  { id: "callType", label: "Confirmed Call Type", checked: false, notes: "", weight: 20 },
  { id: "tone", label: "Maintained Professional Tone", checked: false, notes: "", weight: 15 },
  { id: "clarity", label: "Clear Communication", checked: false, notes: "", weight: 15 },
  { id: "response", label: "Appropriate Response Time", checked: false, notes: "", weight: 15 },
]

const sampleTranscript = `Dispatcher: 911, what's your emergency?
Caller: I'm having chest pain, it's really bad.
Dispatcher: Okay, I'm sending help right away. Can you tell me your exact address?
Caller: 123 Main Street, apartment 4B.
Dispatcher: Thank you. Can I have your name please?
Caller: John Smith.
Dispatcher: Are you having trouble breathing, Mr. Smith?
Caller: A little bit, yes.
Dispatcher: Help is on the way. Stay on the line with me. Try to stay calm and breathe slowly.
Caller: Okay, thank you.
Dispatcher: The ambulance should be there in about 3 minutes. Are you alone?
Caller: Yes, I'm alone.
Dispatcher: That's okay. I'm staying on the line with you until they arrive.`

export default function GradingPage() {
  const [selectedCall, setSelectedCall] = useState("call_2024_001")
  const [criteria, setCriteria] = useState<GradingCriterion[]>(initialCriteria)
  const [overallScore, setOverallScore] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    const checkedCriteria = criteria.filter((c) => c.checked)
    const totalWeight = checkedCriteria.reduce((sum, c) => sum + c.weight, 0)
    setOverallScore(totalWeight)
  }, [criteria])

  const handleCheckChange = (id: string, checked: boolean) => {
    setCriteria((prev) => prev.map((criterion) => (criterion.id === id ? { ...criterion, checked } : criterion)))
  }

  const handleNotesChange = (id: string, notes: string) => {
    setCriteria((prev) => prev.map((criterion) => (criterion.id === id ? { ...criterion, notes } : criterion)))
  }

  const handleReset = () => {
    setCriteria(initialCriteria)
    toast({
      title: "Grading reset",
      description: "All criteria have been reset to default",
    })
  }

  const handleSave = () => {
    toast({
      title: "Grading saved",
      description: `Score of ${overallScore}/100 has been saved for ${selectedCall}`,
    })
  }

  const getScoreColor = () => {
    if (overallScore >= 80) return "text-green-400"
    if (overallScore >= 60) return "text-amber-400"
    return "text-red-400"
  }

  const getScoreLabel = () => {
    if (overallScore >= 80) return "Good"
    if (overallScore >= 60) return "Fair"
    return "Poor"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground">Dispatcher Grading</h1>
          <p className="text-muted-foreground">Evaluate dispatcher performance on call handling</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedCall} onValueChange={setSelectedCall}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="call_2024_001">call_2024_001.mp3</SelectItem>
              <SelectItem value="call_2024_002">call_2024_002.mp3</SelectItem>
              <SelectItem value="call_2024_003">call_2024_003.mp3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Score Card */}
      <Card className="border-primary/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overall Score</p>
              <div className="flex items-baseline gap-2">
                <span className={cn("text-5xl font-bold", getScoreColor())}>{overallScore}</span>
                <span className="text-2xl text-muted-foreground">/100</span>
              </div>
              <p className={cn("mt-1 text-sm font-medium", getScoreColor())}>{getScoreLabel()}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Grade
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Transcript */}
        <Card className="lg:sticky lg:top-20 lg:self-start">
          <CardHeader>
            <CardTitle>Call Transcript</CardTitle>
            <CardDescription>Review the conversation before grading</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[600px] overflow-y-auto rounded-lg bg-muted/50 p-4">
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground">
                {sampleTranscript}
              </pre>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Dispatcher</p>
                <p className="font-medium text-foreground">Sarah Johnson</p>
              </div>
              <div>
                <p className="text-muted-foreground">Duration</p>
                <p className="font-medium text-foreground">4:32</p>
              </div>
              <div>
                <p className="text-muted-foreground">Call Type</p>
                <p className="font-medium text-foreground">Medical</p>
              </div>
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium text-foreground">Jan 15, 2024</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grading Criteria */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grading Criteria</CardTitle>
              <CardDescription>Check each criterion that was met during the call</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {criteria.map((criterion) => (
                <div key={criterion.id} className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={criterion.id}
                      checked={criterion.checked}
                      onCheckedChange={(checked) => handleCheckChange(criterion.id, checked as boolean)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={criterion.id}
                        className="flex items-center justify-between text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        <span>{criterion.label}</span>
                        <span className="text-sm text-muted-foreground">{criterion.weight} pts</span>
                      </Label>
                    </div>
                  </div>
                  <Textarea
                    placeholder="Add notes or observations..."
                    value={criterion.notes}
                    onChange={(e) => handleNotesChange(criterion.id, e.target.value)}
                    rows={2}
                    className="ml-9"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Comments</CardTitle>
              <CardDescription>Overall feedback and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea placeholder="Enter any additional feedback or recommendations for the dispatcher..." rows={6} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
