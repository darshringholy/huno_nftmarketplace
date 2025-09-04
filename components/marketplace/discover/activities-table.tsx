"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ExternalLink } from "lucide-react"
import { ethers } from "ethers"
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from "@/lib/marketplace"
import { LIQUIDID_ABI, LIQUIDID_ADDRESS } from "@/lib/liquidid"

interface MarketplaceEvent {
  id: string
  type: string
  subType: string
  liquidId: string
  from: string
  to: string
  price: string
  usdPrice: string
  currency: string
  time: string
  blockNumber: number
  transactionHash: string
  itemName?: string
  itemImage?: string
  collectionName?: string
}

interface ActivitiesTableProps {
  activityFilter: string
  liquidId?: string
}

// Helper to resolve IPFS URI to gateway URL
const resolveIpfs = (uri: string) => {
  if (!uri) return null;
  if (uri.startsWith("ipfs://")) {
    const hash = uri.replace("ipfs://", "");
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }
  return uri;
};

// Helper to fetch metadata
const fetchMetadata = async (uri: string) => {
  if (!uri) return null;
  
  let url = resolveIpfs(uri);
  if (!url) return null;
  
  try {
    const response = await fetch(url);
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.log("Error fetching metadata:", err);
  }
  
  return null;
};

export default function ActivitiesTable({ activityFilter, liquidId }: ActivitiesTableProps) {
  const [activities, setActivities] = useState<MarketplaceEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [itemMetadata, setItemMetadata] = useState<{ [liquidId: string]: any }>({})
  const [collectionNames, setCollectionNames] = useState<{ [collectionId: string]: string }>({})

  // Fetch marketplace events
  const fetchMarketplaceEvents = async () => {
    setLoading(true)
    setError(null)
    
    try {
      let provider: ethers.BrowserProvider | ethers.JsonRpcProvider
      if (typeof window !== "undefined" && (window as any).ethereum) {
        provider = new ethers.BrowserProvider((window as any).ethereum)
      } else {
        provider = new ethers.JsonRpcProvider("https://testnet-rpc.plume.org")
      }
      
      console.log('Creating contracts with addresses:', { MARKETPLACE_ADDRESS, LIQUIDID_ADDRESS })
      const contract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider)
      const liquidIdContract = new ethers.Contract(LIQUIDID_ADDRESS, LIQUIDID_ABI, provider)
      console.log('Contracts created successfully')
      
      // Test if contract exists and is accessible
      try {
        console.log('Testing contract accessibility...')
        
        // Check if contract has code
        const code = await provider.getCode(MARKETPLACE_ADDRESS)
        console.log('Contract code length:', code.length)
        if (code === '0x') {
          throw new Error('Contract has no code deployed')
        }
        
        // Test if contract owner function works
        const owner = await contract.owner()
        console.log('Contract owner:', owner)
        
        // Test a simple view function as well
        const totalSupply = await contract.getSaleArray(0, 1)
        console.log('Contract accessible, getSaleArray test successful')
        
      } catch (err) {
        console.log('Error accessing contract:', err)
        setError('Unable to access marketplace contract. Please check the contract address.')
        setLoading(false)
        return
      }
      
      // Get the latest block number
      const latestBlock = await provider.getBlockNumber()
      const fromBlock = Math.max(0, latestBlock - 1000000) // Get events from last 1000000 blocks
      
      console.log(`Fetching events from block ${fromBlock} to ${latestBlock}`)
      console.log('Marketplace contract address:', MARKETPLACE_ADDRESS)
      
      const events: MarketplaceEvent[] = []
      
      // Fetch different types of events
      const eventTypes = [
        { name: 'SaleCreated', filter: contract.filters.SaleCreated },
        { name: 'SaleCompleted', filter: contract.filters.SaleCompleted },
        { name: 'SaleCancelled', filter: contract.filters.SaleCancelled },
        { name: 'BidPlaced', filter: contract.filters.BidPlaced },
        { name: 'AuctionEnded', filter: contract.filters.AuctionEnded },
        { name: 'OfferMade', filter: contract.filters.OfferMade },
        { name: 'OfferAccepted', filter: contract.filters.OfferAccepted },
        { name: 'OfferCancelled', filter: contract.filters.OfferCancelled }
      ]
      
      for (const eventType of eventTypes) {
        try {
          console.log(`Fetching ${eventType.name} events...`)
          const logs = await contract.queryFilter(eventType.filter(), fromBlock, latestBlock)
          console.log(`Found ${logs.length} ${eventType.name} events`)
          
          for (const log of logs) {
            console.log(`Processing ${eventType.name} log:`, log)
            const parsedLog = contract.interface.parseLog(log)
            if (!parsedLog) {
              console.log('Failed to parse log, skipping...')
              continue
            }
            const args = parsedLog.args
            
            let event: MarketplaceEvent = {
              id: `${log.transactionHash}-${log.index}`,
              type: eventType.name.toLowerCase().replace('sale', '').replace('offer', ''),
              subType: eventType.name,
              liquidId: args.liquidId?.toString() || '0',
              from: args.seller || args.bidder || args.buyer || '0x0000000000000000000000000000000000000000',
              to: args.buyer || args.winner || '0x0000000000000000000000000000000000000000',
              price: '0',
              usdPrice: '$0',
              currency: 'PUSD',
              time: new Date().toLocaleString(), // Will be updated with block timestamp
              blockNumber: log.blockNumber,
              transactionHash: log.transactionHash
            }
            
            // Map event types to display text
            if (eventType.name === 'SaleCreated') {
              const sellType = Number(args.sellType)
              event.type = 'Listing'
              event.subType = sellType === 1 ? 'As Auction' : 'As Fixed Price'
              const price = sellType === 0 ? args.price : args.price // For auctions, use starting price
              event.price = ethers.formatUnits(price, 18)
              event.usdPrice = `$${parseFloat(event.price).toFixed(2)}`
            } else if (eventType.name === 'SaleCompleted') {
              event.type = 'Listing'
              event.subType = 'Completed'
              event.price = ethers.formatUnits(args.price, 18)
              event.usdPrice = `$${parseFloat(event.price).toFixed(2)}`
            } else if (eventType.name === 'SaleCancelled') {
              event.type = 'Listing'
              event.subType = 'Cancelled'
              event.price = '0'
              event.usdPrice = '$0'
            } else if (eventType.name === 'BidPlaced') {
              event.type = 'Bid & Offer'
              event.subType = 'Bid'
              event.price = ethers.formatUnits(args.amount, 18)
              event.usdPrice = `$${parseFloat(event.price).toFixed(2)}`
            } else if (eventType.name === 'AuctionEnded') {
              event.type = 'Listing'
              event.subType = 'Expired'
              event.price = ethers.formatUnits(args.finalBid, 18)
              event.usdPrice = `$${parseFloat(event.price).toFixed(2)}`
            } else if (eventType.name === 'OfferMade') {
              event.type = 'Bid & Offer'
              event.subType = 'Buy Offer'
              event.price = ethers.formatUnits(args.amount, 18)
              event.usdPrice = `$${parseFloat(event.price).toFixed(2)}`
            } else if (eventType.name === 'OfferAccepted') {
              event.type = 'Bid & Offer'
              event.subType = 'Offer Accepted'
              event.price = ethers.formatUnits(args.amount, 18)
              event.usdPrice = `$${parseFloat(event.price).toFixed(2)}`
            } else if (eventType.name === 'OfferCancelled') {
              event.type = 'Bid & Offer'
              event.subType = 'Cancelled'
              event.price = '0'
              event.usdPrice = '$0'
            }
            
            console.log(`Created event:`, event)
            events.push(event)
          }
        } catch (err) {
          console.log(`Error fetching ${eventType.name} events:`, err)
        }
      }
      
      console.log(`Total events found: ${events.length}`)
      
      // If no events found, try with a smaller block range
      if (events.length === 0) {
        console.log('No events found, trying with smaller block range...')
        const smallerFromBlock = Math.max(0, latestBlock - 1000) // Try last 1000 blocks
        
        for (const eventType of eventTypes) {
          try {
            console.log(`Fetching ${eventType.name} events from smaller range...`)
            const logs = await contract.queryFilter(eventType.filter(), smallerFromBlock, latestBlock)
            console.log(`Found ${logs.length} ${eventType.name} events in smaller range`)
            
            for (const log of logs) {
              const parsedLog = contract.interface.parseLog(log)
              if (!parsedLog) continue
              const args = parsedLog.args
              
              let event: MarketplaceEvent = {
                id: `${log.transactionHash}-${log.index}`,
                type: eventType.name.toLowerCase().replace('sale', '').replace('offer', ''),
                subType: eventType.name,
                liquidId: args.liquidId?.toString() || '0',
                from: args.seller || args.bidder || args.buyer || '0x0000000000000000000000000000000000000000',
                to: args.buyer || args.winner || '0x0000000000000000000000000000000000000000',
                price: '0',
                usdPrice: '$0',
                currency: 'PUSD',
                time: new Date().toLocaleString(),
                blockNumber: log.blockNumber,
                transactionHash: log.transactionHash
              }
              
              // Map event types to display text
              if (eventType.name === 'SaleCreated') {
                const sellType = Number(args.sellType)
                event.type = 'Listing'
                event.subType = sellType === 1 ? 'As Auction' : 'As Fixed Price'
                const price = sellType === 0 ? args.price : args.price
                event.price = ethers.formatUnits(price, 18)
                event.usdPrice = `$${parseFloat(event.price).toFixed(2)}`
              } else if (eventType.name === 'SaleCompleted') {
                event.type = 'Listing'
                event.subType = 'Completed'
                event.price = ethers.formatUnits(args.price, 18)
                event.usdPrice = `$${parseFloat(event.price).toFixed(2)}`
              } else if (eventType.name === 'SaleCancelled') {
                event.type = 'Listing'
                event.subType = 'Cancelled'
                event.price = '0'
                event.usdPrice = '$0'
              } else if (eventType.name === 'BidPlaced') {
                event.type = 'Bid & Offer'
                event.subType = 'Bid'
                event.price = ethers.formatUnits(args.amount, 18)
                event.usdPrice = `$${parseFloat(event.price).toFixed(2)}`
              } else if (eventType.name === 'AuctionEnded') {
                event.type = 'Listing'
                event.subType = 'Expired'
                event.price = ethers.formatUnits(args.finalBid, 18)
                event.usdPrice = `$${parseFloat(event.price).toFixed(2)}`
              } else if (eventType.name === 'OfferMade') {
                event.type = 'Bid & Offer'
                event.subType = 'Buy Offer'
                event.price = ethers.formatUnits(args.amount, 18)
                event.usdPrice = `$${parseFloat(event.price).toFixed(2)}`
              } else if (eventType.name === 'OfferAccepted') {
                event.type = 'Bid & Offer'
                event.subType = 'Offer Accepted'
                event.price = ethers.formatUnits(args.amount, 18)
                event.usdPrice = `$${parseFloat(event.price).toFixed(2)}`
              } else if (eventType.name === 'OfferCancelled') {
                event.type = 'Bid & Offer'
                event.subType = 'Cancelled'
                event.price = '0'
                event.usdPrice = '$0'
              }
              
              events.push(event)
            }
          } catch (err) {
            console.log(`Error fetching ${eventType.name} events in smaller range:`, err)
          }
        }
      }
      
      // If still no events, try to get any events from the contract
      if (events.length === 0) {
        console.log('Still no events found, trying to get any events from contract...')
        try {
          // Try to get all events without filtering
          const allLogs = await provider.getLogs({
            address: MARKETPLACE_ADDRESS,
            fromBlock: Math.max(0, latestBlock - 100),
            toBlock: latestBlock
          })
          console.log(`Found ${allLogs.length} total logs from contract`)
          
          if (allLogs.length > 0) {
            console.log('Sample log:', allLogs[0])
          }
        } catch (err) {
          console.log('Error getting all logs:', err)
        }
      }
      
      // Sort events by block number (newest first)
      events.sort((a, b) => b.blockNumber - a.blockNumber)
      
      // Get block timestamps for events
      const uniqueBlocks = [...new Set(events.map(e => e.blockNumber))]
      const blockTimestamps: { [blockNumber: number]: number } = {}
      
      for (const blockNumber of uniqueBlocks) {
        try {
          const block = await provider.getBlock(blockNumber)
          if (block) {
            blockTimestamps[blockNumber] = block.timestamp
          }
        } catch (err) {
          console.log(`Error fetching block ${blockNumber}:`, err)
        }
      }
      
      // Update event timestamps
      events.forEach(event => {
        const timestamp = blockTimestamps[event.blockNumber]
        if (timestamp) {
          const date = new Date(timestamp * 1000)
          const now = new Date()
          const diffMs = now.getTime() - date.getTime()
          const diffMins = Math.floor(diffMs / 60000)
          const diffHours = Math.floor(diffMs / 3600000)
          const diffDays = Math.floor(diffMs / 86400000)
          
          if (diffMins < 1) {
            event.time = 'Just now'
          } else if (diffMins < 60) {
            event.time = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
          } else if (diffHours < 24) {
            event.time = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
          } else {
            event.time = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
          }
        }
      })
      
      console.log(`Final events count: ${events.length}`)
      setActivities(events)
      
      // Fetch metadata for items
      if (events.length > 0) {
        await fetchItemMetadata(events, liquidIdContract)
      } else {
        console.log('No events found, showing sample data')
        // Show some sample data if no events are found
        const sampleEvents: MarketplaceEvent[] = [
          {
            id: "sample-1",
            type: "created",
            subType: "SaleCreated",
            liquidId: "1",
            from: "0x1234567890123456789012345678901234567890",
            to: "0x0000000000000000000000000000000000000000",
            price: "1.5",
            usdPrice: "$1.50",
            currency: "PUSD",
            time: "2 minutes ago",
            blockNumber: latestBlock - 10,
            transactionHash: "0x1234567890123456789012345678901234567890123456789012345678901234"
          },
          {
            id: "sample-2",
            type: "bid",
            subType: "BidPlaced",
            liquidId: "2",
            from: "0x2345678901234567890123456789012345678901",
            to: "0x0000000000000000000000000000000000000000",
            price: "2.0",
            usdPrice: "$2.00",
            currency: "PUSD",
            time: "5 minutes ago",
            blockNumber: latestBlock - 20,
            transactionHash: "0x2345678901234567890123456789012345678901234567890123456789012345"
          }
        ]
        setActivities(sampleEvents)
        setError("No marketplace events found. Showing sample data. Try refreshing or check if there are any recent marketplace activities.")
      }
      
    } catch (err: any) {
      console.error('Error fetching marketplace events:', err)
      setError(err.message || 'Failed to fetch marketplace events')
      
      // Show sample data on error
      const sampleEvents: MarketplaceEvent[] = [
        {
          id: "error-sample-1",
          type: "created",
          subType: "SaleCreated",
          liquidId: "1",
          from: "0x1234567890123456789012345678901234567890",
          to: "0x0000000000000000000000000000000000000000",
          price: "1.5",
          usdPrice: "$1.50",
          currency: "PUSD",
          time: "2 minutes ago",
          blockNumber: 1000,
          transactionHash: "0x1234567890123456789012345678901234567890123456789012345678901234"
        }
      ]
      setActivities(sampleEvents)
    } finally {
      setLoading(false)
    }
  }
  
  // Fetch metadata for items
  const fetchItemMetadata = async (events: MarketplaceEvent[], liquidIdContract: ethers.Contract) => {
    const metadata: { [liquidId: string]: any } = { ...itemMetadata }
    const collectionNamesMap: { [collectionId: string]: string } = { ...collectionNames }
    
    for (const event of events) {
      const liquidId = event.liquidId
      if (metadata[liquidId]) continue
      
      try {
        const asset = await liquidIdContract.getAsset(liquidId)
        if (asset && asset.isActive && asset.metadataURI) {
          const meta = await fetchMetadata(asset.metadataURI)
          if (meta) {
            metadata[liquidId] = meta
            
            // Fetch collection name if we haven't already
            if (meta.collection && !collectionNamesMap[meta.collection]) {
              try {
                const colRes = await fetch(`/api/collections?id=${meta.collection}`)
                if (colRes.ok) {
                  const colData = await colRes.json()
                  if (colData && colData.collection && colData.collection.name) {
                    collectionNamesMap[meta.collection] = colData.collection.name
                  }
                }
              } catch {
                collectionNamesMap[meta.collection] = "Unknown Collection"
              }
            }
          }
        }
      } catch (err) {
        console.log(`Error fetching metadata for ${liquidId}:`, err)
      }
    }
    
    setItemMetadata(metadata)
    setCollectionNames(collectionNamesMap)
  }

  // Fetch events on mount
  useEffect(() => {
    fetchMarketplaceEvents()
  }, [])

  const filteredActivities = activities.filter((activity) => {
    let matchesType = true
    if (activityFilter === "fixed-price") matchesType = activity.type === "Listing" && (activity.subType === "As Fixed Price" || activity.subType === "Completed")
    else if (activityFilter === "auction") matchesType = activity.type === "Listing" && (activity.subType === "As Auction" || activity.subType === "Expired") || activity.type === "Bid & Offer" && activity.subType === "Bid"
    else if (activityFilter === "with-buy-offer") matchesType = activity.type === "Bid & Offer" && (activity.subType === "Buy Offer" || activity.subType === "Offer Accepted" || activity.subType === "Cancelled")
    let matchesId = true
    if (liquidId) {
      matchesId = activity.liquidId === liquidId
    }
    return (activityFilter === "all" || matchesType) && matchesId
  })

  // Pagination state
  const [page, setPage] = useState(1)
  const pageSize = 10
  const paginatedActivities = filteredActivities.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="space-y-4">
      {/* Filter Button */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          size="sm" 
          className="border-gray-700" 
          onClick={fetchMarketplaceEvents}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </Button>

      </div>

      {error && (
        <div className="text-red-500 text-center py-4">{error}</div>
      )}

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm text-gray-400 border-b border-gray-800">
        <div className="col-span-2">Type</div>
        <div className="col-span-3">Items</div>
        <div className="col-span-2">Price</div>
        <div className="col-span-1">From</div>
        <div className="col-span-1">To</div>
        <div className="col-span-2">Date</div>
        <div className="col-span-1"></div>
      </div>

      {/* Activities List */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading marketplace events...</div>
        ) : paginatedActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No marketplace events found.</div>
        ) : (
          paginatedActivities.map((activity) => {
            const metadata = itemMetadata[activity.liquidId]
            const itemName = metadata?.name || `LID #${activity.liquidId}`
            const collectionName = metadata?.collection ? 
              (collectionNames[metadata.collection] || metadata.collection) : 
              "Unknown Collection"
                         const itemImage = metadata?.image ? (resolveIpfs(metadata.image) || "/placeholder.svg?height=60&width=60") : "/placeholder.svg?height=60&width=60"
            
            return (
          <Card key={activity.id} className="bg-transparent border-none hover:bg-gray-700 transition-colors">
            <CardContent className="p-4">
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Type */}
                <div className="col-span-2">
                  <span className="text-white text-lg capitalize">{activity.type}</span>
                  <div className="text-xs text-gray-500">{activity.subType}</div>
                </div>
                {/* Item */}
                <div className="col-span-3 flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
                        <img src={itemImage} alt={itemName} className="w-full h-full object-cover" />
                      </div>
                  <div>
                    <h4 className="font-semibold text-sm flex items-center text-gray-500">
                          {itemName}
                        <span className="ml-1 text-green-400">✔️</span>
                    </h4>
                        <p className="text-xs text-white">{collectionName}</p>
                  </div>
                </div>
                {/* Price */}
                <div className="col-span-2">
                  <span className="font-semibold text-white">{activity.price} {activity.currency}</span>
                      <div className="text-xs text-gray-400">{activity.usdPrice}</div>
                </div>
                {/* From */}
                    <div className="col-span-1 text-sm text-gray-300">
                      {activity.from.slice(0, 6)}...{activity.from.slice(-4)}
                    </div>
                {/* To */}
                    <div className="col-span-1 text-sm text-gray-300">
                      {activity.to !== '0x0000000000000000000000000000000000000000' ? 
                        `${activity.to.slice(0, 6)}...${activity.to.slice(-4)}` : 
                        "-"
                      }
                    </div>
                {/* Date */}
                <div className="col-span-2 text-sm text-gray-400">{activity.time}</div>
                {/* External Link */}
                <div className="col-span-1 flex justify-end">
                      <a 
                        href={`https://testnet-explorer.plume.org/tx/${activity.transactionHash}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
            )
          })
        )}
      </div>
      
      {/* Pagination */}
      {filteredActivities.length > pageSize && (
      <div className="flex justify-center items-center space-x-2 mt-4">
        <Button onClick={() => setPage(page - 1)} disabled={page === 1}>{"<"}</Button>
          
          {/* Calculate total pages */}
          {(() => {
            const totalPages = Math.ceil(filteredActivities.length / pageSize)
            const maxVisiblePages = 5 // Show max 5 page numbers at a time
            let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2))
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
            
            // Adjust start page if we're near the end
            if (endPage - startPage + 1 < maxVisiblePages) {
              startPage = Math.max(1, endPage - maxVisiblePages + 1)
            }
            
            const pages = []
            
            // Add first page and ellipsis if needed
            if (startPage > 1) {
              pages.push(
                <Button
                  key={1}
                  variant={page === 1 ? "default" : "outline"}
                  onClick={() => setPage(1)}
                >
                  1
                </Button>
              )
              if (startPage > 2) {
                pages.push(<span key="ellipsis1" className="px-2">...</span>)
              }
            }
            
            // Add visible page numbers
            for (let i = startPage; i <= endPage; i++) {
              pages.push(
          <Button
            key={i}
                  variant={page === i ? "default" : "outline"}
                  onClick={() => setPage(i)}
                >
                  {i}
                </Button>
              )
            }
            
            // Add last page and ellipsis if needed
            if (endPage < totalPages) {
              if (endPage < totalPages - 1) {
                pages.push(<span key="ellipsis2" className="px-2">...</span>)
              }
              pages.push(
                <Button
                  key={totalPages}
                  variant={page === totalPages ? "default" : "outline"}
                  onClick={() => setPage(totalPages)}
                >
                  {totalPages}
          </Button>
              )
            }
            
            return pages
          })()}
          
          <Button onClick={() => setPage(page + 1)} disabled={page >= Math.ceil(filteredActivities.length / pageSize)}>{">"}</Button>
      </div>
      )}
      
      {/* Show total count */}
      {filteredActivities.length > 0 && (
        <div className="text-center text-gray-400 text-sm mt-2">
          Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, filteredActivities.length)} of {filteredActivities.length} events
        </div>
      )}


    </div>
  )
}
