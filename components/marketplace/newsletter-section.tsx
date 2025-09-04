"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"

export default function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      setMessage({ type: "error", text: "Please enter a valid email address" })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: data.message })
        setEmail("")
      } else {
        setMessage({ type: "error", text: data.error || "Failed to subscribe" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to subscribe. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  return (
    <section className="py-32 md:py-40 w-full" style={{ backgroundColor: "#141414" }}>
      <div className="w-full px-6 md:px-8 text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-white">Get the latest Hunos updates</h2>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <div className="relative flex-1">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSubmitting}
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 pr-12"
            />
            <Button
              type="submit"
              disabled={isSubmitting || !email}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-transparent border-none p-2 h-8 w-8"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "→"
              )}
            </Button>
          </div>
        </form>

        {/* Message Display */}
        {message && (
          <div className={`mt-4 max-w-md mx-auto p-3 rounded-lg flex items-center justify-center gap-2 ${
            message.type === "success" 
              ? "bg-green-900 border border-green-700 text-green-200" 
              : "bg-red-900 border border-red-700 text-red-200"
          }`}>
            {message.type === "success" ? (
              <Check className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}
      </div>
    </section>
  )
}
