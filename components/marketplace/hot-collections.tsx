import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const collections = [
  { name: "Imperators Genesis", count: 8, avatar: "IG", verified: true },
  { name: "Anpaid", count: 15, avatar: "A", verified: false },
  { name: "Gold VIP Access Pass", count: 8, avatar: "G", verified: false },
  { name: "Azurite Black", count: 8, avatar: "AB", verified: true },
  { name: "Marvin McKinney", count: 8, avatar: "MM", verified: false },
  { name: "Kalyptingo", count: 8, avatar: "K", verified: true },
  { name: "Jenny Wilson", count: 9, avatar: "JW", verified: false },
  { name: "Gold VIP Access Pass", count: 8, avatar: "G", verified: true },
]

export default function HotCollections() {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold">Hot Collections</h2>
        <Link href="/marketplace/collections">
          <Button variant="ghost" className="text-green-400 hover:text-green-300">
            View All
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {collections.map((collection, index) => (
          <Card
            key={index}
            className="bg-gray-900 border-gray-800 hover:border-green-500/50 transition-colors cursor-pointer"
          >
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center space-x-3">
                <div className="relative w-16 md:w-20 h-16 md:h-20 flex items-center justify-center">
                  {/* Hexagon avatar */}
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      viewBox="0 0 160 160"
                      className="w-full h-full"
                      style={{ display: "block" }}
                    >
                      <polygon
                        points="80,16 144,48 144,112 80,144 16,112 16,48"
                        fill="#232323"
                      />
                    </svg>
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs md:text-sm font-bold text-gray-200 pointer-events-none">
                      {collection.avatar}
                    </span>
                  </div>
                  {collection.verified && (
                    <span className="absolute bottom-1 right-2 w-5 h-5 bg-lime-400 rounded-full flex items-center justify-center border-2 border-gray-900">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-black"
                      >
                        <circle cx="7" cy="7" r="7" fill="none" />
                        <path
                          d="M4 7.5L6 9.5L10 5.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-white truncate">{collection.name}</h3>
                  <p className="text-gray-400 text-xs">{collection.count} items</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
