// Centralized configuration for the application
export const CONFIG = {
  // RPC URLs - use environment variables with fallbacks
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || "https://rpc-plume-testnet-1.t.conduit.xyz/PdaZCGuTnwRXQRt5ZEt4Xxqdryx3Srnfe",
  EXPLORER_URL: process.env.NEXT_PUBLIC_EXPLORER_URL || "https://testnet-explorer.plume.org",
  
  // Chain configuration based on environment
  CHAIN_ID: process.env.NODE_ENV === "production" ? 98867 : 98867, // Mainnet: 98868, Testnet: 98867
  CHAIN_NAME: process.env.NODE_ENV === "production" ? "Plume Testnet" : "Plume Testnet",
  CURRENCY: "ETH",
  
  // Environment detection
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
} as const 