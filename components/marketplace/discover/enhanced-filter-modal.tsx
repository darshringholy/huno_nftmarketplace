"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"

interface EnhancedFilterModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const networks = [
  { value: "bnb", label: "BNB Chain", icon: "🟡" },
  { value: "ethereum", label: "Ethereum", icon: "🔵" },
  { value: "polygon", label: "Polygon", icon: "🟣" },
  { value: "arbitrum", label: "Arbitrum", icon: "🔵" },
]

const collections = [
  {
    name: "Tales of Ragnarok",
    count: 4,
    icon: "⬡",
    color: "bg-gray-600",
  },
  {
    name: "Magic Beasties",
    count: 2,
    icon: "⬡",
    color: "bg-gray-600",
  },
  {
    name: "Crypto Fight",
    count: 1,
    icon: "⬡",
    color: "bg-gray-600",
  },
]

export default function EnhancedFilterModal({ open, onOpenChange }: EnhancedFilterModalProps) {
  const [selectedNetwork, setSelectedNetwork] = useState("bnb")
  const [collectionSearch, setCollectionSearch] = useState("")
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])

  const handleCollectionToggle = (collectionName: string) => {
    setSelectedCollections((prev) =>
      prev.includes(collectionName) ? prev.filter((name) => name !== collectionName) : [...prev, collectionName],
    )
  }

  const handleReset = () => {
    setSelectedNetwork("bnb")
    setCollectionSearch("")
    setSelectedCollections([])
  }

  const handleApply = () => {
    console.log({
      network: selectedNetwork,
      collections: selectedCollections,
    })
    onOpenChange(false)
  }

  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(collectionSearch.toLowerCase()),
  )

  const selectedNetworkData = networks.find((network) => network.value === selectedNetwork)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md p-0">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <DialogTitle className="text-xl font-semibold">Filters</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          {/* Network Selection */}
          <div className="space-y-3">
            <label className="text-sm text-gray-400">Network</label>
            <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white h-12">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{selectedNetworkData?.icon}</span>
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                {networks.map((network) => (
                  <SelectItem key={network.value} value={network.value}>
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{network.icon}</span>
                      <span>{network.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Collections */}
          <div className="space-y-4">
            <label className="text-sm text-gray-400">Collections</label>

            {/* Search Collections */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Filter"
                value={collectionSearch}
                onChange={(e) => setCollectionSearch(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 pl-10 h-12"
              />
            </div>

            {/* Collections List */}
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {filteredCollections.map((collection) => (
                <div
                  key={collection.name}
                  className="flex items-center justify-between cursor-pointer hover:bg-gray-800/50 p-2 rounded-lg transition-colors"
                  onClick={() => handleCollectionToggle(collection.name)}
                >
                  <div className="flex items-center space-x-3">
                    {/* Hexagonal Collection Icon */}
                    <div
                      className={`w-10 h-10 ${collection.color} rounded-lg flex items-center justify-center flex-shrink-0`}
                    >
                      <span className="text-gray-300 text-lg">{collection.icon}</span>
                    </div>

                    <div className="flex-1">
                      <span className="text-white font-medium">{collection.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-gray-400 text-sm">{collection.count}</span>
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center ${selectedCollections.includes(collection.name)
                        ? "bg-green-500 border-green-500"
                        : "border-gray-600"
                        }`}
                    >
                      {selectedCollections.includes(collection.name) && <span className="text-black text-xs">✓</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 p-6 pt-0">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1 border-gray-600 text-white hover:bg-gray-800 h-12"
          >
            Reset
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 bg-green-500 hover:bg-green-600 text-black font-semibold h-12"
          >
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
