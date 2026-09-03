import React, { useState, useMemo } from 'react'

import { Search, ShoppingBasket } from 'lucide-react'

import { Metadata } from '@redwoodjs/web'

import { INITIAL_PRODUCTS } from 'src/lib/orderStore'

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('All Items')

  const categories = [
    'All Items',
    'Pastries',
    'Savory Snacks',
    'Cakes & Desserts',
    'Drinks',
    'Healthy Bites',
  ]

  const filteredProducts = useMemo(() => {
    let results = INITIAL_PRODUCTS

    if (activeCategory !== 'All Items') {
      results = results.filter((p) => p.category === activeCategory)
    }

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase()
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sellerName.toLowerCase().includes(q)
      )
    }

    return results
  }, [searchTerm, activeCategory])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat)
    setSearchTerm('')
  }

  return (
    <div className="min-h-screen bg-[#FFF9E5]">
      <Metadata
        title="Yumzee — Search"
        description="Search for snacks"
      />

      {/* Top Search Bar - sticky */}
      <header
        className="sticky top-0 z-10 bg-white border-b border-[#E9E5EE] p-4"
      >
        <div className="mx-auto max-w-md">
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-[#6F6B76]" />
            <div className="flex-1 rounded-full bg-[#F5F5F5] px-4 py-3 flex items-center">
              <input
                type="text"
                placeholder="Search for snacks..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="bg-transparent outline-none w-full text-sm text-[#211F26]"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-md px-4 pt-0">
        {/* Search Title */}
        <div className="mb-4 text-xl font-bold text-[#211F26]">
          Search Results
        </div>

        {/* Category Chips */}
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

        {/* Results List */}
        <section>
          {filteredProducts.length === 0 ? (
            <div className="center-text py-12 text-[#6F6B76]">
              <svg
                className="h-6 w-6 mx-auto mb-2 opacity-50"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17 3a5 5 0 0 0-10 0 5 5 0 0 0 10 0z" />
                <path d="M9 18v1c4 0 5-1 5-2v1H9v-1c-4 0-5 1-5 2v1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2z" />
              </svg>
              <p>No snacks found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((product) => {
                return (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm mb-3"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-20 w-20 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-[#211F26]">
                        {product.name}
                      </h3>
                      <p className="text-xs text-[#6F6B76]">
                        {product.sellerName}
                      </p>
                      <p className="text-sm font-bold text-[#3E2679] mt-1">
                        ₦{product.price.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <button
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFC107] text-black hover:bg-[#e5b420]"
                      >
                        <ShoppingBasket className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default SearchPage