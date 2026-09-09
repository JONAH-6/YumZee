import { navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'
import { db } from 'src/lib/firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { ArrowLeft, Mail, HelpCircle, Clock, Phone } from 'lucide-react'

const AdminHelpPage = () => {
  const [helpRequests, setHelpRequests] = useState<any[]>([])

  useEffect(() => {
    const unsubHelp = onSnapshot(collection(db, 'help'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setHelpRequests(data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)))
    })
    return () => unsubHelp()
  }, [])

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'No Date'
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp)
    return date.toLocaleString()
  }

  return (
    <div className="min-h-screen bg-red-50">
      <Metadata title="Admin Help Requests" />
      <header className="bg-red-600 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(routes.admin())} className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-bold hover:bg-white/30">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <h1 className="text-2xl font-black">Help Requests</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="rounded-2xl bg-white p-6 border border-red-100">
          {helpRequests.length === 0 ? (
            <p className="py-8 text-center text-gray-400">No help requests yet...</p>
          ) : (
            <div className="space-y-4">
              {helpRequests.map((req) => (
                <div key={req.id} className="rounded-xl border border-red-200 p-4">
                  <div className="flex flex-col md:flex-row justify-between border-b border-red-100 pb-3 mb-3 gap-2">
                    <p className="flex items-center gap-2 text-base font-bold text-gray-800">
                      <Mail className="h-5 w-5 text-red-600" /> {req.userEmail || 'Unknown Email'}
                    </p>
                    <p className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="h-4 w-4" /> {formatDate(req.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <p className="mb-1 flex items-center gap-2 text-xs font-bold text-red-600">
                        <HelpCircle className="h-4 w-4" /> Issue Type
                      </p>
                      <p className="text-sm text-gray-700">{req.issueType || 'No issue selected'}</p>
                    </div>
                    <div className="flex-1">
                      {/* Changed to Phone Number */}
                      <p className="mb-1 flex items-center gap-2 text-xs font-bold text-red-600">
                        <Phone className="h-4 w-4" /> Phone Number
                      </p>
                      <p className="text-sm text-gray-700">{req.userPhone || 'No phone provided (Check Profile)'}</p>
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

export default AdminHelpPage
