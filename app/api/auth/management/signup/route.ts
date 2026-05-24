import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. EXTRACTION: Catch 'fullName' from UI. 
    // We alias it to 'full_name' internally just for clear variable separation.
    const { fullName: full_name, email, password, website } = body;

    // 2. BASIC PERIMETER CHECK
    if (!email || !password || !full_name) {
      return NextResponse.json(
        { detail: "All security parameters are required." }, 
        { status: 400 }
      );
    }

    // 3. THE DUAL-LAYER HONEYPOT (Frontend Trap)
    // If a bot fills out the hidden 'website' field, silently drop them and return fake success.
    if (website) {
      console.warn(`[BOT TRAPPED] Honeypot triggered by IP: ${request.headers.get("x-forwarded-for") || "unknown"}`);
      return NextResponse.json({
        status: "success",
        message: "Application Submitted. The system administrator will review your credentials."
      });
    }

    // 4. TARGET ACQUISITION
    const backendUrl = process.env.BACKEND_URL || "https://sliverboy-healher-backend.hf.space/graphql";

    // 5. AUDIT LOG EXTRACTION (Passing Intel to the Python Guards)
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // 6. THE GRAPHQL CONTRACT
    // Perfectly matched to your Strawberry 'StaffAuthMutation' schema
    const query = `
      mutation RegisterStaffApplication($input: StaffSignUpInput!) {
        registerStaffApplication(input: $input) {
          success
          message
        }
      }
    `;

    // 7. THE HANDSHAKE TRANSMISSION
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        // Cryptographic signature proving this request came from your UI
        "x-healher-handshake": process.env.NEXT_PUBLIC_HANDSHAKE_SECRET || "",
        // Passing the audit intel directly to the backend
        "x-forwarded-for": realIp,
        "user-agent": userAgent,
      },
      body: JSON.stringify({
        query,
        variables: { 
          input: {
            // THE FIX: Sending 'fullName' to satisfy Strawberry's auto-camelCase schema
            fullName: full_name.trim(),
            email: email.trim().toLowerCase(),
            password: password,
            website: "" // Hardcoded empty string because bots are already trapped
          }
        },
      }),
    });

    const result = await response.json();

    // 8. TOTAL ERROR MASKING
    if (result.errors || !response.ok) {
      const errorMsg = result.errors?.[0]?.message || "Authentication Service Unavailable.";
      return NextResponse.json({ detail: errorMsg }, { status: 400 });
    }

    // 9. THE STERILE EGRESS
    // Map backend boolean to frontend string status
    return NextResponse.json({
      status: result.data.registerStaffApplication.success ? "success" : "error",
      message: result.data.registerStaffApplication.message
    });

  } catch (error: unknown) {
    // CRITICAL FAILURE: Node.js server crashed or Python backend is completely offline
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[PROXY FATAL ERROR]:", errorMessage);
    
    return NextResponse.json(
      { detail: "Fortress Gateway is currently offline. Try again later." }, 
      { status: 500 }
    );
  }
}