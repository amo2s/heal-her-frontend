import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Point this to where your Go server is running
const GO_BACKEND_URL = process.env.GO_BACKEND_URL || "http://127.0.0.1:8081";

/**
 * Advanced Proxy Handler for Next.js 15/16
 * Handles Promise-based params and secure token forwarding.
 */
async function handleProxy(
  req: NextRequest, 
  { params }: { params: Promise<{ path?: string[] }> } // Type as Promise for Next.js 15/16
) {
  try {
    // 1. UNWRAP PARAMS (The "Brutal" Next.js 16 Fix)
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path ? resolvedParams.path.join("/") : "";
    
    // 2. Reconstruct the Target URL
    const searchParams = req.nextUrl.search;
    const targetUrl = `${GO_BACKEND_URL}/${pathSegments}${searchParams}`;

    // 3. SECURE VAULT: Extract the Token from HTTP-Only Cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("sb-access-token")?.value;

    // 4. Prepare Forwarding Headers
    const headers = new Headers();
    
    // Inject Authorization Header for Go Middleware
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // Forward Identity and Context
    headers.set("x-forwarded-for", req.headers.get("x-forwarded-for") || "127.0.0.1");
    headers.set("user-agent", req.headers.get("user-agent") || "Next.js-Proxy");
    
    // Maintain Content-Type integrity (JSON, Multipart, etc.)
    const contentType = req.headers.get("content-type");
    if (contentType) {
      headers.set("Content-Type", contentType);
    }

    // 5. Handle Body Payload for Write Operations
    let body: ArrayBuffer | null = null;
    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      body = await req.arrayBuffer(); 
    }

    // 6. Execute Request to Go Microservice
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      redirect: "manual", // Don't follow redirects; pass them to the client
    });

    // 7. Stream Response back to Frontend
    const responseBuffer = await response.arrayBuffer();
    
    return new NextResponse(responseBuffer, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    });

  } catch (error: any) {
    console.error("[GO PROXY CRITICAL ERROR]:", error.message);
    return NextResponse.json(
      { 
        status: "error", 
        message: "Go Microservice unreachable. The bridge has collapsed.",
        detail: error.message 
      },
      { status: 502 }
    );
  }
}

// Map all standard HTTP methods to the proxy handler
export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const DELETE = handleProxy;
export const PATCH = handleProxy;