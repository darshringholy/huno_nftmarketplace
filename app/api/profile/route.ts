import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  const data = await req.json();
  const client = await clientPromise;
  const db = client.db();
  const profiles = db.collection("profiles");

  const { address, ...profileData } = data;
  if (!address) {
    return NextResponse.json({ error: "Missing address" }, { status: 400 });
  }

  await profiles.updateOne(
    { address },
    { $set: { ...profileData, address } },
    { upsert: true }
  );

  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "Missing address" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db();
  const profiles = db.collection("profiles");
  const profile = await profiles.findOne({ address });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({ profile });
} 