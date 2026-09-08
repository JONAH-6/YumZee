import { navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'
import { db } from 'src/lib/firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { LayoutDashboard, ArrowLeft, Clock } from 'lucide-react'

const AdminOverviewPage = () => {
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setOrders(data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)))
    })
    return () => unsubOrders()
  }, [])

  return (
    <div className="min-h-screen bg-red-50">
      <Metadata title="Admin Overview" />
      <header className="bg-red-600 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(routes.admin())} className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-bold hover:bg-white/30">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <h1 className="text-2xl font-black">Overview</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-red-600 p-6 text-white border border-red-100">
            <h3 className="text-lg font-bold">Total Orders</h3>
            <p className="mt-2 text-5xl font-black">{orders.length}</p>
          </div>
          <div className="rounded-2xl bg-white p-6 text-red-600 border border-red-100">
            <h3 className="text-lg font-bold">Live Orders Feed</h3>
            {orders.length === 0 ? (
              <p className="py-8 text-center text-gray-400">No orders yet...</p>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between rounded-xl border border-red-100 p-4">
                    <div>
                      <p className="font-bold text-gray-800">{order.customerName || 'Customer'}</p>
                      <p className="text-xs text-gray-500">{order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleString() : 'Just now'}</p>
                    </div>
                    <span className="text-lg font-black text-red-600">₦{order.total?.toLocaleString() || '0'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminOverviewPage