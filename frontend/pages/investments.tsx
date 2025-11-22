import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function InvestmentsPage() {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) router.push('/login')
    }, [user, loading, router])

    if (loading || !user) return null

    const investments = [
        { name: 'Nifty 50 Index Fund', type: 'Mutual Fund', value: 25000, returns: '+12.5%' },
        { name: 'Gold ETF', type: 'Commodity', value: 15000, returns: '+5.2%' },
        { name: 'Tech Bluechip Stock', type: 'Equity', value: 10000, returns: '-2.1%' },
        { name: 'Corporate Bond Fund', type: 'Debt', value: 20000, returns: '+6.8%' },
    ]

    return (
        <div className="min-h-screen bg-slate-50">
            <Navigation />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm mb-6">
                    <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Investments</h2>
                    <p className="text-slate-600">Track your portfolio and market performance</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">Portfolio Value</h3>
                        <div className="text-4xl font-bold text-slate-900">₹70,000.00</div>
                        <div className="text-green-600 font-medium mt-2">▲ ₹4,500 (6.8%) this month</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center">
                        <div className="text-center text-slate-500">
                            <p>Investment Analysis Chart Placeholder</p>
                            <p className="text-xs">(Use AnalyticsGraph here if needed)</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Instrument</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Current Value</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Returns</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {investments.map((inv, i) => (
                                <tr key={i}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{inv.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{inv.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-900">₹{inv.value.toLocaleString()}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${inv.returns.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                        {inv.returns}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    )
}
