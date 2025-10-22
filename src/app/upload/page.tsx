"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileAudio, X } from "lucide-react"
import { cn } from "@/lib/utils"
import axios from "axios"
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:5001";

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dispatcher, setDispatcher] = useState("")
  const [callType, setCallType] = useState("")
  const [language, setLanguage] = useState("")
  const [notes, setNotes] = useState("")
  const { toast } = useToast()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith("audio/") || file.name.endsWith(".mp3") || file.name.endsWith(".wav")) {
        setSelectedFile(file)
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an audio file (MP3, WAV, etc.)",
          variant: "destructive",
        })
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setSelectedFile(files[0])
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select an audio file to upload",
        variant: "destructive",
      })
      return
    }

    if (!dispatcher || !callType || !language) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const formData = new FormData()
    formData.append("audio_file", selectedFile)
    formData.append("dispatcher", dispatcher)
    formData.append("call_type", callType)
    formData.append("language", language)
    console.log(selectedFile)
    const result = await axios.post(
      `${API_BASE}/elevate.api/uploadAudio`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    
    const { interaction_id, transcription, summary } = result.data;

    // Helper to turn empty strings into undefined (so they don’t get inserted as "")
    const clean = (v: any) => {
      if (v === null || v === undefined) return undefined;
      const s = String(v).trim();
      return s.length ? s : undefined;
    };

    // Pull original form fields (sent earlier with the upload)
    const dispatcher_c = clean(formData.get("dispatcher"));
    const callType_c = clean(formData.get("call_type"));
    const language_c = clean(formData.get("language"));

    const call = {
      dispatcher_id: dispatcher_c,         
      call_id: interaction_id,
      duration_seconds: 320,
      direction: "Inbound",
      language: language_c,
      model: "general", 
      callType: callType_c,
      status: "processed",
      sentiment: "positive",     
      transcript: transcription,         
      summary: summary,         
    };

    // Now POST this JSON to your backend create endpoint:
    const output = await axios.post(
      "https://inform-ai-backend.onrender.com/calls/createCall",       
      call,
      { headers: { "Content-Type": "application/json" } }
    );
    console.log("Create call response:", output.data);
    toast({
        title: "Audio uploaded successfully",
        description: "Your audio file has been uploaded.",
        variant: "default",
    })
    // Reset form
    setSelectedFile(null)
    setDispatcher("")
    setCallType("")
    setLanguage("")
    setNotes("")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground">Upload</h1>
        <p className="text-muted-foreground">Upload new 911 call recordings for processing</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Audio File</CardTitle>
            <CardDescription>Drag and drop or click to select an audio file</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "relative flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
                isDragging
                  ? "border-primary bg-primary/10"
                  : "border-border bg-muted/50 hover:border-primary/50 hover:bg-muted",
              )}
            >
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="absolute inset-0 cursor-pointer opacity-0"
              />

              {selectedFile ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-full bg-primary/20 p-4">
                    <FileAudio className="h-12 w-12 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveFile()
                    }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="rounded-full bg-muted p-4">
                    <Upload className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Drop your audio file here</p>
                    <p className="text-sm text-muted-foreground">or click to browse</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Supports MP3, WAV, and other audio formats</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Call Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Call Details</CardTitle>
            <CardDescription>Provide information about the call</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dispatcher">Operator Name *</Label>
                <Input
                  id="dispatcher"
                  placeholder="Enter operator name"
                  value={dispatcher}
                  onChange={(e) => setDispatcher(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="callType">Call Type *</Label>
                <Select value={callType} onValueChange={setCallType} required>
                  <SelectTrigger id="callType">
                    <SelectValue placeholder="Select call type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Medical">Medical</SelectItem>
                    <SelectItem value="Fire">Fire</SelectItem>
                    <SelectItem value="Shooting">Shooting</SelectItem>
                    <SelectItem value="Traffic">Traffic</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language *</Label>
                <Select value={language} onValueChange={setLanguage} required>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="Mandarin">Mandarin</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter any additional information about the call..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                <Upload className="mr-2 h-4 w-4" />
                Submit for Processing
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">Processing Information</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="list-inside list-disc space-y-1">
            <li>Audio files are processed using AI transcription models</li>
            <li>Processing typically takes 30-60 seconds per minute of audio</li>
            <li>You'll be notified when processing is complete</li>
            <li>Transcripts will be available in the Interactions page</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
