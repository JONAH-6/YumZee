import React from 'react'
import { ShoppingCart, User, LogOut, Home, Search, ShoppingBag } from 'lucide-react'
import { Link, navigate, routes } from '@redwoodjs/router'
import { useCart } from 'src/components/CartContext/CartContext'
import { useAuth } from 'src/contexts/AuthContexts'

const MainLayout = ({ children }) => {
  const { itemCount } = useCart()
  const { logOut } = useAuth()

  const handleSignOut = async () => {
    await logOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-[#FFF9E5] font-sans text-[#211F26] antialiased">
      <header className="sticky top-0 z-40 bg-[#3E2679] text-white">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to={routes.home()} className="flex items-center gap-1.5">
            <span className="text-2xl font-black tracking-tight">
              <span className="text-[#FFC107]">YUM</span>
              <span className="text-white">ZEE</span>
            </span>
          </Link>
          {/* Cart Icon now directly links to the Basket page */}
          <Link to={routes.basket()} className="relative rounded-full bg-white/20 p-2">
            <ShoppingCart className="h-5 w-5 text-white" />
            {itemCount > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-[#FFC107] px-1 text-[10px] text-black">{itemCount}</span>}
          </Link>
        </div>
      </header>
      <main className="pb-20">{children}</main>

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
    </div>
  )
}
export default MainLayout
