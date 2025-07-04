"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Filter } from "lucide-react"
import Image from "next/image"
import NftCard from "../ui/nft-card"
import { useDiscoverNfts } from "@/hooks/use-discover-nfts"
import { NftCardDiscover } from "@/components/ui/nft-card-discover"
import { useState } from "react"
import React from "react"

const fallbackNftImages = [
  "https://hunosrent.com/images/upload/x_large_812cde03b32d22ea8ae243197c40da6f.jpeg",
  "https://hunosrent.com/images/upload/x_large_3d70b92d9bc26ddc2f73458d22e10edb.jpeg",
  "https://hunosrent.com/images/upload/x_large_7432ec080bddc7c1f782905c508d8ecc.jpeg",
  "https://hunosrent.com/images/upload/x_large_ea2c13a17bba344bda66ed77821c0bfb.jpeg"
]

const nfts = [
  { name: "Red car", price: "1.75 BUSD", timeLeft: "01:20:15", image: fallbackNftImages[0] },
  { name: "Anpaid", price: "1.75 BUSD", timeLeft: "01:20:15", image: fallbackNftImages[1] },
  { name: "Marvin", price: "1.75 BUSD", timeLeft: "01:20:15", image: fallbackNftImages[2] },
  { name: "Kalyptingo", price: "1.75 BUSD", timeLeft: "01:20:15", image: fallbackNftImages[3] },
  { name: "Red car", price: "1.75 BUSD", timeLeft: "01:20:15", image: fallbackNftImages[0] },
  { name: "Anpaid", price: "1.75 BUSD", timeLeft: "01:20:15", image: fallbackNftImages[1] },
  { name: "Marvin", price: "1.75 BUSD", timeLeft: "01:20:15", image: fallbackNftImages[2] },
  { name: "Kalyptingo", price: "1.75 BUSD", timeLeft: "01:20:15", image: fallbackNftImages[3] },
  { name: "Red car", price: "1.75 BUSD", timeLeft: "01:20:15", image: fallbackNftImages[0] },
  { name: "Anpaid", price: "1.75 BUSD", timeLeft: "01:20:15", image: fallbackNftImages[1] },
  { name: "Marvin", price: "1.75 BUSD", timeLeft: "01:20:15", image: fallbackNftImages[2] },
  { name: "Kalyptingo", price: "1.75 BUSD", timeLeft: "01:20:15", image: fallbackNftImages[3] },
]

export default function DiscoverSection() {
  const PAGE_SIZE = 12
  const [offset, setOffset] = useState(0)
  const [allItems, setAllItems] = useState<any[]>([])
  const [allImages, setAllImages] = useState<{ [liquidId: string]: string }>({})
  const [allPrices, setAllPrices] = useState<{ [liquidId: string]: string }>({})
  const [fetchingMore, setFetchingMore] = useState(false)
  const { nftItems, itemPrices, itemImages, loading, error } = useDiscoverNfts({ pageSize: PAGE_SIZE, offset })

  // Append new items when offset or nftItems change
  React.useEffect(() => {
    if (offset === 0) {
      setAllItems(nftItems)
      setAllImages(itemImages)
      setAllPrices(itemPrices)
    } else if (nftItems.length > 0) {
      setAllItems(prev => {
        const existingIds = new Set(prev.map(item => item.liquidId?.toString()))
        const newUnique = nftItems.filter(item => !existingIds.has(item.liquidId?.toString()))
        return [...prev, ...newUnique]
      })
      setAllImages(prev => ({ ...prev, ...itemImages }))
      setAllPrices(prev => ({ ...prev, ...itemPrices }))
    }
    // eslint-disable-next-line
  }, [offset, nftItems.length, Object.keys(itemImages).join(','), Object.keys(itemPrices).join(',')])

  const handleLoadMore = () => {
    setFetchingMore(true)
    setOffset(prev => prev + PAGE_SIZE)
    setTimeout(() => setFetchingMore(false), 1000) // Simulate loading, remove if real loading state is needed
  }

  return (
    <section>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0">
        <h2 className="text-xl md:text-2xl font-bold">Discover</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
          <select className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm w-full sm:w-auto">
            <option>Recently</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Most Popular</option>
          </select>
          <Button variant="outline" size="sm" className="border-gray-700 w-full text-green-300 sm:w-auto">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {loading && offset === 0 && <div className="text-center py-8">Loading NFT items...</div>}
      {error && <div className="text-center py-8 text-red-500">{error}</div>}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {allItems.map((nft, index) => {
            const liquidId = nft.liquidId?.toString()
            return (
              <NftCardDiscover
                key={liquidId + '-' + index}
                nft={{
                  name: `NFT #${nft.liquidId}`,
                  image: allImages[liquidId],
                  price: allPrices[liquidId],
                  isPriceLoading: false,
                  liquidId: liquidId,
                  collectionName: "Plato",
                  verified: true
                }}
                index={index}
              />
            )
          })}
        </div>
      )}

      <div className="text-center mt-6 md:mt-8">
        <Button
          variant="outline"
          className="border-gray-700 hover:border-green-500"
          onClick={handleLoadMore}
          disabled={fetchingMore || loading}
        >
          {fetchingMore ? "Loading..." : "Load more"}
        </Button>
      </div>
    </section>
  )
}
