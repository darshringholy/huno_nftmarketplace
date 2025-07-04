import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface RelatedNFTsProps {
  collectionSlug: string
}

const relatedNFTs = [
  { name: "Grind", price: "0.5 BUSD", timeLeft: "01:20:15" },
  { name: "Paperboy", price: "0.07 BUSD", timeLeft: "01:20:15" },
  { name: "Flamingo", price: "0.83 BUSD", timeLeft: "01:20:15" },
  { name: "Neo Urugami", price: "0.5 BUSD", timeLeft: "01:20:15" },
]

export default function RelatedNFTs({ collectionSlug }: RelatedNFTsProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">More from Abstract</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {relatedNFTs.map((nft, index) => (
          <Card
            key={index}
            className="bg-gray-900 border-gray-800 hover:border-green-500/50 transition-colors cursor-pointer"
          >
            <CardContent className="p-0">
              <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-t-lg flex items-center justify-center relative">
                <div className="w-20 h-20 bg-gray-700 rounded-lg"></div>
                <Badge className="absolute top-3 right-3 bg-green-500 text-black text-xs">Live</Badge>
              </div>

              <div className="p-4 space-y-3">
                <h3 className="font-semibold text-sm">{nft.name}</h3>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">{nft.price}</span>
                  <span className="text-gray-400">{nft.timeLeft}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8">
        <Button variant="outline" className="border-gray-700 hover:border-green-500">
          View More
        </Button>
      </div>
    </div>
  )
}
