'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CatchAll() {
  const router = useRouter()

  // List of valid routes that should exist
  const validRoutes = [
    '/',
    '/about',
    '/contact',
    '/features',
    '/pricing',
    '/login',
    '/signup',
    '/dashboard',
  ]

  useEffect(() => {
    // If this is a prefetch request, just return 404 silently
    // Don't redirect for prefetch requests
  }, [])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-slate-700 mb-4">Page Not Found</h2>
        <p className="text-slate-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            prefetch={false}
            className="px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
          >
            Go Home
          </Link>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-slate-200 text-slate-900 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}

