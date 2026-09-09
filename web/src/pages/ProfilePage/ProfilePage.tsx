// web/src/pages/ProfilePage/ProfilePage.tsx
import { useState, useEffect } from 'react'
import { Link, navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'
import {
  MapPin, Phone, Building, Save, Check, LogOut, User as UserIcon,
  Loader2, ChevronRight, Mail, ShieldCheck, HelpCircle, ShoppingBag,
  Clock, MessageCircle,
} from 'lucide-react'
import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from 'src/lib/firebase'
import { useAuth } from 'src/contexts/AuthContexts'

const ProfilePage = () => {
  const { user, logOut, isAuthenticated, loading } = useAuth()
  const [campus, setCampus] = useState('')
  const [hostel, setHostel] = useState('')
  const [phone, setPhone] = useState('')
  const [deliveryNotes, setDeliveryNotes] = useState('')
  const [landmark, setLandmark] = useState('')
  const [deliveryTime, setDeliveryTime] = useState('ASAP')
  const [whatsapp, setWhatsapp] = useState('')
  const [isSaved, setIsSaved] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [issueType, setIssueType] = useState('')
  const [issueOther, setIssueOther] = useState('')

  const getDisplayName = () => {
    if (!user) return 'Guest'
    if (user.displayName) return user.displayName
    if (user.email) return user.email.split('@')[0]
    return 'Guest'
  }

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
          if (data.landmark) setLandmark(data.landmark)
          if (data.deliveryTime) setDeliveryTime(data.deliveryTime)
          if (data.whatsapp) setWhatsapp(data.whatsapp)
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setIsLoadingProfile(false)
      }
    }
    loadProfile()
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    try {
      await setDoc(doc(db, 'profiles', user.uid), {
        name: getDisplayName(), email: user.email, campus, hostel, phone,
        deliveryNotes, landmark, deliveryTime, whatsapp,
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

  const handleHelpSubmit = async () => {
    if (!user) return
    if (!phone) {
      alert('Please add your phone number in "Delivery details" before submitting a help request.')
      setIsAccountOpen(true)
      return
    }
    try {
      await addDoc(collection(db, 'help'), {
        userEmail: user.email,
        userPhone: phone,
        issueType: issueType,
        issueOther: issueOther,
        createdAt: serverTimestamp(),
      })
      alert('Help request submitted!')
      setIsHelpOpen(false)
      setIssueType('')
      setIssueOther('')
    } catch (error) {
      console.error('Error submitting help:', error)
    }
  }

  if (loading || isLoadingProfile) {
    return <div className="min-h-screen bg-[#FBF9FE] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#4B2E83]" /></div>
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FBF9FE] py-10">
        <Metadata title="Profile — Please login" description="Login to manage your profile" />
        <div className="container mx-auto max-w-md px-4">
          <div className="rounded-2xl border border-[#E9E5EE] bg-white p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5F1FB] text-[#4B2E83]">
              <UserIcon className="h-8 w-8" />
            </div>
            <h1 className="mt-4 text-xl font-extrabold text-[#211F26]">You're not logged in</h1>
            <p className="mt-2 text-sm text-[#6F6B76]">Log in to save your delivery details.</p>
            <Link to={routes.home()} className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[#4B2E83] px-6 py-3 text-sm font-bold text-white hover:bg-[#371F62] transition">Go to Home</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FBF9FE] font-sans">
      <Metadata title="My Profile" description="Manage your delivery details" />
      <div className="relative bg-white px-6 pb-10 pt-10 border-b border-[#E9E5EE]">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          {user.photoURL ? <img src={user.photoURL} alt="Avatar" className="h-14 w-14 rounded-full border border-[#E9E5EE] object-cover" /> : <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#4B2E83] text-xl font-black text-white">{getDisplayName()[0]?.toUpperCase() ?? 'U'}</div>}
          <div className="flex-1">
            <h2 className="text-xl font-extrabold text-[#211F26]">{getDisplayName()}</h2>
            <p className="flex items-center gap-1.5 text-sm font-medium text-[#6F6B76]"><Mail className="h-4 w-4 text-[#A09BA8]" /> {user.email}</p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-700"><ShieldCheck className="h-3.5 w-3.5" /> Verified</span>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-4 px-4 pb-10 pt-4">
        <div className="rounded-2xl border border-[#E9E5EE] bg-white">
          <div className="p-4"><h1 className="text-2xl font-black text-[#211F26]">Profile</h1></div>
          <div className="divide-y divide-[#E9E5EE]">
            <button onClick={() => navigate(routes.orders())} className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-[#6F6B76]" />
                <span className="text-base font-semibold text-[#211F26]">Order history</span>
              </div>
              <ChevronRight className="h-5 w-5 text-[#6F6B76]" />
            </button>

            <div>
              <button onClick={() => setIsAccountOpen(!isAccountOpen)} className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-[#6F6B76]" />
                  <span className="text-base font-semibold text-[#211F26]">Delivery details</span>
                </div>
                <ChevronRight className="h-5 w-5 text-[#6F6B76]" />
              </button>
              {isAccountOpen && (
                <form onSubmit={handleSave} className="space-y-4 border-t border-[#E9E5EE] bg-white p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#6F6B76]">City / Area <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A09BA8]" />
                        <input type="text" value={campus} onChange={(e) => setCampus(e.target.value)} placeholder="Type your city / area" required className="w-full rounded-2xl border border-[#E9E5EE] bg-[#FAF8FD] py-3 pl-10 pr-4 text-sm font-medium text-[#211F26] placeholder-[#A09BA8] focus:border-[#4B2E83] focus:outline-none focus:ring-2 focus:ring-[#4B2E83]/10" />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#6F6B76]">Street Address <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Building className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A09BA8]" />
                        <input value={hostel} onChange={(e) => setHostel(e.target.value)} placeholder="e.g. 12 Allen Avenue, Ikeja" required className="w-full rounded-2xl border border-[#E9E5EE] bg-[#FAF8FD] py-3 pl-10 pr-4 text-sm font-medium text-[#211F26] placeholder-[#A09BA8] focus:border-[#4B2E83] focus:outline-none focus:ring-2 focus:ring-[#4B2E83]/10" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#6F6B76]">Phone Number <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A09BA8]" />
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full rounded-2xl border border-[#E9E5EE] bg-[#FAF8FD] py-3 pl-10 pr-4 text-sm font-medium text-[#211F26] focus:border-[#4B2E83] focus:outline-none focus:ring-2 focus:ring-[#4B2E83]/10" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#6F6B76]">Delivery Note <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-[#A09BA8]" />
                        <textarea value={deliveryNotes} onChange={(e) => setDeliveryNotes(e.target.value)} rows={3} placeholder="Call when at gate, etc." required className="w-full rounded-2xl border border-[#E9E5EE] bg-[#FAF8FD] py-3 pl-10 pr-4 text-sm font-medium text-[#211F26] focus:border-[#4B2E83] focus:outline-none focus:ring-2 focus:ring-[#4B2E83]/10" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#6F6B76]">Nearest Landmark / Gate <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A09BA8]" />
                        <input type="text" value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="e.g., Main Gate, Back Gate" required className="w-full rounded-2xl border border-[#E9E5EE] bg-[#FAF8FD] py-3 pl-10 pr-4 text-sm font-medium text-[#211F26] placeholder-[#A09BA8] focus:border-[#4B2E83] focus:outline-none focus:ring-2 focus:ring-[#4B2E83]/10" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#6F6B76]">Preferred Delivery Time <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Clock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A09BA8]" />
                        <select value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} required className="w-full rounded-2xl border border-[#E9E5EE] bg-[#FAF8FD] py-3 pl-10 pr-4 text-sm font-medium text-[#211F26] focus:border-[#4B2E83] focus:outline-none focus:ring-2 focus:ring-[#4B2E83]/10">
                          <option>ASAP</option>
                          <option>After 1-2 hours</option>
                          <option>After 2-4 hours</option>
                        </select>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#6F6B76]">WhatsApp Number <span className="text-red-500">*</span></label>
                      <div className="flex items-center rounded-2xl border border-[#E9E5EE] bg-[#FAF8FD] focus-within:border-[#4B2E83] focus-within:ring-2 focus-within:ring-[#4B2E83]/10">
                        <span className="flex items-center gap-2 border-r border-[#E9E5EE] bg-[#F5F1FB] px-4 py-3 text-sm font-bold text-[#4B2E83] rounded-l-2xl">
                          <MessageCircle className="h-4 w-4 text-[#4B2E83]" />
                          +234
                        </span>
                        <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="8012345678" required className="w-full bg-transparent py-3 pl-4 pr-4 text-sm font-medium text-[#211F26] placeholder-[#A09BA8] outline-none" />
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end border-t border-[#F5F1FB]">
                    <button type="submit" className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-extrabold transition active:scale-95 ${isSaved ? 'bg-emerald-600 text-white' : 'bg-[#FFC928] text-[#4B2E83] hover:bg-[#E5B420]'}`}>
                      {isSaved ? (<><Check className="h-4 w-4" /> Saved!</>) : (<><Save className="h-4 w-4" /> Save Changes</>)}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div>
              <button onClick={() => setIsHelpOpen(!isHelpOpen)} className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <HelpCircle className="h-5 w-5 text-[#6F6B76]" />
                  <span className="text-base font-semibold text-[#211F26]">Help</span>
                </div>
                <ChevronRight className="h-5 w-5 text-[#6F6B76]" />
              </button>
              {isHelpOpen && (
                <div className="space-y-4 border-t border-[#E9E5EE] bg-white p-4">
                  <p className="text-sm font-bold text-[#6F6B76]">What went wrong?</p>
                  <div className="space-y-3">
                    {['My order is missing / incorrect', 'Rider was late / poor communication', 'Quality issue with the food', 'Payment / Price problem', 'App technical issue'].map((option) => (
                      <label key={option} className="flex items-center gap-3 text-sm font-medium text-[#211F26] cursor-pointer">
                        <input type="radio" name="issueType" value={option} checked={issueType === option} onChange={(e) => setIssueType(e.target.value)} className="h-5 w-5 accent-[#4B2E83]" />
                        {option}
                      </label>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-sm font-medium text-[#211F26]">Other</span>
                    <input type="text" value={issueOther} onChange={(e) => setIssueOther(e.target.value)} placeholder="Type more details..." className="flex-1 rounded-xl border border-[#E9E5EE] bg-[#FAF8FD] px-4 py-2 text-sm outline-none focus:border-[#4B2E83]" />
                  </div>
                  <button onClick={handleHelpSubmit} className="w-full rounded-xl bg-[#4B2E83] py-3 text-sm font-bold text-white hover:bg-[#371F62]">Submit</button>
                </div>
              )}
            </div>

            <button onClick={handleLogout} disabled={isLoggingOut} className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <LogOut className="h-5 w-5 text-red-600" />
                <span className="text-base font-semibold text-red-600">Log Out</span>
              </div>
              {isLoggingOut ? <Loader2 className="h-5 w-5 animate-spin text-red-600" /> : <ChevronRight className="h-5 w-5 text-red-600" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
