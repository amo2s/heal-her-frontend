import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import net from "net";
import {
  ApprovalStatus,
  AuditLogsListData,
  getPortalBasePath,
  GovernanceErrorCode,
  GovernanceErrorResponse,
  GovernanceResult,
  ManagedUserRecord,
  ManagedUsersListData,
  ManagementIdentityProfile,
  ManagementRole,
} from "./management-governance";

const MAX_PAYLOAD_BYTES = 16384; // 16 KB strict byte limit

// ============================================================================
// 1. SECURITY RESPONSE BUILDER
// ============================================================================

export function buildGovernanceResponse(
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

export function buildGovernanceError(
  code: GovernanceErrorCode,
  message: string,
  status: number,
  fieldErrors?: Record<string, string>
): NextResponse {
  const errPayload: GovernanceErrorResponse = {
    status: "error",
    code,
    message,
    ...(fieldErrors ? { fieldErrors } : {}),
  };
  return buildGovernanceResponse(errPayload, status);
}

// ============================================================================
// 2. HTTPONLY COOKIE EXTRACTION
// ============================================================================

export async function extractAdminAccessToken(req?: NextRequest): Promise<string | null> {
  if (req) {
    const fromReq = req.cookies.get("admin-access-token")?.value;
    if (fromReq && fromReq.trim() !== "") {
      return fromReq.trim();
    }
  }

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

export async function extractAdminRefreshToken(req?: NextRequest): Promise<string | null> {
  if (req) {
    const fromReq = req.cookies.get("admin-refresh-token")?.value;
    if (fromReq && fromReq.trim() !== "") {
      return fromReq.trim();
    }
  }

  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("admin-refresh-token");
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
  const rawContentType = req.headers.get("content-type") || "";
  const mediaType = rawContentType.split(";")[0].trim().toLowerCase();
  if (mediaType !== "application/json") {
    return {
      ok: false,
      errorResponse: buildGovernanceError(
        "UNSUPPORTED_MEDIA_TYPE",
        "Content-Type must strictly be application/json",
        415
      ),
    };
  }

  const contentLengthHeader = req.headers.get("content-length");
  if (contentLengthHeader) {
    const len = parseInt(contentLengthHeader, 10);
    if (!isNaN(len) && len > MAX_PAYLOAD_BYTES) {
      return {
        ok: false,
        errorResponse: buildGovernanceError(
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
      errorResponse: buildGovernanceError(
        "INVALID_REQUEST",
        "Request body cannot be empty",
        400
      ),
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
        if (totalBytes > MAX_PAYLOAD_BYTES) {
          try {
            await reader.cancel();
          } catch {
            // Ignore cancel errors
          }
          return {
            ok: false,
            errorResponse: buildGovernanceError(
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
    console.error("[GOVERNANCE BFF STREAM READ ERROR]", streamErr);
    return {
      ok: false,
      errorResponse: buildGovernanceError(
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

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return {
      ok: false,
      errorResponse: buildGovernanceError(
        "INVALID_REQUEST",
        "Malformed or invalid JSON payload",
        400
      ),
    };
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      ok: false,
      errorResponse: buildGovernanceError(
        "INVALID_REQUEST",
        "Request payload must be a JSON object",
        400
      ),
    };
  }

  const payloadObj = parsed as Record<string, unknown>;

  for (const key of Object.keys(payloadObj)) {
    if (!allowedKeys.has(key)) {
      return {
        ok: false,
        errorResponse: buildGovernanceError(
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
// 6. AUTHENTICATED GOVERNANCE UPSTREAM DISPATCH
// ============================================================================

export interface UpstreamDispatchOptions {
  path: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: string;
  clientIP?: string | null;
  token: string;
}

export async function dispatchAuthenticatedGovernanceUpstream(
  opts: UpstreamDispatchOptions
): Promise<NextResponse> {
  const rawBackendUrl = process.env.BACKEND_URL || "https://sliverboy-healher-backend.hf.space";
  const backendBase = rawBackendUrl.replace(/\/graphql$/, "").replace(/\/$/, "");
  const targetUrl = `${backendBase}${opts.path.startsWith("/") ? opts.path : `/${opts.path}`}`;

  const headers = new Headers({
    Authorization: `Bearer ${opts.token}`,
    Accept: "application/json",
    "User-Agent": "HealHer-NextJS-Governance-BFF/1.0",
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
    console.error("[GOVERNANCE BFF UPSTREAM ERROR]", {
      isTimeout,
      path: opts.path,
      method: opts.method || "GET",
      errorName: err?.name,
    });
    return buildGovernanceError(
      "SERVICE_UNAVAILABLE",
      isTimeout
        ? "The governance service timed out. Please try again."
        : "The governance service is temporarily unreachable.",
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
    console.error("[GOVERNANCE BFF READ ERROR]", readErr);
    return buildGovernanceError(
      "SERVICE_UNAVAILABLE",
      "Failed to read upstream response",
      503
    );
  }

  let jsonPayload: any = null;
  try {
    jsonPayload = JSON.parse(rawText);
  } catch {
    console.warn(`[GOVERNANCE BFF NON-JSON UPSTREAM] status: ${status}, path: ${opts.path}`);
    return buildGovernanceError(
      "SERVICE_UNAVAILABLE",
      "The governance service is temporarily unavailable.",
      503
    );
  }

  // 1. Successful Responses (200 / 201)
  if (status === 200 || status === 201) {
    const normalized = normalizeGovernancePayload(opts.path, jsonPayload);
    return buildGovernanceResponse(normalized, status);
  }

  // 2. Error Mappings
  const msg =
    jsonPayload?.message ||
    jsonPayload?.detail ||
    jsonPayload?.error ||
    "An error occurred with the governance service";

  if (status === 401) {
    return buildGovernanceError("UNAUTHORIZED", msg, 401);
  }

  if (status === 403) {
    const lower = msg.toLowerCase();
    if (lower.includes("pending")) {
      return buildGovernanceError("PENDING_APPROVAL", msg, 403);
    }
    if (lower.includes("rejected")) {
      return buildGovernanceError("ACCOUNT_REJECTED", msg, 403);
    }
    if (lower.includes("suspended") || lower.includes("inactive")) {
      return buildGovernanceError("ACCOUNT_SUSPENDED", msg, 403);
    }
    return buildGovernanceError("FORBIDDEN", msg, 403);
  }

  if (status === 404) {
    return buildGovernanceError("NOT_FOUND", msg, 404);
  }

  if (status === 409) {
    return buildGovernanceError("CONFLICT", msg, 409);
  }

  if (status === 422) {
    return buildGovernanceError("VALIDATION_ERROR", msg, 422, jsonPayload?.errors);
  }

  if (status === 400) {
    return buildGovernanceError("INVALID_REQUEST", msg, 400);
  }

  if (status === 413) {
    return buildGovernanceError("PAYLOAD_TOO_LARGE", msg, 413);
  }

  if (status === 415) {
    return buildGovernanceError("UNSUPPORTED_MEDIA_TYPE", msg, 415);
  }

  console.error(`[GOVERNANCE BFF UPSTREAM ERROR STATUS] status: ${status}, msg: ${msg}`);
  return buildGovernanceError(
    "SERVICE_UNAVAILABLE",
    "The governance service is temporarily unavailable.",
    503
  );
}

// ============================================================================
// 7. SNAKE_CASE TO CAMELCASE NORMALIZERS
// ============================================================================

function normalizeSingleUser(u: any): ManagedUserRecord {
  return {
    id: u?.id ?? "",
    fullName: u?.full_name ?? u?.fullName ?? "",
    email: u?.email ?? "",
    role: u?.role as ManagementRole,
    approvalStatus: (u?.approval_status ?? u?.approvalStatus ?? "PENDING") as ApprovalStatus,
    isActive: Boolean(u?.is_active ?? u?.isActive),
    approvedBy: u?.approved_by ?? u?.approvedBy ?? null,
    approvedAt: u?.approved_at ?? u?.approvedAt ?? null,
    suspendedBy: u?.suspended_by ?? u?.suspendedBy ?? null,
    suspendedAt: u?.suspended_at ?? u?.suspendedAt ?? null,
    deletedAt: u?.deleted_at ?? u?.deletedAt ?? null,
    createdAt: u?.created_at ?? u?.createdAt ?? new Date().toISOString(),
    updatedAt: u?.updated_at ?? u?.updatedAt ?? new Date().toISOString(),
  };
}

function normalizeGovernancePayload(path: string, raw: any): unknown {
  const data = raw?.data ?? raw;

  // A. Me endpoint (/api/v1/auth/management/me)
  if (path.includes("/me")) {
    const profile: ManagementIdentityProfile = {
      id: data?.id ?? "",
      fullName: data?.full_name ?? data?.fullName ?? "",
      firstName: data?.first_name ?? data?.firstName ?? "",
      email: data?.email ?? "",
      role: data?.role as ManagementRole,
      approvalStatus: (data?.approval_status ?? data?.approvalStatus ?? "PENDING") as ApprovalStatus,
      isActive: Boolean(data?.is_active ?? data?.isActive),
      approvedAt: data?.approved_at ?? data?.approvedAt ?? null,
      createdAt: data?.created_at ?? data?.createdAt ?? new Date().toISOString(),
      requiresTokenRefresh: Boolean(data?.requires_token_refresh ?? data?.requiresTokenRefresh),
    };
    return profile;
  }

  // B. Users list endpoint (/api/v1/auth/management/users)
  if (path.includes("/users") && !path.includes("/approve") && !path.includes("/reject") && !path.includes("/suspend") && !path.includes("/reactivate")) {
    // Check if it's the directory list or a DELETE
    if (Array.isArray(data)) {
      const counts = raw?.counts ?? {};
      const pagination = raw?.pagination ?? {};
      const result: ManagedUsersListData = {
        items: data.map(normalizeSingleUser),
        counts: {
          pendingStaff: counts.pending_staff ?? counts.pendingStaff ?? 0,
          pendingAdmin: counts.pending_admin ?? counts.pendingAdmin ?? 0,
          activeStaff: counts.active_staff ?? counts.activeStaff ?? 0,
          activeAdmin: counts.active_admin ?? counts.activeAdmin ?? 0,
          suspendedCount: counts.suspended_count ?? counts.suspendedCount ?? 0,
        },
        pagination: {
          total: pagination.total ?? 0,
          limit: pagination.limit ?? 50,
          offset: pagination.offset ?? 0,
          hasMore: Boolean(pagination.has_more ?? pagination.hasMore),
        },
      };
      return result;
    }

    if (data?.deleted) {
      return {
        deleted: true,
        userId: data.user_id ?? data.userId ?? "",
      };
    }
  }

  // C. Audit logs endpoint (/api/v1/auth/management/audit-logs)
  if (path.includes("/audit-logs")) {
    const logs = Array.isArray(data) ? data : [];
    const pagination = raw?.pagination ?? {};
    const result: AuditLogsListData = {
      items: logs.map((log: any) => ({
        id: log.id,
        actorId: log.actor_id ?? log.actorId ?? "",
        actorRole: log.actor_role ?? log.actorRole ?? "",
        actorName: log.actor_name ?? log.actorName ?? null,
        actorEmail: log.actor_email ?? log.actorEmail ?? null,
        targetUserId: log.target_user_id ?? log.targetUserId ?? null,
        targetName: log.target_name ?? log.targetName ?? null,
        targetEmail: log.target_email ?? log.targetEmail ?? null,
        action: log.action ?? "",
        metadata: log.metadata ?? null,
        ipAddress: log.ip_address ?? log.ipAddress ?? null,
        createdAt: log.created_at ?? log.createdAt ?? new Date().toISOString(),
      })),
      pagination: {
        total: pagination.total ?? 0,
        limit: pagination.limit ?? 50,
        offset: pagination.offset ?? 0,
        hasMore: Boolean(pagination.has_more ?? pagination.hasMore),
      },
    };
    return result;
  }

  // D. Single user mutations (approve, reject, suspend, reactivate)
  if (data?.id && (data?.role || data?.email)) {
    return normalizeSingleUser(data);
  }

  return raw;
}

// ============================================================================
// 8. SERVER COMPONENT IDENTITY RESOLVER
// ============================================================================

export async function getServerManagementIdentity(): Promise<
  | { authenticated: true; identity: ManagementIdentityProfile }
  | { authenticated: false; reason: string }
> {
  const token = await extractAdminAccessToken();
  if (!token) {
    return { authenticated: false, reason: "No admin-access-token cookie present" };
  }

  const rawBackendUrl = process.env.BACKEND_URL || "https://sliverboy-healher-backend.hf.space";
  const backendBase = rawBackendUrl.replace(/\/graphql$/, "").replace(/\/$/, "");
  const targetUrl = `${backendBase}/api/v1/auth/management/me`;

  const headers = new Headers({
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "User-Agent": "HealHer-NextJS-Management-ServerComponent/1.0",
  });

  const handshake = process.env.FRONTEND_HANDSHAKE_SECRET;
  if (handshake && handshake.trim() !== "") {
    headers.set("x-healher-handshake", handshake.trim());
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(targetUrl, {
      method: "GET",
      headers,
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return { authenticated: false, reason: `Upstream returned status ${res.status}` };
    }

    const json = await res.json();
    const rawData = json?.data ?? json;
    if (!rawData || !rawData.id) {
      return { authenticated: false, reason: "Invalid profile payload from upstream" };
    }

    const role = rawData.role as ManagementRole;
    const identity: ManagementIdentityProfile = {
      id: rawData.id,
      fullName: rawData.full_name ?? rawData.fullName ?? "",
      firstName: rawData.first_name ?? rawData.firstName ?? "",
      email: rawData.email ?? "",
      role,
      approvalStatus: (rawData.approval_status ?? rawData.approvalStatus ?? "PENDING") as ApprovalStatus,
      isActive: Boolean(rawData.is_active ?? rawData.isActive),
      approvedAt: rawData.approved_at ?? rawData.approvedAt ?? null,
      createdAt: rawData.created_at ?? rawData.createdAt ?? new Date().toISOString(),
      requiresTokenRefresh: Boolean(rawData.requires_token_refresh ?? rawData.requiresTokenRefresh),
      portalPath: getPortalBasePath(role),
    };

    return { authenticated: true, identity };
  } catch (err: any) {
    return { authenticated: false, reason: err?.message || "Failed to reach upstream me endpoint" };
  }
}

// ============================================================================
// 8. UNAUTHENTICATED MANAGEMENT RECOVERY DISPATCH & COOKIE EVICTION
// ============================================================================

export interface UnauthenticatedUpstreamOptions {
  path: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: string;
  clientIP?: string | null;
}

/**
 * Dispatches unauthenticated recovery requests to Rust Auth with:
 * - Server-only x-healher-handshake injection
 * - Validated visitor IP forwarding (X-Real-IP / X-Forwarded-For)
 * - 12-second abort timeout
 * - Outage shielding against upstream 502/503/504 HTML pages
 * - ZERO browser cookies or Authorization headers forwarded
 */
export async function dispatchUnauthenticatedManagementUpstream(
  opts: UnauthenticatedUpstreamOptions
): Promise<NextResponse> {
  const rawBackendUrl = process.env.BACKEND_URL || "https://sliverboy-healher-backend.hf.space";
  const backendBase = rawBackendUrl.replace(/\/graphql$/, "").replace(/\/$/, "");
  const targetUrl = `${backendBase}${opts.path.startsWith("/") ? opts.path : `/${opts.path}`}`;

  const headers = new Headers({
    Accept: "application/json",
    "User-Agent": "HealHer-NextJS-Governance-BFF/1.0",
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
      method: opts.method || "POST",
      headers,
      body: opts.body,
      signal: controller.signal,
      cache: "no-store",
      redirect: "error",
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    const isTimeout = err?.name === "AbortError";
    console.error("[UNAUTHENTICATED GOVERNANCE UPSTREAM ERROR]", {
      isTimeout,
      path: opts.path,
      method: opts.method || "POST",
      errorName: err?.name,
    });
    return buildGovernanceError(
      "SERVICE_UNAVAILABLE",
      isTimeout
        ? "The governance service timed out. Please try again."
        : "The governance service is temporarily unreachable.",
      isTimeout ? 504 : 503
    );
  } finally {
    clearTimeout(timeoutId);
  }

  const status = upstreamResponse.status;

  let rawText = "";
  try {
    rawText = await upstreamResponse.text();
    if (rawText.length > 65536) {
      rawText = rawText.substring(0, 65536);
    }
  } catch (readErr) {
    console.error("[UNAUTHENTICATED GOVERNANCE READ ERROR]", readErr);
    return buildGovernanceError(
      "SERVICE_UNAVAILABLE",
      "Failed to read upstream response",
      503
    );
  }

  let jsonPayload: any = null;
  try {
    jsonPayload = JSON.parse(rawText);
  } catch {
    console.warn(`[UNAUTHENTICATED GOVERNANCE NON-JSON UPSTREAM] status: ${status}, path: ${opts.path}`);
    return buildGovernanceError(
      "SERVICE_UNAVAILABLE",
      "The governance service is temporarily unavailable.",
      503
    );
  }

  if (status === 200 || status === 201) {
    return buildGovernanceResponse(jsonPayload, status);
  }

  const message = jsonPayload?.message || jsonPayload?.detail || "An unexpected error occurred.";
  if (status === 429) {
    const isLockout = message.toLowerCase().includes("locked");
    return buildGovernanceError(
      isLockout ? "ACCOUNT_LOCKED" : "RATE_LIMITED",
      message,
      429
    );
  }
  if (status === 401) {
    const isToken = message.toLowerCase().includes("token");
    return buildGovernanceError(isToken ? "TOKEN_EXPIRED" : "INVALID_OTP", message, 401);
  }
  if (status === 403) {
    return buildGovernanceError("FORBIDDEN", message, 403);
  }
  if (status === 400) {
    return buildGovernanceError("VALIDATION_ERROR", message, 400);
  }

  return buildGovernanceError("INTERNAL_ERROR", message, status);
}

/**
 * Explicitly terminates and expires admin session cookies (admin-access-token, admin-refresh-token).
 */
export function expireAdminSessionCookies(response: NextResponse): void {
  const isProduction = process.env.NODE_ENV === "production";
  response.cookies.set({
    name: "admin-access-token",
    value: "",
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 0,
    expires: new Date(0),
    path: "/",
  });
  response.cookies.set({
    name: "admin-refresh-token",
    value: "",
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 0,
    expires: new Date(0),
    path: "/",
  });
}

