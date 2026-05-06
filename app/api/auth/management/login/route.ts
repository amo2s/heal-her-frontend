import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// =====================================================================
// 1. STRICT TYPE DEFINITIONS (The Egress Contract)
// =====================================================================
interface AdminLoginResponse {
  data?: {
    adminLogin: {
      status: string;
      message: string;
      accessToken: string;
      refreshToken: string;
      user: {
        id: string;
        email: string;
        fullName: string;
        isActive: boolean;
        dashboard: string;
      };
    };
  };
  errors?: Array<{ message: string }>;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // We explicitly destructure the honeypot field as well
    const { email, password, website } = body;

    // =====================================================================
    // 2. BASIC PERIMETER DEFENSE
    // =====================================================================
    if (!email || !password) {
      return NextResponse.json(
        { detail: "Missing cryptographic parameters." }, 
        { status: 400 }
      );
    }

    // =====================================================================
    // 3. THE FRONTEND BOT TRAP (Dual-Layer Honeypot)
    // =====================================================================
    // If a scraper or bot auto-fills the hidden 'website' field, we drop them.
    if (website) {
      console.warn(`[LOGIN BOT TRAPPED] IP: ${request.headers.get("x-forwarded-for") || "unknown"}`);
      // Return a fake generic failure so the bot doesn't know it hit a trap
      return NextResponse.json(
        { detail: "Invalid administrative credentials." }, 
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000/graphql";

    // =====================================================================
    // 4. AUDIT INTEL EXTRACTION (Environmental Pinning)
    // =====================================================================
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // =====================================================================
    // 5. THE GRAPHQL CONTRACT (Updated to AdminLoginInput)
    // =====================================================================
    const query = `
      mutation AdminLoginMutation($inputData: AdminLoginInput!) {
        adminLogin(inputData: $inputData) {
          status
          message
          accessToken
          refreshToken
          user {
            id
            email
            fullName
            isActive
            dashboard
          }
        }
      }
    `;

    // =====================================================================
    // 6. THE HANDSHAKE TRANSMISSION
    // =====================================================================
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-healher-handshake": process.env.NEXT_PUBLIC_HANDSHAKE_SECRET || "",
        "x-forwarded-for": realIp,
        "user-agent": userAgent, // CRITICAL: Required for TokenForge Blood-Binding
      },
      body: JSON.stringify({
        query,
        variables: { 
          inputData: {
            email: email.trim().toLowerCase(), 
            password: password,
            website: "" // Pass empty string to bypass backend honeypot checks
          }
        },
      }),
    });

    const result: AdminLoginResponse = await response.json();

    // =====================================================================
    // 7. TOTAL ERROR MASKING
    // =====================================================================
    if (result.errors || !response.ok) {
      // Whether it's suspended, wrong password, or invalid handshake, 
      // the backend sterilizes the message. We just pass it along.
      const errorMsg = result.errors?.[0]?.message || "Invalid administrative credentials.";
      return NextResponse.json({ detail: errorMsg }, { status: 400 });
    }

    const data = result.data!.adminLogin;
    const cookieStore = await cookies();

    // =====================================================================
    // 8. ISOLATED COOKIE INJECTION
    // =====================================================================
    const isProduction = process.env.NODE_ENV === "production";

    // Access Token: 15 Minutes
    cookieStore.set({
      name: "admin-access-token",
      value: data.accessToken,
      httpOnly: true,
      secure: isProduction, 
      sameSite: "strict",
      maxAge: 15 * 60, 
      path: "/", 
    });

    // Refresh Token: 7 Days
    cookieStore.set({
      name: "admin-refresh-token",
      value: data.refreshToken,
      httpOnly: true,
      secure: isProduction, 
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, 
      path: "/", 
    });

    // =====================================================================
    // 9. THE STERILE EGRESS
    // =====================================================================
    // We strip the tokens from the JSON body so they ONLY exist in the HTTPOnly cookies.
    return NextResponse.json({
      status: data.status,
      message: data.message,
      user: data.user
    });

  } catch (error: any) {
    console.error("[ADMIN LOGIN PROXY ERROR]:", error.message);
    return NextResponse.json(
      { detail: "Internal Proxy Error. Security team notified." }, 
      { status: 500 }
    );
  }
}