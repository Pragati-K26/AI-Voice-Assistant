import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Simple passthrough - just let requests through
  // The 404 errors are harmless and don't need middleware intervention
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Only match specific paths that need middleware
     * Exclude everything else to avoid conflicts
     */
    '/((?!_next|api|favicon.ico).*)',
  ],
}

