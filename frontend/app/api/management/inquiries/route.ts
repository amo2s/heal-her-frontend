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

  const searchParams = req.nextUrl.searchParams;
  const rawStatus = searchParams.get("status");
  const rawLimit = searchParams.get("limit");
  const rawOffset = searchParams.get("offset");
  const rawSearch = searchParams.get("search");

  const query = new URLSearchParams();

  // Validate optional status
  if (rawStatus && rawStatus.trim() !== "") {
    const s = rawStatus.trim().toUpperCase();
    if (s !== "OPEN" && s !== "REPLIED" && s !== "CLOSED") {
      return buildManagementError(
        "INVALID_REQUEST",
        "Query parameter 'status' must strictly be OPEN, REPLIED, or CLOSED",
        400
      );
    }
    query.set("status", s);
  }

  // Validate optional limit
  if (rawLimit && rawLimit.trim() !== "") {
    const l = parseInt(rawLimit.trim(), 10);
    if (isNaN(l) || l <= 0) {
      return buildManagementError(
        "INVALID_REQUEST",
        "Query parameter 'limit' must be a positive integer between 1 and 100",
        400
      );
    }
    query.set("limit", String(Math.min(l, 100)));
  }

  // Validate optional offset
  if (rawOffset && rawOffset.trim() !== "") {
    const o = parseInt(rawOffset.trim(), 10);
    if (isNaN(o) || o < 0) {
      return buildManagementError(
        "INVALID_REQUEST",
        "Query parameter 'offset' must be a non-negative integer",
        400
      );
    }
    query.set("offset", String(o));
  }

  // Sanitize optional search (cap to 100 characters)
  if (rawSearch && rawSearch.trim() !== "") {
    const trimmed = rawSearch.trim();
    const runes = Array.from(trimmed);
    const capped = runes.length > 100 ? runes.slice(0, 100).join("") : trimmed;
    query.set("search", capped);
  }

  const clientIP = extractVisitorIP(req);
  const qs = query.toString();
  const upstreamPath = qs ? `/api/v1/inquiries?${qs}` : "/api/v1/inquiries";

  return dispatchAuthenticatedUpstream({
    path: upstreamPath,
    method: "GET",
    clientIP,
    token,
  });
}
