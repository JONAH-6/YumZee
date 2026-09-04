import React, { useState, useEffect } from 'react'
import { Link, routes } from '@redwoodjs/router'
import { ShoppingBag } from 'lucide-react'

const OrdersPage = () => {
  const [orders, setOrders] = useState([])

  const loadOrders = () => {
    const savedOrders = JSON.parse(localStorage.getItem('yumzee_orders') || '[]')
    setOrders(savedOrders)
  }

  useEffect(() => {
    loadOrders()
    window.addEventListener('focus', loadOrders)
    window.addEventListener('yumzee_order_placed', loadOrders)

    return () => {
      window.removeEventListener('focus', loadOrders)
      window.removeEventListener('yumzee_order_placed', loadOrders)
    }
  }, [])

  return (
    <div className="mx-auto min-h-screen max-w-md bg-[#FFF9E5] p-4 font-sans text-[#211F26]">
      <h1 className="mb-4 text-xl font-bold text-[#211F26]">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm">
          <ShoppingBag className="mb-4 h-16 w-16 text-[#6F6B76]/30" />
          <h2 className="text-lg font-bold text-[#211F26]">No orders yet</h2>
          <p className="mt-1 text-sm text-[#6F6B76]">Browse snacks to place an order.</p>
          <Link to={routes.home()} className="mt-6 rounded-full bg-[#FFC107] px-6 py-3 text-sm font-bold text-black hover:bg-[#FFC107]/90 transition">Browse Snacks</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex justify-between items-center border-b border-[#E9E5EE] pb-2 mb-2">
                <span className="text-xs font-bold text-[#3E2679]">Order #{String(order.id).slice(-6)}</span>
                <span className="text-xs text-green-600 font-bold">{order.status}</span>
              </div>
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between py-1 text-sm">
                  <span>{item.quantity} x {item.name}</span>
                  <span className="font-bold text-[#3E2679]">₦{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-[#E9E5EE] pt-2 mt-2">
                <span className="font-bold">Total</span>
                <span className="font-black text-[#3E2679]">₦{order.total.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrdersPage
