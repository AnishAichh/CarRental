'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getAuthUser } from '@/lib/api'
import { User } from '@/lib/types'
import Button from './ui/Button'
import Dropdown from './ui/Dropdown'
import Avatar from './ui/Avatar'

interface MenuItem {
    label: string
    onClick: () => void
    danger?: boolean
    warning?: boolean
}

interface NavbarProps {
    user: User | null
}

export default function Navbar({ user }: NavbarProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            })

            if (!response.ok) {
                throw new Error('Logout failed')
            }

            router.push('/login')
            router.refresh() // Force a refresh to clear any cached data
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    const userMenuItems: MenuItem[] = [
        {
            label: 'Dashboard',
            onClick: () => user?.id ? router.push(`/dashboard/user?user=${user.id}`) : router.push('/login'),
        },
        {
            label: 'Profile',
            onClick: () => router.push(`/dashboard/user/profile?user=${user?.id}`),
        },
        {
            label: 'My Bookings',
            onClick: () => user?.id ? router.push(`/dashboard/user/bookings?user=${user.id}`) : router.push('/login'),
        },
        {
            label: 'Logout',
            onClick: handleLogout,
            danger: true,
        },
    ]

    if (user?.role === 'user') {
        userMenuItems.splice(3, 0, {
            label: 'Complete KYC',
            onClick: () => user?.id ? router.push(`/dashboard/kyc?user=${user.id}`) : router.push('/login'),
            warning: true,
        })
    }

    if (user?.role === 'owner') {
        userMenuItems.splice(1, 0, {
            label: 'My Vehicles',
            onClick: () => router.push('/dashboard/owner/vehicles'),
        })
    }

    if (user?.role === 'admin') {
        userMenuItems.splice(1, 0, {
            label: 'Admin Panel',
            onClick: () => router.push('/dashboard/admin'),
        })
    }

    return (
        <nav className="bg-white shadow">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                    <div className="flex">
                        <Link href="/" className="flex items-center">
                            <span className="text-xl font-bold text-blue-600">DriveX</span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {!loading && (
                            <>
                                {user && user.role === 'user' && (
                                    <>
                                        <Link href={`/dashboard/user/browse-vehicles?user=${user.id}`}>
                                            <Button variant="outline">
                                                Browse Vehicles
                                            </Button>
                                        </Link>
                                        {!user.kycVerified && (
                                            <Link href={`/dashboard/kyc?user=${user.id}`}>
                                                <Button variant="outline" className="border-yellow-500 text-yellow-700 hover:bg-yellow-50">
                                                    Complete KYC
                                                </Button>
                                            </Link>
                                        )}
                                        {user.kycVerified && (
                                            <Link href="/dashboard/become-owner">
                                                <Button variant="outline">
                                                    Become an Owner
                                                </Button>
                                            </Link>
                                        )}
                                    </>
                                )}
                                {user ? (
                                    <>
                                        <button
                                            onClick={handleLogout}
                                            className="px-4 py-2 rounded-md text-sm font-medium text-red-600 border border-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                        >
                                            Logout
                                        </button>
                                        <Dropdown
                                            trigger={
                                                <div className="flex items-center space-x-2 rounded-full focus:outline-none cursor-pointer">
                                                    <Avatar
                                                        src={user.avatar}
                                                        alt={user.name}
                                                        size="sm"
                                                        fallback={user.name}
                                                    />
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {user.name}
                                                    </span>
                                                </div>
                                            }
                                            items={userMenuItems}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <Link href="/login">
                                            <Button variant="outline">
                                                Login
                                            </Button>
                                        </Link>
                                        <Link href="/register">
                                            <Button>
                                                Register
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
