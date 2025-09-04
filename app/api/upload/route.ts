import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

// Check if AWS credentials are configured
const isAwsConfigured = process.env.AWS_REGION && 
                       process.env.AWS_ACCESS_KEY_ID && 
                       process.env.AWS_SECRET_ACCESS_KEY && 
                       process.env.AWS_S3_BUCKET;

const s3 = isAwsConfigured ? new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
}) : null;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log("Upload request received:", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      isAwsConfigured,
      hasPinataApiKey: !!process.env.PINATA_API_KEY,
      hasPinataSecretKey: !!process.env.PINATA_SECRET_API_KEY
    });

  // If AWS is configured, try to upload to S3
  if (isAwsConfigured && s3) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const fileExt = file.name.split(".").pop();
      const key = `uploads/${uuidv4()}.${fileExt}`;

      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      };

      await s3.send(new PutObjectCommand(uploadParams));
      const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
      return NextResponse.json({ url });
    } catch (err) {
      console.error("S3 upload failed:", err);
      // Fall through to IPFS upload
    }
  }

  // Fallback to IPFS upload
  try {
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    // Check if we have Pinata credentials
    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;
    const pinataJwt = process.env.PINATA_JWT;

    if (!pinataApiKey || !pinataSecretApiKey) {
      throw new Error('Pinata API credentials not configured');
    }

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretApiKey,
      },
      body: uploadFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pinata API error:', errorText);
      throw new Error(`Failed to upload file to IPFS: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const url = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
    
    console.log('File uploaded to IPFS:', result.IpfsHash);
    return NextResponse.json({ url });
  } catch (err: any) {
    console.error("IPFS upload failed:", err);
    return NextResponse.json({ 
      error: "Upload failed", 
      details: err.message || "Both S3 and IPFS upload failed" 
    }, { status: 500 });
  }
  } catch (err: any) {
    console.error("Upload route error:", err);
    return NextResponse.json({ 
      error: "Upload failed", 
      details: err.message || "Unexpected error occurred" 
    }, { status: 500 });
  }
} 