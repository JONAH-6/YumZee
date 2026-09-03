// web/src/pages/HomePage/HomePage.tsx
import React, { useState } from 'react'
import { Link, routes } from '@redwoodjs/router'
import { ShoppingBasket } from 'lucide-react'
import { INITIAL_PRODUCTS } from 'src/lib/orderStore'
import { useCart } from 'src/components/CartContext/CartContext'

const HomePage = () => {
  const { addToCart } = useCart()
  const [selectedCategory, setSelectedCategory] = useState('All Items')

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
      ? INITIAL_PRODUCTS
      : INITIAL_PRODUCTS.filter((p) => p.category === selectedCategory)

  return (
    <div className="bg-[#FFF9E5] p-4">
      {/* Simple Horizontal Row - No Borders, No Scrollbar, Moving Underline */}
      <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-2 mb-4 border-b border-[#E9E5EE]">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`relative whitespace-nowrap pb-2 text-sm font-bold transition-all ${
              selectedCategory === cat
                ? 'text-[#3E2679] border-b-2 border-[#3E2679]'
                : 'text-[#6F6B76] border-b-2 border-transparent'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <h2 className="mb-4 text-lg font-bold text-[#211F26]">Popular Near You</h2>

      {/* Vertical Product List */}
      <div className="flex flex-col space-y-4">
        {filteredProducts.map((product) => (
          <Link
            key={product.id}
            to={routes.productDetail({ id: product.id })}
            className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm"
          >
            <img
              src={product.image}
              alt={product.name}
              className="h-20 w-20 rounded-xl object-cover"
            />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-[#211F26]">{product.name}</h3>
              <p className="text-xs text-[#6F6B76]">{product.sellerName || 'Campus Bites'}</p>
              <p className="mt-1 text-sm font-bold text-[#3E2679]">
                ₦{product.price.toLocaleString()}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault()
                addToCart(product)
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFC107] text-black hover:bg-[#e5b420]"
            >
              <ShoppingBasket className="h-5 w-5" />
            </button>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default HomePage
