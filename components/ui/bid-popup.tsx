"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, ArrowRight, ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"

interface BidPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nftData?: {
    name: string
    image: string
    price: string
    collectionName: string
  }
  onBuy: () => void
  isBuying?: boolean
  sellType?: number // 0 for fixed price, 1 for auction
}

export default function BidPopup({ open, onOpenChange, nftData, onBuy, isBuying = false, sellType = 0 }: BidPopupProps) {
  
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState("0.00")
  const [showPromoCode, setShowPromoCode] = useState(false)
  
  const handleApplyPromoCode = () => {
    if (promoCode.trim()) {
      // Simulate applying promo code - in real app, this would call an API
      setDiscount("0.15") // 15% discount example
    }
  }
  
  const totalPrice = parseFloat(nftData?.price || "0.75") - parseFloat(discount)
  
  // Determine title and button text based on sell type
  const isAuction = Number(sellType) === 1
  const title = isAuction ? "Bid" : "Buy"
  const buttonText = isAuction ? "Place Bid" : "Buy Now"
  const loadingText = isAuction ? "Placing bid..." : "Buying..."
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
              <DialogContent className="border-gray-800 text-white max-w-md p-0" style={{ backgroundColor: "#080A0C" }}>
        <div className="p-6">
          {/* Header */}
          <div className="mb-4">
            <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          </div>

          {/* Preview Area */}
          <div className="bg-gray-800 rounded-xl h-48 mb-6 flex items-center justify-center">
            {nftData?.image ? (
              <img
                src={nftData.image}
                alt={nftData.name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="text-gray-400 text-center">
                <div className="w-16 h-16 bg-gray-700 rounded-lg mx-auto mb-2"></div>
                <p className="text-sm">LID Preview</p>
              </div>
            )}
          </div>

          {/* Price Details */}
          <div className="space-y-4 mb-6">
            {/* Price */}
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Price</span>
              <span className="text-white font-semibold">{nftData?.price || "0.75 PUSD"}</span>
            </div>

            {/* Promo Code */}
            <div className="space-y-3">
              <div 
                className="flex items-center justify-between text-lime-400 cursor-pointer hover:text-lime-300 transition-colors"
                onClick={() => setShowPromoCode(!showPromoCode)}
              >
                <span className="flex items-center gap-2">
                  {showPromoCode ? (
                    <ChevronDown className="w-4 h-4 text-lime-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-lime-400" />
                  )}
                  Apply promo code
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showPromoCode ? 'rotate-180' : ''}`} />
              </div>
              
              {showPromoCode && (
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  />
                  <Button
                    disabled={true}
                    className="bg-gray-600 text-gray-400 cursor-not-allowed"
                  >
                    Apply
                  </Button>
                </div>
              )}
            </div>

            {/* Separator */}
            <div className="border-t border-gray-700"></div>

            {/* Discount */}
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Discount</span>
              <span className="text-white">{discount} PUSD</span>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Total</span>
              <span className="text-white font-semibold">{totalPrice.toFixed(2)} PUSD</span>
            </div>
          </div>

          {/* Buy Button */}
          <Button
            onClick={onBuy}
            disabled={isBuying}
            className={`w-full font-bold py-3 rounded-xl text-lg transition-colors ${
              isBuying 
                ? "bg-gray-500 text-gray-300 cursor-not-allowed" 
                : "bg-lime-400 text-black hover:bg-lime-300"
            }`}
          >
            {isBuying ? loadingText : buttonText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 