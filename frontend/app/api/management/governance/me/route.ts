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
      "Authentication required. Please sign in to access management profile.",
      401
    );
  }

  const clientIP = extractVisitorIP(req);

  return dispatchAuthenticatedGovernanceUpstream({
    path: "/api/v1/auth/management/me",
    method: "GET",
    clientIP,
    token,
  });
}
