import { NextRequest } from "next/server";
import {
  isValidGovernanceUuid,
  validateGovernanceReason,
} from "@/lib/management-governance";
import {
  buildGovernanceError,
  dispatchAuthenticatedGovernanceUpstream,
  extractAdminAccessToken,
  extractVisitorIP,
  isSameOriginRequest,
  parseBoundedJsonBody,
} from "@/lib/management-governance-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_REASON_KEYS = new Set(["reason"]);

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // 1. Same-Origin CSRF Guard for mutations
  if (!isSameOriginRequest(req)) {
    return buildGovernanceError("FORBIDDEN", "Cross-origin request rejected", 403);
  }

  // 2. Validate URL UUID parameter
  const { id } = await context.params;
  if (!isValidGovernanceUuid(id)) {
    return buildGovernanceError(
      "INVALID_REQUEST",
      "Invalid user UUID parameter format",
      400
    );
  }

  // 3. Extract HttpOnly access token
  const token = await extractAdminAccessToken(req);
  if (!token) {
    return buildGovernanceError(
      "UNAUTHORIZED",
      "Authentication required. Please sign in to suspend user account.",
      401
    );
  }

  // 4. Optional bounded body parsing
  let reason: string | undefined = undefined;
  const contentType = req.headers.get("content-type") || "";
  if (contentType.toLowerCase().includes("application/json")) {
    const parsedResult = await parseBoundedJsonBody(req, ALLOWED_REASON_KEYS);
    if (!parsedResult.ok) {
      return parsedResult.errorResponse;
    }
    const valResult = validateGovernanceReason(parsedResult.data.reason);
    if (!valResult.isValid) {
      return buildGovernanceError(
        "VALIDATION_ERROR",
        valResult.error || "Invalid suspension reason",
        422,
        { reason: valResult.error || "Invalid reason" }
      );
    }
    reason = valResult.sanitized;
  }

  const clientIP = extractVisitorIP(req);

  return dispatchAuthenticatedGovernanceUpstream({
    path: `/api/v1/auth/management/users/${encodeURIComponent(id)}/suspend`,
    method: "POST",
    body: reason !== undefined ? JSON.stringify({ reason }) : undefined,
    clientIP,
    token,
  });
}
