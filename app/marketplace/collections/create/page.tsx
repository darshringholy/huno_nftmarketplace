"use client"

import { useState } from "react"
import CreateNFTSelection from "@/components/marketplace/collection/create/create-nft-selection"
import CreateNFTForm from "@/components/marketplace/collection/create/create-nft-form"
import NewsletterSection from "@/components/marketplace/newsletter-section"

type NFTType = "single" | "multiple" | null

export default function CreateNFTPage() {
  const [selectedType, setSelectedType] = useState<NFTType>(null)

  return (
    <div className="container mx-auto px-4 py-8">
      {!selectedType ? (
        <CreateNFTSelection onSelect={setSelectedType} />
      ) : (
        <CreateNFTForm type={selectedType} onBack={() => setSelectedType(null)} />
      )}
      <NewsletterSection />
    </div>
  )
}
