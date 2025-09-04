"use client";

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { useWallet } from "@/hooks/use-wallet"
import { useState } from "react"
import WalletConnectDialog from "@/components/ui/wallet-connect-dialog"

export default function HeroSection() {
  const { isConnected, loading } = useWallet();
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);

  const handleWalletSelect = (walletId: string) => {
    console.log("Selected wallet:", walletId)
  }

  return (
    <section className="relative py-12 md:py-20 px-4 md:px-24 overflow-hidden" style={{ backgroundColor: "#090909" }}>
      {/* Gradient circle positioned at top left of hero section */}
      <div 
        className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full blur-3xl pointer-events-none z-0"
        style={{ 
          transform: 'translate(-50%, -50%)',
          background: 'linear-gradient(to right, rgba(172, 235, 47, 0.8), rgba(9, 9, 9, 0))'
        }}
      ></div>
      
      {/* Gradient circle positioned at top right of hero section */}
      <div 
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none z-0"
        style={{ 
          transform: 'translate(50%, -50%)',
          background: 'linear-gradient(to left, rgba(172, 235, 47, 0.8), rgba(9, 9, 9, 0))'
        }}
      ></div>
      
      {/* Grid pattern with elliptical mask at center of hero section */}
      <div 
        className="absolute inset-0 pointer-events-none -z-5"
        style={{
          backgroundImage: `
            linear-gradient(90deg, #333 1px, transparent 1px),
            linear-gradient(0deg, #333 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          backgroundPosition: 'center',
          mask: 'radial-gradient(ellipse 60% 40% at center, black 30%, transparent 80%)',
          WebkitMask: 'radial-gradient(ellipse 40% 60% at center, black 10%, transparent 60%)'
        }}
      ></div>
      
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-6 md:space-y-8 text-center lg:text-left z-10 relative">
            <div className="inline-block px-1 py-1 bg-transparent rounded-full border border-gray-700 relative">
              <div className="inline-block px-1 py-1 bg-transparent rounded-full border border-gray-700">
                <div className="inline-block px-2 bg-transparent rounded-full border border-gray-700" style={{                    
                  boxShadow: "inset 0 0 20px rgba(255, 255, 255, 0.4)"
                }}>                
                  {/* Content */}
                  <div className="relative z-10 px-6 py-2 min-w-[240px] flex items-center justify-center rounded-full">
                    <span className="text-white text-lg font-medium tracking-wide">HUNOS EXCLUSIVE MARKETPLACE !</span>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-10 h-0.5 bg-green-500 rounded-b-full" style={{ width: "70%", bottom: "-2px", backgroundImage: "linear-gradient(to right, rgba(172, 235, 47, 0.8), rgba(0,0,0,0.8))" }}></div>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                Digital Ownership
                <br />
                with <span style={{ color: "#ACEB2F" }}>Real</span> Liquidity
              </h1>

              <p className="text-base md:text-lg text-gray-400 max-w-lg mx-auto lg:mx-0">
                Unlike traditional NFTs, each LiquidID (LID) is directly connected to a token pool or asset, allowing
                users to receive automatic rewards and sell at any time no need for a buyer.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/marketplace">
                <Button 
                  className="text-black font-semibold px-6 md:px-8 py-3"
                  style={{ 
                    backgroundColor: "#ACEB2F",
                    borderColor: "#ACEB2F"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#9CDB2A";
                    e.currentTarget.style.borderColor = "#9CDB2A";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#ACEB2F";
                    e.currentTarget.style.borderColor = "#ACEB2F";
                  }}
                >
                  Explore Marketplace
                </Button>
              </Link>
              {!isConnected && (
                <Button
                  onClick={() => setWalletDialogOpen(true)}
                  disabled={loading}
                  className="text-black font-semibold px-6 md:px-8 py-3 disabled:opacity-50"
                  style={{ 
                    backgroundColor: "rgba(172, 235, 47, 0.1)",
                    borderColor: "rgba(172, 235, 47, 0.1)",
                    color: "#ACEB2F"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(172, 235, 47, 0.2)";
                    e.currentTarget.style.borderColor = "rgba(172, 235, 47, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(172, 235, 47, 0.1)";
                    e.currentTarget.style.borderColor = "rgba(172, 235, 47, 0.1)";
                  }}
                >
                  {loading ? "Connecting..." : "Connect Wallet"}
                </Button>
              )}
            </div>
          </div>

          <div className="relative order-first lg:order-last">
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

      {/* Wallet Connect Dialog */}
      <WalletConnectDialog
        open={walletDialogOpen}
        onOpenChange={setWalletDialogOpen}
        onWalletSelect={handleWalletSelect}
      />
    </section>
  )
}
