import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  buildGovernanceResponse,
  extractAdminAccessToken,
  extractAdminRefreshToken,
  extractVisitorIP,
  isSameOriginRequest,
} from "@/lib/management-governance-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // 1. Same-Origin CSRF Guard
  if (!isSameOriginRequest(req)) {
    return NextResponse.json({ detail: "Cross-origin request rejected" }, { status: 403 });
  }

  // 2. Extract active tokens and optional request body
  const accessToken = await extractAdminAccessToken(req);
  const refreshToken = await extractAdminRefreshToken(req);

  let allDevices = false;
  try {
    const body = await req.json();
    if (body && typeof body.allDevices === "boolean") {
      allDevices = body.allDevices;
    }
  } catch {
    // Body is optional
  }

  // 3. Upstream Dispatch to Rust Auth Microservice: POST /api/v1/auth/logout
  if (accessToken) {
    const rawBackendUrl = process.env.BACKEND_URL || "https://sliverboy-healher-backend.hf.space";
    const backendBase = rawBackendUrl.replace(/\/graphql$/, "").replace(/\/$/, "");

    const clientIP = extractVisitorIP(req) || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "HealHer-NextJS-Management-Logout-BFF/1.0";
    const handshakeSecret = process.env.FRONTEND_HANDSHAKE_SECRET || "";

    const headers = new Headers({
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": userAgent,
    });

    if (handshakeSecret) {
      headers.set("x-healher-handshake", handshakeSecret);
    }
    if (clientIP) {
      headers.set("X-Real-IP", clientIP);
      headers.set("X-Forwarded-For", clientIP);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      await fetch(`${backendBase}/api/v1/auth/logout`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          all_devices: allDevices,
          refresh_token: refreshToken || undefined,
        }),
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timeoutId);
    } catch (err) {
      console.warn("[MANAGEMENT LOGOUT UPSTREAM WARNING]", err);
      // Fail-open for client session cleanup
    }
  }

  // 4. Annihilate HttpOnly Cookies
  const cookieStore = await cookies();
  cookieStore.delete("admin-access-token");
  cookieStore.delete("admin-refresh-token");

  return buildGovernanceResponse(
    {
      status: "success",
      message: "Logged out successfully.",
    },
    200
  );
}
