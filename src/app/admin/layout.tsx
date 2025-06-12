import AdminGuard from '@/components/AdminGuard'
import '../globals.css' // if needed

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AdminGuard>
            <section className="min-h-screen bg-gray-50 text-black">
                {children}
            </section>
        </AdminGuard>
    )
}