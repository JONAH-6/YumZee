import { navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'
import { db } from 'src/lib/firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { ArrowLeft, Mail, User, Clock, MoreVertical, Eye, X } from 'lucide-react'

const AdminLoggedInUsersPage = () => {
  const [users, setUsers] = useState<any[]>([])
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<any | null>(null)

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setUsers(data.sort((a, b) => (b.lastLogin?.seconds || 0) - (a.lastLogin?.seconds || 0)))
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
            <h1 className="text-2xl font-black">Logged-in Users ({users.length})</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="rounded-2xl bg-white border border-red-100 overflow-x-auto">
          {users.length === 0 ? (
            <p className="py-8 text-center text-gray-400">No users have logged in yet...</p>
          ) : (
            <div className="min-w-[800px]">
              {/* Header Row */}
              <div className="grid grid-cols-5 gap-2 border-b border-red-200 bg-red-50 px-4 py-3 text-[11px] font-black uppercase tracking-wider text-red-600">
                <div className="col-span-2">Name / Email</div>
                <div>User ID</div>
                <div>Last Login</div>
                <div className="text-center">Action</div>
              </div>

              {/* Data Rows */}
              {users.map((user) => (
                <div key={user.id} className="grid grid-cols-5 gap-2 border-b border-red-100 px-4 py-3 text-sm items-center hover:bg-red-50/50">
                  <div className="col-span-2 min-w-0">
                    <p className="font-bold text-gray-800 truncate">{user.name || 'Unknown'}</p>
                    <p className="flex items-center gap-1 text-xs text-gray-500 truncate">
                      <Mail className="h-3 w-3 shrink-0" /> {user.email}
                    </p>
                  </div>

                  <div className="truncate text-gray-700">{user.uid || 'No UID'}</div>
                  <div className="truncate text-xs text-gray-400">{formatDate(user.lastLogin)}</div>

                  {/* 3-Dot Menu */}
                  <div className="relative flex justify-center">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                      className="rounded-full p-2 hover:bg-red-50"
                    >
                      <MoreVertical className="h-5 w-5 text-gray-400" />
                    </button>

                    {openMenuId === user.id && (
                      <div className="absolute right-0 top-8 z-10 w-36 rounded-lg border border-red-200 bg-white p-1">
                        <button
                          onClick={() => { setSelectedUser(user); setOpenMenuId(null); }}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-bold text-gray-700 hover:bg-red-50"
                        >
                          <Eye className="h-4 w-4 text-red-600" /> View Details
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal for Viewing Details */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6">
            <button onClick={() => setSelectedUser(null)} className="absolute right-3 top-3 text-gray-500 hover:text-red-600">
              <X className="h-5 w-5" />
            </button>

            <h2 className="mb-4 text-2xl font-black text-red-600">User Details</h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3 border-b border-red-100 pb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-xl font-black text-white">
                  {selectedUser.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{selectedUser.name || 'Unknown'}</p>
                  <p className="flex items-center gap-1 text-sm text-gray-500">
                    <Mail className="h-3 w-3" /> {selectedUser.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <p className="flex items-center gap-2 text-gray-700">
                  <User className="h-4 w-4 text-red-500" /> {selectedUser.uid || 'No UID'}
                </p>
                <p className="flex items-center gap-2 text-gray-700">
                  <Clock className="h-4 w-4 text-red-500" /> {formatDate(selectedUser.lastLogin)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminLoggedInUsersPage
