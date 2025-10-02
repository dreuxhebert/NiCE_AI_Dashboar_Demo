"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Save, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [autoProcessing, setAutoProcessing] = useState(true)
  const [qualityThreshold, setQualityThreshold] = useState("high")
  const [defaultModel, setDefaultModel] = useState("gpt-4")
  const [retentionDays, setRetentionDays] = useState("90")
  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your system preferences and configuration</p>
      </div>

      {/* Demo Notice */}
      <Alert className="border-primary/50 bg-primary/5">
        <AlertCircle className="h-4 w-4 text-primary" />
        <AlertTitle>Demo Dashboard</AlertTitle>
        <AlertDescription>
          This is a demonstration dashboard. Settings changes are for preview purposes only and will not affect actual
          system behavior.
        </AlertDescription>
      </Alert>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Configure basic system preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email alerts for processing updates</p>
              </div>
              <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-processing">Auto-Processing</Label>
                <p className="text-sm text-muted-foreground">Automatically process uploaded calls</p>
              </div>
              <Switch id="auto-processing" checked={autoProcessing} onCheckedChange={setAutoProcessing} />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="quality-threshold">Audio Quality Threshold</Label>
              <Select value={qualityThreshold} onValueChange={setQualityThreshold}>
                <SelectTrigger id="quality-threshold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Process all audio</SelectItem>
                  <SelectItem value="medium">Medium - Standard quality</SelectItem>
                  <SelectItem value="high">High - Best quality only</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">Minimum audio quality required for processing</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Model Settings */}
      <Card>
        <CardHeader>
          <CardTitle>AI Model Configuration</CardTitle>
          <CardDescription>Configure transcription and analysis models</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="default-model">Default Transcription Model</Label>
            <Select value={defaultModel} onValueChange={setDefaultModel}>
              <SelectTrigger id="default-model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4">GPT-4 - Highest accuracy</SelectItem>
                <SelectItem value="gpt-3.5">GPT-3.5 - Faster processing</SelectItem>
                <SelectItem value="whisper">Whisper - Specialized audio</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">Model used for transcribing audio files</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="language-detection">Language Detection</Label>
            <Select defaultValue="auto">
              <SelectTrigger id="language-detection">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Automatic Detection</SelectItem>
                <SelectItem value="english">English Only</SelectItem>
                <SelectItem value="spanish">Spanish Only</SelectItem>
                <SelectItem value="multilingual">Multilingual</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">How the system detects call languages</p>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Configure data retention and storage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="retention">Data Retention Period</Label>
            <Select value={retentionDays} onValueChange={setRetentionDays}>
              <SelectTrigger id="retention">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="60">60 Days</SelectItem>
                <SelectItem value="90">90 Days</SelectItem>
                <SelectItem value="180">180 Days</SelectItem>
                <SelectItem value="365">1 Year</SelectItem>
                <SelectItem value="unlimited">Unlimited</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">How long to keep processed call data</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="storage-location">Storage Location</Label>
            <Input id="storage-location" value="us-east-1" disabled />
            <p className="text-sm text-muted-foreground">Primary data storage region</p>
          </div>
        </CardContent>
      </Card>

      {/* User Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>User Preferences</CardTitle>
          <CardDescription>Personalize your dashboard experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select defaultValue="utc">
              <SelectTrigger id="timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="utc">UTC (Coordinated Universal Time)</SelectItem>
                <SelectItem value="est">EST (Eastern Standard Time)</SelectItem>
                <SelectItem value="pst">PST (Pacific Standard Time)</SelectItem>
                <SelectItem value="cst">CST (Central Standard Time)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="date-format">Date Format</Label>
            <Select defaultValue="mdy">
              <SelectTrigger id="date-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  )
}
