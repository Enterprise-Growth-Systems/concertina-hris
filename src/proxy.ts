import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";

// Protect all routes under /admin, /leaves, /timesheets, and the root / dashboard
const protectedRoutes = ["/", "/timesheets", "/leaves", "/admin/leaves"];

export default auth((req) => {
    const { nextUrl } = req;
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
        const requiresPasswordChange = (req.auth?.user as any)?.requiresPasswordChange;
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
        const userRole = (req.auth?.user as any)?.role;
        
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
