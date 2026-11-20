import { NextRequest } from "next/server";
import { isValidUuid, validateStaffReplyBody } from "@/lib/management-inquiries";
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

const ALLOWED_REPLY_KEYS = new Set(["body"]);

export async function POST(
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
      "Authentication required. Please sign in to reply to inquiries.",
      401
    );
  }

  // 4. Streamed 16 KB body cap & strict allowlist parsing
  const parsedResult = await parseBoundedJsonBody(req, ALLOWED_REPLY_KEYS);
  if (!parsedResult.ok) {
    return parsedResult.errorResponse;
  }

  // 5. Mirrored validation of reply body (2 to 10,000 runes)
  const { isValid, sanitized, error } = validateStaffReplyBody(parsedResult.data.body);
  if (!isValid) {
    return buildManagementError(
      "VALIDATION_ERROR",
      error || "Validation failed on reply body",
      422,
      { body: error || "Invalid reply body length" }
    );
  }

  const clientIP = extractVisitorIP(req);

  return dispatchAuthenticatedUpstream({
    path: `/api/v1/inquiries/${encodeURIComponent(id)}/reply`,
    method: "POST",
    body: JSON.stringify({ body: sanitized }),
    clientIP,
    token,
  });
}
