'use client'
import { useEffect, useState } from 'react'

type OwnerEarning = {
    vehicle_name: string
    renter_email: string
    start_date: string
    end_date: string
    total_price: number
    platform_fee: number
    payout: number
}

export default function EarningsPage() {
    const [earnings, setEarnings] = useState<OwnerEarning[]>([])
    const [total, setTotal] = useState(0)

    useEffect(() => {
        fetch('/api/earnings')
            .then(res => res.json())
            .then(data => {
                setEarnings(data.details)
                setTotal(data.total)
            })
    }, [])

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Your Earnings</h2>
            <p className="text-lg mb-6">Total Earnings: ₹<strong>{total}</strong></p>

            <table className="w-full border-collapse border">
                <thead className="bg-gray-100 text-left">
                    <tr>
                        <th className="p-2 border">Vehicle</th>
                        <th className="p-2 border">Renter</th>
                        <th className="p-2 border">From</th>
                        <th className="p-2 border">To</th>
                        <th className="p-2 border">Total ₹</th>
                        <th className="p-2 border">Commission ₹</th>
                        <th className="p-2 border">You Get ₹</th>
                    </tr>
                </thead>
                <tbody>
                    {earnings.map((e, index) => (
                        <tr key={index} className="border-t">
                            <td className="p-2 border">{e.vehicle_name}</td>
                            <td className="p-2 border">{e.renter_email}</td>
                            <td className="p-2 border">{e.start_date}</td>
                            <td className="p-2 border">{e.end_date}</td>
                            <td className="p-2 border">₹{e.total_price}</td>
                            <td className="p-2 border">₹{e.platform_fee}</td>
                            <td className="p-2 border font-semibold text-green-700">₹{e.payout}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
