"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"

interface ActivitiesFilterModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const collections = [
  { name: "Tales of Ragnarok", count: 25388, checked: false },
  { name: "Magic Beasties", count: 5974, checked: false },
  { name: "Crypto Fight", count: 3560, checked: false },
]

export default function ActivitiesFilterModal({ open, onOpenChange }: ActivitiesFilterModalProps) {
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [collectionSearch, setCollectionSearch] = useState("")
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])

  const handleCollectionToggle = (collectionName: string) => {
    setSelectedCollections((prev) =>
      prev.includes(collectionName) ? prev.filter((name) => name !== collectionName) : [...prev, collectionName],
    )
  }

  const handleReset = () => {
    setCategoryFilter("all")
    setCollectionSearch("")
    setSelectedCollections([])
  }

  const handleApply = () => {
    // Apply filters logic here
    console.log({
      category: categoryFilter,
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
        </DialogHeader>

        <div className="space-y-6">
          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Category</label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="auctions">Auctions</SelectItem>
                <SelectItem value="offers">Offers</SelectItem>
                <SelectItem value="transfers">Transfers</SelectItem>
              </SelectContent>
            </Select>
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
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {filteredCollections.map((collection) => (
                <div key={collection.name} className="flex items-center space-x-3">
                  <Checkbox
                    id={collection.name}
                    checked={selectedCollections.includes(collection.name)}
                    onCheckedChange={() => handleCollectionToggle(collection.name)}
                    className="border-gray-600 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                  />

                  <div className="flex items-center space-x-3 flex-1">
                    {/* Hexagonal Collection Icon */}
                    <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="w-6 h-6 bg-gray-600 rounded-sm"></div>
                    </div>

                    <label
                      htmlFor={collection.name}
                      className="flex-1 flex items-center justify-between text-sm cursor-pointer"
                    >
                      <span>{collection.name}</span>
                      <span className="text-gray-400">{collection.count.toLocaleString()}</span>
                    </label>
                  </div>
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
            className="flex-1 border-green-500 text-green-500 hover:bg-green-500/10"
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
