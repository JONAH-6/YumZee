import { useState, useEffect } from 'react'
import { navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'
import {
  LayoutDashboard, ShoppingBag, Package, Users, LogOut, UserCircle, HelpCircle,
} from 'lucide-react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from 'src/lib/firebase'

const AdminPortalPage = () => {
  const [orders, setOrders] = useState(0)
  const [products, setProducts] = useState(0)
  const [users, setUsers] = useState(0)
  const [profiles, setProfiles] = useState(0)

  useEffect(() => {
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => setOrders(snap.size))
    const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => setProducts(snap.size))
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => setUsers(snap.size))
    const unsubProfiles = onSnapshot(collection(db, 'profiles'), (snap) => setProfiles(snap.size))
    return () => { unsubOrders(); unsubProducts(); unsubUsers(); unsubProfiles() }
  }, [])

  return (
    <div className="min-h-screen bg-red-50">
      <Metadata title="Admin Portal" description="YumZee Admin" />
      <header className="bg-red-600 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-black">YumZee Admin</h1>
              <p className="text-xs text-red-200">Select a section to manage</p>
            </div>
          </div>
          <button onClick={() => navigate(routes.home())} className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-bold hover:bg-white/30">
            <LogOut className="h-4 w-4" /> Exit
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Overview Button */}
          <button onClick={() => navigate(routes.adminOverview())} className="flex flex-col items-start gap-4 rounded-2xl border border-red-200 bg-white p-6 text-left transition hover:border-red-500 hover:bg-red-50">
            <LayoutDashboard className="h-10 w-10 text-red-600" />
            <div>
              <p className="text-xl font-black text-gray-800">Overview</p>
              <p className="text-sm text-gray-500">Live stats & 5 recent orders</p>
            </div>
          </button>

          {/* Orders Button */}
          <button onClick={() => navigate(routes.adminOrders())} className="flex flex-col items-start gap-4 rounded-2xl border border-red-200 bg-white p-6 text-left transition hover:border-red-500 hover:bg-red-50">
            <ShoppingBag className="h-10 w-10 text-red-600" />
            <div>
              <p className="text-xl font-black text-gray-800">Orders ({orders})</p>
              <p className="text-sm text-gray-500">Manage all customer orders</p>
            </div>
          </button>

          {/* Products Button */}
          <button onClick={() => navigate(routes.adminProducts())} className="flex flex-col items-start gap-4 rounded-2xl border border-red-200 bg-white p-6 text-left transition hover:border-red-500 hover:bg-red-50">
            <Package className="h-10 w-10 text-red-600" />
            <div>
              <p className="text-xl font-black text-gray-800">Products ({products})</p>
              <p className="text-sm text-gray-500">Upload & manage snacks</p>
            </div>
          </button>

          {/* Users Button */}
          <button onClick={() => navigate(routes.adminLoggedInUsers())} className="flex flex-col items-start gap-4 rounded-2xl border border-red-200 bg-white p-6 text-left transition hover:border-red-500 hover:bg-red-50">
            <Users className="h-10 w-10 text-red-600" />
            <div>
              <p className="text-xl font-black text-gray-800">Logged-in Users ({users})</p>
              <p className="text-sm text-gray-500">See who just logged in</p>
            </div>
          </button>

          {/* Profiles Button */}
          <button onClick={() => navigate(routes.adminProfiles())} className="flex flex-col items-start gap-4 rounded-2xl border border-red-200 bg-white p-6 text-left transition hover:border-red-500 hover:bg-red-50">
            <UserCircle className="h-10 w-10 text-red-600" />
            <div>
              <p className="text-xl font-black text-gray-800">Profiles ({profiles})</p>
              <p className="text-sm text-gray-500">Complete user details & notes</p>
            </div>
          </button>

          {/* Help Button */}
          <button onClick={() => navigate(routes.adminHelp())} className="flex flex-col items-start gap-4 rounded-2xl border border-red-200 bg-white p-6 text-left transition hover:border-red-500 hover:bg-red-50">
            <HelpCircle className="h-10 w-10 text-red-600" />
            <div>
              <p className="text-xl font-black text-gray-800">Help Requests</p>
              <p className="text-sm text-gray-500">See user complaints & issues</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminPortalPage
