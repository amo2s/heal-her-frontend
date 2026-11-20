import { NextRequest } from "next/server";
import {
  buildManagementError,
  dispatchAuthenticatedUpstream,
  extractAdminAccessToken,
  extractVisitorIP,
} from "@/lib/management-inquiries-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
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
    path: "/api/v1/inquiries/stats",
    method: "GET",
    clientIP,
    token,
  });
}
