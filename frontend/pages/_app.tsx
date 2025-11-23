import '@/app/globals.css'
import type { AppProps } from 'next/app'
import { AuthProvider } from '@/contexts/AuthContext'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function App({ Component, pageProps }: AppProps) {
    return (
        <AuthProvider>
            <main className={inter.className}>
                <Component {...pageProps} />
            </main>
        </AuthProvider>
    )
}
