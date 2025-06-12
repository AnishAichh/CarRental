'use client'
import { useEffect, useState } from 'react'

type Transaction = {
    id: number
    booking_id: number
    from_user: string
    to_user: string
    amount: number
    platform_fee: number
    created_at: string
}

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([])

    useEffect(() => {
        fetch('/api/admin/transactions')
            .then(res => res.json())
            .then(setTransactions)
    }, [])

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Platform Transactions</h2>
            <table className="w-full border-collapse border">
                <thead className="bg-gray-100 text-left">
                    <tr>
                        <th className="p-2 border">Booking ID</th>
                        <th className="p-2 border">From</th>
                        <th className="p-2 border">To</th>
                        <th className="p-2 border">Amount ₹</th>
                        <th className="p-2 border">Fee ₹</th>
                        <th className="p-2 border">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map(t => (
                        <tr key={t.id} className="border-t">
                            <td className="p-2 border">{t.booking_id}</td>
                            <td className="p-2 border">{t.from_user}</td>
                            <td className="p-2 border">{t.to_user}</td>
                            <td className="p-2 border">₹{t.amount}</td>
                            <td className="p-2 border">₹{t.platform_fee}</td>
                            <td className="p-2 border">{new Date(t.created_at).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
