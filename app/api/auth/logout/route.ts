import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("sb-refresh-token")?.value;

    // 1. Proactive Harvest & Anti-Spoofing
    // If the token is already gone from the browser, we just skip the backend 
    // network call but still enforce the local wipe to be safe.
    if (refreshToken) {
      const backendUrl = process.env.BACKEND_URL || "https://sliverboy-healher-backend.hf.space/graphql";
      
      // 2. Forwarded Network Telemetry Handshake
      const forwardedFor = request.headers.get("x-forwarded-for");
      const realIp = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";

      const query = `
        mutation LogoutMutation($refreshToken: String!) {
          logout(refreshToken: $refreshToken) {
            status
            message
            revokedAt
          }
        }
      `;

      try {
        // We do not await this heavily or block the user if the backend is slow.
        // We trigger the revocation and let the backend circuit breaker handle its own state.
        await fetch(backendUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-healher-handshake": process.env.NEXT_PUBLIC_HANDSHAKE_SECRET || "",
            "x-forwarded-for": realIp,
          },
          body: JSON.stringify({
            query,
            variables: { refreshToken },
          }),
        });
      } catch (backendError: any) {
        // 3. Deterministic Graceful Blast Shield
        // If the backend drops, we log the failure internally but DO NOT trap the user.
        console.error("[PROXY SHIELD] Backend failed during logout revocation:", backendError.message);
      }
    }

    // 4. Absolute Cookie Obliteration (The Zero Max-Age Vault Wrench)
    // We explicitly overwrite both tokens to empty values with immediate expiration.
    const secureEnv = process.env.NODE_ENV === "production";

    cookieStore.set({
      name: "sb-access-token",
      value: "",
      httpOnly: true,
      secure: secureEnv,
      sameSite: "strict",
      maxAge: 0, // Instant death
      expires: new Date(0), // January 1, 1970
      path: "/",
    });

    cookieStore.set({
      name: "sb-refresh-token",
      value: "",
      httpOnly: true,
      secure: secureEnv,
      sameSite: "strict",
      maxAge: 0, // Instant death
      expires: new Date(0), // January 1, 1970
      path: "/",
    });

    // Return a clean, uniform success response to the client UI
    return NextResponse.json({
      status: "revoked",
      message: "Session securely terminated and local vault cleared.",
    }, { status: 200 });

  } catch (error: any) {
    console.error("[PROXY ERROR]: Unhandled exception in logout route:", error.message);
    
    // Even in a catastrophic proxy failure, return 200 to ensure the UI proceeds to the login screen
    return NextResponse.json(
      { status: "forced_eject", message: "Session terminated via failsafe." }, 
      { status: 200 }
    );
  }
}