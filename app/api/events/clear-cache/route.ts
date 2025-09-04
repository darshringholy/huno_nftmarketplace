import { NextRequest, NextResponse } from "next/server"
import { marketplaceEventListener } from "@/lib/event-listener"

export async function POST(request: NextRequest) {
  try {
    // Clear the processed events cache
    marketplaceEventListener.clearProcessedEvents()
    
    return NextResponse.json({ 
      success: true, 
      message: "Processed events cache cleared successfully" 
    })
  } catch (error) {
    console.error("Error clearing cache:", error)
    return NextResponse.json({ 
      error: "Failed to clear cache" 
    }, { status: 500 })
  }
} 