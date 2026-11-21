import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getPortalBasePath,
  normalizeApprovalStatus,
  normalizeGovernanceRole,
} from "@/lib/management-governance";
import {
  buildGovernanceError,
  buildGovernanceResponse,
  extractAdminRefreshToken,
  extractVisitorIP,
  isSameOriginRequest,
} from "@/lib/management-governance-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  // 1. Same-Origin CSRF Guard
  if (!isSameOriginRequest(req)) {
    return buildGovernanceError("FORBIDDEN", "Cross-origin request rejected", 403);
  }

  // 2. Extract HttpOnly Refresh Token
  const refreshToken = await extractAdminRefreshToken(req);
  if (!refreshToken) {
    return buildGovernanceError(
      "UNAUTHORIZED",
      "No active management refresh token found. Please sign in again.",
      401
    );
  }

  const rawBackendUrl = process.env.BACKEND_URL || "https://sliverboy-healher-backend.hf.space";
  const backendBase = rawBackendUrl.replace(/\/graphql$/, "").replace(/\/$/, "");

  const clientIP = extractVisitorIP(req) || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "HealHer-NextJS-Management-Refresh-BFF/1.0";
  const handshakeSecret = process.env.FRONTEND_HANDSHAKE_SECRET || "";

  // 3. Upstream Dispatch to Rust Auth Microservice: POST /api/v1/auth/refresh
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(`${backendBase}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-healher-handshake": handshakeSecret,
        "x-forwarded-for": clientIP,
        "x-real-ip": clientIP,
        "user-agent": userAgent,
      },
      body: JSON.stringify({
        refreshToken,
      }),
      signal: controller.signal,
      cache: "no-store",
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    const isTimeout = err?.name === "AbortError";
    console.error("[MANAGEMENT REFRESH UPSTREAM ERROR]", { isTimeout, errorName: err?.name });
    return buildGovernanceError(
      "SERVICE_UNAVAILABLE",
      isTimeout
        ? "Session refresh timed out. Please try again."
        : "Session service is temporarily unreachable.",
      isTimeout ? 504 : 503
    );
  } finally {
    clearTimeout(timeoutId);
  }

  const cookieStore = await cookies();

  // 4. Handle Invalidation / Revocation (Immediate Session Revocation)
  if (!upstreamResponse.ok) {
    // If upstream rejects the refresh token, destroy both cookies immediately
    cookieStore.delete("admin-access-token");
    cookieStore.delete("admin-refresh-token");

    const errJson = await upstreamResponse.json().catch(() => null);
    const errMsg =
      errJson?.message ||
      errJson?.detail ||
      "Session expired or revoked. Please sign in again.";

    return buildGovernanceError(
      "UNAUTHORIZED",
      errMsg,
      upstreamResponse.status === 403 ? 403 : 401
    );
  }

  const jsonPayload = await upstreamResponse.json().catch(() => null);
  const newAccessToken =
    jsonPayload?.accessToken || jsonPayload?.access_token || jsonPayload?.data?.accessToken;
  const newRefreshToken =
    jsonPayload?.refreshToken || jsonPayload?.refresh_token || jsonPayload?.data?.refreshToken;
  const rawUser = jsonPayload?.user || jsonPayload?.data?.user;

  if (!newAccessToken || !newRefreshToken) {
    cookieStore.delete("admin-access-token");
    cookieStore.delete("admin-refresh-token");
    return buildGovernanceError(
      "UNAUTHORIZED",
      "Invalid rotation payload received from auth service.",
      401
    );
  }

  // 5. Parse and Validate Canonical Management Role
  const jwtPayload = parseJwt(newAccessToken);
  const rawRole =
    rawUser?.role ||
    jwtPayload?.role ||
    rawUser?.dashboard ||
    jwtPayload?.dashboard;

  const canonicalRole = normalizeGovernanceRole(rawRole);
  if (!canonicalRole) {
    cookieStore.delete("admin-access-token");
    cookieStore.delete("admin-refresh-token");
    return buildGovernanceError(
      "FORBIDDEN",
      "Account does not hold a valid management role.",
      403
    );
  }

  const rawStatus =
    rawUser?.approval_status ||
    rawUser?.approvalStatus ||
    jwtPayload?.approval_status ||
    jwtPayload?.approvalStatus ||
    "APPROVED";

  const approvalStatus = normalizeApprovalStatus(rawStatus) || "APPROVED";

  // 6. Rotate HttpOnly Cookies
  const isProduction = process.env.NODE_ENV === "production";

  cookieStore.set({
    name: "admin-access-token",
    value: newAccessToken,
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 15 * 60,
    path: "/",
  });

  cookieStore.set({
    name: "admin-refresh-token",
    value: newRefreshToken,
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  const portalPath =
    approvalStatus === "APPROVED"
      ? getPortalBasePath(canonicalRole)
      : "/management/pending";

  return buildGovernanceResponse(
    {
      status: "success",
      message: "Session refreshed successfully.",
      user: {
        id: rawUser?.id || jwtPayload?.sub,
        email: rawUser?.email,
        fullName: rawUser?.fullName || rawUser?.full_name || "",
        role: canonicalRole,
        approvalStatus,
        portalPath,
      },
    },
    200
  );
}
