import { ethers } from "ethers"
import { LIQUIDID_ABI, LIQUIDID_ADDRESS } from "./liquidid"
import { CONFIG } from "./config"

export interface AuthResult {
  isAuthorized: boolean
  isConnected: boolean
  address?: string
  error?: string
}

export const checkUserAuthorization = async (): Promise<AuthResult> => {
  try {
    // Check if wallet is connected
    if (typeof window === "undefined" || !(window as any).ethereum) {
      return {
        isAuthorized: false,
        isConnected: false,
        error: "No wallet detected"
      }
    }

    const provider = new ethers.BrowserProvider((window as any).ethereum)
    
    // Get the connected account
    const accounts = await provider.listAccounts()
    if (accounts.length === 0) {
      return {
        isAuthorized: false,
        isConnected: false,
        error: "No wallet connected"
      }
    }

    const userAddress = accounts[0].address

    // Check if user is an authorized creator
    const liquidIdContract = new ethers.Contract(LIQUIDID_ADDRESS, LIQUIDID_ABI, provider)
    const isAuthorized = await liquidIdContract.authorizedCreators(userAddress)

    return {
      isAuthorized,
      isConnected: true,
      address: userAddress
    }

  } catch (error) {
    console.error("Error checking authorization:", error)
    return {
      isAuthorized: false,
      isConnected: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}

export const requireAuth = async (): Promise<AuthResult> => {
  const authResult = await checkUserAuthorization()
  
  if (!authResult.isConnected) {
    throw new Error("Please connect your wallet to access admin features")
  }
  
  if (!authResult.isAuthorized) {
    throw new Error("You are not authorized to access admin features. Only authorized creators can access this page.")
  }
  
  return authResult
} 