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
import { CONFIG } from "@/lib/config"

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

// Sample fallback NFT images - using local placeholders
const fallbackNftImages = [
  "/images/placeholder.jpg",
  "/images/placeholder.jpg", 
  "/images/placeholder.jpg",
  "/images/placeholder.jpg"
]

// Test image that we know works
const testImage = "https://via.placeholder.com/400x400/232423/FFFFFF?text=NFT"

// Helper to resolve IPFS URI to gateway URL
const resolveIpfs = (uri: string) => {
  if (!uri) return null;
  if (uri.startsWith("ipfs://")) {
    const hash = uri.replace("ipfs://", "");
    console.log(`Resolving IPFS hash: ${hash}`);
    const gateways = [
      `https://gateway.pinata.cloud/ipfs/${hash}`,
      `https://ipfs.io/ipfs/${hash}`,
      `https://cloudflare-ipfs.com/ipfs/${hash}`,
      `https://dweb.link/ipfs/${hash}`
    ];
    console.log(`Using gateway: ${gateways[0]}`);
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

// Helper to fetch collection name efficiently
const fetchCollectionName = async (collectionId: string, existingNames: { [collectionId: string]: string }) => {
  if (existingNames[collectionId]) {
    return existingNames[collectionId];
  }
  
  try {
    const colRes = await fetch(`/api/collections?id=${collectionId}`)
    if (colRes.ok) {
      const colData = await colRes.json()
      if (colData && colData.collection && colData.collection.name) {
        return colData.collection.name;
      }
    }
  } catch {
    // Handle error
  }
  
  return "Unknown Collection";
};

export default function DiscoverContent() {
  const [activeTab, setActiveTab] = useState("items")
  const [sortBy, setSortBy] = useState("newest")
  const [activityFilter, setActivityFilter] = useState("all")
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<{
    type: string
    bundle: string
    minPrice: string
    maxPrice: string
    collections: string[]
  } | null>(null)
  const [nftItems, setNftItems] = useState<any[]>([])
  const [itemPrices, setItemPrices] = useState<{ [liquidId: string]: string }>({})
  const [loadingPrices, setLoadingPrices] = useState<{ [liquidId: string]: boolean }>({})
  const [loadingBids, setLoadingBids] = useState<{ [liquidId: string]: boolean }>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetchingMore, setFetchingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const PAGE_SIZE = 6 // Reduced to avoid overwhelming RPC
  const [itemImages, setItemImages] = useState<{ [liquidId: string]: string }>({})
  const [loadingImages, setLoadingImages] = useState<{ [liquidId: string]: boolean }>({})
  const [itemMetadata, setItemMetadata] = useState<{ [liquidId: string]: any }>({})
  const [loadingMetadata, setLoadingMetadata] = useState<{ [liquidId: string]: boolean }>({})
  const [collectionNames, setCollectionNames] = useState<{ [collectionId: string]: string }>({})
  const [saleTypes, setSaleTypes] = useState<{ [liquidId: string]: number | undefined }>({})
  const [endTimes, setEndTimes] = useState<{ [liquidId: string]: number | undefined }>({})

  const selectedSortOption = sortOptions.find((option) => option.value === sortBy)
  const selectedActivityOption = activityFilterOptions.find((option) => option.value === activityFilter)

  // Debug state changes
  useEffect(() => {
    console.log("State updated:", {
      itemPrices: Object.keys(itemPrices).length,
      itemImages: Object.keys(itemImages).length,
      itemMetadata: Object.keys(itemMetadata).length,
      nftItems: nftItems.length
    });
  }, [itemPrices, itemImages, itemMetadata, nftItems]);



  // Reusable function to fetch images, prices, and metadata for a list of items
  async function fetchImagesAndPricesForItems(items: any[]) {
    console.log("fetchImagesAndPricesForItems called with items:", items.length);
    let provider: ethers.BrowserProvider | ethers.JsonRpcProvider
    if (typeof window !== "undefined" && (window as any).ethereum) {
      provider = new ethers.BrowserProvider((window as any).ethereum)
    } else {
      provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL)
    }
    const contract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider)
    const liquidIdContract = new ethers.Contract(LIQUIDID_ADDRESS, LIQUIDID_ABI, provider)
    
    // Start with fresh objects to ensure we don't lose data
    const prices: { [liquidId: string]: string } = {}
    const loadingPriceMap: { [liquidId: string]: boolean } = {}
    const images: { [liquidId: string]: string } = {}
    const loadingImageMap: { [liquidId: string]: boolean } = {}
    const metadata: { [liquidId: string]: any } = {}
    const loadingMetadataMap: { [liquidId: string]: boolean } = {}
    const saleTypesMap: { [liquidId: string]: number | undefined } = {}
    const endTimesMap: { [liquidId: string]: number | undefined } = {}
    
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
          // Get current block number for debugging
          let currentBlock;
          try {
            currentBlock = await provider.getBlockNumber();
            console.log(`Current block for sale ${liquidId}: ${currentBlock}`);
          } catch (err) {
            console.log(`Error getting block number for sale ${liquidId}:`, err);
          }
          
          let sale = await contract.getSale(nft.liquidId)
          
          // Check if sale data is valid
          if (!sale || !sale.seller || sale.seller === "0x0000000000000000000000000000000000000000") {
            // Try with a specific block number (latest - 10 blocks)
            try {
              const fallbackBlock = currentBlock ? currentBlock - 10 : undefined;
              if (fallbackBlock && fallbackBlock > 0) {
                sale = await contract.getSale(nft.liquidId, { blockTag: fallbackBlock });
              }
            } catch (err) {
              console.log(`Error fetching sale ${liquidId} at fallback block:`, err);
            }
          }
          
          if (sale) {
            console.log(`Sale ${liquidId} details:`, {
              seller: sale.seller,
              isActive: sale.isActive,
              sellType: sale.sellType,
              fixedPrice: sale.fixedPrice,
              startingPrice: sale.startingPrice,
              endTime: sale.endTime,
              hasSeller: !!sale.seller,
              isActiveValue: sale.isActive
            });
          }
          
          
          if (sale && sale.isActive) {
            // Use fixedPrice for fixed price sales, startingPrice for auctions
            const sellType = Number(sale.sellType)
            const price = sellType === 0 ? sale.fixedPrice : sale.startingPrice
            console.log(`Selected price for ${liquidId}:`, price)
            console.log(`Price type:`, typeof price)
            console.log(`Price value:`, price.toString())
            prices[liquidId] = ethers.formatUnits(price, 18)
            console.log(`Formatted price for ${liquidId}:`, prices[liquidId])
            
            // Store sale type and end time for the card display
            saleTypesMap[liquidId] = sellType
            endTimesMap[liquidId] = Number(sale.endTime)
          } else {            
            console.log(`Sale ${liquidId} is not active or doesn't exist`);
            prices[liquidId] = "-"
            saleTypesMap[liquidId] = undefined
            endTimesMap[liquidId] = undefined
          }
        } catch (err) {
          console.log(`Error fetching sale for ${liquidId}:`, err)
          prices[liquidId] = "-"
          saleTypesMap[liquidId] = undefined
          endTimesMap[liquidId] = undefined
        } finally {
          loadingPriceMap[liquidId] = false
        }
        try {
          console.log(`Fetching asset data for liquidId: ${liquidId} (${nft.liquidId})`);
          
          // Get current block number for debugging
          let currentBlock;
          try {
            currentBlock = await provider.getBlockNumber();
            console.log(`Current block for ${liquidId}: ${currentBlock}`);
          } catch (err) {
            console.log(`Error getting block number for ${liquidId}:`, err);
          }
          
          let assetData = await liquidIdContract.getAsset(Number(nft.liquidId))
          console.log(`Raw asset data for ${liquidId}:`, assetData);
          
          // Check if assetData is valid
          if (!assetData || !assetData.owner || assetData.owner === "0x0000000000000000000000000000000000000000") {
            console.log(`Asset ${liquidId} returned invalid data, trying with block number...`);
            
            // Try with a specific block number (latest - 10 blocks)
            try {
              const fallbackBlock = currentBlock ? currentBlock - 10 : undefined;
              if (fallbackBlock && fallbackBlock > 0) {
                console.log(`Trying to fetch ${liquidId} at block ${fallbackBlock}`);
                assetData = await liquidIdContract.getAsset(Number(nft.liquidId), { blockTag: fallbackBlock });
                console.log(`Asset data at block ${fallbackBlock}:`, assetData);
              }
            } catch (err) {
              console.log(`Error fetching ${liquidId} at fallback block:`, err);
            }
          }
          
          if (!assetData) {
            console.log(`Asset ${liquidId} returned null/undefined after fallback`);
            loadingImageMap[liquidId] = false
            loadingMetadataMap[liquidId] = false
            continue;
          }
          
          // Log all asset data fields
          console.log(`Asset ${liquidId} details:`, {
            owner: assetData.owner,
            isActive: assetData.isActive,
            metadataURI: assetData.metadataURI,
            hasOwner: !!assetData.owner,
            hasMetadataURI: !!assetData.metadataURI,
            isActiveValue: assetData.isActive
          });
          
          // Check if asset exists and is active
          if (!assetData.isActive) {
            console.log(`Asset ${liquidId} is not active`);
            console.log(`Asset owner: ${assetData.owner}`);
            // Skip this item by not setting any data
            loadingImageMap[liquidId] = false
            loadingMetadataMap[liquidId] = false
            continue;
          }
          
          // Fetch metadata first
          let meta = null
          try {
            console.log(`Fetching metadata for ${liquidId} from: ${assetData.metadataURI}`)
            meta = await fetchMetadata(assetData.metadataURI)
            if (meta) {
              console.log(`Metadata for ${liquidId}:`, meta)
              metadata[liquidId] = meta
            } else {
              console.log(`No metadata found for ${liquidId}, using fallback`)
              metadata[liquidId] = {
                name: `LID #${liquidId}`,
                collection: "Unknown Collection"
              }
            }
          } catch (err) {
            console.log(`Error fetching metadata for ${liquidId}:`, err)
            metadata[liquidId] = {
              name: `LID #${liquidId}`,
              collection: "Unknown Collection"
            }
          }
          
          // Get image from metadata
          let imageUri = meta?.image || ""
          console.log(`Original image URI for ${liquidId}: ${imageUri}`)
          
          if (imageUri && imageUri.startsWith("ipfs://")) {
            imageUri = resolveIpfs(imageUri) || ""
            console.log(`Resolved IPFS URI for ${liquidId}: ${imageUri}`)
          }
          
          // Validate image URI
          if (!imageUri || typeof imageUri !== 'string' || !imageUri.startsWith('https')) {
            console.log(`Invalid image URI for ${liquidId}: ${imageUri}, using test image`)
            images[liquidId] = testImage
          } else {
            // Test if image is accessible
            try {
              console.log(`Testing image accessibility for ${liquidId}: ${imageUri}`)
              const imgResponse = await fetch(imageUri, { method: 'HEAD' })
              if (imgResponse.ok) {
                console.log(`Image accessible for ${liquidId}: ${imageUri}`)
                console.log(liquidId, imageUri);
                images[liquidId] = imageUri
              } else {
                console.log(`Image not accessible for ${liquidId}: ${imageUri}, status: ${imgResponse.status}, using test image`)
                images[liquidId] = testImage
              }
            } catch (imgError) {
              console.log(`Error checking image for ${liquidId}: ${imageUri}, error: ${imgError}, using test image`)
              images[liquidId] = testImage
            }
          }
        } catch (error) {
          console.log(`Error fetching asset ${liquidId}:`, error)
          images[liquidId] = testImage
          metadata[liquidId] = {
            name: `LID #${liquidId}`,
            collection: "Unknown Collection"
          }
        } finally {
          console.log("finally", liquidId);
          loadingImageMap[liquidId] = false
          loadingMetadataMap[liquidId] = false
        }
      }
      
      // Add delay between items to avoid overwhelming the RPC
      if (i + batchSize < items.length) {
        await delay(1000) // 1 second delay between items'
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
    
    console.log("About to set state with data:", {
      prices: Object.keys(prices).length,
      images: Object.keys(images).length,
      metadata: Object.keys(metadata).length,
      saleTypes: Object.keys(saleTypesMap).length,
      sampleData: {
        prices: prices,
        images: images,
        metadata: metadata
      }
    });
    
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

  // Auto-fetch on mount using direct RPC to avoid circuit breaker issues
  useEffect(() => {
    const autoLoadData = async () => {
      console.log('Auto-loading data on mount using direct RPC...');
      setLoading(true)
      setError(null)
      
      try {
        // Always use direct RPC for auto-loading to avoid MetaMask circuit breaker
        const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL)
        console.log("RPC_URL", CONFIG.RPC_URL);
        const contract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider)
        
        console.log('Creating contract instance...');
        console.log('Contract instance created successfully');
        
        // Debug: Check what functions are available
        console.log('Contract address:', MARKETPLACE_ADDRESS);
        console.log('Provider network:', await provider.getNetwork());
        
        // Test if getSaleArray exists
        if (typeof contract.getSaleArray === 'function') {
          console.log('getSaleArray function exists');
        } else {
          console.log('getSaleArray function does NOT exist');
          console.log('Contract methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(contract)));
        }
        
        console.log('Fetching initial sales...');
        let sales = await contract.getSaleArray(0, PAGE_SIZE)
        console.log("Initial sales from direct RPC:", sales)
        
        // Filter out expired/ended sales - only show active sales
        sales = sales.filter((sale: any) => {
          if (!sale || !sale.isActive) return false;
          
          // For auction sales, check if they haven't ended yet
          if (Number(sale.sellType) === 1) { // Auction
            const currentTime = Math.floor(Date.now() / 1000);
            const endTime = Number(sale.endTime);
            if (endTime && currentTime > endTime) {
              console.log(`Filtering out expired auction sale ${sale.liquidId}, endTime: ${endTime}, currentTime: ${currentTime}`);
              return false;
            }
          }
          
          return true;
        });
        console.log("Active sales after filtering:", sales.length);
        
        // Apply filters if they exist
        if (appliedFilters) {
          console.log('Applying filters:', appliedFilters)
          sales = await applyFiltersToSales(sales, appliedFilters)
          console.log("Filtered sales:", sales)
        }
        
        setNftItems(sales)
        setHasMore(sales.length === PAGE_SIZE)
        
        if (sales.length > 0) {
          console.log('Fetching images and prices for', sales.length, 'items...');
          await fetchImagesAndPricesForItems(sales)
          console.log('Auto-load completed successfully');
        } else {
          console.log('No sales found');
          setError("No items are currently listed for sale. Check back later!")
        }
      } catch (err: any) {
        console.log('Auto-load error:', err)
        setError("Click 'Load Items' to view marketplace items")
      } finally {
        setLoading(false)
      }
    }
    
    // Add a small delay before auto-loading
    const timer = setTimeout(autoLoadData, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Apply filters to sales data
  const applyFiltersToSales = async (sales: any[], filters: {
    type: string
    bundle: string
    minPrice: string
    maxPrice: string
    collections: string[]
  }) => {
    let filteredSales = [...sales]
    
    // Filter by type (Fixed Price vs Auction)
    if (filters.type !== "All") {
      const sellType = filters.type === "Fixed Price" ? 0 : 1
      filteredSales = filteredSales.filter(sale => {
        try {
          return Number(sale.sellType) === sellType
        } catch {
          return true
        }
      })
    }
    
    // Filter by price range
    if (filters.minPrice || filters.maxPrice) {
      filteredSales = filteredSales.filter(sale => {
        try {
          const price = Number(ethers.formatUnits(sale.fixedPrice || sale.startingPrice || 0, 18))
          const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : 0
          const maxPrice = filters.maxPrice ? parseFloat(filters.maxPrice) : Infinity
          return price >= minPrice && price <= maxPrice
        } catch {
          return true
        }
      })
    }
    
    // Filter by collections (if collections are selected)
    if (filters.collections.length > 0) {
      // This would require fetching metadata for each sale to get collection info
      // For now, we'll skip collection filtering as it requires additional API calls
      console.log('Collection filtering not implemented yet - requires metadata fetching')
    }
    
    return filteredSales
  }

  // Handle filter application
  const handleApplyFilters = (filters: {
    type: string
    bundle: string
    minPrice: string
    maxPrice: string
    collections: string[]
  }) => {
    setAppliedFilters(filters)
    // Reset pagination when filters change
    setNftItems([])
    setHasMore(true)
    // Reload data with new filters by calling the useEffect again
    setLoading(true)
    setError(null)
    
    const reloadData = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL)
        const contract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider)
        
        let sales = await contract.getSaleArray(0, PAGE_SIZE)
        
        // Filter out expired/ended sales - only show active sales
        sales = sales.filter((sale: any) => {
          if (!sale || !sale.isActive) return false;
          
          // For auction sales, check if they haven't ended yet
          if (Number(sale.sellType) === 1) { // Auction
            const currentTime = Math.floor(Date.now() / 1000);
            const endTime = Number(sale.endTime);
            if (endTime && currentTime > endTime) {
              console.log(`Filtering out expired auction sale ${sale.liquidId}, endTime: ${endTime}, currentTime: ${currentTime}`);
              return false;
            }
          }
          
          return true;
        });
        console.log("Active sales after filtering:", sales.length);
        
        // Apply filters if they exist
        if (filters) {
          console.log('Applying filters:', filters)
          sales = await applyFiltersToSales(sales, filters)
          console.log("Filtered sales:", sales)
        }
        
        setNftItems(sales)
        setHasMore(sales.length === PAGE_SIZE)
        
        if (sales.length > 0) {
          await fetchImagesAndPricesForItems(sales)
        } else {
          setError("No items match the selected filters.")
        }
      } catch (err: any) {
        console.log('Filter reload error:', err)
        setError("Failed to apply filters. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    
    reloadData()
  }

  // Disabled bid fetching to avoid circuit breaker issues
  // useEffect(() => {
  //   async function fetchBidsForVisibleItems() {
  //     // Bid fetching disabled for now
  //   }
  //   if (nftItems.length > 0) {
  //     fetchBidsForVisibleItems()
  //   }
  // }, [nftItems])

  const handleLoadMore = async () => {
    console.log('Starting load process...');
    
    // If this is the first load (no items yet), use initial loading
    if (nftItems.length === 0) {
      setLoading(true)
      setError(null)
    } else {
      setFetchingMore(true)
      setError(null)
    }
    
    try {
      // Check if MetaMask is available and ready
      if (typeof window === "undefined" || !(window as any).ethereum) {
        setError("MetaMask is not available. Please install MetaMask and refresh the page.")
        return
      }
      
      // Test MetaMask connection first
      console.log('Testing MetaMask connection...');
      try {
        const testProvider = new ethers.BrowserProvider((window as any).ethereum)
        await testProvider.getNetwork()
        console.log('MetaMask connection test successful');
      } catch (connectionError) {
        console.log('MetaMask connection test failed:', connectionError);
        setError("MetaMask connection failed. Please check your wallet connection and try again.")
        return
      }
      
      // Add longer delay to let MetaMask fully reset
      console.log('Waiting for MetaMask to reset...');
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      console.log('Creating provider...');
      let provider: ethers.BrowserProvider | ethers.JsonRpcProvider
      
      // Try MetaMask first, fallback to direct RPC if needed
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          provider = new ethers.BrowserProvider((window as any).ethereum)
          console.log('Using MetaMask provider');
        } catch (providerError) {
          console.log('MetaMask provider failed, using direct RPC:', providerError);
          provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL)
        }
      } else {
        provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL)
        console.log('Using direct RPC provider');
      }
      
      console.log('Creating contract instance...');
      const contract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider)
      console.log('Contract instance created successfully');
      
      // Retry mechanism for contract calls
      const retryContractCall = async (fn: () => Promise<any>, maxRetries = 3) => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            console.log(`Attempt ${attempt} to call contract...`);
            const result = await fn()
            console.log(`Contract call successful on attempt ${attempt}`);
            return result
          } catch (error: any) {
            console.log(`Attempt ${attempt} failed:`, error.message);
            if (attempt === maxRetries) {
              throw error
            }
            // Exponential backoff: wait 2^attempt seconds
            const delay = Math.pow(2, attempt) * 1000
            console.log(`Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay))
          }
        }
      }
      
      // Try to get sales with retry mechanism
      let sales = []
      try {
        sales = await retryContractCall(() => contract.getSaleArray(nftItems.length, PAGE_SIZE))
        console.log("Sales from marketplace:", sales)
        
        // Filter out expired/ended sales - only show active sales
        sales = sales.filter((sale: any) => {
          if (!sale || !sale.isActive) return false;
          
          // For auction sales, check if they haven't ended yet
          if (Number(sale.sellType) === 1) { // Auction
            const currentTime = Math.floor(Date.now() / 1000);
            const endTime = Number(sale.endTime);
            if (endTime && currentTime > endTime) {
              console.log(`Filtering out expired auction sale ${sale.liquidId}, endTime: ${endTime}, currentTime: ${currentTime}`);
              return false;
            }
          }
          
          return true;
        });
        console.log("Active sales after filtering:", sales.length);
        
        // Apply filters if they exist
        if (appliedFilters) {
          console.log('Applying filters to load more:', appliedFilters)
          sales = await applyFiltersToSales(sales, appliedFilters)
          console.log("Filtered sales for load more:", sales)
        }
      } catch (saleError: any) {
        console.log("Error fetching sales after retries:", saleError)
        if (saleError.message && saleError.message.includes("CALL_EXCEPTION")) {
          console.log("No sales found or contract call failed")
          sales = []
        } else {
          throw saleError
        }
      }
      
      if (nftItems.length === 0) {
        // First load
        setNftItems(sales)
        setHasMore(sales.length === PAGE_SIZE)
        
        // Only fetch images and prices if we have sales
        if (sales.length > 0) {
          await fetchImagesAndPricesForItems(sales)
        } else {
          // If no sales found, try to fetch some assets from the core contract
          console.log("No sales found, trying to fetch some assets from core contract...")
          try {
            const liquidIdContract = new ethers.Contract(LIQUIDID_ADDRESS, LIQUIDID_ABI, provider)
            const totalSupply = await liquidIdContract.getTotalSupply()
            console.log("Total assets in core contract:", totalSupply.toString())
            
            // If there are assets but no sales, show a message
            if (totalSupply > 0) {
              setError("No items are currently listed for sale. Check back later!")
            } else {
              setError("No assets found in the marketplace.")
            }
          } catch (coreError) {
            console.log("Error fetching from core contract:", coreError)
            setError("No items are currently available for sale.")
          }
        }
      } else {
        // Load more
        setNftItems(prev => {
          const newItems = [...prev, ...sales]
          // Fetch images/prices for only the new sales
          if (sales.length > 0) {
            fetchImagesAndPricesForItems(sales)
          }
          return newItems
        })
        setHasMore(sales.length === PAGE_SIZE)
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch listings")
    } finally {
      setLoading(false)
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

              <Button variant="outline" size="sm" className="border-gray-700" style={{ color: "#ACEB2F" }} onClick={() => setFilterModalOpen(true)}>
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </>
          )}

          {/* Activities Tab Filters */}
          {activeTab === "activities" && (
            <Button variant="outline" size="sm" className="border-gray-700" style={{ color: "#ACEB2F" }} onClick={() => setFilterModalOpen(true)}>
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          )}
        </div>
      </div>

      {/* NFT Grid */}
      {activeTab === "items" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading && <div className="col-span-full text-center">Loading LID orders...</div>}
          {error && <div className="col-span-full text-center text-red-500">{error}</div>}
          {!loading && !error && nftItems.length === 0 && (
            <div className="col-span-full text-center">No LID orders found.</div>
          )}
          {!loading && !error && nftItems.map((nft, index) => {
            const liquidId = nft.liquidId?.toString()
            const price = itemPrices[liquidId]
            const isPriceLoading = loadingPrices[liquidId]
            const image = itemImages[liquidId] || testImage
            const isImageLoading = loadingImages[liquidId]
            const metadata = itemMetadata[liquidId] || { name: `LID #${liquidId}`, collection: "Unknown Collection" }
            const isMetadataLoading = loadingMetadata[liquidId]
            const saleType = saleTypes[liquidId]
            const endTime = endTimes[liquidId]
            
            return (
              <NftCardDiscover
                key={index}
                nft={{
                  name: isMetadataLoading ? "Loading..." : (metadata.name || `LID #${liquidId}`),
                  image: isImageLoading ? testImage : image,
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
            {nftItems.length === 0 ? (loading ? "Loading..." : "Load Items") : (fetchingMore ? "Loading..." : "Load more")}
          </Button>
        ) : (
          <div className="text-gray-400">No more items</div>
        )}
      </div>

      {/* Enhanced Filter Modal */}
      <EnhancedFilterModal 
        open={filterModalOpen} 
        onOpenChange={setFilterModalOpen}
        mode={activeTab === "activities" ? "activities" : "items"}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  )
}
