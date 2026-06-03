import { betterFetch } from "@better-fetch/fetch";
import type { Session } from "better-auth/types";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const { data: session } = await betterFetch<Session>(
        "/api/auth/get-session",
        {
            baseURL: request.nextUrl.origin,
            headers: {
                cookie: request.headers.get("cookie") || "",
            },
        },
    );

    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
                        request.nextUrl.pathname.startsWith('/register') || 
                        request.nextUrl.pathname.startsWith('/forgot-password') || 
                        request.nextUrl.pathname.startsWith('/reset-password');

    if (!session && !isAuthRoute) {
        // If they are not logged in and not on an auth route, redirect to login
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (session && isAuthRoute) {
        // If they are logged in and trying to access an auth route, redirect to dashboard (fallback to root if no org known here)
        // Ideally we'd know their active org, but we'll handle that on the client or in a layout.
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
