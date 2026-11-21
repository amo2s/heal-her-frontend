import { NextRequest, NextResponse } from "next/server";
import {
  validateManagementSignupInput,
  ManagementSignupResult,
} from "@/lib/management-governance";
import {
  buildGovernanceError,
  buildGovernanceResponse,
  extractVisitorIP,
  isSameOriginRequest,
  parseBoundedJsonBody,
} from "@/lib/management-governance-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_SIGNUP_KEYS = new Set([
  "fullName",
  "full_name",
  "email",
  "password",
  "requestedRole",
  "requested_role",
  "botTrap",
  "bot_trap",
  "website",
]);

export async function POST(req: NextRequest) {
  // 1. Same-Origin CSRF Guard
  if (!isSameOriginRequest(req)) {
    return buildGovernanceError("FORBIDDEN", "Cross-origin request rejected", 403);
  }

  // 2. Streamed 16 KB body cap & strict allowlist filtering
  const parsedResult = await parseBoundedJsonBody(req, ALLOWED_SIGNUP_KEYS);
  if (!parsedResult.ok) {
    return parsedResult.errorResponse;
  }

  const rawData = parsedResult.data;

  // 3. Honeypot check (Bot Trap Defense)
  const botTrapValue =
    (typeof rawData.botTrap === "string" && rawData.botTrap.trim()) ||
    (typeof rawData.bot_trap === "string" && rawData.bot_trap.trim()) ||
    (typeof rawData.website === "string" && rawData.website.trim());

  if (botTrapValue) {
    const clientIP = extractVisitorIP(req) || "unknown";
    console.warn(`[MANAGEMENT SIGNUP BOT TRAPPED] IP: ${clientIP}`);
    // Return fake generic 201 so bot does not realize it was trapped
    return buildGovernanceResponse(
      {
        status: "success",
        message: "Management account registered and awaiting approval.",
      },
      201
    );
  }

  // 4. Mirrored Validation
  const validation = validateManagementSignupInput(rawData);
  if (!validation.isValid || !validation.sanitized) {
    return buildGovernanceError(
      "VALIDATION_ERROR",
      "Registration failed validation constraints",
      422,
      validation.fieldErrors
    );
  }

  const sanitized = validation.sanitized;

  // 5. Upstream Dispatch to Rust Auth Microservice
  const rawBackendUrl = process.env.BACKEND_URL || "https://sliverboy-healher-backend.hf.space";
  const backendBase = rawBackendUrl.replace(/\/graphql$/, "").replace(/\/$/, "");
  const targetUrl = `${backendBase}/api/v1/auth/management/signup`;

  const clientIP = extractVisitorIP(req);
  const userAgent = req.headers.get("user-agent") || "HealHer-NextJS-Management-Signup-BFF/1.0";

  const headers = new Headers({
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": userAgent,
  });

  const handshake = process.env.FRONTEND_HANDSHAKE_SECRET;
  if (handshake && handshake.trim() !== "") {
    headers.set("x-healher-handshake", handshake.trim());
  }

  if (clientIP) {
    headers.set("X-Real-IP", clientIP);
    headers.set("X-Forwarded-For", clientIP);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        full_name: sanitized.fullName,
        email: sanitized.email,
        password: sanitized.password,
        requested_role: sanitized.requestedRole,
        bot_trap: "",
      }),
      signal: controller.signal,
      cache: "no-store",
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    const isTimeout = err?.name === "AbortError";
    console.error("[MANAGEMENT SIGNUP UPSTREAM ERROR]", {
      isTimeout,
      errorName: err?.name,
    });
    return buildGovernanceError(
      "SERVICE_UNAVAILABLE",
      isTimeout
        ? "The authentication service timed out. Please try again."
        : "The authentication service is temporarily unreachable.",
      isTimeout ? 504 : 503
    );
  } finally {
    clearTimeout(timeoutId);
  }

  let rawText = "";
  try {
    rawText = await upstreamResponse.text();
    if (rawText.length > 65536) {
      rawText = rawText.substring(0, 65536);
    }
  } catch {
    return buildGovernanceError("SERVICE_UNAVAILABLE", "Failed to read upstream response", 503);
  }

  let jsonPayload: any = null;
  try {
    jsonPayload = JSON.parse(rawText);
  } catch {
    console.warn(`[MANAGEMENT SIGNUP NON-JSON UPSTREAM] status: ${upstreamResponse.status}`);
    return buildGovernanceError(
      "SERVICE_UNAVAILABLE",
      "The authentication service is temporarily unavailable.",
      503
    );
  }

  if (upstreamResponse.status === 201 || upstreamResponse.status === 200) {
    const rawUser = jsonPayload?.data ?? jsonPayload?.user ?? jsonPayload;
    const resultData: ManagementSignupResult = {
      id: rawUser.id,
      fullName: rawUser.full_name ?? rawUser.fullName ?? sanitized.fullName,
      email: rawUser.email ?? sanitized.email,
      role: (rawUser.role ?? sanitized.requestedRole) as any,
      approvalStatus: "PENDING",
    };
    return buildGovernanceResponse(
      {
        status: "success",
        message: "Management account registered and awaiting approval.",
        data: resultData,
      },
      201
    );
  }

  const errorMsg =
    jsonPayload?.message ||
    jsonPayload?.detail ||
    jsonPayload?.error ||
    "Registration failed. Please check your credentials.";

  if (upstreamResponse.status === 409) {
    return buildGovernanceError(
      "CONFLICT",
      "An account with this email already exists",
      409,
      { email: "An account with this email already exists" }
    );
  }

  if (upstreamResponse.status === 422 || upstreamResponse.status === 400) {
    return buildGovernanceError(
      "VALIDATION_ERROR",
      errorMsg,
      upstreamResponse.status,
      jsonPayload?.errors
    );
  }

  return buildGovernanceError(
    "SERVICE_UNAVAILABLE",
    errorMsg,
    upstreamResponse.status >= 500 ? 503 : upstreamResponse.status
  );
}
