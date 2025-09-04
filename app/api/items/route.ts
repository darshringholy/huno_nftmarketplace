import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from "@/lib/marketplace";
import { LIQUIDID_ABI, LIQUIDID_ADDRESS } from "@/lib/liquidid";

// Helper to resolve IPFS URI to gateway URL
const resolveIpfs = (uri: string) => {
  if (!uri) return null;
  if (uri.startsWith("ipfs://")) {
    const hash = uri.replace("ipfs://", "");
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }
  return uri;
};

// Helper to fetch metadata
const fetchMetadata = async (uri: string) => {
  if (!uri) return null;
  
  let url = resolveIpfs(uri);
  if (!url) return null;
  
  try {
    const response = await fetch(url);
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.log("Error fetching metadata:", err);
  }
  
  return null;
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    
    if (!search) {
      return NextResponse.json([]);
    }

    const provider = new ethers.JsonRpcProvider("https://testnet-rpc.plume.org");
    const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider);
    const liquidIdContract = new ethers.Contract(LIQUIDID_ADDRESS, LIQUIDID_ABI, provider);
    
    // Get recent sales from marketplace
    const sales = await marketplaceContract.getSaleArray(0, 50);
    
    const searchResults = [];
    
    for (const sale of sales) {
      if (!sale || !sale.isActive) continue;
      
      try {
        // Get asset data
        const assetData = await liquidIdContract.getAsset(sale.liquidId.toString());
        
        if (!assetData || !assetData.isActive) continue;
        
        // Fetch metadata
        let meta = null;
        try {
          meta = await fetchMetadata(assetData.metadataURI);
        } catch (err) {
          console.log("Error fetching metadata:", err);
        }
        
        const itemName = meta?.name || `LID #${sale.liquidId}`;
        
        // Check if item name matches search query
        if (itemName.toLowerCase().includes(search.toLowerCase())) {
          // Get image
          let imageUri = meta?.image || "";
          if (imageUri && imageUri.startsWith("ipfs://")) {
            imageUri = resolveIpfs(imageUri) || "";
          }
          
          if (!imageUri || typeof imageUri !== 'string' || !imageUri.startsWith('http')) {
            imageUri = "/images/collection-image.png";
          }
          
          // Get price
          const price = sale.sellType.toString() === "0" ? sale.fixedPrice : sale.startingPrice;
          const formattedPrice = ethers.formatUnits(price, 18);
          
          searchResults.push({
            liquidId: sale.liquidId.toString(),
            name: itemName,
            image: imageUri,
            price: formattedPrice,
            saleType: sale.sellType.toString(),
            isActive: sale.isActive
          });
          
          if (searchResults.length >= 10) break;
        }
      } catch (err) {
        console.log("Error processing item:", err);
        continue;
      }
    }
    
    return NextResponse.json(searchResults);
  } catch (err) {
    console.error("Items search error:", err);
    return NextResponse.json({ error: "Failed to search items", details: err }, { status: 500 });
  }
} 