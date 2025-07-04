"use client"

import type { ReactNode } from "react"
import "@/lib/walletconnect" // Import to initialize Web3Modal

interface Web3ProviderProps {
  children: ReactNode
}

export default function Web3Provider({ children }: Web3ProviderProps) {
  return <>{children}</>
}
