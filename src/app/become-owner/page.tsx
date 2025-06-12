'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BecomeOwnerForm from '@/app/components/BecomeOwnerForm'

export default function BecomeOwnerPage() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/user/me')
                if (!res.ok) {
                    throw new Error('Failed to fetch user data')
                }
                const data = await res.json()
                setUser(data.user)

                // Redirect if user is already an owner
                if (data.user.role === 'owner') {
                    router.push('/dashboard')
                }
            } catch (err) {
                console.error('Error fetching user:', err)
                router.push('/login')
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [router])

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <BecomeOwnerForm />
        </div>
    )
} 