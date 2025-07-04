import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function HeroSection() {
  return (
    <section className="relative py-12 md:py-20 px-4 md:px-24 overflow-hidden">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-6 md:space-y-8 text-center lg:text-left">
            <div className="inline-block px-2 py-2 bg-transparent rounded-full border border-gray-700">
              <div className="inline-block px-2 py-2 bg-transparent rounded-full border border-gray-700">
                <div className="flex justify-center">
                  <div className="relative">
                    {/* Outer border */}
                    <div className="absolute inset-0 rounded-full border-[3px] border-[#111] pointer-events-none" />
                    {/* Middle border */}
                    <div className="absolute inset-1 rounded-full border-[2px] border-[#222] pointer-events-none" />
                    {/* Inner border */}
                    <div className="absolute inset-2 rounded-full border border-[#333] pointer-events-none" />
                    {/* Content */}
                    <div className="relative z-10 px-4 py-2 min-w-[240px] flex items-center justify-center rounded-full"
                      style={{
                        background: "linear-gradient(180deg, #232323 0%, #181818 100%)",
                        boxShadow: "0 2px 24px 0 rgba(0,0,0,0.7), 0 0 0 1px #222 inset"
                      }}
                    >
                      <span className="text-white text-md font-medium tracking-wide">HUNOS EXCLUSIVE MARKETPLACE !</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                Digital Ownership
                <br />
                with <span className="text-green-400">Real</span> Liquidity
              </h1>

              <p className="text-base md:text-lg text-gray-400 max-w-lg mx-auto lg:mx-0">
                Unlike traditional NFTs, each LiquidID (LID) is directly connected to a token pool or asset, allowing
                users to receive automatic rewards and sell at any time no need for a buyer.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button className="bg-green-500 hover:bg-green-600 text-black font-semibold px-6 md:px-8 py-3">
                Explore Marketplace
              </Button>
              <Button className="bg-green-500 hover:bg-green-600 text-black font-semibold">
                Connect wallet
              </Button>
            </div>
          </div>

          <div className="relative order-first lg:order-last">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full blur-3xl"></div>
            <Image
              src="/images/hero-image.svg"
              alt="Hunos Digital Assets"
              width={600}
              height={400}
              className="relative z-10 w-full h-auto max-w-md md:max-w-lg lg:max-w-full mx-auto"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
