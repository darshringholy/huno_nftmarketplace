import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { LIQUIDID_ABI, LIQUIDID_ADDRESS } from "@/lib/liquidid";
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from "@/lib/marketplace";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Helper to resolve IPFS URI to gateway URL
const resolveIpfs = (uri: string) => {
  if (!uri) return null;
  if (uri.startsWith("ipfs://")) {
    const hash = uri.replace("ipfs://", "");
    const gateways = [
      `https://gateway.pinata.cloud/ipfs/${hash}`,
      `https://ipfs.io/ipfs/${hash}`,
      `https://cloudflare-ipfs.com/ipfs/${hash}`,
      `https://dweb.link/ipfs/${hash}`
    ];
    return gateways[0];
  }
  return uri;
};

// Helper to validate JSON response
const isValidJsonResponse = async (response: Response) => {
  const text = await response.text();
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
};

// Helper to fetch metadata with retries and fallback gateways
const fetchMetadata = async (uri: string) => {
  if (!uri) return null;
  
  let url = resolveIpfs(uri);
  if (!url) return null;
  
  // If it's an IPFS URI, try multiple gateways
  if (uri.startsWith("ipfs://")) {
    const hash = uri.replace("ipfs://", "");
    const gateways = [
      `https://gateway.pinata.cloud/ipfs/${hash}`,
      `https://ipfs.io/ipfs/${hash}`,
      `https://cloudflare-ipfs.com/ipfs/${hash}`,
      `https://dweb.link/ipfs/${hash}`
    ];
    
    for (const gateway of gateways) {
      try {
        console.log(`Trying gateway: ${gateway}`);
        const response = await fetch(gateway);
        if (response.ok && await isValidJsonResponse(response.clone())) {
          console.log(`Success with gateway: ${gateway}`);
          return await response.json();
        }
      } catch (err) {
        console.log(`Gateway ${gateway} failed:`, err);
        continue;
      }
    }
  } else {
    // For non-IPFS URLs
    try {
      const response = await fetch(url);
      if (response.ok && await isValidJsonResponse(response.clone())) {
        return await response.json();
      }
    } catch (err) {
      console.log(`Non-IPFS URL failed:`, err);
    }
  }
  
  return null;
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before using
    const { id } = await params;
    
    // Get provider
    const provider = new ethers.JsonRpcProvider("https://testnet-rpc.plume.org");
    const liquidIdContract = new ethers.Contract(LIQUIDID_ADDRESS, LIQUIDID_ABI, provider);
    const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider);

    // Get collection data from database
    const client = await clientPromise;
    const db = client.db();
    const collections = db.collection("collections");
    
    let collection;
    try {
      collection = await collections.findOne({ _id: new ObjectId(id) });
      if (!collection) {
        return NextResponse.json({ error: "Collection not found" }, { status: 404 });
      }
    } catch (err) {
      return NextResponse.json({ error: "Invalid collection ID" }, { status: 400 });
    }
    
    // Get total supply
    const totalSupply = await liquidIdContract.getTotalSupply();
    
    // Initialize stats
    let traded = 0;
    let listed = 0;
    let floorPrice = Infinity;
    const uniqueOwners = new Set();

    // Fetch recent sales events to calculate traded volume
    try {
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 10000); // Last 10,000 blocks
      
      // Get SaleCompleted events
      const saleCompletedFilter = marketplaceContract.filters.SaleCompleted();
      const saleCompletedEvents = await marketplaceContract.queryFilter(saleCompletedFilter, fromBlock, currentBlock);
      
      for (const event of saleCompletedEvents) {
        const parsedLog = marketplaceContract.interface.parseLog(event);
        if (parsedLog) {
          const { liquidId, buyer, seller, price } = parsedLog.args;
          traded += parseFloat(ethers.formatUnits(price, 18));
        }
      }
    } catch (err) {
      console.log("Error fetching sales events:", err);
    }

    // Check all items to find ones that belong to this collection
    const totalItems = Number(totalSupply);
    let collectionItems = 0;
    let collectionListed = 0;
    let collectionFloorPrice = Infinity;

    // Process items in batches to avoid rate limiting
    const batchSize = 10;
    for (let i = 0; i < totalItems; i += batchSize) {
      const batchEnd = Math.min(i + batchSize, totalItems);
      const batchPromises = [];

      for (let j = i; j < batchEnd; j++) {
        batchPromises.push(
          (async () => {
            try {
              const assetData = await liquidIdContract.getAsset(j);
              if (!assetData || !assetData.isActive) return null;

              // Fetch metadata to check if item belongs to this collection
              let metadata = null;
              try {
                metadata = await fetchMetadata(assetData.metadataURI);
              } catch (err) {
                console.log(`Failed to fetch metadata for item ${j}:`, err);
                return null;
              }

              // Check if item belongs to this collection
              if (metadata && metadata.collection) {
                console.log(`Item ${j} collection: "${metadata.collection}", target: "${id}"`);
                if (metadata.collection === id) {
                  console.log(`Item ${j} matches collection ${id}`);
                  collectionItems++;
                  uniqueOwners.add(assetData.owner);

                  // Check if item is listed
                  try {
                    const saleData = await marketplaceContract.getSale(j);
                    if (saleData && saleData.isActive) {
                      console.log(`Item ${j} is listed on marketplace`);
                      collectionListed++;
                      
                      // Get the appropriate price based on sale type
                      let price: number | undefined;
                      if (Number(saleData.sellType) === 0) { // Fixed price sale
                        price = parseFloat(ethers.formatUnits(saleData.fixedPrice, 18));
                        console.log(`Item ${j} fixed price: ${price}`);
                      } else if (Number(saleData.sellType) === 1) { // Auction sale
                        // For auctions, use the current bid or starting price
                        if (saleData.currentBid && saleData.currentBid > 0) {
                          price = parseFloat(ethers.formatUnits(saleData.currentBid, 18));
                          console.log(`Item ${j} auction current bid: ${price}`);
                        } else {
                          price = parseFloat(ethers.formatUnits(saleData.startingPrice, 18));
                          console.log(`Item ${j} auction starting price: ${price}`);
                        }
                      }
                      
                      if (price && price < collectionFloorPrice) {
                        console.log(`Item ${j} new floor price: ${price} (was: ${collectionFloorPrice})`);
                        collectionFloorPrice = price;
                      }
                    } else {
                      console.log(`Item ${j} is not listed on marketplace`);
                    }
                  } catch (err) {
                    console.log(`Item ${j} error checking marketplace:`, err);
                    // Item not listed
                  }
                } else {
                  console.log(`Item ${j} does not match collection ${id}`);
                }
              } else {
                console.log(`Item ${j} has no collection metadata`);
              }
              return null;
            } catch (err) {
              console.log(`Error fetching item ${j}:`, err);
              return null;
            }
          })()
        );
      }

      // Wait for batch to complete
      await Promise.all(batchPromises);

      // Add delay between batches to avoid rate limiting
      if (batchEnd < totalItems) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // Update stats with collection-specific data
    listed = collectionListed;
    floorPrice = collectionFloorPrice === Infinity ? 0 : collectionFloorPrice;
    
    console.log(`Collection ${id} stats:`, {
      collectionItems,
      collectionListed,
      floorPrice,
      uniqueOwners: uniqueOwners.size
    });

    // If no items are listed, set floor price to 0
    if (floorPrice === Infinity) {
      floorPrice = 0;
    }

    return NextResponse.json({
      stats: {
        traded: traded.toFixed(2),
        players: uniqueOwners.size.toString(),
        listed: listed.toString(),
        floorPrice: floorPrice.toFixed(2)
      }
    });
  } catch (err) {
    console.error("Error fetching collection stats:", err);
    return NextResponse.json(
      { error: "Failed to fetch collection stats", details: err },
      { status: 500 }
    );
  }
} 