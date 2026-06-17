import { NextResponse } from "next/server";
import { auth } from "./auth";

// Protect all routes under /admin, /leaves, /profile, /requests, /schedule, and the root / dashboard
const protectedRoutes = ["/", "/leaves", "/admin", "/profile", "/requests", "/schedule"];

// Simple In-Memory Rate Limiter (Token Bucket) per Edge Isolate
const RATE_LIMIT = 20; // max requests
const WINDOW_MS = 10 * 1000; // 10 seconds
const ipTracker = new Map<string, { count: number; resetAt: number }>();

export default auth((req) => {
    const { nextUrl } = req;
    
    // --- RATE LIMITING LOGIC ---
    // Extract IP address from standard Vercel/Next.js headers
    const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
    const now = Date.now();
    
    let rateData = ipTracker.get(ip);
    if (!rateData || now > rateData.resetAt) {
        rateData = { count: 1, resetAt: now + WINDOW_MS };
        ipTracker.set(ip, rateData);
    } else {
        rateData.count++;
        if (rateData.count > RATE_LIMIT) {
            return new NextResponse("429 Too Many Requests - Please slow down.", { status: 429 });
        }
    }
    // ---------------------------

    const isLoggedIn = !!req.auth;

    const isProtectedRoute = protectedRoutes.some(route =>
        nextUrl.pathname === route || nextUrl.pathname.startsWith(`${route}/`)
    );

    if (!isLoggedIn && isProtectedRoute) {
        if (nextUrl.pathname === "/login") {
            return; // already on login page
        }
        const redirectUrl = new URL("/login", nextUrl.origin);
        redirectUrl.searchParams.set("callbackUrl", nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
    }

    let response = NextResponse.next();

    // Force default password change
    if (isLoggedIn) {
        const requiresPasswordChange = req.auth?.user?.requiresPasswordChange;
        const isPasswordChangePath = nextUrl.pathname.startsWith("/profile");

        if (requiresPasswordChange && !isPasswordChangePath && !nextUrl.pathname.startsWith("/api/auth")) {
            response = NextResponse.redirect(new URL("/profile", nextUrl.origin));
        }
    }

    // Redirect users who are already logged in away from the login page
    if (isLoggedIn && nextUrl.pathname === "/login") {
        response = NextResponse.redirect(new URL("/", nextUrl.origin));
    }

    // Role-based protection for /admin routes
    if (isLoggedIn && nextUrl.pathname.startsWith("/admin")) {
        const userRole = req.auth?.user?.role;
        
        // 1. Block regular employees entirely from /admin
        if (userRole !== "ADMIN" && userRole !== "MANAGER") {
            response = NextResponse.redirect(new URL("/", nextUrl.origin));
        }

        // 2. Strict Supervisor (MANAGER) Restrictions
        // Managers handle team tasks (Leaves, Reports, Schedules), but NOT global system settings.
        if (userRole === "MANAGER") {
            const restrictedManagerRoutes = ["/admin/holidays", "/admin/announcements"];
            const isRestricted = restrictedManagerRoutes.some(route => 
                nextUrl.pathname === route || nextUrl.pathname.startsWith(`${route}/`)
            );
            
            if (isRestricted) {
                response = NextResponse.redirect(new URL("/", nextUrl.origin));
            }
        }
    }

    // Apply strict security headers to the final response to foolproof against XSS and Clickjacking
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

    return response;
});

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
