"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface NetworkSwitcherDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentNetwork?: string
  onNetworkSelect?: (network: string) => void
}

const networks = [
  {
    id: "plume",
    name: "Plume Testnet",
    icon: (
        <img src="/images/plume-logo.svg" alt="Plume" className="w-12 h-12" draggable={false} />
    ),
  },
]

export default function NetworkSwitcherDialog({
  open,
  onOpenChange,
  currentNetwork = "plume",
  onNetworkSelect,
}: NetworkSwitcherDialogProps) {
  const handleNetworkSelect = (networkId: string) => {
    onNetworkSelect?.(networkId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
              <DialogContent className="border-gray-800 text-white max-w-md p-0" style={{ backgroundColor: "#080A0C" }}>
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Networks</DialogTitle>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6">
          <div className="flex justify-center">
            {networks.map((network) => (
              <button
                key={network.id}
                onClick={() => handleNetworkSelect(network.id)}
                className={`flex flex-col items-center space-y-3 p-4 rounded-xl transition-colors ${
                  currentNetwork === network.id ? "bg-gray-700 border border-gray-600" : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                {network.icon}
                <span className="text-sm font-medium text-white">{network.name}</span>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
