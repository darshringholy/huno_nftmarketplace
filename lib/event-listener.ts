import { ethers } from "ethers"
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from "./marketplace"
import { notificationService } from "./notification-service"
import { CONFIG } from "./config"

interface EventListenerConfig {
  rpcUrl: string
  fromBlock?: number
  pollInterval?: number // in milliseconds
}

interface ProcessedEvent {
  transactionHash: string
  logIndex: number
  eventType: string
  timestamp: number
}

export class MarketplaceEventListener {
  public provider!: ethers.JsonRpcProvider
  public contract!: ethers.Contract
  public isListening: boolean = false
  public pollInterval!: number
  public lastProcessedBlock!: number
  private processedEvents: Set<string> = new Set() // Track processed events to prevent duplicates
  private static instance: MarketplaceEventListener | null = null

  constructor(config: EventListenerConfig) {
    // Singleton pattern to prevent multiple instances
    if (MarketplaceEventListener.instance) {
      return MarketplaceEventListener.instance
    }
    
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl)
    this.contract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, this.provider)
    this.pollInterval = config.pollInterval || 150000 // 150 seconds default
    this.lastProcessedBlock = config.fromBlock || 0
    
    MarketplaceEventListener.instance = this
  }

  async startListening() {
    if (this.isListening) return
    
    console.log("Starting marketplace event listener...")
    this.isListening = true
    
    // Get current block if starting fresh
    if (this.lastProcessedBlock === 0) {
      this.lastProcessedBlock = await this.provider.getBlockNumber()
    }

    this.pollEvents()
  }

  stopListening() {
    this.isListening = false
    console.log("Stopped marketplace event listener")
  }

  clearProcessedEvents() {
    this.processedEvents.clear()
    console.log("Cleared processed events cache")
  }

  getProcessedEventsCount() {
    return this.processedEvents.size
  }

  resetLastProcessedBlock() {
    this.lastProcessedBlock = 0
    console.log("Reset last processed block to 0")
  }

  private async pollEvents() {
    let consecutiveErrors = 0
    const maxConsecutiveErrors = 5
    
    while (this.isListening) {
      try {
        await this.processNewEvents()
        consecutiveErrors = 0 // Reset error count on success
        await this.sleep(this.pollInterval)
      } catch (error) {
        consecutiveErrors++
        console.error(`Error polling events (attempt ${consecutiveErrors}):`, error)
        
        if (consecutiveErrors >= maxConsecutiveErrors) {
          console.error("Too many consecutive errors, stopping event listener")
          this.isListening = false
          break
        }
        
        await this.sleep(5000) // Wait 5 seconds on error
      }
    }
  }

  private async processNewEvents() {
    const currentBlock = await this.provider.getBlockNumber()
    
    if (currentBlock <= this.lastProcessedBlock) {
      return
    }

    const fromBlock = this.lastProcessedBlock + 1
    const toBlock = currentBlock

    console.log(`Processing events from block ${fromBlock} to ${toBlock} (${toBlock - fromBlock + 1} blocks)`)
    console.log(process.env.NODE_ENV);
    // Process all relevant events
    await Promise.all([
      this.processSaleEvents(fromBlock, toBlock),
      this.processBidEvents(fromBlock, toBlock),
      this.processOfferEvents(fromBlock, toBlock),
      this.processAuctionEvents(fromBlock, toBlock),
    ])

    // Update last processed block only after successful processing
    this.lastProcessedBlock = currentBlock
    console.log(`Successfully processed events up to block ${currentBlock}`)
  }

  private createEventKey(event: any, eventType: string): string {
    const txHash = (event as any).transactionHash || (event as any).hash || 'unknown'
    const logIndex = (event as any).logIndex || (event as any).index || 0
    return `${txHash}-${logIndex}-${eventType}`
  }

  private isEventProcessed(event: any, eventType: string): boolean {
    const eventKey = this.createEventKey(event, eventType)
    return this.processedEvents.has(eventKey)
  }

  private markEventProcessed(event: any, eventType: string): void {
    const eventKey = this.createEventKey(event, eventType)
    this.processedEvents.add(eventKey)
    
    // Keep only the last 1000 processed events to prevent memory leaks
    if (this.processedEvents.size > 1000) {
      const eventsArray = Array.from(this.processedEvents)
      this.processedEvents = new Set(eventsArray.slice(-500))
    }
  }

  private async processSaleEvents(fromBlock: number, toBlock: number) {
    try {
      // SaleCreated events
      const saleCreatedEvents = await this.contract.queryFilter(
        this.contract.filters.SaleCreated(),
        fromBlock,
        toBlock
      )

      for (const event of saleCreatedEvents) {
        // Check if event was already processed
        if (this.isEventProcessed(event, "SaleCreated")) {
          const txHash = (event as any).transactionHash || (event as any).hash || 'unknown'
          const logIndex = (event as any).logIndex || (event as any).index || 0
          console.log(`Skipping duplicate SaleCreated event: ${txHash}-${logIndex}`)
          continue
        }

        const parsedLog = this.contract.interface.parseLog(event)
        if (!parsedLog) continue

        const { liquidId, seller, sellType, price } = parsedLog.args
        const liquidIdStr = liquidId.toString()
        const priceFormatted = ethers.formatUnits(price, 18)
        const listingType = sellType.toString() === "0" ? "fixed" : "auction"

        await notificationService.notifyListingActivity(
          seller,
          liquidIdStr,
          listingType,
          priceFormatted
        )

        // Mark event as processed
        this.markEventProcessed(event, "SaleCreated")
        const txHash = (event as any).transactionHash || (event as any).hash || 'unknown'
        const logIndex = (event as any).logIndex || (event as any).index || 0
        console.log(`Processed SaleCreated event: ${txHash}-${logIndex}`)
      }

      // SaleCompleted events
      const saleCompletedEvents = await this.contract.queryFilter(
        this.contract.filters.SaleCompleted(),
        fromBlock,
        toBlock
      )

      for (const event of saleCompletedEvents) {
        // Check if event was already processed
        if (this.isEventProcessed(event, "SaleCompleted")) {
          const txHash = (event as any).transactionHash || (event as any).hash || 'unknown'
          const logIndex = (event as any).logIndex || (event as any).index || 0
          console.log(`Skipping duplicate SaleCompleted event: ${txHash}-${logIndex}`)
          continue
        }

        const parsedLog = this.contract.interface.parseLog(event)
        if (!parsedLog) continue

        const { liquidId, seller, buyer, price } = parsedLog.args
        const liquidIdStr = liquidId.toString()
        const priceFormatted = ethers.formatUnits(price, 18)

        await notificationService.notifyItemSold(
          seller,
          liquidIdStr,
          priceFormatted,
          buyer
        )

        // Mark event as processed
        this.markEventProcessed(event, "SaleCompleted")
        const txHash = (event as any).transactionHash || (event as any).hash || 'unknown'
        const logIndex = (event as any).logIndex || (event as any).index || 0
        console.log(`Processed SaleCompleted event: ${txHash}-${logIndex}`)
      }

      // SaleCancelled events
      const saleCancelledEvents = await this.contract.queryFilter(
        this.contract.filters.SaleCancelled(),
        fromBlock,
        toBlock
      )

      for (const event of saleCancelledEvents) {
        // Check if event was already processed
        if (this.isEventProcessed(event, "SaleCancelled")) {
          const txHash = (event as any).transactionHash || (event as any).hash || 'unknown'
          const logIndex = (event as any).logIndex || (event as any).index || 0
          console.log(`Skipping duplicate SaleCancelled event: ${txHash}-${logIndex}`)
          continue
        }

        const parsedLog = this.contract.interface.parseLog(event)
        if (!parsedLog) continue

        const { liquidId, seller } = parsedLog.args
        const liquidIdStr = liquidId.toString()

        // Notify seller about cancellation
        await notificationService.createNotification({
          userId: seller,
          type: "listing_activity",
          title: "Sale Cancelled",
          message: `Your sale for LID #${liquidIdStr} has been cancelled`,
          data: {
            liquidId: liquidIdStr,
            link: `/marketplace/items/${liquidIdStr}`,
          },
        })

        // Mark event as processed
        this.markEventProcessed(event, "SaleCancelled")
        const txHash = (event as any).transactionHash || (event as any).hash || 'unknown'
        const logIndex = (event as any).logIndex || (event as any).index || 0
        console.log(`Processed SaleCancelled event: ${txHash}-${logIndex}`)
      }
    } catch (error) {
      console.error("Error processing sale events:", error)
    }
  }

  private async processBidEvents(fromBlock: number, toBlock: number) {
    try {
      // BidPlaced events
      const bidPlacedEvents = await this.contract.queryFilter(
        this.contract.filters.BidPlaced(),
        fromBlock,
        toBlock
      )

      for (const event of bidPlacedEvents) {
        const parsedLog = this.contract.interface.parseLog(event)
        if (!parsedLog) continue

        const { liquidId, bidder, amount } = parsedLog.args
        const liquidIdStr = liquidId.toString()
        const bidAmount = ethers.formatUnits(amount, 18)

        // Get the seller from the sale data
        try {
          const sale = await this.contract.getSale(liquidIdStr)
          if (sale && sale.seller) {
            await notificationService.notifyBidReceived(
              sale.seller,
              liquidIdStr,
              bidAmount,
              bidder
            )
          }
        } catch (error) {
          console.log(`Could not get sale data for ${liquidIdStr}:`, error)
        }

        // Check if this bid outbids the previous highest bidder
        try {
          const sale = await this.contract.getSale(liquidIdStr)
          if (sale && sale.currentBidder && sale.currentBidder !== bidder) {
            const previousBidAmount = ethers.formatUnits(sale.currentBid, 18)
            await notificationService.notifyOutbid(
              sale.currentBidder,
              liquidIdStr,
              bidAmount
            )
          }
        } catch (error) {
          console.log(`Could not check outbid for ${liquidIdStr}:`, error)
        }
      }
    } catch (error) {
      console.error("Error processing bid events:", error)
    }
  }

  private async processOfferEvents(fromBlock: number, toBlock: number) {
    try {
      // OfferMade events
      const offerMadeEvents = await this.contract.queryFilter(
        this.contract.filters.OfferMade(),
        fromBlock,
        toBlock
      )

      for (const event of offerMadeEvents) {
        const parsedLog = this.contract.interface.parseLog(event)
        if (!parsedLog) continue

        const { liquidId, buyer, amount } = parsedLog.args
        const liquidIdStr = liquidId.toString()
        const offerAmount = ethers.formatUnits(amount, 18)

        // Get the seller from the asset data
        try {
          const { LIQUIDID_ABI, LIQUIDID_ADDRESS } = require("./liquidid")
          const liquidIdContract = new ethers.Contract(LIQUIDID_ADDRESS, LIQUIDID_ABI, this.provider)
          const asset = await liquidIdContract.getAsset(liquidIdStr)
          
          if (asset && asset.owner) {
            await notificationService.notifyBuyOfferReceived(
              asset.owner,
              liquidIdStr,
              offerAmount,
              buyer
            )
          }
        } catch (error) {
          console.log(`Could not get asset data for ${liquidIdStr}:`, error)
        }
      }

      // OfferAccepted events
      const offerAcceptedEvents = await this.contract.queryFilter(
        this.contract.filters.OfferAccepted(),
        fromBlock,
        toBlock
      )

      for (const event of offerAcceptedEvents) {
        const parsedLog = this.contract.interface.parseLog(event)
        if (!parsedLog) continue

        const { liquidId, seller, buyer, amount } = parsedLog.args
        const liquidIdStr = liquidId.toString()
        const offerAmount = ethers.formatUnits(amount, 18)

        await notificationService.notifyBuyOfferActivity(
          buyer,
          liquidIdStr,
          "accepted",
          offerAmount
        )
      }
    } catch (error) {
      console.error("Error processing offer events:", error)
    }
  }

  private async processAuctionEvents(fromBlock: number, toBlock: number) {
    try {
      // AuctionEnded events
      const auctionEndedEvents = await this.contract.queryFilter(
        this.contract.filters.AuctionEnded(),
        fromBlock,
        toBlock
      )

      for (const event of auctionEndedEvents) {
        const parsedLog = this.contract.interface.parseLog(event)
        if (!parsedLog) continue

        const { liquidId, winner, finalBid, reserveMet } = parsedLog.args
        const liquidIdStr = liquidId.toString()

        // Get the seller from the sale data
        try {
          const sale = await this.contract.getSale(liquidIdStr)
          if (sale && sale.seller) {
            if (reserveMet) {
              // Auction ended with successful sale
              const finalBidAmount = ethers.formatUnits(finalBid, 18)
              await notificationService.notifyItemSold(
                sale.seller,
                liquidIdStr,
                finalBidAmount,
                winner
              )
            } else {
              // Auction ended without meeting reserve
              await notificationService.notifyAuctionExpiration(
                sale.seller,
                liquidIdStr
              )
            }
          }
        } catch (error) {
          console.log(`Could not get sale data for ${liquidIdStr}:`, error)
        }
      }
    } catch (error) {
      console.error("Error processing auction events:", error)
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Create and export singleton instance
export const marketplaceEventListener = new MarketplaceEventListener({
  rpcUrl: CONFIG.RPC_URL,
  pollInterval: 15000, // 15 seconds
}) 