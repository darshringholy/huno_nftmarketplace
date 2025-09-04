# Hunos LID Marketplace

## Rate Limit Issues & API Keys

### Current Issue Fixed
The application was experiencing rate limit errors from Infura because it was using default API keys with very low limits. This has been resolved by:

1. **Removing Infura dependency** - The app now only uses Plume testnet RPC
2. **Single network support** - Only Plume testnet is supported
3. **Updated wallet configuration** - Removed references to Ethereum, Polygon, and Arbitrum

### For Production Use

If you need to support multiple networks or want to avoid rate limits, consider:

1. **Get your own API keys:**
   - [Infura](https://infura.io/) - For Ethereum networks
   - [Alchemy](https://alchemy.com/) - For Ethereum networks  
   - [QuickNode](https://quicknode.com/) - Multi-chain support

2. **Update environment variables:**
   ```env
   NEXT_PUBLIC_INFURA_PROJECT_ID=your_infura_project_id
   NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
   ```

3. **Update wallet configuration** in `lib/walletconnect.ts`:
   ```typescript
   const mainnet = {
     chainId: 1,
     name: "Ethereum",
     currency: "ETH", 
     explorerUrl: "https://etherscan.io",
     rpcUrl: `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`,
   }
   ```

### Current Configuration
- **Network**: Plume Testnet only
- **RPC URL**: `https://rpc-plume-testnet-1.t.conduit.xyz/PdaZCGuTnwRXQRt5ZEt4Xxqdryx3Srnfe`
- **Explorer**: `https://testnet-explorer.plume.org`
- **Chain ID**: 98867

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   # Copy the example environment file
   cp env.example .env.local
   
   # Edit .env.local with your configuration
   # - Update NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID with your WalletConnect project ID
   # - Update RPC URLs if needed
   ```

3. For production deployment:
   ```bash
   # Copy production environment file
   cp env.production .env.production
   
   # Edit .env.production with your production settings
   # - Update NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
   # - Verify RPC URLs are correct for mainnet
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Switching

Quick commands to switch between environments:

```bash
# Switch to development (testnet)
npm run env:dev

# Switch to production (mainnet)
npm run env:prod

# Or use the general command
npm run env:switch dev
npm run env:switch prod
```

## Environment Configuration

### Development (Testnet)
- **RPC URL**: `https://rpc-plume-testnet-1.t.conduit.xyz/PdaZCGuTnwRXQRt5ZEt4Xxqdryx3Srnfe`
- **Explorer**: `https://testnet-explorer.plume.org`
- **Chain ID**: 98867

### Production (Mainnet)
- **RPC URL**: `https://rpc-plume-mainnet-1.t.conduit.xyz/PdaZCGuTnwRXQRt5ZEt4Xxqdryx3Srnfe`
- **Explorer**: `https://explorer.plume.org`
- **Chain ID**: 98868

### Environment Variables
- `NEXT_PUBLIC_RPC_URL` - RPC endpoint URL
- `NEXT_PUBLIC_EXPLORER_URL` - Blockchain explorer URL
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` - WalletConnect project ID
- `NODE_ENV` - Environment (development/production)

## Features

- **Real-time notifications** based on smart contract events
- **Marketplace functionality** for LID trading
- **Collection management** and verification
- **User profiles** with activity tracking
- **Settings management** with notification preferences

## Event Listener

The application includes a real-time event listener that monitors marketplace smart contract events and creates notifications automatically. To manage it:

- **Admin panel**: Visit `/admin/events` to start/stop the listener
- **Auto-start**: The listener starts automatically when the server starts
- **Status monitoring**: Check listener status and performance metrics

## Database

All data is stored in the "hunosmarket" MongoDB database, including:
- User settings and preferences
- Notifications
- Collection data
- Marketplace activities

## File Upload Configuration

The application supports file uploads for profile images and other assets. You can configure either AWS S3 or IPFS via Pinata:

### Option 1: AWS S3 (Recommended for Production)

1. Create an AWS S3 bucket
2. Create an IAM user with S3 permissions
3. Add the following environment variables:
   ```env
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_access_key_id
   AWS_SECRET_ACCESS_KEY=your_secret_access_key
   AWS_S3_BUCKET=your_bucket_name
   ```

### Option 2: IPFS via Pinata (Fallback)

1. Sign up at [Pinata](https://app.pinata.cloud/)
2. Get your API keys from the API keys section
3. Add the following environment variables:
   ```env
   PINATA_API_KEY=your_pinata_api_key
   PINATA_SECRET_API_KEY=your_pinata_secret_api_key
   ```

### Upload Behavior

- If AWS S3 is configured, files will be uploaded to S3
- If AWS S3 fails or is not configured, files will be uploaded to IPFS via Pinata
- If both fail, an error will be returned

**Note**: For development, you can use just the IPFS option by only setting the Pinata API keys. 