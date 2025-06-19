'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
    const router = useRouter()
    const [form, setForm] = useState({ email: '', name: '', password: '' })
    const [error, setError] = useState<string | React.ReactNode>('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })

            const data = await res.json()

            if (res.ok) {
                // Redirect to user dashboard with user ID
                router.push(`/dashboard/user?user=${data.user.id}`)
            } else {
                if (data.code === 'EMAIL_EXISTS') {
                    // Show login link for existing email
                    setError(
                        <span>
                            {data.error}{' '}
                            <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
                                Click here to login
                            </Link>
                        </span>
                    )
                } else {
                    setError(data.error || 'Registration failed')
                }
            }
        } catch (err) {
            setError('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50"></div>

            <div className="relative max-w-md w-full">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <Link href="/" className="inline-block mb-8 group">
                        <h1 className="text-4xl font-light tracking-tight text-gray-900 group-hover:text-emerald-600 transition-colors duration-300">
                            Vheego
                        </h1>
                        <div className="text-sm text-emerald-600 font-normal mt-1">
                            Decentralized Vehicle Rentals
                        </div>
                    </Link>

                    <h2 className="text-3xl font-light text-gray-900 mb-4">
                        Create your account
                    </h2>
                    <p className="text-gray-600 font-light">
                        Join thousands of users who trust Vheego for their vehicle rental needs
                    </p>
                </div>

                {/* Registration Form */}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-lg hover:shadow-xl transition-all duration-500">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4 transition-all duration-300">
                                <div className="text-sm text-red-700 font-medium">{error}</div>
                            </div>
                        )}

                        <div className="space-y-5">
                            <div className="group">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    className="w-full px-4 py-4 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 group-hover:border-gray-300"
                                    placeholder="Enter your full name"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                />
                            </div>

                            <div className="group">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="w-full px-4 py-4 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 group-hover:border-gray-300"
                                    placeholder="Enter your email address"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                />
                            </div>

                            <div className="group">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    className="w-full px-4 py-4 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 group-hover:border-gray-300"
                                    placeholder="Create a strong password"
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-600 text-white py-4 px-6 rounded-xl font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating account...
                                </span>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <p className="text-center text-gray-600 font-light">
                            Already have an account?{' '}
                            <Link
                                href="/login"
                                className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors duration-300"
                            >
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500 font-light">
                        By creating an account, you agree to our{' '}
                        <Link href="/terms" className="text-emerald-600 hover:text-emerald-700 transition-colors">
                            Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-emerald-600 hover:text-emerald-700 transition-colors">
                            Privacy Policy
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}