// =====================================================================
// 1. THE FORTRESS ERROR BOUNDARY
// =====================================================================
/**
 * Custom error class to handle structured API responses and status codes.
 * This allows the UI to catch specific errors (like 401 or 403) and 
 * react accordingly (e.g., showing a specific "Banned" modal).
 */
export class FortressError extends Error {
  public status: number;
  public payload: any;

  constructor(message: string, status: number, payload?: any) {
    super(message);
    this.name = "FortressError";
    this.status = status;
    this.payload = payload;
  }
}

// =====================================================================
// 2. THE ISOMORPHIC COURIER (Admin-Only Fetcher)
// =====================================================================
/**
 * fortressFetch: The universal data fetching engine for the Management Shell.
 * 
 * DESIGN PHILOSOPHY:
 * - Server: Calls the Go/FastAPI backend directly (Direct Connect).
 * - Client: Calls /api/proxy (Shielded Connect) to hide the backend.
 * - Security: Strictly enforces Admin Identity using only the Access Token.
 */
export async function fortressFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const isServer = typeof window === "undefined";
  
  // Normalize the endpoint (remove leading slash if present)
  const cleanPath = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;

  let targetUrl: string;
  const headers = new Headers(options.headers);

  // =====================================================================
  // PATH A: SERVER-SIDE (Direct Handshake)
  // =====================================================================
  if (isServer) {
    // 1. Skip the Proxy Route entirely to save latency.
    const backendUrl = process.env.BACKEND_URL || "https://sliverboy-healher-backend.hf.space";
    targetUrl = `${backendUrl}/${cleanPath}`;

    // 2. Dynamic Server Import (The "Isomorphic" Key)
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    
    // 3. STRICT ADMIN TOKEN EXTRACTION
    // We ONLY use the Access Token. The Refresh Token cannot be used 
    // as an Authorization Bearer because it lacks the "sub" claim.
    const accessToken = cookieStore.get("admin-access-token")?.value;
    
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    
    // 4. Server-to-Server Handshake Secret (STRICT ADHERENCE)
    headers.set("x-healher-handshake", process.env.FRONTEND_HANDSHAKE_SECRET || "");
  } 
  
  // =====================================================================
  // PATH B: CLIENT-SIDE (Shielded Proxy)
  // =====================================================================
  else {
    // We route through the Next.js API Proxy to hide the Backend URL from the Network Tab.
    targetUrl = `/api/proxy/${cleanPath}`;
    
    // NOTE: We do not manually set the Authorization header here.
    // The Next.js Middleware intercepts these requests and injects 
    // the correct Admin Bearer token before the request leaves the server.
  }

  // =====================================================================
  // 3. THE EXECUTION & PARSING ENGINE
  // =====================================================================
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(targetUrl, {
      ...options,
      headers,
    });

    // Handle 204 No Content gracefully
    if (response.status === 204) return {} as T;

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new FortressError(
        data?.detail || data?.message || "Heal Her: Fortress connection breached.",
        response.status,
        data
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof FortressError) throw error;
    
    console.error("[FORTRESS FETCH CRITICAL FAILURE]:", error);
    throw new FortressError(
      "The Fortress is unreachable. Network or Backend timeout.",
      500
    );
  }
}