"use client"

import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react"

// 1. Get projectId from https://cloud.walletconnect.com
const projectId = "YOUR_PROJECT_ID" // Replace with your actual project ID

// 2. Set chains
const mainnet = {
  chainId: 1,
  name: "Ethereum",
  currency: "ETH",
  explorerUrl: "https://etherscan.io",
  rpcUrl: "https://cloudflare-eth.com",
}

const polygon = {
  chainId: 137,
  name: "Polygon",
  currency: "MATIC",
  explorerUrl: "https://polygonscan.com",
  rpcUrl: "https://polygon-rpc.com",
}

const arbitrum = {
  chainId: 42161,
  name: "Arbitrum One",
  currency: "ETH",
  explorerUrl: "https://arbiscan.io",
  rpcUrl: "https://arb1.arbitrum.io/rpc",
}

const plume = {
  chainId: 98867, // Plume testnet chain ID
  name: "Plume Testnet",
  currency: "ETH",
  explorerUrl: "testnet-explorer.plume.org",
  rpcUrl: "https://testnet-rpc.plume.org",
}

// 3. Create a metadata object
const metadata = {
  name: "Hunos",
  description: "Hunos NFT Marketplace",
  url: "https://hunos.com", // Replace with your domain
  icons: ["https://hunos.com/icon.png"], // Replace with your icon
}

// 4. Create Ethers config
const ethersConfig = defaultConfig({
  metadata,
  enableEIP6963: true,
  enableInjected: true,
  enableCoinbase: true,
  rpcUrl: "https://cloudflare-eth.com",
  defaultChainId: 1,
})

// 5. Create a Web3Modal instance - Initialize it here
createWeb3Modal({
  ethersConfig,
  chains: [mainnet, polygon, arbitrum, plume],
  projectId,
  enableAnalytics: true,
  enableOnramp: true,
})

export { mainnet, polygon, arbitrum, plume }
