"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Bell, ChevronDown, Menu, X, User } from "lucide-react"
import { usePathname } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState } from "react"
import NetworkSwitcherDialog from "@/components/ui/network-switcher-dialog"
import WalletConnectDialog from "@/components/ui/wallet-connect-dialog"
import UserProfileDropdown from "@/components/ui/user-profile-dropdown"
import { useWallet } from "@/hooks/use-wallet"
import Image from "next/image"

export default function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [networkDialogOpen, setNetworkDialogOpen] = useState(false)
  const [walletDialogOpen, setWalletDialogOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [currentNetwork, setCurrentNetwork] = useState("plume")

  const { isConnected, formatAddress, connectWallet, loading } = useWallet()

  const handleWalletSelect = (walletId: string) => {
    console.log("Selected wallet:", walletId)
  }

  return (
    <header className="bg-black border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/images/logo.svg" alt="Hunos" width={32} height={32} />
            <span className="text-xl font-bold">Hunos</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-1 text-white hover:text-gray-300 transition-colors focus:outline-none">
                <span className="text-sm font-medium">Marketplace</span>
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-900 border-gray-700 text-white">
                <DropdownMenuItem className="hover:bg-gray-800 focus:bg-gray-800">
                  <Link href="/marketplace" className="w-full">
                    Marketplace
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-800 focus:bg-gray-800">
                  <Link href="/marketplace/discover" className="w-full">
                    Discover
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-800 focus:bg-gray-800">
                  <Link href="/marketplace/collections" className="w-full">
                    Collections
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-1 text-white hover:text-gray-300 transition-colors focus:outline-none">
                <span className="text-sm font-medium">Resources</span>
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-900 border-gray-700 text-white">
                <DropdownMenuItem className="hover:bg-gray-800 focus:bg-gray-800">
                  <Link href="/help" className="w-full">
                    Help Center
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-800 focus:bg-gray-800">
                  <Link href="/docs" className="w-full">
                    Documentation
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-800 focus:bg-gray-800">
                  <Link href="/support" className="w-full">
                    Support
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Collection, Item or User"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 pl-10 w-full h-10 rounded-lg"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* UK Flag */}
            <img src="/images/uk-flag.svg" alt="UK" className="w-8 h-8" draggable={false} />

            {/* Notification Bell */}
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
              <Bell className="w-5 h-5" />
            </Button>

            {/* Network Switcher */}
            <button
              onClick={() => setNetworkDialogOpen(true)}
              className="flex items-center space-x-2 hover:bg-gray-800 rounded-lg px-2 py-1 transition-colors"
            >
              {/* Dynamic Network Icon */}
              {currentNetwork === "plume" && (
                <img src="/images/plume-logo.svg" alt="Plume" className="w-8 h-8" draggable={false} />
              )}
              {currentNetwork === "ethereum" && (
                <img src="/images/ether-logo.png" alt="Ethereum" className="w-8 h-8" draggable={false} />
              )}
              {currentNetwork === "polygon" && (
                <img src="/images/polygon-logo.png" alt="Polygon" className="w-8 h-8" draggable={false} />
              )}
              {currentNetwork === "arbitrum" && (
                <img src="/images/arbitrum-logo.png" alt="Arbitrum" className="w-8 h-8" draggable={false} />
              )}
              {currentNetwork === "solana" && (
                <img src="/images/solana-logo.svg" alt="Solana" className="w-8 h-8" draggable={false} />
              )}
              <span className="text-white text-sm font-medium capitalize">{currentNetwork}</span>
            </button>

            {/* Connect Wallet / Profile Button */}
            {isConnected ? (
              <DropdownMenu open={profileDropdownOpen} onOpenChange={setProfileDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-10 h-10 rounded-full border-2 border-green-500 p-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-black" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <UserProfileDropdown />
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => setWalletDialogOpen(true)}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-black font-semibold px-6 py-2 rounded-lg disabled:opacity-50"
              >
                {loading ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-800">
            <div className="space-y-4 pt-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Collection, Item or User"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 pl-10"
                />
              </div>

              {/* Mobile Navigation */}
              <nav className="space-y-2">
                <div className="space-y-1">
                  <div className="text-gray-400 text-sm font-medium px-4 py-2">Marketplace</div>
                  <Link
                    href="/marketplace"
                    className="block py-2 px-6 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors"
                  >
                    Marketplace
                  </Link>
                  <Link
                    href="/marketplace/discover"
                    className="block py-2 px-6 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors"
                  >
                    Discover
                  </Link>
                  <Link
                    href="/marketplace/collections"
                    className="block py-2 px-6 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors"
                  >
                    Collections
                  </Link>
                </div>

                <div className="space-y-1">
                  <div className="text-gray-400 text-sm font-medium px-4 py-2">Resources</div>
                  <Link
                    href="/help"
                    className="block py-2 px-6 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors"
                  >
                    Help Center
                  </Link>
                  <Link
                    href="/docs"
                    className="block py-2 px-6 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors"
                  >
                    Documentation
                  </Link>
                  <Link
                    href="/support"
                    className="block py-2 px-6 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors"
                  >
                    Support
                  </Link>
                </div>
              </nav>

              {/* Mobile Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <button onClick={() => setNetworkDialogOpen(true)} className="flex items-center space-x-3">
                  {/* Dynamic Network Icon for Mobile */}
                  {currentNetwork === "plume" && (
                    <img src="/images/plume-logo.svg" alt="Plume" className="w-8 h-8" draggable={false} />
                  )}
                  {currentNetwork === "ethereum" && (
                    <img src="/images/ether-logo.png" alt="Ethereum" className="w-8 h-8" draggable={false} />
                  )}
                  {currentNetwork === "polygon" && (
                    <img src="/images/polygon-logo.png" alt="Polygon" className="w-8 h-8" draggable={false} />
                  )}
                  {currentNetwork === "arbitrum" && (
                    <img src="/images/arbitrum-logo.png" alt="Arbitrum" className="w-8 h-8" draggable={false} />
                  )}
                  {currentNetwork === "solana" && (
                    <img src="/images/solana-logo.svg" alt="Solana" className="w-8 h-8" draggable={false} />
                  )}
                  <span className="text-white text-sm capitalize">{currentNetwork}</span>
                </button>
                {isConnected ? (
                  <Button
                    onClick={() => setProfileDropdownOpen(true)}
                    className="bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded-lg"
                  >
                    Profile
                  </Button>
                ) : (
                  <Button
                    onClick={() => setWalletDialogOpen(true)}
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    {loading ? "Connecting..." : "Connect"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Network Switcher Dialog */}
      <NetworkSwitcherDialog
        open={networkDialogOpen}
        onOpenChange={setNetworkDialogOpen}
        currentNetwork={currentNetwork}
        onNetworkSelect={setCurrentNetwork}
      />

      {/* Wallet Connect Dialog */}
      <WalletConnectDialog
        open={walletDialogOpen}
        onOpenChange={setWalletDialogOpen}
        onWalletSelect={handleWalletSelect}
      />
    </header>
  )
}
