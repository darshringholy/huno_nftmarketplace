"use client"

import React, { useEffect, useState, use } from "react"
import { ethers } from "ethers"
import { LIQUIDID_ABI, LIQUIDID_ADDRESS } from "@/lib/liquidid"
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from "@/lib/marketplace"
import { Check } from "lucide-react"
import ActivitiesTable from "@/components/marketplace/discover/activities-table"
import { NftCardDiscover } from "@/components/ui/nft-card-discover"

const fallbackNftImages = [
  "https://hunosrent.com/images/upload/x_large_812cde03b32d22ea8ae243197c40da6f.jpeg",
  "https://hunosrent.com/images/upload/x_large_3d70b92d9bc26ddc2f73458d22e10edb.jpeg",
  "https://hunosrent.com/images/upload/x_large_7432ec080bddc7c1f782905c508d8ecc.jpeg",
  "https://hunosrent.com/images/upload/x_large_ea2c13a17bba344bda66ed77821c0bfb.jpeg"
]

// Mock collection data
const getCollectionData = (name: string) => ({
  id: "abstract",
  name: name || "Abstract",
  description: "Breathing Space joyfully brings the unique blend of DeFi, Collect-to-Earn and Play-to-Earn Abstract is known for to the Neo N3 ecosystem: the most feature-complete blockchain platform for building decentralized applications for the smart economy of tomorrow.",
  verified: true,
})

// Mock activities (filter by liquidId or name if needed)
const mockActivities = [
  {
    id: "1",
    type: "sale",
    subType: "Direct Sale",
    item: { name: "Breathing Space", image: fallbackNftImages[0], collection: "Abstract" },
    from: { name: "0x1234...5678", avatar: fallbackNftImages[1] },
    to: { name: "0x8765...4321", avatar: fallbackNftImages[2] },
    price: "0.75",
    usdPrice: "1,500",
    currency: "PUSD",
    time: "2 minutes ago",
    link: "#",
  },
  // ... more mock activities ...
]

export default function ItemDetailsPage({ params }: { params: any }) {
  const { liquidId } = use(params) as { liquidId: string }
  const [asset, setAsset] = useState<any>(null)
  const [listing, setListing] = useState<any>(null)
  const [image, setImage] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        let provider: ethers.BrowserProvider | ethers.JsonRpcProvider
        if (typeof window !== "undefined" && (window as any).ethereum) {
          provider = new ethers.BrowserProvider((window as any).ethereum)
        } else {
          provider = new ethers.JsonRpcProvider("https://testnet-rpc.plume.org")
        }
        const liquidIdContract = new ethers.Contract(LIQUIDID_ADDRESS, LIQUIDID_ABI, provider)
        const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider)
        const assetData = await liquidIdContract.getAsset(liquidId)
        setAsset(assetData)
        const listingData = await marketplaceContract.getListing(liquidId)
        setListing(listingData)
        let imageUri = ""
        try {
          imageUri = await liquidIdContract.imageURI(liquidId)
        } catch {}
        if (!imageUri || typeof imageUri !== 'string' || !imageUri.startsWith('http')) {
          const fallbackIndex = parseInt(liquidId, 10) % fallbackNftImages.length
          setImage(fallbackNftImages[fallbackIndex])
        } else {
          setImage(imageUri)
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch item details")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [liquidId])

  if (loading) return <div className="container mx-auto py-8 text-center">Loading...</div>
  if (error) return <div className="container mx-auto py-8 text-center text-red-500">{error}</div>

  const collection = getCollectionData(asset?.collectionName || "Abstract")
  const price = listing ? ethers.formatUnits(listing.price, 18) : "-"
  const owner = asset?.owner || "-"
  const liquidity = "70%" // Placeholder for liquidity
  const liquidityAddress = owner

  // Mock related items (replace with real fetch later)
  const relatedFromAbstract = [1,2,3,4].map(i => ({
    name: `Abstract NFT #${i}`,
    image: fallbackNftImages[i % fallbackNftImages.length],
    collectionName: collection.name,
    verified: true,
    price: price,
    isPriceLoading: false,
    liquidId: `${parseInt(liquidId) + i}`
  }))
  const relatedFromSeller = [1,2,3,4].map(i => ({
    name: `Seller NFT #${i}`,
    image: fallbackNftImages[(i+1) % fallbackNftImages.length],
    collectionName: collection.name,
    verified: true,
    price: price,
    isPriceLoading: false,
    liquidId: `${parseInt(liquidId) + 10 + i}`
  }))

  return (
    <div className="w-full min-h-screen bg-[#111211] text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: Image and Price/Buy Card */}
          <div className="flex flex-col gap-6 w-full md:w-[420px]">
            <div className="bg-[#232423] rounded-2xl flex items-center justify-center min-h-[340px] h-[340px]">
              {image && <img src={image} alt={asset?.name || "NFT image"} className="rounded-2xl max-h-[320px] object-contain" />}
            </div>
            {/* Price/Buy Card */}
            <div className="bg-[#181918] rounded-2xl p-6 flex flex-col gap-4 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-gray-400 text-sm">Price</div>
                  <div className="text-2xl font-bold text-white">{price} PUSD</div>
                  <div className="text-xs text-gray-400 mt-1">$327.54</div> {/* Placeholder USD */}
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-green-400 font-semibold cursor-pointer">Make Offer</span>
                  <span className="text-xs text-gray-400">to buy at another price</span>
                </div>
              </div>
              <button className="bg-lime-400 text-black font-bold py-3 rounded-xl text-lg mt-2">Buy Now</button>
            </div>
          </div>
          {/* Right: Details */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Title and Header Row */}
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold mb-1">{asset?.name || `NFT #${liquidId}`}</h1>
              <div className="flex items-center gap-6 mb-2">
                {/* Collection */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">Collection</span>
                  <span className="text-white font-semibold text-base flex items-center gap-1">
                    {collection.name}
                    {collection.verified && <span className="w-5 h-5 flex items-center justify-center rounded-full bg-lime-400"><Check className="w-3 h-3 text-black" /></span>}
                  </span>
                </div>
                {/* Owner */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">Owner</span>
                  <span className="text-white font-semibold text-base">{owner.slice(0, 6)}...{owner.slice(-4)}</span>
                </div>
                {/* Liquidity */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">Liquidity</span>
                  <span className="text-white font-semibold text-base">{liquidity}</span>
                  <span className="text-white font-semibold text-base">{liquidityAddress.slice(0, 6)}...{liquidityAddress.slice(-4)}</span>
                </div>
              </div>
              <div className="text-gray-400 text-base mb-2">{collection.description}</div>
            </div>
            {/* Tabs */}
            <div className="flex gap-2 mb-2">
              {['Items', 'Offers', 'Bids', 'Rewards', 'Info'].map(tab => (
                <button
                  key={tab}
                  className={`px-6 py-2 rounded-lg font-semibold text-base ${tab === 'Info' ? 'bg-white text-black' : 'bg-[#181918] text-white'} transition-colors`}
                >
                  {tab}
                </button>
              ))}
            </div>
            {/* Info Box */}
            <div className="bg-[#181918] rounded-2xl p-6 flex flex-col gap-2 w-full max-w-lg">
              <div className="flex items-center justify-between text-gray-400 text-base mb-1">
                <span>Contract</span>
                <span className="text-white flex items-center gap-1 cursor-pointer">{LIQUIDID_ADDRESS.slice(0, 6)}...{LIQUIDID_ADDRESS.slice(-4)} <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M14 3h7v7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 19l16-16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
              </div>
              <div className="flex items-center justify-between text-gray-400 text-base mb-1">
                <span>Token ID</span>
                <span className="text-white flex items-center gap-1 cursor-pointer">{liquidId} <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M14 3h7v7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 19l16-16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
              </div>
              <div className="flex items-center justify-between text-gray-400 text-base mb-1">
                <span>Token Standard</span>
                <span className="text-white">ERC20</span>
              </div>
              <div className="flex items-center justify-between text-gray-400 text-base mb-1">
                <span>Blockchain</span>
                <span className="text-white">Plume</span>
              </div>
              <div className="flex items-center justify-between text-gray-400 text-base mb-1">
                <span>Metadata</span>
                <span className="text-white flex items-center gap-1 cursor-pointer">Centralized <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M14 3h7v7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 19l16-16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
              </div>
              <div className="mt-2 text-xs text-green-400 cursor-pointer">You can <span className="font-semibold">Report any problem</span> you find.</div>
            </div>
          </div>
        </div>
        {/* Activities Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Activities</h2>
          <ActivitiesTable activityFilter="all" liquidId={liquidId} />
        </div>
        {/* More from Abstract */}
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4">More from Abstract</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedFromAbstract.map((nft, i) => (
              <NftCardDiscover key={nft.liquidId} nft={nft} index={i} />
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <button className="border border-lime-400 text-lime-400 px-4 py-2 rounded-lg">View More</button>
          </div>
        </div>
        {/* More from the seller */}
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4">More from the seller</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedFromSeller.map((nft, i) => (
              <NftCardDiscover key={nft.liquidId} nft={nft} index={i} />
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <button className="border border-lime-400 text-lime-400 px-4 py-2 rounded-lg">View More</button>
          </div>
        </div>
      </div>
    </div>
  )
} 