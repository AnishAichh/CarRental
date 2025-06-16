'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getAuthUser } from '@/lib/api'
import { User } from '@/lib/types'
import Navbar from '@/components/Navbar'

interface DashboardLayoutProps {
    children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getAuthUser()
                setUser(userData)
            } catch (error) {
                // If user is not authenticated, redirect to login
                console.error('DashboardLayout: Error fetching user data', error)
                router.push('/login')
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [router])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    // If user is not loaded (and not in loading state), it means they were redirected
    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Navbar user={user} />
            <main className="flex-grow container mx-auto p-6">
                {pathname !== `/dashboard/user` && pathname !== `/dashboard/user?user=${user.id}` && pathname !== `/dashboard/admin` && (
                    <button
                        onClick={() => {
                            if (user?.role === 'admin') {
                                router.push('/dashboard/admin')
                            } else if (user?.id) {
                                router.push(`/dashboard/user?user=${user.id}`)
                            } else {
                                router.push('/login') // Fallback to login if no user or ID
                            }
                        }}
                        className="mb-2 inline-flex items-center text-sm text-gray-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Back to Dashboard
                    </button>
                )}
                {children}
            </main>
        </div>
    )
} 