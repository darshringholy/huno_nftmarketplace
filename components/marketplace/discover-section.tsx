"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Filter, ChevronDown, Check } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { NftCardDiscover } from "@/components/ui/nft-card-discover"
import { ethers } from "ethers"
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from "@/lib/marketplace"
import { LIQUIDID_ABI, LIQUIDID_ADDRESS } from "@/lib/liquidid"

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "ending-soon", label: "Ending Soon" },
]

// Sample fallback LID images
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

// Helper to validate JSON response
const isValidJsonResponse = async (response: Response) => {
  const text = await response.text();
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
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
        if (response.ok && await isValidJsonResponse(response.clone())) {
          return await response.json();
        }
      } catch (err) {
        continue;
      }
    }
  } else {
    try {
      const response = await fetch(url);
      if (response.ok && await isValidJsonResponse(response.clone())) {
        return await response.json();
      }
    } catch (err) {
      // Handle error
    }
  }
  
  return null;
};

export default function DiscoverSection() {
  const [sortBy, setSortBy] = useState("newest")
  const [nftItems, setNftItems] = useState<any[]>([])
  const [itemPrices, setItemPrices] = useState<{ [liquidId: string]: string }>({})
  const [loadingPrices, setLoadingPrices] = useState<{ [liquidId: string]: boolean }>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetchingMore, setFetchingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const PAGE_SIZE = 8 // Show fewer items on marketplace page
  const [itemImages, setItemImages] = useState<{ [liquidId: string]: string }>({})
  const [loadingImages, setLoadingImages] = useState<{ [liquidId: string]: boolean }>({})
  const [itemMetadata, setItemMetadata] = useState<{ [liquidId: string]: any }>({})
  const [loadingMetadata, setLoadingMetadata] = useState<{ [liquidId: string]: boolean }>({})
  const [collectionNames, setCollectionNames] = useState<{ [collectionId: string]: string }>({})
  const [saleTypes, setSaleTypes] = useState<{ [liquidId: string]: number | undefined }>({})
  const [endTimes, setEndTimes] = useState<{ [liquidId: string]: number | undefined }>({})

  const selectedSortOption = sortOptions.find((option) => option.value === sortBy)

  // Reusable function to fetch images, prices, and metadata for a list of items
  async function fetchImagesAndPricesForItems(items: any[]) {
    let provider: ethers.BrowserProvider | ethers.JsonRpcProvider
    if (typeof window !== "undefined" && (window as any).ethereum) {
      provider = new ethers.BrowserProvider((window as any).ethereum)
    } else {
      provider = new ethers.JsonRpcProvider("https://testnet-rpc.plume.org")
    }
    const contract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider)
    const liquidIdContract = new ethers.Contract(LIQUIDID_ADDRESS, LIQUIDID_ABI, provider)
    
    const prices: { [liquidId: string]: string } = { ...itemPrices }
    const loadingPriceMap: { [liquidId: string]: boolean } = { ...loadingPrices }
    const images: { [liquidId: string]: string } = { ...itemImages }
    const loadingImageMap: { [liquidId: string]: boolean } = { ...loadingImages }
    const metadata: { [liquidId: string]: any } = { ...itemMetadata }
    const loadingMetadataMap: { [liquidId: string]: boolean } = { ...loadingMetadata }
    const saleTypesMap: { [liquidId: string]: number | undefined } = { ...saleTypes }
    const endTimesMap: { [liquidId: string]: number | undefined } = { ...endTimes }
    
    // Helper function to add delay between calls
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    
    // Process items in batches to avoid overwhelming the RPC
    const batchSize = 1 // Process 1 item at a time to avoid circuit breaker
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      
      // Process batch sequentially to avoid overwhelming RPC
      for (const nft of batch) {
        const liquidId = nft.liquidId?.toString()
        loadingPriceMap[liquidId] = true
        loadingImageMap[liquidId] = true
        loadingMetadataMap[liquidId] = true
        
        try {
          const sale = await contract.getSale(nft.liquidId)
          if (sale && sale.isActive) {
            // Use fixedPrice for fixed price sales, startingPrice for auctions
            const sellType = Number(sale.sellType)
            const price = sellType === 0 ? sale.fixedPrice : sale.startingPrice
            prices[liquidId] = ethers.formatUnits(price, 18)
            
            // Store sale type and end time for the card display
            saleTypesMap[liquidId] = sellType
            endTimesMap[liquidId] = Number(sale.endTime)
          } else {
            prices[liquidId] = "-"
            saleTypesMap[liquidId] = undefined
            endTimesMap[liquidId] = undefined
          }
        } catch (err) {
          prices[liquidId] = "-"
          saleTypesMap[liquidId] = undefined
          endTimesMap[liquidId] = undefined
        } finally {
          loadingPriceMap[liquidId] = false
        }
        
        try {
          const assetData = await liquidIdContract.getAsset(nft.liquidId)
          
          // Check if asset exists and is active
          if (!assetData || !assetData.isActive) {
            loadingImageMap[liquidId] = false
            loadingMetadataMap[liquidId] = false
            return
          }
          
          // Fetch metadata first
          let meta = null
          try {
            meta = await fetchMetadata(assetData.metadataURI)
            if (meta) {
              metadata[liquidId] = meta
            } else {
              metadata[liquidId] = {
                name: `LID #${liquidId}`,
                collection: "Unknown Collection"
              }
            }
          } catch (err) {
            metadata[liquidId] = {
              name: `LID #${liquidId}`,
              collection: "Unknown Collection"
            }
          }
          
          // Get image from metadata
          let imageUri = meta?.image || ""
          if (imageUri && imageUri.startsWith("ipfs://")) {
            imageUri = resolveIpfs(imageUri) || ""
          }
          
          if (!imageUri || typeof imageUri !== 'string' || !imageUri.startsWith('http')) {
            const fallbackIndex = parseInt(liquidId, 10) % fallbackLidImages.length
            images[liquidId] = fallbackLidImages[fallbackIndex]
          } else {
            images[liquidId] = imageUri
          }
        } catch (error) {
          const fallbackIndex = parseInt(liquidId, 10) % fallbackLidImages.length
          images[liquidId] = fallbackLidImages[fallbackIndex]
          metadata[liquidId] = {
            name: `LID #${liquidId}`,
            collection: "Unknown Collection"
          }
        } finally {
          loadingImageMap[liquidId] = false
          loadingMetadataMap[liquidId] = false
        }
      }
      
      // Add delay between items to avoid overwhelming the RPC
      if (i + batchSize < items.length) {
        await delay(1000) // 1 second delay between items
      }
    }
    
    // Then, batch fetch collection names for unique collection IDs
    const uniqueCollectionIds = [...new Set(Object.values(metadata).map((meta: any) => meta.collection).filter(Boolean))]
    const collectionNamePromises = uniqueCollectionIds.map(async (collectionId) => {
      if (collectionNames[collectionId]) {
        return { id: collectionId, name: collectionNames[collectionId] }
      }
      try {
        const colRes = await fetch(`/api/collections?id=${collectionId}`)
        if (colRes.ok) {
          const colData = await colRes.json()
          if (colData && colData.collection && colData.collection.name) {
            return { id: collectionId, name: colData.collection.name }
          }
        }
      } catch {
        // Handle error
      }
      return { id: collectionId, name: "Unknown Collection" }
    })
    
    const collectionNameResults = await Promise.all(collectionNamePromises)
    const newCollectionNames = { ...collectionNames }
    collectionNameResults.forEach(({ id, name }) => {
      newCollectionNames[id] = name
    })
    
    // Update metadata with collection names
    Object.keys(metadata).forEach((liquidId) => {
      const meta = metadata[liquidId]
      if (meta.collection && newCollectionNames[meta.collection]) {
        metadata[liquidId] = {
          ...meta,
          collection: newCollectionNames[meta.collection]
        }
      }
    })
    
    setItemPrices(prices)
    setLoadingPrices(loadingPriceMap)
    setItemImages(images)
    setLoadingImages(loadingImageMap)
    setItemMetadata(metadata)
    setLoadingMetadata(loadingMetadataMap)
    setCollectionNames(newCollectionNames)
    setSaleTypes(saleTypesMap)
    setEndTimes(endTimesMap)
  }

  // Auto-fetch on mount
  useEffect(() => {
    const autoLoadData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const provider = new ethers.JsonRpcProvider("https://testnet-rpc.plume.org")
        const contract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider)
        
        const sales = await contract.getSaleArray(0, PAGE_SIZE)
        
        setNftItems(sales)
        setHasMore(sales.length === PAGE_SIZE)
        
        if (sales.length > 0) {
          await fetchImagesAndPricesForItems(sales)
        } else {
          setError("No items are currently listed for sale.")
        }
      } catch (err: any) {
        setError("Failed to load marketplace items")
      } finally {
        setLoading(false)
      }
    }
    
    const timer = setTimeout(autoLoadData, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleLoadMore = async () => {
    setFetchingMore(true)
    setError(null)
    
    try {
      const provider = new ethers.JsonRpcProvider("https://testnet-rpc.plume.org")
      const contract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider)
      
      const sales = await contract.getSaleArray(nftItems.length, PAGE_SIZE)
      
      setNftItems(prev => [...prev, ...sales])
      setHasMore(sales.length === PAGE_SIZE)
      
      if (sales.length > 0) {
        await fetchImagesAndPricesForItems(sales)
      }
    } catch (err: any) {
      setError("Failed to load more items")
    } finally {
      setFetchingMore(false)
    }
  }

  return (
    <section>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0">
        <h2 className="text-xl md:text-2xl font-bold">Discover</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 min-w-[200px] justify-between"
              >
                <span>{selectedSortOption?.label || "Newest"}</span>
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

          <Button variant="outline" size="sm" className="border-gray-700 w-full text-green-300 sm:w-auto">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {loading && <div className="text-center py-8">Loading LID items...</div>}
      {error && <div className="text-center py-8 text-red-500">{error}</div>}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {nftItems.map((nft, index) => {
            const liquidId = nft.liquidId?.toString()
            const price = itemPrices[liquidId]
            const isPriceLoading = loadingPrices[liquidId]
            const image = itemImages[liquidId] || "/placeholder.svg?height=200&width=200"
            const isImageLoading = loadingImages[liquidId]
            const metadata = itemMetadata[liquidId] || { name: `LID #${liquidId}`, collection: "Unknown Collection" }
            const isMetadataLoading = loadingMetadata[liquidId]
            const saleType = saleTypes[liquidId]
            const endTime = endTimes[liquidId]
            
            return (
              <NftCardDiscover
                key={liquidId + '-' + index}
                nft={{
                  name: isMetadataLoading ? "Loading..." : (metadata.name || `LID #${liquidId}`),
                  image: isImageLoading ? "/placeholder.svg?height=200&width=200" : image,
                  collectionName: isMetadataLoading ? "Loading..." : (metadata.collection || "Unknown Collection"),
                  verified: true,
                  price: price,
                  isPriceLoading: isPriceLoading,
                  liquidId: liquidId,
                  saleType: saleType,
                  endTime: endTime
                }}
                index={index}
              />
            )
          })}
        </div>
      )}

      <div className="text-center mt-6 md:mt-8">
        {hasMore ? (
        <Button
          variant="outline"
          className="border-gray-700 hover:border-green-500"
          onClick={handleLoadMore}
          disabled={fetchingMore || loading}
        >
          {fetchingMore ? "Loading..." : "Load more"}
        </Button>
        ) : (
          <div className="text-gray-400">No more items</div>
        )}
      </div>
    </section>
  )
}
