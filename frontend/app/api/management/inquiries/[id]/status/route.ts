import { NextRequest } from "next/server";
import { isValidUuid, validateInquiryStatus } from "@/lib/management-inquiries";
import {
  buildManagementError,
  dispatchAuthenticatedUpstream,
  extractAdminAccessToken,
  extractVisitorIP,
  isSameOriginRequest,
  parseBoundedJsonBody,
} from "@/lib/management-inquiries-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_STATUS_KEYS = new Set(["status"]);

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // 1. Same-Origin CSRF Guard for mutations
  if (!isSameOriginRequest(req)) {
    return buildManagementError("FORBIDDEN", "Cross-origin request rejected", 403);
  }

  // 2. Validate URL UUID parameter
  const { id } = await context.params;
  if (!isValidUuid(id)) {
    return buildManagementError(
      "INVALID_REQUEST",
      "Invalid inquiry UUID parameter format",
      400
    );
  }

  // 3. Extract HttpOnly access token
  const token = await extractAdminAccessToken(req);
  if (!token) {
    return buildManagementError(
      "UNAUTHORIZED",
      "Authentication required. Please sign in to update inquiry status.",
      401
    );
  }

  // 4. Streamed 16 KB body cap & strict allowlist parsing
  const parsedResult = await parseBoundedJsonBody(req, ALLOWED_STATUS_KEYS);
  if (!parsedResult.ok) {
    return parsedResult.errorResponse;
  }

  // 5. Mirrored validation of ticket status (OPEN, REPLIED, CLOSED)
  const { isValid, status, error } = validateInquiryStatus(parsedResult.data.status);
  if (!isValid || !status) {
    return buildManagementError(
      "VALIDATION_ERROR",
      error || "Validation failed on status",
      422,
      { status: error || "Invalid ticket status" }
    );
  }

  const clientIP = extractVisitorIP(req);

  return dispatchAuthenticatedUpstream({
    path: `/api/v1/inquiries/${encodeURIComponent(id)}/status`,
    method: "PATCH",
    body: JSON.stringify({ status }),
    clientIP,
    token,
  });
}
