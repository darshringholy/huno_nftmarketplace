"use client";

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useWallet } from "@/hooks/use-wallet"
import { useRouter } from "next/navigation"
import { useState } from "react"
import WalletConnectDialog from "@/components/ui/wallet-connect-dialog"

export default function CollectionSection() {
  const { isConnected } = useWallet()
  const router = useRouter()
  const [walletDialogOpen, setWalletDialogOpen] = useState(false)

  const handleCreateCollection = () => {
    if (isConnected) {
      // Navigate to collection create page
      router.push('/marketplace/collections/create')
    } else {
      // Show wallet connect dialog
      setWalletDialogOpen(true)
    }
  }

  return (
    <section className="py-16 md:py-20 px-4 md:px-20 relative overflow-hidden" style={{ backgroundColor: "#090909" }}>
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-6 md:space-y-8 text-center lg:text-left">
            <div className="inline-block px-1 py-1 bg-transparent rounded-full border border-gray-700 relative">
              <div className="inline-block px-1 py-1 bg-transparent rounded-full border border-gray-700">
                <div className="inline-block px-2 bg-transparent rounded-full border border-gray-700" style={{                    
                  boxShadow: "inset 0 0 20px rgba(255, 255, 255, 0.4)"
                }}>                
                  {/* Content */}
                  <div className="relative z-10 px-6 py-2 min-w-[260px] flex items-center justify-center rounded-full">
                    <span className="text-white text-lg font-medium tracking-wide">GET START WITH HUNOS</span>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-10 h-0.5 bg-green-500 rounded-b-full" style={{ width: "70%", bottom: "-2px", backgroundImage: "linear-gradient(to right, rgba(172, 235, 47, 0.8), rgba(0,0,0,0.8))" }}></div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Turn Your Assets into a
                <br />
                Liquid ID Collection!
              </h2>

              <p className="text-base md:text-lg text-gray-400 max-w-lg mx-auto lg:mx-0">
                Launch your own Liquid ID collection in minutes. Upload assets, define rarity, and start earning from
                every trade or interaction.
              </p>
            </div>

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
              onClick={handleCreateCollection}
            >
              Create Your Collection
            </Button>
          </div>

          <div className="relative order-first lg:order-last">
            {/* Grid pattern background with elliptical mask */}
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(90deg, #333 1px, transparent 1px),
                  linear-gradient(0deg, #333 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px',
                backgroundPosition: '0 0',
                mask: 'radial-gradient(ellipse 100% 70% at 60% center, black 40%, transparent 85%)',
                WebkitMask: 'radial-gradient(ellipse 100% 70% at 60% center, black 40%, transparent 85%)'
              }}
            ></div>
            
            {/* Gradient overlay */}
            
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
      
      {/* Wallet Connect Dialog */}
      <WalletConnectDialog
        open={walletDialogOpen}
        onOpenChange={setWalletDialogOpen}
        onWalletSelect={(walletId) => {
          console.log("Selected wallet:", walletId)
          setWalletDialogOpen(false)
          // After wallet connection, navigate to create collection page
          router.push('/marketplace/collections/create')
        }}
      />
    </section>
  )
}
