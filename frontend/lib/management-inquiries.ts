/**
 * ============================================================================
 * Heal Her Inquiries — Shared Management Contracts & Client API Layer
 * ============================================================================
 * Isomorphic TypeScript domain contracts, canonical role governance helpers,
 * mirrored validation utilities, and client fetch functions for the Management
 * Inquiries Portal.
 */

// ============================================================================
// 1. CANONICAL ROLE GOVERNANCE HELPERS
// ============================================================================

/**
 * The three canonical administrative roles enforcing two-tier Separation of Duties.
 */
export type ManagementInquiryRole = "super_admin" | "admin" | "staff";

/**
 * Safely normalizes and validates an incoming administrative role string.
 * Strictly rejects legacy/retired roles (owner, superadmin, teacher, counselor, principal, management).
 */
export function normalizeManagementRole(rawRole: unknown): ManagementInquiryRole | null {
  if (typeof rawRole !== "string") return null;
  const trimmed = rawRole.trim().toLowerCase();
  if (trimmed === "super_admin" || trimmed === "admin" || trimmed === "staff") {
    return trimmed;
  }
  return null;
}

/**
 * Returns true strictly for operational action roles (admin and staff).
 * Super Admin is strictly executive oversight (read-only) and returns false.
 */
export function canPerformInquiryActions(role: unknown): boolean {
  const normalized = normalizeManagementRole(role);
  return normalized === "admin" || normalized === "staff";
}

/**
 * Returns true for all three canonical oversight and read roles.
 */
export function canReadInquiries(role: unknown): boolean {
  const normalized = normalizeManagementRole(role);
  return normalized !== null;
}

// ============================================================================
// 2. STRICTLY TYPED DOMAIN CONTRACTS
// ============================================================================

export type InquiryStatus = "OPEN" | "REPLIED" | "CLOSED";

export type InquirySenderType = "USER" | "STAFF";

export interface InquirySummary {
  id: string;
  referenceCode: string;
  fullName: string;
  organization: string;
  email: string;
  subject: string;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  staffReplyCount: number;
  lastRepliedBy: string | null;
  lastMessageAt: string | null;
}

export interface InquiryPagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface InquiryListData {
  items: InquirySummary[];
  pagination: InquiryPagination;
}

export interface InquiryMessageItem {
  id: string;
  inquiryId: string;
  senderType: InquirySenderType;
  senderId: string | null;
  senderName: string;
  body: string;
  emailDispatched: boolean;
  createdAt: string;
}

export interface InquiryDetailHeader {
  id: string;
  fullName: string;
  organization: string;
  email: string;
  subject: string;
  status: InquiryStatus;
  ipAddress?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryDetail {
  inquiry: InquiryDetailHeader;
  referenceCode: string;
  messages: InquiryMessageItem[];
}

export interface StaffActivityItem {
  senderId: string | null;
  senderName: string;
  replyCount: number;
  lastReplyAt: string | null;
}

export interface StatusCounts {
  open: number;
  replied: number;
  closed: number;
}

export interface InquiryStats {
  totalInquiries: number;
  byStatus: StatusCounts;
  totalMessages: number;
  userMessages: number;
  staffReplies: number;
  emailsDispatched: number;
  emailsPendingOrFailed: number;
  staffActivity: StaffActivityItem[];
}

export type ManagementInquiryErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "READ_ONLY_ROLE"
  | "NOT_FOUND"
  | "INQUIRY_CLOSED"
  | "VALIDATION_ERROR"
  | "INVALID_REQUEST"
  | "PAYLOAD_TOO_LARGE"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "SERVICE_UNAVAILABLE"
  | "INTERNAL_ERROR";

export interface ManagementInquiryError {
  status: "error";
  code: ManagementInquiryErrorCode;
  message: string;
  fieldErrors?: Record<string, string>;
}

export type ManagementResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ManagementInquiryError };

// ============================================================================
// 3. MIRRORED VALIDATION HELPERS
// ============================================================================

/**
 * Counts Unicode code points for exact parity with Go utf8.RuneCountInString.
 */
export function countManagementRunes(str: string): number {
  return Array.from(str).length;
}

/**
 * Validates RFC 4122 UUID strings (v1-v5).
 */
export function isValidUuid(str: unknown): boolean {
  if (typeof str !== "string") return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str.trim());
}

/**
 * Validates and normalizes ticket status transitions.
 */
export function validateInquiryStatus(rawStatus: unknown): {
  isValid: boolean;
  status?: InquiryStatus;
  error?: string;
} {
  if (typeof rawStatus !== "string") {
    return { isValid: false, error: "Status must be a string" };
  }
  const normalized = rawStatus.trim().toUpperCase();
  if (normalized === "OPEN" || normalized === "REPLIED" || normalized === "CLOSED") {
    return { isValid: true, status: normalized as InquiryStatus };
  }
  return {
    isValid: false,
    error: "Invalid ticket status; must strictly be OPEN, REPLIED, or CLOSED",
  };
}

