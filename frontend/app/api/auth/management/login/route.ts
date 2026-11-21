import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getPortalBasePath,
  normalizeApprovalStatus,
  normalizeGovernanceRole,
} from "@/lib/management-governance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, website, botTrap, bot_trap } = body;

    // 1. Basic Perimeter Defense
    if (!email || !password) {
      return NextResponse.json(
        { detail: "Missing cryptographic parameters." },
        { status: 400 }
      );
    }

    // 2. Dual-Layer Honeypot Bot Trap
    if (website || botTrap || bot_trap) {
      const ip = request.headers.get("x-forwarded-for") || "unknown";
      console.warn(`[LOGIN BOT TRAPPED] IP: ${ip}`);
      return NextResponse.json(
        { detail: "Invalid administrative credentials." },
        { status: 400 }
      );
    }

    const rawBackendUrl = process.env.BACKEND_URL || "https://sliverboy-healher-backend.hf.space";
    const backendBase = rawBackendUrl.replace(/\/graphql$/, "").replace(/\/$/, "");

    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "HealHer-NextJS-Management-Login-BFF/1.0";
    const handshakeSecret = process.env.FRONTEND_HANDSHAKE_SECRET || "";

    const normalizedEmail = email.trim().toLowerCase();

    // 3. Try Rust Auth REST Endpoint First: POST /api/v1/auth/login
    let accessToken: string | null = null;
    let refreshToken: string | null = null;
    let userRecord: any = null;

    try {
      const restRes = await fetch(`${backendBase}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "x-healher-handshake": handshakeSecret,
          "x-forwarded-for": realIp,
          "x-real-ip": realIp,
          "user-agent": userAgent,
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
          bot_trap: "",
        }),
        cache: "no-store",
      });

      if (restRes.ok) {
        const restData = await restRes.json();
        accessToken = restData.accessToken || restData.access_token;
        refreshToken = restData.refreshToken || restData.refresh_token;
        userRecord = restData.user;
      } else if (restRes.status === 401 || restRes.status === 403) {
        const errJson = await restRes.json().catch(() => null);
        const errMsg =
          errJson?.message || errJson?.detail || "Invalid administrative credentials.";
        return NextResponse.json({ detail: errMsg }, { status: restRes.status });
      }
    } catch (restErr) {
      console.warn("[MANAGEMENT LOGIN REST PROBE FAILED, ATTEMPTING GRAPHQL]", restErr);
    }

    // 4. Fallback to Strawberry GraphQL if REST endpoint was not reachable (e.g. standalone dev)
    if (!accessToken || !userRecord) {
      const graphqlUrl = `${backendBase}/graphql`;
      const query = `
        mutation AdminLoginMutation($inputData: AdminLoginInput!) {
          adminLogin(inputData: $inputData) {
            status
            message
            accessToken
            refreshToken
            user {
              id
              email
              fullName
              isActive
              dashboard
            }
          }
        }
      `;

      const gqlRes = await fetch(graphqlUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-healher-handshake": handshakeSecret,
          "x-forwarded-for": realIp,
          "user-agent": userAgent,
        },
        body: JSON.stringify({
          query,
          variables: {
            inputData: {
              email: normalizedEmail,
              password,
              website: "",
            },
          },
        }),
      });

      const gqlData = await gqlRes.json().catch(() => null);

      if (gqlData?.errors || !gqlRes.ok || !gqlData?.data?.adminLogin) {
        const errorMsg =
          gqlData?.errors?.[0]?.message || "Invalid administrative credentials.";
        return NextResponse.json({ detail: errorMsg }, { status: 400 });
      }

      const loginResult = gqlData.data.adminLogin;
      accessToken = loginResult.accessToken;
      refreshToken = loginResult.refreshToken;
      userRecord = loginResult.user;
    }

    if (!accessToken || !refreshToken || !userRecord) {
      return NextResponse.json(
        { detail: "Invalid administrative credentials." },
        { status: 400 }
      );
    }

    // 5. Parse JWT Claims for Canonical 3-Tier Governance Role & Approval Status
    const jwtPayload = parseJwt(accessToken);
    const rawRole =
      userRecord.role ||
      jwtPayload?.role ||
      userRecord.dashboard ||
      jwtPayload?.dashboard;

    const canonicalRole = normalizeGovernanceRole(rawRole);
    if (!canonicalRole) {
      console.warn(`[MANAGEMENT LOGIN REJECTED] Non-management role detected: ${rawRole}`);
      return NextResponse.json(
        { detail: "Access denied. Management clearance required." },
        { status: 403 }
      );
    }

    const rawStatus =
      userRecord.approval_status ||
      userRecord.approvalStatus ||
      jwtPayload?.approval_status ||
      jwtPayload?.approvalStatus ||
      "APPROVED";

    const approvalStatus = normalizeApprovalStatus(rawStatus) || "APPROVED";

    if (approvalStatus === "REJECTED") {
      return NextResponse.json(
        { detail: "Account registration was rejected." },
        { status: 403 }
      );
    }

    // 6. Isolated HttpOnly Cookie Injection
    const isProduction = process.env.NODE_ENV === "production";
    const cookieStore = await cookies();

    // Access Token: 15 Minutes
    cookieStore.set({
      name: "admin-access-token",
      value: accessToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 15 * 60,
      path: "/",
    });

    // Refresh Token: 7 Days
    cookieStore.set({
      name: "admin-refresh-token",
      value: refreshToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    // 7. Route Allocation
    const portalPath =
      approvalStatus === "APPROVED"
        ? getPortalBasePath(canonicalRole)
        : "/management/pending";

    // 8. Sterile Egress (Tokens stripped from JSON body)
    return NextResponse.json({
      status: "success",
      message: "Authentication successful",
      user: {
        id: userRecord.id,
        email: userRecord.email,
        fullName: userRecord.fullName || userRecord.full_name || "",
        role: canonicalRole,
        approvalStatus,
        portalPath,
      },
    });
  } catch (error: any) {
    console.error("[ADMIN LOGIN PROXY ERROR]:", error.message);
    return NextResponse.json(
      { detail: "Internal Proxy Error. Security team notified." },
      { status: 500 }
    );
  }
}
