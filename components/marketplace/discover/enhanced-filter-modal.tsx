"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"

interface EnhancedFilterModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: "items" | "activities"
  onApplyFilters?: (filters: {
    type: string
    bundle: string
    minPrice: string
    maxPrice: string
    collections: string[]
  }) => void
}

interface Collection {
  _id: string
  name: string
  logoUrl?: string
  bannerUrl?: string
  createdAt: string
}

export default function EnhancedFilterModal({ open, onOpenChange, mode = "items", onApplyFilters }: EnhancedFilterModalProps) {
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [typeFilter, setTypeFilter] = useState("All")
  const [bundleFilter, setBundleFilter] = useState("All")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [collectionSearch, setCollectionSearch] = useState("")
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [collectionsLoading, setCollectionsLoading] = useState(false)
  const [collectionsError, setCollectionsError] = useState<string | null>(null)

  // Fetch collections from API
  useEffect(() => {
    const fetchCollections = async () => {
      setCollectionsLoading(true)
      setCollectionsError(null)
      try {
        const response = await fetch('/api/collections')
        if (!response.ok) {
          throw new Error('Failed to fetch collections')
        }
        const data = await response.json()
        setCollections(data.collections || [])
      } catch (error) {
        setCollectionsError(error instanceof Error ? error.message : 'Failed to fetch collections')
        console.error('Error fetching collections:', error)
      } finally {
        setCollectionsLoading(false)
      }
    }

    if (open) {
      fetchCollections()
    }
  }, [open])

  const handleCollectionToggle = (collectionName: string) => {
    setSelectedCollections((prev) =>
      prev.includes(collectionName) ? prev.filter((name) => name !== collectionName) : [...prev, collectionName],
    )
  }

  const handleReset = () => {
    setCategoryFilter("All")
    setTypeFilter("All")
    setBundleFilter("All")
    setMinPrice("")
    setMaxPrice("")
    setCollectionSearch("")
    setSelectedCollections([])
  }

  const handleApply = () => {
    const filters = {
      type: mode === "activities" ? categoryFilter : typeFilter,
      bundle: bundleFilter,
      minPrice,
      maxPrice,
      collections: selectedCollections,
    }
    console.log('Applying filters:', filters)
    onApplyFilters?.(filters)
    onOpenChange(false)
  }

  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(collectionSearch.toLowerCase()),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-gray-800 text-white max-w-md p-0" style={{ backgroundColor: "#080A0C" }}>
        {/* Header */}
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-semibold">Filters</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          {mode === "items" ? (
            <>
              {/* Type */}
              <div className="space-y-3">
                <label className="text-sm text-gray-400">Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Fixed Price">Fixed Price</SelectItem>
                    <SelectItem value="Auction">Auction</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bundle & items */}
              <div className="space-y-3">
                <label className="text-sm text-gray-400">Bundle & items</label>
                <Select value={bundleFilter} onValueChange={setBundleFilter}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Bundle">Bundle</SelectItem>
                    <SelectItem value="Single Item">Single Item</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price */}
              <div className="space-y-3">
                <label className="text-sm text-gray-400">Price</label>
                <div className="flex items-center space-x-3">
                  <Input
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 h-12"
                  />
                  <span className="text-white text-sm">To</span>
                  <Input
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 h-12"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Category for Activities */}
              <div className="space-y-3">
                <label className="text-sm text-gray-400">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Bids">Bids</SelectItem>
                    <SelectItem value="Offers">Offers</SelectItem>
                    <SelectItem value="Listings">Listings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

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
              {collectionsLoading ? (
                <div className="text-center text-gray-400 py-4">Loading collections...</div>
              ) : collectionsError ? (
                <div className="text-center text-red-400 py-4">{collectionsError}</div>
              ) : filteredCollections.length === 0 ? (
                <div className="text-center text-gray-400 py-4">No collections found</div>
              ) : (
                filteredCollections.map((collection) => (
                  <div
                    key={collection._id}
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-800/50 p-2 rounded-lg transition-colors"
                    onClick={() => handleCollectionToggle(collection.name)}
                  >
                    <div className="flex items-center space-x-3">
                      {/* Collection Icon */}
                      <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        {collection.logoUrl ? (
                          <img 
                            src={collection.logoUrl} 
                            alt={collection.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                        ) : (
                          <span className="text-gray-300 text-lg">⬡</span>
                        )}
                      </div>

                      <div className="flex-1">
                        <span className="text-white font-medium">{collection.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-gray-400 text-sm">
                        {selectedCollections.includes(collection.name) ? "Selected" : ""}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 p-6 pt-0">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1 border-green-500 text-green-500 hover:bg-green-500/10 h-12"
          >
            Reset
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold h-12"
          >
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
