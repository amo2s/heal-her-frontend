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

  // =====================================================================
  // 1. THE RADAR & BYPASS (Allow public login pages through)
  // =====================================================================
  if (path.startsWith('/management/auth/login') || path === '/login') {
    return NextResponse.next();
  }

  const isManagementRoute = path.startsWith('/management');
  const isDashboardRoute = path.startsWith('/dashboard');

  // If the route is neither (e.g., an unlisted API or public page), just pass it.
  if (!isManagementRoute && !isDashboardRoute && !path.startsWith('/api/proxy')) {
    return NextResponse.next();
  }

  // =====================================================================
  // 2. VAULT EXTRACTION (Dual-Mode Intelligence)
  // =====================================================================
  const userAccess = request.cookies.get('sb-access-token')?.value;
  const userRefresh = request.cookies.get('sb-refresh-token')?.value;
  
  const adminAccess = request.cookies.get('admin-access-token')?.value;
  const adminRefresh = request.cookies.get('admin-refresh-token')?.value;

  let activeAccessToken: string | undefined = undefined;
  let newTokensToInject: { access: string, refresh: string, type: 'admin' | 'user' } | null = null;

  // =====================================================================
  // 3. CROSS-POLLINATION SHIELDS (The Bouncer)
  // =====================================================================
  if (isManagementRoute) {
    if (!adminAccess && !adminRefresh) {
      // No admin keys. Are they a Kid/Teen snooping?
      if (userAccess || userRefresh) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      // Just a visitor without keys. Kick to Admin Login.
      return NextResponse.redirect(new URL('/management/auth/login', request.url));
    }
  }

  if (isDashboardRoute) {
    if (!userAccess && !userRefresh) {
      // No user keys. Are they an Admin testing links?
      if (adminAccess || adminRefresh) {
        return NextResponse.redirect(new URL('/management/dashboard', request.url));
      }
      // Just a visitor without keys. Kick to Public Login.
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // =====================================================================
  // 4. THE TWIN ENGINES: CONTEXT-AWARE SILENT REFRESH
  // =====================================================================
  const backendUrl = process.env.BACKEND_URL || "https://sliverboy-healher-backend.hf.space/graphql";
  const handshakeSecret = process.env.NEXT_PUBLIC_HANDSHAKE_SECRET || "";

  if (isManagementRoute) {
    activeAccessToken = adminAccess;
    const payload = adminAccess ? parseJwt(adminAccess) : null;
    const isExpired = !payload || (payload.exp && Date.now() >= (payload.exp * 1000) - 60000);

    if (isExpired && adminRefresh) {
      try {
        // EXTREMIST REFRESH: Includes IP & User-Agent for Blood-Binding
        const forwardedFor = request.headers.get("x-forwarded-for") || "127.0.0.1";
        const userAgent = request.headers.get("user-agent") || "unknown";

        const refreshRes = await fetch(backendUrl, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-healher-handshake": handshakeSecret,
            "x-forwarded-for": forwardedFor,
            "user-agent": userAgent
          },
          body: JSON.stringify({
            query: `mutation AdminRefresh($token: String!) { adminRefreshToken(refreshToken: $token) { accessToken refreshToken } }`,
            variables: { token: adminRefresh }
          }),
        });

        const refreshData = await refreshRes.json();
        const access = refreshData?.data?.adminRefreshToken?.accessToken;
        const refresh = refreshData?.data?.adminRefreshToken?.refreshToken;

        if (access && refresh) {
          activeAccessToken = access;
          newTokensToInject = { access, refresh, type: 'admin' };
        } else {
          throw new Error("Invalid rotation payload.");
        }
      } catch (error) {
        console.error("[ADMIN REFRESH FATAL]:", error);
        const res = NextResponse.redirect(new URL('/management/auth/login', request.url));
        res.cookies.delete('admin-access-token');
        res.cookies.delete('admin-refresh-token');
        return res;
      }
    }
  } 
  
  else if (isDashboardRoute) {
    activeAccessToken = userAccess;
    const payload = userAccess ? parseJwt(userAccess) : null;
    const isExpired = !payload || (payload.exp && Date.now() >= (payload.exp * 1000) - 60000);

    if (isExpired && userRefresh) {
      try {
        // STANDARD REFRESH: Only requires Handshake
        const refreshRes = await fetch(backendUrl, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-healher-handshake": handshakeSecret 
          },
          body: JSON.stringify({
            query: `mutation RefreshToken($token: String!) { refreshToken(token: $token) { accessToken refreshToken } }`,
            variables: { token: userRefresh }
          }),
        });

        const refreshData = await refreshRes.json();
        const access = refreshData?.data?.refreshToken?.accessToken;
        const refresh = refreshData?.data?.refreshToken?.refreshToken;

        if (access && refresh) {
          activeAccessToken = access;
          newTokensToInject = { access, refresh, type: 'user' };
        } else {
          throw new Error("Invalid rotation payload.");
        }
      } catch (error) {
        console.error("[USER REFRESH FATAL]:", error);
        const res = NextResponse.redirect(new URL('/login', request.url));
        res.cookies.delete('sb-access-token');
        res.cookies.delete('sb-refresh-token');
        return res;
      }
    }
  }

  // =====================================================================
  // 5. THE EXACT PATH BAN (Strict Domain Routing)
  // =====================================================================
  // At this point, activeAccessToken is mathematically guaranteed to be valid.
  
  // Rule A: Enforce the Management Exact Path
  if (path === '/management' || path === '/management/') {
    return NextResponse.redirect(new URL('/management/dashboard', request.url));
  }

  // Rule B: Enforce the User Exact Path
  if (path === '/dashboard' || path === '/dashboard/') {
    const activePayload = parseJwt(activeAccessToken as string);
    const rawSegment = activePayload?.dashboard;
    
    if (rawSegment) {
      const targetRoute = rawSegment === 'young_adult' ? 'young-adults' : rawSegment;
      return NextResponse.redirect(new URL(`/dashboard/${targetRoute}`, request.url));
    } else {
      // If the token is strangely missing the dashboard claim, annihilate it.
      const res = NextResponse.redirect(new URL('/login', request.url));
      res.cookies.delete('sb-access-token');
      res.cookies.delete('sb-refresh-token');
      return res;
    }
  }

  // =====================================================================
  // 6. UNIVERSAL BEARER INJECTION (The Magic Trick)
  // =====================================================================
  const requestHeaders = new Headers(request.headers);
  if (activeAccessToken) {
    requestHeaders.set('Authorization', `Bearer ${activeAccessToken}`);
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // =====================================================================
  // 7. SECURE COOKIE INJECTION (Post-Refresh)
  // =====================================================================
  if (newTokensToInject) {
    const prefix = newTokensToInject.type === 'admin' ? 'admin' : 'sb';
    const isProduction = process.env.NODE_ENV === "production";

    response.cookies.set({
      name: `${prefix}-access-token`,
      value: newTokensToInject.access,
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 15 * 60, // 15 Minutes
      path: "/",
    });

    response.cookies.set({
      name: `${prefix}-refresh-token`,
      value: newTokensToInject.refresh,
      httpOnly: true, 
      secure: isProduction,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 Days
      path: "/",
    });
  }

  // =====================================================================
  // 8. THE ARMOR: SECURITY HEADERS
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
    '/management/:path*', 
    '/api/proxy/:path*' 
  ]
}