/**
 * Sanitizes staff reply body and enforces Go bounds (2 to 10,000 runes).
 * Normalizes CRLF and lone CR to \n, strips null bytes and non-printable control chars,
 * and preserves tabs (\t) and newlines (\n).
 */
export function validateStaffReplyBody(rawBody: unknown): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  if (typeof rawBody !== "string") {
    return { isValid: false, sanitized: "", error: "Reply body must be a string" };
  }

  // Normalize line breaks
  const normalizedBreaks = rawBody.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  let cleaned = "";
  for (let i = 0; i < normalizedBreaks.length; i++) {
    const code = normalizedBreaks.charCodeAt(i);
    // Strip null byte
    if (code === 0) continue;
    // Preserve newline (10) and tab (9)
    if (code === 10 || code === 9) {
      cleaned += normalizedBreaks[i];
      continue;
    }
    // Delete ASCII control characters (< 32) or DEL (127)
    if ((code < 32 && code !== 32) || code === 127) {
      continue;
    }
    cleaned += normalizedBreaks[i];
  }

  const trimmed = cleaned.trim();
  const runes = countManagementRunes(trimmed);

  if (runes < 2 || runes > 10000) {
    return {
      isValid: false,
      sanitized: trimmed,
      error: "Staff reply body must be between 2 and 10,000 characters",
    };
  }

  return { isValid: true, sanitized: trimmed };
}

// ============================================================================
// 4. TYPED CLIENT API FUNCTIONS (Isomorphic Browser/Server Fetchers)
// ============================================================================

async function clientApiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ManagementResult<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(endpoint, {
      ...options,
      credentials: "same-origin",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    let json: any = null;
    try {
      json = await res.json();
    } catch {
      json = null;
    }

    if (res.ok) {
      return { ok: true, data: json as T };
    }

    return {
      ok: false,
      error: {
        status: "error",
        code: (json?.code as ManagementInquiryErrorCode) || "INTERNAL_ERROR",
        message: json?.message || `Request failed with status ${res.status}`,
        fieldErrors: json?.fieldErrors,
      },
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const isTimeout = err?.name === "AbortError";
    return {
      ok: false,
      error: {
        status: "error",
        code: "SERVICE_UNAVAILABLE",
        message: isTimeout
          ? "The request timed out. Please try again."
          : "Network error encountered while communicating with the inquiry service.",
      },
    };
  }
}

/**
 * Retrieves executive oversight analytics (GET /api/management/inquiries/stats).
 */
export async function fetchInquiryStats(): Promise<ManagementResult<InquiryStats>> {
  return clientApiFetch<InquiryStats>("/api/management/inquiries/stats");
}

/**
 * Retrieves paginated inquiries inbox with optional filtering (GET /api/management/inquiries).
 */
export async function fetchInquiriesList(filters?: {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<ManagementResult<InquiryListData>> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.search) params.set("search", filters.search);
  if (typeof filters?.limit === "number") params.set("limit", String(filters.limit));
  if (typeof filters?.offset === "number") params.set("offset", String(filters.offset));

  const qs = params.toString();
  const endpoint = qs ? `/api/management/inquiries?${qs}` : "/api/management/inquiries";
  return clientApiFetch<InquiryListData>(endpoint);
}

/**
 * Retrieves a full inquiry thread with chronological messages (GET /api/management/inquiries/[id]).
 */
export async function fetchInquiryDetail(inquiryId: string): Promise<ManagementResult<InquiryDetail>> {
  return clientApiFetch<InquiryDetail>(`/api/management/inquiries/${encodeURIComponent(inquiryId)}`);
}

/**
 * Persists a staff reply and triggers async email dispatch (POST /api/management/inquiries/[id]/reply).
 */
export async function sendInquiryReply(
  inquiryId: string,
  body: string
): Promise<ManagementResult<InquiryMessageItem>> {
  return clientApiFetch<InquiryMessageItem>(
    `/api/management/inquiries/${encodeURIComponent(inquiryId)}/reply`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    }
  );
}

/**
 * Updates an inquiry ticket status (PATCH /api/management/inquiries/[id]/status).
 */
export async function updateInquiryStatus(
  inquiryId: string,
  status: InquiryStatus
): Promise<ManagementResult<InquiryDetailHeader>> {
  return clientApiFetch<InquiryDetailHeader>(
    `/api/management/inquiries/${encodeURIComponent(inquiryId)}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }
  );
}
