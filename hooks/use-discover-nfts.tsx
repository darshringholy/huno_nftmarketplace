"use client"

import { useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from "@/lib/marketplace"
import { CONFIG } from "@/lib/config"
import { LIQUIDID_ABI, LIQUIDID_ADDRESS } from "@/lib/liquidid"

const fallbackLidImages = [
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

  const fetchSales = useCallback(async () => {
    if (!window.ethereum) {
      console.log("No wallet detected")
      return
    }

    try {
      setLoading(true)
      let provider: ethers.BrowserProvider | ethers.JsonRpcProvider

      if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum)
      } else {
        provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL)
      }
      const contract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider)
      const listings = await contract.getSaleArray(offset, pageSize)
      setNftItems(listings)
      const prices: { [liquidId: string]: string } = {}
      const images: { [liquidId: string]: string } = {}
      await Promise.all(listings.map(async (nft: any, idx: number) => {
        const liquidId = nft.liquidId?.toString()
        try {
          const listing = await contract.getSale(nft.liquidId)
          prices[liquidId] = ethers.formatUnits(listing.fixedPrice, 18)
        } catch {
          prices[liquidId] = "-"
        }
        try {
          const liquidIdContract = new ethers.Contract(LIQUIDID_ADDRESS, LIQUIDID_ABI, provider)
          const imageUri = await liquidIdContract.imageURI(nft.liquidId)
                    if (!imageUri || typeof imageUri !== 'string' || !imageUri.startsWith('http')) {
          const fallbackIndex = idx % fallbackLidImages.length
          images[liquidId] = fallbackLidImages[fallbackIndex]
        } else {
          images[liquidId] = imageUri
        }
      } catch {
        const fallbackIndex = idx % fallbackLidImages.length
        images[liquidId] = fallbackLidImages[fallbackIndex]
        }
      }))
      setItemPrices(prices)
      setItemImages(images)
    } catch (err: any) {
      setError(err.message || "Failed to fetch listings")
    } finally {
      setLoading(false)
    }
  }, [pageSize, offset])

  useEffect(() => {
    fetchSales()
  }, [fetchSales])

  return { nftItems, itemPrices, itemImages, loading, error }
} 