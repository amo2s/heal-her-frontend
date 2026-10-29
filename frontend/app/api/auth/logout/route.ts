import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("sb-access-token")?.value;
    const refreshToken = cookieStore.get("sb-refresh-token")?.value;

    // 1. Dual-Mode Flag Parsing
    let allDevices = false;
    try {
      const body = await request.json();
      if (typeof body?.allDevices === "boolean") {
        allDevices = body.allDevices;
      }
    } catch {
      // Non-JSON or empty payload; default to single-device logout
    }

    // 2. Direct REST Bridge to Rust Authentication Microservice
    // If the access token exists, we notify the Rust service to revoke the session
    // and record the jti / global revocation epoch in the L1 memory grid (moka + ahash).
    if (accessToken) {
      const backendBase =
        process.env.RUST_AUTH_URL ||
        (process.env.BACKEND_URL && !process.env.BACKEND_URL.includes("graphql")
          ? process.env.BACKEND_URL
          : "http://127.0.0.1:8080");

      try {
        await fetch(`${backendBase}/api/v1/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            allDevices,
            refreshToken: refreshToken || null,
          }),
        });
      } catch (backendError: any) {
        // Failsafe Shield: If the Rust backend is offline, times out, or errors,
        // log internally and proceed to cookie obliteration. Never trap the user.
        console.error(
          "[PROXY SHIELD] Rust backend unreachable during logout revocation:",
          backendError?.message || backendError
        );
      }
    }

    // 3. Absolute Failsafe Cookie Obliteration (Zero Max-Age Vault Wrench)
    // Unconditionally overwrite and terminate both session cookies.
    const secureEnv = process.env.NODE_ENV === "production";

    cookieStore.set({
      name: "sb-access-token",
      value: "",
      httpOnly: true,
      secure: secureEnv,
      sameSite: "strict",
      maxAge: 0, // Immediate invalidation
      expires: new Date(0), // Epoch 1970
      path: "/",
    });

    cookieStore.set({
      name: "sb-refresh-token",
      value: "",
      httpOnly: true,
      secure: secureEnv,
      sameSite: "strict",
      maxAge: 0, // Immediate invalidation
      expires: new Date(0), // Epoch 1970
      path: "/",
    });

    return NextResponse.json(
      { status: "success", message: "Logged out securely." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[PROXY ERROR] Unhandled exception in logout route:", error?.message || error);

    // Guaranteed failsafe: Even on internal exception, wipe cookies via cookieStore if possible
    try {
      const cookieStore = await cookies();
      const secureEnv = process.env.NODE_ENV === "production";
      cookieStore.set({
        name: "sb-access-token",
        value: "",
        httpOnly: true,
        secure: secureEnv,
        sameSite: "strict",
        maxAge: 0,
        expires: new Date(0),
        path: "/",
      });
      cookieStore.set({
        name: "sb-refresh-token",
        value: "",
        httpOnly: true,
        secure: secureEnv,
        sameSite: "strict",
        maxAge: 0,
        expires: new Date(0),
        path: "/",
      });
    } catch {
      // Ignore fallback cookie wipe failure
    }

    return NextResponse.json(
      { status: "forced_eject", message: "Session terminated via failsafe." },
      { status: 200 }
    );
  }
}
