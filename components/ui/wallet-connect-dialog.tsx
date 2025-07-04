"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useWeb3Modal } from "@web3modal/ethers/react"

interface WalletConnectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onWalletSelect?: (walletId: string) => void
}

const wallets = [
  {
    id: "metamask",
    name: "Metamask",
    icon: <img src="/images/metamask-logo.svg" alt="Metamask" className="w-12 h-12" draggable={false} />,
  },
  {
    id: "trust",
    name: "Trust Wallet",
    icon: <img src="/images/trust-wallet-logo.svg" alt="Trust Wallet" className="w-12 h-12" draggable={false} />,
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    icon: <img src="/images/walletconnect-logo.svg" alt="WalletConnect" className="w-12 h-12" draggable={false} />,
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    icon: <img src="/images/coinbase-logo.svg" alt="Coinbase Wallet" className="w-12 h-12" draggable={false} />,
  },
  {
    id: "okx",
    name: "OKX Wallet",
    icon: <img src="/images/okx-logo.svg" alt="OKX Wallet" className="w-12 h-12" draggable={false} />,
  },
]

export default function WalletConnectDialog({ open, onOpenChange, onWalletSelect }: WalletConnectDialogProps) {
  const { open: openModal } = useWeb3Modal()

  const handleWalletSelect = async (walletId: string) => {
    try {
      if (walletId === "metamask") {
        // Check if MetaMask is installed
        if (typeof window !== "undefined" && window.ethereum) {
          // Open Web3Modal which will handle MetaMask connection
          await openModal()
        } else {
          // If MetaMask is not installed, redirect to download
          window.open("https://metamask.io/download/", "_blank")
          return
        }
      } else {
        // For other wallets, use Web3Modal
        await openModal()
      }

      onWalletSelect?.(walletId)
      onOpenChange(false)
    } catch (error) {
      console.error("Wallet connection error:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-semibold">Connect Wallet</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          <div className="grid grid-cols-3 gap-4 mb-4">
            {wallets.slice(0, 3).map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => handleWalletSelect(wallet.id)}
                className="flex flex-col items-center space-y-3 p-4 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                {wallet.icon}
                <span className="text-sm font-medium text-white">{wallet.name}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
            {wallets.slice(3).map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => handleWalletSelect(wallet.id)}
                className="flex flex-col items-center space-y-3 p-4 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                {wallet.icon}
                <span className="text-sm font-medium text-white">{wallet.name}</span>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
