import React, { useState } from 'react'
import { Link, navigate, routes } from '@redwoodjs/router'
import { useCart } from 'src/components/CartContext/CartContext'
import { INITIAL_PRODUCTS } from 'src/lib/orderStore'
import { ChevronLeft, Plus } from 'lucide-react'

const ProductDetailPage = ({ id }) => {
  const product = INITIAL_PRODUCTS.find((p) => p.id === Number(id))
  const { addToCart } = useCart()

  const [quantity, setQuantity] = useState(1)
  const [bag, setBag] = useState(false)
  const [extraWater, setExtraWater] = useState(false)

  const drinks = INITIAL_PRODUCTS.filter((p) => p.category === 'Drinks')

  if (!product) return <p>Product not found</p>

  const basePrice = product.price
  const bagPrice = bag ? 100 : 0
  const waterPrice = extraWater ? 200 : 0
  const totalPrice = (basePrice + bagPrice + waterPrice) * quantity

  const handleAddToCart = () => {
    addToCart(product, quantity)
    if (extraWater) {
      const water = INITIAL_PRODUCTS.find((p) => p.name === 'Chapman Drink (500ml)')
      if (water) addToCart(water, 1)
    }
    navigate(routes.basket())
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-[#FFF9E5] font-sans text-[#211F26]">
      {/* Back Button */}
      <div className="sticky top-0 z-10 bg-white p-4">
        <Link to={routes.home()} className="rounded-full p-1 hover:bg-gray-100">
          <ChevronLeft className="h-6 w-6 text-[#211F26]" />
        </Link>
      </div>

      {/* Product Image */}
      <img src={product.image} alt={product.name} className="h-64 w-full object-cover" />

      {/* Product Header */}
      <div className="p-4">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="mt-2 text-[#6F6B76]">{product.description || 'Great snack!'}</p>
      </div>

      {/* Customize Section */}
      <div className="bg-[#FFF9E5] p-4">
        <h2 className="text-lg font-bold">Customize Your {product.name}</h2>
        <p className="mt-2 text-xs font-bold uppercase tracking-wide text-[#6F6B76]">Packaging</p>

        {/* Checkboxes */}
        <div className="mt-3 rounded-xl border border-[#E9E5EE] bg-white p-4">
          <label className="flex cursor-pointer items-center justify-between">
            <span className="text-sm font-medium">Pack in Branded Nylon Bag</span>
            <span className="text-xs font-bold text-[#3E2679]">+₦100</span>
            <input type="checkbox" checked={bag} onChange={(e) => setBag(e.target.checked)} className="h-5 w-5 accent-[#3E2679]" />
          </label>
          {/* Extra Water */}
          <label className="mt-4 flex cursor-pointer items-center justify-between border-t border-[#E9E5EE] pt-4">
            <span className="text-sm font-medium">Extra Bottled Water</span>
            <span className="text-xs font-bold text-[#3E2679]">+₦200</span>
            <input type="checkbox" checked={extraWater} onChange={(e) => setExtraWater(e.target.checked)} className="h-5 w-5 accent-[#3E2679]" />
          </label>
        </div>

        {/* Quantity */}
        <div className="mt-6 flex items-center justify-between">
          <h3 className="text-lg font-bold">Quantity</h3>
          <div className="flex items-center gap-4">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF9E5] text-xl font-bold">−</button>
            <span className="text-xl font-bold">{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFC107] text-xl font-bold">+</button>
          </div>
        </div>
      </div>

      {/* Add to Cart Button */}
      <div className="p-4">
        <button onClick={handleAddToCart} className="w-full rounded-full bg-[#FFC107] py-4 text-lg font-black text-[#211F26] shadow-lg">
          Add to Cart — ₦{totalPrice.toLocaleString()}
        </button>
      </div>

      {/* Drink Mini-Cart at the Bottom */}
      <div className="mt-4 border-t border-[#E9E5EE] bg-white p-4">
        <h3 className="mb-4 text-lg font-bold text-[#211F26]">Add a Drink</h3>
        <div className="space-y-3">
          {drinks.map((drink) => (
            <div key={drink.id} className="flex items-center gap-3 rounded-xl border border-[#E9E5EE] p-2">
              <img src={drink.image} alt={drink.name} className="h-12 w-12 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="text-sm font-bold">{drink.name}</p>
                <p className="text-xs text-[#3E2679]">₦{drink.price.toLocaleString()}</p>
              </div>
              <button
                onClick={() => addToCart(drink, 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFC107] text-black"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage
