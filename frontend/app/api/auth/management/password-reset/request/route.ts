import { NextRequest, NextResponse } from "next/server";
import {
  buildGovernanceError,
  buildGovernanceResponse,
  dispatchUnauthenticatedManagementUpstream,
  extractVisitorIP,
  isSameOriginRequest,
  parseBoundedJsonBody,
} from "@/lib/management-governance-server";
import { validateManagementResetEmail } from "@/lib/management-governance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Management Password Reset OTP Request Handler:
 * POST /api/auth/management/password-reset/request
 *
 * Security Armor:
 * - Same-Origin CSRF validation (403 Forbidden)
 * - 16 KB streamed body limit (413 Payload Too Large)
 * - Strict key allowlist: ["email", "botTrap", "bot_trap"]
 * - Stealth Honeypot: non-empty botTrap returns 200 OK without upstream call
 * - Pre-flight email RFC & sanitization (422 Unprocessable Entity)
 * - Server-only x-healher-handshake injection
 * - Visitor IP forwarding for Rust sliding-window rate limiting
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Same-Origin CSRF Guard
  if (!isSameOriginRequest(request)) {
    return buildGovernanceError("FORBIDDEN", "Cross-origin requests are forbidden", 403);
  }

  // 2. Streamed 16 KB Bounded Body & Strict Key Allowlist
  const allowedKeys = new Set(["email", "botTrap", "bot_trap"]);
  const parseResult = await parseBoundedJsonBody(request, allowedKeys);
  if (!parseResult.ok) {
    return parseResult.errorResponse;
  }

  const raw = parseResult.data;

  // 3. Stealth Honeypot Trap
  const botTrap = raw.botTrap || raw.bot_trap;
  if (typeof botTrap === "string" && botTrap.trim() !== "") {
    // Silently return neutral success message without calling upstream
    return buildGovernanceResponse(
      {
        status: "success",
        data: {
          message: "If an eligible account exists for this email, a verification code has been sent.",
        },
      },
      200
    );
  }

  // 4. Mirrored Client/Edge Email Validation
  const emailVal = validateManagementResetEmail(raw.email);
  if (!emailVal.isValid || !emailVal.sanitized) {
    return buildGovernanceError(
      "VALIDATION_ERROR",
      emailVal.error || "Please enter a valid work email address",
      422,
      { email: emailVal.error || "Please enter a valid work email address" }
    );
  }

  // 5. Visitor IP Extraction
  const visitorIP = extractVisitorIP(request);

  // 6. Upstream Dispatch to Rust Auth Microservice
  const upstreamRes = await dispatchUnauthenticatedManagementUpstream({
    path: "/api/v1/auth/management/password-reset/request",
    method: "POST",
    body: JSON.stringify({ email: emailVal.sanitized }),
    clientIP: visitorIP,
  });

  if (!upstreamRes.ok) {
    return upstreamRes;
  }

  try {
    const upstreamData = await upstreamRes.json();
    return buildGovernanceResponse(
      {
        status: "success",
        data: {
          message:
            upstreamData.message ||
            "If an eligible account exists for this email, a verification code has been sent.",
        },
      },
      200
    );
  } catch {
    return buildGovernanceResponse(
      {
        status: "success",
        data: {
          message: "If an eligible account exists for this email, a verification code has been sent.",
        },
      },
      200
    );
  }
}
