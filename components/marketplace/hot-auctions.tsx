"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import NftCard from "../ui/nft-card"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from "@/lib/marketplace"
import { LIQUIDID_ABI, LIQUIDID_ADDRESS } from "@/lib/liquidid"

const fallbackNftImages = [
  "https://hunosrent.com/images/upload/x_large_812cde03b32d22ea8ae243197c40da6f.jpeg",
  "https://hunosrent.com/images/upload/x_large_3d70b92d9bc26ddc2f73458d22e10edb.jpeg",
  "https://hunosrent.com/images/upload/x_large_7432ec080bddc7c1f782905c508d8ecc.jpeg",
  "https://hunosrent.com/images/upload/x_large_ea2c13a17bba344bda66ed77821c0bfb.jpeg"
]

// Helper to resolve IPFS URI to gateway URL
const resolveIpfs = (uri: string) => {
  if (!uri) return null;
  if (uri.startsWith("ipfs://")) {
    const hash = uri.replace("ipfs://", "");
    const gateways = [
      `https://gateway.pinata.cloud/ipfs/${hash}`,
      `https://ipfs.io/ipfs/${hash}`,
      `https://cloudflare-ipfs.com/ipfs/${hash}`,
      `https://dweb.link/ipfs/${hash}`
    ];
    return gateways[0];
  }
  return uri;
};

// Helper to fetch metadata with retries and fallback gateways
const fetchMetadata = async (uri: string) => {
  if (!uri) return null;
  
  let url = resolveIpfs(uri);
  if (!url) return null;
  
  if (uri.startsWith("ipfs://")) {
    const hash = uri.replace("ipfs://", "");
    const gateways = [
      `https://gateway.pinata.cloud/ipfs/${hash}`,
      `https://ipfs.io/ipfs/${hash}`,
      `https://cloudflare-ipfs.com/ipfs/${hash}`,
      `https://dweb.link/ipfs/${hash}`
    ];
    
    for (const gateway of gateways) {
      try {
        const response = await fetch(gateway);
        if (response.ok) {
          return await response.json();
        }
      } catch (err) {
        continue;
      }
    }
  } else {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      // Handle error
    }
  }
  
  return null;
};

interface AuctionData {
  liquidId: string;
  name: string;
  price: string;
  timeLeft: string;
  image: string;
  endTime: number;
  currentBid: string;
}

export default function HotAuctions() {
  const [hotAuctions, setHotAuctions] = useState<AuctionData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHotAuctions = async () => {
      try {
        setLoading(true)
        
        // Connect to blockchain
        let provider: ethers.BrowserProvider | ethers.JsonRpcProvider
        if (typeof window !== "undefined" && (window as any).ethereum) {
          provider = new ethers.BrowserProvider((window as any).ethereum)
        } else {
          provider = new ethers.JsonRpcProvider("https://testnet-rpc.plume.org")
        }
        
        const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider)
        const liquidIdContract = new ethers.Contract(LIQUIDID_ADDRESS, LIQUIDID_ABI, provider)
        
        // Fetch all sales
        const batchSize = 50
        let from = 0
        let hasMore = true
        const allAuctions: AuctionData[] = []
        
        while (hasMore && allAuctions.length < 20) {
          try {
            const sales = await marketplaceContract.getSaleArray(from, batchSize)
            
            for (const sale of sales) {
              // Only include active auctions (sellType = 1)
              if (sale && sale.isActive && sale.sellType.toString() === "1") {
                const endTime = Number(sale.endTime)
                const now = Math.floor(Date.now() / 1000)
                
                // Only include auctions that haven't ended yet
                if (endTime > now) {
                  try {
                    // Get asset data
                    const assetData = await liquidIdContract.getAsset(sale.liquidId.toString())
                    
                    // Fetch metadata
                    let meta = null
                    try {
                      meta = await fetchMetadata(assetData.metadataURI)
                    } catch (err) {
                      console.log("Error fetching metadata for", sale.liquidId.toString())
                    }
                    
                    // Get image
                    let imageUri = meta?.image || ""
                    if (imageUri && imageUri.startsWith("ipfs://")) {
                      imageUri = resolveIpfs(imageUri) || ""
                    }
                    
                    if (!imageUri || typeof imageUri !== 'string' || !imageUri.startsWith('http')) {
                      const fallbackIndex = parseInt(sale.liquidId.toString(), 10) % fallbackNftImages.length
                      imageUri = fallbackNftImages[fallbackIndex]
                    }
                    
                    // Calculate time left
                    const timeLeft = endTime - now
                    const hours = Math.floor(timeLeft / 3600)
                    const minutes = Math.floor((timeLeft % 3600) / 60)
                    const seconds = timeLeft % 60
                    const timeLeftString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
                    
                    // Get current bid price
                    const currentBid = sale.currentBid ? ethers.formatUnits(sale.currentBid, 18) : ethers.formatUnits(sale.startingPrice, 18)
                    
                    allAuctions.push({
                      liquidId: sale.liquidId.toString(),
                      name: meta?.name || `LID #${sale.liquidId}`,
                      price: `${currentBid} HUNOS`,
                      timeLeft: timeLeftString,
                      image: imageUri,
                      endTime: endTime,
                      currentBid: currentBid
                    })
                  } catch (err) {
                    console.log("Error processing auction", sale.liquidId.toString(), err)
                  }
                }
              }
            }
            
            from += batchSize
            hasMore = sales.length === batchSize
          } catch (err) {
            console.log("Error fetching sales batch:", err)
            hasMore = false
          }
        }
        
        // Sort by "hotness" - prioritize auctions ending soon and with higher bids
        const sortedAuctions = allAuctions.sort((a, b) => {
          const aTimeLeft = a.endTime - Math.floor(Date.now() / 1000)
          const bTimeLeft = b.endTime - Math.floor(Date.now() / 1000)
          
          // First priority: time left (ending soon = hotter)
          if (Math.abs(aTimeLeft - bTimeLeft) > 3600) { // 1 hour difference
            return aTimeLeft - bTimeLeft
          }
          
          // Second priority: bid amount (higher bids = hotter)
          const aBid = parseFloat(a.currentBid)
          const bBid = parseFloat(b.currentBid)
          return bBid - aBid
        })
        
        // Take top 4 auctions
        setHotAuctions(sortedAuctions.slice(0, 4))
        
      } catch (error) {
        console.error("Error fetching hot auctions:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchHotAuctions()
  }, [])

  if (loading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold">Hot Auction</h2>
          <Link href="/auctions">
            <Button variant="ghost" className="text-green-400 hover:text-green-300">
              View All
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-800 rounded-lg h-64"></div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold">Hot Auction</h2>
        <Link href="/marketplace/discover?tab=auctions">
          <Button variant="ghost" className="text-green-400 hover:text-green-300">
            View All
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {hotAuctions.length > 0 ? (
          hotAuctions.map((auction, index) => (
            <NftCard key={auction.liquidId} nft={auction} index={index} />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-400 py-8">
            No active auctions found.
          </div>
        )}
      </div>
    </section>
  )
}
