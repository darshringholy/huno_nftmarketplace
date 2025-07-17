import { NextRequest, NextResponse } from "next/server";

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
  external_url?: string;
  animation_url?: string;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const metadata = formData.get("metadata") as string | null;

    if (file) {
      // Upload file to IPFS
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PINATA_JWT}`,
        },
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file to IPFS');
      }

      const result = await response.json();
      const ipfsURI = `ipfs://${result.IpfsHash}`;
      
      return NextResponse.json({ 
        success: true, 
        ipfsURI,
        gatewayURL: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
      });
    } else if (metadata) {
      // Upload metadata to IPFS
      const metadataObj: NFTMetadata = JSON.parse(metadata);
      
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PINATA_JWT}`,
        },
        body: JSON.stringify(metadataObj),
      });

      if (!response.ok) {
        throw new Error('Failed to upload metadata to IPFS');
      }

      const result = await response.json();
      const ipfsURI = `ipfs://${result.IpfsHash}`;
      
      return NextResponse.json({ 
        success: true, 
        ipfsURI,
        gatewayURL: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
      });
    } else {
      return NextResponse.json({ error: "No file or metadata provided" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("IPFS upload error:", error);
    return NextResponse.json({ 
      error: "Upload failed", 
      details: error.message 
    }, { status: 500 });
  }
} 