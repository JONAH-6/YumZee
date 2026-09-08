import { navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'
import { db } from 'src/lib/firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { ArrowLeft, ShoppingBag, MapPin, Clock } from 'lucide-react'

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setOrders(data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)))
    })
    return () => unsubOrders()
  }, [])

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'No Date'
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp)
    return date.toLocaleString()
  }

  return (
    <div className="min-h-screen bg-red-50">
      <Metadata title="Admin Orders" />
      <header className="bg-red-600 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(routes.admin())} className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-bold hover:bg-white/30">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <h1 className="text-2xl font-black">All Orders</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="rounded-2xl bg-white p-6 border border-red-100">
          {orders.length === 0 ? (
            <p className="py-8 text-center text-gray-400">No orders yet...</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="rounded-xl border border-red-200 p-4">
                  <div className="mb-2 flex justify-between items-center border-b border-red-100 pb-2">
                    <div>
                      <p className="font-bold text-gray-800">{order.customerName || 'Customer'}</p>
                      <p className="text-xs text-gray-500">{order.customerPhone || 'No Phone'}</p>
                    </div>
                    <span className="text-lg font-black text-red-600">₦{order.total?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="mb-2 flex items-center gap-2 text-xs font-bold text-red-600">
                        <ShoppingBag className="h-4 w-4" /> Items
                      </p>
                      {order.items?.map((item: any) => (
                        <p key={item.id} className="text-sm text-gray-600">
                          {item.quantity} x {item.name} — ₦{(item.price * item.quantity).toLocaleString()}
                        </p>
                      ))}
                    </div>
                    <div>
                      <p className="mb-2 flex items-center gap-2 text-xs font-bold text-red-600">
                        <MapPin className="h-4 w-4" /> Delivery
                      </p>
                      <p className="text-sm text-gray-600">{order.address || order.hostel || 'No Address'}</p>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-red-100 pt-2">
                    <p className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="h-4 w-4" /> Placed at: {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminOrdersPage