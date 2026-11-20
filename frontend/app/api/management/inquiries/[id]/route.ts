import { NextRequest } from "next/server";
import { isValidUuid } from "@/lib/management-inquiries";
import {
  buildManagementError,
  dispatchAuthenticatedUpstream,
  extractAdminAccessToken,
  extractVisitorIP,
} from "@/lib/management-inquiries-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!isValidUuid(id)) {
    return buildManagementError(
      "INVALID_REQUEST",
      "Invalid inquiry UUID parameter format",
      400
    );
  }

  const token = await extractAdminAccessToken(req);
  if (!token) {
    return buildManagementError(
      "UNAUTHORIZED",
      "Authentication required. Please sign in to access management inquiries.",
      401
    );
  }

  const clientIP = extractVisitorIP(req);

  return dispatchAuthenticatedUpstream({
    path: `/api/v1/inquiries/${encodeURIComponent(id)}`,
    method: "GET",
    clientIP,
    token,
  });
}
