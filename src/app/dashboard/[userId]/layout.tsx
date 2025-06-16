import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname() || ''
    const userId = pathname.split('/')[2] // Extract userId from path

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className="w-64 bg-gray-800 text-white p-4">
                <h1 className="text-xl font-bold mb-4">Dashboard</h1>
                <nav>
                    <ul>
                        <li className="mb-2">
                            <Link href={`/dashboard/${userId}/owner`} className="block p-2 hover:bg-gray-700 rounded">
                                Owner Dashboard
                            </Link>
                        </li>
                        <li className="mb-2">
                            <Link href={`/dashboard/${userId}/owner/bookings`} className="block p-2 hover:bg-gray-700 rounded">
                                Owner Bookings
                            </Link>
                        </li>
                        <li className="mb-2">
                            <Link href={`/dashboard/${userId}/owner/earnings`} className="block p-2 hover:bg-gray-700 rounded">
                                Owner Earnings
                            </Link>
                        </li>
                        <li className="mb-2">
                            <Link href={`/dashboard/${userId}/user/bookings`} className="block p-2 hover:bg-gray-700 rounded">
                                Your Bookings
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <header className="bg-white shadow p-4">
                    <h2 className="text-xl font-semibold">Welcome to Your Dashboard</h2>
                </header>
                <main className="p-4">
                    {children}
                </main>
            </div>
        </div>
    )
} 