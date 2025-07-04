"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from "@/lib/marketplace"
import { LIQUIDID_ABI, LIQUIDID_ADDRESS } from "@/lib/liquidid"

const fallbackNftImages = [
  "https://hunosrent.com/images/upload/x_large_812cde03b32d22ea8ae243197c40da6f.jpeg",
  "https://hunosrent.com/images/upload/x_large_3d70b92d9bc26ddc2f73458d22e10edb.jpeg",
  "https://hunosrent.com/images/upload/x_large_7432ec080bddc7c1f782905c508d8ecc.jpeg",
  "https://hunosrent.com/images/upload/x_large_ea2c13a17bba344bda66ed77821c0bfb.jpeg"
]

export function useDiscoverNfts({ pageSize = 12, offset = 0 } = {}) {
  const [nftItems, setNftItems] = useState<any[]>([])
  const [itemPrices, setItemPrices] = useState<{ [liquidId: string]: string }>({})
  const [itemImages, setItemImages] = useState<{ [liquidId: string]: string }>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        const listings = await contract.getListArray(offset, pageSize)
        setNftItems(listings)
        const prices: { [liquidId: string]: string } = {}
        const images: { [liquidId: string]: string } = {}
        await Promise.all(listings.map(async (nft: any, idx: number) => {
          const liquidId = nft.liquidId?.toString()
          try {
            const listing = await contract.getListing(nft.liquidId)
            prices[liquidId] = ethers.formatUnits(listing.price, 18)
          } catch {
            prices[liquidId] = "-"
          }
          try {
            const liquidIdContract = new ethers.Contract(LIQUIDID_ADDRESS, LIQUIDID_ABI, provider)
            const imageUri = await liquidIdContract.imageURI(nft.liquidId)
            if (!imageUri || typeof imageUri !== 'string' || !imageUri.startsWith('http')) {
              const fallbackIndex = idx % fallbackNftImages.length
              images[liquidId] = fallbackNftImages[fallbackIndex]
            } else {
              images[liquidId] = imageUri
            }
          } catch {
            const fallbackIndex = idx % fallbackNftImages.length
            images[liquidId] = fallbackNftImages[fallbackIndex]
          }
        }))
        setItemPrices(prices)
        setItemImages(images)
      } catch (err: any) {
        setError(err.message || "Failed to fetch listings")
      } finally {
        setLoading(false)
      }
    }
    fetchListings()
  }, [pageSize, offset])

  return { nftItems, itemPrices, itemImages, loading, error }
} 