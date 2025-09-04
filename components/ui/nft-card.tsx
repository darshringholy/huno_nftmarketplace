import Image from "next/image"
import { Card, CardContent } from "./card"
import { Check } from "lucide-react"

interface NftCardProps {
    nft: {
        name: string
        image: string
        collectionName?: string
        verified?: boolean
    }
    index?: number
}

export function NftCard({ nft, index }: NftCardProps) {
    return (
        <Card
            className="bg-[#232423] border-none rounded-lg overflow-hidden shadow-none flex flex-col h-full"
            key={index}
        >
            <CardContent className="p-0 flex flex-col h-full">
                {/* Image area */}
                <div className="aspect-square bg-[#2c2d2b] rounded-t-lg flex items-center justify-center w-full">
                    <img
                        src={nft.image}
                        alt={nft.name}
                        className="object-cover w-full h-full rounded-t-lg"
                        style={{ background: "#232423" }}
                    />
                </div>
                {/* Bottom section */}
                <div className="bg-black px-4 pt-3 pb-2 rounded-b-lg">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-400">{nft.collectionName || "Plato"}</span>
                            {nft.verified && (
                                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-lime-400">
                                    <Check className="w-3 h-3 text-black" />
                                </span>
                            )}
                        </div>
                        <span className="w-5 h-5 flex items-center justify-center rounded-full">
                            <Image src="/images/pUSD-token.svg" alt="PUSD" width={16} height={16} className="w-4 h-4" />
                        </span>
                    </div>
                    <span className="font-bold text-white text-lg block text-left mt-1">{nft.name}</span>
                </div>
            </CardContent>
        </Card>
    )
}

export default NftCard
