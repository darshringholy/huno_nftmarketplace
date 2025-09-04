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
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sortBy = searchParams.get("sortBy") || "newest";
    
    // Await params before using
    const { id } = await params;
    
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
    
    // Get provider
    const provider = new ethers.JsonRpcProvider("https://testnet-rpc.plume.org");
    const liquidIdContract = new ethers.Contract(LIQUIDID_ADDRESS, LIQUIDID_ABI, provider);
    const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider);

    // Get all active sales from marketplace
    console.log("Fetching active sales from marketplace...");
    const allSales = await marketplaceContract.getSaleArray(0, 1000); // Get up to 1000 sales
    console.log("Total sales found:", allSales.length);

    // Filter only active sales
    const activeSales = allSales.filter((sale: any) => sale && sale.isActive);
    console.log("Active sales found:", activeSales.length);

    const items = [];
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, activeSales.length);

    // Process only the active sales for the current page
    const salesToProcess = activeSales.slice(startIndex, endIndex);
    console.log(`Processing ${salesToProcess.length} sales for page ${page}`);

    // Process sales in batches to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < salesToProcess.length; i += batchSize) {
      const batchEnd = Math.min(i + batchSize, salesToProcess.length);
      const batchPromises = [];

      for (let j = i; j < batchEnd; j++) {
        const sale: any = salesToProcess[j];
        batchPromises.push(
          (async () => {
            try {
              const liquidId = sale.liquidId;
              console.log(`Processing sale for liquidId: ${liquidId}`);

              // Get asset data
              const assetData = await liquidIdContract.getAsset(liquidId);
              if (!assetData || !assetData.isActive) {
                console.log(`Asset ${liquidId} is not active`);
                return null;
              }

              // Fetch metadata
              let metadata = null;
              let image = "";
              try {
                metadata = await fetchMetadata(assetData.metadataURI);
                if (metadata) {
                  image = metadata.image || "";
                  if (image && image.startsWith("ipfs://")) {
                    image = resolveIpfs(image) || "";
                  }
                }
              } catch (err) {
                console.log(`Failed to fetch metadata for item ${liquidId}:`, err);
              }

              // Check if item belongs to the specific collection
              if (metadata && metadata.collection) {
                console.log(`Item ${liquidId} belongs to collection: ${metadata.collection}, checking against collection ID: ${id}`);
                
                // Compare the item's collection ID with the target collection ID
                if (metadata.collection === id) {
                  console.log(`Item ${liquidId} matches collection ID: ${id}`);
                  return {
                    id: Number(liquidId),
                    name: metadata.name || `LID #${liquidId}`,
                    image: image || "/placeholder.svg",
                    price: sale && sale.price ? ethers.formatUnits(sale.price, 18) : null,
                    saleData: sale && sale.price ? {
                      price: ethers.formatUnits(sale.price, 18),
                      seller: sale.seller,
                      endTime: sale.endTime ? new Date(Number(sale.endTime) * 1000) : null,
                      saleType: Number(sale.saleType)
                    } : null,
                    metadata,
                    assetData: {
                      owner: assetData.owner,
                      isActive: assetData.isActive
                    }
                  };
                } else {
                  console.log(`Item ${liquidId} collection ID "${metadata.collection}" does not match target collection ID "${id}"`);
                }
              }
              return null;
            } catch (err) {
              console.log(`Error fetching item ${sale.liquidId}:`, err);
              return null;
            }
          })()
        );
      }

      // Wait for batch to complete
      const batchResults = await Promise.all(batchPromises);
      items.push(...batchResults.filter(item => item !== null));

      // Add delay between batches to avoid rate limiting
      if (batchEnd < salesToProcess.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // Sort items based on sortBy parameter
    if (sortBy === "price-low") {
      items.sort((a, b) => {
        const priceA = a.saleData ? parseFloat(a.saleData.price) : Infinity;
        const priceB = b.saleData ? parseFloat(b.saleData.price) : Infinity;
        return priceA - priceB;
      });
    } else if (sortBy === "price-high") {
      items.sort((a, b) => {
        const priceA = a.saleData ? parseFloat(a.saleData.price) : -Infinity;
        const priceB = b.saleData ? parseFloat(b.saleData.price) : -Infinity;
        return priceB - priceA;
      });
    } else if (sortBy === "newest") {
      items.sort((a, b) => Number(b.id) - Number(a.id));
    }

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total: activeSales.length,
        hasMore: endIndex < activeSales.length
      }
    });
  } catch (err) {
    console.error("Error fetching collection items:", err);
    return NextResponse.json(
      { error: "Failed to fetch collection items", details: err },
      { status: 500 }
    );
  }
} 