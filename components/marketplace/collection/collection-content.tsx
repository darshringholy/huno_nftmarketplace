"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Filter, ChevronDown, Check } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import NftCard from "@/components/ui/nft-card"

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rarity", label: "Rarity" },
]

const collectionItems = [
  { name: "Red car", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
  { name: "Anpaid", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
  { name: "Marvin", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
  { name: "Kalyptingo", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
  { name: "Red car", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
  { name: "Anpaid", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
  { name: "Marvin", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
  { name: "Kalyptingo", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
  { name: "Red car", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
  { name: "Anpaid", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
  { name: "Marvin", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
  { name: "Kalyptingo", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
]

export default function CollectionContent() {
  const [activeTab, setActiveTab] = useState("items")
  const [sortBy, setSortBy] = useState("newest")

  const selectedOption = sortOptions.find((option) => option.value === sortBy)

  return (
    <div className="py-8 space-y-8">
      {/* Navigation Tabs and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <button
            onClick={() => setActiveTab("items")}
            className={`pb-2 border-b-2 transition-colors ${activeTab === "items"
              ? "border-green-500 text-white"
              : "border-transparent text-gray-400 hover:text-white"
              }`}
          >
            Items
          </button>
          <button
            onClick={() => setActiveTab("activities")}
            className={`pb-2 border-b-2 transition-colors ${activeTab === "activities"
              ? "border-green-500 text-white"
              : "border-transparent text-gray-400 hover:text-white"
              }`}
          >
            Activities
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 min-w-[200px] justify-between"
              >
                <span>{selectedOption?.label || "Newest"}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white min-w-[200px]">
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer flex items-center justify-between"
                >
                  <span className={sortBy === option.value ? "text-green-400" : "text-white"}>{option.label}</span>
                  {sortBy === option.value && <Check className="w-4 h-4 text-green-400" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" className="border-gray-700">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Items Grid */}
      {activeTab === "items" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {collectionItems.map((item, index) => (
            <NftCard key={index} nft={item} index={index} />
          ))}
        </div>
      )}

      {/* Activities Tab Content */}
      {activeTab === "activities" && (
        <div className="text-center py-16">
          <p className="text-gray-400">Collection activities coming soon...</p>
        </div>
      )}

      {/* Load More Button */}
      <div className="text-center">
        <Button variant="outline" className="border-gray-700 hover:border-green-500">
          Load more
        </Button>
      </div>
    </div>
  )
}
