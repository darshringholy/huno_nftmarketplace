"use client"

import React, { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useRouter } from "next/navigation"
import { LIQUIDID_ABI, LIQUIDID_ADDRESS } from "@/lib/liquidid"
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from "@/lib/marketplace"
import { Check } from "lucide-react"
import { User } from "lucide-react"
import { Hexagon } from "lucide-react"
import { cn } from "@/lib/utils"
import ReportDialog from "@/components/ui/report-dialog"

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
    // Try multiple IPFS gateways
    const gateways = [
      `https://gateway.pinata.cloud/ipfs/${hash}`,
      `https://ipfs.io/ipfs/${hash}`,
      `https://cloudflare-ipfs.com/ipfs/${hash}`,
      `https://dweb.link/ipfs/${hash}`
    ];
    return gateways[0]; // Start with Pinata gateway
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
  
  // If it's an IPFS URI, try multiple gateways
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
        console.log(`Trying gateway: ${gateway}`);
        const response = await fetch(gateway);
        if (response.ok && await isValidJsonResponse(response.clone())) {
          console.log(`Success with gateway: ${gateway}`);
          return await response.json();
        }
      } catch (err) {
        console.log(`Gateway ${gateway} failed:`, err);
        continue;
      }
    }
  } else {
    // For non-IPFS URLs
    try {
      const response = await fetch(url);
      if (response.ok && await isValidJsonResponse(response.clone())) {
        return await response.json();
      }
    } catch (err) {
      console.log(`Non-IPFS URL failed:`, err);
    }
  }
  
  return null;
};

