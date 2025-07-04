"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Filter, ChevronDown, Check, ExternalLink } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"
import NftCard from "../ui/nft-card"
import ActivitiesTable from "../marketplace/discover/activities-table"
import { ethers } from "ethers"
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from "@/lib/marketplace"
import { useWallet } from "@/hooks/use-wallet"
import { LIQUIDID_ABI, LIQUIDID_ADDRESS } from "@/lib/liquidid"
import { useSearchParams } from "next/navigation"
import { NftCardProfile } from "@/components/ui/nft-card-profile"

interface Profile {
  address: string
  username: string
  bio: string
  bannerImage: string
  avatarImage: string
  socialLinks: {
    twitter: string
    instagram: string
    discord: string
    website: string
  }
  stats: {
    items: number
    collections: number
    followers: number
    following: number
  }
}

interface ProfileContentProps {
  profile: Profile
}

const filterOptions = [
  { value: "all", label: "All" },
  { value: "art", label: "Art" },
  { value: "gaming", label: "Gaming" },
  { value: "music", label: "Music" },
  { value: "collectibles", label: "Collectibles" },
]

const userNFTs = [
  { name: "Red car", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
  { name: "Anpaid", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
  { name: "Marvin", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
  { name: "Kalyptingo", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
]

export default function ProfileContent({ profile }: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState("items")
  const [filterBy, setFilterBy] = useState("all")
  const [userAssets, setUserAssets] = useState<any[]>([])
  const [liquidIds, setLiquidIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingMore, setFetchingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const PAGE_SIZE = 4
  const { isConnected } = useWallet();

  const [onSaleTab, setOnSaleTab] = useState("buy-now")
  const [offersTab, setOffersTab] = useState("offered")
  const [activitiesFilter, setActivitiesFilter] = useState("all")

  const buyNowNFTs = [
    { name: "Green car", collection: "Polychain Monsters", price: "0.62 BUSD", verified: true },
    { name: "Giraffe", collection: "Polychain Monsters", price: "0.62 BUSD", verified: true },
    { name: "Titicinizen", collection: "Polychain Monsters", price: "0.54 BUSD", verified: true },
    { name: "Breathing Space", collection: "Polychain Monsters", price: "0.75 BUSD", verified: true },
  ]

  const auctionNFTs = [
    { name: "Red car", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
    { name: "Anpaid", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
    { name: "Marvin", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
    { name: "Kalyptingo", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
  ]

  const bidNFTs = [
    { name: "Red car", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
    { name: "Anpaid", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
    { name: "Marvin", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
    { name: "Kalyptingo", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
  ]

  const endedNFTs = [
    { name: "Red car", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
    { name: "Anpaid", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
    { name: "Marvin", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
    { name: "Kalyptingo", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
  ]

  const receivedOffers = [
    {
      name: "KaijuKingz",
      collection: "Tales of Ragnarok",
      price: "1.13 BUSD",
      usdPrice: "$366.86",
      to: "Cimmy",
      offeredAt: "5 minutes ago",
      status: "pending",
      verified: true,
    },
    {
      name: "Impostors Genesis",
      collection: "Doodle Apes",
      price: "0.93 BUSD",
      usdPrice: "$349.18",
      to: "TheElerKing",
      offeredAt: "1 hours ago",
      status: "cancelled",
      verified: false,
    },
    {
      name: "Puple flower",
      collection: "Magic Beasties",
      price: "0.85 BUSD",
      usdPrice: "$331.54",
      to: "0xhg34...nGj2",
      offeredAt: "4 hours ago",
      status: "cancelled",
      verified: true,
    },
    {
      name: "Red car",
      collection: "Doodle Apes",
      price: "0.77 BUSD",
      usdPrice: "$318.24",
      to: "0xhg34...nGj2",
      offeredAt: "5 hours ago",
      status: "pending",
      verified: false,
    },
    {
      name: "KaijuKingz",
      collection: "Tales of Ragnarok",
      price: "0.72 BUSD",
      usdPrice: "$309.45",
      to: "0xhg34...nGj2",
      offeredAt: "7 hours ago",
      status: "success",
      verified: true,
    },
    {
      name: "Maxido",
      collection: "Tales of Ragnarok",
      price: "0.64 BUSD",
      usdPrice: "$265.22",
      to: "Cimmy",
      offeredAt: "A day ago",
      status: "cancelled",
      verified: true,
    },
    {
      name: "Fix witch",
      collection: "Magic Beasties",
      price: "0.91 BUSD",
      usdPrice: "$397.85",
      to: "TheElerKing",
      offeredAt: "3 days ago",
      status: "cancelled",
      verified: true,
    },
    {
      name: "Impostors Genesis",
      collection: "Doodle Apes",
      price: "1.00 BUSD",
      usdPrice: "$442.00",
      to: "0xhg34...nGj2",
      offeredAt: "3 days ago",
      status: "pending",
      verified: false,
    },
    {
      name: "KaijuKingz",
      collection: "Tales of Ragnarok",
      price: "0.75 BUSD",
      usdPrice: "$331.55",
      to: "Cimmy",
      offeredAt: "3 days ago",
      status: "cancelled",
      verified: true,
    },
    {
      name: "Puple flower",
      collection: "Magic Beasties",
      price: "0.75 BUSD",
      usdPrice: "$331.55",
      to: "0xgj32...el21",
      offeredAt: "3 days ago",
      status: "success",
      verified: true,
    },
  ]

  const offeredOffers = [
    {
      name: "Titicinizen",
      collection: "Tales of Ragnarok",
      price: "1.13 BUSD",
      usdPrice: "$366.86",
      from: "Cimmy",
      offeredAt: "5 minutes ago",
      status: "pending",
      verified: true,
    },
    {
      name: "Impostors Genesis",
      collection: "Doodle Apes",
      price: "0.93 BUSD",
      usdPrice: "$349.18",
      from: "TheElerKing",
      offeredAt: "1 hours ago",
      status: "cancelled",
      verified: false,
    },
    {
      name: "Donkey",
      collection: "Plato",
      price: "0.85 BUSD",
      usdPrice: "$331.54",
      from: "0xhg34...nGj2",
      offeredAt: "4 hours ago",
      status: "cancelled",
      verified: true,
    },
    {
      name: "Unigiraffe",
      collection: "Tales of Ragnarok",
      price: "0.77 BUSD",
      usdPrice: "$318.24",
      from: "0xhg34...nGj2",
      offeredAt: "5 hours ago",
      status: "pending",
      verified: false,
    },
    {
      name: "Donkey",
      collection: "Doodle Apes",
      price: "0.72 BUSD",
      usdPrice: "$309.45",
      from: "0xhg34...nGj2",
      offeredAt: "7 hours ago",
      status: "success",
      verified: true,
    },
    {
      name: "Maxido",
      collection: "Plato",
      price: "0.64 BUSD",
      usdPrice: "$265.22",
      from: "Cimmy",
      offeredAt: "A day ago",
      status: "cancelled",
      verified: true,
    },
    {
      name: "Red car",
      collection: "Monsters",
      price: "0.91 BUSD",
      usdPrice: "$397.85",
      from: "TheElerKing",
      offeredAt: "3 days ago",
      status: "cancelled",
      verified: true,
    },
  ]

  const userCollections = [
    {
      name: "Surreal Post",
      collectionName: "NFT-Bloc",
      itemCount: 1,
      verified: true,
      image: "/placeholder.svg?height=300&width=300",
    },
  ]

  const userActivities = [
    {
      type: "Bid & Offer",
      subtype: "Buy Offer",
      item: "Red car",
      collection: "Tales of Ragnarok",
      price: "1.13 BUSD",
      usdPrice: "$366.86",
      from: "Cimmy",
      to: "0xhg34...nGj2",
      date: "5 minutes ago",
      verified: true,
    },
    {
      type: "Bid & Offer",
      subtype: "Buy Offer",
      item: "Red car",
      collection: "Tales of Ragnarok",
      price: "0.93 BUSD",
      usdPrice: "$349.18",
      from: "TheElerking",
      to: "0xhg34...nGj2",
      date: "1 hours ago",
      verified: true,
    },
    {
      type: "Bid & Offer",
      subtype: "Buy Offer",
      item: "Maxido",
      collection: "Abstract",
      price: "0.85 BUSD",
      usdPrice: "$331.54",
      from: "0xgj32...el21",
      to: "0xhg34...nGj2",
      date: "4 hours ago",
      verified: true,
    },
    {
      type: "Listing",
      subtype: "As fixed price",
      item: "Red car",
      collection: "Tales of Ragnarok",
      price: "0.77 BUSD",
      usdPrice: "$318.24",
      from: "TheElerking",
      to: "-",
      date: "5 hours ago",
      verified: true,
    },
    {
      type: "Bid & Offer",
      subtype: "Cancelled",
      item: "Maxido",
      collection: "Abstract",
      price: "0.72 BUSD",
      usdPrice: "$309.45",
      from: "0xgj32...el21",
      to: "0xhg34...nGj2",
      date: "7 hours ago",
      verified: true,
    },
    {
      type: "Listing",
      subtype: "As fixed price",
      item: "Maxido",
      collection: "Abstract",
      price: "0.64 BUSD",
      usdPrice: "$265.22",
      from: "0xhg34...nGj2",
      to: "-",
      date: "A day ago",
      verified: true,
    },
    {
      type: "Listing",
      subtype: "Expired",
      item: "Impostors Genesis",
      collection: "Abstract",
      price: "0.91 BUSD",
      usdPrice: "$397.85",
      from: "TheElerking",
      to: "-",
      date: "3 days ago",
      verified: true,
    },
    {
      type: "Listing",
      subtype: "As auction",
      item: "Impostors Genesis",
      collection: "Abstract",
      price: "1.00 BUSD",
      usdPrice: "$442.00",
      from: "TheElerking",
      to: "-",
      date: "3 days ago",
      verified: true,
    },
    {
      type: "Listing",
      subtype: "Expired",
      item: "Titicinizen",
      collection: "Doodle Apes",
      price: "0.75 BUSD",
      usdPrice: "$331.55",
      from: "0xhg34...nGj2",
      to: "-",
      date: "3 days ago",
      verified: true,
    },
    {
      type: "Listing",
      subtype: "As auction",
      item: "Titicinizen",
      collection: "Doodle Apes",
      price: "0.75 BUSD",
      from: "0xhg34...nGj2",
      to: "-",
      date: "3 days ago",
      verified: true,
    },
  ]

  const selectedOption = filterOptions.find((option) => option.value === filterBy)

  const [offerPage, setOfferPage] = useState(1)
  const offerPageSize = 10
  const paginatedReceivedOffers = receivedOffers.slice((offerPage - 1) * offerPageSize, offerPage * offerPageSize)

  const searchParams = useSearchParams();

  // Switch to items tab if ?tab=items or #items is present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const tabParam = searchParams?.get("tab")
      if (tabParam === "items" || window.location.hash === "#items") {
        setActiveTab("items")
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch all owned liquidIds on mount or address change
  useEffect(() => {
    async function fetchLiquidIds() {
      if (!profile.address || !isConnected) return;
      setLoading(true)
      setError(null)
      try {
        let provider: ethers.BrowserProvider | ethers.JsonRpcProvider;
        if (typeof window !== "undefined" && (window as any).ethereum) {
          provider = new ethers.BrowserProvider((window as any).ethereum);
        } else {
          provider = new ethers.JsonRpcProvider("https://testnet-rpc.plume.org");
        }
        const contract = new ethers.Contract(LIQUIDID_ADDRESS, LIQUIDID_ABI, provider);
        const ids = await contract.getOwnerAssets(profile.address);
        setLiquidIds(ids.map((id: any) => id.toString()));
        setUserAssets([]);
        setHasMore(true);
      } catch (err: any) {
        setError(err.message || "Failed to fetch your assets");
      } finally {
        setLoading(false);
      }
    }
    fetchLiquidIds();
  }, [profile.address, isConnected]);

  // Fetch first PAGE_SIZE assets when liquidIds change
  useEffect(() => {
    async function fetchInitialAssets() {
      if (liquidIds.length === 0) return;
      setLoading(true);
      setError(null);
      try {
        let provider: ethers.BrowserProvider | ethers.JsonRpcProvider;
        if (typeof window !== "undefined" && (window as any).ethereum) {
          provider = new ethers.BrowserProvider((window as any).ethereum);
        } else {
          provider = new ethers.JsonRpcProvider("https://testnet-rpc.plume.org");
        }
        const contract = new ethers.Contract(LIQUIDID_ADDRESS, LIQUIDID_ABI, provider);
        const idsToFetch = liquidIds.slice(0, PAGE_SIZE);
        const assets = await Promise.all(idsToFetch.map((id: string) => contract.getAsset(id)));
        setUserAssets(assets);
        setHasMore(liquidIds.length > PAGE_SIZE);
      } catch (err: any) {
        setError(err.message || "Failed to fetch your assets");
      } finally {
        setLoading(false);
      }
    }
    fetchInitialAssets();
  }, [liquidIds]);

  // Load more handler
  const handleLoadMore = async () => {
    setFetchingMore(true);
    setError(null);
    try {
      let provider: ethers.BrowserProvider | ethers.JsonRpcProvider;
      if (typeof window !== "undefined" && (window as any).ethereum) {
        provider = new ethers.BrowserProvider((window as any).ethereum);
      } else {
        provider = new ethers.JsonRpcProvider("https://testnet-rpc.plume.org");
      }
      const contract = new ethers.Contract(LIQUIDID_ADDRESS, LIQUIDID_ABI, provider);
      const start = userAssets.length;
      const idsToFetch = liquidIds.slice(start, start + PAGE_SIZE);
      const assets = await Promise.all(idsToFetch.map((id: string) => contract.getAsset(id)));
      setUserAssets(prev => [...prev, ...assets]);
      setHasMore(start + assets.length < liquidIds.length);
    } catch (err: any) {
      setError(err.message || "Failed to fetch more assets");
    } finally {
      setFetchingMore(false);
    }
  }

  return (
    <div className="py-8 space-y-8">
      {/* Navigation Tabs */}
      <div className="flex items-center justify-center space-x-8 border-b border-gray-800">
        <button
          onClick={() => setActiveTab("on-sale")}
          className={`pb-4 px-2 transition-colors ${activeTab === "on-sale" ? "border-b-2 border-green-500 text-white" : "text-gray-400 hover:text-white"
            }`}
        >
          On Sale
        </button>
        <button
          onClick={() => setActiveTab("items")}
          className={`pb-4 px-2 transition-colors ${activeTab === "items" ? "border-b-2 border-green-500 text-white" : "text-gray-400 hover:text-white"
            }`}
        >
          Items
        </button>
        <button
          onClick={() => setActiveTab("collections")}
          className={`pb-4 px-2 transition-colors ${activeTab === "collections" ? "border-b-2 border-green-500 text-white" : "text-gray-400 hover:text-white"
            }`}
        >
          Collections
        </button>
        <button
          onClick={() => setActiveTab("offers")}
          className={`pb-4 px-2 transition-colors ${activeTab === "offers" ? "border-b-2 border-green-500 text-white" : "text-gray-400 hover:text-white"
            }`}
        >
          Offers
        </button>
        <button
          onClick={() => setActiveTab("activities")}
          className={`pb-4 px-2 transition-colors ${activeTab === "activities" ? "border-b-2 border-green-500 text-white" : "text-gray-400 hover:text-white"
            }`}
        >
          Activities
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-end space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 min-w-[150px] justify-between"
            >
              <span>{selectedOption?.label || "All"}</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white min-w-[150px]">
            {filterOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setFilterBy(option.value)}
                className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer flex items-center justify-between"
              >
                <span className={filterBy === option.value ? "text-green-400" : "text-white"}>{option.label}</span>
                {filterBy === option.value && <Check className="w-4 h-4 text-green-400" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm" className="border-gray-700">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {activeTab === "on-sale" && (
        <div className="space-y-6">
          {/* On Sale Sub-tabs */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <button
                onClick={() => setOnSaleTab("buy-now")}
                className={`pb-2 transition-colors ${onSaleTab === "buy-now" ? "border-b-2 border-green-500 text-white" : "text-gray-400 hover:text-white"
                  }`}
              >
                Buy now
              </button>
              <button
                onClick={() => setOnSaleTab("auctions")}
                className={`pb-2 transition-colors ${onSaleTab === "auctions" ? "border-b-2 border-green-500 text-white" : "text-gray-400 hover:text-white"
                  }`}
              >
                Auctions
              </button>
              <button
                onClick={() => setOnSaleTab("bids")}
                className={`pb-2 transition-colors ${onSaleTab === "bids" ? "border-b-2 border-green-500 text-white" : "text-gray-400 hover:text-white"
                  }`}
              >
                Bids
              </button>
              <button
                onClick={() => setOnSaleTab("ended")}
                className={`pb-2 transition-colors ${onSaleTab === "ended" ? "border-b-2 border-green-500 text-white" : "text-gray-400 hover:text-white"
                  }`}
              >
                Ended
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 min-w-[140px] justify-between"
                  >
                    <span>All Networks</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white min-w-[140px]">
                  <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer">
                    All Networks
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer">
                    Ethereum
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer">
                    Polygon
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {onSaleTab === "ended" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 min-w-[160px] justify-between"
                    >
                      <span>Recently Ended</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white min-w-[160px]">
                    <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer">
                      Recently Ended
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer">
                      Oldest First
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Buy Now Tab Content */}
          {onSaleTab === "buy-now" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {buyNowNFTs.map((nft, index) => (
                <Card
                  key={index}
                  className="bg-[#232524] border-none rounded-2xl overflow-hidden shadow-none transition-colors cursor-pointer group"
                >
                  <CardContent className="p-0">
                    {/* Image area */}
                    <div className="aspect-[1/1] bg-[#2B2C2B] w-full flex items-center justify-center" />

                    {/* Card bottom content */}
                    <div className="bg-[#191A19] px-5 pt-4 pb-5 space-y-3">
                      {/* Collection name with verified badge and currency icon */}
                      <div className="flex items-center">
                        <span className="text-[13px] text-[#7C7C7C]">{nft.collection}</span>
                        {nft.verified && (
                          <span className="ml-2 flex items-center justify-center w-5 h-5 rounded-full bg-[#A3FF8B]">
                            <Check className="w-3 h-3 text-black" />
                          </span>
                        )}
                        <span className="ml-auto flex items-center justify-center w-6 h-6 rounded-full bg-[#FF5C2A]">
                          <Image src="/images/pusd.svg" alt="PUSD" width={100} height={100} className="w-6 h-6" />
                        </span>
                      </div>
                      {/* NFT name */}
                      <div>
                        <h3 className="font-semibold text-[18px] text-white leading-tight">{nft.name}</h3>
                      </div>
                      {/* Price */}
                      <div>
                        <span className="block text-xs text-[#7C7C7C] mb-1">Price</span>
                        <span className="block text-[17px] font-semibold text-white">{nft.price.replace("BUSD", "PUSD")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Auctions Tab Content */}
          {onSaleTab === "auctions" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {auctionNFTs.map((nft, index) => (
                <NftCard key={index} nft={nft} index={index} />
              ))}
            </div>
          )}

          {/* Bids Tab Content */}
          {onSaleTab === "bids" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {bidNFTs.map((nft, index) => (
                <NftCard key={index} nft={nft} index={index} />
              ))}
            </div>
          )}

          {/* Ended Tab Content */}
          {onSaleTab === "ended" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {endedNFTs.map((nft, index) => (
                <NftCard key={index} nft={nft} index={index} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "offers" && (
        <div className="space-y-6">
          {/* Offers Sub-tabs */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <button
                onClick={() => setOffersTab("offered")}
                className={`pb-2 transition-colors ${offersTab === "offered" ? "border-b-2 border-green-500 text-white" : "text-gray-400 hover:text-white"
                  }`}
              >
                Offered
              </button>
              <button
                onClick={() => setOffersTab("received")}
                className={`pb-2 transition-colors ${offersTab === "received" ? "border-b-2 border-green-500 text-white" : "text-gray-400 hover:text-white"
                  }`}
              >
                Received
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 min-w-[140px] justify-between"
                  >
                    <span>All Networks</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white min-w-[140px]">
                  <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer">
                    All Networks
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer">
                    Ethereum
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer">
                    Polygon
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 min-w-[160px] justify-between"
                  >
                    <span>Recently Ended</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white min-w-[160px]">
                  <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer">
                    Recently Ended
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer">
                    Oldest First
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Offers Table */}
          <Card className="bg-transparent border-gray-800">
            <CardContent className="p-6">
              {/* Table Header */}
              <div className="grid grid-cols-5 gap-4 px-4 py-2 text-sm text-gray-400 border-b border-gray-800">
                <div>Items</div>
                <div>Price</div>
                <div>{offersTab === "received" ? "To" : "From"}</div>
                <div>Offered at</div>
                <div>Action</div>
              </div>

              {/* Offers List */}
              <div className="space-y-2">
                {(offersTab === "received" ? receivedOffers : offeredOffers).map((offer, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-5 gap-4 items-center py-3 px-4 hover:bg-gray-800/50 rounded-lg transition-colors"
                  >
                    {/* Items */}
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-700 rounded-lg flex-shrink-0"></div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400">{offer.collection}</span>
                          {offer.verified && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                        </div>
                        <h4 className="font-semibold text-white text-sm">{offer.name}</h4>
                      </div>
                    </div>

                    {/* Price */}
                    <div>
                      <div className="font-semibold text-white text-sm">{offer.price}</div>
                      <div className="text-xs text-gray-400">{offer.usdPrice}</div>
                    </div>

                    {/* From/To */}
                    <div className="text-sm text-gray-300">
                      {offersTab === "received"
                        ? (offer as { to: string }).to
                        : (offer as { from: string }).from}
                    </div>

                    {/* Offered at */}
                    <div className="text-sm text-gray-400">{offer.offeredAt}</div>

                    {/* Action */}
                    <div>
                      {offer.status === "success" && <Badge className="bg-green-500 text-black text-xs">Success</Badge>}
                      {offer.status === "cancelled" && (
                        <Badge className="bg-gray-500 text-white text-xs">Cancelled</Badge>
                      )}
                      {offer.status === "pending" && <div className="text-sm text-gray-400">-</div>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center items-center space-x-2 mt-4">
                <Button onClick={() => setOfferPage(offerPage - 1)} disabled={offerPage === 1}>{"<"}</Button>
                {[...Array(5)].map((_, i) => (
                  <Button
                    key={i}
                    variant={offerPage === i + 1 ? "default" : "outline"}
                    onClick={() => setOfferPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <span>...</span>
                <Button onClick={() => setOfferPage(offerPage + 1)}>{">"}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Collections Tab */}
      {activeTab === "collections" && (
        <div className="space-y-6">
          {/* Collections Filter */}
          <div className="flex items-center justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 min-w-[140px] justify-between"
                >
                  <span>All Networks</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white min-w-[140px]">
                <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer">
                  All Networks
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer">
                  Ethereum
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer">
                  Polygon
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Collections Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {userCollections.map((collection, index) => (
              <Card
                key={index}
                className="bg-gray-900 border-gray-800 hover:border-green-500/50 transition-colors cursor-pointer group"
              >
                <CardContent className="p-0">
                  <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-t-lg flex items-center justify-center relative">
                    {/* Hexagonal placeholder */}
                    <div className="w-20 h-20 bg-gray-600 rounded-lg transform rotate-45"></div>
                  </div>

                  <div className="p-4 space-y-3">
                    {/* Collection info */}
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">{collection.collectionName}</span>
                      {collection.verified && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                      <div className="ml-auto">
                        <div className="w-4 h-4 bg-yellow-500 rounded flex items-center justify-center">
                          <span className="text-xs">⚡</span>
                        </div>
                      </div>
                    </div>

                    {/* Collection name */}
                    <h3 className="font-bold text-lg">{collection.name}</h3>

                    {/* Item count */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold">{collection.itemCount}</span>
                      <div className="w-4 h-4 bg-gray-600 rounded flex items-center justify-center">
                        <span className="text-xs">📦</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Activities Tab */}
      {activeTab === "activities" && (
        <div className="space-y-6">
          {/* Activities Filters */}
          <div className="flex items-center justify-end space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 min-w-[140px] justify-between"
                >
                  <span>All Networks</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white min-w-[140px]">
                <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer">
                  All Networks
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer">
                  Ethereum
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer">
                  Polygon
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 min-w-[100px] justify-between"
                >
                  <span>All</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white min-w-[100px]">
                <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer">All</DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer">
                  Sales
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer">
                  Listings
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer">
                  Offers
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Activities Table */}
          <ActivitiesTable activityFilter={activitiesFilter} />
        </div>
      )}

      {/* Content Grid */}
      {activeTab === "items" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading && <div className="col-span-full text-center">Loading your assets...</div>}
          {error && <div className="col-span-full text-center text-red-500">{error}</div>}
          {!loading && !error && userAssets.length === 0 && (
            <div className="col-span-full text-center">No assets found.</div>
          )}
          {!loading && !error && userAssets.map((asset: any, index: number) => (
            <NftCardProfile
              key={index}
              nft={{
                name: `NFT #${asset.liquidId}`,
                image: "/placeholder.svg?height=200&width=200",
                collectionName: asset.projectToken || "Plato",
                verified: true
              }}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {activeTab === "items" && (
        <div className="text-center mt-6">
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
      )}
    </div>
  )
}
