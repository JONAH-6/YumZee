import React, { useState, useEffect, useRef } from 'react'
import { ShoppingCart, User, LogOut, Home, Search, ShoppingBag } from 'lucide-react'
import { Link, navigate, routes } from '@redwoodjs/router'
import { useCart } from 'src/components/CartContext/CartContext'
import { useAuth } from 'src/contexts/AuthContexts'

const MainLayout = ({ children }) => {
  const { itemCount } = useCart()
  const { logOut } = useAuth()

  const [showFloatingCart, setShowFloatingCart] = useState(false)
  const [pos, setPos] = useState({ x: 16, y: 0 })
  const dragging = useRef(false)
  const offset = useRef({ x: 0, y: 0 })
  const didDrag = useRef(false)

  useEffect(() => {
    setPos({ x: 16, y: window.innerHeight - 200 })
  }, [])

  useEffect(() => {
    if (itemCount > 0) setShowFloatingCart(true)
    else setShowFloatingCart(false)
  }, [itemCount])

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true
    didDrag.current = false
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return
    didDrag.current = true
    setPos({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y })
  }

  const onPointerUp = () => {
    dragging.current = false
    const margin = 16
    const width = window.innerWidth
    const height = window.innerHeight
    const newX = pos.x < width / 2 ? margin : width - margin - 56
    const newY = Math.min(Math.max(margin, pos.y), height - margin - 56)
    setPos({ x: newX, y: newY })
  }

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

      {/* Draggable Floating Cart Button */}
      <div
        className={`fixed z-50 transition-all duration-500 ease-out ${
          showFloatingCart ? 'translate-x-0 opacity-100' : '-translate-x-24 opacity-0 pointer-events-none'
        }`}
        style={{ left: pos.x, top: pos.y, touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <button
          onClick={() => { if (!didDrag.current) navigate(routes.basket()) }}
          className="relative flex h-14 w-14 cursor-grab items-center justify-center rounded-full bg-[#FFC107] shadow-2xl active:cursor-grabbing"
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
