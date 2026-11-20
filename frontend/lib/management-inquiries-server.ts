import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import net from "net";
import {
  InquiryDetail,
  InquiryDetailHeader,
  InquiryListData,
  InquiryMessageItem,
  InquiryStats,
  InquirySummary,
  ManagementInquiryError,
  ManagementInquiryErrorCode,
} from "./management-inquiries";

const MAX_PAYLOAD_BYTES = 16384; // 16 KB strict byte limit

// ============================================================================
// 1. SECURITY RESPONSE BUILDER
// ============================================================================

export function buildManagementResponse(
  body: unknown,
  status: number,
  extraHeaders?: Record<string, string>
): NextResponse {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, no-cache, must-revalidate, private",
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

export function buildManagementError(
  code: ManagementInquiryErrorCode,
  message: string,
  status: number,
  fieldErrors?: Record<string, string>
): NextResponse {
  const errPayload: ManagementInquiryError = {
    status: "error",
    code,
    message,
    ...(fieldErrors ? { fieldErrors } : {}),
  };
  return buildManagementResponse(errPayload, status);
}

// ============================================================================
// 2. HTTPONLY COOKIE EXTRACTION
// ============================================================================

export async function extractAdminAccessToken(req?: NextRequest): Promise<string | null> {
  // 1. Try NextRequest cookies map if provided
  if (req) {
    const fromReq = req.cookies.get("admin-access-token")?.value;
    if (fromReq && fromReq.trim() !== "") {
      return fromReq.trim();
    }
  }

  // 2. Fallback to next/headers cookies() store inside server context
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("admin-access-token");
    if (tokenCookie && tokenCookie.value && tokenCookie.value.trim() !== "") {
      return tokenCookie.value.trim();
    }
  } catch {
    // Handled gracefully when invoked outside active Next.js render cycle
  }

  return null;
}

// ============================================================================
// 3. SAME-ORIGIN CSRF GUARD FOR MUTATIONS
// ============================================================================

export function isSameOriginRequest(req: NextRequest): boolean {
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

// ============================================================================
// 4. STREAMED 16 KB BODY CAP & STRICT ALLOWLIST PARSER
// ============================================================================

export async function parseBoundedJsonBody(
  req: NextRequest,
  allowedKeys: Set<string>
): Promise<
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; errorResponse: NextResponse }
> {
  // 1. Content-Type check
  const rawContentType = req.headers.get("content-type") || "";
  const mediaType = rawContentType.split(";")[0].trim().toLowerCase();
  if (mediaType !== "application/json") {
    return {
      ok: false,
      errorResponse: buildManagementError(
        "UNSUPPORTED_MEDIA_TYPE",
        "Content-Type must strictly be application/json",
        415
      ),
    };
  }

  // 2. Content-Length header check
  const contentLengthHeader = req.headers.get("content-length");
  if (contentLengthHeader) {
    const len = parseInt(contentLengthHeader, 10);
    if (!isNaN(len) && len > MAX_PAYLOAD_BYTES) {
      return {
        ok: false,
        errorResponse: buildManagementError(
          "PAYLOAD_TOO_LARGE",
          "Request payload exceeds maximum allowed size of 16 KB",
          413
        ),
      };
    }
  }

  if (!req.body) {
    return {
      ok: false,
      errorResponse: buildManagementError(
        "INVALID_REQUEST",
        "Request body cannot be empty",
        400
      ),
    };
  }

  // 3. Incremental stream byte reading
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
          return {
            ok: false,
            errorResponse: buildManagementError(
              "PAYLOAD_TOO_LARGE",
              "Request payload exceeds maximum allowed size of 16 KB",
              413
            ),
          };
        }
        chunks.push(value);
      }
    }
  } catch (streamErr) {
    console.error("[MANAGEMENT BFF STREAM READ ERROR]", streamErr);
    return {
      ok: false,
      errorResponse: buildManagementError(
        "INVALID_REQUEST",
        "Failed to read request body stream",
        400
      ),
    };
  }

  const concatenated = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    concatenated.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const rawText = new TextDecoder("utf-8").decode(concatenated);

  // 4. Safe JSON parse
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return {
      ok: false,
      errorResponse: buildManagementError(
        "INVALID_REQUEST",
        "Malformed or invalid JSON payload",
        400
      ),
    };
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      ok: false,
      errorResponse: buildManagementError(
        "INVALID_REQUEST",
        "Request payload must be a JSON object",
        400
      ),
    };
  }

  const payloadObj = parsed as Record<string, unknown>;

  // 5. Allowlist-Only Field Filtering
  for (const key of Object.keys(payloadObj)) {
    if (!allowedKeys.has(key)) {
      return {
        ok: false,
        errorResponse: buildManagementError(
          "INVALID_REQUEST",
          `Unknown property detected in request payload: ${key}`,
          400
        ),
      };
    }
  }

  return { ok: true, data: payloadObj };
}

