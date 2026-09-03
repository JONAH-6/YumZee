import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface CartItem {
  id: number
  name: string
  price: number
  image: string
  category: string
  quantity: number
  brandPackage: boolean
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (product: { id: number; name: string; price: number; image?: string; category?: string }, quantity?: number, brandPackage?: boolean) => void
  removeFromCart: (id: number) => void
  updateQuantity: (id: number, delta: number) => void
  toggleBrandPackage: (id: number) => void
  clearCart: () => void
  totalPrice: number
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([])

  const addToCart = (product, quantity = 1, brandPackage = false) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity, brandPackage: item.brandPackage || brandPackage } : item
        )
      } else {
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image || '/placeholder.jpg',
            category: product.category || 'Snack',
            quantity: Math.max(1, quantity),
            brandPackage,
          },
        ]
      }
    })
  }

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const toggleBrandPackage = (id: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, brandPackage: !item.brandPackage } : item
      )
    )
  }

  const totalPrice = cart.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity
    const packageTotal = item.brandPackage ? 100 : 0
    return sum + itemTotal + packageTotal
  }, 0)
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, toggleBrandPackage, clearCart, totalPrice, itemCount }}>
      {children}
    </CartContext.Provider>
  )
}
