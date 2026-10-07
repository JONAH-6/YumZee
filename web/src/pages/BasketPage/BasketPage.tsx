import React, { useState, useEffect } from 'react'
import { Link, navigate, routes } from '@redwoodjs/router'
import { useCart } from 'src/components/CartContext/CartContext'
import { generateGroupCode, parseGroupCode } from 'src/lib/groupCodeUtils'
import { INITIAL_PRODUCTS } from 'src/lib/orderStore'
import { Trash2, ChevronLeft, Users, X, MapPin, Pencil, Check } from 'lucide-react'
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore'
import { db } from 'src/lib/firebase'
import { useAuth } from 'src/contexts/AuthContexts'
import DeliveryMap, {
  reverseGeocode,
  EMPTY_ADDRESS,
  type AddressDetails,
} from 'src/components/DeliveryMap/DeliveryMap'

const BasketPage = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, addToCart } = useCart()
  const { user } = useAuth()
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false)
  const [groupCodeInput, setGroupCodeInput] = useState('')
  const [isGroupActive, setIsGroupActive] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [latitude, setLatitude] = useState(6.5244) // Default: Lagos
  const [longitude, setLongitude] = useState(3.3792)
  const [locStatus, setLocStatus] = useState<'idle' | 'locating' | 'ok' | 'denied'>('idle')
  const [address, setAddress] = useState<AddressDetails>({ ...EMPTY_ADDRESS })
  const [lookingUp, setLookingUp] = useState(false)
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [editedAddress, setEditedAddress] = useState<AddressDetails>({ ...EMPTY_ADDRESS })
  const [houseNumber, setHouseNumber] = useState('')
  const [junction, setJunction] = useState('')

  // Keep the edit fields in sync while the map auto-detects
  useEffect(() => {
    if (!isEditingAddress) {
      setEditedAddress({ ...address })
    }
  }, [address, isEditingAddress])

  const lookupAddress = async (lat: number, lng: number) => {
    setLookingUp(true)
    const found = await reverseGeocode(lat, lng)
    setAddress(found)
    setLookingUp(false)
  }

  // Ask for location permission when checkout opens
  const requestLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocStatus('denied')
      return
    }
    setLocStatus('locating')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setLatitude(lat)
        setLongitude(lng)
        setLocStatus('ok')
        lookupAddress(lat, lng)
      },
      () => setLocStatus('denied'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  useEffect(() => {
    requestLocation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const deliveryFee = isGroupActive ? 140 : 500
  const total = totalPrice + deliveryFee

  const startEditingAddress = () => {
    setEditedAddress({ ...address })
    setIsEditingAddress(true)
  }

  const saveEditedAddress = () => {
    const combined = [
      editedAddress.street +
        (editedAddress.houseNumber ? `, ${editedAddress.houseNumber}` : ''),
      editedAddress.area,
      editedAddress.city,
      editedAddress.state,
    ]
      .filter(Boolean)
      .join(', ')
    setAddress({ ...editedAddress, fullAddress: combined || editedAddress.fullAddress })
    setHouseNumber(editedAddress.houseNumber || '')
    setIsEditingAddress(false)
  }

  const cancelEditingAddress = () => {
    setEditedAddress({ ...address })
    setIsEditingAddress(false)
  }

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

      // Final Glovo-style address: "Street, Number, near Junction, Area, City, State"
      const finalHouseNumber = houseNumber.trim() || address.houseNumber
      const finalStreet =
        address.street + (finalHouseNumber ? `, ${finalHouseNumber}` : '')
      const finalAddress = [
        finalStreet,
        junction.trim() ? `near ${junction.trim()}` : '',
        address.area,
        address.city,
        address.state,
      ]
        .filter(Boolean)
        .join(', ')

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
        latitude: latitude, // Customer live location for admin map
        longitude: longitude,
        street: address.street,
        houseNumber: finalHouseNumber,
        junction: junction.trim(),
        area: address.area,
        city: address.city,
        state: address.state,
        fullAddress: finalAddress,
      })

      // Personal notification: only this user sees it (filtered by targetEmail)
      await addDoc(collection(db, 'notifications'), {
        title: 'Order Placed Successfully!',
        body: `Your order of ₦${total.toLocaleString()} has been received. We'll get it to you soon!`,
        targetEmail: user?.email || '',
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
          <div className="anim-fade-up mt-4 rounded-2xl border border-[#E9E5EE] bg-white p-4" style={{ animationDelay: '0.3s' }}>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-[#6F6B76]">Delivery Location</p>
              {locStatus === 'ok' && <span className="text-[11px] font-bold text-green-600">Location set</span>}
            </div>
            <DeliveryMap
              latitude={latitude}
              longitude={longitude}
              onLocationChange={(lat, lng, addr) => {
                setLatitude(lat)
                setLongitude(lng)
                setAddress(addr)
                setLocStatus('ok')
              }}
              interactive
              addressLabel={
                address.street
                  ? `${address.street}${address.houseNumber ? `, ${address.houseNumber}` : ''}, ${[address.area, address.city].filter(Boolean).join(', ')}`
                  : 'Your delivery point'
              }
            />
            {/* Auto-detected address, Glovo style, with manual edit */}
            <div className="relative mt-2 rounded-xl bg-[#F5F1FB] p-3 text-sm">
              {!isEditingAddress && (
                <button
                  type="button"
                  onClick={startEditingAddress}
                  title="Edit address"
                  className="absolute right-2 top-2 rounded-full bg-white p-1.5 text-[#3E2679] shadow-sm transition hover:bg-[#FFC107] active:scale-90"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
              {isEditingAddress ? (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#3E2679]">
                    Correct the address
                  </p>
                  <input
                    type="text"
                    value={editedAddress.street}
                    onChange={(e) => setEditedAddress({ ...editedAddress, street: e.target.value })}
                    placeholder="Street name"
                    className="w-full rounded-lg border border-[#E9E5EE] bg-white px-3 py-2 text-sm outline-none focus:border-[#3E2679]"
                  />
                  <input
                    type="text"
                    value={editedAddress.houseNumber}
                    onChange={(e) => setEditedAddress({ ...editedAddress, houseNumber: e.target.value })}
                    placeholder="House / Flat number (e.g. 15)"
                    className="w-full rounded-lg border border-[#E9E5EE] bg-white px-3 py-2 text-sm outline-none focus:border-[#3E2679]"
                  />
                  <input
                    type="text"
                    value={editedAddress.area}
                    onChange={(e) => setEditedAddress({ ...editedAddress, area: e.target.value })}
                    placeholder="Area / Neighbourhood"
                    className="w-full rounded-lg border border-[#E9E5EE] bg-white px-3 py-2 text-sm outline-none focus:border-[#3E2679]"
                  />
                  <input
                    type="text"
                    value={editedAddress.city}
                    onChange={(e) => setEditedAddress({ ...editedAddress, city: e.target.value })}
                    placeholder="City"
                    className="w-full rounded-lg border border-[#E9E5EE] bg-white px-3 py-2 text-sm outline-none focus:border-[#3E2679]"
                  />
                  <input
                    type="text"
                    value={editedAddress.state}
                    onChange={(e) => setEditedAddress({ ...editedAddress, state: e.target.value })}
                    placeholder="State"
                    className="w-full rounded-lg border border-[#E9E5EE] bg-white px-3 py-2 text-sm outline-none focus:border-[#3E2679]"
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={saveEditedAddress}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#FFC107] py-2 text-xs font-black text-black transition hover:bg-[#e6ad00] active:scale-95"
                    >
                      <Check className="h-4 w-4" /> Save Address
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditingAddress}
                      className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-[#6F6B76] transition hover:bg-gray-100 active:scale-95"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : lookingUp ? (
                <p className="text-[#6F6B76]">Detecting your address...</p>
              ) : address.street || address.area || address.city ? (
                <div className="pr-8">
                  {address.street && (
                    <p className="font-bold text-[#211F26]">
                      {address.street}
                      {address.houseNumber ? `, ${address.houseNumber}` : ''}
                    </p>
                  )}
                  <p className="text-[#6F6B76]">
                    {[address.area, address.city, address.state]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              ) : (
                <p className="pr-8 text-[#6F6B76]">
                  Tap the map or use your current location to detect your address.
                </p>
              )}
            </div>
            <button type="button" onClick={requestLocation} disabled={locStatus === 'locating'} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#3E2679] py-2.5 text-sm font-bold text-white disabled:opacity-50">
              <MapPin className="h-4 w-4" /> {locStatus === 'locating' ? 'Locating...' : locStatus === 'ok' ? 'Use My Current Location Again' : 'Use My Current Location'}
            </button>
            {locStatus === 'denied' && (
              <p className="mt-1 text-[11px] text-red-500">Location blocked — allow access when asked, or drag the pin on the map.</p>
            )}
          </div>
        )}

        {cart.length > 0 && (
          <div className="anim-fade-up mt-4 rounded-2xl border border-[#E9E5EE] bg-white p-4" style={{ animationDelay: '0.33s' }}>
            <p className="mb-3 text-base font-black text-[#211F26]">Confirm your delivery details</p>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#6F6B76]">
                  House / Flat Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  placeholder="e.g. 15"
                  className="w-full rounded-xl border border-[#E9E5EE] bg-[#FAF8FD] px-4 py-3 text-sm font-medium text-[#211F26] placeholder-[#A09BA8] outline-none focus:border-[#3E2679]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#6F6B76]">
                  Nearest Junction / Landmark
                </label>
                <input
                  type="text"
                  value={junction}
                  onChange={(e) => setJunction(e.target.value)}
                  placeholder="e.g. Near Yaba Junction"
                  className="w-full rounded-xl border border-[#E9E5EE] bg-[#FAF8FD] px-4 py-3 text-sm font-medium text-[#211F26] placeholder-[#A09BA8] outline-none focus:border-[#3E2679]"
                />
              </div>
            </div>
            {address.street ? (
              <div className="mt-4 rounded-xl border border-[#FFC107] bg-[#FFFBEF] p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#3E2679]">
                  Final Address Preview
                </p>
                <p className="mt-1 text-sm font-bold text-[#211F26]">
                  {address.street}
                  {(houseNumber.trim() || address.houseNumber) &&
                    `, ${houseNumber.trim() || address.houseNumber}`}
                </p>
                {junction.trim() && (
                  <p className="text-xs text-[#6F6B76]">near {junction.trim()}</p>
                )}
                <p className="text-xs text-[#6F6B76]">
                  {[address.area, address.city, address.state].filter(Boolean).join(', ')}
                </p>
              </div>
            ) : null}
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
              <button onClick={handlePlaceOrder} disabled={isPlacingOrder || !houseNumber.trim()} className="w-full rounded-full bg-[#FFC107] py-5 text-lg font-black text-black transition hover:bg-[#e6ad00] active:scale-[0.98] disabled:opacity-50">
                {isPlacingOrder ? 'Placing Order...' : !houseNumber.trim() ? 'Add House Number to Continue' : 'Place Order'}
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
