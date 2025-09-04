// Notification service for creating notifications based on blockchain events

import { connectToDatabase } from "./mongodb"

interface NotificationData {
  userId: string
  type: string
  title: string
  message: string
  data?: any
}

export class NotificationService {
  private static instance: NotificationService

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  // Create a notification (server-side version)
  async createNotification(notificationData: NotificationData): Promise<boolean> {
    try {
      const { db } = await connectToDatabase()
      
      // Check user settings to see if this notification type is enabled
      const userSettings = await db.collection("settings").findOne({ userId: notificationData.userId })
      
      if (userSettings && userSettings.eventTypes) {
        const eventTypeMap: { [key: string]: string } = {
          "liked_item_activity": "likedItemActivity",
          "listing_activity": "listingActivity",
          "item_sold": "itemSold",
          "bid_activity": "bidActivity",
          "outbid": "outbid",
          "auction_expiration": "auctionExpiration",
          "buy_offer_received": "buyOfferReceived",
          "my_buy_offer_activity": "myBuyOfferActivity",
          "item_transfer": "itemTransfer",
        }
        
        const settingKey = eventTypeMap[notificationData.type]
        if (settingKey && userSettings.eventTypes[settingKey] === false) {
          // User has disabled this notification type
          console.log(`Notification skipped for ${notificationData.userId} - type ${notificationData.type} disabled`)
          return true
        }
      }
      
      // Create notification
      const notification = {
        id: Math.random().toString(36).substr(2, 9),
        userId: notificationData.userId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        data: notificationData.data,
        read: false,
        createdAt: new Date(),
      }
      
      await db.collection("notifications").insertOne(notification)
      console.log(`Notification created for ${notificationData.userId}: ${notificationData.title}`)
      return true
    } catch (error) {
      console.error("Error creating notification:", error)
      return false
    }
  }

  // Create notification for item sold
  async notifyItemSold(sellerAddress: string, liquidId: string, price: string, buyerAddress: string): Promise<boolean> {
    return this.createNotification({
      userId: sellerAddress,
      type: "item_sold",
      title: "Item Sold!",
      message: `Your item LID #${liquidId} has been sold for ${price} HUNOS`,
      data: {
        liquidId,
        price,
        buyerAddress,
        link: `/marketplace/items/${liquidId}`,
      },
    })
  }

  // Create notification for bid received
  async notifyBidReceived(sellerAddress: string, liquidId: string, bidAmount: string, bidderAddress: string): Promise<boolean> {
    return this.createNotification({
      userId: sellerAddress,
      type: "bid_activity",
      title: "New Bid Received",
      message: `You received a bid of ${bidAmount} HUNOS for LID #${liquidId}`,
      data: {
        liquidId,
        bidAmount,
        bidderAddress,
        link: `/marketplace/bid/${liquidId}`,
      },
    })
  }

  // Create notification for outbid
  async notifyOutbid(bidderAddress: string, liquidId: string, newBidAmount: string): Promise<boolean> {
    return this.createNotification({
      userId: bidderAddress,
      type: "outbid",
      title: "You've Been Outbid",
      message: `Someone placed a higher bid of ${newBidAmount} HUNOS for LID #${liquidId}`,
      data: {
        liquidId,
        newBidAmount,
        link: `/marketplace/bid/${liquidId}`,
      },
    })
  }

  // Create notification for auction expiration
  async notifyAuctionExpiration(sellerAddress: string, liquidId: string): Promise<boolean> {
    return this.createNotification({
      userId: sellerAddress,
      type: "auction_expiration",
      title: "Auction Expired",
      message: `Your auction for LID #${liquidId} has ended without any bids`,
      data: {
        liquidId,
        link: `/marketplace/items/${liquidId}`,
      },
    })
  }

  // Create notification for buy offer received
  async notifyBuyOfferReceived(sellerAddress: string, liquidId: string, offerAmount: string, buyerAddress: string): Promise<boolean> {
    return this.createNotification({
      userId: sellerAddress,
      type: "buy_offer_received",
      title: "Buy Offer Received",
      message: `You received a buy offer of ${offerAmount} HUNOS for LID #${liquidId}`,
      data: {
        liquidId,
        offerAmount,
        buyerAddress,
        link: `/marketplace/items/${liquidId}`,
      },
    })
  }

  // Create notification for buy offer accepted/rejected
  async notifyBuyOfferActivity(buyerAddress: string, liquidId: string, status: "accepted" | "rejected", amount?: string): Promise<boolean> {
    const title = status === "accepted" ? "Buy Offer Accepted!" : "Buy Offer Rejected"
    const message = status === "accepted" 
      ? `Your buy offer of ${amount} HUNOS for LID #${liquidId} was accepted`
      : `Your buy offer for LID #${liquidId} was rejected`

    return this.createNotification({
      userId: buyerAddress,
      type: "my_buy_offer_activity",
      title,
      message,
      data: {
        liquidId,
        status,
        amount,
        link: `/marketplace/items/${liquidId}`,
      },
    })
  }

  // Create notification for item transfer
  async notifyItemTransfer(recipientAddress: string, liquidId: string, senderAddress: string): Promise<boolean> {
    return this.createNotification({
      userId: recipientAddress,
      type: "item_transfer",
      title: "Item Received",
      message: `You received LID #${liquidId} from ${senderAddress.slice(0, 6)}...${senderAddress.slice(-4)}`,
      data: {
        liquidId,
        senderAddress,
        link: `/marketplace/items/${liquidId}`,
      },
    })
  }

  // Create notification for listing activity
  async notifyListingActivity(sellerAddress: string, liquidId: string, listingType: "fixed" | "auction", price: string): Promise<boolean> {
    const title = "Item Listed"
    const message = `You listed LID #${liquidId} for ${price} HUNOS as ${listingType === "fixed" ? "fixed price" : "auction"}`

    return this.createNotification({
      userId: sellerAddress,
      type: "listing_activity",
      title,
      message,
      data: {
        liquidId,
        listingType,
        price,
        link: `/marketplace/items/${liquidId}`,
      },
    })
  }

  // Create notification for liked item activity
  async notifyLikedItemActivity(userAddress: string, liquidId: string, activityType: string): Promise<boolean> {
    const title = "Liked Item Activity"
    const message = `Activity on your liked item LID #${liquidId}: ${activityType}`

    return this.createNotification({
      userId: userAddress,
      type: "liked_item_activity",
      title,
      message,
      data: {
        liquidId,
        activityType,
        link: `/marketplace/items/${liquidId}`,
      },
    })
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance() 