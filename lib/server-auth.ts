import { ethers } from "ethers"
import { LIQUIDID_ABI, LIQUIDID_ADDRESS } from "./liquidid"
import { CONFIG } from "./config"
import { NextRequest } from "next/server"

export interface ServerAuthResult {
  isAuthorized: boolean
  address?: string
  error?: string
}

export const checkServerAuthorization = async (request: NextRequest): Promise<ServerAuthResult> => {
  try {
    // Get the user's address from the request headers or query params
    // In a real implementation, you might get this from a JWT token or session
    const userAddress = request.headers.get('x-user-address') || 
                       request.nextUrl.searchParams.get('address')

    if (!userAddress) {
      return {
        isAuthorized: false,
        error: "No user address provided"
      }
    }

    // Validate the address format
    if (!ethers.isAddress(userAddress)) {
      return {
        isAuthorized: false,
        error: "Invalid address format"
      }
    }

    // Create provider and contract instance
    const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL)
    const liquidIdContract = new ethers.Contract(LIQUIDID_ADDRESS, LIQUIDID_ABI, provider)

    // Check if user is an authorized creator
    const isAuthorized = await liquidIdContract.authorizedCreators(userAddress)

    return {
      isAuthorized,
      address: userAddress
    }

  } catch (error) {
    console.error("Server auth error:", error)
    return {
      isAuthorized: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}

export const requireServerAuth = async (request: NextRequest): Promise<ServerAuthResult> => {
  const authResult = await checkServerAuthorization(request)
  
  if (!authResult.isAuthorized) {
    throw new Error(authResult.error || "Unauthorized access")
  }
  
  return authResult
} 