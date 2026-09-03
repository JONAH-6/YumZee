// web/src/pages/CheckoutPage/CheckoutPage.tsx — Group Order checkout with JOIN/INVITE popup (YZ-XXXX-XXXX)
import React, { useState, useEffect } from 'react'
import { Link, navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'
import { useCart } from 'src/components/CartContext/CartContext'
import { useAuth } from 'src/contexts/AuthContexts'
import { OrderStore } from 'src/lib/orderStore'
import { GroupOrderStore, GroupOrder, calculateGroupTotal, subscribeGroupStore, parseProductSelectionCode } from 'src/lib/groupOrderStore'
import { INITIAL_PRODUCTS } from 'src/lib/orderStore'
import { PaymentModal } from 'src/components/PaymentModal/PaymentModal'
import {
  ShoppingBag,
  MapPin,
  Truck,
  Building2,
  Users,
  ArrowRight,
  Plus,
  Minus,
  Phone,
  User,
  AlertCircle,
  X,
  Copy,
  Check,
} from 'lucide-react'

const CheckoutPage = () => {
  const { cart, totalPrice, updateQuantity, removeFromCart, clearCart, addToCart, deliveryType, setDeliveryType, selectedHostel, setSelectedHostel } = useCart()
  const { user } = useAuth()
  const rules = OrderStore.getRules()
  const locations = rules.eligibleLocations.filter((l) => l.active)

  const [customerName, setCustomerName] = useState('Jonah Gabriel')
  const [customerPhone, setCustomerPhone] = useState('08129001122')
  const [roomNumber, setRoomNumber] = useState('Room B24')
  const [deliveryNotes, setDeliveryNotes] = useState('Please call when at the gate')
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [error, setError] = useState('')

  // Group Order state — checkout popup
  const [groupModalOpen, setGroupModalOpen] = useState(false)
  const [modalView, setModalView] = useState<'choice' | 'join' | 'invite'>('choice')
  const [inviteCode, setInviteCode] = useState('')
  const [joinCodeInput, setJoinCodeInput] = useState('')
  const [joinError, setJoinError] = useState('')
  const [copied, setCopied] = useState(false)
  const [activeGroup, setActiveGroup] = useState<GroupOrder | null>(null)


  const getGuestId = () => {
    if (typeof window === 'undefined') return 'guest'
    let id = localStorage.getItem('yumzee_guest_id')
    if (!id) { id = `guest_${Math.random().toString(36).slice(2, 6)}`; localStorage.setItem('yumzee_guest_id', id) }
    return id
  }
  const uid = (user as any)?.uid || getGuestId()
  const displayName = (user as any)?.displayName || (user as any)?.email?.split('@')[0] || customerName || 'You'

  useEffect(() => {
    const load = () => {
      const g = GroupOrderStore.getActiveForUser(uid)
      if (g && g.status === 'active') setActiveGroup(g)
      else if (g && g.status !== 'active') setActiveGroup(null)
      else setActiveGroup(null)
    }
    load()
    const unsub = subscribeGroupStore(load)
    return () => unsub()
  }, [uid])

  const handleInvite = () => {
    if (cart.length === 0) { setJoinError('Add snacks to invite'); return }
    try {
      const items = cart.map((c) => {
        const prod = INITIAL_PRODUCTS.find((p) => p.id === c.id) || { id: c.id, name: c.name, price: c.price, image: c.image, category: c.category, description: '', rating: 5 } as any
        return { product: prod, quantity: c.quantity }
      })
      const g = GroupOrderStore.createGroupOrder({ hostUserId: uid, hostName: displayName, items })
      // Show product-selection code (e.g., "5", "5x3", "3x2,7x1,12x3") — NOT random YZ — for product sharing
      const selectionCode = (g as any).productSelectionCode || g.code
      setInviteCode(selectionCode)
      setActiveGroup(g)
      setModalView('invite')
      setJoinError('')
    } catch (e: any) { setJoinError(e.message) }
  }

  const parseProductNumberInput = (s: string): { id: number; qty: number } | null => {
    const t = s.trim().replace(/×/g, 'x').toLowerCase()
    const m = t.match(/^(\d+)\s*(?:x\s*(\d+))?$/)
    if (!m) return null
    const id = parseInt(m[1], 10); const qty = m[2] ? parseInt(m[2], 10) : 1
    if (id < 1 || id > 50) return null
    if (qty < 1 || qty > 99) return null
    return { id, qty }
  }

  const handleJoin = async () => {
    const raw = joinCodeInput.trim()
    if (!raw) { setJoinError('Enter code'); return }
    // Product number(s) → add directly to cart (e.g., 1,5,12 or 1x2,5x1,12x3)
    const parsedList = parseProductSelectionCode(raw)
    if (parsedList) {
      const addedNames: string[] = []
      for (const p of parsedList) {
        const prod = INITIAL_PRODUCTS.find(x => x.id === p.productId)
        if (!prod) { setJoinError(`No product #${p.productId} — we have 1-15`); return }
        addToCart(prod, p.quantity)
        addedNames.push(`${prod.name} ×${p.quantity}`)
      }
      setJoinCodeInput('')
      setGroupModalOpen(false)
      setModalView('choice')
      setJoinError(`Added: ${addedNames.join(', ')}`)
      setTimeout(() => setJoinError(''), 3000)
      return
    }
    const code = raw.toUpperCase()
    try {
      let g: GroupOrder | null = null
      try { g = GroupOrderStore.joinGroupOrder(code, { userId: uid, name: displayName }) } catch (localErr: any) {
        try { g = await GroupOrderStore.joinGroupOrderAsync(code, { userId: uid, name: displayName }) } catch (e: any) { throw localErr }
      }
      setActiveGroup(g!)
      setJoinError('')
      setGroupModalOpen(false)
      setModalView('choice')
    } catch (e: any) {
      const all = GroupOrderStore.getAll().filter(g => g.status === 'active')
      const list = all.length ? `Active on this device: ${all.map(g=>g.code).join(', ')}` : 'No active groups on this device — click INVITE to create one.'
      setJoinError(`${e.message}. ${list}`)
    }
  }

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const deliveryFeeSingle = deliveryType === 'delivery' ? 500 : 0
  const grandTotalSingle = totalPrice + deliveryFeeSingle

  const groupTotals = activeGroup ? calculateGroupTotal(activeGroup) : null
  const isHost = activeGroup ? activeGroup.hostUserId === uid : false

  const handleStartPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (activeGroup) {
      if (!isHost) { setError('Only host can pay — pay host outside app'); return }
      if (groupTotals && groupTotals.subtotal === 0) { setError('Group is empty'); return }
      setError('')
      setIsPaymentOpen(true)
      return
    }
    if (cart.length === 0) { setError('Your bag is empty.'); return }
    if (!customerName.trim() || !customerPhone.trim()) { setError('Please provide name and phone.'); return }
    setError('')
    setIsPaymentOpen(true)
  }

  const handlePaymentSuccess = () => {
    if (activeGroup && groupTotals) {
      GroupOrderStore.lockForCheckout(activeGroup.code, uid)
      GroupOrderStore.complete(activeGroup.code)
      clearCart()
      navigate(`/orders`)
      return
    }
    const created = OrderStore.createSingleOrder({
      customerName, customerPhone, deliveryType, hostelAddress: selectedHostel, deliveryAddress: selectedHostel, roomNumber, deliveryInstructions: deliveryNotes,
      items: cart.map((item) => ({ productId: item.id, name: item.name, price: item.price, quantity: item.quantity, image: item.image })),
      foodSubtotal: totalPrice, foodTotal: totalPrice, deliveryFee: deliveryFeeSingle, serviceFee: 0, totalAmount: grandTotalSingle, grandTotal: grandTotalSingle,
    })
    clearCart()
    navigate(`/track/${created.id}`)
  }

  return (
    <div className="min-h-screen bg-[#FAF8FD] py-6">
      <Metadata title="Checkout — YumZee" description="Complete your checkout." />

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={handlePaymentSuccess}
        amount={activeGroup && groupTotals ? groupTotals.grandTotal : grandTotalSingle}
        orderTitle={activeGroup ? `Group Order ${activeGroup.code}` : 'Checkout'}
        studentName={customerName}
      />

      {/* GROUP POPUP — JOIN / INVITE */}
      {groupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="font-black text-sm flex items-center gap-2"><Users className="h-4 w-4 text-[#4B2E83]" /> GROUP ORDER</h3>
              <button onClick={() => { setGroupModalOpen(false); setModalView('choice'); setJoinError('') }} className="rounded-full bg-gray-100 p-1.5"><X className="h-4 w-4" /></button>
            </div>

            <div className="p-6 space-y-4">
              {modalView === 'choice' && (
                <>
                  <button onClick={() => setModalView('join')} className="w-full rounded-2xl border-2 border-[#4B2E83] bg-white p-4 text-left hover:bg-[#F5F1FB] transition">
                    <div className="font-black text-sm text-[#4B2E83]">JOIN</div>
                    <div className="text-xs text-[#6F6B76]">Join a friend&apos;s group order</div>
                  </button>
                  <button onClick={handleInvite} className="w-full rounded-2xl bg-[#4B2E83] p-4 text-left text-white hover:bg-[#371F62] transition">
                    <div className="font-black text-sm">INVITE</div>
                    <div className="text-xs text-white/80">Invite friends to your group order</div>
                  </button>
                  {joinError && <p className="text-xs font-bold text-red-600">{joinError}</p>}
                </>
              )}

              {modalView === 'join' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-center">Enter Product Code</h4>
                  <p className="text-xs text-center text-[#6F6B76]">Format: <span className="font-mono font-bold">1,5,12</span> or <span className="font-mono font-bold">1x2,5x1,12x3</span></p>
                  <input value={joinCodeInput} onChange={(e) => { setJoinCodeInput(e.target.value.toUpperCase()); setJoinError('') }} placeholder="1,5,12 or 1x2,5x1,12x3" className="w-full rounded-xl border border-[#E9E5EE] bg-[#FAF8FD] px-3 py-3 text-sm font-mono font-bold tracking-widest text-center focus:border-[#4B2E83] focus:outline-none" />
                  {joinError && <p className="text-xs font-bold text-[#4B2E83] text-center whitespace-pre-wrap">{joinError}</p>}
                  <div className="rounded-xl bg-[#F5F1FB] p-3 text-xs text-[#6F6B76]">
                    <div className="font-bold text-[#211F26]">Product IDs (1-15):</div>
                    <div className="font-mono mt-1">1=Shawarma  2=Plantain  3=Puff Puff  4=Chapman  5=Moi Moi</div>
                    <div className="font-mono">6=Zobo  7=Akara  8=Suya  9=Meat Pie  10=Sausage Roll</div>
                    <div className="font-mono">11=Sandwich  12=Cake  13=Cupcake  14=Fruit Cup  15=Yogurt</div>
                  </div>
                  <button onClick={handleJoin} className="w-full rounded-xl bg-[#4B2E83] py-3 text-sm font-bold text-white">ADD TO BAG</button>
                  <button onClick={() => setModalView('choice')} className="w-full text-xs font-bold text-[#6F6B76]">← Back</button>
                </div>
              )}

              {modalView === 'invite' && (
                <div className="space-y-3 text-center">
                  <h4 className="font-bold text-sm">Share This Code</h4>
                  <div className="mx-auto rounded-xl bg-[#4B2E83] text-white font-mono text-xl font-black tracking-widest py-3 px-6">{inviteCode}</div>
                  <p className="text-xs text-[#6F6B76]">Share this code with friends — anyone can join</p>
                  <button onClick={() => handleCopy(inviteCode)} className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#E9E5EE] bg-white py-2.5 text-xs font-bold hover:bg-gray-50">
                    {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />} {copied ? 'Copied' : '📋 COPY CODE'}
                  </button>
                  <button onClick={() => { setGroupModalOpen(false); setModalView('choice') }} className="w-full rounded-xl bg-[#4B2E83] py-2.5 text-xs font-bold text-white">Done</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl mx-auto px-2 sm:px-3 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#211F26]">Checkout</h1>
            <p className="mt-1 text-xs text-[#6F6B76]">Review your items.</p>
          </div>
          <Link to={routes.home()} className="text-xs font-bold text-[#4B2E83]">← Back</Link>
        </div>

        {/* SAVE ON DELIVERY — full width */}
        {!activeGroup ? (
          <div className="rounded-xl border border-[#E9E5EE] bg-white p-3 space-y-2.5 text-center">
            <h3 className="font-bold text-xs tracking-wider">═══ SAVE ON DELIVERY ═══</h3>
            <p className="text-xs text-[#6F6B76]">Save on delivery with a Group Order</p>
            <button onClick={() => setGroupModalOpen(true)} className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#FFC928] py-2.5 text-xs font-bold text-[#4B2E83] hover:bg-[#E5B420] transition">
              <Users className="h-3.5 w-3.5" /> Start Group Order
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-[#FFC928] bg-[#FFF9E8] p-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold">GROUP ORDER</div>
              <div className="font-mono text-xs font-bold">{(activeGroup as any).productSelectionCode || activeGroup.code} • {activeGroup.members.length} members</div>
              <div className="text-xs text-[#6F6B76]">{activeGroup.members.map(m => `${m.name} (${m.role})`).join(', ')}</div>
            </div>
            <button onClick={() => { const all = GroupOrderStore.getAll(); const g = all.find(x=>x.code===activeGroup.code); if(g){g.status='expired' as any; localStorage.setItem('yumzee_group_orders_yz', JSON.stringify(all)); setActiveGroup(null)} }} className="text-xs font-bold text-red-600">Leave</button>
          </div>
        )}

        {cart.length === 0 && !activeGroup ? (
          <div className="rounded-2xl border border-[#E9E5EE] bg-white p-6 text-center shadow-sm">
            <ShoppingBag className="mx-auto h-12 w-12 text-[#6F6B76]/40 mb-3" />
            <h3 className="text-sm font-bold text-[#211F26]">Your bag is empty</h3>
            <p className="text-xs text-[#6F6B76] mt-1 mb-4">Add snacks to start an order.</p>
            <Link to={routes.home()} className="inline-flex items-center gap-2 rounded-2xl bg-[#FFC928] px-6 py-3 text-sm font-bold text-[#4B2E83]">Browse Menu</Link>
          </div>
        ) : (
          <form onSubmit={handleStartPayment} className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-xl border border-[#E9E5EE] bg-white p-3 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-[#E9E5EE] pb-2">
                  <div className="flex items-center gap-1.5"><ShoppingBag className="h-4 w-4 text-[#4B2E83]" /><h3 className="font-bold text-xs text-[#211F26]">Selected Snacks ({activeGroup ? activeGroup.items.length : cart.length})</h3></div>
                  {!activeGroup && <button type="button" onClick={clearCart} className="text-xs font-bold text-rose-600 hover:underline">Clear All</button>}
                </div>
                <div className="divide-y divide-[#E9E5EE]">
                  {(activeGroup ? activeGroup.items : cart.map(c => ({ id: c.id, productName: c.name, productImage: c.image, price: c.price, quantity: c.quantity, addedByName: 'You' })) as any).map((item: any) => (
                    <div key={item.id || item.productId} className="flex items-center justify-between py-2.5 gap-2">
                      <img src={item.productImage || item.image} alt={item.productName || item.name} className="h-10 w-10 rounded-xl border border-[#E9E5EE] object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold truncate">{item.productName || item.name}</h4>
                        {activeGroup && <p className="text-[10px] text-[#6F6B76]">{item.addedByName}</p>}
                        <p className="text-xs text-[#6F6B76]">₦{item.price.toLocaleString()} <span className="text-[10px]">each</span></p>
                      </div>
                      {!activeGroup ? (
                        <div className="flex items-center rounded-lg border bg-[#FAF8FD] p-0.5">
                          <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="h-6 w-6 flex items-center justify-center rounded bg-white text-xs font-bold shadow-sm"><Minus className="h-3 w-3" /></button>
                          <span className="w-5 text-center text-xs font-bold">{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="h-6 w-6 flex items-center justify-center rounded bg-white text-xs font-bold shadow-sm"><Plus className="h-3 w-3" /></button>
                        </div>
                      ) : (
                        <span className="text-xs font-bold">x{item.quantity}</span>
                      )}
                      <div className="text-right min-w-[50px]"><span className="text-xs font-bold text-[#4B2E83]">₦{(item.price * item.quantity).toLocaleString()}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-xl border border-[#E9E5EE] bg-white p-3 shadow-sm space-y-3 sticky top-20">
                {activeGroup && groupTotals ? (
                  <>
                    <h3 className="font-bold text-xs border-b pb-3">═══ GROUP ORDER ═══<br /><span className="font-mono text-xs font-normal">Code: {activeGroup.code}</span></h3>
                    {groupTotals.memberTotals.map((m: any) => (
                      <div key={m.userId} className="text-xs">
                        <div className="font-bold">👤 {m.name} {m.role === 'host' ? '(Host)' : '(Joined)'}</div>
                        {activeGroup.items.filter(i => i.addedByUserId === m.userId).map(it => (
                          <div key={it.id} className="flex justify-between text-[#6F6B76] ml-4"><span>{it.productName} ({it.quantity}x)</span><span>₦{(it.price * it.quantity).toLocaleString()}</span></div>
                        ))}
                      </div>
                    ))}
                    <div className="space-y-2 text-xs border-t pt-3">
                      <div className="flex justify-between text-[#6F6B76]"><span>Subtotal</span><span className="font-bold text-[#211F26]">₦{groupTotals.subtotal.toLocaleString()}</span></div>
                      <div className="flex justify-between text-[#6F6B76]"><span>Delivery Fee {groupTotals.memberTotals.length >= 2 ? <span className="ml-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">-30%</span> : null}</span><span className="font-bold text-[#211F26]">{groupTotals.memberTotals.length >= 2 ? <><span className="line-through text-[#A09BA8]">₦{groupTotals.baseFee}</span> → ₦{groupTotals.deliveryFee}</> : `₦${groupTotals.baseFee}`}</span></div>
                      <div className="border-t pt-3 flex justify-between items-baseline"><span className="text-xs font-bold block">GRAND TOTAL</span><span className="text-lg font-bold text-[#4B2E83]">₦{groupTotals.grandTotal.toLocaleString()}</span></div>
                    </div>
                    {!isHost && <p className="text-xs text-center text-amber-700 font-bold">Only host can pay</p>}
                    {error && <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-3 text-xs font-bold text-rose-700"><AlertCircle className="h-4 w-4" /><span>{error}</span></div>}
                    <button type="submit" disabled={!!activeGroup && !isHost} className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#FFC928] py-3 text-sm font-bold text-[#4B2E83] shadow disabled:opacity-40">
                      <span>PAY NOW</span><ArrowRight className="h-5 w-5" />
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="font-bold text-xs border-b pb-3">Payment Summary</h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-[#6F6B76]"><span>Food Subtotal</span><span className="font-bold text-[#211F26]">₦{totalPrice.toLocaleString()}</span></div>
                      <div className="flex justify-between text-[#6F6B76]"><span>Delivery Fee</span><span className="font-bold text-[#211F26]">{deliveryType === 'pickup' ? 'FREE' : `₦500`}</span></div>
                      <div className="border-t pt-3 flex justify-between items-baseline"><span className="text-xs font-bold block">Total</span><span className="text-lg font-bold text-[#4B2E83]">₦{grandTotalSingle.toLocaleString()}</span></div>
                    </div>
                    {error && <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-3 text-xs font-bold text-rose-700"><AlertCircle className="h-4 w-4" /><span>{error}</span></div>}
                    <button type="submit" className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#FFC928] py-3 text-sm font-bold text-[#4B2E83] shadow">
                      <span>Pay & Place Order</span><ArrowRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default CheckoutPage
