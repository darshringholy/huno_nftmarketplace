"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import CollectionCard from "@/components/profile/CollectionCard"
import { Filter, ChevronDown, Check, ExternalLink } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"

import ActivitiesTable from "../marketplace/discover/activities-table"
import { ethers } from "ethers"
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from "@/lib/marketplace"
import { useWallet } from "@/hooks/use-wallet"
import { LIQUIDID_ABI, LIQUIDID_ADDRESS } from "@/lib/liquidid"
import { fetchOffersForItem } from "@/lib/offers"
import { useRouter, useSearchParams } from "next/navigation"
import { NftCardDiscover } from "@/components/ui/nft-card-discover"
import { useCallback } from "react"
import { CONFIG } from "@/lib/config"

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
  isPublic?: boolean;
}





export default function ProfileContent({ profile, defaultTab, isPublic = false }: ProfileContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(defaultTab || "items");
  useEffect(() => {
    if (defaultTab) setActiveTab(defaultTab);
  }, [defaultTab]);

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
  
  // Marketplace data states
  const [marketplaceListings, setMarketplaceListings] = useState<any[]>([])
  const [marketplaceLoading, setMarketplaceLoading] = useState(false)
  const [marketplaceError, setMarketplaceError] = useState<string | null>(null)













  const [offerPage, setOfferPage] = useState(1)
  const offerPageSize = 10
  
  // Real offers data states
  const [receivedOffers, setReceivedOffers] = useState<any[]>([])
  const [offeredOffers, setOfferedOffers] = useState<any[]>([])
  const [offersLoading, setOffersLoading] = useState(false)
  const [offersError, setOffersError] = useState<string | null>(null)
  
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
      if (!profile.address) return;
      // For public profiles, always fetch data. For private profiles, only fetch if connected
      if (!isPublic && !isConnected) return;
      
      setLoading(true)
      setError(null)
      try {
        let provider: ethers.BrowserProvider | ethers.JsonRpcProvider;
        if (typeof window !== "undefined" && (window as any).ethereum) {
          provider = new ethers.BrowserProvider((window as any).ethereum);
        } else {
          provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
        }
        const contract = new ethers.Contract(LIQUIDID_ADDRESS, LIQUIDID_ABI, provider);
        const ids = await contract.getOwnerAssets(profile.address);

        setLiquidIds(ids.map((id: any) => id.toString()));
        setUserAssets([]);
        setHasMore(true);
      } catch (err: any) {
        setError(err.message || "Failed to fetch assets");
      } finally {
        setLoading(false);
      }
    }
    fetchLiquidIds();
  }, [profile.address, isConnected, isPublic]);

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
          provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
        }
        const contract = new ethers.Contract(LIQUIDID_ADDRESS, LIQUIDID_ABI, provider);
        const idsToFetch = liquidIds.slice(0, PAGE_SIZE);
        const assets = await Promise.all(idsToFetch.map(async (id: string) => {
          try {
            const asset = await contract.getAsset(id);
  
            // Only return active assets
            if (asset && asset.isActive) {
              return asset;
            } else {
  
              return null;
            }
          } catch (err) {

            return null;
          }
        }));
        // Filter out null assets (inactive or failed to fetch)
        const validAssets = assets.filter(asset => asset !== null);
        setUserAssets(validAssets);
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
        provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
      }
      const contract = new ethers.Contract(LIQUIDID_ADDRESS, LIQUIDID_ABI, provider);
      const start = userAssets.length;
      const idsToFetch = liquidIds.slice(start, start + PAGE_SIZE);
      const assets = await Promise.all(idsToFetch.map(async (id: string) => {
        try {
          const asset = await contract.getAsset(id);
          
          // Only return active assets
          if (asset && asset.isActive) {
            return asset;
          } else {

            return null;
          }
        } catch (err) {
          
          return null;
        }
      }));
      // Filter out null assets (inactive or failed to fetch)
      const validAssets = assets.filter(asset => asset !== null);
      setUserAssets(prev => [...prev, ...validAssets]);
      setHasMore(start + validAssets.length < liquidIds.length);
    } catch (err: any) {
      setError(err.message || "Failed to fetch more assets");
    } finally {
      setFetchingMore(false);
    }
  }

  // Fetch marketplace listings for the user
  const fetchMarketplaceListings = async () => {
    if (!profile.address) return;
    // For public profiles, always fetch data. For private profiles, only fetch if connected
    if (!isPublic && !isConnected) return;
    
    setMarketplaceLoading(true);
    setMarketplaceError(null);
    try {
      let provider: ethers.BrowserProvider | ethers.JsonRpcProvider;
      if (typeof window !== "undefined" && (window as any).ethereum) {
        provider = new ethers.BrowserProvider((window as any).ethereum);
      } else {
        provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
      }
      
      const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider);
      
      const userSales: any[] = [];
      
      // Try to get user assets first if we don't have them
      if (userAssets.length === 0 && isPublic) {
        try {
          const liquidIdContract = new ethers.Contract(LIQUIDID_ADDRESS, LIQUIDID_ABI, provider);
          const assetIds = await liquidIdContract.getOwnerAssets(profile.address);
  
          
          // Check each asset for marketplace listings
          for (const assetId of assetIds) {
            try {
              const sale = await marketplaceContract.getSale(assetId);
              if (sale && sale.isActive && sale.seller.toLowerCase() === profile.address.toLowerCase()) {
                userSales.push(sale);
              }
            } catch (err) {
              // Individual sale not found or error - skip this asset
  
            }
          }
        } catch (err) {
  
        }
      } else if (userAssets.length > 0) {
        // If we have user assets, check each one for marketplace listings
        for (const asset of userAssets) {
          try {
            const sale = await marketplaceContract.getSale(asset.liquidId);
            if (sale && sale.isActive && sale.seller.toLowerCase() === profile.address.toLowerCase()) {
              userSales.push(sale);
            }
          } catch (err) {
            // Individual sale not found or error - skip this asset

          }
        }
      }
      
      
      setMarketplaceListings(userSales);
    } catch (err: any) {
      console.error("Error fetching marketplace listings:", err);
      setMarketplaceError(err.message || "Failed to fetch marketplace listings");
    } finally {
      setMarketplaceLoading(false);
    }
  };

  // State for user collections
  const [userCollections, setUserCollections] = useState<any[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [collectionsError, setCollectionsError] = useState<string | null>(null);

  // Fetch collections when collections tab is active
  useEffect(() => {
    if (activeTab !== "collections") return;
    // For public profiles, always fetch data. For private profiles, only fetch if connected
    if (!isPublic && (!isConnected || !address)) return;
    
    setCollectionsLoading(true);
    setCollectionsError(null);
    const targetAddress = isPublic ? profile.address : address;
    
    const fetchCollectionsWithStats = async () => {
      try {
        // For user's own profile, fetch all collections (including pending)
        // For public profiles, only fetch approved collections
        const isOwnProfile = !isPublic && isConnected && address === profile.address;
        const adminParam = isOwnProfile ? '&admin=true' : '';
        const res = await fetch(`/api/collections?walletAddress=${targetAddress}${adminParam}`);
        if (!res.ok) throw new Error("Failed to fetch collections");
        const { collections } = await res.json();
        
        // Fetch stats for each collection
        const collectionsWithStats = await Promise.all(
          collections.map(async (collection: any) => {
            try {
              const statsRes = await fetch(`/api/collections/${collection._id}/stats`);
              if (statsRes.ok) {
                const { stats } = await statsRes.json();
                return {
                  ...collection,
                  itemsCount: parseInt(stats.listed) || 0,
                  floorPrice: stats.floorPrice !== "0" ? `$${stats.floorPrice}` : "-"
                };
              }
            } catch (err: any) {
              console.error(`Error fetching stats for collection ${collection._id}:`, err);
            }
            return {
              ...collection,
              itemsCount: 0,
              floorPrice: "-"
            };
          })
        );
        
        setUserCollections(collectionsWithStats || []);
      } catch (err: any) {
        setCollectionsError(err.message);
      } finally {
        setCollectionsLoading(false);
      }
    };
    
    fetchCollectionsWithStats();
  }, [activeTab, isConnected, address, isPublic, profile.address]);

  // Fetch marketplace listings when profile address changes or when user assets are loaded
  useEffect(() => {
    // Always fetch marketplace data for filtering purposes
    // But only if we have user assets to check
    if (userAssets.length > 0 || isPublic) {
      fetchMarketplaceListings();
    }
  }, [profile.address, isPublic, isConnected, userAssets.length]);

  // Fetch marketplace listings when on-sale tab is active (for refresh)
  useEffect(() => {
    if (activeTab === "on-sale") {
      fetchMarketplaceListings();
    }
  }, [activeTab]);

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

  // Fetch real offers data
  const fetchOffers = useCallback(async () => {
    if (!profile.address) return;
    // For public profiles, always fetch data. For private profiles, only fetch if connected
    if (!isPublic && !isConnected) return;
    
    setOffersLoading(true);
    setOffersError(null);
    
    try {
      let provider: ethers.BrowserProvider | ethers.JsonRpcProvider;
      if (typeof window !== "undefined" && (window as any).ethereum) {
        provider = new ethers.BrowserProvider((window as any).ethereum);
      } else {
        provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
      }
      
      const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider);
      const liquidIdContract = new ethers.Contract(LIQUIDID_ADDRESS, LIQUIDID_ABI, provider);
      
      const targetAddress = isPublic ? profile.address : address || "";
      
      console.log(`Target address for offers: ${targetAddress}`);
      console.log(`isPublic: ${isPublic}, profile.address: ${profile.address}, address: ${address}`);
      
      // Get user's assets to check for offers (already declared above)
      
      
      const offeredOffersData: any[] = [];
      const receivedOffersData: any[] = [];
      
      // Note: New contract doesn't have getSaleArray, so we'll focus on user offers only
      
      
      // Get OfferMade events from a much larger block range to find all user offers
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 100000); // Last 100k blocks (much larger range)
      const toBlock = currentBlock;
      
      console.log(`Searching for OfferMade events from block ${fromBlock} to ${currentBlock} (${currentBlock - fromBlock} blocks)`);
      
      const offerMadeEvents = await marketplaceContract.queryFilter(
        marketplaceContract.filters.OfferMade(),
        fromBlock,
        toBlock
      );
      
      console.log(`Found ${offerMadeEvents.length} total OfferMade events in block range`);
      
      
      
      // Process OfferMade events to find all offers made by the user
      
      // Process OfferMade events to find all offers made by the user
      const userOffers: any[] = [];
      const processedOffers = new Set<string>(); // Track processed offers to prevent true duplicates
      
      console.log(`Processing ${offerMadeEvents.length} OfferMade events for target address: ${targetAddress}`);
      
      for (const event of offerMadeEvents) {
        try {
          const parsedLog = marketplaceContract.interface.parseLog(event);
          if (!parsedLog) continue;
          
          const { liquidId, buyer, amount, expiresAt, offerIndex } = parsedLog.args;
          const liquidIdStr = liquidId.toString();
          const buyerStr = buyer.toString();
          const offerIndexNum = Number(offerIndex);
          
          // Check if this is an offer made by the user
          if (buyerStr.toLowerCase() === targetAddress.toLowerCase()) {
            // Create a unique key for this specific offer (liquidId + offerIndex)
            const offerKey = `${liquidIdStr}-${offerIndexNum}`;
            
            // Only process each unique offer once
            if (!processedOffers.has(offerKey)) {
              console.log(`Found user offer for liquidId: ${liquidIdStr}, offerIndex: ${offerIndexNum}`);
              processedOffers.add(offerKey);
              
              userOffers.push({
                liquidId: liquidIdStr,
                buyer: buyerStr,
                amount: amount,
                expiresAt: expiresAt,
                offerIndex: offerIndexNum,
                blockNumber: event.blockNumber,
                timestamp: event.blockNumber ? await getBlockTimestamp(provider, event.blockNumber) : Math.floor(Date.now() / 1000)
              });
            } else {
              console.log(`Skipping duplicate offer: liquidId=${liquidIdStr}, offerIndex=${offerIndexNum}`);
            }
          }
        } catch (err) {
          console.log(`Error processing OfferMade event:`, err);
        }
      }
      
      console.log(`Found ${userOffers.length} unique offers made by user`);
      console.log('Unique offers:', Array.from(processedOffers));
      console.log('User offers details:', userOffers.map(offer => ({
        liquidId: offer.liquidId,
        offerIndex: offer.offerIndex,
        amount: ethers.formatUnits(offer.amount, 18),
        timestamp: offer.timestamp
      })));
      
      // Process each user offer to get details
      for (const offerData of userOffers) {
        const liquidId = offerData.liquidId;
        try {
          // Get the asset data for this liquid ID
          const asset = await liquidIdContract.getAsset(liquidId);
          if (!asset) continue;
          
          // Fetch metadata
          const metadata = await fetchMetadata(asset.metadataURI);
          
          // Get collection name if we have a collection ID
          let collectionName = "Unknown Collection";
          if (metadata?.collection) {
            try {
              const collectionRes = await fetch(`/api/collections?id=${metadata.collection}`);
              if (collectionRes.ok) {
                const collectionData = await collectionRes.json();
                if (collectionData.collection?.name) {
                  collectionName = collectionData.collection.name;
                }
              }
            } catch (err) {
              console.log(`Error fetching collection name for ${metadata.collection}:`, err);
            }
          }
          
          // Resolve IPFS image URI if needed
          let imageUrl = "/placeholder.svg?height=200&width=200";
          if (metadata?.image) {
            if (metadata.image.startsWith("ipfs://")) {
              const resolvedUrl = resolveIpfs(metadata.image);
              imageUrl = resolvedUrl || "/placeholder.svg?height=200&width=200";
            } else {
              imageUrl = metadata.image;
            }
          }
          
          // Determine offer status
          const currentTime = Math.floor(Date.now() / 1000);
          const eventExpiresAt = Number(offerData.expiresAt || 0);
          
          let status = 'pending';
          if (eventExpiresAt > 0) {
            status = currentTime > eventExpiresAt ? 'expired' : 'pending';
          } else {
            // Fallback to timestamp-based expiration (24 hours)
            const isExpired = (currentTime - offerData.timestamp) > 86400;
            status = isExpired ? 'expired' : 'pending';
          }
          
          // Format the offer amount
          const offerAmount = ethers.formatUnits(offerData.amount, 18);
          const price = `${offerAmount} HUNOS`;
          const usdPrice = `$${(parseFloat(offerAmount) * 250).toFixed(2)}`;
          
          // Create the offer data
          const offerInfo = {
            name: `${metadata?.name || `LID #${liquidId}`} (Offer #${offerData.offerIndex})`,
            collection: collectionName,
            collectionId: metadata?.collection || "",
            image: imageUrl,
            price: price,
            usdPrice: usdPrice,
            to: formatWalletAddress(offerData.buyer),
            offeredAt: formatTimeAgo(offerData.timestamp),
            status: status,
            verified: true,
            liquidId: liquidId,
            isExpired: status === 'expired',
            expiresAt: offerData.timestamp,
            offerIndex: offerData.offerIndex // Use the offerIndex from the event
          };
          
          offeredOffersData.push(offerInfo);
        } catch (err) {
          console.log(`Error processing offer for ${liquidId}:`, err);
        }
      }
      
      // Process received offers (offers made TO the user's items)
      console.log('Processing received offers...');
      
      // Get all items owned by the user
      const userAssetIds = await liquidIdContract.getOwnerAssets(targetAddress);
      console.log(`User owns ${userAssetIds.length} items`);
      
      // For each owned item, check if it has any offers
      for (const assetId of userAssetIds) {
        const liquidId = assetId.toString();
        try {
          // Get the asset data
          const asset = await liquidIdContract.getAsset(liquidId);
          if (!asset) continue;
          
          // Check if this item is listed for sale
          let isListed = false;
          try {
            const saleData = await marketplaceContract.getSale(liquidId);
            isListed = saleData && saleData.isActive;
          } catch (err) {
            // Item is not listed for sale
            isListed = false;
          }
          
          // Only process items that are listed for sale
          if (!isListed) {
            console.log(`Item ${liquidId} is not listed for sale, skipping`);
            continue;
          }
          
          // Get offers for this item using fetchOffersForItem
          const itemOffers = await fetchOffersForItem(liquidId);
          console.log(`Found ${itemOffers.length} offers for item ${liquidId}`);
          
          // Filter to only show offers from other users (not from the owner)
          const receivedOffers = itemOffers.filter(offer => 
            offer.buyer.toLowerCase() !== targetAddress.toLowerCase()
          );
          
          console.log(`Found ${receivedOffers.length} offers from other users for item ${liquidId}`);
          
          // Process each received offer
          for (const offer of receivedOffers) {
            try {
              // Fetch metadata for the item
              const metadata = await fetchMetadata(asset.metadataURI);
              
              // Get collection name
              let collectionName = "Unknown Collection";
              if (metadata?.collection) {
                try {
                  const collectionRes = await fetch(`/api/collections?id=${metadata.collection}`);
                  if (collectionRes.ok) {
                    const collectionData = await collectionRes.json();
                    if (collectionData.collection?.name) {
                      collectionName = collectionData.collection.name;
                    }
                  }
                } catch (err) {
                  console.log(`Error fetching collection name for ${metadata.collection}:`, err);
                }
              }
              
              // Resolve IPFS image URI
              let imageUrl = "/placeholder.svg?height=200&width=200";
              if (metadata?.image) {
                if (metadata.image.startsWith("ipfs://")) {
                  const resolvedUrl = resolveIpfs(metadata.image);
                  imageUrl = resolvedUrl || "/placeholder.svg?height=200&width=200";
                } else {
                  imageUrl = metadata.image;
                }
              }
              
              // Create received offer data
              const receivedOfferInfo = {
                name: metadata?.name || `LID #${liquidId}`,
                collection: collectionName,
                collectionId: metadata?.collection || "",
                image: imageUrl,
                price: offer.formattedAmount,
                usdPrice: offer.usdAmount,
                to: formatWalletAddress(offer.buyer),
                offeredAt: offer.timeAgo,
                status: offer.status,
                verified: true,
                liquidId: liquidId,
                isExpired: offer.status === 'expired',
                expiresAt: offer.timestamp,
                offerIndex: offer.offerIndex
              };
              
              receivedOffersData.push(receivedOfferInfo);
              console.log(`Added received offer: liquidId=${liquidId}, buyer=${offer.buyer}, amount=${offer.formattedAmount}`);
              
            } catch (err) {
              console.log(`Error processing received offer for ${liquidId}:`, err);
            }
          }
          
        } catch (err) {
          console.log(`Error processing item ${liquidId} for received offers:`, err);
        }
      }
      
      console.log(`Total received offers found: ${receivedOffersData.length}`);
      console.log('Received offers data:', receivedOffersData);
      
      console.log(`Summary: Found ${userOffers.length} total user offers, displayed ${offeredOffersData.length} non-cancelled offers`);
      
      setOfferedOffers(offeredOffersData);
      setReceivedOffers(receivedOffersData);
    } catch (err: any) {
      console.error("Error fetching offers:", err);
      setOffersError(err.message || "Failed to fetch offers");
    } finally {
      setOffersLoading(false);
    }
  }, [profile.address, isConnected, isPublic, address]);

  // Helper function to get block timestamp
  const getBlockTimestamp = async (provider: ethers.Provider, blockNumber: number): Promise<number> => {
    try {
      const block = await provider.getBlock(blockNumber);
      return block?.timestamp || Math.floor(Date.now() / 1000);
    } catch (error) {
      console.error("Error getting block timestamp:", error);
      return Math.floor(Date.now() / 1000);
    }
  };

  // Helper function to format time ago
  const formatTimeAgo = (timestamp: number | bigint) => {
    // Convert BigInt to number if needed
    const timestampNum = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestampNum;
    
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
    return `${Math.floor(diff / 2592000)} months ago`;
  };

  // Helper function to format wallet address
  const formatWalletAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Helper function to fetch metadata
  const fetchMetadata = async (metadataURI: string) => {
    if (!metadataURI) return null;
    const url = resolveIpfs(metadataURI);
    if (!url) return null;
    
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  // Handle withdrawing expired offers
  const handleWithdrawOffer = async (liquidId: string, offer: any) => {
    if (!isConnected) {
      
      return;
    }

    try {
      
      
      let provider: ethers.BrowserProvider;
      if (typeof window !== "undefined" && (window as any).ethereum) {
        provider = new ethers.BrowserProvider((window as any).ethereum);
      } else {

        return;
      }

      const signer = await provider.getSigner();
      const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);
      
      // Call the withdrawExpiredOffer function from the marketplace contract
      const tx = await marketplaceContract.withdrawExpiredOffer(liquidId, offer.offerIndex);
      
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      
      // Refresh offers after successful withdrawal
      await fetchOffers();
      
    } catch (err: any) {
      console.error("Error withdrawing offer:", err);
      // You might want to show a toast notification here
    }
  };

  // Handle accepting offers
  const handleAcceptOffer = async (liquidId: string, offer: any) => {
    if (!isConnected) {
      return;
    }

    try {
      let provider: ethers.BrowserProvider;
      if (typeof window !== "undefined" && (window as any).ethereum) {
        provider = new ethers.BrowserProvider((window as any).ethereum);
      } else {
        return;
      }

      const signer = await provider.getSigner();
      const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);
      
      // Call the acceptOffer function from the marketplace contract
      const tx = await marketplaceContract.acceptOffer(liquidId, offer.offerIndex);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Refresh offers after successful acceptance
      await fetchOffers();
      
    } catch (err: any) {
      console.error("Error accepting offer:", err);
      // You might want to show a toast notification here
    }
  };

  // Fetch offers when offers tab is active
  useEffect(() => {
    if (activeTab === "offers") {
      fetchOffers();
    }
  }, [activeTab, fetchOffers]);

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
          <Button variant="outline" size="sm" className="border-gray-700">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>

          {!isPublic && (
            <Button 
              variant="outline" 
              size="sm" 
              className="border-gray-700 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => router.push('/marketplace/create-item')}
            >
              Create LID
            </Button>
          )}
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
                    <span>Plume</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white min-w-[140px]">
                  <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer">
                    Plume
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
            <div>
              {marketplaceLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">Loading marketplace listings...</div>
              ) : marketplaceError ? (
                <div className="flex flex-col items-center justify-center py-16 text-red-500">{marketplaceError}</div>
              ) : marketplaceListings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 flex items-center justify-center bg-gray-800 rounded-full mb-4">
                    <span className="text-3xl text-gray-500">🏪</span>
                  </div>
                  <div className="text-gray-400 text-lg mb-2">No Items Listed</div>
                  <div className="text-gray-500 mb-4">This user hasn't listed any items for sale yet.</div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {marketplaceListings
                    .filter((listing: any) => listing.sellType.toString() === "0") // Fixed price sales
                    .map((listing: any, index: number) => {
                      const liquidId = listing.liquidId.toString();
                      const price = ethers.formatUnits(listing.fixedPrice, 18);
                      const usdPrice = `$${parseFloat(price).toFixed(2)}`;
                      
                      return (
                        <NftCardDiscover
                          key={index}
                          nft={{
                            name: assetNames[liquidId] || `LID #${liquidId}`,
                            image: assetImages[liquidId] || "/placeholder.svg?height=200&width=200",
                            collectionName: collectionNames[assetCollectionIds[liquidId]] || "Unknown Collection",
                            verified: true,
                            liquidId: liquidId,
                            price: price,
                            isPriceLoading: false,
                            saleType: 0, // Fixed price
                          }}
                          index={index}
                          isPublic={isPublic}
                          isListed={true}
                        />
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* Auctions Tab Content */}
          {onSaleTab === "auctions" && (
            <div>
              {marketplaceLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">Loading auction listings...</div>
              ) : marketplaceError ? (
                <div className="flex flex-col items-center justify-center py-16 text-red-500">{marketplaceError}</div>
              ) : marketplaceListings.filter((listing: any) => listing.sellType.toString() === "1").length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 flex items-center justify-center bg-gray-800 rounded-full mb-4">
                    <span className="text-3xl text-gray-500">🏪</span>
                  </div>
                  <div className="text-gray-400 text-lg mb-2">No Auctions</div>
                  <div className="text-gray-500 mb-4">This user hasn't created any auctions yet.</div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {marketplaceListings
                    .filter((listing: any) => listing.sellType.toString() === "1") // Auction sales
                    .map((listing: any, index: number) => {
                      const liquidId = listing.liquidId.toString();
                      const startingPrice = ethers.formatUnits(listing.startingPrice, 18);
                      const usdPrice = `$${parseFloat(startingPrice).toFixed(2)}`;
                      
                      return (
                        <NftCardDiscover
                          key={index}
                          nft={{
                            name: assetNames[liquidId] || `LID #${liquidId}`,
                            image: assetImages[liquidId] || "/placeholder.svg?height=200&width=200",
                            collectionName: collectionNames[assetCollectionIds[liquidId]] || "Unknown Collection",
                            verified: true,
                            liquidId: liquidId,
                            price: startingPrice,
                            isPriceLoading: false,
                            saleType: 1, // Auction
                            endTime: listing.endTime ? parseInt(listing.endTime.toString()) : undefined,
                          }}
                          index={index}
                          isPublic={isPublic}
                          isListed={true}
                        />
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* Bids Tab Content */}
          {onSaleTab === "bids" && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 flex items-center justify-center bg-gray-800 rounded-full mb-4">
                <span className="text-3xl text-gray-500">🎯</span>
              </div>
              <div className="text-gray-400 text-lg mb-2">No Active Bids</div>
              <div className="text-gray-500 mb-4">This user hasn't placed any active bids yet.</div>
            </div>
          )}

          {/* Ended Tab Content */}
          {onSaleTab === "ended" && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 flex items-center justify-center bg-gray-800 rounded-full mb-4">
                <span className="text-3xl text-gray-500">⏰</span>
              </div>
              <div className="text-gray-400 text-lg mb-2">No Ended Sales</div>
              <div className="text-gray-500 mb-4">This user hasn't had any sales end yet.</div>
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
                    <span>Plume</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white min-w-[140px]">
                  <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer">
                    Plume
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

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchOffers()}
                disabled={offersLoading}
                className="border-gray-700 text-white hover:bg-gray-700"
              >
                {offersLoading ? "Refreshing..." : "Refresh Offers"}
              </Button>
            </div>
          </div>

          {/* Offers Table */}
          <Card className="bg-transparent border-gray-800">
            <CardContent className="p-6">
              {offersLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">Loading offers...</div>
              ) : offersError ? (
                <div className="flex flex-col items-center justify-center py-16 text-red-500">{offersError}</div>
              ) : (offersTab === "received" ? receivedOffers : offeredOffers).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 flex items-center justify-center bg-gray-800 rounded-full mb-4">
                    <span className="text-3xl text-gray-500">💼</span>
                  </div>
                  <div className="text-gray-400 text-lg mb-2">No Offers Found</div>
                  <div className="text-gray-500 mb-4">
                    {offersTab === "received" 
                      ? "You haven't received any offers for your items yet." 
                      : "You haven't made any offers yet."}
                  </div>
                </div>
              ) : (
                <>
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
                    {(offersTab === "received" ? receivedOffers : offeredOffers).map((offer: any, index: number) => (
                      <div
                        key={index}
                        className="grid grid-cols-5 gap-4 items-center py-3 px-4 hover:bg-gray-800/50 rounded-lg transition-colors"
                      >
                        {/* Items */}
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden">
                            {offer.image && offer.image !== "/placeholder.svg?height=200&width=200" ? (
                              <Image
                                src={offer.image}
                                alt={offer.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/placeholder.svg?height=200&width=200";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                <span className="text-xs text-gray-500">?</span>
                              </div>
                            )}
                          </div>
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
                          {offer.status === "pending" && (
                            offersTab === "received" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAcceptOffer(offer.liquidId, offer)}
                                className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white text-xs"
                              >
                                Accept
                              </Button>
                            ) : (
                              <div className="text-sm text-gray-400">-</div>
                            )
                          )}
                          {offer.status === "expired" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleWithdrawOffer(offer.liquidId, offer)}
                              className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white text-xs"
                            >
                              Withdraw
                            </Button>
                          )}
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
                </>
              )}
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
              {!isPublic && (
                <>
                  <Button
                    className="bg-green-500 hover:bg-green-600 text-black font-semibold px-6 py-2"
                    onClick={() => router.push("/marketplace/collections/create")}
                  >
                    Create Collection
                  </Button>
                  {/* <Button variant="outline" className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black font-semibold px-6 py-2">
                    Import Collections
                  </Button> */}
                </>
              )}
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
              {!isPublic && (
                <Button className="bg-green-500 hover:bg-green-600 text-black font-semibold px-6 py-2 mt-2">
                  Create Collection
                </Button>
              )}
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
                  itemsCount={collection.itemsCount || 0}
                  floorPrice={collection.floorPrice || "-"}
                  status={collection.status}
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
                  <span>Plume</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white min-w-[140px]">
                <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer">
                  Plume
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
        <div>
          {loading || marketplaceLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">Loading assets...</div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-red-500">{error}</div>
          ) : userAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 flex items-center justify-center bg-gray-800 rounded-full mb-4">
                <span className="text-3xl text-gray-500">🎨</span>
              </div>
              <div className="text-gray-400 text-lg mb-2">No Items Found</div>
              <div className="text-gray-500 mb-4">This user doesn't own any items yet.</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {userAssets
                .filter((asset: any) => {
                  // Filter out items that are listed on the marketplace
                  const liquidId = asset.liquidId.toString();
                  return !marketplaceListings.some((listing: any) => 
                    listing.liquidId.toString() === liquidId && listing.isActive
                  );
                })
                .map((asset: any, index: number) => {
                  // Determine collection name: fetch from API using collection id from metadata
                  let collectionName = "Unknown Collection";
                  const collectionId = assetCollectionIds[asset.liquidId];
                  if (collectionId && collectionNames[collectionId]) {
                    collectionName = collectionNames[collectionId];
                  }
                  const nftName = assetNames[asset.liquidId] || `LID #${asset.liquidId}`;
                  return (
                    <NftCardDiscover
                      key={index}
                      nft={{
                        name: nftName,
                        image: assetImages[asset.liquidId] || "/placeholder.svg?height=200&width=200",
                        collectionName,
                        verified: true,
                        liquidId: asset.liquidId?.toString(),
                        price: "-", // Items tab shows unlisted items, so no price
                        isPriceLoading: false,
                      }}
                      index={index}
                      isPublic={isPublic}
                    />
                  );
                })}
            </div>
          )}
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