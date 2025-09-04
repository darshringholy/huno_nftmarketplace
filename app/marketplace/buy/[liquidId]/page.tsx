"use client"

import React, { useEffect, useState, useRef, useCallback } from "react"
import { ethers } from "ethers"
import { LIQUIDID_ABI, LIQUIDID_ADDRESS } from "@/lib/liquidid"
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from "@/lib/marketplace"
import Link from "next/link"
import { fetchOffersForItem, Offer } from "@/lib/offers"
import HexagonAvatar from "@/components/ui/hexagon-avatar"
import { fetchUserAvatar } from "@/lib/user-avatars"

// Hunos Token ABI for approval
const HUNOS_TOKEN_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)"
]

// Hunos token address
const HUNOS_TOKEN_ADDRESS = "0x957F6F0732f1c45bD7694614875b6a5Eb0bF5ac2"
import { Check } from "lucide-react"
import { User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { NftCardDiscover } from "@/components/ui/nft-card-discover"
import NewsletterSection from "@/components/marketplace/newsletter-section"
import WalletConnectDialog from "@/components/ui/wallet-connect-dialog"
import BidPopup from "@/components/ui/bid-popup"
import OfferPopup from "@/components/ui/offer-popup"
import ReportDialog from "@/components/ui/report-dialog"
import { useWallet } from "@/hooks/use-wallet"
import ActivitiesTable from "@/components/marketplace/discover/activities-table"

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

// Helper to convert expire date string to timestamp
const convertExpireDateToTimestamp = (expireDate: string): number => {
  const parts = expireDate.split(' ')
  const value = parseInt(parts[0])
  const unit = parts[1]
  
  const now = Math.floor(Date.now() / 1000) // Current timestamp in seconds
  
  let durationInSeconds: number
  switch (unit) {
    case 'minutes':
      durationInSeconds = value * 60
      break
    case 'hours':
      durationInSeconds = value * 60 * 60
      break
    case 'days':
      durationInSeconds = value * 24 * 60 * 60
      break
    case 'weeks':
      durationInSeconds = value * 7 * 24 * 60 * 60
      break
    case 'months':
      durationInSeconds = value * 30 * 24 * 60 * 60 // Approximate
      break
    default:
      durationInSeconds = 30 * 60 // Default to 30 minutes
  }
  
  return now + durationInSeconds // Return future timestamp
}

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

export default function BuyPage({ params }: { params: any }) {
  const { liquidId } = React.use(params) as { liquidId: string }
  const router = useRouter()
  const [asset, setAsset] = useState<any>(null)
  const [listing, setListing] = useState<any>(null)
  const [metadata, setMetadata] = useState<any>(null)
  const [image, setImage] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [collectionName, setCollectionName] = useState<string>("Unknown Collection")
  const [collectionLogo, setCollectionLogo] = useState<string>("")
  const [ownerAvatar, setOwnerAvatar] = useState<string>("")
  const [activeTab, setActiveTab] = useState("Info")
  const [isBuying, setIsBuying] = useState(false)
  const [buyError, setBuyError] = useState<string | null>(null)
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)
  const [offers, setOffers] = useState<Offer[]>([])
  const [loadingOffers, setLoadingOffers] = useState(false)
  
  // Auto-hide error message after 5 seconds
  useEffect(() => {
    if (buyError) {
      const timer = setTimeout(() => {
        setBuyError(null)
      }, 5000) // 5 seconds
      
      return () => clearTimeout(timer)
    }
  }, [buyError])
  const [relatedLids, setRelatedLids] = useState<any[]>([])
  const [sellerLids, setSellerLids] = useState<any[]>([])
  const [walletDialogOpen, setWalletDialogOpen] = useState(false)
  const [bidPopupOpen, setBidPopupOpen] = useState(false)
  const [offerPopupOpen, setOfferPopupOpen] = useState(false)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [isMakingOffer, setIsMakingOffer] = useState(false)
  const [offerError, setOfferError] = useState<string | null>(null)
  const hasRunRef = useRef(false)
  
  const { isConnected } = useWallet()
  
  // Auto-hide offer error message after 5 seconds
  useEffect(() => {
    if (offerError) {
      const timer = setTimeout(() => {
        setOfferError(null)
      }, 5000) // 5 seconds
      
      return () => clearTimeout(timer)
    }
  }, [offerError])

  // Fetch offers when offers tab is active
  useEffect(() => {
    if (activeTab === "Offers" && liquidId) {
      const fetchOffers = async () => {
        setLoadingOffers(true)
        try {
          const fetchedOffers = await fetchOffersForItem(liquidId)
          setOffers(fetchedOffers)
        } catch (error) {
          console.error("Error fetching offers:", error)
        } finally {
          setLoadingOffers(false)
        }
      }
      
      fetchOffers()
    }
  }, [activeTab, liquidId])

  useEffect(() => {
    if (hasRunRef.current) return
    hasRunRef.current = true
    
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
        
        // Debug provider and network status
        try {
          const network = await provider.getNetwork();
          const blockNumber = await provider.getBlockNumber();
          console.log(`Connected to network: ${network.name} (chainId: ${network.chainId})`);
          console.log(`Current block number: ${blockNumber}`);
        } catch (err) {
          console.log("Error getting network info:", err);
        }
        
        // Get asset data with detailed debugging
        console.log(`Fetching asset data for liquidId: ${liquidId}`);
        let assetData = await liquidIdContract.getAsset(liquidId)
        console.log(`Raw asset data for ${liquidId}:`, assetData);
        
        // Check if assetData is valid
        if (!assetData || !assetData.owner || assetData.owner === "0x0000000000000000000000000000000000000000") {
          console.log(`Asset ${liquidId} returned invalid data, trying with block number...`);
          
          // Try with a specific block number (latest - 10 blocks)
          try {
            const currentBlock = await provider.getBlockNumber();
            const fallbackBlock = currentBlock ? currentBlock - 10 : undefined;
            if (fallbackBlock && fallbackBlock > 0) {
              console.log(`Trying to fetch ${liquidId} at block ${fallbackBlock}`);
              assetData = await liquidIdContract.getAsset(liquidId, { blockTag: fallbackBlock });
              console.log(`Asset data at block ${fallbackBlock}:`, assetData);
            }
          } catch (err) {
            console.log(`Error fetching ${liquidId} at fallback block:`, err);
          }
        }
        
        if (!assetData) {
          console.log(`Asset ${liquidId} returned null/undefined after fallback`);
          setError("Asset not found or inactive")
          setLoading(false)
          return
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
        
        setAsset(assetData)

        // Check if asset exists and is active
        if (!assetData.isActive) {
          console.log(`Asset ${liquidId} is not active`);
          setError("Asset not found or inactive")
          setLoading(false)
          return
        }

        try {
          console.log(`Fetching sale data for liquidId: ${liquidId}`);
          
          // Get current block number for debugging
          let currentBlock;
          try {
            currentBlock = await provider.getBlockNumber();
            console.log(`Current block for sale ${liquidId}: ${currentBlock}`);
          } catch (err) {
            console.log(`Error getting block number for sale ${liquidId}:`, err);
          }
          
          let saleData = await marketplaceContract.getSale(liquidId)
          console.log(`Raw sale data for ${liquidId}:`, saleData)
          
          // Check if sale data is valid
          if (!saleData || !saleData.seller || saleData.seller === "0x0000000000000000000000000000000000000000") {
            console.log(`Sale ${liquidId} returned invalid data, trying with block number...`);
            
            // Try with a specific block number (latest - 10 blocks)
            try {
              const fallbackBlock = currentBlock ? currentBlock - 10 : undefined;
              if (fallbackBlock && fallbackBlock > 0) {
                console.log(`Trying to fetch sale ${liquidId} at block ${fallbackBlock}`);
                saleData = await marketplaceContract.getSale(liquidId, { blockTag: fallbackBlock });
                console.log(`Sale data at block ${fallbackBlock}:`, saleData);
              }
            } catch (err) {
              console.log(`Error fetching sale ${liquidId} at fallback block:`, err);
            }
          }
          
          if (saleData) {
            console.log(`Sale ${liquidId} details:`, {
              seller: saleData.seller,
              isActive: saleData.isActive,
              sellType: saleData.sellType,
              fixedPrice: saleData.fixedPrice,
              startingPrice: saleData.startingPrice,
              endTime: saleData.endTime,
              hasSeller: !!saleData.seller,
              isActiveValue: saleData.isActive
            });
          }
          
          console.log("Sale data from contract:", saleData)
          setListing(saleData)
        } catch (saleErr) {
          console.log("No sale found for this asset:", saleErr)
          setListing(null)
        }
        
        // Fetch metadata
        let meta = null
        let imageUri = ""
        try {
          meta = await fetchMetadata(assetData.metadataURI)
          if (meta) {
            setMetadata(meta)
            imageUri = meta.image || ""
            if (imageUri && imageUri.startsWith("ipfs://")) imageUri = resolveIpfs(imageUri) || ""
            // Fetch collection name from API if collection id is present
            if (meta.collection) {
              try {
                const colRes = await fetch(`/api/collections?id=${meta.collection}`)
                if (colRes.ok) {
                  const colData = await colRes.json()
                  if (colData && colData.collection && colData.collection.name) {
                    setCollectionName(colData.collection.name)
                    setCollectionLogo(colData.collection.logoUrl || "")
                  } else {
                    setCollectionName("Unknown Collection")
                    setCollectionLogo("")
                  }
                } else {
                  setCollectionName("Unknown Collection")
                  setCollectionLogo("")
                }
              } catch {
                setCollectionName("Unknown Collection")
                setCollectionLogo("")
              }
            } else {
              setCollectionName("Unknown Collection")
              setCollectionLogo("")
            }
            // Try to get owner avatar from metadata if available
            setOwnerAvatar(meta.ownerAvatar || "")
          }
        } catch (err) {
          console.log("Error fetching main item metadata:", err)
        }
        
        // Fetch owner's profile avatar
        if (assetData.owner) {
          try {
            const profileRes = await fetch(`/api/profile?address=${assetData.owner}`)
            if (profileRes.ok) {
              const profileData = await profileRes.json()
              if (profileData && profileData.profile && profileData.profile.avatar) {
                setOwnerAvatar(profileData.profile.avatar)
              } else {
                setOwnerAvatar("")
              }
            } else {
              setOwnerAvatar("")
            }
          } catch (profileErr) {
            console.log("Error fetching owner profile:", profileErr)
            setOwnerAvatar("")
          }
        }
        
        if (!imageUri || typeof imageUri !== 'string' || !imageUri.startsWith('http')) {
          const fallbackIndex = parseInt(liquidId, 10) % fallbackNftImages.length
          setImage((fallbackNftImages[fallbackIndex] as string) || "")
        } else {
          setImage((imageUri as string) || "")
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch item details")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [liquidId])

  // Fetch related NFTs function
  const fetchRelatedNfts = useCallback(async () => {
    try {
      let provider: ethers.BrowserProvider | ethers.JsonRpcProvider
      if (typeof window !== "undefined" && (window as any).ethereum) {
        provider = new ethers.BrowserProvider((window as any).ethereum)
      } else {
        provider = new ethers.JsonRpcProvider("https://testnet-rpc.plume.org")
      }
      
      const liquidIdContract = new ethers.Contract(LIQUIDID_ADDRESS, LIQUIDID_ABI, provider)
      const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider)
      
      // Get all active listings from the marketplace
      const relatedNftsData = []
      
      // Fetch listings in batches of 50 for efficiency
      const batchSize = 50
      let from = 0
      let hasMore = true
      
      while (hasMore && relatedNftsData.length < 4) {
        try {
          const sales = await marketplaceContract.getSaleArray(from, batchSize)
          
          for (const sale of sales) {
            // Skip if no sale, not active, or it's the current item
            if (!sale || !sale.isActive || sale.liquidId.toString() === liquidId) {
              continue
            }
            
            // Get the appropriate price based on sale type
            const price = sale.sellType.toString() === "0" ? sale.fixedPrice : sale.startingPrice
            if (price.toString() === "0") {
              continue
            }
            
            try {
              // Get asset data
              const assetData = await liquidIdContract.getAsset(sale.liquidId.toString())
              
              // Fetch metadata
              let meta = null
              try {
                meta = await fetchMetadata(assetData.metadataURI)
              } catch (err) {
                continue
              }
              
              // Check if it's from the same collection
              if (meta && meta.collection && metadata && metadata.collection && meta.collection === metadata.collection) {
                let imageUri = meta.image || ""
                if (imageUri && imageUri.startsWith("ipfs://")) {
                  imageUri = resolveIpfs(imageUri) || ""
                }
                
                if (!imageUri || typeof imageUri !== 'string' || !imageUri.startsWith('http')) {
                  const fallbackIndex = parseInt(sale.liquidId.toString(), 10) % fallbackNftImages.length
                  imageUri = fallbackNftImages[fallbackIndex]
                }
                
                relatedNftsData.push({
                  name: meta.name || `NFT #${sale.liquidId}`,
                  image: imageUri,
                  collectionName: collectionName,
                  verified: true,
                  price: ethers.formatUnits(price, 18),
                  liquidId: sale.liquidId.toString(),
                  saleType: Number(sale.sellType),
                  endTime: sale.endTime.toString()
                })
                
                // Stop when we have 4 items
                if (relatedNftsData.length >= 4) {
                  break
                }
              }
            } catch (err) {
              continue
            }
          }
          
          // Check if we have more sales to fetch
          if (sales.length < batchSize) {
            hasMore = false
          } else {
            from += batchSize
          }
        } catch (err) {
          console.log("Error fetching listings batch:", err)
          hasMore = false
        }
      }
      
      console.log("Related LIDs data:", relatedNftsData)
      setRelatedLids(relatedNftsData)
    } catch (err) {
      console.log("Error fetching related LIDs:", err)
      setRelatedLids([])
    }
  }, [liquidId, metadata?.collection, collectionName])

  // Fetch seller NFTs function
  const fetchSellerNfts = useCallback(async () => {
    try {
      let provider: ethers.BrowserProvider | ethers.JsonRpcProvider
      if (typeof window !== "undefined" && (window as any).ethereum) {
        provider = new ethers.BrowserProvider((window as any).ethereum)
      } else {
        provider = new ethers.JsonRpcProvider("https://testnet-rpc.plume.org")
      }
      
      const liquidIdContract = new ethers.Contract(LIQUIDID_ADDRESS, LIQUIDID_ABI, provider)
      const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider)
      
      // Get all active listings from the marketplace
      const sellerNftsData = []
      
      // Fetch listings in batches of 50 for efficiency
      const batchSize = 50
      let from = 0
      let hasMore = true
      
      while (hasMore && sellerNftsData.length < 4) {
        try {
          const sales = await marketplaceContract.getSaleArray(from, batchSize)
          
          for (const sale of sales) {
            // Skip if no sale, not active, or it's the current item
            if (!sale || !sale.isActive || sale.liquidId.toString() === liquidId) {
              continue
            }
            // Get the appropriate price based on sale type
            const price = sale.sellType.toString() === "0" ? sale.fixedPrice : sale.startingPrice
            if (price.toString() === "0") {              
              continue
            }
            
            try {
              // Get asset data
              const assetData = await liquidIdContract.getAsset(sale.liquidId.toString())
              
              // Check if it's from the same seller
              if (assetData.owner === asset?.owner) {
                // Fetch metadata
                let meta = null
                try {
                  meta = await fetchMetadata(assetData.metadataURI)
                } catch (err) {
                  continue
                }
                
                let imageUri = meta?.image || ""
                if (imageUri && imageUri.startsWith("ipfs://")) {
                  imageUri = resolveIpfs(imageUri) || ""
                }
                
                if (!imageUri || typeof imageUri !== 'string' || !imageUri.startsWith('http')) {
                  const fallbackIndex = parseInt(sale.liquidId.toString(), 10) % fallbackNftImages.length
                  imageUri = fallbackNftImages[fallbackIndex]
                }
                
                // Get collection name for this item
                let itemCollectionName = "Unknown Collection"
                if (meta && meta.collection) {
                  try {
                    const colRes = await fetch(`/api/collections?id=${meta.collection}`)
                    if (colRes.ok) {
                      const colData = await colRes.json()
                      if (colData && colData.collection && colData.collection.name) {
                        itemCollectionName = colData.collection.name
                      }
                    }
                  } catch (err) {
                    // Use default collection name
                  }
                }
                
                sellerNftsData.push({
                  name: meta?.name || `LID #${sale.liquidId}`,
                  image: imageUri,
                  collectionName: itemCollectionName,
                  verified: true,
                  price: ethers.formatUnits(price, 18),
                  liquidId: sale.liquidId.toString(), 
                  saleType: Number(sale.sellType),
                  endTime: sale.endTime.toString()
                })
                
                // Stop when we have 4 items
                if (sellerNftsData.length >= 4) {
                  break
                }
              }
            } catch (err) {
              continue
            }
          }
          
          // Check if we have more sales to fetch
          if (sales.length < batchSize) {
            hasMore = false
          } else {
            from += batchSize
          }
        } catch (err) {
          console.log("Error fetching seller listings batch:", err)
          hasMore = false
        }
      }
      
      console.log("Seller LIDs data:", sellerNftsData)
      setSellerLids(sellerNftsData)
    } catch (err) {
      console.log("Error fetching seller LIDs:", err)
      setSellerLids([])
    }
  }, [liquidId, asset?.owner])

  // Separate useEffect for related NFTs
  useEffect(() => {
    if (metadata && collectionName && metadata.collection) {
      fetchRelatedNfts()
    }
  }, [fetchRelatedNfts])

  // Separate useEffect for seller NFTs
  useEffect(() => {
    if (asset?.owner) {
      fetchSellerNfts()
    }
  }, [fetchSellerNfts])

  // Fetch offers for this item
  const fetchOffers = async () => {
    try {
      console.log("Fetching offers for liquidId:", liquidId)
      setLoadingOffers(true)
      const offersData = await fetchOffersForItem(liquidId)
      console.log("Received offers data:", offersData)
      setOffers(offersData)
    } catch (error) {
      console.error("Error fetching offers:", error)
    } finally {
      setLoadingOffers(false)
    }
  }

  // Fetch offers when tab is active
  useEffect(() => {
    if (activeTab === "Offers") {
      fetchOffers()
    }
  }, [activeTab, liquidId])

  const handleBuyClick = async () => {
    // Check if wallet is connected
    if (!isConnected) {
      setWalletDialogOpen(true)
      return
    }
    
    // Check if the user is the owner of the item
    try {
      let provider: ethers.BrowserProvider | ethers.JsonRpcProvider
      if (typeof window !== "undefined" && (window as any).ethereum) {
        provider = new ethers.BrowserProvider((window as any).ethereum)
      } else {
        provider = new ethers.JsonRpcProvider("https://testnet-rpc.plume.org")
      }
      
      const signer = await provider.getSigner()
      const userAddress = await signer.getAddress()
      
      // Check if user is the owner
      if (userAddress.toLowerCase() === owner.toLowerCase()) {
        // Show notification that user cannot buy their own item
        setBuyError("You cannot buy your own item.")
        return
      }
      
      // Open bid popup
      setBidPopupOpen(true)
    } catch (error) {
      console.error("Error checking ownership:", error)
      // If there's an error checking ownership, still allow the purchase attempt
      setBidPopupOpen(true)
    }
  }

  const handleMakeOfferClick = async () => {
    // Check if wallet is connected
    if (!isConnected) {
      setWalletDialogOpen(true)
      return
    }
    
    // Check if the user is the owner of the item
    try {
      let provider: ethers.BrowserProvider | ethers.JsonRpcProvider
      if (typeof window !== "undefined" && (window as any).ethereum) {
        provider = new ethers.BrowserProvider((window as any).ethereum)
      } else {
        provider = new ethers.JsonRpcProvider("https://testnet-rpc.plume.org")
      }
      
      const signer = await provider.getSigner()
      const userAddress = await signer.getAddress()
      
      // Check if user is the owner
      if (userAddress.toLowerCase() === owner.toLowerCase()) {
        // Show notification that user cannot make offer on their own item
        setOfferError("You cannot make an offer on your own item.")
        return
      }
      
      // Open offer popup
      setOfferPopupOpen(true)
    } catch (error) {
      console.error("Error checking ownership:", error)
      // If there's an error checking ownership, still allow the offer attempt
      setOfferPopupOpen(true)
    }
  }

  const handleMakeOffer = async (offerPrice: string, expireDate: string) => {
    if (!listing) return
    
    setIsMakingOffer(true)
    setOfferError(null)
    
    try {
      let provider: ethers.BrowserProvider | ethers.JsonRpcProvider
      if (typeof window !== "undefined" && (window as any).ethereum) {
        provider = new ethers.BrowserProvider((window as any).ethereum)
      } else {
        provider = new ethers.JsonRpcProvider("https://testnet-rpc.plume.org")
      }
      
      const signer = await provider.getSigner()
      const userAddress = await signer.getAddress()
      
      // Convert expire date string to timestamp
      const expireTimestamp = convertExpireDateToTimestamp(expireDate)
      
      // Step 1: Check and approve Hunos tokens for the offer amount
      const hunosToken = new ethers.Contract(HUNOS_TOKEN_ADDRESS, HUNOS_TOKEN_ABI, signer)
      
      // Convert offer price to wei (18 decimals)
      const offerAmount = ethers.parseUnits(offerPrice, 18)
      
      // Check current allowance
      const currentAllowance = await hunosToken.allowance(userAddress, MARKETPLACE_ADDRESS)
      
      console.log("Current allowance:", ethers.formatUnits(currentAllowance, 18))
      console.log("Required amount for offer:", ethers.formatUnits(offerAmount, 18))
      
      // If allowance is insufficient, request approval
      if (currentAllowance < offerAmount) {
        console.log("Insufficient allowance, requesting approval...")
        
        const approveTx = await hunosToken.approve(MARKETPLACE_ADDRESS, offerAmount)
        console.log("Approval transaction:", approveTx.hash)
        
        // Wait for approval transaction to be confirmed
        await approveTx.wait()
        console.log("Approval transaction confirmed!")
      }
      
      // Step 2: Execute the make offer transaction
      const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider)
      const contractWithSigner = marketplaceContract.connect(signer) as any
      
              console.log("Making offer for asset:", liquidId, "with price:", offerAmount.toString(), "expires at timestamp:", expireTimestamp)
        
        // Note: This would need to be implemented in the smart contract
        // For now, we'll simulate the transaction
        const tx = await contractWithSigner.makeOffer(liquidId, offerAmount, expireTimestamp)
      
      console.log("Make offer transaction:", tx.hash)
      await tx.wait()
      console.log("Make offer transaction confirmed!")
      
      // Close popup and show success
      setOfferPopupOpen(false)
      setShowSuccessNotification(true)
      setTimeout(() => {
        router.push("/profile?tab=items")
      }, 2000)
      
    } catch (error: any) {
      let errorMessage = "Failed to make offer"
      
      if (error.reason) {
        errorMessage = error.reason
      } else if (error.message) {
        errorMessage = error.message
      }
      
      // Format common error messages
      if (errorMessage.includes("Insufficient balance")) {
        errorMessage = "You don't have enough Hunos tokens to make this offer."
      } else if (errorMessage.includes("Item not listed")) {
        errorMessage = "This item is no longer available for offers."
      } else if (errorMessage.includes("Not the owner")) {
        errorMessage = "You cannot make an offer on your own item."
      } else if (errorMessage.includes("ERC20: insufficient allowance")) {
        errorMessage = "Token approval failed. Please try again."
      }
      
      setOfferError(errorMessage)
    } finally {
      setIsMakingOffer(false)
    }
  }

  const handleBuy = async () => {
    if (!listing) return
    
    setIsBuying(true)
    setBuyError(null)
    
    try {
      let provider: ethers.BrowserProvider | ethers.JsonRpcProvider
      if (typeof window !== "undefined" && (window as any).ethereum) {
        provider = new ethers.BrowserProvider((window as any).ethereum)
      } else {
        provider = new ethers.JsonRpcProvider("https://testnet-rpc.plume.org")
      }
      
      const signer = await provider.getSigner()
      const userAddress = await signer.getAddress()
      
      // Step 1: Check and approve Hunos tokens
      const hunosToken = new ethers.Contract(HUNOS_TOKEN_ADDRESS, HUNOS_TOKEN_ABI, signer)
      
      // Get the appropriate price based on sale type
      const requiredAmount = Number(listing.sellType) === 0 ? listing.fixedPrice : listing.startingPrice
      
      // Check current allowance
      const currentAllowance = await hunosToken.allowance(userAddress, MARKETPLACE_ADDRESS)
      
      console.log("Current allowance:", ethers.formatUnits(currentAllowance, 18))
      console.log("Required amount:", ethers.formatUnits(requiredAmount, 18))
      
      // If allowance is insufficient, request approval
      if (currentAllowance < requiredAmount) {
        console.log("Insufficient allowance, requesting approval...")
        
        const approveTx = await hunosToken.approve(MARKETPLACE_ADDRESS, requiredAmount)
        console.log("Approval transaction:", approveTx.hash)
        
        // Wait for approval transaction to be confirmed
        await approveTx.wait()
        console.log("Approval transaction confirmed!")
      }
      
      // Step 2: Execute the buy transaction
      const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider)
      const contractWithSigner = marketplaceContract.connect(signer) as any
      
      console.log("Buying asset:", liquidId, "for price:", requiredAmount.toString())
      
      const tx = await contractWithSigner.buyFixedPriceSale(liquidId)
      
      console.log("Buy transaction:", tx.hash)
      await tx.wait()
      console.log("Buy transaction confirmed!")
      
      // Show success notification and redirect
      setShowSuccessNotification(true)
      setTimeout(() => {
        router.push("/profile?tab=items")
      }, 2000)
      
    } catch (error: any) {
      let errorMessage = "Failed to buy item"
      
      if (error.reason) {
        errorMessage = error.reason
      } else if (error.message) {
        errorMessage = error.message
      }
      
      // Format common error messages
      if (errorMessage.includes("Insufficient balance")) {
        errorMessage = "You don't have enough Hunos tokens to buy this item."
      } else if (errorMessage.includes("Item not listed")) {
        errorMessage = "This item is no longer available for purchase."
      } else if (errorMessage.includes("Not the owner")) {
        errorMessage = "You cannot buy your own item."
      } else if (errorMessage.includes("ERC20: insufficient allowance")) {
        errorMessage = "Token approval failed. Please try again."
      }
      
      setBuyError(errorMessage)
    } finally {
      setIsBuying(false)
    }
  }

  if (loading) return <div className="container mx-auto py-8 text-center">Loading...</div>
  if (error) return <div className="container mx-auto py-8 text-center text-red-500">{error}</div>
  if (!listing) return <div className="container mx-auto py-8 text-center text-red-500">Item not found or not listed for sale</div>

  // Extract info from metadata and asset
  const name = metadata?.name || asset?.name || `NFT #${liquidId}`
  const description = metadata?.description || "No description."
  const owner = asset?.owner || "-"
  const price = listing && listing.isActive ? 
    (Number(listing.sellType) === 0 ? ethers.formatUnits(listing.fixedPrice, 18) : ethers.formatUnits(listing.startingPrice, 18)) : 
    "-"
  
  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log("Buy page data:", {
      listing,
      saleType: listing?.sellType,
      fixedPrice: listing?.fixedPrice,
      startingPrice: listing?.startingPrice,
      isActive: listing?.isActive,
      price
    })
  }
  const usdPrice = `$${parseFloat(price).toFixed(2)}`
  const contractAddress = LIQUIDID_ADDRESS
  const tokenStandard = "ERC20"
  const blockchain = "Plume"
  const metadataType = "Centralized"
  const attributes = Array.isArray(metadata?.attributes) ? metadata.attributes : []

  return (
    <div className="w-full min-h-screen bg-[#090909] text-white">
      <div className="container mx-auto px-6 py-10 flex flex-col md:flex-row gap-10">
        {/* Left: Image and Price */}
        <div className="flex flex-col items-center w-full">
          <div className="bg-[#232423] rounded-2xl flex items-center justify-center min-h-[480px] h-[480px] w-[480px] border border-[#2b2c2b]">
            {image && <img src={image} alt={name} />}
          </div>
          {/* Price and Buy Section */}
          <div className="w-full mt-8">
            <div className="bg-[#181918] rounded-2xl p-6 flex flex-col gap-4 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-gray-400 text-sm">Price</div>
                  <div className="text-2xl font-bold text-white">{price} HUNOS</div>
                  <div className="text-xs text-gray-400 mt-1">{usdPrice}</div>
                </div>
                <div className="flex flex-col items-end">
                  <span 
                    onClick={handleMakeOfferClick}
                    className="text-green-400 font-semibold cursor-pointer text-sm hover:text-green-300 transition-colors"
                  >
                    Make Offer <span className="text-xs text-gray-400 font-normal cursor-default">to buy at another price</span>
                  </span>
                </div>
              </div>
              <button 
                disabled={isBuying}
                onClick={handleBuyClick}
                className={`w-full font-bold py-3 rounded-xl text-lg transition-colors ${
                  isBuying 
                    ? "bg-gray-500 text-gray-300 cursor-not-allowed" 
                    : "bg-lime-400 text-black hover:bg-lime-300"
                }`}
              >
                {isBuying ? "Buying..." : "Buy Now"}
              </button>
              
              {/* Error Message */}
              {buyError && (
                <div className="p-3 bg-red-900 border border-red-700 rounded-lg text-red-200 text-sm">
                  Error: {buyError}
                </div>
              )}
              
              {/* Offer Error Message */}
              {offerError && (
                <div className="p-3 bg-red-900 border border-red-700 rounded-lg text-red-200 text-sm">
                  Error: {offerError}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right: Details */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-extrabold mb-2 leading-tight">{name}</h1>
            <div className="flex flex-row gap-16 mb-2">
              {/* Collection */}
              <div className="flex flex-row items-center gap-4">
                <div className="w-16 h-16 relative flex-shrink-0">
                  <svg width="100%" height="100%" viewBox="0 0 80 80">
                    <polygon points="40,5 74,22.5 74,57.5 40,75 6,57.5 6,22.5" fill="#232423" />
                  </svg>
                  {collectionLogo && (
                    <img
                      src={collectionLogo}
                      alt="Collection logo"
                      className="absolute top-0 left-0 w-16 h-16 object-cover"
                      style={{ clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)" }}
                    />
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-gray-400 text-base mb-1">Collection</span>
                  <Link 
                    href={metadata?.collection ? `/marketplace/collections/${metadata.collection}` : "#"}
                    className="text-white font-bold text-lg flex items-center gap-2 cursor-pointer hover:text-green-400 transition-colors"
                  >
                    {collectionName}
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-lime-400"><Check className="w-4 h-4 text-black" /></span>
                  </Link>
                </div>
              </div>
              {/* Owner */}
              <div className="flex flex-row items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.location.href = `/profile/${owner}`}>
                <div className="w-16 h-16 relative flex-shrink-0">
                  <svg width="100%" height="100%" viewBox="0 0 80 80">
                    <polygon points="40,5 74,22.5 74,57.5 40,75 6,57.5 6,22.5" fill="#232423" />
                  </svg>
                  {ownerAvatar ? (
                    <img
                      src={ownerAvatar}
                      alt="Owner avatar"
                      className="absolute top-0 left-0 w-16 h-16 object-cover"
                      style={{ clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)" }}
                    />
                  ) : (
                    <div className="absolute top-0 left-0 w-16 h-16 flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-gray-400 text-base mb-1">Owner</span>
                  <span className="text-white font-bold text-lg flex items-center gap-2">{owner.slice(0, 6)}...{owner.slice(-4)}</span>
                </div>
              </div>
              {/* Liquidity */}
              <div className="flex flex-row items-center gap-4">
                <div className="w-16 h-16 relative flex-shrink-0">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                    {/* Background circle */}
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="#232423"
                      strokeWidth="4"
                      fill="none"
                    />
                    {/* Progress circle - 70% = 252 degrees (70% of 360) */}
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="#84cc16"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 28 * 0.7} ${2 * Math.PI * 28}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lime-400 font-bold text-lg">70%</span>
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-gray-400 text-base mb-1">Liquidity</span>
                  <span className="text-white font-bold text-lg flex items-center gap-2">{owner.slice(0, 6)}...{owner.slice(-4)}</span>
                </div>
              </div>
            </div>
            <div className="text-gray-400 text-xl leading-relaxed mt-2 mb-4 max-w-3xl">{description}</div>
          </div>
          
          {/* Tabs */}
          <div className="flex mb-2 w-full">
            {["Items", "Offers", "Bids", "Rewards", "Info"].map((tab, index) => (
              <button
                key={tab}
                className={cn(
                  "flex-1 px-6 py-3 font-medium text-sm transition-colors",
                  activeTab === tab 
                    ? "bg-white text-black" 
                    : "bg-[#181918] text-white",
                  index === 0 ? "rounded-l-lg" : "",
                  index === 4 ? "rounded-r-lg" : "",
                  index > 0 && index < 4 ? "rounded-none" : ""
                )}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          <div className="bg-[#181918] rounded-2xl p-6 flex flex-col gap-2 w-full h-full">
            {activeTab === "Items" && (
              <div className="text-gray-400">No items found.</div>
            )}
            {activeTab === "Offers" && (
              <>
                {loadingOffers ? (
                  <div className="text-gray-400 text-center py-8">Loading offers...</div>
                ) : offers.length === 0 ? (
                  <div className="text-gray-400 text-center py-8">No offers yet for this item.</div>
                ) : (
                  <div className="space-y-4">
                    {offers.map((offer, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-[#232423] rounded-lg">
                        <div className="flex items-center gap-3">
                          <HexagonAvatar 
                            src={offer.buyerAvatar}
                            alt={`${offer.buyerShort} avatar`}
                            size="sm"
                            fallbackInitial={offer.buyerInitial}
                          />
                          <div>
                            <div className="text-white font-medium">{offer.buyerShort}</div>
                            <div className="text-gray-400 text-sm">{offer.timeAgo}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium">{offer.formattedAmount}</div>
                          <div className="text-gray-400 text-sm">{offer.usdAmount}</div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          offer.status === 'pending' 
                            ? 'bg-yellow-500 text-black' 
                            : offer.status === 'accepted'
                            ? 'bg-green-500 text-black'
                            : offer.status === 'cancelled'
                            ? 'bg-red-500 text-white'
                            : offer.status === 'expired'
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-500 text-white'
                        }`}>
                          {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            {activeTab === "Bids" && <div className="text-gray-400">No bids yet.</div>}
            {activeTab === "Rewards" && <div className="text-gray-400">No rewards available.</div>}
            {activeTab === "Attributes" && (
              <>
                {attributes.length === 0 && <div className="text-gray-400">No attributes found.</div>}
                {attributes.length > 0 && (
                  <table className="w-full text-left">
                    <tbody>
                      {attributes.map((attr: any, i: number) => (
                        <tr key={i} className="border-b border-[#232423] last:border-b-0">
                          <td className="py-2 text-gray-400 w-1/2">{attr.trait_type || attr.type || "-"}</td>
                          <td className="py-2 text-white w-1/2">{attr.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}
            {activeTab === "Info" && (
              <>
                <div className="flex items-center justify-between text-gray-400 text-base mb-1">
                  <span>Contract</span>
                  <span className="text-white flex items-center gap-1 cursor-pointer">{contractAddress.slice(0, 6)}...{contractAddress.slice(-4)} <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M14 3h7v7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 19l16-16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                </div>
                <div className="flex items-center justify-between text-gray-400 text-base mb-1">
                  <span>Token ID</span>
                  <span className="text-white flex items-center gap-1 cursor-pointer">{liquidId} <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M14 3h7v7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 19l16-16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                </div>
                <div className="flex items-center justify-between text-gray-400 text-base mb-1">
                  <span>Token Standard</span>
                  <span className="text-white">{tokenStandard}</span>
                </div>
                <div className="flex items-center justify-between text-gray-400 text-base mb-1">
                  <span>Blockchain</span>
                  <span className="text-white">{blockchain}</span>
                </div>
                <div className="flex items-center justify-between text-gray-400 text-base mb-1">
                  <span>Metadata</span>
                  <span className="text-white flex items-center gap-1 cursor-pointer">{metadataType} <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M14 3h7v7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 19l16-16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                </div>
                <div className="mt-auto text-xs text-green-400 cursor-pointer">You can <span className="font-semibold cursor-pointer hover:text-green-300 transition-colors" onClick={() => setReportDialogOpen(true)}>Report any problem</span> you find.</div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Activities Section */}
      <div className="container mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Activities</h2>
        </div>
        
        <ActivitiesTable activityFilter="all" liquidId={liquidId} />
      </div>
      
      {/* More from Collection Section */}
      <div className="container mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-white mb-6">More from {collectionName}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {relatedLids.length > 0 ? (
            relatedLids.map((lid, index) => {
              return <NftCardDiscover key={index} nft={lid} index={index} />
            })
          ) : (
            <div className="col-span-full text-center text-gray-400 py-8">
              No other items from this collection are currently listed for sale.
            </div>
          )}
        </div>
        
        <div className="flex justify-center">
          <button className="px-8 py-3 border border-lime-400 text-white rounded-lg hover:bg-lime-400 hover:text-black transition-colors">
            View More
          </button>
        </div>
      </div>
      
      {/* More from Seller Section */}
      <div className="container mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-white mb-6">More from the seller</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {sellerLids.length > 0 ? (
            sellerLids.map((lid, index) => {
              console.log("Rendering seller LID card with data:", lid)
              return <NftCardDiscover key={index} nft={lid} index={index} />
            })
          ) : (
            <div className="col-span-full text-center text-gray-400 py-8">
              No other items from this seller are currently listed for sale.
            </div>
          )}
        </div>
        
        <div className="flex justify-center">
          <button className="px-8 py-3 border border-lime-400 text-white rounded-lg hover:bg-lime-400 hover:text-black transition-colors">
            View More
          </button>
        </div>
      </div>
      
      {/* Newsletter Section */}
      <NewsletterSection />
      
      {/* Success Notification */}
      {showSuccessNotification && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-3">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <div className="font-semibold">Purchase Successful!</div>
            <div className="text-sm opacity-90">Redirecting to your profile...</div>
          </div>
        </div>
      )}
      
      {/* Wallet Connect Dialog */}
      <WalletConnectDialog
        open={walletDialogOpen}
        onOpenChange={setWalletDialogOpen}
        onWalletSelect={(walletId) => {
          console.log("Selected wallet:", walletId)
          setWalletDialogOpen(false)
        }}
      />
      
      {/* Bid Popup */}
      <BidPopup
        open={bidPopupOpen}
        onOpenChange={setBidPopupOpen}
        nftData={{
          name: name,
          image: image,
          price: price,
          collectionName: collectionName
        }}
        onBuy={handleBuy}
        isBuying={isBuying}
        sellType={listing?.sellType}
      />
      
      {/* Offer Popup */}
      <OfferPopup
        open={offerPopupOpen}
        onOpenChange={setOfferPopupOpen}
        nftData={{
          name: name,
          image: image,
          price: price,
          collectionName: collectionName
        }}
        onMakeOffer={handleMakeOffer}
        isMakingOffer={isMakingOffer}
        sellType={listing?.sellType}
      />
      
      {/* Report Dialog */}
      <ReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        itemId={liquidId}
        itemName={name}
      />
    </div>
  )
} 