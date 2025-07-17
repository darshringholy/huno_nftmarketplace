"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import CollectionCard from "@/components/marketplace/collection/collection-card"
import { Filter, ChevronDown, Check, ExternalLink } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"
import NftCard from "../ui/nft-card"
import ActivitiesTable from "../marketplace/discover/activities-table"
import { ethers } from "ethers"
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from "@/lib/marketplace"
import { useWallet } from "@/hooks/use-wallet"
import { LIQUIDID_ABI, LIQUIDID_ADDRESS } from "@/lib/liquidid"
import { useRouter, useSearchParams } from "next/navigation"
import { NftCardProfile } from "@/components/ui/nft-card-profile"
import { useCallback } from "react"

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
  profile: Profile;
  defaultTab?: string;
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

export default function ProfileContent({ profile, defaultTab }: ProfileContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(defaultTab || "items");
  useEffect(() => {
    if (defaultTab) setActiveTab(defaultTab);
  }, [defaultTab]);
  const [filterBy, setFilterBy] = useState("all")
  const [userAssets, setUserAssets] = useState<any[]>([])
  const [liquidIds, setLiquidIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingMore, setFetchingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const PAGE_SIZE = 4
  const { isConnected, address } = useWallet();

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

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`?${params.toString()}`);
  };

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

  // State for user collections
  const [userCollections, setUserCollections] = useState<any[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [collectionsError, setCollectionsError] = useState<string | null>(null);

  // Fetch collections when collections tab is active
  useEffect(() => {
    if (activeTab !== "collections" || !isConnected || !address) return;
    setCollectionsLoading(true);
    setCollectionsError(null);
    fetch(`/api/collections?walletAddress=${address}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch collections");
        const { collections } = await res.json();
        setUserCollections(collections || []);
      })
      .catch((err) => setCollectionsError(err.message))
      .finally(() => setCollectionsLoading(false));
  }, [activeTab, isConnected, address]);

  // Helper to resolve IPFS URI to gateway URL
  const resolveIpfs = (uri: string) => {
    if (!uri) return null;
    if (uri.startsWith("ipfs://")) {
      return `https://gateway.pinata.cloud/ipfs/${uri.replace("ipfs://", "")}`;
    }
    return uri;
  };

  // Fetch metadata for each asset and cache it
  const [assetImages, setAssetImages] = useState<{ [liquidId: string]: string }>({});
  const [assetCollectionIds, setAssetCollectionIds] = useState<{ [liquidId: string]: string }>({});
  const [assetNames, setAssetNames] = useState<{ [liquidId: string]: string }>({});
  const [collectionNames, setCollectionNames] = useState<{ [collectionId: string]: string }>({});
  const fetchAssetImagesAndCollections = useCallback(async (assets: any[]) => {
    const imgUpdates: { [liquidId: string]: string } = {};
    const idUpdates: { [liquidId: string]: string } = {};
    const nameUpdates: { [liquidId: string]: string } = {};
    await Promise.all(assets.map(async (asset) => {
      if (!asset || !asset.liquidId || !asset.metadataURI) return;
      const url = resolveIpfs(asset.metadataURI);
      if (!url) {
        imgUpdates[asset.liquidId] = "/placeholder.svg?height=200&width=200";
        idUpdates[asset.liquidId] = "";
        nameUpdates[asset.liquidId] = "";
        return;
      }
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const meta = await res.json();
        let img = meta.image;
        if (img && img.startsWith("ipfs://")) img = resolveIpfs(img);
        imgUpdates[asset.liquidId] = img || "/placeholder.svg?height=200&width=200";
        idUpdates[asset.liquidId] = meta.collection || "";
        nameUpdates[asset.liquidId] = meta.name || "";
      } catch {
        imgUpdates[asset.liquidId] = "/placeholder.svg?height=200&width=200";
        idUpdates[asset.liquidId] = "";
        nameUpdates[asset.liquidId] = "";
      }
    }));
    setAssetImages(prev => ({ ...prev, ...imgUpdates }));
    setAssetCollectionIds(prev => ({ ...prev, ...idUpdates }));
    setAssetNames(prev => ({ ...prev, ...nameUpdates }));
  }, []);

  // Fetch collection names from API and cache them
  const fetchCollectionName = useCallback(async (collectionId: string) => {
    if (!collectionId || collectionNames[collectionId]) return;
    try {
      const res = await fetch(`/api/collections?id=${collectionId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.collection && data.collection.name) {
        setCollectionNames(prev => ({ ...prev, [collectionId]: data.collection.name }));
      }
    } catch {}
  }, [collectionNames]);

  useEffect(() => {
    if (userAssets.length > 0) fetchAssetImagesAndCollections(userAssets);
  }, [userAssets, fetchAssetImagesAndCollections]);

  // Fetch collection names for all collection IDs in assetCollectionIds
  useEffect(() => {
    const ids = Object.values(assetCollectionIds).filter(Boolean);
    ids.forEach(id => fetchCollectionName(id));
  }, [assetCollectionIds, fetchCollectionName]);

  return (
    <div className="py-8 space-y-8">
      {/* Navigation Tabs */}
      <div className="flex items-center justify-center space-x-8 border-b border-gray-800">
        <button
          onClick={() => handleTabClick("on-sale")}
          className={`pb-4 px-2 transition-colors ${activeTab === "on-sale" ? "border-b-2 border-green-500 text-white" : "text-gray-400 hover:text-white"
            }`}
        >
          On Sale
        </button>
        <button
          onClick={() => handleTabClick("items")}
          className={`pb-4 px-2 transition-colors ${activeTab === "items" ? "border-b-2 border-green-500 text-white" : "text-gray-400 hover:text-white"
            }`}
        >
          Items
        </button>
        <button
          onClick={() => handleTabClick("collections")}
          className={`pb-4 px-2 transition-colors ${activeTab === "collections" ? "border-b-2 border-green-500 text-white" : "text-gray-400 hover:text-white"
            }`}
        >
          Collections
        </button>
        <button
          onClick={() => handleTabClick("offers")}
          className={`pb-4 px-2 transition-colors ${activeTab === "offers" ? "border-b-2 border-green-500 text-white" : "text-gray-400 hover:text-white"
            }`}
        >
          Offers
        </button>
        <button
          onClick={() => handleTabClick("activities")}
          className={`pb-4 px-2 transition-colors ${activeTab === "activities" ? "border-b-2 border-green-500 text-white" : "text-gray-400 hover:text-white"
            }`}
        >
          Activities
        </button>
      </div>

      {/* Filters for Items Tab Only */}
      {activeTab === "items" && (
        <div className="flex items-center justify-end space-x-4 mb-6">
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

          <Button 
            variant="outline" 
            size="sm" 
            className="border-gray-700 bg-green-600 hover:bg-green-700 text-white"
            onClick={() => router.push('/marketplace/create-item')}
          >
            Create LID
          </Button>
        </div>
      )}

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
                          <Image src="/images/pUSD-token.svg" alt="PUSD" width={100} height={100} className="w-6 h-6" />
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
          {/* Collections Actions and Filter */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div></div> {/* Left spacer for alignment */}
            <div className="flex items-center gap-4">
              <Button
                className="bg-green-500 hover:bg-green-600 text-black font-semibold px-6 py-2"
                onClick={() => router.push("/marketplace/collections/create")}
              >
                Create Collection
              </Button>
              <Button variant="outline" className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black font-semibold px-6 py-2">
                Import Collections
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 min-w-[150px] justify-between"
                  >
                    <span>Recently Make</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white min-w-[150px]">
                  <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer">Recently Make</DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer">Oldest First</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Loading and error states */}
          {collectionsLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">Loading collections...</div>
          )}
          {collectionsError && (
            <div className="flex flex-col items-center justify-center py-16 text-red-500">{collectionsError}</div>
          )}

          {/* Collections Grid or Empty State */}
          {!collectionsLoading && !collectionsError && userCollections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 flex items-center justify-center bg-gray-800 rounded-full mb-4">
                <span className="text-3xl text-gray-500">🗑️</span>
              </div>
              <div className="text-gray-400 text-lg mb-2">No Collections Yet</div>
              <div className="text-gray-500 mb-4">Create or import a collection to get started.</div>
              <Button className="bg-green-500 hover:bg-green-600 text-black font-semibold px-6 py-2 mt-2">
                Create Collection
              </Button>
            </div>
          ) : (!collectionsLoading && !collectionsError && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {userCollections.map((collection, index) => (
                <CollectionCard
                  key={collection._id || index}
                  id={collection._id}
                  name={collection.name}
                  bannerUrl={collection.bannerUrl}
                  logoUrl={collection.logoUrl}
                  blockchain={collection.blockchain}
                  verified={collection.verified}
                  description={collection.description}
                />
              ))}
            </div>
          ))}
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
          {!loading && !error && userAssets.map((asset: any, index: number) => {
            // Determine collection name: fetch from API using collection id from metadata
            let collectionName = "Unknown Collection";
            const collectionId = assetCollectionIds[asset.liquidId];
            if (collectionId && collectionNames[collectionId]) {
              collectionName = collectionNames[collectionId];
            }
            const nftName = assetNames[asset.liquidId] || `NFT #${asset.liquidId}`;
            return (
              <NftCardProfile
                key={index}
                nft={{
                  name: nftName,
                  image: assetImages[asset.liquidId] || "/placeholder.svg?height=200&width=200",
                  collectionName,
                  verified: true
                }}
                index={index}
              />
            );
          })}
        </div>
      )}
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
  );
}