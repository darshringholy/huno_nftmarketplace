"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Edit, User, Settings } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

interface EditButtonProps {
  onProfileEdit?: () => void
  onSettingsEdit?: () => void
  className?: string
  size?: "sm" | "default" | "lg"
  variant?: "default" | "ghost" | "outline"
}

export default function EditButton({
  onProfileEdit,
  onSettingsEdit,
  className = "",
  size = "sm",
  variant = "outline",
}: EditButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleProfileEdit = () => {
    if (onProfileEdit) {
      onProfileEdit()
    } else {
      router.push("/profile/edit")
    }
    setIsOpen(false)
  }

  const handleSettingsEdit = () => {
    if (onSettingsEdit) {
      onSettingsEdit()
    } else {
      router.push("/settings")
    }
    setIsOpen(false)
  }

  const editOptions = [
    {
      name: "Profile",
      icon: User,
      action: handleProfileEdit,
    },
    {
      name: "Setting",
      icon: Settings,
      action: handleSettingsEdit,
    },
  ]

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={`text-gray-400 hover:text-white ${className}`}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white p-2 w-32" align="end" sideOffset={5}>
        <div className="space-y-1">
          {editOptions.map((option) => {
            const IconComponent = option.icon
            return (
              <DropdownMenuItem
                key={option.name}
                onClick={option.action}
                className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-700 focus:bg-gray-700 rounded cursor-pointer"
              >
                <IconComponent className="w-4 h-4 text-gray-300" />
                <span className="text-sm text-gray-300">{option.name}</span>
              </DropdownMenuItem>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
