import React, { useState } from 'react'
import { Link, navigate, routes } from '@redwoodjs/router'
import { useCart } from 'src/components/CartContext/CartContext'
import { INITIAL_PRODUCTS } from 'src/lib/orderStore'
import { generateGroupCode, parseGroupCode } from 'src/lib/groupCodeUtils'
import { Trash2, ChevronLeft, Users, X, Package } from 'lucide-react'

const BasketPage = () => {
  const { cart, removeFromCart, updateQuantity, toggleBrandPackage, totalPrice, addToCart } = useCart()

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false)
  const [groupCodeInput, setGroupCodeInput] = useState('')
  const [isGroupActive, setIsGroupActive] = useState(false)
  const [inviteCode, setInviteCode] = useState('')

  // Group Delivery Fee: 200 normal, 140 for groups (30% off)
  const deliveryFee = isGroupActive ? 140 : 200
  const total = totalPrice + deliveryFee

  // Generate the exact code from current cart (e.g., "1×3,5×2,12×1")
  const handleGenerateInviteCode = () => {
    const code = generateGroupCode(cart)
    setInviteCode(code)
  }

  // Join group by parsing the code and adding products from the 15-product list
  const handleJoinGroup = () => {
    const parsedItems = parseGroupCode(groupCodeInput)

    if (parsedItems.length === 0) {
      alert('Invalid code. Please use format like: 1×3,5×2 or 1,5,12')
      return
    }

    const addedNames: string[] = []
    parsedItems.forEach(({ id, quantity }) => {
      const product = INITIAL_PRODUCTS.find((p) => p.id === id)
      if (product) {
        addToCart(product, quantity)
        addedNames.push(`${product.name} ×${quantity}`)
      }
    })

    setIsGroupActive(true)
    setIsGroupModalOpen(false)
    setGroupCodeInput('')
    alert(`Added: ${addedNames.join(', ')}`)
  }

  const handleStartGroup = () => {
    setIsGroupActive(true)
    handleGenerateInviteCode()
    setIsGroupModalOpen(false)
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-[#FFF9E5] font-sans text-[#211F26]">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-[#E9E5EE] bg-white p-4">
        <Link to={routes.home()} className="rounded-full p-1 hover:bg-gray-100">
          <ChevronLeft className="h-6 w-6 text-[#211F26]" />
        </Link>
        <h1 className="text-lg font-bold">Your Basket</h1>
      </div>

      <div className="p-4">
        {/* Cart Items */}
        <div className="space-y-3">
          {cart.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
              <p className="text-sm text-[#6F6B76]">Your basket is empty.</p>
              <Link to={routes.home()} className="mt-4 inline-block rounded-full bg-[#FFC107] px-6 py-2 text-sm font-bold text-black">Browse Snacks</Link>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl object-cover" />
                  <div className="flex-1">
                    <h3 className="text-sm font-bold">#{item.id} {item.name}</h3>
                    <p className="text-xs text-[#6F6B76]">Qty {item.quantity}</p>
                    <p className="mt-1 text-sm font-bold text-[#3E2679]">₦{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQuantity(item.id, -1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-[#E9E5EE] bg-[#FAF8FD] text-sm font-bold">−</button>
                      <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-[#E9E5EE] bg-[#FAF8FD] text-sm font-bold">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="rounded-md p-1 text-[#A09BA8] transition hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {/* Brand Package Toggle */}
                <button
                  onClick={() => toggleBrandPackage(item.id)}
                  className={`mt-3 flex w-full items-center gap-2 rounded-xl border p-2 text-xs font-bold transition ${
                    item.brandPackage
                      ? 'border-[#3E2679] bg-[#3E2679] text-white'
                      : 'border-[#E9E5EE] bg-[#FAF8FD] text-[#6F6B76]'
                  }`}
                >
                  <Package className="h-4 w-4" />
                  <span className="flex-1 text-left">Lylon Bag (+₦100)</span>
                  <span className={item.brandPackage ? 'text-white' : 'text-[#3E2679]'}>
                    {item.brandPackage ? 'Added' : 'Add'}
                  </span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Group Order Section */}
        {cart.length > 0 && (
          <div className="mt-4 rounded-2xl border border-[#E9E5EE] bg-white p-4 shadow-sm">
            {isGroupActive ? (
              <div className="text-center">
                <span className="text-sm font-bold text-[#3E2679]">Group Order Active (30% Delivery Discount)</span>
                <div className="mt-2 bg-[#F5F1FB] p-3 rounded-lg text-xs text-[#4B2E83] break-all">
                  <span className="font-bold">Invite Code:</span> {inviteCode}
                  <button onClick={() => navigator.clipboard.writeText(inviteCode)} className="ml-2 bg-[#FFC928] px-2 py-1 rounded text-black font-bold">Copy</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsGroupModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#3E2679] py-3 text-sm font-bold text-[#3E2679]"
              >
                <Users className="h-4 w-4" /> Save on Delivery with a Group Order
              </button>
            )}
          </div>
        )}

        {/* Totals Card */}
        {cart.length > 0 && (
          <div className="mt-4 rounded-2xl border border-[#E9E5EE] bg-white p-5 shadow-sm">
            {cart.some((item) => item.brandPackage) && (
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#6F6B76]">Lylon Bag Fee</span>
                <span className="font-bold">₦{cart.filter((i) => i.brandPackage).length * 100}</span>
              </div>
            )}
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#6F6B76]">Basket Subtotal</span>
              <span className="font-bold">₦{totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm mb-4">
              <span className="text-[#6F6B76]">Campus Delivery {isGroupActive && <span className="text-green-600">(Discounted)</span>}</span>
              <span className="font-bold">₦{deliveryFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-[#E9E5EE] pt-4">
              <span className="font-bold">Total (Host Pays)</span>
              <span className="font-black text-[#3E2679]">₦{total.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Place Order Button */}
        {cart.length > 0 && (
          <button
            onClick={() => { alert('Order Placed! Host pays for the group.'); navigate('/') }}
            className="mt-6 w-full rounded-full bg-[#FFC107] py-4 text-base font-black text-black shadow-lg"
          >
            Place Order — ₦{total.toLocaleString()}
          </button>
        )}
      </div>

      {/* Group Order Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <button onClick={() => setIsGroupModalOpen(false)} className="absolute right-3 top-3 text-gray-500">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold text-[#211F26] mb-4">Group Order</h2>

            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleStartGroup}
                  className="w-full rounded-xl bg-[#3E2679] py-3 text-sm font-bold text-white"
                >
                  Start Group Order (Invite)
                </button>
                <p className="text-center text-xs text-[#6F6B76]">I am the Host. I will share my code.</p>
              </div>

              <div className="border-t border-[#E9E5EE] pt-4">
                <p className="text-xs font-bold text-[#6F6B76] mb-2">JOIN A GROUP</p>
                <input
                  type="text"
                  placeholder="e.g., 1×3,5×2 or 1,5,12"
                  value={groupCodeInput}
                  onChange={(e) => setGroupCodeInput(e.target.value)}
                  className="w-full rounded-lg border border-[#E9E5EE] bg-[#FAF8FD] p-3 text-sm outline-none focus:border-[#3E2679]"
                />
                <button
                  onClick={handleJoinGroup}
                  className="mt-2 w-full rounded-xl bg-[#FFC107] py-3 text-sm font-bold text-black"
                >
                  Join Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BasketPage
