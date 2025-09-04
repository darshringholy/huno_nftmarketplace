'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/hooks/use-wallet"
import CreateLidSelection from "@/components/marketplace/nft/create/create-nft-selection"
import CreateLidForm from "@/components/marketplace/nft/create/create-nft-form"

export default function CreateItemPage() {
  const router = useRouter()
  const { isConnected } = useWallet()
  const [selectedType, setSelectedType] = useState<"single" | "multiple" | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isConnected) {
      router.push('/marketplace/discover')
    }
  }, [mounted, isConnected, router])

  const handleBack = () => {
    if (selectedType) {
      setSelectedType(null)
    } else {
      router.back()
    }
  }

  const handleTypeSelect = (type: "single" | "multiple") => {
    setSelectedType(type)
  }

  // Show loading or redirect if not authenticated
  if (!mounted || !isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {selectedType ? (
                          <CreateLidForm
                  type={selectedType}
                  onBack={handleBack}
                />
              ) : (
                <CreateLidSelection onSelect={handleTypeSelect} />
        )}
      </div>
    </div>
  )
} 