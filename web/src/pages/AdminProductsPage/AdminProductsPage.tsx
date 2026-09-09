import { navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'
import { db } from 'src/lib/firebase'
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { ArrowLeft, Package, Plus, Loader2, CheckCircle2, MoreVertical, Pencil, Trash2 } from 'lucide-react'

const AdminProductsPage = () => {
  const [products, setProducts] = useState<any[]>([])
  const [newProduct, setNewProduct] = useState({ name: '', price: '', image: '', code: '', description: '', category: 'Pastries' })
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [productSuccess, setProductSuccess] = useState(false)

  // State for Editing and Menu
  const [editingId, setEditingId] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setProducts(data.sort((a, b) => a.code - b.code))
    })
    return () => unsubProducts()
  }, [])

  // Fill form when clicking Edit
  const handleEditClick = (product: any) => {
    setEditingId(product.id)
    setNewProduct({
      name: product.name || '',
      price: String(product.price || ''),
      image: product.image || '',
      code: String(product.code || ''),
      description: product.description || '',
      category: product.category || 'Pastries',
    })
    setOpenMenuId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' }) // Scroll to form
  }

  // Delete Product
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      await deleteDoc(doc(db, 'products', id))
      setOpenMenuId(null)
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  // Add OR Update Product
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProduct.name || !newProduct.price || !newProduct.code) return
    setIsAddingProduct(true)

    try {
      if (editingId) {
        // UPDATE existing product
        await updateDoc(doc(db, 'products', editingId), {
          ...newProduct,
          price: Number(newProduct.price),
          code: Number(newProduct.code),
        })
        setEditingId(null) // Stop editing
      } else {
        // ADD new product
        await addDoc(collection(db, 'products'), {
          ...newProduct,
          price: Number(newProduct.price),
          code: Number(newProduct.code),
          createdAt: serverTimestamp(),
        })
      }

      // Reset form
      setNewProduct({ name: '', price: '', image: '', code: '', description: '', category: 'Pastries' })
      setProductSuccess(true)
      setTimeout(() => setProductSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving product:', error)
    } finally {
      setIsAddingProduct(false)
    }
  }

  // Cancel Editing
  const handleCancelEdit = () => {
    setEditingId(null)
    setNewProduct({ name: '', price: '', image: '', code: '', description: '', category: 'Pastries' })
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
          {/* Product List */}
          <div className="lg:col-span-2 rounded-2xl bg-white p-6 border border-red-100">
            <h2 className="mb-4 text-xl font-black text-red-600">All Products</h2>
            {products.length === 0 ? (
              <p className="py-8 text-center text-gray-400">No products uploaded yet...</p>
            ) : (
              <div className="space-y-3">
                {products.map((product) => (
                  <div key={product.id} className="relative flex items-center gap-4 rounded-xl border border-red-100 p-3">
                    {product.image && (
                      <img src={product.image} alt={product.name} className="h-16 w-16 rounded-lg object-cover" />
                    )}
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">#{product.code} {product.name}</p>
                      <p className="text-xs text-gray-500">{product.category}</p>
                      <p className="text-sm font-black text-red-600">₦{product.price?.toLocaleString()}</p>
                    </div>

                    {/* 3 Dots Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
                        className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>

                      {openMenuId === product.id && (
                        <div className="absolute right-0 top-10 z-10 w-32 rounded-lg border border-red-200 bg-white p-1">
                          <button
                            onClick={() => handleEditClick(product)}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-bold text-gray-700 hover:bg-red-50"
                          >
                            <Pencil className="h-4 w-4 text-red-600" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form (Add or Edit) */}
          <div className="rounded-2xl bg-red-600 p-6 text-white">
            <h2 className="mb-4 text-xl font-black">
              {editingId ? 'Edit Product' : 'Upload New Product'}
            </h2>
            {productSuccess && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-white p-3 text-red-600">
                <CheckCircle2 className="h-5 w-5" /> Success!
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Product Name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} required className="w-full rounded-lg border border-red-300 bg-white px-4 py-2 text-sm text-gray-800 placeholder-red-300" />
              <input type="number" placeholder="Product Number" value={newProduct.code} onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })} required className="w-full rounded-lg border border-red-300 bg-white px-4 py-2 text-sm text-gray-800 placeholder-red-300" />
              <input type="number" placeholder="Price (₦)" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} required className="w-full rounded-lg border border-red-300 bg-white px-4 py-2 text-sm text-gray-800 placeholder-red-300" />
              <input type="text" placeholder="IMGUR Image Link" value={newProduct.image} onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })} className="w-full rounded-lg border border-red-300 bg-white px-4 py-2 text-sm text-gray-800 placeholder-red-300" />

              <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full rounded-lg border border-red-300 bg-white px-4 py-2 text-sm text-gray-800" required>
                <option value="Pastries">Pastries</option>
                <option value="Savory Snacks">Savory Snacks</option>
                <option value="Cakes & Desserts">Cakes & Desserts</option>
                <option value="Drinks">Drinks</option>
                <option value="Healthy Bites">Healthy Bites</option>
              </select>

              <textarea placeholder="Full Description" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} rows={3} className="w-full rounded-lg border border-red-300 bg-white px-4 py-2 text-sm text-gray-800 placeholder-red-300" />

              <button type="submit" disabled={isAddingProduct} className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-3 text-sm font-black text-red-600 hover:bg-red-100 transition disabled:opacity-50">
                {isAddingProduct ? <Loader2 className="h-5 w-5 animate-spin" /> : editingId ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {isAddingProduct ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
              </button>

              {editingId && (
                <button type="button" onClick={handleCancelEdit} className="w-full rounded-lg bg-red-800 py-3 text-sm font-bold text-white hover:bg-red-700">
                  Cancel Edit
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminProductsPage
