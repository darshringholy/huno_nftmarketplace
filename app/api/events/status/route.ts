import { NextRequest, NextResponse } from "next/server"
import { marketplaceEventListener } from "@/lib/event-listener"

export async function GET(request: NextRequest) {
  try {
    // Get the current status of the event listener
    const status = {
      isListening: marketplaceEventListener.isListening,
      lastProcessedBlock: marketplaceEventListener.lastProcessedBlock,
      pollInterval: marketplaceEventListener.pollInterval,
      processedEventsCount: marketplaceEventListener.getProcessedEventsCount(),
    }
    
    return NextResponse.json({ 
      success: true, 
      status 
    })
  } catch (error) {
    console.error("Error getting event listener status:", error)
    return NextResponse.json({ 
      error: "Failed to get event listener status" 
    }, { status: 500 })
  }
} 