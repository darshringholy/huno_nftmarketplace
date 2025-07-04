import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

const partners = [
  { name: "Plume", logo: "/images/plume.svg", width: 100, height: 100 },
  { name: "Tesla", logo: "/images/tesla.svg", width: 100, height: 50 },
  { name: "Uber", logo: "/images/uber.svg", width: 100, height: 50 },
  { name: "Volkswagen", logo: "/images/volkswagen.svg", width: 100, height: 50 },
  { name: "Rooster Protocol", logo: "/images/rooster.svg", width: 100, height: 50 },
  { name: "Plume", logo: "/images/plume.svg", width: 100, height: 100 },
  { name: "Tesla", logo: "/images/tesla.svg", width: 100, height: 50 },
  { name: "Uber", logo: "/images/uber.svg", width: 100, height: 50 },
  { name: "Volkswagen", logo: "/images/volkswagen.svg", width: 100, height: 50 },
  { name: "Rooster Protocol", logo: "/images/rooster.svg", width: 100, height: 50 },
]

const assets = Array.from({ length: 14 }, (_, i) => ({
  id: i + 1,
  name: "Gallardo LP 560-4",
  rarity: "20%",
  price: "372 PLUME",
  image: "/placeholder.svg?height=60&width=60",
}))

export default function MarketplaceSection() {
  return (
    <section className="py-12 md:py-16 px-4 md:px-24 bg-gray-950">
      <div className="container mx-auto">
        {/* Partner Logos */}
        <div className="relative overflow-hidden mb-12 md:mb-16 opacity-60">
          <div
            className="flex items-center gap-8 animate-marquee whitespace-nowrap"
            style={{
              animation: "marquee 10s linear infinite",
            }}
          >
            {partners.concat(partners).map((partner, idx) => (
              <Image
                key={partner.name + idx}
                src={partner.logo}
                alt={partner.name}
                width={partner.width}
                height={partner.height}
                className="h-8 w-48 grayscale hover:grayscale-0 transition-all inline-block"
                draggable={false}
              />
            ))}
          </div>
          <style>{`
            @keyframes marquee {
              0% {
                transform: translateX(0%);
              }
              100% {
                transform: translateX(-50%);
              }
            }
          `}</style>
        </div>
        {/* Marketplace Table */}
        <Card className="bg-black border-gray-800">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" className="text-white border-b-2 border-green-500 text-2xl">
                  Featured
                </Button>
                <Button variant="ghost" className="text-gray-400 text-2xl">
                  Top
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
                <select className="bg-transparent border border-gray-700 rounded-lg px-3 py-2 text-sm w-full sm:w-auto text-white">
                  <option value="24h" className="bg-black text-white">24h</option>
                  <option value="7d" className="bg-black text-white">7d</option>
                  <option value="30d" className="bg-black text-white">30d</option>
                </select>

                <div className="flex items-stretch rounded-lg border border-gray-700 overflow-hidden">
                  <div className="flex items-center px-4 py-2 bg-black">
                    <span className="text-sm text-white font-normal">All chains</span>
                  </div>
                  <div className="flex items-center justify-center px-4 bg-transparent border-l border-gray-700">
                    <img
                      src="/images/plume-logo.svg"
                      alt="Plume"
                      className="w-6 h-6"
                      draggable={false}
                    />
                  </div>
                </div>

                <Button variant="ghost" className="rounded-lg border border-gray-700 text-gray-400 text-sm">
                  View All
                </Button>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:grid grid-cols-2 gap-8">
              <div>
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-400 mb-4">
                  <span className="text-left">ASSETS</span>
                  <span className="text-left">RARITY</span>
                  <span className="text-left">PRICE</span>
                </div>

                {assets.slice(0, 7).map((asset) => (
                  <div
                    key={asset.id}
                    className="grid grid-cols-3 gap-4 items-center py-3 border-b border-gray-800 last:border-b-0 hover:bg-gray-900"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-400 text-sm">{asset.id}</span>
                      <div className="w-10 h-10 bg-gray-700 rounded"></div>
                      <span className="text-sm text-gray-400">{asset.name}</span>
                    </div>
                    <span className="text-sm text-gray-400">{asset.rarity}</span>
                    <span className="text-sm text-gray-400 font-semibold">{asset.price}</span>
                  </div>
                ))}
              </div>

              <div>
                <div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-400 mb-4">
                    <span className="text-left">ASSETS</span>
                    <span className="text-left">RARITY</span>
                    <span className="text-left">PRICE</span>
                  </div>

                  {assets.slice(7, 14).map((asset) => (
                    <div
                      key={asset.id}
                      className="grid grid-cols-3 gap-4 items-center py-3 border-b border-gray-800 last:border-b-0 hover:bg-gray-900"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-400 text-sm">{asset.id}</span>
                        <div className="w-10 h-10 bg-gray-700 rounded"></div>
                        <span className="text-sm text-gray-400">{asset.name}</span>
                      </div>
                      <span className="text-sm text-gray-400">{asset.rarity}</span>
                      <span className="text-sm text-gray-400 font-semibold">{asset.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {assets.slice(0, 6).map((asset) => (
                <div key={asset.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-gray-400 text-sm">#{asset.id}</span>
                    <div className="w-12 h-12 bg-gray-700 rounded"></div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold">{asset.name}</h3>
                      <p className="text-xs text-gray-400">Rarity: {asset.rarity}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold">{asset.price}</span>
                    <Button size="sm" className="bg-green-500 hover:bg-green-600 text-black text-xs">
                      Buy
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </section >
  )
}
