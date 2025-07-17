'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import CreateNFTSelection from "@/components/marketplace/nft/create/create-nft-selection"
import CreateNFTForm from "@/components/marketplace/nft/create/create-nft-form"

export default function CreateItemPage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<"single" | "multiple" | null>(null)

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

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {selectedType ? (
          <CreateNFTForm 
            type={selectedType} 
            onBack={handleBack}
          />
        ) : (
          <CreateNFTSelection onSelect={handleTypeSelect} />
        )}
      </div>
    </div>
  )
} 