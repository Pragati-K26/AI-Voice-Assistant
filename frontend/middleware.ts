import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // List of routes that don't exist
  const nonExistentRoutes = [
    '/security', '/docs', '/support', '/privacy', 
    '/careers', '/blog', '/press', '/terms', '/cookies', '/gdpr'
  ]
  
  // Check if this is a prefetch request for a non-existent route
  const isPrefetch = request.headers.get('purpose') === 'prefetch' || 
                     request.headers.get('x-middleware-prefetch') === '1'
  
  // Get base path without query params
  const basePath = pathname.split('?')[0].split('&')[0]
  
  // Block prefetch requests for non-existent routes (but allow /api through for rewrites)
  if (isPrefetch && !basePath.startsWith('/api') && !basePath.startsWith('/_next')) {
    if (nonExistentRoutes.some(route => basePath === route || basePath.startsWith(route + '/'))) {
      return new NextResponse(null, { status: 404 })
    }
  }
  
  const response = NextResponse.next()
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

