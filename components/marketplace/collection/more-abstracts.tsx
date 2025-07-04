import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import NftCard from "@/components/ui/nft-card"
import Image from "next/image"

const lids = [
  { name: "Red car", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
  { name: "Anpaid", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
  { name: "Marvin", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
  { name: "Kalyptingo", price: "1.75 BUSD", timeLeft: "01:20:15", image: "/placeholder.svg?height=200&width=200" },
]

export default function MoreFromAbstracts() {
  return (
    <section>
      <div className="my-6">
        <h2 className="text-xl md:text-2xl font-bold">More From Abstracts</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {lids.map((lid, index) => (
          <NftCard key={index} nft={lid} index={index} />
        ))}
      </div>

      <div className="text-center mt-8">
        <Button variant="outline" className="border-gray-700 hover:border-green-500">
          View More
        </Button>
      </div>
    </section>
  )
}
