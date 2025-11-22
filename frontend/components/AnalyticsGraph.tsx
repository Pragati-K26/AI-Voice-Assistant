import { useEffect, useRef } from 'react'

interface AnalyticsGraphProps {
    data: Record<string, number>
}

export default function AnalyticsGraph({ data }: AnalyticsGraphProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const categories = Object.keys(data)
        const values = Object.values(data)
        const maxValue = Math.max(...values, 1)

        const barWidth = 40
        const gap = 30
        const startX = 50
        const startY = canvas.height - 30
        const chartHeight = canvas.height - 60

        // Draw axes
        ctx.beginPath()
        ctx.strokeStyle = '#e2e8f0'
        ctx.lineWidth = 1
        ctx.moveTo(40, 20)
        ctx.lineTo(40, canvas.height - 20)
        ctx.lineTo(canvas.width - 20, canvas.height - 20)
        ctx.stroke()

        // Draw bars
        categories.forEach((category, i) => {
            const x = startX + i * (barWidth + gap)
            const height = (values[i] / maxValue) * chartHeight
            const y = startY - height

            // Bar gradient
            const gradient = ctx.createLinearGradient(x, y, x, startY)
            gradient.addColorStop(0, '#6366f1') // Indigo-500
            gradient.addColorStop(1, '#818cf8') // Indigo-400

            ctx.fillStyle = gradient
            ctx.beginPath()
            ctx.roundRect(x, y, barWidth, height, 4)
            ctx.fill()

            // Label
            ctx.fillStyle = '#64748b' // Slate-500
            ctx.font = '12px sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText(category.substring(0, 6) + '..', x + barWidth / 2, startY + 15)

            // Value
            ctx.fillStyle = '#334155' // Slate-700
            ctx.font = 'bold 10px sans-serif'
            ctx.fillText('₹' + (values[i] / 1000).toFixed(1) + 'k', x + barWidth / 2, y - 5)
        })

    }, [data])

    return (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Spending Analytics</h3>
            <div className="w-full overflow-x-auto">
                <canvas
                    ref={canvasRef}
                    width={600}
                    height={250}
                    className="w-full min-w-[600px]"
                />
            </div>
        </div>
    )
}
