"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Filter, ChevronDown, Check } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import EnhancedFilterModal from "./enhanced-filter-modal"
import ActivitiesTable from "./activities-table"
import Image from "next/image"
import NftCard from "@/components/ui/nft-card"
import { ethers } from "ethers"
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from "@/lib/marketplace"
import { NftCardDiscover } from "@/components/ui/nft-card-discover"
import { LIQUIDID_ABI, LIQUIDID_ADDRESS } from "@/lib/liquidid"

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "ending-soon", label: "Ending Soon" },
]

const activityFilterOptions = [
  { value: "all", label: "All" },
  { value: "fixed-price", label: "Fixed Price" },
  { value: "auction", label: "Auction" },
  { value: "with-buy-offer", label: "With Buy Offer" },
]

// Sample fallback NFT images
const fallbackNftImages = [
  "https://hunosrent.com/images/upload/x_large_812cde03b32d22ea8ae243197c40da6f.jpeg",
  "https://hunosrent.com/images/upload/x_large_3d70b92d9bc26ddc2f73458d22e10edb.jpeg",
  "https://hunosrent.com/images/upload/x_large_7432ec080bddc7c1f782905c508d8ecc.jpeg",
  "https://hunosrent.com/images/upload/x_large_ea2c13a17bba344bda66ed77821c0bfb.jpeg"
]

export default function DiscoverContent() {
  const [activeTab, setActiveTab] = useState("items")
  const [sortBy, setSortBy] = useState("newest")
  const [activityFilter, setActivityFilter] = useState("all")
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [nftItems, setNftItems] = useState<any[]>([])
  const [itemPrices, setItemPrices] = useState<{ [liquidId: string]: string }>({})
  const [loadingPrices, setLoadingPrices] = useState<{ [liquidId: string]: boolean }>({})
  const [loadingBids, setLoadingBids] = useState<{ [liquidId: string]: boolean }>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetchingMore, setFetchingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const PAGE_SIZE = 12
  const [itemImages, setItemImages] = useState<{ [liquidId: string]: string }>({})
  const [loadingImages, setLoadingImages] = useState<{ [liquidId: string]: boolean }>({})

  const selectedSortOption = sortOptions.find((option) => option.value === sortBy)
  const selectedActivityOption = activityFilterOptions.find((option) => option.value === activityFilter)

  // Reusable function to fetch images and prices for a list of items
  async function fetchImagesAndPricesForItems(items: any[]) {
    let provider: ethers.BrowserProvider | ethers.JsonRpcProvider
    if (typeof window !== "undefined" && (window as any).ethereum) {
      provider = new ethers.BrowserProvider((window as any).ethereum)
    } else {
      provider = new ethers.JsonRpcProvider("https://testnet-rpc.plume.org")
    }
    const contract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider)
    const prices: { [liquidId: string]: string } = { ...itemPrices }
    const loadingPriceMap: { [liquidId: string]: boolean } = { ...loadingPrices }
    const images: { [liquidId: string]: string } = { ...itemImages }
    const loadingImageMap: { [liquidId: string]: boolean } = { ...loadingImages }
    await Promise.all(items.map(async (nft: any) => {
      const liquidId = nft.liquidId?.toString()
      loadingPriceMap[liquidId] = true
      loadingImageMap[liquidId] = true
      try {
        const listing = await contract.getListing(nft.liquidId)
        prices[liquidId] = ethers.formatUnits(listing.price, 18)
      } catch {
        prices[liquidId] = "-"
      } finally {
        loadingPriceMap[liquidId] = false
      }
      try {
        let providerForImage: ethers.BrowserProvider | ethers.JsonRpcProvider
        if (typeof window !== "undefined" && (window as any).ethereum) {
          providerForImage = new ethers.BrowserProvider((window as any).ethereum)
        } else {
          providerForImage = new ethers.JsonRpcProvider("https://testnet-rpc.plume.org")
        }
        const liquidIdContract = new ethers.Contract(LIQUIDID_ADDRESS, LIQUIDID_ABI, providerForImage)
        const imageUri = await liquidIdContract.imageURI(nft.liquidId)
        if (!imageUri || typeof imageUri !== 'string' || !imageUri.startsWith('http')) {
          const fallbackIndex = parseInt(liquidId, 10) % fallbackNftImages.length
          images[liquidId] = fallbackNftImages[fallbackIndex]
        } else {
          images[liquidId] = imageUri
        }
      } catch (error) {
        const fallbackIndex = parseInt(liquidId, 10) % fallbackNftImages.length
        images[liquidId] = fallbackNftImages[fallbackIndex]
      } finally {
        loadingImageMap[liquidId] = false
      }
    }))
    setItemPrices(prices)
    setLoadingPrices(loadingPriceMap)
    setItemImages(images)
    setLoadingImages(loadingImageMap)
  }

  useEffect(() => {
    async function fetchListings() {
      setLoading(true)
      setError(null)
      try {
        let provider: ethers.BrowserProvider | ethers.JsonRpcProvider
        if (typeof window !== "undefined" && (window as any).ethereum) {
          provider = new ethers.BrowserProvider((window as any).ethereum)
        } else {
          provider = new ethers.JsonRpcProvider("https://testnet-rpc.plume.org")
        }
        const contract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider)
        const listings = await contract.getListArray(0, PAGE_SIZE)
        setNftItems(listings)
        setHasMore(listings.length === PAGE_SIZE)
        await fetchImagesAndPricesForItems(listings)
      } catch (err: any) {
        setError(err.message || "Failed to fetch listings")
      } finally {
        setLoading(false)
      }
    }
    fetchListings()
  }, [])

  // Fetch bids for visible items
  useEffect(() => {
    async function fetchBidsForVisibleItems() {
      let provider: ethers.BrowserProvider | ethers.JsonRpcProvider
      if (typeof window !== "undefined" && (window as any).ethereum) {
        provider = new ethers.BrowserProvider((window as any).ethereum)
      } else {
        provider = new ethers.JsonRpcProvider("https://testnet-rpc.plume.org")
      }
      const contract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider)
      const newBidPrices: { [liquidId: string]: string } = {}
      const newLoadingBids: { [liquidId: string]: boolean } = {}
      await Promise.all(
        nftItems.map(async (nft: any) => {
          const liquidId = nft.liquidId?.toString()
          if (!liquidId || itemPrices[liquidId]) return
          newLoadingBids[liquidId] = true
          try {
            const auction = await contract.getAuction(nft.liquidId)
            if (auction && auction.currentBid && BigInt(auction.currentBid) > BigInt(0)) {
              newBidPrices[liquidId] = ethers.formatUnits(auction.currentBid, 18)
            }
          } catch (e) {
            // Not an auction or error, ignore
          } finally {
            newLoadingBids[liquidId] = false
          }
        })
      )
      setLoadingBids(prev => ({ ...prev, ...newLoadingBids }))
    }
    if (nftItems.length > 0) {
      fetchBidsForVisibleItems()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nftItems])

  const handleLoadMore = async () => {
    setFetchingMore(true)
    setError(null)
    try {
      let provider: ethers.BrowserProvider | ethers.JsonRpcProvider
      if (typeof window !== "undefined" && (window as any).ethereum) {
        provider = new ethers.BrowserProvider((window as any).ethereum)
      } else {
        provider = new ethers.JsonRpcProvider("https://testnet-rpc.plume.org")
      }
      const contract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider)
      const listings = await contract.getListArray(nftItems.length, PAGE_SIZE)
      setNftItems(prev => {
        const newItems = [...prev, ...listings]
        // Fetch images/prices for only the new listings
        fetchImagesAndPricesForItems(listings)
        return newItems
      })
      setHasMore(listings.length === PAGE_SIZE)
    } catch (err: any) {
      setError(err.message || "Failed to fetch more listings")
    } finally {
      setFetchingMore(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Discover</h1>
        <p className="text-gray-400">All the latest items</p>
      </div>

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
          {/* Items Tab Filters */}
          {activeTab === "items" && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 min-w-[200px] justify-between"
                  >
                    <span>{selectedSortOption?.label || "Label"}</span>
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

              <Button variant="outline" size="sm" className="border-gray-700" onClick={() => setFilterModalOpen(true)}>
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </>
          )}

          {/* Activities Tab Filters */}
          {activeTab === "activities" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 min-w-[200px] justify-between"
                >
                  <span>{selectedActivityOption?.label || "All"}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white min-w-[200px]">
                {activityFilterOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setActivityFilter(option.value)}
                    className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer flex items-center justify-between"
                  >
                    <span className={activityFilter === option.value ? "text-green-400" : "text-white"}>
                      {option.label}
                    </span>
                    {activityFilter === option.value && <Check className="w-4 h-4 text-green-400" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* NFT Grid */}
      {activeTab === "items" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading && <div className="col-span-full text-center">Loading NFT orders...</div>}
          {error && <div className="col-span-full text-center text-red-500">{error}</div>}
          {!loading && !error && nftItems.length === 0 && (
            <div className="col-span-full text-center">No NFT orders found.</div>
          )}
          {!loading && !error && nftItems.map((nft, index) => {
            const liquidId = nft.liquidId?.toString()
            const price = itemPrices[liquidId]
            const isPriceLoading = loadingPrices[liquidId]
            const image = itemImages[liquidId] || "/placeholder.svg?height=200&width=200"
            const isImageLoading = loadingImages[liquidId]
            return (
              <NftCardDiscover
                key={index}
                nft={{
                  name: `NFT #${nft.liquidId}`,
                  image: isImageLoading ? "/placeholder.svg?height=200&width=200" : image,
                  collectionName: "Plato",
                  verified: true,
                  price: price,
                  isPriceLoading: isPriceLoading
                }}
                index={index}
              />
            )
          })}
        </div>
      )}

      {/* Activities Table */}
      {activeTab === "activities" && <ActivitiesTable activityFilter={activityFilter} />}

      {/* Load More Button */}
      <div className="text-center">
        {hasMore ? (
          <Button
            variant="outline"
            className="border-gray-700 hover:border-green-500"
            onClick={handleLoadMore}
            disabled={fetchingMore}
          >
            {fetchingMore ? "Loading..." : "Load more"}
          </Button>
        ) : (
          <div className="text-gray-400">No more items</div>
        )}
      </div>

      {/* Enhanced Filter Modal */}
      <EnhancedFilterModal open={filterModalOpen} onOpenChange={setFilterModalOpen} />
    </div>
  )
}
