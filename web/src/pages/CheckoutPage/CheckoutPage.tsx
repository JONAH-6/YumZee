import { useState, useEffect } from 'react'
import { navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'
import { ChevronLeft, Lock, Loader2, ShieldCheck, AlertCircle } from 'lucide-react'
import { useCart } from 'src/components/CartContext/CartContext'
import { useAuth } from 'src/contexts/AuthContexts'
import { db } from 'src/lib/firebase'
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore'

declare global {
  interface Window {
    PaystackPop: any
  }
}

// Test key — swap to the live key when ready for real payments
const PAYSTACK_PUBLIC_KEY = 'pk_test_e265e29c4d68e7362d4b0e71e62209fa133c3c8e'

const CheckoutPage = () => {
  const { cart, totalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const [isPaying, setIsPaying] = useState(false)
  const [checkoutData, setCheckoutData] = useState<any>(null)
  const [paystackReady, setPaystackReady] = useState(
    () => typeof window !== 'undefined' && typeof window.PaystackPop !== 'undefined'
  )
  const [loadError, setLoadError] = useState('')

  // Snapshot passed from Basket (same-tab only, never leaves the device)
  useEffect(() => {
    const saved = sessionStorage.getItem('yumzee_checkout')
    if (saved) {
      try {
        setCheckoutData(JSON.parse(saved))
      } catch (err) {
        console.error('Failed to parse checkout data:', err)
      }
    }
  }, [])

  // Load Paystack directly (survives cached index.html + shows real status)
  useEffect(() => {
    if (typeof window.PaystackPop !== 'undefined') {
      setPaystackReady(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.async = true
    script.onload = () => {
      setTimeout(() => {
        if (typeof window.PaystackPop !== 'undefined') {
          setPaystackReady(true)
          setLoadError('')
        } else {
          setLoadError('Paystack loaded but did not start. Disable any ad-blocker for this site and refresh.')
        }
      }, 500)
    }
    script.onerror = () => {
      setLoadError('Paystack could not load. Check your connection or disable any ad-blocker, then refresh.')
    }
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  if (!checkoutData || cart.length === 0) {
    return (
      <div className="mx-auto min-h-screen max-w-md bg-[#FFF9E5] p-6 font-sans">
        <Metadata title="Checkout" />
        <p className="text-center text-[#6F6B76]">
          Nothing to checkout. Your basket is empty.
        </p>
        <button
          onClick={() => navigate(routes.home())}
          className="mt-4 w-full rounded-full bg-[#FFC107] py-3 text-sm font-black text-black"
        >
          Back to Home
        </button>
      </div>
    )
  }

  const {
    deliveryFee,
    total,
    address,
    latitude,
    longitude,
    houseNumber,
    junction,
  } = checkoutData

  const handlePay = () => {
    if (!user?.email) {
      alert('You must be logged in to pay.')
      return
    }

    if (typeof window.PaystackPop === 'undefined' || !paystackReady) {
      alert('Payment system is still loading. Wait a few seconds and try again.')
      return
    }

    setIsPaying(true)

    // Plain (non-async) callback — Paystack v1 rejects async functions here.
    // The async order-saving runs inside saveOrder().
    const saveOrder = async (reference: string) => {
      // Payment succeeded — now save the order
      try {
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
            customerName:
              user.displayName || user.email?.split('@')[0] || 'Customer',
            customerEmail: user.email || '',
            customerPhone: userPhone,
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
            groupActive: checkoutData.isGroupActive || false,
            groupCode: checkoutData.inviteCode || '',
            isCompleted: false,
            paid: true,
            paymentRef: reference,
            paymentMethod: 'Paystack',
            createdAt: serverTimestamp(),
            latitude: latitude,
            longitude: longitude,
            street: address?.street || '',
            houseNumber: houseNumber || address?.houseNumber || '',
            junction: junction || '',
            area: address?.area || '',
            city: address?.city || '',
            state: address?.state || '',
            fullAddress: address?.fullAddress || '',
          })

          await addDoc(collection(db, 'notifications'), {
            title: 'Payment Successful!',
            body: `Your order of ₦${total.toLocaleString()} has been paid. We'll get it to you soon!`,
            targetEmail: user.email || '',
            createdAt: serverTimestamp(),
          })

          clearCart()
          sessionStorage.removeItem('yumzee_checkout')
          navigate('/orders')
        } catch (error) {
          console.error('Error saving order:', error)
          alert(
            'Payment succeeded but we could not save your order. Please contact support.'
          )
        } finally {
          setIsPaying(false)
        }
    }

    const paymentCallback = (response: any) => {
      saveOrder(response.reference)
    }

    const closeHandler = () => {
      // Customer closed the popup without paying — order is NOT saved
      setIsPaying(false)
    }

    try {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: Math.round(total * 100), // Paystack charges in kobo
        currency: 'NGN',
        ref: `YZ-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        callback: paymentCallback,
        onClose: closeHandler,
      })

      handler.openIframe()
    } catch (error) {
      console.error('Paystack failed to start:', error)
      alert(
        'Payment could not start. Check your connection, disable any ad-blocker for this site, allow popups, then try again.'
      )
      setIsPaying(false)
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-[#FFF9E5] font-sans text-[#211F26] pb-32">
      <Metadata title="Checkout" />

      <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-[#E9E5EE] bg-white p-4">
        <button
          onClick={() => navigate(routes.basket())}
          className="rounded-full p-1 hover:bg-gray-100"
        >
          <ChevronLeft className="h-6 w-6 text-[#211F26]" />
        </button>
        <h1 className="text-lg font-bold">Checkout</h1>
      </div>

      <div className="space-y-4 p-4">
        {/* Order Summary */}
        <div className="rounded-2xl border border-[#E9E5EE] bg-white p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#6F6B76]">
            Order Summary
          </p>
          <div className="space-y-2">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-[#211F26]">
                  {item.quantity} x {item.name}
                </span>
                <span className="font-bold text-[#3E2679]">
                  ₦{(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address */}
        <div className="rounded-2xl border border-[#E9E5EE] bg-white p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#6F6B76]">
            Delivering To
          </p>
          <p className="text-sm font-bold text-[#211F26]">
            {address?.street}
            {(houseNumber || address?.houseNumber)
              ? `, ${houseNumber || address?.houseNumber}`
              : ''}
          </p>
          {junction && <p className="text-xs text-[#6F6B76]">near {junction}</p>}
          <p className="text-xs text-[#6F6B76]">
            {[address?.area, address?.city, address?.state]
              .filter(Boolean)
              .join(', ')}
          </p>
        </div>

        {/* Price Breakdown */}
        <div className="rounded-2xl border border-[#E9E5EE] bg-white p-4">
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-[#6F6B76]">Subtotal</span>
            <span className="font-bold">₦{totalPrice.toLocaleString()}</span>
          </div>
          <div className="mb-3 flex justify-between text-sm">
            <span className="text-[#6F6B76]">Delivery Fee</span>
            <span className="font-bold">₦{deliveryFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-t border-[#E9E5EE] pt-3">
            <span className="font-bold">Total</span>
            <span className="text-lg font-black text-[#3E2679]">
              ₦{total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Payment system status */}
        {loadError ? (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <p className="text-xs text-red-700">{loadError}</p>
          </div>
        ) : !paystackReady ? (
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
            <p className="text-xs text-amber-700">Loading payment system...</p>
          </div>
        ) : null}

        {/* Security Note */}
        <div className="flex items-center gap-2 rounded-xl bg-[#F5F1FB] p-3">
          <ShieldCheck className="h-4 w-4 shrink-0 text-[#3E2679]" />
          <p className="text-[11px] text-[#6F6B76]">
            Test mode — no real money moves. Payments are securely processed by
            Paystack.
          </p>
        </div>
      </div>

      {/* Pay Button */}
      <div className="fixed bottom-16 left-0 right-0 z-30 flex justify-center">
        <div className="w-full max-w-md bg-gradient-to-t from-[#FFF9E5] via-[#FFF9E5]/95 to-transparent px-4 pb-3 pt-6">
          <button
            onClick={handlePay}
            disabled={isPaying || !paystackReady}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#3E2679] py-5 text-base font-black text-white transition hover:bg-[#2A1A4E] active:scale-[0.98] disabled:opacity-50"
          >
            {isPaying ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Processing...
              </>
            ) : !paystackReady ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Loading...
              </>
            ) : (
              <>
                <Lock className="h-5 w-5" /> Pay ₦{total.toLocaleString()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
