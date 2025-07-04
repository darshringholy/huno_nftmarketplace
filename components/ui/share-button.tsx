"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Twitter, Facebook, Send, Mail } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ShareButtonProps {
  url?: string
  title?: string
  description?: string
  className?: string
  size?: "sm" | "default" | "lg"
  variant?: "default" | "ghost" | "outline"
}

export default function ShareButton({
  url = typeof window !== "undefined" ? window.location.href : "",
  title = "Check this out!",
  description = "",
  className = "",
  size = "sm",
  variant = "ghost",
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const shareOptions = [
    {
      name: "Twitter",
      icon: Twitter,
      action: () => {
        const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
        window.open(twitterUrl, "_blank", "width=600,height=400")
      },
    },
    {
      name: "Facebook",
      icon: Facebook,
      action: () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        window.open(facebookUrl, "_blank", "width=600,height=400")
      },
    },
    {
      name: "Telegram",
      icon: Send,
      action: () => {
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
        window.open(telegramUrl, "_blank", "width=600,height=400")
      },
    },
    {
      name: "E-mail",
      icon: Mail,
      action: () => {
        const emailUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${url}`)}`
        window.location.href = emailUrl
      },
    },
  ]

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={`text-gray-400 hover:text-white ${className}`}>
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white p-4 w-64" align="end" sideOffset={5}>
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-white">Share link to this page</h3>

          <div className="grid grid-cols-2 gap-3">
            {shareOptions.map((option) => {
              const IconComponent = option.icon
              return (
                <button
                  key={option.name}
                  onClick={() => {
                    option.action()
                    setIsOpen(false)
                  }}
                  className="flex flex-col items-center justify-center p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                >
                  <IconComponent className="w-5 h-5 mb-2 text-gray-300 group-hover:text-white" />
                  <span className="text-xs text-gray-300 group-hover:text-white">{option.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
