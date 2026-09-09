import { navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'
import { db } from 'src/lib/firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { ArrowLeft, Mail, MapPin, Phone, Clock, Flag, Watch, MessageCircle, MoreVertical, Eye, X } from 'lucide-react'

const AdminProfilesPage = () => {
  const [profiles, setProfiles] = useState<any[]>([])
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null)

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
            <h1 className="text-2xl font-black">User Profiles ({profiles.length})</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="rounded-2xl bg-white border border-red-100 overflow-x-auto">
          {profiles.length === 0 ? (
            <p className="py-8 text-center text-gray-400">No profiles yet...</p>
          ) : (
            <div className="min-w-[1000px]">
              {/* Header Row - 10 Columns */}
              <div className="grid grid-cols-10 gap-2 border-b border-red-200 bg-red-50 px-4 py-3 text-[11px] font-black uppercase tracking-wider text-red-600">
                <div className="col-span-2">Name / Email</div>
                <div>Phone</div>
                <div>Area</div>
                <div>Street</div>
                <div>Landmark</div>
                <div>Time</div>
                <div>WhatsApp</div>
                <div>Notes</div>
                <div className="text-center">Action</div>
              </div>

              {/* Data Rows - 10 Columns */}
              {profiles.map((profile) => (
                <div key={profile.id} className="grid grid-cols-10 gap-2 border-b border-red-100 px-4 py-3 text-sm items-center hover:bg-red-50/50">
                  <div className="col-span-2 min-w-0">
                    <p className="font-bold text-gray-800 truncate">{profile.name || 'Unknown'}</p>
                    <p className="flex items-center gap-1 text-xs text-gray-500 truncate">
                      <Mail className="h-3 w-3 shrink-0" /> {profile.email}
                    </p>
                  </div>

                  <div className="truncate text-gray-700">{profile.phone || 'No'}</div>
                  <div className="truncate text-gray-700">{profile.campus || 'No'}</div>
                  <div className="truncate text-gray-700">{profile.hostel || 'No'}</div>
                  <div className="truncate text-gray-700">{profile.landmark || 'No'}</div>
                  <div className="truncate text-gray-700">{profile.deliveryTime || 'No'}</div>
                  <div className="truncate text-gray-700">{profile.whatsapp ? `+234${profile.whatsapp}` : 'No'}</div>

                  {/* Added Delivery Note - Showing first 20 characters */}
                  <div className="truncate text-gray-700">
                    {profile.deliveryNotes ? profile.deliveryNotes.slice(0, 20) + '...' : 'No'}
                  </div>

                  {/* 3-Dot Menu */}
                  <div className="relative flex justify-center">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === profile.id ? null : profile.id)}
                      className="rounded-full p-2 hover:bg-red-50"
                    >
                      <MoreVertical className="h-5 w-5 text-gray-400" />
                    </button>

                    {openMenuId === profile.id && (
                      <div className="absolute right-0 top-8 z-10 w-36 rounded-lg border border-red-200 bg-white p-1">
                        <button
                          onClick={() => { setSelectedProfile(profile); setOpenMenuId(null); }}
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
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6">
            <button onClick={() => setSelectedProfile(null)} className="absolute right-3 top-3 text-gray-500 hover:text-red-600">
              <X className="h-5 w-5" />
            </button>

            <h2 className="mb-4 text-2xl font-black text-red-600">Profile Details</h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3 border-b border-red-100 pb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-xl font-black text-white">
                  {selectedProfile.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{selectedProfile.name || 'Unknown'}</p>
                  <p className="flex items-center gap-1 text-sm text-gray-500">
                    <Mail className="h-3 w-3" /> {selectedProfile.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <p className="flex items-center gap-2 text-gray-700"><Phone className="h-4 w-4 text-red-500" /> {selectedProfile.phone || 'No Phone'}</p>
                <p className="flex items-center gap-2 text-gray-700"><MessageCircle className="h-4 w-4 text-red-500" /> {selectedProfile.whatsapp ? `+234${selectedProfile.whatsapp}` : 'No WhatsApp'}</p>
                <p className="flex items-center gap-2 text-gray-700"><MapPin className="h-4 w-4 text-red-500" /> {selectedProfile.campus || 'No Area'}</p>
                <p className="flex items-center gap-2 text-gray-700"><MapPin className="h-4 w-4 text-red-500" /> {selectedProfile.hostel || 'No Street'}</p>
                <p className="flex items-center gap-2 text-gray-700"><Flag className="h-4 w-4 text-red-500" /> {selectedProfile.landmark || 'No Landmark'}</p>
                <p className="flex items-center gap-2 text-gray-700"><Watch className="h-4 w-4 text-red-500" /> {selectedProfile.deliveryTime || 'No Time'}</p>
              </div>

              <div className="mt-4 border-t border-red-100 pt-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-red-600">Full Delivery Note</p>
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-gray-700 break-words">
                  {selectedProfile.deliveryNotes || 'No notes provided.'}
                </div>
              </div>

              <p className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                <Clock className="h-3 w-3" /> Updated: {formatDate(selectedProfile.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProfilesPage
