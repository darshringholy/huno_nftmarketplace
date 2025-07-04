"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"

interface FilterModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const collections = [
  { name: "Tales of Ragnarok", count: 25300, checked: false },
  { name: "Magic Beasties", count: 5970, checked: false },
  { name: "Crypto Fight", count: 3560, checked: false },
]

export default function FilterModal({ open, onOpenChange }: FilterModalProps) {
  const [typeFilter, setTypeFilter] = useState("all")
  const [bundleFilter, setBundleFilter] = useState("all")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [collectionSearch, setCollectionSearch] = useState("")
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])

  const handleCollectionToggle = (collectionName: string) => {
    setSelectedCollections((prev) =>
      prev.includes(collectionName) ? prev.filter((name) => name !== collectionName) : [...prev, collectionName],
    )
  }

  const handleReset = () => {
    setTypeFilter("all")
    setBundleFilter("all")
    setMinPrice("")
    setMaxPrice("")
    setCollectionSearch("")
    setSelectedCollections([])
  }

  const handleApply = () => {
    // Apply filters logic here
    console.log({
      type: typeFilter,
      bundle: bundleFilter,
      priceRange: { min: minPrice, max: maxPrice },
      collections: selectedCollections,
    })
    onOpenChange(false)
  }

  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(collectionSearch.toLowerCase()),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-lg font-semibold">Filters</DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Type Filter */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Type</label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="single">Single Items</SelectItem>
                <SelectItem value="bundle">Bundles</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bundle & Items Filter */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Bundle & Items</label>
            <Select value={bundleFilter} onValueChange={setBundleFilter}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="items-only">Items Only</SelectItem>
                <SelectItem value="bundles-only">Bundles Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Price</label>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
              <span className="text-gray-400">To</span>
              <Input
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
            </div>
          </div>

          {/* Collections */}
          <div className="space-y-3">
            <label className="text-sm text-gray-400">Collections</label>

            {/* Search Collections */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Filter"
                value={collectionSearch}
                onChange={(e) => setCollectionSearch(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 pl-10"
              />
            </div>

            {/* Collections List */}
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {filteredCollections.map((collection) => (
                <div key={collection.name} className="flex items-center space-x-3">
                  <Checkbox
                    id={collection.name}
                    checked={selectedCollections.includes(collection.name)}
                    onCheckedChange={() => handleCollectionToggle(collection.name)}
                    className="border-gray-600 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                  />
                  <label
                    htmlFor={collection.name}
                    className="flex-1 flex items-center justify-between text-sm cursor-pointer"
                  >
                    <span>{collection.name}</span>
                    <span className="text-gray-400">{collection.count.toLocaleString()}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1 border-gray-600 text-white hover:bg-gray-800"
          >
            Reset
          </Button>
          <Button onClick={handleApply} className="flex-1 bg-green-500 hover:bg-green-600 text-black">
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
