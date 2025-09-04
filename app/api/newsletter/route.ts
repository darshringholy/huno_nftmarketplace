import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // Here you would typically:
    // 1. Save the email to your database
    // 2. Send a confirmation email
    // 3. Add to your mailing list service (Mailchimp, SendGrid, etc.)
    
    console.log("Newsletter subscription:", { email, timestamp: new Date().toISOString() });

    // For now, we'll just log the subscription
    // In a real implementation, you would:
    // - Save to database
    // - Send confirmation email
    // - Add to mailing list

    return NextResponse.json({
      success: true,
      message: "Thank you for subscribing to our newsletter!"
    });

  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe to newsletter" },
      { status: 500 }
    );
  }
} 