import React from 'react'
import { Link, routes } from '@redwoodjs/router'
import { ShoppingBag } from 'lucide-react'

const OrdersPage = () => {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-[#FFF9E5] p-4 font-sans text-[#211F26]">
      <h1 className="mb-4 text-xl font-bold text-[#211F26]">Your Orders</h1>

      <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm">
        <ShoppingBag className="mb-4 h-16 w-16 text-[#6F6B76]/30" />
        <h2 className="text-lg font-bold text-[#211F26]">No orders yet</h2>
        <p className="mt-1 text-sm text-[#6F6B76]">Browse snacks to place an order.</p>
        <Link
          to={routes.home()}
          className="mt-6 rounded-full bg-[#FFC107] px-6 py-3 text-sm font-bold text-black hover:bg-[#FFC107]/90 transition"
        >
          Browse Snacks
        </Link>
      </div>
    </div>
  )
}

export default OrdersPage
