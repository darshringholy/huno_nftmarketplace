"use client"

import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, LogOut } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { useState } from "react"

export default function WalletInfo() {
  const { address, balance, chainId, formatAddress, disconnectWallet } = useWallet()
  const [copied, setCopied] = useState(false)

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getExplorerUrl = () => {
    switch (chainId) {
      case 1:
        return `https://etherscan.io/address/${address}`
      case 137:
        return `https://polygonscan.com/address/${address}`
      case 42161:
        return `https://arbiscan.io/address/${address}`
      default:
        return `https://etherscan.io/address/${address}`
    }
  }

  const getNetworkName = () => {
    switch (chainId) {
      case 1:
        return "Ethereum"
      case 137:
        return "Polygon"
      case 42161:
        return "Arbitrum"
      case 98865:
        return "Plume"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Wallet Connected</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={disconnectWallet}
          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-400">Network</label>
          <p className="text-white font-medium">{getNetworkName()}</p>
        </div>

        <div>
          <label className="text-sm text-gray-400">Address</label>
          <div className="flex items-center space-x-2">
            <p className="text-white font-mono">{formatAddress}</p>
            <Button variant="ghost" size="sm" onClick={copyAddress} className="text-gray-400 hover:text-white p-1">
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(getExplorerUrl(), "_blank")}
              className="text-gray-400 hover:text-white p-1"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
          {copied && <p className="text-sm text-green-400 mt-1">Address copied!</p>}
        </div>

        <div>
          <label className="text-sm text-gray-400">Balance</label>
          <p className="text-white font-medium">{Number.parseFloat(balance).toFixed(4)} ETH</p>
        </div>
      </div>
    </div>
  )
}
