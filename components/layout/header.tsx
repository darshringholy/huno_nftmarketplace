"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Bell, ChevronDown, Menu, X, User } from "lucide-react"
import { usePathname } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import WalletConnectDialog from "@/components/ui/wallet-connect-dialog"
import UserProfileDropdown from "@/components/ui/user-profile-dropdown"
import NotificationDropdown from "@/components/ui/notification-dropdown"
import HexagonAvatar from "@/components/ui/hexagon-avatar"
import { useWallet } from "@/hooks/use-wallet"
import { fetchUserAvatar } from "@/lib/user-avatars"
import Image from "next/image"

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [walletDialogOpen, setWalletDialogOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileSearchQuery, setMobileSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [userAvatar, setUserAvatar] = useState<string | undefined>()

  const { isConnected, address, formatAddress, connectWallet, loading } = useWallet()

  // Fetch user avatar when connected
  useEffect(() => {
    const fetchAvatar = async () => {
      if (isConnected && address) {
        try {
          const userData = await fetchUserAvatar(address)
          if (userData?.avatar) {
            setUserAvatar(userData.avatar)
          }
        } catch (error) {
          console.error("Error fetching user avatar:", error)
        }
      } else {
        setUserAvatar(undefined)
      }
    }

    fetchAvatar()
  }, [isConnected, address])

  const handleWalletSelect = (walletId: string) => {
    console.log("Selected wallet:", walletId)
  }

  // Real API search for collections and items
  const searchCollections = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    setIsSearching(true)
    
    try {
      // Fetch collections from API
      const collectionsResponse = await fetch(`/api/collections?search=${encodeURIComponent(query.trim())}`)
      const collectionsData = await collectionsResponse.json()
      
      // Fetch items from marketplace contract (simplified for now)
      // In a real implementation, you'd query the blockchain for items
      const itemsResponse = await fetch(`/api/items?search=${encodeURIComponent(query.trim())}`)
      const itemsData = await itemsResponse.json()
      
      // Combine and format results
      const collectionResults = collectionsData.map((collection: any) => ({
        id: collection.id || collection._id,
        name: collection.name,
        type: "collection",
        image: collection.logoUrl || collection.bannerUrl || "/images/collection-image.png",
        description: collection.description
      }))
      
      const itemResults = itemsData.map((item: any) => ({
        id: item.liquidId,
        name: item.name || `LID #${item.liquidId}`,
        type: "item",
        image: item.image || "/images/collection-image.png",
        price: item.price
      }))
      
      const allResults = [...collectionResults, ...itemResults]
      
      setSearchResults(allResults)
      setShowSearchResults(true)
    } catch (error) {
      console.error("Search error:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    searchCollections(value)
  }

  const handleMobileSearchChange = (value: string) => {
    setMobileSearchQuery(value)
    searchCollections(value)
  }

  const handleSearchSelect = (result: any) => {
    if (result.type === 'collection') {
      router.push(`/marketplace/collections/${result.id}`)
    } else {
      router.push(`/marketplace/items/${result.id}`)
    }
    setShowSearchResults(false)
    setSearchQuery("")
    setMobileSearchQuery("")
  }

  const handleKeyPress = (e: React.KeyboardEvent, query: string) => {
    if (e.key === 'Enter' && searchResults.length > 0) {
      handleSearchSelect(searchResults[0])
    }
  }

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.search-container')) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="border-b border-gray-800 sticky top-0 z-50" style={{ backgroundColor: "#090909" }}>
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
                  <Link href="/marketplace/collections" className="w-full">
                    Collections
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-800 focus:bg-gray-800">
                  <Link href="/marketplace/discover" className="w-full">
                    Discover
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-800 focus:bg-gray-800">
                  <Link href="/marketplace/discover?tab=activities" className="w-full">
                    Activities
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>


          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full search-container">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search collections..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, searchQuery)}
                onFocus={() => setShowSearchResults(true)}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 pl-10 w-full h-10 rounded-lg"
              />
              
              {/* Search Results Dropdown */}
              {showSearchResults && (searchResults.length > 0 || isSearching) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-400">
                      Searching...
                    </div>
                  ) : (
                    searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleSearchSelect(result)}
                        className="w-full p-3 hover:bg-gray-800 flex items-center space-x-3 text-left"
                      >
                        <img src={result.image} alt={result.name} className="w-8 h-8 rounded object-cover" />
                        <div>
                          <div className="text-white text-sm font-medium">{result.name}</div>
                          <div className="text-gray-400 text-xs capitalize">{result.type}</div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Notification Bell - Only show when user is connected */}
            {isConnected && <NotificationDropdown />}

            {/* Connect Wallet / Profile Button */}
            {isConnected ? (
              <DropdownMenu open={profileDropdownOpen} onOpenChange={setProfileDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-3">
                    <HexagonAvatar 
                      src={userAvatar}
                      size="md"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <UserProfileDropdown />
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => setWalletDialogOpen(true)}
                disabled={loading}
                className="text-black font-semibold px-6 py-2 rounded-lg disabled:opacity-50"
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
              <div className="relative search-container">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search collections..."
                  value={mobileSearchQuery}
                  onChange={(e) => handleMobileSearchChange(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, mobileSearchQuery)}
                  onFocus={() => setShowSearchResults(true)}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 pl-10"
                />
                
                {/* Mobile Search Results */}
                {showSearchResults && (searchResults.length > 0 || isSearching) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    {isSearching ? (
                      <div className="p-4 text-center text-gray-400">
                        Searching...
                      </div>
                    ) : (
                      searchResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleSearchSelect(result)}
                          className="w-full p-3 hover:bg-gray-800 flex items-center space-x-3 text-left"
                        >
                          <img src={result.image} alt={result.name} className="w-8 h-8 rounded object-cover" />
                          <div>
                            <div className="text-white text-sm font-medium">{result.name}</div>
                            <div className="text-gray-400 text-xs capitalize">{result.type}</div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
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
                    href="/marketplace/discover?tab=activities"
                    className="block py-2 px-6 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors"
                  >
                    Activities
                  </Link>
                </div>


              </nav>

              {/* Mobile Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                {isConnected ? (
                  <div className="flex items-center space-x-3">
                    <HexagonAvatar 
                      src={userAvatar}
                      size="sm"
                    />
                    <Button
                      onClick={() => setProfileDropdownOpen(true)}
                      className="bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded-lg"
                    >
                      Profile
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setWalletDialogOpen(true)}
                    disabled={loading}
                    className="text-black font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
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
                    {loading ? "Connecting..." : "Connect"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>



      {/* Wallet Connect Dialog */}
      <WalletConnectDialog
        open={walletDialogOpen}
        onOpenChange={setWalletDialogOpen}
        onWalletSelect={handleWalletSelect}
      />
    </header>
  )
}
