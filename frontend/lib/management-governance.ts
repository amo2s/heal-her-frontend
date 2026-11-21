/**
 * ============================================================================
 * Heal Her Governance — Shared Management Contracts & Client API Layer
 * ============================================================================
 * Isomorphic TypeScript domain contracts, canonical role-routing helpers,
 * capability matrix, mirrored validation utilities, and client fetch functions
 * for the 3-Tier Management Governance Portal.
 */

// ============================================================================
// 1. CANONICAL ROLE & STATUS DEFINITIONS
// ============================================================================

/**
 * The three canonical administrative roles enforcing 3-tier governance.
 * - super_admin: Executive oversight, admin/staff approval, suspension/deletion, audit trail.
 * - admin: Operations management, staff approval/suspension, inquiries management.
 * - staff: Frontline operational inquiries processing.
 */
export type ManagementRole = "super_admin" | "admin" | "staff";

/**
 * The subset of management roles allowed for self-registration.
 * super_admin CANNOT self-register; super_admin can only be provisioned via database seed.
 */
export type SelfRegisterableManagementRole = "admin" | "staff";

/**
 * The three canonical account approval statuses.
 */
export type ApprovalStatus = "APPROVED" | "PENDING" | "REJECTED";

/**
 * Audit ledger action strings.
 */
export type GovernanceAction =
  | "MANAGEMENT_SIGNUP"
  | "ACCOUNT_APPROVED"
  | "ACCOUNT_REJECTED"
  | "ACCOUNT_SUSPENDED"
  | "ACCOUNT_REACTIVATED"
  | "ACCOUNT_DELETED";

/**
 * Safely normalizes and validates an incoming management role string.
 * Strictly rejects legacy/retired roles (e.g. owner, superadmin, teacher, counselor, principal, management).
 */
export function normalizeGovernanceRole(rawRole: unknown): ManagementRole | null {
  if (typeof rawRole !== "string") return null;
  const trimmed = rawRole.trim().toLowerCase();
  if (trimmed === "super_admin" || trimmed === "admin" || trimmed === "staff") {
    return trimmed;
  }
  return null;
}

/**
 * Safely normalizes and validates an incoming approval status string.
 */
export function normalizeApprovalStatus(rawStatus: unknown): ApprovalStatus | null {
  if (typeof rawStatus !== "string") return null;
  const trimmed = rawStatus.trim().toUpperCase();
  if (trimmed === "APPROVED" || trimmed === "PENDING" || trimmed === "REJECTED") {
    return trimmed;
  }
  return null;
}

// ============================================================================
// 2. PORTAL PATHS & ROLE-BASED ROUTING HELPERS
// ============================================================================

export const MANAGEMENT_PORTAL_PATHS: Record<ManagementRole, string> = {
  super_admin: "/management/super-admin",
  admin: "/management/admin",
  staff: "/management/staff",
};

/**
 * Returns the canonical base dashboard path for a given management role.
 */
export function getPortalBasePath(role: ManagementRole): string {
  return MANAGEMENT_PORTAL_PATHS[role] || "/management/dashboard";
}

/**
 * Returns the inquiries console path for a given management role.
 */
export function getPortalInquiriesPath(role: ManagementRole): string {
  return `${getPortalBasePath(role)}/inquiries`;
}

// ============================================================================
// 3. CAPABILITY MATRIX (3-Tier Governance Hierarchy)
// ============================================================================

/**
 * Checks whether an account has cleared approvals and is permitted to access the operational portal.
 */
export function canAccessPortal(role: unknown, status: unknown): boolean {
  const normRole = normalizeGovernanceRole(role);
  const normStatus = normalizeApprovalStatus(status);
  return normRole !== null && normStatus === "APPROVED";
}

/**
 * Returns true if the actor has permission to view the management users directory.
 * super_admin and admin only. Staff accounts are strictly forbidden.
 */
export function canViewManagedUsers(role: unknown): boolean {
  const norm = normalizeGovernanceRole(role);
  return norm === "super_admin" || norm === "admin";
}

/**
 * Returns true if the actor has permission to approve or reject a target role.
 * - super_admin can approve/reject admin and staff.
 * - admin can ONLY approve/reject staff.
 * - staff cannot approve/reject anyone.
 */
export function canApproveOrRejectTarget(actorRole: unknown, targetRole: unknown): boolean {
  const normActor = normalizeGovernanceRole(actorRole);
  const normTarget = normalizeGovernanceRole(targetRole);

  if (!normActor || !normTarget) return false;

  if (normActor === "super_admin") {
    return normTarget === "admin" || normTarget === "staff";
  }

  if (normActor === "admin") {
    return normTarget === "staff";
  }

  return false;
}

/**
 * Returns true if the actor has permission to suspend, reactivate, or delete a target role.
 * - super_admin can suspend, reactivate, or soft-delete admin and staff.
 * - admin can ONLY suspend or reactivate staff (admin CANNOT delete any accounts).
 * - staff cannot suspend, reactivate, or delete anyone.
 */
export function canSuspendReactivateOrDeleteTarget(
  actorRole: unknown,
  targetRole: unknown,
  action: "suspend" | "reactivate" | "delete"
): boolean {
  const normActor = normalizeGovernanceRole(actorRole);
  const normTarget = normalizeGovernanceRole(targetRole);

  if (!normActor || !normTarget) return false;

  if (action === "delete") {
    // Only super_admin can delete, and only target admin or staff
    return normActor === "super_admin" && (normTarget === "admin" || normTarget === "staff");
  }

  if (normActor === "super_admin") {
    return normTarget === "admin" || normTarget === "staff";
  }

  if (normActor === "admin") {
    return normTarget === "staff";
  }

  return false;
}

/**
 * Returns true if the actor has permission to view governance audit logs.
 * super_admin and admin only.
 */
export function canViewAuditLogs(role: unknown): boolean {
  const norm = normalizeGovernanceRole(role);
  return norm === "super_admin" || norm === "admin";
}

// ============================================================================
// 4. STRICT DOMAIN CONTRACTS & ERROR TYPES
// ============================================================================

export interface ManagementIdentityProfile {
  id: string;
  fullName: string;
  firstName: string;
  email: string;
  role: ManagementRole;
  approvalStatus: ApprovalStatus;
  isActive: boolean;
  approvedAt: string | null;
  createdAt: string;
  requiresTokenRefresh: boolean;
}

export interface ManagedUserRecord {
  id: string;
  fullName: string;
  email: string;
  role: ManagementRole;
  approvalStatus: ApprovalStatus;
  isActive: boolean;
  approvedBy: string | null;
  approvedAt: string | null;
  suspendedBy: string | null;
  suspendedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ManagedUsersCounts {
  pendingStaff: number;
  pendingAdmin: number;
  activeStaff: number;
  activeAdmin: number;
  suspendedCount: number;
}

export interface GovernancePagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface ManagedUsersListData {
  items: ManagedUserRecord[];
  counts: ManagedUsersCounts;
  pagination: GovernancePagination;
}

export interface GovernanceAuditLogItem {
  id: string;
  actorId: string;
  actorRole: string;
  actorName?: string | null;
  actorEmail?: string | null;
  targetUserId: string | null;
  targetName?: string | null;
  targetEmail?: string | null;
  action: string;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface AuditLogsListData {
  items: GovernanceAuditLogItem[];
  pagination: GovernancePagination;
}

export interface ManagementSignupPayload {
  fullName: string;
  email: string;
  password: string;
  requestedRole: SelfRegisterableManagementRole;
  botTrap?: string;
}

export interface ManagementSignupResult {
  id: string;
  fullName: string;
  email: string;
  role: SelfRegisterableManagementRole;
  approvalStatus: "PENDING";
}

export type GovernanceErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "PENDING_APPROVAL"
  | "ACCOUNT_REJECTED"
  | "ACCOUNT_SUSPENDED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "INVALID_REQUEST"
  | "PAYLOAD_TOO_LARGE"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "SERVICE_UNAVAILABLE"
  | "INTERNAL_ERROR";

export interface GovernanceErrorResponse {
  status: "error";
  code: GovernanceErrorCode;
  message: string;
  fieldErrors?: Record<string, string>;
}

export type GovernanceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: GovernanceErrorResponse };

// ============================================================================
// 5. MIRRORED VALIDATION HELPERS
// ============================================================================

export function countGovernanceRunes(str: string): number {
  return Array.from(str).length;
}

export function isValidGovernanceUuid(str: unknown): boolean {
  if (typeof str !== "string") return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-7][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str.trim());
}

export function validateManagementSignupInput(input: unknown): {
  isValid: boolean;
  sanitized?: ManagementSignupPayload;
  fieldErrors?: Record<string, string>;
} {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {
      isValid: false,
      fieldErrors: { form: "Invalid request payload format" },
    };
  }

  const raw = input as Record<string, unknown>;
  const errors: Record<string, string> = {};

  // 1. fullName: 2-120 runes, no control chars
  let fullName = typeof raw.fullName === "string" ? raw.fullName.trim() : "";
  if (!fullName && typeof raw.full_name === "string") {
    fullName = raw.full_name.trim();
  }
  const nameRunes = countGovernanceRunes(fullName);
  if (nameRunes < 2 || nameRunes > 120) {
    errors.fullName = "Full name must be between 2 and 120 characters";
  } else if (/[\x00-\x1F\x7F]/.test(fullName)) {
    errors.fullName = "Full name cannot contain control characters";
  }

  // 2. email: standard regex
  const email = typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.email = "Please provide a valid email address";
  }

  // 3. password: min 8 characters
  const password = typeof raw.password === "string" ? raw.password : "";
  if (password.length < 8) {
    errors.password = "Password must be at least 8 characters long";
  }

  // 4. requestedRole: strictly "admin" or "staff" (reject "super_admin")
  let requestedRole =
    typeof raw.requestedRole === "string"
      ? raw.requestedRole.trim().toLowerCase()
      : typeof raw.requested_role === "string"
      ? (raw.requested_role as string).trim().toLowerCase()
      : "";

  if (requestedRole !== "admin" && requestedRole !== "staff") {
    errors.requestedRole = "Requested role must strictly be 'admin' or 'staff'";
  }

  // 5. botTrap / website honeypot
  const botTrap =
    typeof raw.botTrap === "string"
      ? raw.botTrap
      : typeof raw.bot_trap === "string"
      ? (raw.bot_trap as string)
      : typeof raw.website === "string"
      ? (raw.website as string)
      : undefined;

  if (Object.keys(errors).length > 0) {
    return { isValid: false, fieldErrors: errors };
  }

  return {
    isValid: true,
    sanitized: {
      fullName,
      email,
      password,
      requestedRole: requestedRole as SelfRegisterableManagementRole,
      botTrap,
    },
  };
}

export function validateGovernanceReason(reason: unknown): {
  isValid: boolean;
  sanitized?: string;
  error?: string;
} {
  if (reason === undefined || reason === null || reason === "") {
    return { isValid: true, sanitized: undefined };
  }

  if (typeof reason !== "string") {
    return { isValid: false, error: "Reason must be a text string" };
  }

  const trimmed = reason.trim();
  if (trimmed.length > 500) {
    return { isValid: false, error: "Reason cannot exceed 500 characters" };
  }

  if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(trimmed)) {
    return { isValid: false, error: "Reason contains invalid control characters" };
  }

  return { isValid: true, sanitized: trimmed };
}

// ============================================================================
// 6. ISOMORPHIC CLIENT API FETCHERS
// ============================================================================

async function governanceApiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<GovernanceResult<T>> {
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
        code: (json?.code as GovernanceErrorCode) || "INTERNAL_ERROR",
        message: json?.message || json?.detail || `Request failed with status ${res.status}`,
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
          : "Network error encountered while communicating with the governance service.",
      },
    };
  }
}

/**
 * Self-registers a prospective staff or admin account (POST /api/auth/management/signup).
 */
export async function signupManagementAccount(
  payload: ManagementSignupPayload
): Promise<GovernanceResult<ManagementSignupResult>> {
  return governanceApiFetch<ManagementSignupResult>("/api/auth/management/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/**
 * Retrieves the currently authenticated management operator's live profile (GET /api/management/governance/me).
 */
export async function fetchManagementMe(): Promise<GovernanceResult<ManagementIdentityProfile>> {
  return governanceApiFetch<ManagementIdentityProfile>("/api/management/governance/me");
}

/**
 * Triggers stateful session refresh and rotates HttpOnly cookies (POST /api/auth/management/refresh).
 */
export async function refreshManagementSession(): Promise<
  GovernanceResult<{ success: boolean; refreshed: boolean }>
> {
  return governanceApiFetch<{ success: boolean; refreshed: boolean }>("/api/auth/management/refresh", {
    method: "POST",
  });
}

/**
 * Terminates the active management session and clears HttpOnly cookies (POST /api/auth/management/logout).
 */
export async function logoutManagementSession(
  allDevices = false
): Promise<GovernanceResult<{ success: boolean }>> {
  return governanceApiFetch<{ success: boolean }>("/api/auth/management/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ allDevices }),
  });
}

/**
 * Retrieves paginated management directory with status counts (GET /api/management/governance/users).
 */
export async function fetchManagedUsers(filters?: {
  role?: string;
  approvalStatus?: string;
  isActive?: boolean;
  includeDeleted?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<GovernanceResult<ManagedUsersListData>> {
  const params = new URLSearchParams();
  if (filters?.role) params.set("role", filters.role);
  if (filters?.approvalStatus) params.set("approval_status", filters.approvalStatus);
  if (typeof filters?.isActive === "boolean") params.set("is_active", String(filters.isActive));
  if (typeof filters?.includeDeleted === "boolean")
    params.set("include_deleted", String(filters.includeDeleted));
  if (filters?.search) params.set("search", filters.search);
  if (typeof filters?.limit === "number") params.set("limit", String(filters.limit));
  if (typeof filters?.offset === "number") params.set("offset", String(filters.offset));

  const qs = params.toString();
  const endpoint = qs ? `/api/management/governance/users?${qs}` : "/api/management/governance/users";
  return governanceApiFetch<ManagedUsersListData>(endpoint);
}

/**
 * Approves a pending staff or admin account (POST /api/management/governance/users/[id]/approve).
 */
export async function approveManagedUser(userId: string): Promise<GovernanceResult<ManagedUserRecord>> {
  return governanceApiFetch<ManagedUserRecord>(
    `/api/management/governance/users/${encodeURIComponent(userId)}/approve`,
    { method: "POST" }
  );
}

/**
 * Rejects a pending staff or admin account (POST /api/management/governance/users/[id]/reject).
 */
export async function rejectManagedUser(
  userId: string,
  reason?: string
): Promise<GovernanceResult<ManagedUserRecord>> {
  return governanceApiFetch<ManagedUserRecord>(
    `/api/management/governance/users/${encodeURIComponent(userId)}/reject`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    }
  );
}

/**
 * Suspends an active staff or admin account (POST /api/management/governance/users/[id]/suspend).
 */
export async function suspendManagedUser(
  userId: string,
  reason?: string
): Promise<GovernanceResult<ManagedUserRecord>> {
  return governanceApiFetch<ManagedUserRecord>(
    `/api/management/governance/users/${encodeURIComponent(userId)}/suspend`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    }
  );
}

/**
 * Reactivates a suspended staff or admin account (POST /api/management/governance/users/[id]/reactivate).
 */
export async function reactivateManagedUser(
  userId: string
): Promise<GovernanceResult<ManagedUserRecord>> {
  return governanceApiFetch<ManagedUserRecord>(
    `/api/management/governance/users/${encodeURIComponent(userId)}/reactivate`,
    { method: "POST" }
  );
}

/**
 * Permanently soft-deletes a staff or admin account (DELETE /api/management/governance/users/[id]).
 */
export async function deleteManagedUser(
  userId: string
): Promise<GovernanceResult<{ deleted: boolean; userId: string }>> {
  return governanceApiFetch<{ deleted: boolean; userId: string }>(
    `/api/management/governance/users/${encodeURIComponent(userId)}`,
    { method: "DELETE" }
  );
}

/**
 * Retrieves paginated immutable governance audit ledger (GET /api/management/governance/audit-logs).
 */
export async function fetchGovernanceAuditLogs(filters?: {
  action?: string;
  actorId?: string;
  targetUserId?: string;
  limit?: number;
  offset?: number;
}): Promise<GovernanceResult<AuditLogsListData>> {
  const params = new URLSearchParams();
  if (filters?.action) params.set("action", filters.action);
  if (filters?.actorId) params.set("actor_id", filters.actorId);
  if (filters?.targetUserId) params.set("target_user_id", filters.targetUserId);
  if (typeof filters?.limit === "number") params.set("limit", String(filters.limit));
  if (typeof filters?.offset === "number") params.set("offset", String(filters.offset));

  const qs = params.toString();
  const endpoint = qs
    ? `/api/management/governance/audit-logs?${qs}`
    : "/api/management/governance/audit-logs";
  return governanceApiFetch<AuditLogsListData>(endpoint);
}
