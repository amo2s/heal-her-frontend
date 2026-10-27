import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Map full_name (from React) to fullName (for GraphQL) and extract age
    const { full_name, email, age, password } = body;

    if (!email || !password || !full_name || !age) {
      return NextResponse.json({ detail: "All fields are required." }, { status: 400 });
    }

    const backendUrl = process.env.BACKEND_URL || "https://sliverboy-healher-backend.hf.space/graphql";

    // Extract the real user's IP for the Valkey Guard
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";

    // THE GRAPHQL MUTATION (Updated to include age)
    const query = `
      mutation SignupMutation($email: String!, $password: String!, $fullName: String!, $age: Int!) {
        signup(email: $email, password: $password, fullName: $fullName, age: $age) {
          status
          message
          userId
        }
      }
    `;

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        // --- SECURITY ALIGNMENT FIX ---
        // Swapped NEXT_PUBLIC_ for FRONTEND_ to match your other proxies
        // and keep the handshake key strictly invisible to the browser.
        "x-healher-handshake": process.env.FRONTEND_HANDSHAKE_SECRET || "",
        "x-forwarded-for": realIp,
      },
      body: JSON.stringify({
        query,
        variables: { 
          email: email.trim().toLowerCase(), 
          password,
          fullName: full_name,
          age: age // Passes the integer age to the backend
        },
      }),
    });

    const result = await response.json();

    if (result.errors || !response.ok) {
      const errorMsg = result.errors?.[0]?.message || "Signup failed.";
      return NextResponse.json({ detail: errorMsg }, { status: 400 });
    }

    // Success! Return the safe data to React
    return NextResponse.json({
      status: result.data.signup.status,
      message: result.data.signup.message
    });

  } catch (error: any) {
    console.error("[SIGNUP PROXY ERROR]:", error.message);
    return NextResponse.json(
      { detail: "Internal Proxy Error. Security team notified." }, 
      { status: 500 }
    );
  }
}