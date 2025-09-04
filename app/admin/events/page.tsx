"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Square, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import AdminProtected from "@/components/auth/AdminProtected"

interface EventListenerStatus {
  isListening: boolean
  lastProcessedBlock: number
  pollInterval: number
  processedEventsCount: number
}

export default function EventsAdminPage() {
  const { toast } = useToast()
  const [status, setStatus] = useState<EventListenerStatus | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/events/status")
      const data = await response.json()
      
      if (data.success) {
        setStatus(data.status)
      } else {
        throw new Error(data.error || "Failed to fetch status")
      }
    } catch (error) {
      console.error("Error fetching status:", error)
    }
  }

  const startListener = async () => {
    setLoading(true)
    try {
      // Get user's address from wallet
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const accounts = await provider.listAccounts()
      const userAddress = accounts[0]?.address

      if (!userAddress) {
        throw new Error("No wallet connected")
      }

      const response = await fetch(`/api/events/start?address=${userAddress}`, {
        method: "POST",
      })
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Event listener started successfully",
        })
        fetchStatus()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Error starting listener:", error)
      toast({
        title: "Error",
        description: "Failed to start event listener",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const stopListener = async () => {
    setLoading(true)
    try {
      // Get user's address from wallet
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const accounts = await provider.listAccounts()
      const userAddress = accounts[0]?.address

      if (!userAddress) {
        throw new Error("No wallet connected")
      }

      const response = await fetch(`/api/events/start?address=${userAddress}`, {
        method: "DELETE",
      })
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Event listener stopped successfully",
        })
        fetchStatus()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Error stopping listener:", error)
      toast({
        title: "Error",
        description: "Failed to stop event listener",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const clearCache = async () => {
    setLoading(true)
    try {
      // Get user's address from wallet
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const accounts = await provider.listAccounts()
      const userAddress = accounts[0]?.address

      if (!userAddress) {
        throw new Error("No wallet connected")
      }

      const response = await fetch(`/api/events/clear-cache?address=${userAddress}`, {
        method: "POST",
      })
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Processed events cache cleared successfully",
        })
        fetchStatus()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Error clearing cache:", error)
      toast({
        title: "Error",
        description: "Failed to clear cache",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetBlock = async () => {
    setLoading(true)
    try {
      // Get user's address from wallet
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const accounts = await provider.listAccounts()
      const userAddress = accounts[0]?.address

      if (!userAddress) {
        throw new Error("No wallet connected")
      }

      const response = await fetch(`/api/events/reset-block?address=${userAddress}`, {
        method: "POST",
      })
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Last processed block reset successfully",
        })
        fetchStatus()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Error resetting block:", error)
      toast({
        title: "Error",
        description: "Failed to reset block",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    // Poll status every 10 seconds
    const interval = setInterval(fetchStatus, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <AdminProtected>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Event Listener Admin</h1>
          <Button
            onClick={fetchStatus}
            variant="outline"
            size="sm"
            className="text-green-500 border-green-500 hover:bg-green-500 hover:text-black"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Status
          </Button>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Marketplace Event Listener</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {status ? (
              <>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-400">Status:</span>
                  <Badge 
                    variant={status.isListening ? "default" : "secondary"}
                    className={status.isListening ? "bg-green-500 text-black" : "bg-gray-500"}
                  >
                    {status.isListening ? "Running" : "Stopped"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">Last Processed Block</div>
                    <div className="text-white font-mono text-lg">{status.lastProcessedBlock.toLocaleString()}</div>
                  </div>
                  
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">Poll Interval</div>
                    <div className="text-white font-mono text-lg">{status.pollInterval / 1000}s</div>
                  </div>
                  
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">Processed Events</div>
                    <div className="text-white font-mono text-lg">{status.processedEventsCount || 0}</div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  {status.isListening ? (
                    <Button
                      onClick={stopListener}
                      disabled={loading}
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      {loading ? "Stopping..." : "Stop Listener"}
                    </Button>
                  ) : (
                    <Button
                      onClick={startListener}
                      disabled={loading}
                      className="bg-green-500 hover:bg-green-600 text-black"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {loading ? "Starting..." : "Start Listener"}
                    </Button>
                  )}
                  
                  <Button
                    onClick={clearCache}
                    disabled={loading}
                    variant="outline"
                    className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {loading ? "Clearing..." : "Clear Cache"}
                  </Button>
                  
                  <Button
                    onClick={resetBlock}
                    disabled={loading}
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-black"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {loading ? "Resetting..." : "Reset Block"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading status...</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Event Types Monitored</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-white">Sale Events</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• SaleCreated - New listings</li>
                  <li>• SaleCompleted - Items sold</li>
                  <li>• SaleCancelled - Listings cancelled</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-white">Bid Events</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• BidPlaced - New bids on auctions</li>
                  <li>• Outbid notifications</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-white">Offer Events</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• OfferMade - Buy offers received</li>
                  <li>• OfferAccepted - Offers accepted</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-white">Auction Events</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• AuctionEnded - Auction results</li>
                  <li>• Reserve met/not met notifications</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminProtected>
  )
} 