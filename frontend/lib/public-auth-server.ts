import { NextRequest, NextResponse } from "next/server";
import { validatePasswordEntropy } from "./management-governance";

export const MAX_PUBLIC_AUTH_PAYLOAD_BYTES = 16384; // 16 KB strict byte limit
export const UPSTREAM_AUTH_TIMEOUT_MS = 12000; // 12 seconds upstream timeout

export const PUBLIC_AUTH_SECURITY_HEADERS: Record<string, string> = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  "Pragma": "no-cache",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

/**
 * Builds a standardized JSON response for public auth endpoints with security headers.
 */
export function buildPublicAuthResponse(
  body: unknown,
  status: number,
  extraHeaders?: Record<string, string>
): NextResponse {
  const headers = new Headers({
    ...PUBLIC_AUTH_SECURITY_HEADERS,
    ...(extraHeaders || {}),
  });

  return new NextResponse(JSON.stringify(body), {
    status,
    headers,
  });
}

/**
 * Builds a standardized error response for public auth endpoints with security headers.
 */
export function buildPublicAuthError(
  message: string,
  status: number,
  fieldErrors?: Record<string, string>
): NextResponse {
  const errPayload = {
    detail: message,
    ...(fieldErrors ? { fieldErrors } : {}),
  };
  return buildPublicAuthResponse(errPayload, status);
}

/**
 * Same-Origin CSRF Guard for public auth API mutation routes.
 */
export function isSameOriginPublicRequest(req: Request | NextRequest): boolean {
  const originHeader = req.headers.get("origin");
  const refererHeader = req.headers.get("referer");

  let candidate = originHeader;
  if (!candidate && refererHeader) {
    try {
      const parsedReferer = new URL(refererHeader);
      candidate = parsedReferer.origin;
    } catch {
      return false;
    }
  }

  // If no origin or referer present, permit only in development
  if (!candidate) {
    return process.env.NODE_ENV !== "production";
  }

  let parsedCandidate: URL;
  try {
    parsedCandidate = new URL(candidate);
  } catch {
    return false;
  }

  // Development localhost allowlist
  if (process.env.NODE_ENV !== "production") {
    const host = parsedCandidate.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return true;
    }
  }

  // Compare against Host / X-Forwarded-Host
  const forwardedHost = req.headers.get("x-forwarded-host");
  const hostHeader = req.headers.get("host");
  const expectedHost = (forwardedHost || hostHeader || "").split(",")[0].trim().toLowerCase();

  if (expectedHost && parsedCandidate.host.toLowerCase() === expectedHost) {
    return true;
  }

  // Compare against configured environment origins
  const trustedEnvOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ].filter(Boolean) as string[];

  for (const envOrigin of trustedEnvOrigins) {
    try {
      const parsedEnv = new URL(envOrigin);
      if (parsedEnv.origin.toLowerCase() === parsedCandidate.origin.toLowerCase()) {
        return true;
      }
    } catch {
      // Ignore invalid URL
    }
  }

  return false;
}

/**
 * Parses and validates an incoming JSON request body with:
 * - Content-Type validation (must be application/json)
 * - 16 KB strict byte stream limit
 * - Strict key allowlist check (rejects unexpected fields)
 */
export async function parseBoundedPublicJsonBody(
  req: Request | NextRequest,
  allowedKeys?: Set<string>,
  allowEmpty = false
): Promise<
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; errorResponse: NextResponse }
> {
  const rawContentType = req.headers.get("content-type") || "";
  const mediaType = rawContentType.split(";")[0].trim().toLowerCase();

  // If allowEmpty is true and body is empty/non-json, handle gracefully
  const contentLengthHeader = req.headers.get("content-length");
  if (allowEmpty && (!rawContentType || contentLengthHeader === "0")) {
    return { ok: true, data: {} };
  }

  if (mediaType !== "application/json") {
    return {
      ok: false,
      errorResponse: buildPublicAuthError(
        "Content-Type must strictly be application/json",
        415
      ),
    };
  }

  if (contentLengthHeader) {
    const len = parseInt(contentLengthHeader, 10);
    if (!isNaN(len) && len > MAX_PUBLIC_AUTH_PAYLOAD_BYTES) {
      return {
        ok: false,
        errorResponse: buildPublicAuthError(
          "Request payload exceeds maximum allowed size of 16 KB",
          413
        ),
      };
    }
  }

  if (!req.body) {
    if (allowEmpty) {
      return { ok: true, data: {} };
    }
    return {
      ok: false,
      errorResponse: buildPublicAuthError("Request body cannot be empty", 400),
    };
  }

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        totalBytes += value.byteLength;
        if (totalBytes > MAX_PUBLIC_AUTH_PAYLOAD_BYTES) {
          try {
            await reader.cancel();
          } catch {
            // Ignore cancel errors
          }
          return {
            ok: false,
            errorResponse: buildPublicAuthError(
              "Request payload exceeds maximum allowed size of 16 KB",
              413
            ),
          };
        }
        chunks.push(value);
      }
    }
  } catch (streamError) {
    return {
      ok: false,
      errorResponse: buildPublicAuthError(
        `Failed to read request body stream: ${streamError instanceof Error ? streamError.message : "Unknown error"}`,
        400
      ),
    };
  }

  if (chunks.length === 0) {
    if (allowEmpty) {
      return { ok: true, data: {} };
    }
    return {
      ok: false,
      errorResponse: buildPublicAuthError("Request body cannot be empty", 400),
    };
  }

  const concatenated = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    concatenated.set(chunk, offset);
    offset += chunk.byteLength;
  }

  const text = new TextDecoder("utf-8").decode(concatenated);
  if (!text.trim() && allowEmpty) {
    return { ok: true, data: {} };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return {
      ok: false,
      errorResponse: buildPublicAuthError("Malformed JSON payload", 400),
    };
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      ok: false,
      errorResponse: buildPublicAuthError("Request body must be a valid JSON object", 400),
    };
  }

  const record = parsed as Record<string, unknown>;

  // Strict key allowlist check
  if (allowedKeys) {
    for (const key of Object.keys(record)) {
      if (!allowedKeys.has(key)) {
        return {
          ok: false,
          errorResponse: buildPublicAuthError(`Unexpected field: ${key}`, 400),
        };
      }
    }
  }

  return { ok: true, data: record };
}

/**
 * Extracts the real visitor's IP address from proxy headers.
 */
export function extractVisitorIP(req: Request | NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0].trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp && realIp.trim()) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

export { validatePasswordEntropy };
