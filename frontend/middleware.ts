import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Block prefetch requests for non-existent routes
  if (pathname.includes('?_rsc=') || request.headers.get('purpose') === 'prefetch') {
    // List of routes that don't exist and should return 404 gracefully
    const nonExistentRoutes = [
      '/api', '/security', '/docs', '/support', '/privacy', 
      '/careers', '/blog', '/press', '/terms', '/cookies', '/gdpr'
    ]
    
    const basePath = pathname.split('?')[0]
    if (nonExistentRoutes.some(route => basePath.startsWith(route))) {
      return new NextResponse(null, { status: 404 })
    }
  }
  
  const response = NextResponse.next()
  
  // Disable prefetching headers
  response.headers.set('x-middleware-prefetch', '0')
  response.headers.set('Cache-Control', 'no-store, must-revalidate')
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - handled by vercel.json rewrite)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

