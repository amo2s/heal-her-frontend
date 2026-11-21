import { NextRequest } from "next/server";
import { isValidGovernanceUuid } from "@/lib/management-governance";
import {
  buildGovernanceError,
  dispatchAuthenticatedGovernanceUpstream,
  extractAdminAccessToken,
  extractVisitorIP,
  isSameOriginRequest,
} from "@/lib/management-governance-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
      "Authentication required. Please sign in to approve user account.",
      401
    );
  }

  const clientIP = extractVisitorIP(req);

  return dispatchAuthenticatedGovernanceUpstream({
    path: `/api/v1/auth/management/users/${encodeURIComponent(id)}/approve`,
    method: "POST",
    clientIP,
    token,
  });
}
