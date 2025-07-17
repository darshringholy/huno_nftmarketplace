"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenuContent } from "@/components/ui/dropdown-menu"
import { LogOut, User, Layers, CreditCard } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ethers } from "ethers"

const PUSD_TOKEN_ADDRESS = "0x1E0E030AbCb4f07de629DCCEa458a271e0E82624";
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

export default function UserProfileDropdown() {
  const { address, chainId, formatAddress, disconnectWallet } = useWallet()
  const [copied, setCopied] = useState(false)
  const [pusdBalance, setPusdBalance] = useState<string>("0")

  useEffect(() => {
    async function fetchPusdBalance() {
      if (!address || !window.ethereum) return;
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(PUSD_TOKEN_ADDRESS, ERC20_ABI, provider);
        const [rawBalance, decimals] = await Promise.all([
          contract.balanceOf(address),
          contract.decimals()
        ]);
        setPusdBalance(ethers.formatUnits(rawBalance, decimals));
      } catch (err) {
        setPusdBalance("0");
      }
    }
    fetchPusdBalance();
  }, [address, chainId]);

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <DropdownMenuContent className="bg-gray-900 border-gray-700 text-white w-80 p-0">
      <div className="p-4 space-y-4">
        {/* User Address Section */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex-1">
            <p className="text-white font-medium">{formatAddress}</p>
            <Link href="/profile" className="text-green-400 text-sm hover:text-green-300">
              View Profile
            </Link>
          </div>
        </div>

        {/* Balance Section */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <img src="/images/pUSD-token.svg" alt="PUSD" className="w-6 h-6 rounded-full" />
              <span className="text-white font-medium">PUSD</span>
            </div>
            <span className="text-white font-semibold">{pusdBalance} PUSD</span>
          </div>
          <Button className="w-full bg-green-500 hover:bg-green-600 text-black font-medium">
            <CreditCard className="w-4 h-4 mr-2" />
            Add funds with card
          </Button>
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          <Link
            href="/profile?tab=items"
            className="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Layers className="w-5 h-5 text-gray-400" />
            <span className="text-white">My LIDs</span>
          </Link>

          <Link
            href="/profile?tab=collections"
            className="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-gray-400 rounded"></div>
            </div>
            <span className="text-white">My Collection</span>
          </Link>
        </div>

        {/* Logout Button */}
        <div className="pt-2 border-t border-gray-700">
          <Button
            onClick={disconnectWallet}
            variant="ghost"
            className="w-full justify-start text-green-400 hover:text-green-300 hover:bg-gray-800"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </DropdownMenuContent>
  )
}
