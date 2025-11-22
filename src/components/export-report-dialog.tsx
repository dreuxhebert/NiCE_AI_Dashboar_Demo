"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Info, X } from "lucide-react"

type ExportOptions = {
  includeForm: boolean
  includeTranscript: boolean
  includeAudioLink: boolean
}

interface ExportReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExport: (options: ExportOptions) => void
  isExporting?: boolean
}

export function ExportReportDialog({
  open,
  onOpenChange,
  onExport,
  isExporting = false,
}: ExportReportDialogProps) {
  const [includeForm, setIncludeForm] = React.useState(true)
  const [includeTranscript, setIncludeTranscript] = React.useState(true)
  const [includeAudioLink, setIncludeAudioLink] = React.useState(true)

  const handleExportClick = () => {
    onExport({
      includeForm,
      includeTranscript,
      includeAudioLink,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Don’t change base layout so it stays centered */}
      <DialogContent className="max-w-md bg-card border border-border/60">
        <DialogHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1">
            <DialogTitle className="text-base font-semibold">
              Export Evaluation Report
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select what to include in the export.
            </DialogDescription>
          </div>

          {/* X button in header */}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="ml-3 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        {/* Info Banner */}
        <div className="mt-2 mb-4 flex items-start gap-2 rounded-md border border-border/60 bg-muted/40 px-3 py-2.5">
          <div className="mt-[1px]">
            <Info className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The report will include the evaluation form, compliance results, and APCO/NENA standards assessment.
          </p>
        </div>

        {/* Options */}
        <div className="space-y-4 py-1">
          {/* Evaluation Form */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="includeForm"
              checked={includeForm}
              onCheckedChange={(v) => setIncludeForm(Boolean(v))}
            />
            <div className="space-y-0.5">
              <Label htmlFor="includeForm" className="cursor-pointer text-sm">
                Evaluation Form &amp; Results
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Includes scored questions, comments, and compliance summary.
              </p>
            </div>
          </div>

          {/* Transcript */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="includeTranscript"
              checked={includeTranscript}
              onCheckedChange={(v) => setIncludeTranscript(Boolean(v))}
            />
            <div className="space-y-0.5">
              <Label htmlFor="includeTranscript" className="cursor-pointer text-sm">
                Call Transcript
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Includes the AI-generated transcript of the call interaction.
              </p>
            </div>
          </div>

          {/* Audio Link */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="includeAudio"
              checked={includeAudioLink}
              onCheckedChange={(v) => setIncludeAudioLink(Boolean(v))}
            />
            <div className="space-y-0.5">
              <Label htmlFor="includeAudio" className="cursor-pointer text-sm">
                Audio Recording Link
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Secure link to the stored call audio when available.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="flex justify-end gap-2 mt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleExportClick}
            disabled={isExporting}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0 shadow-md"
          >
            {isExporting ? "Exporting..." : "Export as PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}