import { Card, CardContent } from "./card"
import { Check } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface NftCardDiscoverProps {
    nft: {
        name: string
        image: string
        collectionName?: string
        verified?: boolean
        price?: string
        isPriceLoading?: boolean
        liquidId: string
    }
    index?: number
}

export function NftCardDiscover({ nft, index }: NftCardDiscoverProps) {
    return (
        <Link href={`/marketplace/items/${nft.liquidId}`} passHref legacyBehavior>
            <a className="block group">
                <Card
                    className="bg-[#232423] border-none rounded-2xl overflow-hidden shadow-none flex flex-col h-full"
                    key={index}
                >
                    <CardContent className="p-0 flex flex-col h-full">
                        {/* Image area */}
                        <div className="aspect-square bg-[#2c2d2b] rounded-t-2xl flex items-center justify-center w-full">
                            <img
                                src={nft.image}
                                alt={nft.name}
                                className="object-cover w-full h-full rounded-t-2xl"
                                style={{ background: "#232423" }}
                            />
                        </div>
                        {/* Bottom section */}
                        <div className="bg-black px-4 pt-3 pb-2 rounded-b-2xl">
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
                                <span className="text-xs text-gray-400">Month</span>
                                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[#ff4d2d]">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="8" cy="8" r="8" fill="none" />
                                        <path d="M8 4V12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                        <path d="M10.5 6.5C10.5 5.11929 9.38071 4 8 4C6.61929 4 5.5 5.11929 5.5 6.5C5.5 7.88071 6.61929 9 8 9C9.38071 9 10.5 10.1193 10.5 11.5C10.5 12.8807 9.38071 14 8 14C6.61929 14 5.5 12.8807 5.5 11.5" stroke="#FF4D2D" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </span>
                            </div>
                            {/* Second row */}
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-white text-lg block text-left">{nft.name}</span>
                                <span className="text-white text-base">$70 Rewards</span>
                            </div>
                            <div className="border-t border-[#353634] my-2" />
                            {/* Bottom row */}
                            <div className="flex items-center justify-between mt-2">
                                <div>
                                    <span className="block text-xs text-gray-400">Current bid</span>
                                    <span className="flex items-center space-x-1 font-semibold text-yellow-400 text-base">
                                        <span>{nft.isPriceLoading ? "..." : (nft.price ? `${nft.price} PUSD` : "-")}</span>
                                        <Image src="/images/hammer.svg" alt="Hammer" width={16} height={16} className="w-4 h-4" />
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-xs text-gray-400">Ends in</span>
                                    <span className="font-semibold text-white text-base">01 : 29 : 35</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </a>
        </Link>
    )
} 