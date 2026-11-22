import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  buildGovernanceError,
  buildGovernanceResponse,
  dispatchUnauthenticatedManagementUpstream,
  expireAdminSessionCookies,
  extractVisitorIP,
  isSameOriginRequest,
  parseBoundedJsonBody,
} from "@/lib/management-governance-server";
import { validateManagementResetConfirmInput } from "@/lib/management-governance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Management Password Reset Confirmation Handler:
 * POST /api/auth/management/password-reset/confirm
 *
 * Security Armor:
 * - Same-Origin CSRF validation (403 Forbidden)
 * - 16 KB streamed body limit (413 Payload Too Large)
 * - Strict key allowlist: ["email", "resetToken", "reset_token", "newPassword", "new_password", "confirmPassword", "confirm_password"]
 * - Pre-flight password complexity & matching check (422 Unprocessable Entity)
 * - Server-only x-healher-handshake injection
 * - Visitor IP forwarding
 * - Proactive Stale Cookie Purge on Success (expires admin-access-token & admin-refresh-token)
 * - Clean error mapping: TOKEN_EXPIRED (401), FORBIDDEN (403), VALIDATION_ERROR (400/422)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Same-Origin CSRF Guard
  if (!isSameOriginRequest(request)) {
    return buildGovernanceError("FORBIDDEN", "Cross-origin requests are forbidden", 403);
  }

  // 2. Streamed 16 KB Bounded Body & Strict Key Allowlist
  const allowedKeys = new Set([
    "email",
    "resetToken",
    "reset_token",
    "newPassword",
    "new_password",
    "confirmPassword",
    "confirm_password",
  ]);
  const parseResult = await parseBoundedJsonBody(request, allowedKeys);
  if (!parseResult.ok) {
    return parseResult.errorResponse;
  }

  const raw = parseResult.data;

  // 3. Mirrored Validation
  const validation = validateManagementResetConfirmInput(raw);
  if (!validation.isValid || !validation.sanitized) {
    return buildGovernanceError(
      "VALIDATION_ERROR",
      validation.error || "Password confirmation validation failed",
      422,
      validation.fieldErrors
    );
  }

  // 4. Visitor IP Extraction
  const visitorIP = extractVisitorIP(request);

  // 5. Upstream Dispatch to Rust Auth Microservice
  const upstreamRes = await dispatchUnauthenticatedManagementUpstream({
    path: "/api/v1/auth/management/password-reset/confirm",
    method: "POST",
    body: JSON.stringify({
      resetToken: validation.sanitized.resetToken,
      newPassword: validation.sanitized.newPassword,
      confirmPassword: validation.sanitized.newPassword,
    }),
    clientIP: visitorIP,
  });

  if (!upstreamRes.ok) {
    return upstreamRes;
  }

  // 6. Proactive Stale Cookie Purge on Success (HTTP 200)
  try {
    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === "production";
    cookieStore.set({
      name: "admin-access-token",
      value: "",
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 0,
      expires: new Date(0),
      path: "/",
    });
    cookieStore.set({
      name: "admin-refresh-token",
      value: "",
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 0,
      expires: new Date(0),
      path: "/",
    });
  } catch (cookieErr) {
    // Non-fatal if invoked outside standard render cycle
    console.warn("[CONFIRM RESET COOKIE PURGE NON-FATAL]", cookieErr);
  }

  let message = "Password securely updated.";
  try {
    const upstreamData = await upstreamRes.json();
    if (upstreamData.message) {
      message = upstreamData.message;
    }
  } catch {
    // Default message
  }

  const response = buildGovernanceResponse(
    {
      status: "success",
      data: {
        message,
        sessionsRevoked: true,
      },
    },
    200
  );

  // Ensure Set-Cookie headers are also attached directly to response headers
  expireAdminSessionCookies(response);

  return response;
}
