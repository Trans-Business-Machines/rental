import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Check if user is authenticated by looking for session cookie
	const cookies = getSessionCookie(request);

	// Public routes that don't require authentication
	const publicRoutes = ["/login", "/setup", "/api/auth", "/api/better-auth"];

	// Check if the current path is a public route
	const isPublicRoute = publicRoutes.some((route) =>
		pathname.startsWith(route)
	);

	// If user is not authenticated and trying to access a protected route
	if (!cookies && !isPublicRoute) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	// If user is authenticated and trying to access login or setup page
	if (cookies && (pathname === "/login" || pathname === "/setup")) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - api routes (handled by better-auth)
		 */
		"/((?!_next/static|_next/image|favicon.ico|api).*)",
	],
};
