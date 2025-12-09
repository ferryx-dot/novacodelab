import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get session token from cookies
  const sessionToken = request.cookies.get("session_token")?.value

  // Protected routes (dashboard and sub-routes)
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/ai-") ||
    pathname.startsWith("/academy") ||
    pathname.startsWith("/add-money") ||
    pathname.startsWith("/advanced-lab") ||
    pathname.startsWith("/bot-arsenal") ||
    pathname.startsWith("/coding-hub") ||
    pathname.startsWith("/community") ||
    pathname.startsWith("/marketplace") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/tools") ||
    pathname.startsWith("/trading")

  // Auth routes
  const isAuthRoute = pathname.startsWith("/auth/")

  // If no session and trying to access protected route, redirect to login
  if (!sessionToken && isProtectedRoute) {
    const loginUrl = new URL("/auth/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  // If has session and trying to access auth routes, redirect to dashboard
  if (sessionToken && isAuthRoute) {
    const dashboardUrl = new URL("/dashboard", request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
