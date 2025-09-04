"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, ChevronUp, ChevronDown } from "lucide-react"
import { useState } from "react"

interface OfferPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nftData?: {
    name: string
    image: string
    price: string
    collectionName: string
  }
  onMakeOffer: (offerPrice: string, expireDate: string) => void
  isMakingOffer?: boolean
  sellType?: number // 0 for fixed price, 1 for auction
}

export default function OfferPopup({ open, onOpenChange, nftData, onMakeOffer, isMakingOffer = false, sellType = 0 }: OfferPopupProps) {
  const [offerPrice, setOfferPrice] = useState("")
  const [priceError, setPriceError] = useState("")
  const [showExpireDropdown, setShowExpireDropdown] = useState(false)
  const [selectedExpireOption, setSelectedExpireOption] = useState("30 minutes")
  const [customExpireValue, setCustomExpireValue] = useState("")
  const [customExpireUnit, setCustomExpireUnit] = useState("hours")
  
  // Determine title and button text based on sell type
  const isAuction = sellType === 1
  const title = isAuction ? "Bid" : "Make Offer"
  const buttonText = isAuction ? "Place Bid" : "Offer to Buy"
  const loadingText = isAuction ? "Placing bid..." : "Making offer..."
  
  const handlePriceChange = (value: string) => {
    setOfferPrice(value)
    // Clear error when user starts typing
    if (priceError) {
      setPriceError("")
    }
    
    // Validate price
    const numValue = parseFloat(value)
    if (value && (isNaN(numValue) || numValue <= 0)) {
      setPriceError("The number you typed is invalid.")
    } else {
      setPriceError("")
    }
  }
  
  const expireOptions = [
    "15 minutes",
    "30 minutes", 
    "1 hour",
    "3 hours",
    "6 hours",
    "12 hours",
    "1 day",
    "3 days",
    "7 days",
    "30 days",
    "60 days",
    "6 months",
    "Custom"
  ]

  const handleExpireOptionSelect = (option: string) => {
    if (option === "Custom") {
      setSelectedExpireOption("Custom")
      setShowExpireDropdown(false)
    } else {
      setSelectedExpireOption(option)
      setShowExpireDropdown(false)
    }
  }

  const handleMakeOffer = () => {
    if (!offerPrice || priceError) {
      return
    }
    
    const expireDate = selectedExpireOption === "Custom" 
      ? `${customExpireValue} ${customExpireUnit}`
      : selectedExpireOption
    
    onMakeOffer(offerPrice, expireDate)
  }
  
  const handleClose = () => {
    setOfferPrice("")
    setPriceError("")
    setShowExpireDropdown(false)
    setSelectedExpireOption("30 minutes")
    setCustomExpireValue("")
    setCustomExpireUnit("hours")
    onOpenChange(false)
  }
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
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

          {/* Price Input Section */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Price</label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.1"
                  value={offerPrice}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className={`w-full bg-gray-800 border-gray-700 text-white placeholder-gray-400 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-number-spin-button]:appearance-none ${
                    priceError ? "border-red-500" : ""
                  }`}
                  step="0.01"
                  min="0"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  <img src="/images/pUSD-token.svg" alt="PUSD" className="w-4 h-4 rounded-full" />
                  <span className="text-white text-sm">PUSD</span>
                </div>
              </div>
              {priceError && (
                <p className="text-red-500 text-sm mt-1">{priceError}</p>
              )}
            </div>
            
            {/* Expire Date Section */}
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Expire Date</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowExpireDropdown(!showExpireDropdown)}
                  className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-md flex items-center justify-between hover:border-gray-600 transition-colors"
                >
                  <span>{selectedExpireOption}</span>
                  {showExpireDropdown ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                
                {/* Dropdown Menu */}
                {showExpireDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                    {expireOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleExpireOptionSelect(option)}
                        className="w-full px-3 py-2 text-left text-white hover:bg-gray-700 transition-colors"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Custom Expire Input */}
              {selectedExpireOption === "Custom" && (
                <div className="mt-2 flex gap-2">
                  <Input
                    type="number"
                    placeholder="1"
                    value={customExpireValue}
                    onChange={(e) => setCustomExpireValue(e.target.value)}
                    className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-number-spin-button]:appearance-none"
                    min="1"
                  />
                  <select
                    value={customExpireUnit}
                    onChange={(e) => setCustomExpireUnit(e.target.value)}
                    className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-md"
                  >
                    <option value="minutes">minutes</option>
                    <option value="hours">hours</option>
                    <option value="days">days</option>
                    <option value="weeks">weeks</option>
                    <option value="months">months</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Offer Details */}
          <div className="mb-6">
            <p className="text-gray-400 text-sm leading-relaxed">
              <strong>An Offer to buy</strong> needs the owner to accept. Your payment will be withheld by the marketplace. <strong>You can cancel</strong> the offer any time if not accepted.
            </p>
          </div>

          {/* Make Offer Button */}
          <Button
            onClick={handleMakeOffer}
            disabled={isMakingOffer || !offerPrice || !!priceError}
            className={`w-full font-bold py-3 rounded-xl text-lg transition-colors ${
              isMakingOffer || !offerPrice || !!priceError
                ? "bg-gray-500 text-gray-300 cursor-not-allowed" 
                : "bg-lime-400 text-black hover:bg-lime-300"
            }`}
          >
            {isMakingOffer ? loadingText : buttonText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 