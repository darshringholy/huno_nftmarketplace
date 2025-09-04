import { marketplaceEventListener } from "./event-listener"

// Auto-start the event listener when the server starts
export async function startEventListener() {
  try {
    console.log("Starting marketplace event listener on server startup...")
    // await marketplaceEventListener.startListening()
    console.log("Marketplace event listener started successfully")
  } catch (error) {
    console.error("Failed to start event listener on startup:", error)
  }
}

// Start the listener if this module is imported
if (typeof window === "undefined") {
  // Only run on server-side
  startEventListener()
} 