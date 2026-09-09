import React, { useState, useEffect, useMemo } from 'react'
import { Link, routes } from '@redwoodjs/router'
import { Search } from 'lucide-react'
import { Metadata } from '@redwoodjs/web'
import { collection, onSnapshot } from 'firebase/firestore'
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

const SearchPage = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('All Items')
  const [loading, setLoading] = useState(true)

  const categories = [
    'All Items',
    'Pastries',
    'Savory Snacks',
    'Cakes & Desserts',
    'Drinks',
    'Healthy Bites',
  ]

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

  const filteredProducts = useMemo(() => {
    let results = products
    if (activeCategory !== 'All Items') {
      results = results.filter((p) => (p.category || '').trim().toLowerCase() === activeCategory.toLowerCase())
    }
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase()
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q)
      )
    }
    return results
  }, [searchTerm, activeCategory, products])

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat)
    setSearchTerm('')
  }

  return (
    <div className="min-h-screen bg-[#FFF9E5]">
      <Metadata title="Yumzee — Search" description="Search for snacks" />

      <header className="sticky top-0 z-10 bg-white border-b border-[#E9E5EE] p-4">
        <div className="mx-auto max-w-md">
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-[#6F6B76]" />
            <div className="flex-1 rounded-full bg-[#F5F5F5] px-4 py-3 flex items-center">
              <input
                type="text"
                placeholder="Search for snacks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent outline-none w-full text-sm text-[#211F26]"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pt-0">
        <div className="mb-4 text-xl font-bold text-[#211F26]">Search Results</div>

        <div className="mb-4 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-[#3E2679] text-white'
                  : 'bg-white text-[#6F6B76] border border-[#E9E5EE]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <section>
          {loading ? (
            <p className="py-12 text-center text-[#6F6B76]">Loading snacks...</p>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-[#6F6B76]">
              <p>No snacks found</p>
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={routes.productDetail({ id: product.id })}
                  className="flex items-center gap-3 rounded-2xl bg-white p-2"
                >
                  {/* Yellow Background Image, Bigger */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-28 w-28 rounded-lg object-cover bg-[#FFC107]"
                  />
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-[#211F26]">{product.name}</h3>
                    <p className="mt-1 text-xs text-[#6F6B76] line-clamp-2">{product.description}</p>
                    <p className="mt-2 text-base font-bold text-[#3E2679]">
                      ₦{product.price.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default SearchPage
