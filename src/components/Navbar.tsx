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

export default function Navbar() {
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
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [])

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            })

            if (!response.ok) {
                throw new Error('Logout failed')
            }

            setUser(null)
            router.push('/login')
            router.refresh() // Force a refresh to clear any cached data
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    const userMenuItems: MenuItem[] = [
        {
            label: 'Dashboard',
            onClick: () => router.push(`/dashboard/${user?.role}`),
        },
        {
            label: 'Profile',
            onClick: () => router.push('/profile'),
        },
        {
            label: 'Logout',
            onClick: handleLogout,
            danger: true,
        },
    ]

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

    if (user?.role === 'user' && !user.kycVerified) {
        userMenuItems.splice(1, 0, {
            label: 'Complete KYC',
            onClick: () => router.push('/profile?kyc_required=true'),
            warning: true,
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
                                {user ? (
                                    <>
                                        {user.role === 'user' && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => router.push('/browse-vehicles')}
                                                >
                                                    Browse Vehicles
                                                </Button>
                                                {!user.kycVerified ? (
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => router.push('/profile?kyc_required=true')}
                                                    >
                                                        Complete KYC
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => router.push('/become-owner')}
                                                    >
                                                        Become an Owner
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                        <Dropdown
                                            trigger={
                                                <button className="flex items-center space-x-2 rounded-full focus:outline-none">
                                                    <Avatar
                                                        src={user.avatar}
                                                        alt={user.name}
                                                        size="sm"
                                                        fallback={user.name}
                                                    />
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {user.name}
                                                    </span>
                                                </button>
                                            }
                                            items={userMenuItems}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={() => router.push('/login')}
                                        >
                                            Login
                                        </Button>
                                        <Button onClick={() => router.push('/register')}>
                                            Register
                                        </Button>
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
