import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Define strict types so your frontend knows exactly what is coming back
interface LoginResponse {
  data?: {
    login: {
      status: string;
      message: string;
      accessToken: string;
      refreshToken: string; // <--- ADDED THE 7-DAY KEY HERE
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
    const { email, password } = body;

    // Quick check before we even disturb the backend
    if (!email || !password) {
      return NextResponse.json({ detail: "Email and password are required." }, { status: 400 });
    }

    const backendUrl = process.env.BACKEND_URL || "https://sliverboy-healher-backend.hf.space/graphql";

    // Extract the real user's IP so your backend Valkey Guard doesn't ban your Next.js server
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";

    // CLEANED MUTATION: Added refreshToken to the query!
    const query = `
      mutation LoginMutation($inputData: LoginInput!) {
        login(inputData: $inputData) {
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

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        // The Handshake to pass your Fortress Guard
        "x-healher-handshake": process.env.NEXT_PUBLIC_HANDSHAKE_SECRET || "",
        // Pass the real IP to the backend for accurate rate limiting
        "x-forwarded-for": realIp,
      },
      body: JSON.stringify({
        query,
        variables: { 
          // Wrapped the credentials inside inputData
          inputData: {
            email: email.trim().toLowerCase(), 
            password 
          }
        },
      }),
    });

    const result: LoginResponse = await response.json();

    // Catch GraphQL errors properly (This stops the "Offline" 500 panic!)
    if (result.errors || !response.ok) {
      const errorMsg = result.errors?.[0]?.message || "Authentication failed.";
      return NextResponse.json({ detail: errorMsg }, { status: 400 });
    }

    // Extract the clean data
    const data = result.data!.login;

    // THE VAULT: Set the HttpOnly Cookies
    const cookieStore = await cookies();

    // Cookie 1: The Short-Lived Access Token (15 Minutes)
    cookieStore.set({
      name: "sb-access-token",
      value: data.accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict",
      maxAge: 15 * 60, // 15 Minutes (900 seconds)
      path: "/", 
    });

    // Cookie 2: The Long-Lived Refresh Token (7 Days)
    cookieStore.set({
      name: "sb-refresh-token",
      value: data.refreshToken, // <-- Storing the new Master Key
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 Days (604,800 seconds)
      path: "/", 
    });

    // Return safe data without leaking EITHER token to the browser JS.
    return NextResponse.json({
      status: data.status,
      message: data.message,
      user: data.user
    });

  } catch (error: any) {
    console.error("[PROXY ERROR]:", error.message);
    return NextResponse.json(
      { detail: "Internal Proxy Error. Security team notified." }, 
      { status: 500 }
    );
  }
}