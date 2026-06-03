import { NextResponse, type NextRequest } from "next/server";

type Session = {
  session: {
    id: string;
    userId: string;
    expiresAt: string;
  };
  user: {
    id: string;
    email: string;
    name: string;
  };
} | null;

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

export async function middleware(request: NextRequest) {
    let session: Session = null;

    try {
        const response = await fetch(
            new URL("/api/auth/get-session", request.nextUrl.origin),
            {
                headers: {
                    cookie: request.headers.get("cookie") || "",
                },
            },
        );
        if (response.ok) {
            session = await response.json();
        }
    } catch {
        // If the session fetch fails, treat as unauthenticated
    }

    const isAuthRoute = AUTH_ROUTES.some((route) =>
        request.nextUrl.pathname.startsWith(route)
    );

    if (!session && !isAuthRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (session && isAuthRoute) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
