import React, { useState, useEffect } from 'react'
import { Link, routes } from '@redwoodjs/router'
import { ShoppingBag } from 'lucide-react'
import { useAuth } from 'src/contexts/AuthContexts'
import { db } from 'src/lib/firebase'
import { collection, onSnapshot, query, where } from 'firebase/firestore'

const OrdersPage = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.email) {
      setOrders([])
      setLoading(false)
      return
    }

    // Orders follow the Gmail account, not the browser.
    const q = query(
      collection(db, 'orders'),
      where('customerEmail', '==', user.email)
    )

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
        // Newest first (client-side sort, no composite index needed)
        data.sort((a: any, b: any) => {
          const timeA = a.createdAt?.seconds
            ? a.createdAt.seconds * 1000
            : new Date(a.createdAt || 0).getTime()
          const timeB = b.createdAt?.seconds
            ? b.createdAt.seconds * 1000
            : new Date(b.createdAt || 0).getTime()
          return timeB - timeA
        })
        setOrders(data)
        setLoading(false)
      },
      (error) => {
        console.error('Error loading orders:', error)
        setLoading(false)
      }
    )

    return () => unsub()
  }, [user])

  const formatDate = (ts: any) => {
    if (!ts) return ''
    const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts)
    return isNaN(date.getTime()) ? '' : date.toLocaleString()
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-[#FFF9E5] p-4 font-sans text-[#211F26]">
      <h1 className="anim-fade-up mb-4 text-xl font-bold text-[#211F26]">Your Orders</h1>

      {loading ? (
        <p className="py-10 text-center text-sm text-[#6F6B76]">Loading your orders...</p>
      ) : orders.length === 0 ? (
        <div className="anim-pop-in flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center">
          <ShoppingBag className="mb-4 h-16 w-16 text-[#6F6B76]/30" />
          <h2 className="text-lg font-bold text-[#211F26]">No orders yet</h2>
          <p className="mt-1 text-sm text-[#6F6B76]">Browse snacks to place an order.</p>
          <Link to={routes.home()} className="mt-6 rounded-full bg-[#FFC107] px-6 py-3 text-sm font-bold text-black transition hover:bg-[#e6ad00] active:scale-95">Browse Snacks</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <div
              key={order.id}
              className="anim-fade-up rounded-2xl bg-white p-4 transition-all duration-200 hover:-translate-y-0.5"
              style={{ animationDelay: `${Math.min(index * 80, 480)}ms` }}
            >
              <div className="flex justify-between items-center border-b border-[#E9E5EE] pb-2 mb-2">
                <span className="text-xs font-bold text-[#3E2679]">Order #{String(order.id).slice(-6)}</span>
                <span className={`text-xs font-bold ${order.isCompleted ? 'text-green-600' : 'text-orange-500'}`}>
                  {order.isCompleted ? 'Delivered' : 'In Progress'}
                </span>
              </div>
              {(order.items || []).map((item) => (
                <div key={item.id} className="flex justify-between py-1 text-sm">
                  <span>{item.quantity} x {item.name}</span>
                  <span className="font-bold text-[#3E2679]">₦{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-[#E9E5EE] pt-2 mt-2">
                <span className="font-bold">Total</span>
                <span className="font-black text-[#3E2679]">₦{(order.total || 0).toLocaleString()}</span>
              </div>
              {formatDate(order.createdAt) && (
                <p className="mt-1 text-[10px] text-[#A09BA8]">{formatDate(order.createdAt)}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrdersPage
