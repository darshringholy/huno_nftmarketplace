"use client"

import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react"
import { CONFIG } from "./config"

// 1. Get projectId from environment variable or use placeholder
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "YOUR_PROJECT_ID"

// 2. Set chains
const plume = {
  chainId: CONFIG.CHAIN_ID,
  name: CONFIG.CHAIN_NAME,
  currency: CONFIG.CURRENCY,
  explorerUrl: CONFIG.EXPLORER_URL,
  rpcUrl: CONFIG.RPC_URL,
}

// 3. Create a metadata object
const metadata = {
  name: "Hunos",
  description: "Hunos LID Marketplace",
  url: "https://hunos.com", // Replace with your domain
  icons: ["https://hunos.com/icon.png"], // Replace with your icon
}

// 4. Create Ethers config
const ethersConfig = defaultConfig({
  metadata,
  enableEIP6963: true,
  enableInjected: true,
  enableCoinbase: true,
  rpcUrl: CONFIG.RPC_URL, // Use centralized RPC URL
  defaultChainId: CONFIG.CHAIN_ID, // Set Plume testnet as default
})
console.log(process.env.NODE_ENV);
// 5. Create a Web3Modal instance - Initialize it here
if (typeof window !== "undefined" && !(window as any).__WEB3_MODAL_INITIALIZED__) {
  createWeb3Modal({
    ethersConfig,
    chains: [plume], // Only include Plume testnet
    projectId,
    enableAnalytics: true,
    enableOnramp: true,
  });
  (window as any).__WEB3_MODAL_INITIALIZED__ = true;
}

export { plume }