// ============================================================================
// 5. VISITOR IP EXTRACTION
// ============================================================================

export function extractVisitorIP(req: NextRequest): string | null {
  const candidates = [
    req.headers.get("x-vercel-forwarded-for"),
    req.headers.get("cf-connecting-ip"),
    req.headers.get("x-forwarded-for"),
    req.headers.get("x-real-ip"),
  ];

  for (const raw of candidates) {
    if (!raw) continue;
    const leftmost = raw.split(",")[0].trim();
    if (!leftmost) continue;

    let clean = leftmost;
    if (clean.startsWith("[") && clean.includes("]")) {
      clean = clean.substring(1, clean.indexOf("]"));
    } else if (clean.includes(":") && !clean.includes("::") && clean.split(":").length === 2) {
      clean = clean.split(":")[0];
    }

    if (net.isIP(clean) !== 0) {
      return clean;
    }
  }

  return null;
}

// ============================================================================
// 6. AUTHENTICATED UPSTREAM DISPATCH & OUTAGE SHIELDING
// ============================================================================

export interface UpstreamDispatchOptions {
  path: string; // e.g. "/api/v1/inquiries/stats" or "/api/v1/inquiries"
  method?: "GET" | "POST" | "PATCH";
  body?: string;
  clientIP?: string | null;
  token: string;
}

