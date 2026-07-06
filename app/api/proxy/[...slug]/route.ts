import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// --- THE UNIVERSAL COURIER ---
// Note the type change: params is now a Promise!
async function proxyRequest(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  
  // 1. UNWRAP THE PARAMS FIRST (This fixes your 500 error!)
  const { slug } = await params;
  
  // --- TRANSLATION LAYER FIX (ADVANCED ENUM MAP) ---
  // A strict dictionary providing O(1) lookup for all domain variations.
  // This acts as a firewall that sanitizes frontend strings before they touch Python.
  const domainDictionary: Record<string, string> = {
    "young-adult": "young_adult",
    "young-adults": "young_adult",
    "teen": "teen",
    "teens": "teen",
    "kid": "kid",
    "kids": "kid"
  };

  // Instantly translates any known mismatch, otherwise leaves the segment untouched.
  const mappedSlug = slug.map(segment => domainDictionary[segment] || segment);

  // 2. RECONSTRUCT THE TARGET URL
  const backendUrl = process.env.BACKEND_URL || "https://sliverboy-healher-backend.hf.space";
  const path = mappedSlug.join("/"); // Uses the translated slug array
  const searchParams = request.nextUrl.searchParams.toString();
  const targetUrl = `${backendUrl}/${path}${searchParams ? `?${searchParams}` : ""}`;

  // 3. RETRIEVE THE LOCKED TOKEN
  const cookieStore = await cookies();
  const token = cookieStore.get("sb-access-token")?.value;

  // 4. SANITIZE HEADERS
  const headers = new Headers(request.headers);
  headers.delete("host"); 
  headers.delete("cookie"); 

  // 5. INJECT THE FORTRESS KEYS
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  headers.set("x-healher-handshake", process.env.FRONTEND_HANDSHAKE_SECRET || "");

  // 6. PROCESS THE PAYLOAD
  let body;
  if (request.method !== "GET" && request.method !== "HEAD") {
    body = await request.text();
  }

  try {
    // 7. FIREWALL PASSTHROUGH
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      redirect: "manual", 
    });

    // 8. THE ELITE STREAMING BYPASS (Fixes the AI Chat Delay)
    // If the backend sends an event stream, pipe it directly! Do not use .text()
    if (response.headers.get("content-type")?.includes("text/event-stream")) {
      return new NextResponse(response.body, {
        status: response.status,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    // 9. PACKAGE STANDARD RESPONSES (GraphQL, History, etc.)
    const responseData = await response.text();
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("content-encoding");

    return new NextResponse(responseData, {
      status: response.status,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error("[UNIVERSAL PROXY ERROR]:", error);
    return NextResponse.json(
      { detail: "Heal Her Firewall: Proxy connection failed." },
      { status: 500 }
    );
  }
}

// --- EXPORT ALL METHODS ---
export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;