export default function ItemDetailsPage({ params }: { params: any }) {
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
  const [activeTab, setActiveTab] = useState("Attributes")
  const [collectionItems, setCollectionItems] = useState<any[]>([])
  const [loadingCollectionItems, setLoadingCollectionItems] = useState(false)
  const [showSellModal, setShowSellModal] = useState(false)
  const [saleType, setSaleType] = useState("fixed")
  const [sellPrice, setSellPrice] = useState("0.75")
  const [expirationDays, setExpirationDays] = useState(1)
  const [isListing, setIsListing] = useState(false)
  const [listingError, setListingError] = useState<string | null>(null)
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)

  // Calculate derived values from sell price
  const calculateValues = (price: string) => {
    const numPrice = parseFloat(price) || 0
    const usdEquivalent = numPrice * 1 // 1 PUSD = $1
    const marketplaceFee = numPrice * 0.01 // 1% marketplace fee
    const creatorFee = numPrice * 0.01 // 1% creator fee
    
    return {
      usdEquivalent: usdEquivalent.toFixed(2),
      marketplaceFee: marketplaceFee.toFixed(4),
      creatorFee: creatorFee.toFixed(4)
    }
  }

  const calculatedValues = calculateValues(sellPrice)

  useEffect(() => {
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
        const assetData = await liquidIdContract.getAsset(liquidId)
        console.log("Asset data from contract:", assetData)
        setAsset(assetData)
        
        // Check if asset exists and is active
        if (!assetData || !assetData.isActive) {
          setError("Asset not found or inactive")
          setLoading(false)
          return
        }
        
        try {
          const saleData = await marketplaceContract.getSale(liquidId)
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
          }
        } catch (err) {
          console.log("Error fetching main item metadata:", err)
        }
        
        // Fetch owner's profile avatar
        if (assetData.owner) {
          try {
            console.log("Fetching profile for owner:", assetData.owner)
            const profileRes = await fetch(`/api/profile?address=${assetData.owner}`)
            console.log("Profile response status:", profileRes.status)
            if (profileRes.ok) {
              const profileData = await profileRes.json()
              console.log("Profile data received:", profileData)
              if (profileData && profileData.profile && profileData.profile.avatar) {
                console.log("Setting owner avatar:", profileData.profile.avatar)
                setOwnerAvatar(profileData.profile.avatar)
              } else {
                console.log("No avatar found in profile data")
                setOwnerAvatar("")
              }
            } else {
              console.log("Profile API returned error status:", profileRes.status)
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
        setError(err.message || "Failed to fetch item details")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [liquidId])

  // Fetch collection items
  useEffect(() => {
    async function fetchCollectionItems() {
      if (!metadata?.collection) {
        console.log("No collection metadata found")
        return
      }
      
      console.log("Fetching collection items for collection:", metadata.collection)
      setLoadingCollectionItems(true)
      try {
        let provider: ethers.BrowserProvider | ethers.JsonRpcProvider
        if (typeof window !== "undefined" && (window as any).ethereum) {
          provider = new ethers.BrowserProvider((window as any).ethereum)
        } else {
          provider = new ethers.JsonRpcProvider("https://testnet-rpc.plume.org")
        }
        
        const liquidIdContract = new ethers.Contract(LIQUIDID_ADDRESS, LIQUIDID_ABI, provider)
        const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider)
        
        // Get all assets and filter by collection
        const totalSupply = await liquidIdContract.getTotalSupply()
        console.log("Total supply:", totalSupply.toString())
        const items = []
        
        // Fetch more items to find collection matches - check up to 100 items
        const maxItemsToCheck = Math.min(100, Number(totalSupply))
        console.log(`Checking ${maxItemsToCheck} items for collection matches`)
        
        for (let i = 0; i < maxItemsToCheck; i++) {
          try {
            const assetData = await liquidIdContract.getAsset(i)
            console.log(`Checking item ${i}:`, assetData)
            if (assetData && assetData.isActive && assetData.metadataURI) {
              console.log(`Item ${i} metadata URI:`, assetData.metadataURI)
              const meta = await fetchMetadata(assetData.metadataURI)
              if (meta) {
                  console.log(`Item ${i} collection:`, meta.collection, "Target collection:", metadata.collection)
                  console.log(`Item ${i} full metadata:`, meta)
                  if (meta.collection === metadata.collection && i.toString() !== liquidId) {
                    console.log(`Found matching item: ${i}`)
                    // Get listing info
                    let listingData = null
                    try {
                      listingData = await marketplaceContract.getListing(i)
                      console.log(`Item ${i} listing data:`, listingData)
                    } catch (listingErr) {
                      console.log(`No listing found for item ${i}:`, listingErr)
                    }
                    
                    // Get image
                    let imageUri = meta.image || ""
                    if (imageUri && imageUri.startsWith("ipfs://")) {
                      imageUri = resolveIpfs(imageUri) || ""
                    }
                    if (!imageUri || typeof imageUri !== 'string' || !imageUri.startsWith('http')) {
                      const fallbackIndex = i % fallbackLidImages.length
                      imageUri = fallbackLidImages[fallbackIndex]
                    }
                    
                    items.push({
                      id: i,
                      name: meta.name || `LID #${i}`,
                      image: imageUri,
                      price: listingData ? ethers.formatUnits(listingData.price, 18) : null,
                      endTime: listingData ? Number(listingData.endTime) : null
                    })
                    
                    if (items.length >= 4) break // Only show 4 items
                  }
              } else {
                console.log(`Failed to fetch metadata for item ${i}`)
              }
            } else {
              console.log(`No asset data, inactive asset, or no metadataURI for item ${i}`)
            }
          } catch (err) {
            console.log(`Error fetching item ${i}:`, err)
            // Skip items that fail to load
            continue
          }
        }
        
        console.log("Collection items found:", items.length)
        console.log("Final collection items:", items)
        setCollectionItems(items)
      } catch (err) {
        console.error("Failed to fetch collection items:", err)
      } finally {
        setLoadingCollectionItems(false)
      }
    }
    
    if (metadata?.collection) {
      fetchCollectionItems()
    }
  }, [metadata?.collection, liquidId])

  if (loading) return <div className="container mx-auto py-8 text-center">Loading...</div>
  if (error) return <div className="container mx-auto py-8 text-center text-red-500">{error}</div>

  // Extract info from metadata and asset
  const name = metadata?.name || `LID #${liquidId}`
  const description = metadata?.description || "No description."
  const owner = asset?.owner || "-"
  const price = listing && listing.isActive ? 
    (listing.sellType === 0 ? ethers.formatUnits(listing.fixedPrice, 18) : ethers.formatUnits(listing.startingPrice, 18)) : 
    "-"
  const usdPrice = "$327.54" // Placeholder, you can fetch real price if needed
  const contractAddress = LIQUIDID_ADDRESS
  const tokenStandard = "ERC20"
  const blockchain = "Plume"
  const metadataType = "Centralized"
  const attributes = Array.isArray(metadata?.attributes) ? metadata.attributes : []

  return (
    <div className="w-full min-h-screen bg-[#090909] text-white">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-10">
        {/* Left: Image */}
        <div className="flex flex-col items-center w-full">
          <div className="bg-[#232423] rounded-2xl flex items-center justify-center min-h-[480px] h-[480px] w-[480px] border border-[#2b2c2b]">
            {image && <img src={image} alt={name} />}
            </div>
          {/* Buy/Sell Section */}
          <div className="w-full mt-8">
            <div className="bg-[#181918] rounded-2xl p-8 flex flex-col gap-8 shadow-lg">
              <div className="flex flex-row flex-wrap items-center gap-2 text-2xl mb-2">
                <span className="text-base text-lime-400">Send</span>
                <span className="text-base text-gray-500">or sell items at a</span>
                <span className="text-base text-white">fixed price</span>
                <span className="text-base text-gray-500">or</span>
                <span className="text-base text-white">auction</span>
                </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setSaleType("fixed")
                    setShowSellModal(true)
                  }}
                  className="flex-1 bg-lime-400 text-black font-extrabold py-2 rounded-xl text-base transition-colors"
                >
                  Fixed price
                </button>
                <button 
                  onClick={() => {
                    setSaleType("auction")
                    setShowSellModal(true)
                  }}
                  className="flex-1 border-2 border-lime-400 text-lime-400 font-extrabold py-2 rounded-xl text-base transition-colors"
                >
                  Auction
                </button>
              </div>
              <button className="w-full border-2 border-lime-400 text-lime-400 font-extrabold py-2 rounded-xl text-base mt-2 transition-colors">Sell instantly</button>
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
              <div className="flex flex-row items-center w-72 gap-4">
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
                  <span className="text-white font-bold text-2xl flex items-center gap-2">
                    {collectionName}
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-lime-400"><Check className="w-4 h-4 text-black" /></span>
                  </span>
                </div>
                </div>
                {/* Owner */}
              <div className="flex flex-row items-center w-72 gap-4">
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
                  <span className="text-white font-bold text-2xl flex items-center gap-2">{owner.slice(0, 6)}...{owner.slice(-4)}</span>
                </div>
              </div>
            </div>
            <div className="text-gray-400 text-xl leading-relaxed mt-2 mb-4 max-w-3xl">{description}</div>
            </div>
            {/* Tabs */}
            <div className="flex gap-2 mb-2">
            {["Attributes", "Offers", "Bids", "Info"].map(tab => (
                <button
                  key={tab}
                className={cn(
                  "px-6 py-2 rounded-lg font-semibold text-base transition-colors",
                  activeTab === tab ? "bg-white text-black" : "bg-[#181918] text-white"
                )}
                onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          {/* Tab Content */}
          <div className="bg-[#181918] rounded-2xl p-6 flex flex-col gap-2 w-full max-w-lg min-h-[260px]">
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
                          {/* Optionally add percentage if available: <td className="py-2 text-gray-400">(11.7%)</td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}
            {activeTab === "Offers" && <div className="text-gray-400">No offers yet.</div>}
            {activeTab === "Bids" && <div className="text-gray-400">No bids yet.</div>}
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
              <div className="mt-2 text-xs text-green-400 cursor-pointer">You can <span className="font-semibold cursor-pointer hover:text-green-300 transition-colors" onClick={() => setReportDialogOpen(true)}>Report any problem</span> you find.</div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* More from Collection Section */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold mb-8">More from {collectionName}</h2>
        {loadingCollectionItems ? (
          <div className="text-center py-8">
            <div className="text-gray-400">Loading collection items...</div>
          </div>
        ) : collectionItems.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {collectionItems.map((item) => (
                <div key={item.id} className="bg-[#181918] rounded-2xl p-4 border border-[#232423] hover:border-lime-400 transition-colors cursor-pointer">
                  <div className="bg-[#232423] rounded-xl h-48 mb-4 flex items-center justify-center overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lime-400 font-semibold">{collectionName}</span>
                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-lime-400">
                      <Check className="w-3 h-3 text-black" />
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">{item.name}</h3>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-400">Month</span>
                    <span className="text-red-500 font-semibold flex items-center gap-1">
                      $70 Rewards
                    </span>
                  </div>
                  {item.price && (
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-400">Current bid</span>
                      <span className="text-white font-semibold flex items-center gap-1">
                        {item.price} PUSD
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" className="text-gray-400">
                          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </div>
                  )}
                  {item.endTime && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Ends in</span>
                      <span className="text-white font-semibold">01:29:35</span>
                    </div>
                  )}
        </div>
              ))}
            </div>
            <div className="flex justify-center">
              <button className="border-2 border-lime-400 text-lime-400 font-bold px-6 py-2 rounded-xl hover:bg-lime-400 hover:text-black transition-colors">
                View More
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400">No other items found in this collection.</div>
          </div>
        )}
      </div>
      
      {/* Sell Modal */}
      {showSellModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#181918] rounded-2xl p-6 w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Sell your LID</h2>
              <button 
                onClick={() => setShowSellModal(false)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            {/* Item Image */}
            <div className="bg-[#232423] rounded-xl h-48 mb-6 flex items-center justify-center overflow-hidden">
              {image && (
                <img 
                  src={image} 
                  alt={name} 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            {/* Sale Type Selection */}
            <div className="flex gap-0 mb-6">
              <button
                onClick={() => setSaleType("fixed")}
                className={`flex-1 py-3 px-4 rounded-l-xl font-semibold transition-colors ${
                  saleType === "fixed" 
                    ? "bg-white text-black" 
                    : "bg-[#232423] text-white"
                }`}
              >
                Fixed Price
              </button>
              <button
                onClick={() => setSaleType("auction")}
                className={`flex-1 py-3 px-4 rounded-r-xl font-semibold transition-colors ${
                  saleType === "auction" 
                    ? "bg-white text-black" 
                    : "bg-[#232423] text-white"
                }`}
              >
                Auction
              </button>
            </div>
            
            {/* Price and Fees Section */}
            <div className="bg-[#232423] rounded-xl p-4 mb-6">
              {/* Price Input */}
              <div className="mb-4">
                <label className="text-gray-400 text-sm mb-2 block">Price</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value)}
                    className="flex-1 bg-transparent text-white text-lg font-semibold outline-none"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                  <div className="flex items-center gap-1">
                    <img alt="Plume" className ="w-6 h-6" draggable="false" src="/images/plume-logo.svg" />
                    <span className="font-semibold">PUSD</span>
                  </div>
                </div>
                <div className="text-gray-400 text-sm mt-1">$ {calculatedValues.usdEquivalent}</div>
              </div>
              
              {/* Expiration Options - Only show for Auction */}
              {saleType === "auction" && (
                <div className="mb-4">
                  <label className="text-gray-400 text-sm mb-2 block">Expires after</label>
                  <div className="flex gap-2">
                    {[1, 3, 5].map((days) => (
                      <button
                        key={days}
                        onClick={() => setExpirationDays(days)}
                        className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-colors ${
                          expirationDays === days
                            ? "border-2 border-lime-400 text-lime-400"
                            : "bg-[#181918] text-white"
                        }`}
                      >
                        {days} {days === 1 ? 'Day' : 'Days'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Fee Information */}
              <div className="text-gray-400 text-xs">
                <p className="mb-3">Listing is FREE! When the sale succeeds, the following fees will occur.</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Marketplace Fee (1%)</span>
                    <span>{calculatedValues.marketplaceFee} PUSD</span>
                  </div>
                  {saleType === "auction" && (
                    <div className="flex justify-between">
                      <span>Bidder to bidder (1%)</span>
                      <span>{calculatedValues.marketplaceFee} PUSD</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Creator (1%)</span>
                    <span>{calculatedValues.creatorFee} PUSD</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Start Listing Button */}
            <button 
              disabled={isListing}
              onClick={async () => {
                setIsListing(true)
                setListingError(null)
                
                try {
                  let provider: ethers.BrowserProvider | ethers.JsonRpcProvider
                  if (typeof window !== "undefined" && (window as any).ethereum) {
                    provider = new ethers.BrowserProvider((window as any).ethereum)
                  } else {
                    provider = new ethers.JsonRpcProvider("https://testnet-rpc.plume.org")
                  }
                  
                  const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider)
                  const signer = await provider.getSigner()
                  const contractWithSigner = marketplaceContract.connect(signer) as any
                  
                  // Convert price to wei (18 decimals)
                  const priceInWei = ethers.parseUnits(sellPrice, 18)
                  
                  // Zero address for payment token (0x0000000000000000000000000000000000000000)
                  const paymentToken = "0x0000000000000000000000000000000000000000"
                  
                  if (saleType === "fixed") {
                    // Fixed Price listing
                    console.log("Creating fixed price sale:", {
                      liquidId: liquidId,
                      price: priceInWei.toString(),
                      paymentToken: paymentToken,
                      acceptsNativePlume: false
                    })
                    
                    const tx = await contractWithSigner.createFixedPriceSale(
                      liquidId,
                      priceInWei,
                      paymentToken,
                      false // acceptsNativePlume = 0
                    )
                    
                    console.log("Fixed price sale transaction:", tx.hash)
                    await tx.wait()
                    console.log("Fixed price sale confirmed!")
                    
                  } else if (saleType === "auction") {
                    // Auction listing
                    const durationInSeconds = expirationDays * 24 * 60 * 60 // Convert days to seconds
                    
                    console.log("Creating auction sale:", {
                      liquidId: liquidId,
                      startingPrice: priceInWei.toString(),
                      reservePrice: priceInWei.toString(),
                      duration: durationInSeconds,
                      bidIncrement: 1,
                      paymentToken: paymentToken,
                      acceptsNativePlume: false
                    })
                    
                    const tx = await contractWithSigner.createAuctionSale(
                      liquidId,
                      priceInWei, // startingPrice
                      priceInWei, // reservePrice (same as startingPrice)
                      durationInSeconds, // duration in seconds
                      1, // bidIncrement
                      paymentToken,
                      false // acceptsNativePlume = 0
                    )
                    
                    console.log("Auction sale creation transaction:", tx.hash)
                    await tx.wait()
                    console.log("Auction sale created successfully!")
                  }
                  
                  setShowSellModal(false)
                  // Show success notification and redirect
                  setShowSuccessNotification(true)
                  setTimeout(() => {
                    router.push("/profile?tab=items")
                  }, 2000) // Redirect after 2 seconds
                  
                } catch (error: any) {
                  // Parse contract error messages
                  let errorMessage = "Failed to create listing"
                  
                  if (error.reason) {
                    // Contract error with reason
                    errorMessage = error.reason
                  } else if (error.message) {
                    // General error
                    errorMessage = error.message
                  }
                  
                  // Format common error messages
                  if (errorMessage.includes("Asset already listed")) {
                    errorMessage = "This item is already listed for sale. You cannot create multiple listings for the same item."
                  } else if (errorMessage.includes("Not the owner")) {
                    errorMessage = "You can only list items that you own."
                  } else if (errorMessage.includes("Invalid price")) {
                    errorMessage = "Please enter a valid price greater than 0."
                  } else if (errorMessage.includes("Insufficient balance")) {
                    errorMessage = "You don't have enough tokens to complete this transaction."
                  }
                  
                  setListingError(errorMessage)
                } finally {
                  setIsListing(false)
                }
              }}
              className={`w-full font-bold py-2 rounded-xl text-lg transition-colors ${
                isListing 
                  ? "bg-gray-500 text-gray-300 cursor-not-allowed" 
                  : "bg-lime-400 text-black hover:bg-lime-300"
              }`}
            >
              {isListing ? "Creating listing..." : "Start listing"}
            </button>
            
            {/* Error Message */}
            {listingError && (
              <div className="mt-4 p-3 bg-red-900 border border-red-700 rounded-lg text-red-200 text-sm">
                Error: {listingError}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Success Notification */}
      {showSuccessNotification && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-3">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <div className="font-semibold">Listing Created Successfully!</div>
            <div className="text-sm opacity-90">Redirecting to your profile...</div>
          </div>
        </div>
      )}
      
      {/* Report Dialog */}
      <ReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        itemId={liquidId}
        itemName={metadata?.name || `LID #${liquidId}`}
      />
    </div>
  )
} 