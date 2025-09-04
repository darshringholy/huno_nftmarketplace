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
import ReportDialog from "@/components/ui/report-dialog"
import { useWallet } from "@/hooks/use-wallet"
import ActivitiesTable from "@/components/marketplace/discover/activities-table"

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

export default function BidPage({ params }: { params: Promise<{ liquidId: string }> }) {
  const { liquidId } = React.use(params)
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
  const [activeTab, setActiveTab] = useState("Bids")
  const [isBidding, setIsBidding] = useState(false)
  const [bidError, setBidError] = useState<string | null>(null)
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 0, minutes: 0, seconds: 0 })
  const [currentBid, setCurrentBid] = useState<string>("")
  const [minBidAmount, setMinBidAmount] = useState<string>("")
  const [bids, setBids] = useState<any[]>([])
  const [loadingBids, setLoadingBids] = useState(false)
  const [offers, setOffers] = useState<Offer[]>([])
  const [loadingOffers, setLoadingOffers] = useState(false)
  
  // Auto-hide error message after 5 seconds
  useEffect(() => {
    if (bidError) {
      const timer = setTimeout(() => {
        setBidError(null)
      }, 5000) // 5 seconds
      
      return () => clearTimeout(timer)
    }
  }, [bidError])
  
  const [relatedLids, setRelatedLids] = useState<any[]>([])
  const [sellerLids, setSellerLids] = useState<any[]>([])
  const [walletDialogOpen, setWalletDialogOpen] = useState(false)
  const [bidPopupOpen, setBidPopupOpen] = useState(false)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)
  const hasRunRef = useRef(false)
  
  const { address, isConnected } = useWallet()

  // Countdown timer effect
  useEffect(() => {
    if (!listing?.endTime) return;

    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const endTime = Number(listing.endTime);
      const difference = endTime - now;

      if (difference > 0) {
        const hours = Math.floor(difference / 3600);
        const minutes = Math.floor((difference % 3600) / 60);
        const seconds = difference % 60;
        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [listing?.endTime]);

  // Check if auction is expired and user is owner
  const isAuctionExpired = timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;
  const isOwner = asset?.owner && address && asset.owner.toLowerCase() === address.toLowerCase();
  const canFinalizeAuction = isAuctionExpired && isOwner && listing?.isActive;

  const handleFinalizeAuction = async () => {
    if (!canFinalizeAuction) return;
    
    setIsFinalizing(true);
    setBidError(null);
    
    try {
      let provider: ethers.BrowserProvider | ethers.JsonRpcProvider;
      if (typeof window !== "undefined" && (window as any).ethereum) {
        provider = new ethers.BrowserProvider((window as any).ethereum);
      } else {
        provider = new ethers.JsonRpcProvider("https://testnet-rpc.plume.org");
      }
      
      const signer = await provider.getSigner();
      const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider);
      const contractWithSigner = marketplaceContract.connect(signer) as any;
      
      console.log("Finalizing auction for asset:", liquidId);
      
      const tx = await contractWithSigner.endAuctionSale(liquidId);
      
      console.log("Finalize auction transaction:", tx.hash);
      await tx.wait();
      console.log("Finalize auction transaction confirmed!");
      
      // Show success notification and redirect
      setShowSuccessNotification(true);
      setTimeout(() => {
        router.push("/profile?tab=items");
      }, 2000);
      
    } catch (error: any) {
      let errorMessage = "Failed to finalize auction";
      
      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Format common error messages
      if (errorMessage.includes("Auction not ended")) {
        errorMessage = "The auction has not ended yet.";
      } else if (errorMessage.includes("Not the owner")) {
        errorMessage = "Only the auction owner can finalize the auction.";
      } else if (errorMessage.includes("No bids placed")) {
        errorMessage = "No bids were placed on this auction.";
      }
      
      setBidError(errorMessage);
    } finally {
      setIsFinalizing(false);
    }
  };

  // Fetch bid events from blockchain
  const fetchBids = async () => {
    if (!liquidId) return;
    
    console.log("Starting fetchBids with liquidId:", liquidId)
    console.log("liquidId type:", typeof liquidId)
    
    // Validate liquidId
    if (isNaN(Number(liquidId))) {
      console.error("Invalid liquidId:", liquidId)
      return
    }
    
    setLoadingBids(true);
    try {
      let provider: ethers.BrowserProvider | ethers.JsonRpcProvider
      if (typeof window !== "undefined" && (window as any).ethereum) {
        provider = new ethers.BrowserProvider((window as any).ethereum)
      } else {
        provider = new ethers.JsonRpcProvider("https://testnet-rpc.plume.org")
      }
      
      const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider)
      
      // Test basic connectivity
      console.log("Testing blockchain connectivity...")
      const currentBlock = await provider.getBlockNumber()
      console.log("Current block number:", currentBlock)
      
      // Test contract connectivity
      try {
        const contractCode = await provider.getCode(MARKETPLACE_ADDRESS)
        console.log("Contract deployed:", contractCode !== "0x")
        
        // Test a simple contract call
        const paused = await marketplaceContract.paused()
        console.log("Contract paused:", paused)
      } catch (e) {
        console.log("Error checking contract:", e)
      }
      
      const fromBlock = Math.max(0, currentBlock - 50000) // Look back 50,000 blocks
      console.log("Searching blocks from", fromBlock, "to", currentBlock)
      
      // Fetch BidPlaced events for this liquidId
      const liquidIdBigInt = BigInt(liquidId)
      console.log("Using marketplace contract address:", MARKETPLACE_ADDRESS)
      
      // Try both filtered and unfiltered approaches
      let bidEvents = await marketplaceContract.queryFilter(
        marketplaceContract.filters.BidPlaced(liquidIdBigInt),
        fromBlock,
        currentBlock
      )
      
      // Test if we can get any events at all
      try {
        const testEvents = await marketplaceContract.queryFilter(
          marketplaceContract.filters.BidPlaced(),
          fromBlock,
          currentBlock
        )
        console.log("Total BidPlaced events in range:", testEvents.length)
      } catch (e) {
        console.log("Error getting test events:", e)
      }
      
      // If no events found with filter, try getting all BidPlaced events
      if (bidEvents.length === 0) {
        console.log("No events found with filter, trying all BidPlaced events...")
        const allBidEvents = await marketplaceContract.queryFilter(
          marketplaceContract.filters.BidPlaced(),
          fromBlock,
          currentBlock
        )
        console.log("All BidPlaced events found:", allBidEvents.length)
        
        // Filter manually by liquidId
        bidEvents = allBidEvents.filter(event => {
          try {
            const parsedLog = marketplaceContract.interface.parseLog(event)
            return parsedLog && parsedLog.args && parsedLog.args.liquidId === liquidIdBigInt
          } catch (e) {
            console.log("Error parsing event:", e)
            return false
          }
        })
        console.log("Filtered events for liquidId:", bidEvents.length)
      }
      
      console.log("Bid events found:", bidEvents.length)
      console.log("Searching for liquidId:", liquidId, "as BigInt:", liquidIdBigInt)
      
                      // Process bid events
        const bidPromises = bidEvents.map(async (event) => {
          console.log("Processing bid event:", event)
          const parsedLog = marketplaceContract.interface.parseLog(event)
          if (!parsedLog) return null;
          const { liquidId: eventLiquidId, bidder, amount, newEndTime } = parsedLog.args
          console.log("Parsed bid event args:", { eventLiquidId, bidder, amount, newEndTime })
          
          // Get block timestamp
          let timestamp
          try {
            const block = await provider.getBlock(event.blockNumber)
            timestamp = block?.timestamp
            console.log("Block timestamp for block", event.blockNumber, ":", timestamp)
          } catch (e) {
            console.log("Error getting block timestamp:", e)
            timestamp = Date.now() / 1000
          }
          
          if (!timestamp) {
            console.log("No timestamp available, using current time")
            timestamp = Date.now() / 1000
          }
          
          // Format amount
          const formattedAmount = ethers.formatUnits(amount, 18)
          
          // Get current sale data to determine if this bid is still leading
          const currentSale = await marketplaceContract.getSale(liquidIdBigInt)
          const isLeading = currentSale.currentBidder === bidder
          console.log("Current sale data:", currentSale)
          console.log("Is bid leading:", isLeading, "for bidder:", bidder)
          
          return {
            bidder,
            amount: formattedAmount,
            timestamp,
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
            isLeading,
            newEndTime: Number(newEndTime)
          }
        })
        
        const processedBids = (await Promise.all(bidPromises)).filter((result): result is any => result !== null)
      
      // Sort bids by timestamp (newest first)
      const sortedBids = processedBids.sort((a, b) => b.timestamp - a.timestamp)
      
      setBids(sortedBids)
      console.log("Processed bids:", sortedBids)
      
      // If no bids found, try to get current auction state
      if (sortedBids.length === 0) {
        console.log("No bids found, checking current auction state...")
        try {
          const currentSale = await marketplaceContract.getSale(liquidIdBigInt)
          console.log("Current sale data:", currentSale)
          
          // If there's a current bidder, create a mock bid entry
          if (currentSale.currentBidder && currentSale.currentBidder !== "0x0000000000000000000000000000000000000000") {
            // Use auction creation time as a reasonable estimate for the bid time
            const estimatedBidTime = Number(currentSale.createdAt) || (Date.now() / 1000 - 3600) // 1 hour ago as fallback
            const mockBid = {
              bidder: currentSale.currentBidder,
              amount: ethers.formatUnits(currentSale.currentBid, 18),
              timestamp: estimatedBidTime,
              blockNumber: currentBlock,
              transactionHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
              isLeading: true,
              newEndTime: Number(currentSale.endTime)
            }
            console.log("Created mock bid from current sale:", mockBid)
            setBids([mockBid])
          }
        } catch (e) {
          console.log("Error getting current sale:", e)
        }
      }
      
    } catch (error) {
      console.error("Error fetching bids:", error)
    } finally {
      setLoadingBids(false)
    }
  }

  // Fetch offers for this item
  const fetchOffers = async () => {
    try {
      setLoadingOffers(true)
      const offersData = await fetchOffersForItem(liquidId)
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
          
          // Check if this is an auction
          if (saleData && saleData.sellType.toString() !== "1") {
            setError("This item is not an auction. Please visit the buy page instead.")
            setLoading(false)
            return
          }
          
          // Fetch bids for this auction
          await fetchBids()
          
          // Calculate minimum bid amount
          if (saleData && saleData.isActive) {
            const currentPrice = ethers.formatUnits(saleData.startingPrice, 18)
            const minBid = parseFloat(currentPrice) * 1.05 // 5% minimum increase
            setMinBidAmount(minBid.toFixed(2))
            setCurrentBid(currentPrice)
          }
        } catch (saleErr) {
          console.log("No sale found for this asset:", saleErr)
          setError("This item is not currently listed for auction.")
          setLoading(false)
          return
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
            console.log("Fetching owner profile:", assetData.owner)
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
                  const fallbackIndex = parseInt(liquidId, 10) % fallbackLidImages.length
        setImage((fallbackLidImages[fallbackIndex] as string) || "")
        } else {
          setImage((imageUri as string) || "")
        }
        
      } catch (err: any) {
        console.error("Error fetching data:", err)
        setError(err.message || "Failed to load auction data")
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [liquidId])

  const handleBidClick = () => {
    // Check if wallet is connected
    if (!isConnected) {
      setWalletDialogOpen(true)
      return
    }
    
    // Open bid popup
    setBidPopupOpen(true)
  }

  const handleBid = async () => {
    if (!listing) return
    
    setIsBidding(true)
    setBidError(null)
    
    try {
      let provider: ethers.BrowserProvider | ethers.JsonRpcProvider
      if (typeof window !== "undefined" && (window as any).ethereum) {
        provider = new ethers.BrowserProvider((window as any).ethereum)
      } else {
        provider = new ethers.JsonRpcProvider("https://testnet-rpc.plume.org")
      }
      
      const signer = await provider.getSigner()
      const userAddress = await signer.getAddress()
      
      // Step 1: Check and approve Hunos tokens for the bid amount
      const hunosToken = new ethers.Contract(HUNOS_TOKEN_ADDRESS, HUNOS_TOKEN_ABI, signer)
      
      // Convert bid price to wei (18 decimals)
      const bidAmount = ethers.parseUnits(currentBid, 18)
      
      // Check current allowance
      const currentAllowance = await hunosToken.allowance(userAddress, MARKETPLACE_ADDRESS)
      
      console.log("Current allowance:", ethers.formatUnits(currentAllowance, 18))
      console.log("Required amount for bid:", ethers.formatUnits(bidAmount, 18))
      
      // If allowance is insufficient, request approval
      if (currentAllowance < bidAmount) {
        console.log("Insufficient allowance, requesting approval...")
        
        const approveTx = await hunosToken.approve(MARKETPLACE_ADDRESS, bidAmount)
        console.log("Approval transaction:", approveTx.hash)
        
        // Wait for approval transaction to be confirmed
        await approveTx.wait()
        console.log("Approval transaction confirmed!")
      }
      
      // Step 2: Execute the bid transaction
      const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider)
      const contractWithSigner = marketplaceContract.connect(signer) as any
      
      console.log("Placing bid for asset:", liquidId, "with amount:", bidAmount.toString())
      
      const tx = await contractWithSigner.placeBid(liquidId, bidAmount)
      
      console.log("Bid transaction:", tx.hash)
      await tx.wait()
      console.log("Bid transaction confirmed!")
      
      // Show success notification and redirect
      setShowSuccessNotification(true)
      setTimeout(() => {
        router.push("/profile?tab=items")
      }, 2000)
      
    } catch (error: any) {
      let errorMessage = "Failed to place bid"
      
      if (error.reason) {
        errorMessage = error.reason
      } else if (error.message) {
        errorMessage = error.message
      }
      
      // Format common error messages
      if (errorMessage.includes("Insufficient balance")) {
        errorMessage = "You don't have enough Hunos tokens to place this bid."
      } else if (errorMessage.includes("Auction ended")) {
        errorMessage = "This auction has already ended."
      } else if (errorMessage.includes("Bid too low")) {
        errorMessage = "Your bid is too low. Please increase your bid amount."
      } else if (errorMessage.includes("Not the owner")) {
        errorMessage = "You cannot bid on your own auction."
      } else if (errorMessage.includes("ERC20: insufficient allowance")) {
        errorMessage = "Token approval failed. Please try again."
      }
      
      setBidError(errorMessage)
    } finally {
      setIsBidding(false)
    }
  }

  if (loading) return <div className="container mx-auto py-8 text-center">Loading...</div>
  if (error) return <div className="container mx-auto py-8 text-center text-red-500">{error}</div>
  if (!listing) return <div className="container mx-auto py-8 text-center text-red-500">Auction not found or not active</div>

  // Extract info from metadata and asset
  const name = metadata?.name || asset?.name || `LID #${liquidId}`
  const description = metadata?.description || "No description."
  const owner = asset?.owner || "-"
  const price = listing && listing.isActive ? 
    ethers.formatUnits(listing.startingPrice, 18) : 
    "-"
  
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
          {/* Price and Bid Section */}
          <div className="w-full mt-8">
            <div className="bg-[#181918] rounded-2xl p-6 flex flex-col gap-4 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-gray-400 text-sm">Current Bid</div>
                  <div className="text-2xl font-bold text-white">{price} HUNOS</div>
                  <div className="text-xs text-gray-400 mt-1">{usdPrice}</div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-gray-400 text-sm">Auction ends in</div>
                  <div className="text-xl font-bold text-white">
                    {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                </div>
              </div>
              <button 
                disabled={isBidding || isFinalizing || (isAuctionExpired && !canFinalizeAuction)}
                onClick={canFinalizeAuction ? handleFinalizeAuction : handleBidClick}
                className={`w-full font-bold py-3 rounded-xl text-lg transition-colors ${
                  isBidding || isFinalizing || (isAuctionExpired && !canFinalizeAuction)
                    ? "bg-gray-500 text-gray-300 cursor-not-allowed" 
                    : "bg-lime-400 text-black hover:bg-lime-300"
                }`}
              >
                {isBidding ? "Placing Bid..." : 
                 isFinalizing ? "Finalizing Auction..." :
                 canFinalizeAuction ? "Finalize Auction" :
                 isAuctionExpired ? "Auction Ended" : 
                 "Bid"}
              </button>
              
              {/* Error Message */}
              {bidError && (
                <div className="p-3 bg-red-900 border border-red-700 rounded-lg text-red-200 text-sm">
                  Error: {bidError}
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
          <div className="flex flex-col gap-6">
            <div className="flex border-b border-gray-800">
              {["Bids", "Offers", "Rewards", "Info"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === tab
                      ? "text-white border-b-2 border-lime-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            {/* Tab Content */}
            {activeTab === "Bids" && (
              <div className="space-y-4">
                <div className="bg-[#232423] rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-4">Recent Bids</h3>
                  <div className="space-y-3">
                    {loadingBids ? (
                      <div className="text-center text-gray-400 py-4">Loading bids...</div>
                    ) : bids.length === 0 ? (
                      <div className="text-center text-gray-400 py-4">No bids placed yet</div>
                    ) : (
                      bids.map((bid, index) => {
                        const timeAgo = (() => {
                          const now = Math.floor(Date.now() / 1000)
                          const diff = now - bid.timestamp
                          
                          // Handle future timestamps (shouldn't happen but just in case)
                          if (diff < 0) {
                            return 'Just now'
                          }
                          
                          const minutes = Math.floor(diff / 60)
                          const hours = Math.floor(diff / 3600)
                          const days = Math.floor(diff / 86400)
                          const weeks = Math.floor(days / 7)
                          const months = Math.floor(days / 30)
                          
                          if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`
                          if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`
                          if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
                          if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
                          if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
                          return 'Just now'
                        })()
                        
                        const bidderShort = bid.bidder.slice(0, 6) + '...' + bid.bidder.slice(-4)
                        const bidderInitial = bid.bidder.slice(2, 3).toUpperCase()
                        
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-[#1a1b1a] rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 ${bid.isLeading ? 'bg-lime-400' : 'bg-gray-600'} rounded-full flex items-center justify-center`}>
                                <span className={`text-sm font-bold ${bid.isLeading ? 'text-black' : 'text-white'}`}>
                                  {bidderInitial}
                                </span>
                              </div>
                              <div>
                                <div className="text-white font-medium">{bidderShort}</div>
                                <div className="text-gray-400 text-sm">{timeAgo}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-white font-medium">{bid.amount} HUNOS</div>
                              <div className="text-gray-400 text-sm">${(parseFloat(bid.amount) * 250).toFixed(2)}</div>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs font-medium ${
                              bid.isLeading 
                                ? 'bg-lime-400 text-black' 
                                : 'bg-red-500 text-white'
                            }`}>
                              {bid.isLeading ? 'Lead' : 'Outbidded'}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === "Offers" && (
              <div className="space-y-4">
                <div className="bg-[#232423] rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-4">Offers</h3>
                  {loadingOffers ? (
                    <div className="text-center text-gray-400 py-4">Loading offers...</div>
                  ) : offers.length === 0 ? (
                    <div className="text-center text-gray-400 py-4">No offers have been made on this item yet.</div>
                  ) : (
                    <div className="space-y-3">
                      {offers.map((offer, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-[#1a1b1a] rounded-lg">
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
                              : 'bg-gray-500 text-white'
                          }`}>
                            {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === "Rewards" && (
              <div className="space-y-4">
                <div className="bg-[#232423] rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-4">Rewards</h3>
                  <div className="text-center text-gray-400 py-8">
                    No rewards available for this item.
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === "Info" && (
              <div className="space-y-4">
                {/* Description Section */}
                <div className="bg-[#232423] rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-3">Description</h3>
                  <p className="text-gray-300 leading-relaxed">{description}</p>
                </div>
                
                {/* Details Section */}
                <div className="bg-[#232423] rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-4">Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Contract Address</span>
                      <span className="text-white font-mono text-sm">{contractAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Token ID</span>
                      <span className="text-white">{liquidId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Token Standard</span>
                      <span className="text-white">{tokenStandard}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Blockchain</span>
                      <span className="text-white">{blockchain}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Metadata</span>
                      <span className="text-white">{metadataType}</span>
                    </div>
                  </div>
                </div>
                
                {/* Attributes Section */}
                {attributes && attributes.length > 0 && (
                  <div className="bg-[#232423] rounded-xl p-4">
                    <h3 className="text-lg font-semibold mb-4">Attributes</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {attributes.map((attr: any, index: number) => (
                        <div key={index} className="bg-[#1a1b1a] rounded-lg p-3">
                          <div className="text-gray-400 text-sm mb-1">{attr.trait_type || "Attribute"}</div>
                          <div className="text-white font-medium">{attr.value || "N/A"}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Report Problem Section */}
                <div className="text-center text-gray-400 text-sm mt-6">
                  You can{" "}
                  <span 
                    className="text-green-400 cursor-pointer hover:text-green-300 transition-colors font-semibold"
                    onClick={() => setReportDialogOpen(true)}
                  >
                    Report any problem
                  </span>{" "}
                  you find.
                </div>
              </div>
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
              console.log("Rendering LID card with data:", lid)
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
            <div className="font-semibold">Bid Placed Successfully!</div>
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
        onBuy={handleBid}
        isBuying={isBidding}
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