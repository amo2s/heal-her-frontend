import {
  buildPublicAuthError,
  buildPublicAuthResponse,
  extractVisitorIP,
  isSameOriginPublicRequest,
  parseBoundedPublicJsonBody,
  UPSTREAM_AUTH_TIMEOUT_MS,
  validatePasswordEntropy,
} from "@/lib/public-auth-server";

export async function POST(request: Request) {
  try {
    // 1. Same-Origin CSRF Guard (SEC-006)
    if (!isSameOriginPublicRequest(request)) {
      return buildPublicAuthError("Cross-origin requests are forbidden.", 403);
    }

    // 2. Streamed 16 KB Bounded Body & Strict Key Allowlist (SEC-006)
    const allowedKeys = new Set([
      "fullName",
      "full_name",
      "email",
      "password",
      "age",
      "website",
      "bot_trap",
      "botTrap",
    ]);
    const parseResult = await parseBoundedPublicJsonBody(request, allowedKeys);
    if (!parseResult.ok) {
      return parseResult.errorResponse;
    }

    const raw = parseResult.data;

    // 3. Honeypot check for automated bots
    if (raw.website || raw.bot_trap || raw.botTrap) {
      return buildPublicAuthError("Registration rejected.", 400);
    }

    const fullName =
      typeof raw.fullName === "string"
        ? raw.fullName.trim()
        : typeof raw.full_name === "string"
        ? raw.full_name.trim()
        : "";
    const email = typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
    const password = typeof raw.password === "string" ? raw.password : "";
    const age =
      typeof raw.age === "number"
        ? raw.age
        : typeof raw.age === "string"
        ? parseInt(raw.age, 10)
        : NaN;

    if (!email || !password || !fullName || isNaN(age)) {
      return buildPublicAuthError("All fields are required.", 400);
    }

    // 4. Zero-Dependency Password Complexity Gate (SEC-004)
    const pwdValidation = validatePasswordEntropy(password);
    if (!pwdValidation.isValid) {
      return buildPublicAuthError(
        pwdValidation.error || "Password does not meet complexity requirements.",
        400
      );
    }

    const backendUrl = process.env.BACKEND_URL || "https://sliverboy-healher-backend.hf.space/graphql";
    const realIp = extractVisitorIP(request);

    const query = `
      mutation SignupMutation($email: String!, $password: String!, $fullName: String!, $age: Int!) {
        signup(email: $email, password: $password, fullName: $fullName, age: $age) {
          status
          message
          userId
        }
      }
    `;

    // 5. Upstream fetch with 12s timeout & internal handshake
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
          email,
          password,
          fullName,
          age,
        },
      }),
      signal: AbortSignal.timeout(UPSTREAM_AUTH_TIMEOUT_MS),
    });

    const result = await response.json();

    if (result.errors || !response.ok) {
      const errorMsg = result.errors?.[0]?.message || "Signup failed.";
      return buildPublicAuthError(errorMsg, 400);
    }

    return buildPublicAuthResponse(
      {
        status: result.data.signup.status,
        message: result.data.signup.message,
      },
      200
    );
  } catch (error: any) {
    if (error?.name === "TimeoutError" || error?.name === "AbortError") {
      return buildPublicAuthError("Signup service timed out. Please try again.", 504);
    }
    console.error("[SIGNUP PROXY ERROR]:", error?.message || error);
    return buildPublicAuthError("Internal Proxy Error. Security team notified.", 500);
  }
}
