import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import NftCard from "../ui/nft-card"

const auctions = [
  { name: "Red car", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
  { name: "Anpaid", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
  { name: "Marvin", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
  { name: "Kalyptingo", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
]

export default function HotAuctions() {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold">Hot Auction</h2>
        <Link href="/auctions">
          <Button variant="ghost" className="text-green-400 hover:text-green-300">
            View All
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {auctions.map((auction, index) => (
          <NftCard key={index} nft={auction} index={index} />
        ))}
      </div>
    </section>
  )
}
