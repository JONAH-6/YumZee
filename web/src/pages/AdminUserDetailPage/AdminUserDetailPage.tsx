import { useState, useEffect } from 'react'
import { navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'
import { db } from 'src/lib/firebase'
import { collection, onSnapshot, query, where, doc } from 'firebase/firestore'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Clock,
  ShoppingBag,
  Package,
  CheckCircle2,
  MessageCircle,
  Flag,
  Watch,
} from 'lucide-react'
import DeliveryMap from 'src/components/DeliveryMap/DeliveryMap'

const AdminUserDetailPage = ({ id }: { id: string }) => {
  const [profile, setProfile] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Live profile by document id
  useEffect(() => {
    if (!id) return
    const unsub = onSnapshot(doc(db, 'profiles', id), (snap) => {
      if (snap.exists()) {
        setProfile({ id: snap.id, ...snap.data() })
      }
    })
    return () => unsub()
  }, [id])

  // All orders for this user, newest first
  useEffect(() => {
    if (!profile?.email) return
    const q = query(
      collection(db, 'orders'),
      where('customerEmail', '==', profile.email)
    )
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[]
      data.sort((a, b) => {
        const timeA = a.createdAt?.seconds
          ? a.createdAt.seconds * 1000
          : new Date(a.createdAt || 0).getTime()
        const timeB = b.createdAt?.seconds
          ? b.createdAt.seconds * 1000
          : new Date(b.createdAt || 0).getTime()
        return timeB - timeA
      })
      setOrders(data)
      setLoading(false)
    })
    return () => unsub()
  }, [profile?.email])

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'No Date'
    const date = timestamp.seconds
      ? new Date(timestamp.seconds * 1000)
      : new Date(timestamp)
    return date.toLocaleString('en-NG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0)
  const completedOrders = orders.filter((o) => o.isCompleted).length
  const activeOrders = orders.length - completedOrders

  return (
    <div className="min-h-screen bg-red-50">
      <Metadata title="User Details" />
      <header className="bg-red-600 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(routes.adminProfiles())}
              className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-bold hover:bg-white/30"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <h1 className="text-2xl font-black">User Details</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        {/* Profile card + stats */}
        <div className="rounded-2xl border border-red-100 bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-2xl font-black text-white">
                {profile?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-800">
                  {profile?.name || 'Loading...'}
                </h2>
                <p className="flex items-center gap-1 text-sm text-gray-500">
                  <Mail className="h-4 w-4" /> {profile?.email || ''}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="min-w-[100px] rounded-xl bg-red-600 px-4 py-2 text-center text-white">
                <p className="text-[10px] font-bold uppercase opacity-80">Total Spent</p>
                <p className="text-lg font-black">₦{totalSpent.toLocaleString()}</p>
              </div>
              <div className="min-w-[100px] rounded-xl border border-red-200 bg-white px-4 py-2 text-center">
                <p className="text-[10px] font-bold uppercase text-red-600">Orders</p>
                <p className="text-lg font-black text-red-600">{orders.length}</p>
              </div>
              <div className="min-w-[100px] rounded-xl border border-red-200 bg-white px-4 py-2 text-center">
                <p className="text-[10px] font-bold uppercase text-green-600">Delivered</p>
                <p className="text-lg font-black text-green-600">{completedOrders}</p>
              </div>
              <div className="min-w-[100px] rounded-xl border border-red-200 bg-white px-4 py-2 text-center">
                <p className="text-[10px] font-bold uppercase text-amber-600">Active</p>
                <p className="text-lg font-black text-amber-600">{activeOrders}</p>
              </div>
            </div>
          </div>

          {profile && (
            <div className="mt-6 grid grid-cols-1 gap-3 border-t border-red-100 pt-4 md:grid-cols-2 lg:grid-cols-3">
              {profile.phone && (
                <p className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone className="h-4 w-4 text-red-500" /> {profile.phone}
                </p>
              )}
              {profile.whatsapp && (
                <p className="flex items-center gap-2 text-sm text-gray-700">
                  <MessageCircle className="h-4 w-4 text-red-500" /> +234{profile.whatsapp}
                </p>
              )}
              {profile.campus && (
                <p className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin className="h-4 w-4 text-red-500" /> {profile.campus}
                </p>
              )}
              {profile.hostel && (
                <p className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin className="h-4 w-4 text-red-500" /> {profile.hostel}
                </p>
              )}
              {profile.landmark && (
                <p className="flex items-center gap-2 text-sm text-gray-700">
                  <Flag className="h-4 w-4 text-red-500" /> {profile.landmark}
                </p>
              )}
              {profile.deliveryTime && (
                <p className="flex items-center gap-2 text-sm text-gray-700">
                  <Watch className="h-4 w-4 text-red-500" /> {profile.deliveryTime}
                </p>
              )}
            </div>
          )}

          {profile?.deliveryNotes && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-red-600">
                Delivery Note
              </p>
              <p className="text-sm text-gray-700">{profile.deliveryNotes}</p>
            </div>
          )}

          {profile?.latitude && profile?.longitude && (
            <div className="mt-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-red-600">
                Saved Location
              </p>
              <DeliveryMap
                latitude={profile.latitude}
                longitude={profile.longitude}
                interactive={false}
                addressLabel={profile.hostel || profile.campus || ''}
              />
            </div>
          )}
        </div>

        {/* Full order history */}
        <div className="rounded-2xl border border-red-100 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-red-600">
            <ShoppingBag className="h-5 w-5" /> Order History ({orders.length})
          </h2>

          {loading ? (
            <p className="py-8 text-center text-gray-400">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="py-8 text-center text-gray-400">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-red-100 p-4 transition hover:bg-red-50/50"
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-red-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full ${
                          order.isCompleted ? 'bg-green-100' : 'bg-amber-100'
                        }`}
                      >
                        {order.isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Package className="h-5 w-5 text-amber-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-800">
                          Order #{String(order.id).slice(-6).toUpperCase()}
                        </p>
                        <p className="flex items-center gap-1 text-[11px] text-gray-500">
                          <Clock className="h-3 w-3" /> {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {order.paid && (
                        <span className="rounded-full border border-green-200 bg-green-100 px-2.5 py-1 text-[10px] font-bold text-green-700">
                          PAID
                        </span>
                      )}
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                          order.isCompleted
                            ? 'border-green-200 bg-green-100 text-green-700'
                            : 'border-amber-200 bg-amber-100 text-amber-700'
                        }`}
                      >
                        {order.isCompleted ? 'DELIVERED' : 'IN PROGRESS'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-red-600">
                        Items Ordered
                      </p>
                      {(order.items || []).map((item: any) => (
                        <p key={item.id} className="text-sm text-gray-700">
                          {item.quantity} x {item.name} — ₦
                          {(item.price * item.quantity).toLocaleString()}
                        </p>
                      ))}
                    </div>
                    <div>
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-red-600">
                        Total
                      </p>
                      <p className="text-lg font-black text-red-600">
                        ₦{order.total?.toLocaleString() || '0'}
                      </p>
                      {order.fullAddress && (
                        <p className="mt-1 flex items-start gap-1 text-xs text-gray-500">
                          <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                          <span>{order.fullAddress}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminUserDetailPage
