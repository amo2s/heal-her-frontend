import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// =====================================================================
// HELPER: JWT DECODER (Edge-Compatible)
// =====================================================================
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null; 
  }
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Extract keys from the Vault
  let accessToken = request.cookies.get('sb-access-token')?.value;
  let refreshToken = request.cookies.get('sb-refresh-token')?.value; // Changed to let
  let hasRefreshed = false;

  // =====================================================================
  // 1. THE SMART NEGOTIATOR: SILENT REFRESH LOGIC
  // =====================================================================
  const payload = accessToken ? parseJwt(accessToken) : null;
  // Buffer: Consider token expired if it dies in the next 60 seconds
  const isExpired = !payload || (payload.exp && Date.now() >= (payload.exp * 1000) - 60000);

  if (isExpired && refreshToken) {
    try {
      const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000/graphql";
      
      const refreshQuery = `
        mutation RefreshToken($token: String!) {
          refreshToken(token: $token) {
            accessToken
            refreshToken
          }
        }
      `;

      const refreshRes = await fetch(backendUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-healher-handshake": process.env.NEXT_PUBLIC_HANDSHAKE_SECRET || "" 
        },
        body: JSON.stringify({
          query: refreshQuery,
          variables: { token: refreshToken }
        }),
      });

      const refreshData = await refreshRes.json();
      
      // Extract both new tokens
      const newAccessToken = refreshData?.data?.refreshToken?.accessToken;
      const newRefreshToken = refreshData?.data?.refreshToken?.refreshToken;

      if (newAccessToken && newRefreshToken) {
        accessToken = newAccessToken;
        refreshToken = newRefreshToken;
        hasRefreshed = true;
      } else {
        // If refresh fails or returns junk, kill the tokens to force a login redirect
        accessToken = undefined; 
        refreshToken = undefined;
      }
    } catch (error) {
      console.error("[PROXY REFRESH ERROR]:", error);
      accessToken = undefined;
      refreshToken = undefined;
    }
  }

  // =====================================================================
  // 2. ROUTE INTERCEPTOR (Authentication & Smart Routing)
  // =====================================================================
  const isDashboard = path.startsWith('/dashboard');
  
  if (isDashboard) {
    
    // LAYER 1: AUTHENTICATION CHECK
    // If no token exists, cleanly redirect to login and wipe stale cookies.
    if (!accessToken) {
      const redirectRes = NextResponse.redirect(new URL('/login', request.url));
      redirectRes.cookies.delete('sb-access-token');
      redirectRes.cookies.delete('sb-refresh-token');
      return redirectRes;
    }

    // LAYER 2: DYNAMIC SEGMENT ROUTING (No Hardcoding)
    if (path === '/dashboard') {
      const activePayload = parseJwt(accessToken);
      const rawSegment = activePayload?.dashboard;
      
      if (rawSegment) {
        const targetRoute = rawSegment === 'young_adult' ? 'young-adults' : rawSegment;
        return NextResponse.redirect(new URL(`/dashboard/${targetRoute}`, request.url));
      }
    }
  }

  // =====================================================================
  // 3. UNIVERSAL BEARER INJECTION (The Magic Trick)
  // =====================================================================
  const requestHeaders = new Headers(request.headers);
  
  if (accessToken) {
    // Invisibly attach the cookie token as an Authorization header for the backend
    requestHeaders.set('Authorization', `Bearer ${accessToken}`);
  }

  // Create the response object carrying the modified headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // =====================================================================
  // 4. APPLY REFRESHED COOKIES TO RESPONSE
  // =====================================================================
  if (hasRefreshed && accessToken && refreshToken) {
    // Save the new 15-minute access token
    response.cookies.set({
      name: "sb-access-token",
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60, // 15 Minutes
      path: "/",
    });

    // Save the new 7-day refresh token
    response.cookies.set({
      name: "sb-refresh-token",
      value: refreshToken,
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 Days
      path: "/",
    });
  }

  // =====================================================================
  // 5. THE ARMOR: SECURITY HEADERS
  // =====================================================================
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  return response;
}

// =====================================================================
// CONFIG: THE RADAR
// =====================================================================
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/proxy/:path*' 
  ]
}