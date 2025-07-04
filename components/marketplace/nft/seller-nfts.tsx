import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface SellerNFTsProps {
  ownerAddress: string
}

const sellerNFTs = [
  { name: "Wheel", price: "0.75 BUSD" },
  { name: "Green car", price: "0.75 BUSD" },
  { name: "Car-free City", price: "0.75 BUSD" },
  { name: "Gold car", price: "0.75 BUSD" },
]

export default function SellerNFTs({ ownerAddress }: SellerNFTsProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">More from the seller</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {sellerNFTs.map((nft, index) => (
          <Card
            key={index}
            className="bg-gray-900 border-gray-800 hover:border-green-500/50 transition-colors cursor-pointer"
          >
            <CardContent className="p-0">
              <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-t-lg flex items-center justify-center">
                <div className="w-20 h-20 bg-gray-700 rounded-lg"></div>
              </div>

              <div className="p-4 space-y-3">
                <h3 className="font-semibold text-sm">{nft.name}</h3>
                <div className="text-sm font-semibold text-green-400">{nft.price}</div>
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
