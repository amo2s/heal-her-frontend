import { NextRequest } from "next/server";
import {
  buildGovernanceError,
  dispatchAuthenticatedGovernanceUpstream,
  extractAdminAccessToken,
  extractVisitorIP,
} from "@/lib/management-governance-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = await extractAdminAccessToken(req);
  if (!token) {
    return buildGovernanceError(
      "UNAUTHORIZED",
      "Authentication required. Please sign in to access governance audit logs.",
      401
    );
  }

  const searchParams = req.nextUrl.searchParams;
  const clientIP = extractVisitorIP(req);

  const qs = searchParams.toString();
  const path = qs
    ? `/api/v1/auth/management/audit-logs?${qs}`
    : "/api/v1/auth/management/audit-logs";

  return dispatchAuthenticatedGovernanceUpstream({
    path,
    method: "GET",
    clientIP,
    token,
  });
}
