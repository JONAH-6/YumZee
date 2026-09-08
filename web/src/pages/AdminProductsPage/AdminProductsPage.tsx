import { navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'
import { db } from 'src/lib/firebase'
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { ArrowLeft, Package, Plus, Loader2, CheckCircle2 } from 'lucide-react'

const AdminProductsPage = () => {
  const [products, setProducts] = useState<any[]>([])
  const [newProduct, setNewProduct] = useState({ name: '', price: '', image: '', code: '', description: '', category: 'Pastries' }) // Default to Pastries
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [productSuccess, setProductSuccess] = useState(false)

  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setProducts(data.sort((a, b) => a.code - b.code))
    })
    return () => unsubProducts()
  }, [])

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProduct.name || !newProduct.price || !newProduct.code) return
    setIsAddingProduct(true)
    try {
      await addDoc(collection(db, 'products'), { ...newProduct, price: Number(newProduct.price), code: Number(newProduct.code), createdAt: serverTimestamp() })
      setNewProduct({ name: '', price: '', image: '', code: '', description: '', category: 'Pastries' })
      setProductSuccess(true)
      setTimeout(() => setProductSuccess(false), 3000)
    } catch (error) {
      console.error('Error adding product:', error)
    } finally {
      setIsAddingProduct(false)
    }
  }

  return (
    <div className="min-h-screen bg-red-50">
      <Metadata title="Admin Products" />
      <header className="bg-red-600 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(routes.admin())} className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-bold hover:bg-white/30">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <h1 className="text-2xl font-black">Products</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl bg-white p-6 border border-red-100">
            <h2 className="mb-4 text-xl font-black text-red-600">All Products</h2>
            {products.length === 0 ? (
              <p className="py-8 text-center text-gray-400">No products uploaded yet...</p>
            ) : (
              <div className="space-y-3">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center gap-4 rounded-xl border border-red-100 p-3">
                    {product.image && (
                      <img src={product.image} alt={product.name} className="h-16 w-16 rounded-lg object-cover" />
                    )}
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">#{product.code} {product.name}</p>
                      <p className="text-xs text-gray-500">{product.category}</p>
                      <p className="text-sm font-black text-red-600">₦{product.price?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-red-600 p-6 text-white">
            <h2 className="mb-4 text-xl font-black">Upload New Product</h2>
            {productSuccess && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-white p-3 text-red-600">
                <CheckCircle2 className="h-5 w-5" /> Product Added Successfully!
              </div>
            )}
            <form onSubmit={handleAddProduct} className="space-y-4">
              <input type="text" placeholder="Product Name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} required className="w-full rounded-lg border border-red-300 bg-white px-4 py-2 text-sm text-gray-800 placeholder-red-300" />
              <input type="number" placeholder="Product Number (e.g., 16)" value={newProduct.code} onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })} required className="w-full rounded-lg border border-red-300 bg-white px-4 py-2 text-sm text-gray-800 placeholder-red-300" />
              <input type="number" placeholder="Price (₦)" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} required className="w-full rounded-lg border border-red-300 bg-white px-4 py-2 text-sm text-gray-800 placeholder-red-300" />
              <input type="text" placeholder="IMGUR Image Link" value={newProduct.image} onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })} className="w-full rounded-lg border border-red-300 bg-white px-4 py-2 text-sm text-gray-800 placeholder-red-300" />

              {/* 🔥 THE NEW DROPDOWN FOR CATEGORY */}
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                className="w-full rounded-lg border border-red-300 bg-white px-4 py-2 text-sm text-gray-800"
                required
              >
                <option value="Pastries">Pastries</option>
                <option value="Savory Snacks">Savory Snacks</option>
                <option value="Cakes & Desserts">Cakes & Desserts</option>
                <option value="Drinks">Drinks</option>
                <option value="Healthy Bites">Healthy Bites</option>
              </select>

              <textarea placeholder="Full Description" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} rows={3} className="w-full rounded-lg border border-red-300 bg-white px-4 py-2 text-sm text-gray-800 placeholder-red-300" />
              <button type="submit" disabled={isAddingProduct} className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-3 text-sm font-black text-red-600 hover:bg-red-100 transition disabled:opacity-50">
                {isAddingProduct ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                {isAddingProduct ? 'Uploading...' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminProductsPage