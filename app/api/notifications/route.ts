import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  data?: any
  read: boolean
  createdAt: Date
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const limit = parseInt(searchParams.get("limit") || "10")
    const unreadOnly = searchParams.get("unreadOnly") === "true"
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    
    // Build query
    const query: any = { userId }
    if (unreadOnly) {
      query.read = false
    }
    
    // Get notifications
    const notifications = await db.collection("notifications")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()
    
    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, type, title, message, data } = body
    
    if (!userId || !type || !title || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    
    // Check user settings to see if this notification type is enabled
    const userSettings = await db.collection("settings").findOne({ userId })
    
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
      
      const settingKey = eventTypeMap[type]
      if (settingKey && userSettings.eventTypes[settingKey] === false) {
        // User has disabled this notification type
        return NextResponse.json({ success: true, message: "Notification skipped (disabled by user)" })
      }
    }
    
    // Create notification
    const notification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      type,
      title,
      message,
      data,
      read: false,
      createdAt: new Date(),
    }
    
    await db.collection("notifications").insertOne(notification)
    
    return NextResponse.json({ 
      success: true, 
      message: "Notification created successfully",
      notification 
    })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, notificationId, read } = body
    
    if (!userId || !notificationId) {
      return NextResponse.json({ error: "User ID and notification ID are required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    
    // Mark notification as read
    const result = await db.collection("notifications").updateOne(
      { userId, id: notificationId },
      { $set: { read: read !== undefined ? read : true } }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Notification updated successfully" 
    })
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
} 