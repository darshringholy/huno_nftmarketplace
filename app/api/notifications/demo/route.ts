import { NextRequest, NextResponse } from "next/server"
import { notificationService } from "@/lib/notification-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, type } = body
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    let success = false
    const liquidId = "123"
    const price = "1.5"
    const buyerAddress = "0x1234567890123456789012345678901234567890"

    switch (type) {
      case "item_sold":
        success = await notificationService.notifyItemSold(userId, liquidId, price, buyerAddress)
        break
      case "bid_activity":
        success = await notificationService.notifyBidReceived(userId, liquidId, price, buyerAddress)
        break
      case "outbid":
        success = await notificationService.notifyOutbid(userId, liquidId, price)
        break
      case "auction_expiration":
        success = await notificationService.notifyAuctionExpiration(userId, liquidId)
        break
      case "buy_offer_received":
        success = await notificationService.notifyBuyOfferReceived(userId, liquidId, price, buyerAddress)
        break
      case "my_buy_offer_activity":
        success = await notificationService.notifyBuyOfferActivity(userId, liquidId, "accepted", price)
        break
      case "item_transfer":
        success = await notificationService.notifyItemTransfer(userId, liquidId, buyerAddress)
        break
      case "listing_activity":
        success = await notificationService.notifyListingActivity(userId, liquidId, "fixed", price)
        break
      case "liked_item_activity":
        success = await notificationService.notifyLikedItemActivity(userId, liquidId, "New bid placed")
        break
      default:
        return NextResponse.json({ error: "Invalid notification type" }, { status: 400 })
    }

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: `Demo notification of type '${type}' created successfully` 
      })
    } else {
      return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error creating demo notification:", error)
    return NextResponse.json({ error: "Failed to create demo notification" }, { status: 500 })
  }
} 