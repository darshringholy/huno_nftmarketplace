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
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Collection Info */}
      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col items-center text-center -mt-16 relative z-10">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full bg-gray-800 border-4 border-black mb-6 flex items-center justify-center">
            <div className="w-24 h-24 bg-gray-700 rounded-full"></div>
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
          <div className="flex items-center justify-center md:justify-start space-x-4 my-2">
            <a
              href="https://t.me/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="text-gray-400 hover:text-white transition-colors"
            >
              {/* Telegram icon */}
              <Image src="/images/telegram.svg" alt="Telegram" width={24} height={24} className="w-6 h-6" />
            </a>
            <a
              href="https://twitter.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="text-gray-400 hover:text-white transition-colors"
            >
              {/* X (Twitter) icon */}
              <Image src="/images/twitter.svg" alt="Telegram" width={24} height={24} className="w-6 h-6" />
            </a>
            <a
              href="https://discord.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discord"
              className="text-gray-400 hover:text-white transition-colors"
            >
              {/* Discord icon */}
              <Image src="/images/discord.svg" alt="Telegram" width={24} height={24} className="w-6 h-6" />
            </a>
            <a
              href="https://earthweb.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Earth web"
              className="text-gray-400 hover:text-white transition-colors"
            >
              {/* Earth Web icon */}
              <Image src="/images/earth-web.svg" alt="Telegram" width={24} height={24} className="w-6 h-6" />
            </a>
          </div>


          {/* Description */}
          <p className="text-gray-400 max-w-2xl leading-relaxed mb-8">{collection.description}</p>
        </div>
      </div>
    </section>
  )
}
