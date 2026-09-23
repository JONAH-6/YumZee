// web/src/pages/HomePage/HomePage.tsx
import React, { useState, useEffect } from 'react'
import { Link, routes, navigate } from '@redwoodjs/router'
import { ShoppingBasket, UserCheck, X } from 'lucide-react'
import { useCart } from 'src/components/CartContext/CartContext'
import { useAuth } from 'src/contexts/AuthContexts'
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore'
import { db } from 'src/lib/firebase'

interface Product {
  id: string
  code: number
  name: string
  price: number
  image: string
  category: string
  description: string
}

const HomePage = () => {
  const { addToCart } = useCart()
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All Items')
  const [loading, setLoading] = useState(true)
  const [showProfilePrompt, setShowProfilePrompt] = useState(false)

  // 🔥 NEW: Check if the user has completed their profile
  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (!user) return
      try {
        const docRef = doc(db, 'profiles', user.uid)
        const docSnap = await getDoc(docRef)

        if (!docSnap.exists()) {
          // Brand new user - no profile document at all
          setShowProfilePrompt(true)
        } else {
          const data = docSnap.data()
          // If the key delivery fields are missing, they haven't finished
          if (!data.phone || !data.hostel || !data.campus) {
            setShowProfilePrompt(true)
          }
        }
      } catch (error) {
        console.error('Error checking profile:', error)
      }
    }
    checkProfileCompletion()
  }, [user])

  // Fetch products from Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[]
      data.sort((a, b) => a.code - b.code)
      setProducts(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const categories = [
    'All Items',
    'Pastries',
    'Savory Snacks',
    'Cakes & Desserts',
    'Drinks',
    'Healthy Bites',
  ]

  const filteredProducts =
    selectedCategory === 'All Items'
      ? products
      : products.filter((p) => (p.category || '').trim().toLowerCase() === selectedCategory.toLowerCase())

  const handleGoToProfile = () => {
    setShowProfilePrompt(false)
    navigate(routes.profile())
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#FFF3CF] via-[#FFF9E5] to-[#FDEBC8] p-4">
      {/* Soft ambient wash so the glass has something to blur */}
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-[#FFC107]/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 rounded-full bg-[#3E2679]/10 blur-3xl" />
      <div className="relative">
      <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-2 mb-4 border-b border-[#E9E5EE]">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`relative whitespace-nowrap pb-2 text-sm font-bold transition-all duration-200 active:scale-95 ${
              selectedCategory === cat
                ? 'text-[#3E2679] border-b-2 border-[#3E2679] scale-105'
                : 'text-[#6F6B76] border-b-2 border-transparent hover:text-[#3E2679]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <h2 className="anim-fade-up mb-4 text-lg font-bold text-[#211F26]">Popular Near You</h2>

      {loading ? (
        <div className="flex flex-col space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/60 p-2 backdrop-blur-md">
              <div className="anim-shimmer h-28 w-28 rounded-lg" />
              <div className="flex-1 space-y-2 py-2">
                <div className="anim-shimmer h-4 w-2/3 rounded" />
                <div className="anim-shimmer h-3 w-full rounded" />
                <div className="anim-shimmer h-4 w-1/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col space-y-2">
          {filteredProducts.length === 0 ? (
            <div className="border border-white/70 bg-white/60 p-6 text-center backdrop-blur-md">
              <p className="text-sm text-[#6F6B76]">No snacks available yet.</p>
            </div>
          ) : (
            filteredProducts.map((product, index) => (
              <Link
                key={product.id}
                to={routes.productDetail({ id: product.id })}
                className="anim-fade-up group flex items-center gap-3 rounded-2xl border border-white/70 bg-white/60 p-2 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/80 active:scale-[0.99]"
                style={{ animationDelay: `${Math.min(index * 70, 560)}ms` }}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-28 w-28 rounded-lg object-cover bg-[#FFC107] transition-transform duration-300 group-hover:scale-105"
                />
                <div className="flex-1">
                  <h3 className="text-base font-bold text-[#211F26]">{product.name}</h3>
                  <p className="mt-1 text-xs text-[#6F6B76] line-clamp-2">{product.description}</p>
                  <p className="mt-2 text-base font-bold text-[#3E2679]">
                    ₦{product.price.toLocaleString()}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

           {/* 🔥 NEW USER PROFILE PROMPT POPUP */}
      {showProfilePrompt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="anim-pop-in relative w-full max-w-xs rounded-2xl bg-white p-5 text-center">
            <button
              onClick={() => setShowProfilePrompt(false)}
              className="absolute right-3 top-3 rounded-full p-1 text-gray-400 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>

            {/* NEW: Material Symbol 'check' icon */}
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFC107]">
              <span className="material-symbols-outlined text-[#3E2679]" style={{ fontSize: '26px' }}>
                check
              </span>
            </div>

            <h2 className="text-base font-black text-[#211F26]">Welcome to YumZee</h2>
            <p className="mt-1 text-xs text-[#6F6B76]">
              Add your delivery details to start ordering.
            </p>

            <button
              onClick={handleGoToProfile}
              className="mt-4 w-full rounded-full bg-[#FFC107] py-2.5 text-sm font-black text-black"
            >
              Complete Profile
            </button>
            <button
              onClick={() => setShowProfilePrompt(false)}
              className="mt-2 w-full text-xs font-bold text-[#6F6B76] hover:text-[#3E2679]"
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default HomePage
