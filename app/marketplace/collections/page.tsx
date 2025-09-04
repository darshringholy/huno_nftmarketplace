"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Filter, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import CollectionCard from "@/components/profile/CollectionCard"

export default function CollectionsPage() {
  const [collections, setCollections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const res = await fetch("/api/collections")
        if (!res.ok) throw new Error("Failed to fetch collections")
        const { collections } = await res.json()
        
        // Fetch stats for each collection
        const collectionsWithStats = await Promise.all(
          collections.map(async (collection: any) => {
            try {
              const statsRes = await fetch(`/api/collections/${collection._id}/stats`)
              if (statsRes.ok) {
                const { stats } = await statsRes.json()
                return {
                  ...collection,
                  itemsCount: parseInt(stats.listed) || 0,
                  floorPrice: stats.floorPrice !== "0" ? `$${stats.floorPrice}` : "-"
                }
              }
            } catch (err: any) {
              console.error(`Error fetching stats for collection ${collection._id}:`, err)
            }
            return {
              ...collection,
              itemsCount: 0,
              floorPrice: "-"
            }
          })
        )
        
        setCollections(collectionsWithStats || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCollections()
  }, [])

  const sortOptions = [
    { value: "newest", label: "Recently Created" },
    { value: "oldest", label: "Oldest First" },
    { value: "name", label: "Name A-Z" },
    { value: "items", label: "Most Items" },
    { value: "floor", label: "Highest Floor" },
  ]

  const selectedOption = sortOptions.find((option) => option.value === sortBy)

  const sortedCollections = [...collections].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "name":
        return a.name.localeCompare(b.name)
      case "items":
        return b.itemsCount - a.itemsCount
      case "floor":
        const floorA = a.floorPrice === "-" ? 0 : parseFloat(a.floorPrice.replace("$", ""))
        const floorB = b.floorPrice === "-" ? 0 : parseFloat(b.floorPrice.replace("$", ""))
        return floorB - floorA
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-400">Loading collections...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Collections</h1>
        <p className="text-gray-400 text-lg">Discover and explore unique collections</p>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 min-w-[150px] justify-between"
              >
                <span>{selectedOption?.label}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white min-w-[150px]">
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
                  onClick={() => setSortBy(option.value)}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Collections Grid */}
      {collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 flex items-center justify-center bg-gray-800 rounded-full mb-4">
            <span className="text-3xl text-gray-500">🗑️</span>
          </div>
          <div className="text-gray-400 text-lg mb-2">No Collections Found</div>
          <div className="text-gray-500 mb-4">No collections are available at the moment.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedCollections.map((collection, index) => (
            <CollectionCard
              key={collection._id || index}
              id={collection._id}
              name={collection.name}
              bannerUrl={collection.bannerUrl}
              logoUrl={collection.logoUrl}
              blockchain={collection.blockchain}
              verified={collection.verified}
              description={collection.description}
              itemsCount={collection.itemsCount || 0}
              floorPrice={collection.floorPrice || "-"}
            />
          ))}
        </div>
      )}
    </div>
  )
}
