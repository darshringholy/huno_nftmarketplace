import { Card, CardContent } from "./card"
import { Check } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"

interface NftCardDiscoverProps {
    nft: {
        name: string
        image: string
        collectionName?: string
        verified?: boolean
        price?: string
        isPriceLoading?: boolean
        liquidId: string
        saleType?: number // 0 = fixed price, 1 = auction
        endTime?: number // For auctions
    }
    index?: number
    isPublic?: boolean // Add this prop to determine routing
    isListed?: boolean // Add this prop to indicate if item is already listed for sale
}

export function NftCardDiscover({ nft, index, isPublic = true, isListed = false }: NftCardDiscoverProps) {
    const isAuction = nft.saleType === 1
    const [timeRemaining, setTimeRemaining] = useState("00 : 00 : 00")
    
    // Format price to show reasonable decimal places
    const formatPrice = (price: string | undefined) => {
        if (!price || price === "-") return "-"
        const numPrice = parseFloat(price)
        if (isNaN(numPrice)) return "-"
        // Show up to 2 decimal places, but remove trailing zeros
        return numPrice.toFixed(2).replace(/\.?0+$/, '')
    }
    
    // Calculate time remaining for auctions
    const getTimeRemaining = () => {
        if (!nft.endTime) return "00 : 00 : 00"
        
        const now = Math.floor(Date.now() / 1000)
        const timeLeft = nft.endTime - now
        
        if (timeLeft <= 0) return "Ended"
        
        const hours = Math.floor(timeLeft / 3600)
        const minutes = Math.floor((timeLeft % 3600) / 60)
        const seconds = timeLeft % 60
        
        return `${hours.toString().padStart(2, '0')} : ${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`
    }
    
    // Update countdown timer for auctions
    useEffect(() => {
        if (!isAuction || !nft.endTime) return
        
        const updateTimer = () => {
            setTimeRemaining(getTimeRemaining())
        }
        
        // Update immediately
        updateTimer()
        
        // Update every second
        const interval = setInterval(updateTimer, 1000)
        
        return () => clearInterval(interval)
    }, [nft.endTime, isAuction])

    // Determine the correct route based on sale type, isPublic, and isListed
    const getItemRoute = () => {
        // If the item is already listed for sale, always route to buy/bid pages
        if (isListed) {
            if (nft.saleType === 1) { // Auction
                return `/marketplace/bid/${nft.liquidId}`
            } else { // Fixed price
                return `/marketplace/buy/${nft.liquidId}`
            }
        }
        
        // If it's the account profile page (isPublic = false) and item is not listed, route to item details page
        if (!isPublic) {
            return `/marketplace/items/${nft.liquidId}`
        }
        
        // For public profiles or other pages, route to buy/bid pages
        if (nft.saleType === 1) { // Auction
            return `/marketplace/bid/${nft.liquidId}`
        } else { // Fixed price
            return `/marketplace/buy/${nft.liquidId}`
        }
    }

    return (
        <Link href={getItemRoute()} passHref legacyBehavior>
            <a className="block group">
                <Card
                    className="bg-[#232423] border-none rounded-2xl overflow-hidden shadow-none flex flex-col h-full"
                    key={index}
                >
                    <CardContent className="p-0 flex flex-col h-full">
                        {/* Image area */}
                        <div className="aspect-square bg-[#2c2d2b] rounded-t-2xl flex items-center justify-center w-full">
                            <Image
                                src={nft.image}
                                alt={nft.name}
                                width={400}
                                height={400}
                                className="object-cover w-full h-full rounded-t-2xl"
                                style={{ background: "#232423" }}
                                unoptimized={nft.image.startsWith('https://gateway.pinata.cloud') || nft.image.startsWith('https://ipfs.io')}
                            />
                        </div>
                        {/* Bottom section */}
                        <div className="bg-[#141414] px-4 pt-3 pb-2 rounded-b-2xl">
                            {/* Top row */}
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-400">{nft.collectionName || "Plato"}</span>
                                    {nft.verified && (
                                        <span className="w-5 h-5 flex items-center justify-center rounded-full bg-lime-400">
                                            <Check className="w-3 h-3 text-black" />
                                        </span>
                                    )}
                                </div>
                                                <div className="flex items-center space-x-2">
                    {!isAuction && (
                        <span className="w-5 h-5 flex items-center justify-center rounded-full">
                            <Image src="/images/pUSD-token.svg" alt="PUSD" width={16} height={16} className="w-4 h-4" />
                        </span>
                    )}
                    {isAuction && (
                        <>
                            <span className="text-xs text-gray-400">Month</span>
                            <span className="w-5 h-5 flex items-center justify-center rounded-full">
                                <Image src="/images/pUSD-token.svg" alt="PUSD" width={16} height={16} className="w-4 h-4" />
                            </span>
                        </>
                    )}
                </div>
                            </div>
                            {/* Second row */}
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-white text-lg block text-left">{nft.name}</span>
                                {isAuction && <span className="text-white text-base">$70 Rewards</span>}
                            </div>
                            <div className="border-t border-[#353634] my-2" />
                            {/* Bottom row */}
                            <div className="flex items-center justify-between mt-2">
                                <div>
                                    <span className="block text-xs text-gray-400">
                                        {isAuction ? "Current bid" : "Price"}
                                    </span>
                                    <span className="flex items-center space-x-1 font-semibold text-white text-base">
                                        <span>
                                            {nft.isPriceLoading ? "..." : (nft.price && nft.price !== "-" ? `${formatPrice(nft.price)} PUSD` : "-")}
                                        </span>
                                        {isAuction && (
                                            <Image src="/images/hammer.svg" alt="Hammer" width={16} height={16} className="w-4 h-4" />
                                        )}
                                    </span>
                                </div>
                                {isAuction && (
                                    <div>
                                        <span className="block text-xs text-gray-400">Ends in</span>
                                        <span className="font-semibold text-white text-base">{timeRemaining}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </a>
        </Link>
    )
} 