import { cookies } from "next/headers";
import {
  buildPublicAuthError,
  buildPublicAuthResponse,
  isSameOriginPublicRequest,
  parseBoundedPublicJsonBody,
  UPSTREAM_AUTH_TIMEOUT_MS,
} from "@/lib/public-auth-server";

export async function POST(request: Request) {
  try {
    // 1. Same-Origin CSRF Guard (SEC-006)
    if (!isSameOriginPublicRequest(request)) {
      return buildPublicAuthError("Cross-origin requests are forbidden.", 403);
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("sb-access-token")?.value;
    const refreshToken = cookieStore.get("sb-refresh-token")?.value;

    // 2. Streamed 16 KB Bounded Body & Strict Key Allowlist (allow empty payload for logout)
    const allowedKeys = new Set(["allDevices", "all_devices", "refreshToken", "refresh_token"]);
    const parseResult = await parseBoundedPublicJsonBody(request, allowedKeys, true);

    let allDevices = false;
    let requestRefreshToken = refreshToken;

    if (parseResult.ok && parseResult.data) {
      const body = parseResult.data;
      if (typeof body.allDevices === "boolean") {
        allDevices = body.allDevices;
      } else if (typeof body.all_devices === "boolean") {
        allDevices = body.all_devices;
      }

      if (typeof body.refreshToken === "string" && body.refreshToken.trim()) {
        requestRefreshToken = body.refreshToken.trim();
      } else if (typeof body.refresh_token === "string" && body.refresh_token.trim()) {
        requestRefreshToken = body.refresh_token.trim();
      }
    } else if (!parseResult.ok) {
      return parseResult.errorResponse;
    }

    // 3. Direct REST Bridge to Rust Authentication Microservice: POST /api/v1/auth/logout
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
            "x-healher-handshake": process.env.FRONTEND_HANDSHAKE_SECRET || "",
          },
          body: JSON.stringify({
            allDevices,
            refreshToken: requestRefreshToken || null,
          }),
          signal: AbortSignal.timeout(UPSTREAM_AUTH_TIMEOUT_MS),
        });
      } catch (backendError: any) {
        // Failsafe Shield: If the backend is offline or times out, proceed to cookie obliteration
        console.error(
          "[PROXY SHIELD] Rust backend unreachable during logout revocation:",
          backendError?.message || backendError
        );
      }
    }

    // 4. Absolute Failsafe Cookie Obliteration (Zero Max-Age Vault Wrench)
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

    return buildPublicAuthResponse(
      { status: "success", message: "Logged out securely." },
      200
    );
  } catch (error: any) {
    console.error("[PROXY ERROR] Unhandled exception in logout route:", error?.message || error);

    // Guaranteed failsafe: wipe cookies on exception
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

    return buildPublicAuthResponse(
      { status: "forced_eject", message: "Session terminated via failsafe." },
      200
    );
  }
}
