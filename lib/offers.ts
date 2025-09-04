import { ethers } from "ethers"
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from "./marketplace"
import { CONFIG } from "./config"
import { fetchMultipleUserAvatars } from "./user-avatars"

export interface Offer {
  id: string
  liquidId: string
  buyer: string
  amount: string
  timestamp: number
  status: 'pending' | 'accepted' | 'cancelled' | 'expired'
  formattedAmount: string
  usdAmount: string
  timeAgo: string
  buyerShort: string
  buyerInitial: string
  buyerAvatar?: string
  offerIndex: number
  expiresAt: number
}

export const fetchOffersForItem = async (liquidId: string): Promise<Offer[]> => {
  try {
    let provider: ethers.BrowserProvider | ethers.JsonRpcProvider

    if (typeof window !== "undefined" && (window as any).ethereum) {
      provider = new ethers.BrowserProvider((window as any).ethereum)
    } else {
      provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL)
    }

    const contract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider)

    // Get current block number
    const currentBlock = await provider.getBlockNumber()
    // Look back more blocks to ensure we don't miss events
    const fromBlock = Math.max(0, currentBlock - 50000) // Look back 50,000 blocks

    // Fetch OfferMade events for this specific liquidId
    const liquidIdBigInt = BigInt(liquidId)
    
    const offerMadeEvents = await contract.queryFilter(
      contract.filters.OfferMade(liquidIdBigInt),
      fromBlock,
      currentBlock
    )

    // Fetch OfferCancelled events
    const offerCancelledEvents = await contract.queryFilter(
      contract.filters.OfferCancelled(liquidIdBigInt),
      fromBlock,
      currentBlock
    )

    // Process OfferMade events
    const offers: Offer[] = []
    const now = Math.floor(Date.now() / 1000)
    
    // Collect all buyer addresses to fetch avatars in batch
    const buyerAddresses: string[] = []

    for (const event of offerMadeEvents) {
      const parsedLog = contract.interface.parseLog(event)
      if (!parsedLog) {
        continue
      }

      const { liquidId: eventLiquidId, buyer, amount, offerIndex, expiresAt } = parsedLog.args
      const liquidIdStr = eventLiquidId.toString()
      
      if (liquidIdStr !== liquidId) {
        continue
      }

      // Add buyer address to the list for avatar fetching
      buyerAddresses.push(buyer)

      const offerAmount = ethers.formatUnits(amount, 18)
      const timestamp = event.blockNumber ? await getBlockTimestamp(provider, event.blockNumber) : now

      // Use the offerIndex from the event for unique identification
      // This is much more reliable than creating our own ID
      const offerId = `${liquidId}-${buyer}-${offerIndex}`

      // Check if this specific offer was cancelled using offerIndex
      const isCancelled = offerCancelledEvents.some(cancelledEvent => {
        const cancelledLog = contract.interface.parseLog(cancelledEvent)
        if (!cancelledLog) return false
        
        const cancelledLiquidId = cancelledLog.args.liquidId.toString()
        const cancelledBuyer = cancelledLog.args.buyer
        const cancelledOfferIndex = cancelledLog.args.offerIndex
        
        // Check if this cancellation event is for the same liquidId, buyer, AND offerIndex
        // This ensures we only cancel the specific offer, not all offers from the same buyer
        if (cancelledLiquidId !== liquidId || cancelledBuyer !== buyer || cancelledOfferIndex !== offerIndex) {
          return false
        }
        
        // Check if the cancellation event happened AFTER this offer was made
        // The offer is cancelled only if the cancellation block number is greater than the offer block number
        // This ensures we don't mark an offer as cancelled if the cancellation happened before the offer
        return cancelledEvent.blockNumber > event.blockNumber
      })

      // Determine status based on simple logic
      let status: 'pending' | 'cancelled' | 'expired' = 'pending'
      
      if (isCancelled) {
        status = 'cancelled'
      } else {
        // Check if offer has expired using expiresAt from the OfferMade event
        // The OfferMade event now includes the expiration timestamp
        const eventExpiresAt = Number(expiresAt || 0)
        
        if (eventExpiresAt > 0) {
          const isExpired = now > eventExpiresAt
          
          if (isExpired) {
            status = 'expired'
          }
        } else {
          // Fallback: if expiresAt is not available, use block timestamp
          const fallbackExpirationWindow = 86400 // 24 hours in seconds
          const isExpired = (now - timestamp) > fallbackExpirationWindow
          
          if (isExpired) {
            status = 'expired'
          }
        }
      }

      const buyerShort = buyer.slice(0, 6) + '...' + buyer.slice(-4)
      const buyerInitial = buyer.slice(2, 3).toUpperCase()

      const timeAgo = formatTimeAgo(timestamp)

      offers.push({
        id: offerId,
        liquidId: liquidIdStr,
        buyer,
        amount: offerAmount,
        timestamp,
        status,
        formattedAmount: `${parseFloat(offerAmount).toFixed(4)} HUNOS`,
        usdAmount: `$${(parseFloat(offerAmount) * 250).toFixed(2)}`,
        timeAgo,
        buyerShort,
        buyerInitial,
        buyerAvatar: undefined, // Will be populated with avatar URL
        offerIndex: Number(offerIndex),
        expiresAt: Number(expiresAt || 0),
      })
      

    }

    // Fetch avatars for all buyers
    if (buyerAddresses.length > 0) {
      try {

        const avatarMap = await fetchMultipleUserAvatars(buyerAddresses)
        
        // Update offers with avatar URLs
        offers.forEach(offer => {
          const avatarData = avatarMap.get(offer.buyer.toLowerCase())
          if (avatarData && avatarData.avatar) {
            offer.buyerAvatar = avatarData.avatar
          }
        })
        

      } catch (error) {
        console.error("Error fetching avatars:", error)
      }
    }

    // Filter to show all offer statuses (pending, expired, cancelled)
    const visibleOffers = offers.filter(offer => 
      offer.status === 'pending' || offer.status === 'expired' || offer.status === 'cancelled'
    )
    
    // Sort by timestamp (newest first)
    const sortedOffers = visibleOffers.sort((a, b) => b.timestamp - a.timestamp)
    return sortedOffers

  } catch (error) {
    console.error("Error fetching offers:", error)
    return []
  }
}

const getBlockTimestamp = async (provider: ethers.Provider, blockNumber: number): Promise<number> => {
  try {
    const block = await provider.getBlock(blockNumber)
    return block?.timestamp || Math.floor(Date.now() / 1000)
  } catch (error) {
    console.error("Error getting block timestamp:", error)
    return Math.floor(Date.now() / 1000)
  }
}

const formatTimeAgo = (timestamp: number): string => {
  const now = Math.floor(Date.now() / 1000)
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60)
  const hours = Math.floor(diff / 3600)
  const days = Math.floor(diff / 86400)
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return 'Just now'
} 