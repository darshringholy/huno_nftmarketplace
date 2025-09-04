"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Check, ChevronDown } from "lucide-react"

interface ReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemId?: string
  itemName?: string
}

const reportReasons = [
  { value: "copyright", label: "Copyright infringement" },
  { value: "explicit", label: "Explicit and sensitive content" },
  { value: "other", label: "Other" },
]

export default function ReportDialog({ open, onOpenChange, itemId, itemName }: ReportDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string>("")
  const [showReasonDropdown, setShowReasonDropdown] = useState(false)
  const [originalCreatorUrl, setOriginalCreatorUrl] = useState<string>("")
  const [additionalComments, setAdditionalComments] = useState<string>("")
  const [showSuccess, setShowSuccess] = useState(false)

  const handleReport = () => {
    if (!selectedReason) return
    
    // Here you would typically send the report to your backend
    console.log("Reporting item:", {
      itemId,
      itemName,
      reason: selectedReason,
      originalCreatorUrl,
      additionalComments,
      timestamp: new Date().toISOString()
    })
    
    // Show success state
    setShowSuccess(true)
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset form
    setSelectedReason("")
    setShowReasonDropdown(false)
    setOriginalCreatorUrl("")
    setAdditionalComments("")
    setShowSuccess(false)
  }

  const handleDone = () => {
    handleClose()
  }

  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="border-gray-800 text-white max-w-md p-0" style={{ backgroundColor: "#080A0C" }}>
          {/* Header */}
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-xl font-semibold">Report Success</DialogTitle>
          </DialogHeader>

          <div className="px-6 pb-6">
            <p className="text-gray-400 text-sm">
              We received your report. Please contact us on Telegram or by email if you want to get answer from us.
            </p>
          </div>

          {/* Action Button */}
          <div className="p-6 pt-0">
            <Button
              onClick={handleDone}
              className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold h-12"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-gray-800 text-white max-w-md p-0" style={{ backgroundColor: "#080A0C" }}>
        {/* Header */}
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-semibold">Report</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          {/* Reason Section */}
          <div className="space-y-3">
            <label className="text-sm text-gray-400">Reason</label>
            
            {/* Selected Reason Display */}
            <div className="relative">
              <div 
                className="bg-gray-800 border border-gray-700 text-white h-12 rounded-lg px-4 flex items-center justify-between cursor-pointer"
                onClick={() => setShowReasonDropdown(!showReasonDropdown)}
              >
                <span className={selectedReason ? "text-white font-semibold" : "text-gray-500"}>
                  {selectedReason ? reportReasons.find(r => r.value === selectedReason)?.label : "Select a reason"}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showReasonDropdown ? 'rotate-180' : ''}`} />
              </div>
              
              {/* Dropdown Options */}
              {showReasonDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden z-10">
                  {reportReasons.map((reason) => (
                    <div
                      key={reason.value}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-700 cursor-pointer"
                      onClick={() => {
                        setSelectedReason(reason.value)
                        setShowReasonDropdown(false)
                      }}
                    >
                      <span className={selectedReason === reason.value ? "text-green-400" : "text-white"}>
                        {reason.label}
                      </span>
                      {selectedReason === reason.value && (
                        <Check className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Original Creator / URL Section */}
          <div className="space-y-3">
            <label className="text-sm text-gray-400">Original creator / URL</label>
            <Input
              type="text"
              placeholder="https://example.com"
              value={originalCreatorUrl}
              onChange={(e) => setOriginalCreatorUrl(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white h-12 rounded-lg"
            />
          </div>

          {/* Additional Comments Section */}
          <div className="space-y-3">
            <label className="text-sm text-gray-400">Additional comments</label>
            <Textarea
              placeholder="Enter additional comments..."
              value={additionalComments}
              onChange={(e) => setAdditionalComments(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white rounded-lg resize-none"
              rows={4}
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="p-6 pt-0">
          <Button
            onClick={handleReport}
            disabled={!selectedReason}
            className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold h-12 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 