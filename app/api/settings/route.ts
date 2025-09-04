import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getDefaultSettings, ensureUserSettings, DefaultSettings } from "@/lib/settings"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    
    // Get user settings
    const settings = await db.collection("settings").findOne({ userId })
    
    if (!settings) {
      // Return default settings if none exist
      const defaultSettings = getDefaultSettings(userId)
      
      // Insert default settings
      await db.collection("settings").insertOne(defaultSettings)
      
      return NextResponse.json({ settings: defaultSettings })
    }
    
    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, settings } = body
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }
    
    if (!settings) {
      return NextResponse.json({ error: "Settings data is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    
    // Update or insert settings
    const result = await db.collection("settings").updateOne(
      { userId },
      {
        $set: {
          ...settings,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    )
    
    return NextResponse.json({ 
      success: true, 
      message: "Settings updated successfully",
      updated: result.modifiedCount > 0,
      inserted: result.upsertedCount > 0
    })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
} 