"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import axios from "axios"
import { on } from "events"

const CALL_TYPES = ["All", "Medical", "Police", "Fire", "Other"]

interface AddQuestionDialogProps {
  open: boolean
  onClose: () => void
}

export function AddQuestionDrawer({ open, onClose }: AddQuestionDialogProps) {
  const [question, setQuestion] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const handleSave = async () => {
    try {
        const model = {
            "originalQuestion": question,
            "editedQuestion": question,
            "questionDescription": "",
            "type": selectedTypes
        }
        const response = await axios.post('/api/proxy/addQuestion', {
          model,
        });
        setQuestion("")
        setSelectedTypes([])
        console.log("Question added:", response.data);
        onClose()
    } catch (error) {
        console.error("Error adding question:", error);
    }
  }


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Add Question
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Question input */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Question
            </label>
            <Input
              placeholder="Type your question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
            />
          </div>

          {/* Selected tags */}
            {selectedTypes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedTypes.map((type) => (
                  <div
                    key={type}
                    className="flex items-center gap-1 rounded-full bg-gray-200 dark:bg-gray-700 px-3 py-1 text-sm text-gray-900 dark:text-gray-100"
                  >
                    <span>{type}</span>
                    <X
                      className="h-4 w-4 cursor-pointer"
                      onClick={() => toggleType(type)}
                    />
                  </div>
                ))}
              </div>
            )}

          {/* Dropdown */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Use this for
            </label>

            <div className="relative">
              <Button
                variant="outline"
                className="w-full justify-between bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
                onClick={() => setDropdownOpen((prev) => !prev)}
              >
                {selectedTypes.length > 0
                  ? `${selectedTypes.length} selected`
                  : "Select call types"}
                <span className="ml-2">▾</span>
              </Button>

              {dropdownOpen && (
                <div
                  className="
                    absolute left-0 top-full mt-2
                    w-full rounded-md border border-gray-300 dark:border-gray-700
                    bg-white dark:bg-gray-800 shadow-md z-50
                  "
                >
                  {CALL_TYPES.map((type) => (
                    <div
                      key={type}
                      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        selectedTypes.includes(type)
                          ? "bg-gray-200 dark:bg-gray-700 font-medium"
                          : ""
                      } text-gray-900 dark:text-gray-100`}
                      onClick={() => toggleType(type)}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <div className="flex justify-end gap-2 w-full mt-4">
            <Button
              variant="ghost"
              className="text-gray-700 dark:text-gray-300"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
