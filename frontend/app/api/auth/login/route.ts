import { cookies } from "next/headers";
import {
  buildPublicAuthError,
  buildPublicAuthResponse,
  extractVisitorIP,
  isSameOriginPublicRequest,
  parseBoundedPublicJsonBody,
  UPSTREAM_AUTH_TIMEOUT_MS,
} from "@/lib/public-auth-server";

interface LoginResponse {
  data?: {
    login: {
      status: string;
      message: string;
      accessToken: string;
      refreshToken: string;
      user: {
        id: string;
        email: string;
        fullName: string;
        isActive: boolean;
        dashboard: string;
      };
    };
  };
  errors?: Array<{ message: string }>;
}

export async function POST(request: Request) {
  try {
    // 1. Same-Origin CSRF Guard (SEC-006)
    if (!isSameOriginPublicRequest(request)) {
      return buildPublicAuthError("Cross-origin requests are forbidden.", 403);
    }

    // 2. Streamed 16 KB Bounded Body & Strict Key Allowlist (SEC-006)
    const allowedKeys = new Set(["email", "password", "website", "bot_trap", "botTrap"]);
    const parseResult = await parseBoundedPublicJsonBody(request, allowedKeys);
    if (!parseResult.ok) {
      return parseResult.errorResponse;
    }

    const raw = parseResult.data;

    // 3. Honeypot check for automated bots
    if (raw.website || raw.bot_trap || raw.botTrap) {
      return buildPublicAuthError("Invalid credentials.", 401);
    }

    const email = typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
    const password = typeof raw.password === "string" ? raw.password : "";

    if (!email || !password) {
      return buildPublicAuthError("Email and password are required.", 400);
    }

    const backendUrl = process.env.BACKEND_URL || "https://sliverboy-healher-backend.hf.space/graphql";
    const realIp = extractVisitorIP(request);

    const query = `
      mutation LoginMutation($inputData: LoginInput!) {
        login(inputData: $inputData) {
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

    // 4. Upstream fetch with 12s timeout & internal handshake
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-healher-handshake": process.env.FRONTEND_HANDSHAKE_SECRET || "",
        "x-forwarded-for": realIp,
      },
      body: JSON.stringify({
        query,
        variables: {
          inputData: {
            email,
            password,
          },
        },
      }),
      signal: AbortSignal.timeout(UPSTREAM_AUTH_TIMEOUT_MS),
    });

    const result: LoginResponse = await response.json();

    if (result.errors || !response.ok) {
      const errorMsg = result.errors?.[0]?.message || "Authentication failed.";
      return buildPublicAuthError(errorMsg, 400);
    }

    const data = result.data?.login;
    if (!data || !data.accessToken || !data.refreshToken) {
      return buildPublicAuthError("Authentication service returned an invalid session.", 502);
    }

    // 5. HttpOnly Cookies injection
    const cookieStore = await cookies();

    cookieStore.set({
      name: "sb-access-token",
      value: data.accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60, // 15 Minutes
      path: "/",
    });

    cookieStore.set({
      name: "sb-refresh-token",
      value: data.refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 Days
      path: "/",
    });

    const mappedDashboard = data.user.dashboard === "young_adult" ? "young-adults" : data.user.dashboard;

    return buildPublicAuthResponse(
      {
        status: data.status,
        message: data.message,
        user: {
          ...data.user,
          dashboard: mappedDashboard,
        },
      },
      200
    );
  } catch (error: any) {
    if (error?.name === "TimeoutError" || error?.name === "AbortError") {
      return buildPublicAuthError("Authentication service timed out. Please try again.", 504);
    }
    console.error("[LOGIN PROXY ERROR]:", error?.message || error);
    return buildPublicAuthError("Internal Proxy Error. Security team notified.", 500);
  }
}
