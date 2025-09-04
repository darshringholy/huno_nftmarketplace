import { NextRequest, NextResponse } from "next/server"
import { marketplaceEventListener } from "@/lib/event-listener"
import { checkServerAuthorization } from "@/lib/server-auth"

export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const authResult = await checkServerAuthorization(request)
    if (!authResult.isAuthorized) {
      return NextResponse.json({ 
        error: "Unauthorized access. Only authorized creators can access admin features." 
      }, { status: 403 })
    }

    // Start the event listener
    await marketplaceEventListener.startListening()
    
    return NextResponse.json({ 
      success: true, 
      message: "Marketplace event listener started successfully" 
    })
  } catch (error) {
    console.error("Error starting event listener:", error)
    return NextResponse.json({ 
      error: "Failed to start event listener" 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authorization
    const authResult = await checkServerAuthorization(request)
    if (!authResult.isAuthorized) {
      return NextResponse.json({ 
        error: "Unauthorized access. Only authorized creators can access admin features." 
      }, { status: 403 })
    }

    // Stop the event listener
    marketplaceEventListener.stopListening()
    
    return NextResponse.json({ 
      success: true, 
      message: "Marketplace event listener stopped successfully" 
    })
  } catch (error) {
    console.error("Error stopping event listener:", error)
    return NextResponse.json({ 
      error: "Failed to stop event listener" 
    }, { status: 500 })
  }
} 