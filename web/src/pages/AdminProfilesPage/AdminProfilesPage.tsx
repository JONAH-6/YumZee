import { navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'
import { db } from 'src/lib/firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { ArrowLeft, Mail, MapPin, Phone, Clock } from 'lucide-react'

const AdminProfilesPage = () => {
  const [profiles, setProfiles] = useState<any[]>([])

  useEffect(() => {
    const unsubProfiles = onSnapshot(collection(db, 'profiles'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setProfiles(data)
    })
    return () => unsubProfiles()
  }, [])

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'No Date'
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp)
    return date.toLocaleString()
  }

  return (
    <div className="min-h-screen bg-red-50">
      <Metadata title="Admin Profiles" />
      <header className="bg-red-600 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(routes.admin())} className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-bold hover:bg-white/30">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <h1 className="text-2xl font-black">User Profiles</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="rounded-2xl bg-white p-6 border border-red-100">
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
      </div>
    </div>
  )
}

export default AdminProfilesPage