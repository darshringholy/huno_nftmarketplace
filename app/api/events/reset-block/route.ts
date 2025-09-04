import { NextRequest, NextResponse } from "next/server"
import { marketplaceEventListener } from "@/lib/event-listener"

export async function POST(request: NextRequest) {
  try {
    // Reset the last processed block
    marketplaceEventListener.resetLastProcessedBlock()
    
    return NextResponse.json({ 
      success: true, 
      message: "Last processed block reset successfully" 
    })
  } catch (error) {
    console.error("Error resetting block:", error)
    return NextResponse.json({ 
      error: "Failed to reset block" 
    }, { status: 500 })
  }
} 