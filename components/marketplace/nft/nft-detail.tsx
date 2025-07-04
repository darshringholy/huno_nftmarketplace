import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Flag, Heart } from "lucide-react"
import ShareButton from "@/components/ui/share-button"
import EditButton from "@/components/ui/edit-button"

interface NFT {
  id: string
  name: string
  description: string
  image: string
  price: string
  collection: {
    name: string
    verified: boolean
    slug: string
  }
  creator: {
    name: string
    verified: boolean
    address: string
  }
  owner: {
    name: string
    address: string
  }
  properties: Array<{
    trait: string
    value: string
    rarity: string
  }>
}

interface NFTDetailProps {
  nft: NFT
}

export default function NFTDetail({ nft }: NFTDetailProps) {
  const handleNFTEdit = () => {
    console.log("Edit NFT metadata clicked")
    // Open NFT edit modal or navigate to edit page
  }

  const handleNFTSettings = () => {
    console.log("NFT settings clicked")
    // Open NFT settings modal
  }

  return (
    <>
      {/* NFT Image */}
      <div className="space-y-4">
        <Card className="bg-gray-900 border-gray-800 overflow-hidden">
          <CardContent className="p-0">
            <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <div className="w-32 h-32 bg-gray-700 rounded-lg"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NFT Info */}
      <div className="space-y-6">
        {/* Title and Creator */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{nft.name}</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <span>Abstract</span>
              {nft.collection.verified && (
                <Badge className="bg-green-500 text-black p-1 rounded-full">
                  <Check className="w-3 h-3" />
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span>Gragha_m02</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-400 leading-relaxed">{nft.description}</p>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Heart className="w-4 h-4 mr-2" />
            Like
          </Button>
          <EditButton onProfileEdit={handleNFTEdit} onSettingsEdit={handleNFTSettings} variant="ghost" size="sm" />
          <ShareButton title={nft.name} description={nft.description} variant="ghost" size="sm" />
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Flag className="w-4 h-4 mr-2" />
            Report any problem
          </Button>
        </div>

        {/* Properties */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Properties</h3>
            <div className="space-y-3">
              {nft.properties.map((property, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-gray-800 last:border-b-0"
                >
                  <div>
                    <span className="text-sm text-gray-400">{property.trait}</span>
                    <div className="font-semibold">{property.value}</div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {property.rarity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Price and Purchase */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <div className="text-2xl font-bold">{nft.price}</div>
                <div className="text-sm text-gray-400">Make an offer to get this item</div>
              </div>

              <div className="space-y-3">
                <Button className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold">Buy Now</Button>
                <Button variant="outline" className="w-full border-gray-700">
                  Make Offer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
