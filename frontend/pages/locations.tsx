import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function LocationsPage() {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) router.push('/login')
    }, [user, loading, router])

    if (loading || !user) return null

    const branches = [
        { name: 'Downtown Branch', address: '123 Main St, City Center', status: 'Open', distance: '1.2 km' },
        { name: 'Westside ATM', address: '456 West Ave, Westside', status: '24/7', distance: '3.5 km' },
        { name: 'Tech Park Branch', address: '789 Tech Park Rd', status: 'Open', distance: '5.0 km' },
    ]

    return (
        <div className="min-h-screen bg-slate-50">
            <Navigation />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm mb-6">
                    <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Branch & ATM Locator</h2>
                    <p className="text-slate-600">Find nearest banking points</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-slate-200 rounded-xl h-96 flex items-center justify-center border border-slate-300">
                        <p className="text-slate-500 font-medium">Map View Placeholder (Google Maps Integration)</p>
                    </div>

                    <div className="space-y-4">
                        {branches.map((branch, i) => (
                            <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-slate-900">{branch.name}</h3>
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{branch.status}</span>
                                </div>
                                <p className="text-slate-500 text-sm mt-1">{branch.address}</p>
                                <div className="flex items-center mt-3 text-blue-600 text-sm font-medium">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    {branch.distance}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
