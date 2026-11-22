import { NextRequest, NextResponse } from "next/server";
import {
  buildGovernanceError,
  buildGovernanceResponse,
  dispatchUnauthenticatedManagementUpstream,
  extractVisitorIP,
  isSameOriginRequest,
  parseBoundedJsonBody,
} from "@/lib/management-governance-server";
import {
  validateManagementResetEmail,
  validateManagementResetOtp,
} from "@/lib/management-governance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Management Password Reset OTP Verification Handler:
 * POST /api/auth/management/password-reset/verify
 *
 * Security Armor:
 * - Same-Origin CSRF validation (403 Forbidden)
 * - 16 KB streamed body limit (413 Payload Too Large)
 * - Strict key allowlist: ["email", "otp", "otpCode"]
 * - Pre-flight email and 6-digit OTP validation (422 Unprocessable Entity)
 * - Server-only x-healher-handshake injection
 * - Visitor IP forwarding
 * - Accurate mapping of 3-strike lockout (ACCOUNT_LOCKED) and invalid OTP (INVALID_OTP)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Same-Origin CSRF Guard
  if (!isSameOriginRequest(request)) {
    return buildGovernanceError("FORBIDDEN", "Cross-origin requests are forbidden", 403);
  }

  // 2. Streamed 16 KB Bounded Body & Strict Key Allowlist
  const allowedKeys = new Set(["email", "otp", "otpCode"]);
  const parseResult = await parseBoundedJsonBody(request, allowedKeys);
  if (!parseResult.ok) {
    return parseResult.errorResponse;
  }

  const raw = parseResult.data;

  // 3. Mirrored Validation
  const emailVal = validateManagementResetEmail(raw.email);
  if (!emailVal.isValid || !emailVal.sanitized) {
    return buildGovernanceError(
      "VALIDATION_ERROR",
      emailVal.error || "Please enter a valid work email address",
      422,
      { email: emailVal.error || "Please enter a valid work email address" }
    );
  }

  const rawOtp = raw.otp || raw.otpCode;
  const otpVal = validateManagementResetOtp(rawOtp);
  if (!otpVal.isValid || !otpVal.sanitized) {
    return buildGovernanceError(
      "VALIDATION_ERROR",
      otpVal.error || "Please enter the complete 6-digit verification code",
      422,
      { otp: otpVal.error || "Please enter the complete 6-digit verification code" }
    );
  }

  // 4. Visitor IP Extraction
  const visitorIP = extractVisitorIP(request);

  // 5. Upstream Dispatch to Rust Auth Microservice
  const upstreamRes = await dispatchUnauthenticatedManagementUpstream({
    path: "/api/v1/auth/management/password-reset/verify",
    method: "POST",
    body: JSON.stringify({
      email: emailVal.sanitized,
      otpCode: otpVal.sanitized,
    }),
    clientIP: visitorIP,
  });

  if (!upstreamRes.ok) {
    return upstreamRes;
  }

  try {
    const upstreamData = await upstreamRes.json();
    const resetToken = upstreamData.resetToken || upstreamData.reset_token;

    if (!resetToken || typeof resetToken !== "string") {
      return buildGovernanceError(
        "INTERNAL_ERROR",
        "Authentication service did not issue an authorization reset token.",
        502
      );
    }

    return buildGovernanceResponse(
      {
        status: "success",
        data: {
          resetToken,
          expiresInSeconds: 300,
          message: upstreamData.message || "Verification code confirmed.",
        },
      },
      200
    );
  } catch (err: any) {
    console.error("[BFF RECOVERY VERIFY PARSE ERROR]", err);
    return buildGovernanceError(
      "INTERNAL_ERROR",
      "Failed to parse verification response.",
      502
    );
  }
}
