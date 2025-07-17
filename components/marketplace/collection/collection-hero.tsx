import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import Image from "next/image"

interface Collection {
  id: string
  name: string
  description: string
  verified: boolean
  bannerImage: string
  avatarImage: string
}

interface CollectionHeroProps {
  collection: Collection
}

export default function CollectionHero({ collection }: CollectionHeroProps) {
  return (
    <section className="relative px-8 py-2">
      {/* Banner Image */}
      <div className="h-80 bg-[#232424] relative overflow-hidden">
        {collection.bannerImage ? (
          <img 
            src={collection.bannerImage} 
            alt={collection.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-black/20"></div>
        )}
      </div>

      {/* Collection Info */}
      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col items-center text-center -mt-16 relative z-10">
          {/* Avatar (replace with hexagon logo) */}
          <div className="w-32 h-32 flex items-center justify-center mb-6">
            <svg width="128" height="128" viewBox="0 0 80 80">
              <polygon
                points="40,5 74,22.5 74,57.5 40,75 6,57.5 6,22.5"
                fill="#444"
                stroke="#222"
                strokeWidth="3"
              />
              {collection.avatarImage && (
                <defs>
                  <clipPath id="hexClipHero">
                    <polygon points="40,5 74,22.5 74,57.5 40,75 6,57.5 6,22.5" />
                  </clipPath>
                </defs>
              )}
              {collection.avatarImage ? (
                <image
                  href={collection.avatarImage}
                  x="6" y="7"
                  width="68"
                  height="66"
                  clipPath="url(#hexClipHero)"
                  preserveAspectRatio="xMidYMid slice"
                />
              ) : null}
            </svg>
          </div>

          {/* Collection Name */}
          <div className="flex items-center space-x-2 mb-4">
            <h1 className="text-3xl font-bold">{collection.name}</h1>
            {collection.verified && (
              <Badge className="bg-green-500 text-black p-1 rounded-full">
                <Check className="w-3 h-3" />
              </Badge>
            )}
          </div>
          

          {/* Description */}
          <p className="text-gray-400 max-w-2xl leading-relaxed mb-8">{collection.description}</p>
        </div>
      </div>
    </section>
  )
}
