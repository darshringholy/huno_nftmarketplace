import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function CollectionSection() {
  return (
    <section className="py-16 md:py-20 px-4 md:px-20 bg-gray-950">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-6 md:space-y-8 text-center lg:text-left">
            <div className="inline-block px-2 py-2 bg-transparent rounded-full border border-gray-700">
              <div className="inline-block px-2 py-2 bg-transparent rounded-full border border-gray-700">
                <div className="relative inline-block">
                  {/* Outer border */}
                  <div className="absolute inset-0 rounded-full border-[3px] border-[#222] pointer-events-none" />
                  {/* Middle border */}
                  <div className="absolute inset-1 rounded-full border-[2px] border-[#333] pointer-events-none" />
                  {/* Inner border */}
                  <div className="absolute inset-2 rounded-full border border-[#444] pointer-events-none" />
                  {/* Content */}
                  <div
                    className="relative z-10 px-6 py-2 min-w-[260px] flex items-center justify-center rounded-full"
                    style={{
                      background: "linear-gradient(180deg, #232323 0%, #181818 100%)",
                      boxShadow: "0 2px 24px 0 rgba(0,0,0,0.7), 0 0 0 1px #222 inset"
                    }}
                  >
                    <span className="text-white text-base font-medium tracking-wide">GET START WITH HUNOS</span>
                  </div>
                  {/* Bottom green accent line */}
                  <div className="absolute left-4 right-4 bottom-1 h-0.5 bg-gradient-to-r from-green-400/80 to-green-600/60 rounded-full" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Turn Your Assets into a
                <br />
                LiquidID Collection!
              </h2>

              <p className="text-base md:text-lg text-gray-400 max-w-lg mx-auto lg:mx-0">
                Launch your own LiquidID collection in minutes. Upload assets, define rarity, and start earning from
                every trade or interaction.
              </p>
            </div>

            <Button className="bg-green-500 hover:bg-green-600 text-black font-semibold px-6 md:px-8 py-3">
              Create Your Collection
            </Button>
          </div>

          <div className="relative order-first lg:order-last">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full blur-3xl"></div>
            <Image
              src="/images/collection-image.png"
              alt="LiquidID Collection"
              width={1500}
              height={1500}
              className="relative z-10 w-3/4 h-auto max-w-md md:max-w-lg lg:max-w-full mx-auto"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
