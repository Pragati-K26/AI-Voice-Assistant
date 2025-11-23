'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface NavigationProps {
  isAuthenticated?: boolean
  user?: { username?: string } | null
}

export default function Navigation({ isAuthenticated = false, user = null }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  const navItems: Array<{ label: string; href: string; isLink: boolean }> = [
    { label: 'Features', href: '/features', isLink: true },
    { label: 'Pricing', href: '/pricing', isLink: true },
    { label: 'About', href: '/about', isLink: true },
    { label: 'Contact', href: '/contact', isLink: true },
  ]

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" prefetch={false} className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">VB</span>
            </div>
            <span className="text-xl font-serif font-bold text-slate-900">
              VoiceBank
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              item.isLink ? (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  className="text-slate-700 hover:text-slate-900 font-medium transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  key={item.href}
                  className="text-slate-700 hover:text-slate-900 font-medium transition-colors duration-200 cursor-pointer"
                >
                  {item.label}
                </span>
              )
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-slate-600 text-sm">
                  Welcome, <span className="font-semibold text-slate-900">{user?.username}</span>
                </span>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Dashboard
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  prefetch={false}
                  className="text-slate-700 hover:text-slate-900 font-medium transition-colors duration-200"
                >
                  Sign In
                </Link>
                <button
                  onClick={() => router.push('/login')}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-slate-900"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                item.isLink ? (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-slate-700 hover:text-slate-900 font-medium py-2"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    key={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-slate-700 hover:text-slate-900 font-medium py-2 cursor-pointer"
                  >
                    {item.label}
                  </span>
                )
              ))}
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    router.push('/dashboard')
                    setIsMenuOpen(false)
                  }}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium text-left"
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    prefetch={false}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-slate-700 hover:text-slate-900 font-medium py-2"
                  >
                    Sign In
                  </Link>
                  <button
                    onClick={() => {
                      router.push('/login')
                      setIsMenuOpen(false)
                    }}
                    className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium text-left"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

