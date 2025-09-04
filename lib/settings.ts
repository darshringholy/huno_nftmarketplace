import clientPromise from "@/lib/mongodb"

export interface DefaultSettings {
  userId: string
  currency: string
  telegram: boolean
  eventTypes: {
    likedItemActivity: boolean
    listingActivity: boolean
    itemSold: boolean
    bidActivity: boolean
    outbid: boolean
    auctionExpiration: boolean
    buyOfferReceived: boolean
    myBuyOfferActivity: boolean
    itemTransfer: boolean
  }
  createdAt: Date
  updatedAt: Date
}

export const getDefaultSettings = (userId: string): DefaultSettings => {
  return {
    userId,
    currency: "usd",
    telegram: true,
    eventTypes: {
      likedItemActivity: true,
      listingActivity: true,
      itemSold: true,
      bidActivity: true,
      outbid: true,
      auctionExpiration: true,
      buyOfferReceived: true,
      myBuyOfferActivity: true,
      itemTransfer: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export const ensureUserSettings = async (userId: string): Promise<DefaultSettings> => {
  const client = await clientPromise
  const db = client.db()
  const settings = db.collection("settings")

  // Check if user has settings
  const existingSettings = await settings.findOne({ userId })

  if (!existingSettings) {
    // Create default settings
    const defaultSettings = getDefaultSettings(userId)
    await settings.insertOne(defaultSettings)
    console.log(`Created default settings for user: ${userId}`)
    return defaultSettings
  }

  return existingSettings as unknown as DefaultSettings
}

export const createDefaultSettings = async (userId: string): Promise<void> => {
  const client = await clientPromise
  const db = client.db()
  const settings = db.collection("settings")

  const defaultSettings = getDefaultSettings(userId)
  
  try {
    await settings.insertOne(defaultSettings)
    console.log(`Created default settings for user: ${userId}`)
  } catch (error) {
    console.error(`Error creating default settings for user ${userId}:`, error)
    throw error
  }
} 