import { navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'
import { db } from 'src/lib/firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { ArrowLeft, Mail } from 'lucide-react'

const AdminLoggedInUsersPage = () => {
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setUsers(data)
    })
    return () => unsubUsers()
  }, [])

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'No Date'
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp)
    return date.toLocaleString()
  }

  return (
    <div className="min-h-screen bg-red-50">
      <Metadata title="Admin Users" />
      <header className="bg-red-600 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(routes.admin())} className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-bold hover:bg-white/30">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <h1 className="text-2xl font-black">Logged-in Users</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="rounded-2xl bg-white p-6 border border-red-100">
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
      </div>
    </div>
  )
}

export default AdminLoggedInUsersPage