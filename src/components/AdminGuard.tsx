'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const [authorized, setAuthorized] = useState(false)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const res = await fetch('/api/auth/me')
                const user = await res.json()

                if (res.ok && user.is_admin) {
                    setAuthorized(true)
                } else {
                    router.replace('/login')
                }
            } catch {
                router.replace('/login')
            } finally {
                setLoading(false)
            }
        }

        checkAdmin()
    }, [router])

    if (loading) return <div className="p-6">Verifying admin access...</div>
    if (!authorized) return null

    return <>{children}</>
}