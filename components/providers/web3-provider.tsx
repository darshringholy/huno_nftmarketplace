"use client"

import type { ReactNode } from "react"

interface Web3ProviderProps {
  children: ReactNode
}

export default function Web3Provider({ children }: Web3ProviderProps) {
  return <>{children}</>
}
