import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { createDefaultSettings, DefaultSettings } from "@/lib/settings";

export async function POST(req: NextRequest) {
  const data = await req.json();
  const client = await clientPromise;
  const db = client.db();
  const profiles = db.collection("profiles");
  const settings = db.collection("settings");

  const { address, ...profileData } = data;
  if (!address) {
    return NextResponse.json({ error: "Missing address" }, { status: 400 });
  }

  // Check if this is a new profile creation
  const existingProfile = await profiles.findOne({ address });
  const isNewProfile = !existingProfile;

  // Create or update profile
  await profiles.updateOne(
    { address },
    { $set: { ...profileData, address } },
    { upsert: true }
  );

  // If this is a new profile, create default settings
  if (isNewProfile) {
    try {
      await createDefaultSettings(address);
    } catch (error) {
      console.error(`Error creating default settings for user ${address}:`, error);
      // Don't fail the profile creation if settings creation fails
    }
  }

  return NextResponse.json({ 
    success: true, 
    isNewProfile,
    message: isNewProfile ? "Profile created with default settings" : "Profile updated"
  });
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