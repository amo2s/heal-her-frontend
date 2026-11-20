import { NextRequest, NextResponse } from "next/server";
import net from "net";
import {
  ContactErrorCode,
  ContactErrorResponse,
  ContactReceipt,
  ContactTimingConfig,
  mapBackendFieldErrors,
  validateContactInput,
} from "@/lib/contact-intake";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PAYLOAD_BYTES = 16384; // 16 KB strict byte limit
const ALLOWED_KEYS = new Set(["name", "org", "email", "subject", "message", "website"]);

// ============================================================================
// LAYER 1: SECURITY RESPONSE HEADERS HELPER
// ============================================================================

function buildResponse(
  body: ContactReceipt | ContactErrorResponse,
  status: number,
  extraHeaders?: Record<string, string>
): NextResponse {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    ...(extraHeaders || {}),
  });

  return new NextResponse(JSON.stringify(body), {
    status,
    headers,
  });
}

// ============================================================================
// LAYER 2: SAME-ORIGIN / CROSS-SITE ENFORCEMENT
// ============================================================================

function isOriginAllowed(req: NextRequest): boolean {
  const originHeader = req.headers.get("origin");
  const refererHeader = req.headers.get("referer");

  let candidateOrigin = originHeader;
  if (!candidateOrigin && refererHeader) {
    try {
      const parsedReferer = new URL(refererHeader);
      candidateOrigin = parsedReferer.origin;
    } catch {
      return false;
    }
  }

  // If no origin and no referer in production, reject
  if (!candidateOrigin) {
    return process.env.NODE_ENV !== "production";
  }

  let parsedCandidate: URL;
  try {
    parsedCandidate = new URL(candidateOrigin);
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

  // Determine trusted host from Host or X-Forwarded-Host
  const forwardedHost = req.headers.get("x-forwarded-host");
  const hostHeader = req.headers.get("host");
  const expectedHost = (forwardedHost || hostHeader || "").split(",")[0].trim().toLowerCase();

  if (expectedHost && parsedCandidate.host.toLowerCase() === expectedHost) {
    return true;
  }

  // Check explicitly configured environment origins
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
      // Ignore invalid URL in env
    }
  }

  return false;
}

// ============================================================================
// LAYER 5: TRUSTED VISITOR IP EXTRACTION
// ============================================================================

function extractClientIP(req: NextRequest): string | null {
  const candidates: Array<string | null> = [
    req.headers.get("x-vercel-forwarded-for"),
    req.headers.get("cf-connecting-ip"),
    req.headers.get("x-forwarded-for"),
    req.headers.get("x-real-ip"),
  ];

  for (const raw of candidates) {
    if (!raw) continue;
    // Extract leftmost IP if comma-separated
    const leftmost = raw.split(",")[0].trim();
    if (!leftmost) continue;

    // Handle IPv4 with port or IPv6 in brackets
    let clean = leftmost;
    if (clean.startsWith("[") && clean.includes("]")) {
      const endBracket = clean.indexOf("]");
      clean = clean.substring(1, endBracket);
    } else if (clean.includes(":") && !clean.includes("::") && clean.split(":").length === 2) {
      // IPv4:port
      clean = clean.split(":")[0];
    }

    if (net.isIP(clean) !== 0) {
      return clean;
    }
  }

  return null;
}

// ============================================================================
// RETRY-AFTER PARSER
// ============================================================================

function parseRetryAfter(raw: string | null): number {
  if (!raw) return 60;
  const trimmed = raw.trim();

  // 1. Try integer delta seconds
  const numeric = parseInt(trimmed, 10);
  if (!isNaN(numeric) && numeric > 0) {
    return Math.min(numeric, 3600);
  }

  // 2. Try HTTP-date
  const parsedDate = Date.parse(trimmed);
  if (!isNaN(parsedDate)) {
    const diffSec = Math.ceil((parsedDate - Date.now()) / 1000);
    if (diffSec > 0) {
      return Math.min(diffSec, 3600);
    }
  }

  return 60;
}

// ============================================================================
// MAIN POST BFF HANDLER
// ============================================================================

