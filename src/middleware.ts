import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { auth0 } from "./lib/auth0" // Adjust path if your auth0 client is elsewhere

export async function middleware(request: NextRequest) {
  // Skip Auth0 middleware in E2E test mode
  if (process.env.SKIP_AUTH === 'true') {
    return NextResponse.next()
  }
  return await auth0.middleware(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}