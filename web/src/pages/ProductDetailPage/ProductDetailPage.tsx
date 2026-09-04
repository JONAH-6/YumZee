import React, { useState } from 'react'

import { ArrowLeft, Check, Plus } from 'lucide-react'

import { useParams, navigate } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

import { useCart } from 'src/components/CartContext/CartContext'
import { INITIAL_PRODUCTS } from 'src/lib/orderStore'

const ProductDetailPage = () => {
  const { id } = useParams()
  const { addToCart } = useCart()
  const product = INITIAL_PRODUCTS.find((p) => p.id === Number(id))

  const [quantity, setQuantity] = useState(1)
  const [brandPackage, setBrandPackage] = useState(false)
  const [extraWater, setExtraWater] = useState(false)

  const drinks = INITIAL_PRODUCTS.filter((p) => p.category === 'Drinks')

  if (!product) return null

  const packagePrice = 100
  const waterPrice = 200
  const itemTotal = product.price * quantity
  const packageTotal = brandPackage ? packagePrice : 0
  const waterTotal = extraWater ? waterPrice : 0
  const totalPrice = itemTotal + packageTotal + waterTotal

  const handleAddToCart = () => {
    addToCart(product, quantity, brandPackage)
    if (extraWater) {
      const water = INITIAL_PRODUCTS.find((p) => p.name === 'Chapman Drink (500ml)')
      if (water) addToCart(water, 1)
    }
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#FFF9E5]">
      <Metadata
        title={`Yumzee — ${product.name}`}
        description={`Product detail for ${product.name}`}
      />

      {/* Top Image */}
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="h-64 w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <button
          onClick={() => navigate('/')}
          className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      {/* White Background Content */}
      <div className="bg-white">
        <div className="mx-auto max-w-md px-4 py-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#211F26]">
              {product.name}
            </h1>
            <span className="text-xl font-bold text-[#3E2679]">
              ₦{product.price.toLocaleString()}
            </span>
          </div>

          {/* Description */}
          <p className="mt-3 text-sm leading-relaxed text-[#6F6B76]">
            Double sausage, seasoned shredded chicken, cabbage and rich
            signature mayonnaise garlic sauce rolled inside a masterfully
            grilled Lebanese flatbread wrap.
          </p>
        </div>
      </div>

      {/* Customize Section (Cream Background #FFF9E5) */}
      <div className="bg-[#FFF9E5]">
        <div className="mx-auto max-w-md px-4 py-6">
          <h2 className="text-lg font-bold text-[#211F26]">
            Customize Your {product.name.split(' (')[0]}
          </h2>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#6F6B76]">
            PACKAGING
          </p>

          <div className="mt-4">
            {/* Brand Package Option */}
            <button
              onClick={() => setBrandPackage(!brandPackage)}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${
                brandPackage
                  ? 'border-[#3E2679] bg-[#3E2679]'
                  : 'border-[#E9E5EE] bg-white'
              }`}
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded ${
                  brandPackage
                    ? 'bg-[#3E2679]'
                    : 'border border-gray-300 bg-white'
                }`}
              >
                {brandPackage && <Check className="h-4 w-4 text-white" />}
              </div>
              <span
                className={`flex-1 text-sm font-medium ${brandPackage ? 'text-white' : 'text-[#211F26]'}`}
              >
                Pack in Branded Lylon Bag
              </span>
              <span
                className={`text-sm font-bold ${brandPackage ? 'text-white' : 'text-[#3E2679]'}`}
              >
                +₦{packagePrice.toLocaleString()}
              </span>
            </button>
            <p className="mt-2 text-xs text-[#6F6B76]">
              Your order will be packed in a branded nylon bag — market style!
            </p>

            {/* Extra Water Option */}
            <button
              onClick={() => setExtraWater(!extraWater)}
              className={`mt-3 flex w-full items-center gap-3 rounded-xl border p-3 text-left ${
                extraWater
                  ? 'border-[#3E2679] bg-[#3E2679]'
                  : 'border-[#E9E5EE] bg-white'
              }`}
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded ${
                  extraWater
                    ? 'bg-[#3E2679]'
                    : 'border border-gray-300 bg-white'
                }`}
              >
                {extraWater && <Check className="h-4 w-4 text-white" />}
              </div>
              <span
                className={`flex-1 text-sm font-medium ${extraWater ? 'text-white' : 'text-[#211F26]'}`}
              >
                Extra Bottled Water
              </span>
              <span
                className={`text-sm font-bold ${extraWater ? 'text-white' : 'text-[#3E2679]'}`}
              >
                +₦{waterPrice.toLocaleString()}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Quantity Section (White Background) */}
      <div className="bg-white">
        <div className="mx-auto max-w-md px-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#211F26]">Quantity</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF3D6] text-[#211F26]"
              >
                −
              </button>
              <span className="w-8 text-center text-base font-bold text-[#211F26]">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((prev) => prev + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFC107] text-[#211F26]"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-24" />

      {/* Add a Drink Section */}
      <div className="border-t border-[#E9E5EE] bg-white p-4">
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

      {/* Sticky Bottom Action Button */}
      <div className="sticky bottom-0 left-0 right-0 bg-[#FFF9E5] py-4">
        <div className="mx-auto max-w-md px-4">
          <button
            onClick={handleAddToCart}
            className="w-full rounded-[9999px] bg-[#FFC107] py-4 text-lg font-bold text-[#211F26] shadow-lg"
          >
            Add to Cart — ₦{totalPrice.toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage
