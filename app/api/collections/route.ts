import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, logoUrl, bannerUrl, ...rest } = data;
    if (!name || !logoUrl || !bannerUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db();
    const collections = db.collection("collections");
    const result = await collections.insertOne({
      name,
      logoUrl,
      bannerUrl,
      ...rest,
      createdAt: new Date(),
    });
    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create collection", details: err }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const walletAddress = searchParams.get("walletAddress");
    const client = await clientPromise;
    const db = client.db();
    const collections = db.collection("collections");
    if (id) {
      // Fetch by ObjectId
      try {
        const result = await collections.findOne({ _id: new ObjectId(id) });
        if (!result) {
          return NextResponse.json({ error: "Collection not found" }, { status: 404 });
        }
        return NextResponse.json({ collection: result });
      } catch (err) {
        return NextResponse.json({ error: "Invalid id format", details: err }, { status: 400 });
      }
    } else if (walletAddress) {
      const results = await collections.find({ walletAddress }).sort({ createdAt: -1 }).toArray();
      return NextResponse.json({ collections: results });
    } else {
      return NextResponse.json({ error: "Missing id or walletAddress" }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch collections", details: err }, { status: 500 });
  }
} 