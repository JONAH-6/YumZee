import { useState, useEffect } from 'react'
import { navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'
import { db } from 'src/lib/firebase'
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Plus,
  LogOut,
  Loader2,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Clock,
} from 'lucide-react'

const AdminPortalPage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'users' | 'profiles'>('overview')

  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [newProduct, setNewProduct] = useState({ name: '', price: '', image: '', code: '', description: '', category: '' })
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [productSuccess, setProductSuccess] = useState(false)

  useEffect(() => {
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setOrders(data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)))
    })
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setProducts(data.sort((a, b) => a.code - b.code))
    })
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setUsers(data)
    })
    const unsubProfiles = onSnapshot(collection(db, 'profiles'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setProfiles(data)
    })
    setIsLoading(false)

    return () => {
      unsubOrders(); unsubProducts(); unsubUsers(); unsubProfiles()
    }
  }, [])

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProduct.name || !newProduct.price || !newProduct.code) return
    setIsAddingProduct(true)
    try {
      await addDoc(collection(db, 'products'), { ...newProduct, price: Number(newProduct.price), code: Number(newProduct.code), createdAt: serverTimestamp() })
      setNewProduct({ name: '', price: '', image: '', code: '', description: '', category: '' })
      setProductSuccess(true)
      setTimeout(() => setProductSuccess(false), 3000)
    } catch (error) {
      console.error('Error adding product:', error)
    } finally {
      setIsAddingProduct(false)
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'No Date'
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp)
    return date.toLocaleString()
  }

  return (
    <div className="min-h-screen bg-red-50">
      <Metadata title="Admin Portal" description="YumZee Admin" />

      <header className="bg-red-600 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-black">YumZee Admin</h1>
              <p className="text-xs text-red-200">Real-time Dashboard</p>
            </div>
          </div>
          <button onClick={() => navigate(routes.home())} className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-bold hover:bg-white/30">
            <LogOut className="h-4 w-4" /> Exit
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${activeTab === 'overview' ? 'bg-red-600 text-white' : 'bg-white text-red-600 border border-red-200'}`}>
            <LayoutDashboard className="h-4 w-4" /> Overview
          </button>
          <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${activeTab === 'orders' ? 'bg-red-600 text-white' : 'bg-white text-red-600 border border-red-200'}`}>
            <ShoppingBag className="h-4 w-4" /> Orders ({orders.length})
          </button>
          <button onClick={() => setActiveTab('products')} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${activeTab === 'products' ? 'bg-red-600 text-white' : 'bg-white text-red-600 border border-red-200'}`}>
            <Package className="h-4 w-4" /> Products ({products.length})
          </button>
          <button onClick={() => setActiveTab('users')} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${activeTab === 'users' ? 'bg-red-600 text-white' : 'bg-white text-red-600 border border-red-200'}`}>
            <Users className="h-4 w-4" /> Logged-in Users ({users.length})
          </button>
          <button onClick={() => setActiveTab('profiles')} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${activeTab === 'profiles' ? 'bg-red-600 text-white' : 'bg-white text-red-600 border border-red-200'}`}>
            <Users className="h-4 w-4" /> Profiles ({profiles.length})
          </button>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-red-600" />
            </div>
          ) : (
            <>
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="rounded-2xl bg-red-600 p-6 text-white">
                      <h3 className="text-lg font-bold">Total Orders</h3>
                      <p className="mt-2 text-5xl font-black">{orders.length}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-6 text-red-600 border border-red-100">
                      <h3 className="text-lg font-bold">Total Products</h3>
                      <p className="mt-2 text-5xl font-black">{products.length}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-6 text-red-600 border border-red-100">
                      <h3 className="text-lg font-bold">Logged-in Users</h3>
                      <p className="mt-2 text-5xl font-black">{users.length}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-6 text-red-600 border border-red-100">
                      <h3 className="text-lg font-bold">Saved Profiles</h3>
                      <p className="mt-2 text-5xl font-black">{profiles.length}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white p-6 border border-red-100">
                    <h2 className="mb-4 text-xl font-black text-red-600">Live Orders Feed</h2>
                    {orders.length === 0 ? (
                      <p className="py-8 text-center text-gray-400">No orders yet...</p>
                    ) : (
                      <div className="space-y-4">
                        {orders.slice(0, 5).map((order) => (
                          <div key={order.id} className="flex items-center justify-between rounded-xl border border-red-100 p-4">
                            <div>
                              <p className="font-bold text-gray-800">{order.customerName || 'Customer'}</p>
                              <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                            </div>
                            <span className="text-lg font-black text-red-600">₦{order.total?.toLocaleString() || '0'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ORDERS TAB */}
              {activeTab === 'orders' && (
                <div className="rounded-2xl bg-white p-6 border border-red-100">
                  <h2 className="mb-4 text-xl font-black text-red-600">All Orders</h2>
                  {orders.length === 0 ? (
                    <p className="py-8 text-center text-gray-400">No orders yet...</p>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="rounded-xl border border-red-200 p-4">
                          <div className="mb-2 flex justify-between items-center border-b border-red-100 pb-2">
                            <div>
                              <p className="font-bold text-gray-800">{order.customerName || 'Customer'}</p>
                              <p className="text-xs text-gray-500">{order.customerPhone || 'No Phone'}</p>
                            </div>
                            <span className="text-lg font-black text-red-600">₦{order.total?.toLocaleString() || '0'}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="mb-2 flex items-center gap-2 text-xs font-bold text-red-600">
                                <ShoppingBag className="h-4 w-4" /> Items
                              </p>
                              {order.items?.map((item: any) => (
                                <p key={item.id} className="text-sm text-gray-600">
                                  {item.quantity} x {item.name} — ₦{(item.price * item.quantity).toLocaleString()}
                                </p>
                              ))}
                            </div>
                            <div>
                              <p className="mb-2 flex items-center gap-2 text-xs font-bold text-red-600">
                                <MapPin className="h-4 w-4" /> Delivery
                              </p>
                              <p className="text-sm text-gray-600">{order.address || order.hostel || 'No Address'}</p>
                            </div>
                          </div>
                          <div className="mt-4 border-t border-red-100 pt-2">
                            <p className="flex items-center gap-2 text-xs text-gray-400">
                              <Clock className="h-4 w-4" /> Placed at: {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PRODUCTS TAB */}
              {activeTab === 'products' && (
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
                      <input type="text" placeholder="Category (e.g., Snacks)" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full rounded-lg border border-red-300 bg-white px-4 py-2 text-sm text-gray-800 placeholder-red-300" />
                      <textarea placeholder="Full Description" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} rows={3} className="w-full rounded-lg border border-red-300 bg-white px-4 py-2 text-sm text-gray-800 placeholder-red-300" />
                      <button type="submit" disabled={isAddingProduct} className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-3 text-sm font-black text-red-600 hover:bg-red-100 transition disabled:opacity-50">
                        {isAddingProduct ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                        {isAddingProduct ? 'Uploading...' : 'Add Product'}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* USERS TAB */}
              {activeTab === 'users' && (
                <div className="rounded-2xl bg-white p-6 border border-red-100">
                  <h2 className="mb-4 text-xl font-black text-red-600">Users Who Logged In</h2>
                  {users.length === 0 ? (
                    <p className="py-8 text-center text-gray-400">No users have logged in yet...</p>
                  ) : (
                    <div className="space-y-4">
                      {users.map((user) => (
                        <div key={user.id} className="rounded-xl border border-red-200 p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-xl font-black text-white">
                              {user.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-gray-800">{user.name || 'Unknown'}</p>
                              <p className="flex items-center gap-1 text-xs text-gray-500">
                                <Mail className="h-3 w-3" /> {user.email}
                              </p>
                            </div>
                            <p className="text-xs text-gray-400">{formatDate(user.lastLogin)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PROFILES TAB */}
              {activeTab === 'profiles' && (
                <div className="rounded-2xl bg-white p-6 border border-red-100">
                  <h2 className="mb-4 text-xl font-black text-red-600">Registered User Profiles</h2>
                  {profiles.length === 0 ? (
                    <p className="py-8 text-center text-gray-400">No profiles yet...</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {profiles.map((profile) => (
                        <div key={profile.id} className="rounded-xl border border-red-200 p-4">
                          <div className="mb-3 flex items-center gap-3 border-b border-red-100 pb-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-xl font-black text-white">
                              {profile.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{profile.name || 'Unknown'}</p>
                              <p className="flex items-center gap-1 text-xs text-gray-500">
                                <Mail className="h-3 w-3" /> {profile.email}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4 text-red-500" /> Area: {profile.campus || 'Not set'}
                            </p>
                            <p className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4 text-red-500" /> Street: {profile.hostel || 'Not set'}
                            </p>
                            <p className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="h-4 w-4 text-red-500" /> Phone: {profile.phone || 'Not set'}
                            </p>
                            <p className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="h-4 w-4 text-red-500" /> Notes: {profile.deliveryNotes || 'No Notes'}
                            </p>
                            <p className="flex items-center gap-2 text-xs text-gray-400">
                              <Clock className="h-3 w-3" /> Updated: {formatDate(profile.updatedAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPortalPage