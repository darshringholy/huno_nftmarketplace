"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { ethers } from "ethers"
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from "@/lib/marketplace"
import { LIQUIDID_ABI, LIQUIDID_ADDRESS } from "@/lib/liquidid"

const partners = [
  { name: "Plume", logo: "/images/plume.svg", width: 100, height: 100 },
  { name: "Tesla", logo: "/images/tesla.svg", width: 100, height: 50 },
  { name: "Uber", logo: "/images/uber.svg", width: 60, height: 50 },
  { name: "Volkswagen", logo: "/images/volkswagen.svg", width: 100, height: 50 },
  { name: "Rooster Protocol", logo: "/images/rooster.svg", width: 100, height: 50 },
]

const fallbackLidImages = [
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
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }
  return uri;
};

// Helper to fetch metadata
const fetchMetadata = async (uri: string) => {
  if (!uri) return null;
  
  let url = resolveIpfs(uri);
  if (!url) return null;
  
  try {
    const response = await fetch(url);
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.log("Error fetching metadata:", err);
  }
  
  return null;
};

export default function MarketplaceSection() {
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch featured assets from marketplace
  useEffect(() => {
    const fetchFeaturedAssets = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const provider = new ethers.JsonRpcProvider("https://testnet-rpc.plume.org")
        const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider)
        const liquidIdContract = new ethers.Contract(LIQUIDID_ADDRESS, LIQUIDID_ABI, provider)
        
        // Get recent sales from marketplace
        const sales = await marketplaceContract.getSaleArray(0, 14)
        
        const featuredAssets = []
        
        for (const sale of sales) {
          if (!sale || !sale.isActive) continue
          
          try {
            // Get asset data
            const assetData = await liquidIdContract.getAsset(sale.liquidId.toString())
            
            if (!assetData || !assetData.isActive) continue
            
            // Fetch metadata
            let meta = null
            try {
              meta = await fetchMetadata(assetData.metadataURI)
            } catch (err) {
              console.log("Error fetching metadata:", err)
            }
            
            // Get image
            let imageUri = meta?.image || ""
            if (imageUri && imageUri.startsWith("ipfs://")) {
              imageUri = resolveIpfs(imageUri) || ""
            }
            
            if (!imageUri || typeof imageUri !== 'string' || !imageUri.startsWith('http')) {
              const fallbackIndex = parseInt(sale.liquidId.toString(), 10) % fallbackLidImages.length
              imageUri = fallbackLidImages[fallbackIndex]
            }
            
            // Get price
            const price = sale.sellType.toString() === "0" ? sale.fixedPrice : sale.startingPrice
            const formattedPrice = ethers.formatUnits(price, 18)
            
            featuredAssets.push({
              id: sale.liquidId.toString(),
              name: meta?.name || `LID #${sale.liquidId}`,
              rarity: "20%", // Placeholder rarity
              price: `${formattedPrice} PLUME`,
              image: imageUri,
            })
            
            if (featuredAssets.length >= 14) break
          } catch (err) {
            console.log("Error processing asset:", err)
            continue
          }
        }
        
        // If no sales found, create some placeholder assets
        if (featuredAssets.length === 0) {
          featuredAssets.push(...Array.from({ length: 14 }, (_, i) => ({
            id: i + 1,
            name: `LID #${i + 1}`,
            rarity: "20%",
            price: "372 PLUME",
            image: fallbackLidImages[i % fallbackLidImages.length],
          })))
        }
        
        setAssets(featuredAssets)
      } catch (err) {
        console.log("Error fetching featured assets:", err)
        setError("Failed to load featured assets")
        
        // Fallback to placeholder assets
        setAssets(Array.from({ length: 14 }, (_, i) => ({
          id: i + 1,
          name: `LID #${i + 1}`,
          rarity: "20%",
          price: "372 PLUME",
          image: fallbackLidImages[i % fallbackLidImages.length],
        })))
      } finally {
        setLoading(false)
      }
    }
    
    fetchFeaturedAssets()
  }, [])

  return (
    <section className="py-12 md:py-16 px-4 md:px-24" style={{ backgroundColor: "#090909" }}>
      <div className="container mx-auto">
        {/* Partner Logos */}
        <div className="relative overflow-hidden mb-12 md:mb-16 opacity-60">
          <div className="flex items-center justify-center space-x-12 md:space-x-16 lg:space-x-20">
            {partners.map((partner, idx) => (
              <div key={partner.name + idx} className="flex-shrink-0">
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={partner.width}
                  height={partner.height}
                  className="h-8 w-auto max-w-48 grayscale hover:grayscale-0 transition-all"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>
        {/* Marketplace Table */}
        <Card className="bg-transparent border-gray-800">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" className="text-white border-b-2 border-green-500 text-2xl">
                  Featured
                </Button>
                <Button variant="ghost" className="text-gray-400 text-2xl">
                  Top
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
                <select className="bg-transparent border border-gray-700 rounded-lg px-3 py-2 text-sm w-full sm:w-auto text-white">
                  <option value="24h" className="bg-black text-white">24h</option>
                  <option value="7d" className="bg-black text-white">7d</option>
                  <option value="30d" className="bg-black text-white">30d</option>
                </select>

                <div className="flex items-stretch rounded-lg border border-gray-700 overflow-hidden">
                  <div className="flex items-center px-4 py-2 bg-transparent">
                    <span className="text-sm text-white font-normal">All chains</span>
                  </div>
                  <div className="flex items-center justify-center px-4 bg-transparent border-l border-gray-700">
                    <img
                      src="/images/plume-logo.svg"
                      alt="Plume"
                      className="w-6 h-6"
                      draggable={false}
                    />
                  </div>
                </div>

                <Button variant="ghost" className="rounded-lg border border-gray-700 text-gray-400 text-sm" asChild>
                  <Link href="/marketplace/discover">View All</Link>
                </Button>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-8">
                <div className="text-gray-400">Loading featured assets...</div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-8">
                <div className="text-red-400">{error}</div>
              </div>
            )}

            {/* Desktop Table View */}
            {!loading && !error && (
              <div className="hidden md:grid grid-cols-2 gap-8">
              <div>
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-400 mb-4">
                  <span className="text-left">ASSETS</span>
                  <span className="text-left">RARITY</span>
                  <span className="text-left">PRICE</span>
                </div>

                {assets.slice(0, 7).map((asset, index) => (
                  <div
                    key={asset.id}
                    className="grid grid-cols-3 gap-4 items-center py-3 border-b border-gray-800 last:border-b-0 hover:bg-gray-800/20"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-400 text-sm">{index + 1}</span>
                      <img src={asset.image} alt={asset.name} className="w-10 h-10 rounded object-cover" />
                      <span className="text-sm text-gray-400">{asset.name}</span>
                    </div>
                    <span className="text-sm text-gray-400">{asset.rarity}</span>
                    <span className="text-sm text-gray-400 font-semibold">{asset.price}</span>
                  </div>
                ))}
              </div>

              <div>
                <div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-400 mb-4">
                    <span className="text-left">ASSETS</span>
                    <span className="text-left">RARITY</span>
                    <span className="text-left">PRICE</span>
                  </div>

                                  {assets.slice(7, 14).map((asset, index) => (
                  <div
                    key={asset.id}
                    className="grid grid-cols-3 gap-4 items-center py-3 border-b border-gray-800 last:border-b-0 hover:bg-gray-800/20"
                  >
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-400 text-sm">{index + 8}</span>
                        <img src={asset.image} alt={asset.name} className="w-10 h-10 rounded object-cover" />
                        <span className="text-sm text-gray-400">{asset.name}</span>
                      </div>
                      <span className="text-sm text-gray-400">{asset.rarity}</span>
                      <span className="text-sm text-gray-400 font-semibold">{asset.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            )}

            {/* Mobile Card View */}
            {!loading && !error && (
              <div className="md:hidden space-y-4">
                              {assets.slice(0, 6).map((asset, index) => (
                <div key={asset.id} className="bg-transparent border border-gray-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-gray-400 text-sm">#{index + 1}</span>
                    <img src={asset.image} alt={asset.name} className="w-12 h-12 rounded object-cover" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold">{asset.name}</h3>
                      <p className="text-xs text-gray-400">Rarity: {asset.rarity}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold">{asset.price}</span>
                    <Button size="sm" className="bg-green-500 hover:bg-green-600 text-black text-xs">
                      Buy
                    </Button>
                  </div>
                </div>
              ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </section >
  )
}
