// web/src/pages/ProfilePage/ProfilePage.tsx
import { useState, useEffect } from 'react'
import { Link, navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'
import {
  MapPin,
  Phone,
  Mail,
  Building,
  Save,
  Check,
  ShieldCheck,
  LogOut,
  User as UserIcon,
  Loader2,
} from 'lucide-react'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from 'src/lib/firebase'
import { useAuth } from 'src/contexts/AuthContexts'

const ProfilePage = () => {
  const { user, logOut, isAuthenticated, loading } = useAuth()
  const [campus, setCampus] = useState('Lagos Mainland')
  const [hostel, setHostel] = useState('')
  const [phone, setPhone] = useState('')
  const [deliveryNotes, setDeliveryNotes] = useState('')
  const [isSaved, setIsSaved] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)

  const getDisplayName = () => {
    if (!user) return 'Guest'
    if (user.displayName) return user.displayName
    if (user.email) return user.email.split('@')[0]
    return 'Guest'
  }

  // Load the saved profile if it exists when the user logs in
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return
      setIsLoadingProfile(true)
      try {
        const docRef = doc(db, 'profiles', user.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          if (data.campus) setCampus(data.campus)
          if (data.hostel) setHostel(data.hostel)
          if (data.phone) setPhone(data.phone)
          if (data.deliveryNotes) setDeliveryNotes(data.deliveryNotes)
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setIsLoadingProfile(false)
      }
    }
    loadProfile()
  }, [user])

  // Save profile to Firestore under the user's unique UID
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    try {
      await setDoc(doc(db, 'profiles', user.uid), {
        name: getDisplayName(),
        email: user.email,
        campus,
        hostel,
        phone,
        deliveryNotes,
        updatedAt: new Date().toISOString(),
      })
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2500)
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logOut()
      navigate('/', { replace: true })
    } catch (e) {
      console.error('Logout failed', e)
      setIsLoggingOut(false)
    }
  }

  if (loading || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-[#FBF9FE] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#4B2E83]" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FBF9FE] py-10">
        <Metadata title="Profile — Please login" description="Login to manage your profile" />
        <div className="container mx-auto max-w-md px-4">
          <div className="rounded-2xl border border-[#E9E5EE] bg-white p-8 shadow-sm text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5F1FB] text-[#4B2E83]">
              <UserIcon className="h-8 w-8" />
            </div>
            <h1 className="mt-4 text-xl font-extrabold text-[#211F26]">You’re not logged in</h1>
            <p className="mt-2 text-sm text-[#6F6B76]">Log in to save your delivery details.</p>
            <Link
              to={routes.home()}
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[#4B2E83] px-6 py-3 text-sm font-bold text-white shadow hover:bg-[#371F62] transition"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FBF9FE] py-6">
      <Metadata title="My Profile" description="Manage your delivery details" />

      <div className="container mx-auto max-w-3xl space-y-6 px-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-[#211F26]">My Profile</h1>
          <p className="mt-1 text-xs text-[#6F6B76]">Manage your delivery details.</p>
        </div>

        {/* User card */}
        <div className="flex items-center gap-4 rounded-2xl border border-[#E9E5EE] bg-white p-3 shadow-sm">
          {user.photoURL ? (
            <img src={user.photoURL} alt="Avatar" className="h-14 w-14 rounded-2xl border border-[#E9E5EE] object-cover" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4B2E83] text-xl font-black text-[#FFC928]">
              {getDisplayName()[0]?.toUpperCase() ?? 'U'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-extrabold text-[#211F26] truncate">{getDisplayName()}</h2>
            <p className="flex items-center gap-1.5 text-xs text-[#6F6B76] truncate">
              <Mail className="h-3.5 w-3.5 text-[#A09BA8] shrink-0" />
              {user.email}
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" /> Verified
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="rounded-2xl border border-[#E9E5EE] bg-white p-3 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#211F26]">Delivery details</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="campus" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#6F6B76]">
                City / Area
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A09BA8]" />
                <select
                  id="campus"
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  className="w-full rounded-2xl border border-[#E9E5EE] bg-[#FAF8FD] py-3 pl-10 pr-4 text-sm font-medium text-[#211F26] focus:border-[#4B2E83] focus:outline-none focus:ring-2 focus:ring-[#4B2E83]/10"
                >
                  <option>Lagos Mainland</option>
                  <option>Yaba / Akoka</option>
                  <option>Surulere</option>
                  <option>Ikeja</option>
                  <option>Lekki / Ajah</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="hostel" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#6F6B76]">
                Street Address
              </label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A09BA8]" />
                <input
                  id="hostel"
                  value={hostel}
                  onChange={(e) => setHostel(e.target.value)}
                  placeholder="e.g. 12 Allen Avenue, Ikeja"
                  required
                  className="w-full rounded-2xl border border-[#E9E5EE] bg-[#FAF8FD] py-3 pl-10 pr-4 text-sm font-medium text-[#211F26] placeholder-[#A09BA8] focus:border-[#4B2E83] focus:outline-none focus:ring-2 focus:ring-[#4B2E83]/10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#6F6B76]">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A09BA8]" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-[#E9E5EE] bg-[#FAF8FD] py-3 pl-10 pr-4 text-sm font-medium text-[#211F26] focus:border-[#4B2E83] focus:outline-none focus:ring-2 focus:ring-[#4B2E83]/10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#6F6B76]">
                Delivery Note <span className="normal-case font-medium text-[#A09BA8]">(optional)</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-[#A09BA8]" />
                <textarea
                  id="notes"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  rows={3}
                  placeholder="Call when at gate, etc."
                  className="w-full rounded-2xl border border-[#E9E5EE] bg-[#FAF8FD] py-3 pl-10 pr-4 text-sm font-medium text-[#211F26] focus:border-[#4B2E83] focus:outline-none focus:ring-2 focus:ring-[#4B2E83]/10"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end border-t border-[#F5F1FB]">
            <button
              type="submit"
              className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-extrabold shadow-sm transition active:scale-95 ${isSaved ? 'bg-emerald-600 text-white' : 'bg-[#FFC928] text-[#4B2E83] hover:bg-[#E5B420]'}`}
            >
              {isSaved ? (
                <>
                  <Check className="h-4 w-4" /> Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>

        {/* Account */}
        <div className="rounded-2xl border border-[#E9E5EE] bg-white p-3 shadow-sm">
          <h3 className="text-sm font-extrabold text-[#211F26]">Account</h3>
          <p className="mt-1 text-xs text-[#6F6B76]">You’re signed in as {user.email}. Logging out clears your session on this device.</p>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="mt-4 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-6 py-3 text-sm font-bold text-red-600 hover:bg-red-50 hover:border-red-300 transition disabled:opacity-50"
          >
            {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            {isLoggingOut ? 'Logging out…' : 'Log Out'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
