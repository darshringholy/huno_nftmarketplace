"use client"

import { useState, useEffect } from "react"
import { useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider } from "@web3modal/ethers/react"
import { BrowserProvider, formatEther } from "ethers"

export function useWallet() {
  const { open } = useWeb3Modal()
  const { address, chainId, isConnected } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()
  const [balance, setBalance] = useState<string>("0")
  const [loading, setLoading] = useState(false)

  // Get wallet balance
  const getBalance = async () => {
    if (!walletProvider || !address) return

    try {
      const ethersProvider = new BrowserProvider(walletProvider)
      const balance = await ethersProvider.getBalance(address)
      setBalance(formatEther(balance))
    } catch (error) {
      console.error("Error getting balance:", error)
    }
  }

  // Connect wallet
  const connectWallet = async () => {
    setLoading(true)
    try {
      await open()
      // Force a balance refresh after connection
      setTimeout(() => {
        getBalance()
      }, 1000)
    } catch (error) {
      console.error("Error connecting wallet:", error)
    } finally {
      setLoading(false)
    }
  }

  // Disconnect wallet
  const disconnectWallet = async () => {
    try {
      await open({ view: "Account" })
    } catch (error) {
      console.error("Error disconnecting wallet:", error)
    }
  }

  // Get balance when connected
  useEffect(() => {
    if (isConnected && address) {
      getBalance()
    }
  }, [isConnected, address, chainId])

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected
          setBalance("0")
        } else {
          // User connected or switched accounts
          getBalance()
        }
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      }
    }
  }, [])

  // Format address for display
  const formatAddress = (addr: string) => {
    if (!addr) return ""
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return {
    address,
    chainId,
    isConnected,
    balance,
    loading,
    connectWallet,
    disconnectWallet,
    formatAddress: formatAddress(address || ""),
    getBalance,
  }
}
