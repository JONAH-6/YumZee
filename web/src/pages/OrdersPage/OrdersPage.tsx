import React, { useState, useEffect } from 'react'
import { Link, routes } from '@redwoodjs/router'
import { ShoppingBag, ChevronLeft } from 'lucide-react'

const OrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [activeTab, setActiveTab] = useState<'inprogress' | 'history'>('inprogress')

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

  const inProgressOrders = orders.filter((order) => order.status === 'Placed')
  const historyOrders = orders.filter((order) => order.status === 'Delivered')
  const displayOrders = activeTab === 'inprogress' ? inProgressOrders : historyOrders

  return (
    <div className="mx-auto min-h-screen max-w-md bg-[#FFF9E5] font-sans text-[#211F26]">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-[#E9E5EE] bg-white p-4">
        <Link to={routes.home()} className="mb-2 inline-flex rounded-full p-1 hover:bg-gray-100">
           <ChevronLeft className="h-6 w-6 text-[#211F26]" />
        </Link>
        <h1 className="text-xl font-bold">Orders</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E9E5EE] bg-white">
        <button
          onClick={() => setActiveTab('inprogress')}
          className={`flex-1 py-3 text-sm font-bold ${activeTab === 'inprogress' ? 'border-b-2 border-[#3E2679] text-[#3E2679]' : 'text-[#6F6B76]'}`}
        >
          In progress
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-sm font-bold ${activeTab === 'history' ? 'border-b-2 border-[#3E2679] text-[#3E2679]' : 'text-[#6F6B76]'}`}
        >
          History
        </button>
      </div>

      <div className="p-4">
        {displayOrders.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-[#6F6B76]/30" />
            <h2 className="text-lg font-bold text-[#211F26]">
              {activeTab === 'inprogress' ? 'No ongoing orders' : 'No past orders'}
            </h2>
            <p className="mt-1 text-sm text-[#6F6B76]">
              {activeTab === 'inprogress' ? 'Your ongoing orders will be listed here.' : 'Your completed orders will be listed here.'}
            </p>
            <Link to={routes.home()} className="mt-6 inline-block rounded-full bg-[#FFC107] px-6 py-3 text-sm font-bold text-black">
              Browse Snacks
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {displayOrders.map((order) => (
              <div key={order.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex justify-between border-b border-[#E9E5EE] pb-2 mb-2">
                  <span className="text-xs font-bold text-[#3E2679]">Order #{String(order.id).slice(-6)}</span>
                  <span className="text-xs text-green-600 font-bold">{order.status}</span>
                </div>

                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-2">
                    <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <h3 className="text-sm font-bold">{item.name}</h3>
                      <p className="text-xs text-[#6F6B76]">Qty {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-[#3E2679]">₦{(item.price * item.quantity).toLocaleString()}</span>
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
    </div>
  )
}

export default OrdersPage
