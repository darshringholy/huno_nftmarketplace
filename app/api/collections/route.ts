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
      status: 'pending', // New collections start as pending
      verified: false, // New collections are not verified by default
      createdAt: new Date(),
      updatedAt: new Date(),
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
    const search = searchParams.get("search");
    const status = searchParams.get("status"); // New parameter for filtering by status
    const admin = searchParams.get("admin"); // New parameter for admin view
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
    } else if (search) {
      // Search collections by name
      const searchRegex = new RegExp(search, 'i');
      let filter: any = { name: { $regex: searchRegex } };
      
      // If not admin, only show approved collections
      if (!admin) {
        filter.status = 'approved';
      }
      
      const results = await collections.find(filter).sort({ createdAt: -1 }).limit(10).toArray();
      return NextResponse.json(results);
    } else if (walletAddress) {
      let filter: any = { walletAddress };
      
      // If not admin, only show approved collections
      if (!admin) {
        filter.status = 'approved';
      }
      
      const results = await collections.find(filter).sort({ createdAt: -1 }).toArray();
      return NextResponse.json({ collections: results });
    } else if (status) {
      // Filter by status (for admin panel)
      const results = await collections.find({ status }).sort({ createdAt: -1 }).toArray();
      return NextResponse.json({ collections: results });
    } else {
      // Return collections based on context
      let filter: any = {};
      
      // If not admin, only show approved collections
      if (!admin) {
        filter.status = 'approved';
      }
      
      const results = await collections.find(filter).sort({ createdAt: -1 }).toArray();
      return NextResponse.json({ collections: results });
    }
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch collections", details: err }, { status: 500 });
  }
}

// New PATCH method for updating collection status
export async function PATCH(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, status, verified, adminNotes } = data;
    
    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db();
    const collections = db.collection("collections");
    
    const result = await collections.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status, 
          verified: status === 'approved' ? verified : false,
          adminNotes,
          updatedAt: new Date(),
          reviewedAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: "Collection status updated" });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update collection", details: err }, { status: 500 });
  }
} 