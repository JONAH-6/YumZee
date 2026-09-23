import React, { useState } from 'react'
import { Link, navigate, routes } from '@redwoodjs/router'
import { useCart } from 'src/components/CartContext/CartContext'
import { generateGroupCode, parseGroupCode } from 'src/lib/groupCodeUtils'
import { INITIAL_PRODUCTS } from 'src/lib/orderStore'
import { Trash2, ChevronLeft, Users, X } from 'lucide-react'
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore'
import { db } from 'src/lib/firebase'
import { useAuth } from 'src/contexts/AuthContexts'

const BasketPage = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, addToCart } = useCart()
  const { user } = useAuth()
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false)
  const [groupCodeInput, setGroupCodeInput] = useState('')
  const [isGroupActive, setIsGroupActive] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  const deliveryFee = isGroupActive ? 140 : 500
  const total = totalPrice + deliveryFee

  const handleGenerateInviteCode = () => setInviteCode(generateGroupCode(cart))

  const handleJoinGroup = () => {
    const parsedItems = parseGroupCode(groupCodeInput)
    if (parsedItems.length === 0) {
      return
    }
    parsedItems.forEach(({ id, quantity }) => {
      const product = INITIAL_PRODUCTS.find((p) => p.id === id)
      if (product) addToCart(product, quantity)
    })
    setIsGroupActive(true)
    setIsGroupModalOpen(false)
    setGroupCodeInput('')
  }

  const handleStartGroup = () => {
    setIsGroupActive(true)
    handleGenerateInviteCode()
    setIsGroupModalOpen(false)
  }

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return
    setIsPlacingOrder(true)
    try {
      // 🔥 Fetch user's phone from their Profile
      let userPhone = ''
      if (user?.uid) {
        try {
          const profileDoc = await getDoc(doc(db, 'profiles', user.uid))
          if (profileDoc.exists()) {
            userPhone = profileDoc.data().phone || ''
          }
        } catch (err) {
          console.error('Could not load phone from profile:', err)
        }
      }

      await addDoc(collection(db, 'orders'), {
        customerName: user?.displayName || user?.email?.split('@')[0] || 'Customer',
        customerEmail: user?.email || '',
        customerPhone: userPhone, // 🔥 NEW
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        subtotal: totalPrice,
        deliveryFee: deliveryFee,
        total: total,
        groupActive: isGroupActive,
        groupCode: inviteCode,
        isCompleted: false, // 🔥 NEW - Shows in "Orders" tab, not "Completed"
        createdAt: serverTimestamp(),
      })
      navigate('/orders')
    } catch (error) {
      console.error('Error placing order:', error)
    } finally {
      setIsPlacingOrder(false)
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-[#FFF9E5] font-sans text-[#211F26] pb-40">
      <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-[#E9E5EE] bg-white p-4">
        <Link to={routes.home()} className="rounded-full p-1 hover:bg-gray-100">
          <ChevronLeft className="h-6 w-6 text-[#211F26]" />
        </Link>
        <h1 className="text-lg font-bold">Your Basket</h1>
      </div>

      <div className="p-4">
        <div className="space-y-3">
          {cart.length === 0 ? (
            <div className="anim-pop-in rounded-2xl bg-white p-6 text-center">
              <p className="text-sm text-[#6F6B76]">Your basket is empty.</p>
              <Link to={routes.home()} className="mt-4 inline-block rounded-full bg-[#FFC107] px-6 py-2 text-sm font-bold text-black transition hover:bg-[#e6ad00] active:scale-95">Browse Snacks</Link>
            </div>
          ) : (
            cart.map((item, index) => (
              <div
                key={item.id}
                className="anim-fade-up flex items-center gap-3 rounded-2xl bg-white p-4 transition-all duration-200 hover:-translate-y-0.5"
                style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}
              >
                <img src={item.image} alt={item.name} className="h-24 w-24 rounded-xl object-contain bg-[#FFC107]" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold truncate">#{item.id} {item.name}</h3>
                  <p className="text-[11px] text-[#6F6B76] mt-0.5">Qty {item.quantity}</p>
                  <p className="mt-1 text-sm font-bold text-[#3E2679]">₦{(item.price * item.quantity).toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQuantity(item.id, -1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E9E5EE] bg-[#FAF8FD] text-sm font-bold transition active:scale-90">−</button>
                    <span key={item.quantity} className="anim-pop-in inline-block w-6 text-center text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E9E5EE] bg-[#FAF8FD] text-sm font-bold transition active:scale-90">+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="rounded-md p-1 text-[#A09BA8] transition hover:scale-110 hover:text-red-500 active:scale-90">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="anim-fade-up mt-4 rounded-2xl border border-[#E9E5EE] bg-white p-4" style={{ animationDelay: '0.25s' }}>
            {isGroupActive ? (
              <div className="text-center">
                <span className="text-sm font-bold text-[#3E2679]">Group Order Active (30% Delivery Discount)</span>
                <div className="mt-2 bg-[#F5F1FB] p-3 rounded-lg text-xs text-[#4B2E83] break-all">
                  <span className="font-bold">Invite Code:</span> {inviteCode}
                  <button onClick={() => navigator.clipboard.writeText(inviteCode)} className="ml-2 bg-[#FFC928] px-2 py-1 rounded text-black font-bold">Copy</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setIsGroupModalOpen(true)} className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#3E2679] py-3 text-sm font-bold text-[#3E2679]">
                <Users className="h-4 w-4" /> Save on Delivery with a Group Order
              </button>
            )}
          </div>
        )}

        {cart.length > 0 && (
          <div className="anim-fade-up mt-4 rounded-2xl border border-[#E9E5EE] bg-white p-5" style={{ animationDelay: '0.35s' }}>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#6F6B76]">Basket Subtotal</span>
              <span className="font-bold">₦{totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm mb-4">
              <span className="text-[#6F6B76]">Rider Delivery {isGroupActive && <span className="text-green-600">(Discounted)</span>}</span>
              <span className="font-bold">₦{deliveryFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-[#E9E5EE] pt-4">
              <span className="font-bold">Total</span>
              <span className="font-black text-[#3E2679]">₦{total.toLocaleString()}</span>
            </div>
          </div>
        )}

        {cart.length > 0 && (
          <div className="fixed bottom-16 left-0 right-0 z-30 flex justify-center">
            <div className="anim-fade-up w-full max-w-md bg-gradient-to-t from-[#FFF9E5] via-[#FFF9E5]/95 to-transparent px-4 pb-3 pt-6" style={{ animationDelay: '0.45s' }}>
              <button onClick={handlePlaceOrder} disabled={isPlacingOrder} className="w-full rounded-full bg-[#FFC107] py-5 text-lg font-black text-black transition hover:bg-[#e6ad00] active:scale-[0.98] disabled:opacity-50">
                {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        )}
      </div>

      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="anim-pop-in relative w-full max-w-sm rounded-2xl bg-white p-6">
            <button onClick={() => setIsGroupModalOpen(false)} className="absolute right-3 top-3 text-gray-500"><X className="h-5 w-5" /></button>
            <h2 className="text-lg font-bold text-[#211F26] mb-4">Group Order</h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <button onClick={handleStartGroup} className="w-full rounded-xl bg-[#3E2679] py-3 text-sm font-bold text-white">Start Group Order (Invite)</button>
                <p className="text-center text-xs text-[#6F6B76]">I am the Host. I will share my code.</p>
              </div>
              <div className="border-t border-[#E9E5EE] pt-4">
                <p className="text-xs font-bold text-[#6F6B76] mb-2">JOIN A GROUP</p>
                <input type="text" placeholder="e.g., 1×3,5×2" value={groupCodeInput} onChange={(e) => setGroupCodeInput(e.target.value)} className="w-full rounded-lg border border-[#E9E5EE] bg-[#FAF8FD] p-3 text-sm outline-none focus:border-[#3E2679]" />
                <button onClick={handleJoinGroup} className="mt-2 w-full rounded-xl bg-[#FFC107] py-3 text-sm font-bold text-black">Join Group</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BasketPage
