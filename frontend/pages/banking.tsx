import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import BankingServices from '@/components/BankingServices'
import { useAuth } from '@/contexts/AuthContext'

export default function BankingPage() {
    const router = useRouter()
    const { service } = router.query
    const { user, loading } = useAuth()
    const [activeService, setActiveService] = useState<string | null>(null)

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    useEffect(() => {
        if (service && typeof service === 'string') {
            setActiveService(service)
        }
    }, [service])

    if (loading || !user) {
        return null
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Navigation />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <BankingServices initialService={activeService} />
            </main>
        </div>
    )
}