export async function dispatchAuthenticatedUpstream(
  opts: UpstreamDispatchOptions
): Promise<NextResponse> {
  const rawBackendUrl = process.env.BACKEND_URL || "https://sliverboy-healher-backend.hf.space";
  const backendBase = rawBackendUrl.replace(/\/$/, "");
  const targetUrl = `${backendBase}${opts.path.startsWith("/") ? opts.path : `/${opts.path}`}`;

  const headers = new Headers({
    Authorization: `Bearer ${opts.token}`,
    Accept: "application/json",
    "User-Agent": "HealHer-NextJS-Management-BFF/1.0",
  });

  const handshake = process.env.FRONTEND_HANDSHAKE_SECRET;
  if (handshake && handshake.trim() !== "") {
    headers.set("x-healher-handshake", handshake.trim());
  }

  if (opts.clientIP) {
    headers.set("X-Real-IP", opts.clientIP);
    headers.set("X-Forwarded-For", opts.clientIP);
  }

  if (opts.body) {
    headers.set("Content-Type", "application/json");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(targetUrl, {
      method: opts.method || "GET",
      headers,
      body: opts.body,
      signal: controller.signal,
      cache: "no-store",
      redirect: "error",
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    const isTimeout = err?.name === "AbortError";
    console.error("[MANAGEMENT BFF UPSTREAM ERROR]", {
      isTimeout,
      path: opts.path,
      method: opts.method || "GET",
      errorName: err?.name,
    });
    return buildManagementError(
      "SERVICE_UNAVAILABLE",
      isTimeout
        ? "The inquiry service timed out. Please try again."
        : "The inquiry service is temporarily unreachable.",
      isTimeout ? 504 : 503
    );
  } finally {
    clearTimeout(timeoutId);
  }

  const status = upstreamResponse.status;

  // Safely read response text bounded to 64 KB
  let rawText = "";
  try {
    rawText = await upstreamResponse.text();
    if (rawText.length > 65536) {
      rawText = rawText.substring(0, 65536);
    }
  } catch (readErr) {
    console.error("[MANAGEMENT BFF READ ERROR]", readErr);
    return buildManagementError("SERVICE_UNAVAILABLE", "Failed to read upstream response", 503);
  }

  let jsonPayload: any = null;
  try {
    jsonPayload = JSON.parse(rawText);
  } catch {
    // Non-JSON responses (HTML 502/503 error pages from Hugging Face / Nginx)
    console.warn(`[MANAGEMENT BFF NON-JSON UPSTREAM] status: ${status}, path: ${opts.path}`);
    return buildManagementError(
      "SERVICE_UNAVAILABLE",
      "The inquiry service is temporarily unavailable.",
      503
    );
  }

  // 1. Successful Responses (200 / 201)
  if (status === 200 || status === 201) {
    const normalized = normalizeSuccessfulPayload(opts.path, jsonPayload);
    return buildManagementResponse(normalized, status);
  }

  // 2. Error Mappings
  const msg = jsonPayload?.message || "An error occurred with the inquiries service";

  if (status === 401) {
    return buildManagementError("UNAUTHORIZED", msg, 401);
  }

  if (status === 403) {
    // Check if super_admin read-only oversight restriction triggered
    const isReadOnly =
      msg.toLowerCase().includes("oversight") ||
      msg.toLowerCase().includes("read-only") ||
      msg.toLowerCase().includes("read clearance");
    return buildManagementError(
      isReadOnly ? "READ_ONLY_ROLE" : "FORBIDDEN",
      msg,
      403
    );
  }

  if (status === 404) {
    return buildManagementError("NOT_FOUND", msg, 404);
  }

  if (status === 409) {
    return buildManagementError("INQUIRY_CLOSED", msg, 409);
  }

  if (status === 422) {
    return buildManagementError("VALIDATION_ERROR", msg, 422, jsonPayload?.errors);
  }

  if (status === 400) {
    return buildManagementError("INVALID_REQUEST", msg, 400);
  }

  if (status === 413) {
    return buildManagementError("PAYLOAD_TOO_LARGE", msg, 413);
  }

  if (status === 415) {
    return buildManagementError("UNSUPPORTED_MEDIA_TYPE", msg, 415);
  }

  // Any unhandled 5xx
  console.error(`[MANAGEMENT BFF UPSTREAM ERROR STATUS] status: ${status}, msg: ${msg}`);
  return buildManagementError("SERVICE_UNAVAILABLE", "The inquiry service is temporarily unavailable.", 503);
}

// ============================================================================
// 7. SNAKE_CASE TO CAMELCASE NORMALIZERS
// ============================================================================

function normalizeSuccessfulPayload(path: string, raw: any): unknown {
  // A. Stats endpoint (/api/v1/inquiries/stats)
  if (path.includes("/stats")) {
    const stats: InquiryStats = {
      totalInquiries: raw?.total_inquiries ?? 0,
      byStatus: {
        open: raw?.by_status?.open ?? 0,
        replied: raw?.by_status?.replied ?? 0,
        closed: raw?.by_status?.closed ?? 0,
      },
      totalMessages: raw?.total_messages ?? 0,
      userMessages: raw?.user_messages ?? 0,
      staffReplies: raw?.staff_replies ?? 0,
      emailsDispatched: raw?.emails_dispatched ?? 0,
      emailsPendingOrFailed: raw?.emails_pending_or_failed ?? 0,
      staffActivity: Array.isArray(raw?.staff_activity)
        ? raw.staff_activity.map((s: any) => ({
            senderId: s?.sender_id ?? null,
            senderName: s?.sender_name ?? "Support Staff",
            replyCount: s?.reply_count ?? 0,
            lastReplyAt: s?.last_reply_at ?? null,
          }))
        : [],
    };
    return stats;
  }

  // B. Reply endpoint (/api/v1/inquiries/[id]/reply)
  if (path.endsWith("/reply")) {
    const msg = raw?.data;
    const normalizedMsg: InquiryMessageItem = {
      id: msg?.id ?? "",
      inquiryId: msg?.inquiry_id ?? "",
      senderType: msg?.sender_type ?? "STAFF",
      senderId: msg?.sender_id ?? null,
      senderName: msg?.sender_name ?? "Heal Her Support",
      body: msg?.body ?? "",
      emailDispatched: Boolean(msg?.email_dispatched),
      createdAt: msg?.created_at ?? new Date().toISOString(),
    };
    return normalizedMsg;
  }

  // C. Status update endpoint (/api/v1/inquiries/[id]/status)
  if (path.endsWith("/status")) {
    const inq = raw?.data;
    const normalizedInq: InquiryDetailHeader = {
      id: inq?.id ?? "",
      fullName: inq?.full_name ?? "",
      organization: inq?.organization ?? "",
      email: inq?.email ?? "",
      subject: inq?.subject ?? "",
      status: inq?.status ?? "OPEN",
      ipAddress: inq?.ip_address ?? null,
      createdAt: inq?.created_at ?? "",
      updatedAt: inq?.updated_at ?? "",
    };
    return normalizedInq;
  }

  // D. Detail endpoint (/api/v1/inquiries/[id])
  if (raw?.inquiry && raw?.messages) {
    const inq = raw.inquiry;
    const detail: InquiryDetail = {
      inquiry: {
        id: inq?.id ?? "",
        fullName: inq?.full_name ?? "",
        organization: inq?.organization ?? "",
        email: inq?.email ?? "",
        subject: inq?.subject ?? "",
        status: inq?.status ?? "OPEN",
        ipAddress: inq?.ip_address ?? null,
        createdAt: inq?.created_at ?? "",
        updatedAt: inq?.updated_at ?? "",
      },
      referenceCode: raw?.reference_code ?? "",
      messages: Array.isArray(raw.messages)
        ? raw.messages.map((m: any) => ({
            id: m?.id ?? "",
            inquiryId: m?.inquiry_id ?? "",
            senderType: m?.sender_type ?? "USER",
            senderId: m?.sender_id ?? null,
            senderName: m?.sender_name ?? "",
            body: m?.body ?? "",
            emailDispatched: Boolean(m?.email_dispatched),
            createdAt: m?.created_at ?? "",
          }))
        : [],
    };
    return detail;
  }

  // E. List endpoint (/api/v1/inquiries)
  if (Array.isArray(raw?.data) && raw?.pagination) {
    const items: InquirySummary[] = raw.data.map((item: any) => ({
      id: item?.id ?? "",
      referenceCode: item?.reference_code ?? "",
      fullName: item?.full_name ?? "",
      organization: item?.organization ?? "",
      email: item?.email ?? "",
      subject: item?.subject ?? "",
      status: item?.status ?? "OPEN",
      createdAt: item?.created_at ?? "",
      updatedAt: item?.updated_at ?? "",
      messageCount: item?.message_count ?? 0,
      staffReplyCount: item?.staff_reply_count ?? 0,
      lastRepliedBy: item?.last_replied_by ?? null,
      lastMessageAt: item?.last_message_at ?? null,
    }));

    const listData: InquiryListData = {
      items,
      pagination: {
        total: raw.pagination?.total ?? items.length,
        limit: raw.pagination?.limit ?? 20,
        offset: raw.pagination?.offset ?? 0,
        hasMore: Boolean(raw.pagination?.has_more),
      },
    };
    return listData;
  }

  return raw;
}
