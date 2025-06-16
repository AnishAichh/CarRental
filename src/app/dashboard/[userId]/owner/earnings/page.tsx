import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function OwnerEarnings() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const userId = searchParams?.get('user')
    const [earnings, setEarnings] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const res = await fetch('/api/owner/earnings')
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Failed to fetch earnings')
                setEarnings(data.earnings)
            } catch (err) {
                console.error('Error fetching earnings:', err)
                setError(err instanceof Error ? err.message : 'Failed to fetch earnings')
            } finally {
                setIsLoading(false)
            }
        }
        fetchEarnings()
    }, [])

    if (isLoading) return <p>Loading...</p>
    if (error) return <p className="text-red-500">{error}</p>

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Owner Earnings</h1>
            <p>Total Earnings: ${earnings}</p>
        </div>
    )
} 