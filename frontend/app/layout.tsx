import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Voice Banking Assistant',
  description: 'Secure voice-based banking operations',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress 404 errors from Next.js prefetching
              if (typeof window !== 'undefined') {
                const originalFetch = window.fetch;
                window.fetch = function(...args) {
                  const url = args[0];
                  if (typeof url === 'string' && (url.includes('?_rsc=') || url.includes('_next'))) {
                    return originalFetch.apply(this, args).catch(() => {
                      // Silently ignore prefetch errors
                      return new Response(null, { status: 404 });
                    });
                  }
                  return originalFetch.apply(this, args);
                };
              }
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>{children}</body>
    </html>
  )
}

