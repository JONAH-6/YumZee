import { navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'
import { db } from 'src/lib/firebase'
import { collection, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { ArrowLeft, ShoppingBag, Clock, MoreVertical, Eye, X, Check, Phone, Mail } from 'lucide-react'

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)

  // 🔥 Fetch Orders
  useEffect(() => {
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      const sorted = data.sort((a: any, b: any) => {
        const dateA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime()
        const dateB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime()
        return dateB - dateA
      })
      setOrders(sorted)
    })
    return () => unsubOrders()
  }, [])

  // 🔥 Fetch Profiles in real-time (for phone lookup)
  useEffect(() => {
    const unsubProfiles = onSnapshot(collection(db, 'profiles'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setProfiles(data)
    })
    return () => unsubProfiles()
  }, [])

  // 🔥 Look up the phone from profile by matching email
  const getPhoneFromProfile = (email: string) => {
    if (!email) return null
    const found = profiles.find((p: any) => p.email?.toLowerCase() === email.toLowerCase())
    return found?.phone || null
  }

  const activeOrders = orders.filter((o) => !o.isCompleted)
  const completedOrders = orders.filter((o) => o.isCompleted)
  const displayOrders = activeTab === 'active' ? activeOrders : completedOrders

  const handleComplete = async (orderId: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        isCompleted: true,
        completedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error('Error completing order:', error)
    }
  }

  const handleUncomplete = async (orderId: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        isCompleted: false,
      })
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'No Date'
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp)
    return date.toLocaleString()
  }

  const getItemSummary = (items: any[]) => {
    if (!items || items.length === 0) return 'No items'
    const first = `${items[0].quantity}x ${items[0].name}`
    if (items.length === 1) return first
    return `${first} +${items.length - 1} more`
  }

  return (
    <div className="min-h-screen bg-red-50">
      <Metadata title="Admin Orders" />
      <header className="bg-red-600 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(routes.admin())} className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-bold hover:bg-white/30">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <h1 className="text-2xl font-black">All Orders</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Tabs */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
              activeTab === 'active' ? 'bg-red-600 text-white' : 'bg-white text-red-600 border border-red-200'
            }`}
          >
            <ShoppingBag className="h-4 w-4" /> Orders ({activeOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
              activeTab === 'completed' ? 'bg-red-600 text-white' : 'bg-white text-red-600 border border-red-200'
            }`}
          >
            <Check className="h-4 w-4" /> Completed Orders ({completedOrders.length})
          </button>
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-white border border-red-100 overflow-x-auto">
          {displayOrders.length === 0 ? (
            <p className="py-8 text-center text-gray-400">
              {activeTab === 'active' ? 'No active orders yet...' : 'No completed orders yet...'}
            </p>
          ) : (
            <div className="min-w-[900px]">
              <div className="grid grid-cols-8 gap-2 border-b border-red-200 bg-red-50 px-4 py-3 text-[11px] font-black uppercase tracking-wider text-red-600">
                <div className="text-center">{activeTab === 'active' ? 'Done' : 'Undo'}</div>
                <div className="col-span-2">Customer</div>
                <div className="col-span-2">Items</div>
                <div>Total</div>
                <div>Time</div>
                <div className="text-center">Action</div>
              </div>

              {displayOrders.map((order) => {
                // 🔥 Get phone from profile, fallback to stored phone
                const profilePhone = getPhoneFromProfile(order.customerEmail)
                const displayPhone = profilePhone || order.customerPhone || 'No Phone'

                return (
                  <div key={order.id} className="grid grid-cols-8 gap-2 border-b border-red-100 px-4 py-3 text-sm items-center hover:bg-red-50/50">
                    <div className="flex justify-center">
                      {activeTab === 'active' ? (
                        <button
                          onClick={() => handleComplete(order.id)}
                          className="flex h-6 w-6 items-center justify-center rounded-md border-2 border-red-300 hover:border-red-600 hover:bg-red-50"
                          title="Mark as completed"
                        >
                          <Check className="h-4 w-4 text-white" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUncomplete(order.id)}
                          className="flex h-6 w-6 items-center justify-center rounded-md border-2 border-green-300 bg-green-500 hover:bg-green-600"
                          title="Move back to active"
                        >
                          <Check className="h-4 w-4 text-white" />
                        </button>
                      )}
                    </div>

                    <div className="col-span-2 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-800 truncate">{order.customerName || 'Customer'}</p>
                        {activeTab === 'active' && (
                          <span className="rounded-sm bg-red-600 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                            New
                          </span>
                        )}
                      </div>
                      {/* 🔥 Showing phone (from profile) and email together */}
                      <p className="flex items-center gap-1 text-xs text-gray-500 truncate">
                        <Phone className="h-3 w-3 shrink-0" /> {displayPhone}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-gray-500 truncate">
                        <Mail className="h-3 w-3 shrink-0" /> {order.customerEmail || 'No Email'}
                      </p>
                    </div>

                    <div className="col-span-2 truncate text-gray-700">{getItemSummary(order.items)}</div>
                    <div className="truncate font-bold text-red-600">₦{order.total?.toLocaleString() || '0'}</div>
                    <div className="truncate text-xs text-gray-400">{formatDate(order.createdAt)}</div>

                    <div className="relative flex justify-center">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === order.id ? null : order.id)}
                        className="rounded-full p-2 hover:bg-red-50"
                      >
                        <MoreVertical className="h-5 w-5 text-gray-400" />
                      </button>

                      {openMenuId === order.id && (
                        <div className="absolute right-0 top-8 z-10 w-36 rounded-lg border border-red-200 bg-white p-1">
                          <button
                            onClick={() => { setSelectedOrder(order); setOpenMenuId(null); }}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-bold text-gray-700 hover:bg-red-50"
                          >
                            <Eye className="h-4 w-4 text-red-600" /> View Details
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal for Viewing Full Order Details */}
      {selectedOrder && (() => {
        const profilePhone = getPhoneFromProfile(selectedOrder.customerEmail)
        const modalPhone = profilePhone || selectedOrder.customerPhone || 'No phone'

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6">
              <button onClick={() => setSelectedOrder(null)} className="absolute right-3 top-3 text-gray-500 hover:text-red-600">
                <X className="h-5 w-5" />
              </button>

              <h2 className="mb-4 text-2xl font-black text-red-600">Order Details</h2>

              <div className="space-y-2 border-b border-red-100 pb-4">
                <p className="text-lg font-bold text-gray-800">{selectedOrder.customerName || 'Customer'}</p>
                <p className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 text-red-500" /> {modalPhone}
                </p>
                <p className="flex items-center gap-2 text-sm text-gray-600 break-all">
                  <Mail className="h-4 w-4 text-red-500" /> {selectedOrder.customerEmail || 'No email'}
                </p>
                <p className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="h-3 w-3" /> {formatDate(selectedOrder.createdAt)}
                </p>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-red-600">Items Ordered</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border border-red-100 p-2">
                      <div>
                        <p className="text-sm font-bold text-gray-800">{item.quantity}x {item.name}</p>
                        <p className="text-xs text-gray-500">₦{item.price?.toLocaleString()} each</p>
                      </div>
                      <p className="text-sm font-bold text-gray-800">₦{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-2 border-t border-red-100 pt-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>₦{selectedOrder.subtotal?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery Fee</span>
                  <span>₦{selectedOrder.deliveryFee?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between border-t border-red-100 pt-2 text-base font-black text-red-600">
                  <span>Total</span>
                  <span>₦{selectedOrder.total?.toLocaleString() || '0'}</span>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

export default AdminOrdersPage
