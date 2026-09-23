import React, { useState, useEffect } from 'react'
import { Link, navigate, routes } from '@redwoodjs/router'
import { useCart } from 'src/components/CartContext/CartContext'
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore'
import { db } from 'src/lib/firebase'
import { ChevronLeft, Plus } from 'lucide-react'

const ProductDetailPage = ({ id }) => {
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [drinks, setDrinks] = useState([])
  const [loading, setLoading] = useState(true)

  const [quantity, setQuantity] = useState(1)
  const [bag, setBag] = useState(false)
  const [extraWater, setExtraWater] = useState(false)

  useEffect(() => {
    const getProduct = async () => {
      try {
        const docRef = doc(db, 'products', id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() })
        }
      } catch (error) {
        console.error('Error fetching product:', error)
      } finally {
        setLoading(false)
      }
    }
    getProduct()

    const unsubDrinks = onSnapshot(collection(db, 'products'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setDrinks(data.filter((p) => p.category === 'Drinks'))
    })
    return () => unsubDrinks()
  }, [id])

  if (loading)
    return (
      <div className="mx-auto min-h-screen max-w-md bg-[#FFF9E5] p-4 font-sans">
        <div className="anim-shimmer h-96 w-full rounded-2xl" />
        <div className="mt-4 space-y-2">
          <div className="anim-shimmer h-6 w-2/3 rounded" />
          <div className="anim-shimmer h-4 w-full rounded" />
          <div className="anim-shimmer h-12 w-full rounded-xl" />
        </div>
      </div>
    )
  if (!product) return <div className="p-10 text-center text-[#6F6B76]">Product not found.</div>

  const basePrice = product.price
  const bagPrice = bag ? 100 : 0
  const waterPrice = extraWater ? 200 : 0
  const totalPrice = (basePrice + bagPrice + waterPrice) * quantity

  const handleAddToCart = () => {
    addToCart({ id: product.code, name: product.name, price: basePrice, image: product.image }, quantity)
    if (extraWater) {
      const water = drinks.find((d) => d.name.includes('Water'))
      if (water) addToCart({ id: water.code, name: water.name, price: water.price, image: water.image }, 1)
    }
    navigate(routes.basket())
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-[#FFF9E5] font-sans text-[#211F26] pb-40">
      {/* Top Image with Back Button - YELLOW BACKGROUND */}
      <div className="anim-pop-in relative">
        <Link to={routes.home()} className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70 active:scale-90">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <img
          src={product.image || 'https://via.placeholder.com/400x300'}
          alt={product.name}
          className="h-96 w-full object-contain bg-[#FFC107]"
        />
      </div>

      {/* Title and Price */}
      <div className="anim-fade-up bg-white p-4" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#211F26]">{product.name}</h1>
          <p className="text-xl font-bold text-[#3E2679]">₦{basePrice.toLocaleString()}</p>
        </div>
        <p className="mt-2 text-sm text-[#6F6B76]">{product.description || 'Great snack!'}</p>
      </div>

      {/* Customize Section */}
      <div className="anim-fade-up bg-[#FFF9E5] p-4" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-lg font-bold text-[#211F26]">Customize Your {product.name}</h2>
        <p className="mt-2 text-xs font-bold uppercase tracking-wide text-[#6F6B76]">Packaging</p>

        <div className="mt-3 rounded-xl border border-[#E9E5EE] bg-white p-4">
          <label className="flex cursor-pointer items-center justify-between">
            <span className="text-sm font-medium">Pack in Branded Nylon Bag</span>
            <span className="text-xs font-bold text-[#3E2679]">+₦100</span>
            <input type="checkbox" checked={bag} onChange={(e) => setBag(e.target.checked)} className="h-5 w-5 accent-[#3E2679]" />
          </label>
          <label className="mt-4 flex cursor-pointer items-center justify-between border-t border-[#E9E5EE] pt-4">
            <span className="text-sm font-medium">Extra Bottled Water</span>
            <span className="text-xs font-bold text-[#3E2679]">+₦200</span>
            <input type="checkbox" checked={extraWater} onChange={(e) => setExtraWater(e.target.checked)} className="h-5 w-5 accent-[#3E2679]" />
          </label>
        </div>
      </div>

      {/* Quantity */}
      <div className="anim-fade-up bg-white p-4" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Quantity</h3>
          <div className="flex items-center gap-4">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F1FB] text-xl font-bold transition active:scale-90">−</button>
            <span key={quantity} className="anim-pop-in inline-block min-w-[2ch] text-center text-xl font-bold">{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFC107] text-xl font-bold transition active:scale-90">+</button>
          </div>
        </div>
      </div>

      {/* Add a Drink Section (Only shows if drinks exist in DB) */}
      {drinks.length > 0 && (
        <div className="anim-fade-up mt-4 border-t border-[#E9E5EE] bg-white p-4" style={{ animationDelay: '0.4s' }}>
          <h3 className="mb-4 text-lg font-bold text-[#211F26]">Add a Drink</h3>
          <div className="space-y-3">
            {drinks.map((drink, index) => (
              <div
                key={drink.id}
                className="anim-fade-up flex items-center gap-3 rounded-xl border border-[#E9E5EE] p-2 transition-all duration-200 hover:-translate-y-0.5"
                style={{ animationDelay: `${Math.min(index * 60, 300)}ms` }}
              >
                <img src={drink.image} alt={drink.name} className="h-12 w-12 rounded-lg object-cover bg-[#FFC107]" />
                <div className="flex-1">
                  <p className="text-sm font-bold">{drink.name}</p>
                  <p className="text-xs text-[#3E2679]">₦{drink.price.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => addToCart({ id: drink.code, name: drink.name, price: drink.price, image: drink.image }, 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFC107] text-black transition hover:bg-[#e6ad00] active:scale-90"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fixed Add to Cart bar — sits above the bottom nav, never scrolls away */}
      <div className="fixed bottom-16 left-0 right-0 z-30 flex justify-center">
        <div className="anim-fade-up w-full max-w-md bg-gradient-to-t from-[#FFF9E5] via-[#FFF9E5]/95 to-transparent px-4 pb-3 pt-6" style={{ animationDelay: '0.5s' }}>
          <button onClick={handleAddToCart} className="w-full rounded-full bg-[#FFC107] py-4 text-lg font-black text-[#211F26] transition hover:bg-[#e6ad00] active:scale-[0.98]">
            Add to Cart — ₦{totalPrice.toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage
