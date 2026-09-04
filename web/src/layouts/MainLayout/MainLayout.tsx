import React, { useState, useEffect } from 'react'
import { ShoppingCart, User, LogOut, Home, Search, ShoppingBag } from 'lucide-react'
import { Link, navigate, routes } from '@redwoodjs/router'
import { useCart } from 'src/components/CartContext/CartContext'
import { useAuth } from 'src/contexts/AuthContexts'

const MainLayout = ({ children }) => {
  const { itemCount } = useCart()
  const { logOut } = useAuth()

  const [showFloatingCart, setShowFloatingCart] = useState(false)

  useEffect(() => {
    if (itemCount > 0) {
      setShowFloatingCart(true)
    } else {
      setShowFloatingCart(false)
    }
  }, [itemCount])

  const handleSignOut = async () => {
    await logOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-[#FFF9E5] font-sans text-[#211F26] antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#3E2679] text-white">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to={routes.home()} className="flex items-center gap-1.5">
            <span className="text-2xl font-black tracking-tight">
              <span className="text-[#FFC107]">YUM</span>
              <span className="text-white">ZEE</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(routes.basket())} className="relative rounded-full bg-white/20 p-2">
              <ShoppingCart className="h-5 w-5 text-white" />
              {itemCount > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-[#FFC107] px-1 text-[10px] text-black">{itemCount}</span>}
            </button>
            <button onClick={handleSignOut} className="rounded-full p-2 text-white/70">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">{children}</main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
        <nav className="pointer-events-auto w-full max-w-md border-t bg-[#3E2679] text-white">
          <div className="grid grid-cols-4 py-2">
            <button onClick={() => navigate(routes.home())} className="flex flex-col items-center text-[10px]"><Home className="h-5 w-5" />Home</button>
            <button onClick={() => navigate(routes.search())} className="flex flex-col items-center text-[10px]"><Search className="h-5 w-5" />Search</button>
            <button onClick={() => navigate(routes.orders())} className="flex flex-col items-center text-[10px]"><ShoppingBag className="h-5 w-5" />Orders</button>
            <button onClick={() => navigate(routes.profile())} className="flex flex-col items-center text-[10px]"><User className="h-5 w-5" />Profile</button>
          </div>
        </nav>
      </div>

      {/* Floating Cart Button - Slides out from the Left */}
      <div
        className={`fixed bottom-24 z-50 transition-all duration-500 ease-out ${
          showFloatingCart ? 'translate-x-0 opacity-100' : '-translate-x-24 opacity-0'
        }`}
        style={{ left: 'max(16px, calc(50% - 14rem + 16px))' }}
      >
        <button
          onClick={() => navigate(routes.basket())}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#FFC107] shadow-2xl"
        >
          <ShoppingCart className="h-6 w-6 text-[#3E2679]" />
          {itemCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#3E2679] text-[10px] font-bold text-white">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

export default MainLayout
