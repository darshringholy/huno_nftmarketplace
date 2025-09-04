const { MongoClient } = require('mongodb');

async function migrateSettings() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hunosmarket';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const profiles = db.collection('profiles');
    const settings = db.collection('settings');

    // Get all profiles
    const allProfiles = await profiles.find({}).toArray();
    console.log(`Found ${allProfiles.length} profiles`);

    let createdCount = 0;
    let skippedCount = 0;

    for (const profile of allProfiles) {
      const userId = profile.address;
      
      // Check if settings already exist for this user
      const existingSettings = await settings.findOne({ userId });
      
      if (!existingSettings) {
        // Create default settings
        const defaultSettings = {
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
        };

        await settings.insertOne(defaultSettings);
        createdCount++;
        console.log(`Created default settings for user: ${userId}`);
      } else {
        skippedCount++;
        console.log(`Settings already exist for user: ${userId}`);
      }
    }

    console.log(`\nMigration completed:`);
    console.log(`- Created settings for ${createdCount} users`);
    console.log(`- Skipped ${skippedCount} users (already had settings)`);
    console.log(`- Total processed: ${allProfiles.length} users`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateSettings()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateSettings }; 