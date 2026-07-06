import { NextRequest, NextResponse } from "next/server"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token")

  const isLoggedIn   = !!sessionCookie
  const isProtected  = pathname.startsWith("/dashboard")
  const isSignInPage = pathname.startsWith("/sign-in")

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  if (isSignInPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in"],
}