export async function POST(req: NextRequest) {
  // Layer 2: Same-Origin / Cross-Site Request Enforcement
  if (!isOriginAllowed(req)) {
    return buildResponse(
      {
        status: "error",
        code: "FORBIDDEN_ORIGIN",
        message: "Cross-origin submission rejected.",
        fallbackAvailable: false,
      },
      403
    );
  }

  // Layer 3: Strict Content-Type Checking
  const rawContentType = req.headers.get("content-type") || "";
  const mediaType = rawContentType.split(";")[0].trim().toLowerCase();
  if (mediaType !== "application/json") {
    return buildResponse(
      {
        status: "error",
        code: "UNSUPPORTED_MEDIA_TYPE",
        message: "Content-Type must strictly be application/json.",
        fallbackAvailable: false,
      },
      415
    );
  }

  // Layer 3: Two-Stage 16 KB Byte Limit Enforcement
  const contentLengthHeader = req.headers.get("content-length");
  if (contentLengthHeader) {
    const len = parseInt(contentLengthHeader, 10);
    if (!isNaN(len) && len > MAX_PAYLOAD_BYTES) {
      return buildResponse(
        {
          status: "error",
          code: "PAYLOAD_TOO_LARGE",
          message: "Request payload exceeds maximum allowed size of 16 KB.",
          fallbackAvailable: false,
        },
        413
      );
    }
  }

  if (!req.body) {
    return buildResponse(
      {
        status: "error",
        code: "INVALID_REQUEST",
        message: "Request body cannot be empty.",
        fallbackAvailable: false,
      },
      400
    );
  }

  // Stream reader with exact byte accumulation
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        totalBytes += value.byteLength;
        if (totalBytes > MAX_PAYLOAD_BYTES) {
          try {
            await reader.cancel();
          } catch {
            // Ignore cancel errors
          }
          return buildResponse(
            {
              status: "error",
              code: "PAYLOAD_TOO_LARGE",
              message: "Request payload exceeds maximum allowed size of 16 KB.",
              fallbackAvailable: false,
            },
            413
          );
        }
        chunks.push(value);
      }
    }
  } catch (streamErr) {
    console.error("[BFF STREAM READ ERROR]", streamErr);
    return buildResponse(
      {
        status: "error",
        code: "INVALID_REQUEST",
        message: "Failed to read request body stream.",
        fallbackAvailable: false,
      },
      400
    );
  }

  // Decode stream bytes to text
  const concatenated = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    concatenated.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const rawText = new TextDecoder("utf-8").decode(concatenated);

  // Layer 4: Strict JSON Parsing & Plain Object Check
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return buildResponse(
      {
        status: "error",
        code: "INVALID_REQUEST",
        message: "Invalid JSON payload.",
        fallbackAvailable: false,
      },
      400
    );
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return buildResponse(
      {
        status: "error",
        code: "INVALID_REQUEST",
        message: "Request payload must be a JSON object.",
        fallbackAvailable: false,
      },
      400
    );
  }

  const payloadObj = parsed as Record<string, unknown>;

  // Allowlist-Only Field Filtering (Matching Go DisallowUnknownFields)
  for (const key of Object.keys(payloadObj)) {
    if (!ALLOWED_KEYS.has(key)) {
      return buildResponse(
        {
          status: "error",
          code: "INVALID_REQUEST",
          message: `Unknown property detected in request payload: ${key}`,
          fallbackAvailable: false,
        },
        400
      );
    }
  }

  // Verify all present fields are strings
  for (const [key, value] of Object.entries(payloadObj)) {
    if (typeof value !== "string") {
      return buildResponse(
        {
          status: "error",
          code: "INVALID_REQUEST",
          message: `Field '${key}' must be a string value.`,
          fallbackAvailable: false,
        },
        400
      );
    }
  }

  const clientIP = extractClientIP(req);

  // Honeypot Short-Circuit
  const rawWebsite = typeof payloadObj.website === "string" ? payloadObj.website.trim() : "";
  if (rawWebsite.length > 0) {
    console.warn(`[CONTACT BOT TRAPPED] Intercepted honeypot bot from IP: ${clientIP || "unknown"}`);

    const fakeId = crypto.randomUUID();
    const fakeRef = `REF-${fakeId.replace(/-/g, "").substring(0, 8).toUpperCase()}`;

    return buildResponse(
      {
        status: "success",
        inquiryId: fakeId,
        referenceCode: fakeRef,
        ticketStatus: "OPEN",
        message: "Your inquiry has been securely received. A confirmation has been dispatched to your email.",
      },
      201
    );
  }

  // Edge Validation Check
  const { isValid, sanitized, fieldErrors } = validateContactInput(payloadObj);
  if (!isValid) {
    return buildResponse(
      {
        status: "error",
        code: "VALIDATION_ERROR",
        message: "Validation failed on one or more submitted fields.",
        fieldErrors,
        fallbackAvailable: false,
      },
      422
    );
  }

  // Layer 6: Isolated Upstream Dispatch to Hugging Face Go Microservice
  const rawBackendUrl = process.env.BACKEND_URL || "https://sliverboy-healher-backend.hf.space";
  const backendBase = rawBackendUrl.replace(/\/$/, "");
  const targetUrl = `${backendBase}/api/v1/inquiries`;

  const forwardHeaders = new Headers({
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": "HealHer-NextJS-Contact-BFF/1.0",
  });

  if (clientIP) {
    forwardHeaders.set("X-Real-IP", clientIP);
    forwardHeaders.set("X-Forwarded-For", clientIP);
  }

  const forwardBody = JSON.stringify({
    name: sanitized.name,
    org: sanitized.org,
    email: sanitized.email,
    subject: sanitized.subject,
    message: sanitized.message,
    website: "",
  });

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, ContactTimingConfig.bffTimeoutMs);

  let upstreamResponse: Response;

  try {
    upstreamResponse = await fetch(targetUrl, {
      method: "POST",
      headers: forwardHeaders,
      body: forwardBody,
      signal: abortController.signal,
      cache: "no-store",
      redirect: "error",
    });
  } catch (fetchErr: any) {
    clearTimeout(timeoutId);

    const isTimeout = fetchErr?.name === "AbortError";
    console.error("[BFF UPSTREAM NETWORK ERROR]", {
      isTimeout,
      errorName: fetchErr?.name,
      message: fetchErr?.message,
    });

    return buildResponse(
      {
        status: "error",
        code: "SERVICE_UNAVAILABLE",
        message: isTimeout
          ? "Our inquiry gateway timed out. Please try again or use our fallback channels below."
          : "Our secure inquiry system is temporarily unreachable. Please use our fallback channels below.",
        fallbackAvailable: true,
      },
      isTimeout ? 504 : 503
    );
  } finally {
    clearTimeout(timeoutId);
  }

  // Layer 7: Upstream Response Normalization & Outage Shielding
  const upstreamStatus = upstreamResponse.status;

  // Safely read response text bounded to 32 KB
  let responseText = "";
  try {
    responseText = await upstreamResponse.text();
    if (responseText.length > 32768) {
      responseText = responseText.substring(0, 32768);
    }
  } catch (readErr) {
    console.error("[BFF UPSTREAM READ ERROR]", readErr);
    return buildResponse(
      {
        status: "error",
        code: "SERVICE_UNAVAILABLE",
        message: "Failed to read upstream gateway response. Please use our fallback channels below.",
        fallbackAvailable: true,
      },
      503
    );
  }

  let jsonPayload: any = null;
  try {
    jsonPayload = JSON.parse(responseText);
  } catch {
    // Non-JSON responses (e.g. Hugging Face 502/503 HTML error pages)
    console.warn(`[BFF UPSTREAM NON-JSON RESPONSE] status: ${upstreamStatus}`);
    return buildResponse(
      {
        status: "error",
        code: "SERVICE_UNAVAILABLE",
        message: "The inquiry service is temporarily unavailable. Please use our fallback channels below.",
        fallbackAvailable: true,
      },
      503
    );
  }

  // 1. HTTP 201 Created (or 200)
  if (upstreamStatus === 201 || upstreamStatus === 200) {
    return buildResponse(
      {
        status: "success",
        inquiryId: jsonPayload?.inquiry_id || jsonPayload?.inquiryId || "",
        referenceCode: jsonPayload?.reference_code || jsonPayload?.referenceCode || "",
        ticketStatus: jsonPayload?.ticket_status || jsonPayload?.ticketStatus || "OPEN",
        message:
          jsonPayload?.message ||
          "Your inquiry has been securely received. A confirmation has been dispatched to your email.",
      },
      201
    );
  }

  // 2. HTTP 422 Unprocessable Entity
  if (upstreamStatus === 422) {
    const rawErrors = jsonPayload?.errors || jsonPayload?.details;
    const mapped = mapBackendFieldErrors(rawErrors);
    return buildResponse(
      {
        status: "error",
        code: "VALIDATION_ERROR",
        message: jsonPayload?.message || "Validation failed on one or more submitted fields.",
        fieldErrors: mapped,
        fallbackAvailable: false,
      },
      422
    );
  }

  // 3. HTTP 429 Too Many Requests
  if (upstreamStatus === 429) {
    const retryHeader = upstreamResponse.headers.get("retry-after");
    const retrySec = parseRetryAfter(retryHeader);

    return buildResponse(
      {
        status: "error",
        code: "RATE_LIMITED",
        message: `Too many inquiries submitted. Please wait ${retrySec} seconds before trying again.`,
        retryAfterSeconds: retrySec,
        fallbackAvailable: false,
      },
      429,
      { "Retry-After": String(retrySec) }
    );
  }

  // 4. HTTP 400 Bad Request
  if (upstreamStatus === 400) {
    return buildResponse(
      {
        status: "error",
        code: "INVALID_REQUEST",
        message: jsonPayload?.message || "Invalid request payload.",
        fallbackAvailable: false,
      },
      400
    );
  }

  // 5. HTTP 413 Payload Too Large
  if (upstreamStatus === 413) {
    return buildResponse(
      {
        status: "error",
        code: "PAYLOAD_TOO_LARGE",
        message: jsonPayload?.message || "Request payload exceeds maximum allowed size of 16 KB.",
        fallbackAvailable: false,
      },
      413
    );
  }

  // 6. HTTP 415 Unsupported Media Type
  if (upstreamStatus === 415) {
    return buildResponse(
      {
        status: "error",
        code: "UNSUPPORTED_MEDIA_TYPE",
        message: jsonPayload?.message || "Content-Type must be application/json.",
        fallbackAvailable: false,
      },
      415
    );
  }

  // 7. Fallback for 5xx or unhandled status codes
  console.error(`[BFF UPSTREAM ERROR STATUS] status: ${upstreamStatus}`);
  return buildResponse(
    {
      status: "error",
      code: "SERVICE_UNAVAILABLE",
      message: "The inquiry service is temporarily unavailable. Please use our fallback channels below.",
      fallbackAvailable: true,
    },
    503
  );
}
