import { useState, useEffect } from 'react'
import { navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'
import { db } from 'src/lib/firebase'
import { collection, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { useAuth } from 'src/contexts/AuthContexts'
import { ChevronLeft, Bell, Clock } from 'lucide-react'

const NotificationsPage = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'notifications'), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[]
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      setNotifications(data)
      setLoading(false)

      // 🔥 Mark all as read
      if (user?.uid && data.length > 0) {
        const allIds = data.map((n) => n.id)
        updateDoc(doc(db, 'profiles', user.uid), {
          readNotifications: arrayUnion(...allIds),
        }).catch((e) => console.error(e))
      }
    })
    return () => unsub()
  }, [user])

  const formatDate = (ts: any) => {
    if (!ts) return 'Just now'
    const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts)
    return date.toLocaleString()
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-[#FFF9E5] font-sans">
      <Metadata title="Notifications" />
      <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-[#E9E5EE] bg-white p-4">
        <button onClick={() => navigate(routes.home())} className="rounded-full p-1 hover:bg-gray-100">
          <ChevronLeft className="h-6 w-6 text-[#211F26]" />
        </button>
        <h1 className="text-lg font-bold">Notifications</h1>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-start gap-3 rounded-2xl border border-[#E9E5EE] bg-white p-4">
                <div className="anim-shimmer h-10 w-10 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="anim-shimmer h-4 w-1/2 rounded" />
                  <div className="anim-shimmer h-3 w-full rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="anim-pop-in rounded-2xl bg-white p-8 text-center">
            <Bell className="mx-auto h-12 w-12 text-[#A09BA8]" />
            <p className="mt-3 text-sm text-[#6F6B76]">No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n, index) => (
              <div
                key={n.id}
                className="anim-fade-up rounded-2xl border border-[#E9E5EE] bg-white p-4 transition-all duration-200 hover:-translate-y-0.5"
                style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFC107] shrink-0">
                    <Bell className="h-5 w-5 text-[#3E2679]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#211F26]">{n.title}</h3>
                    <p className="mt-1 text-sm text-[#6F6B76] whitespace-pre-wrap">{n.body}</p>
                    <p className="mt-2 flex items-center gap-1 text-[10px] text-[#A09BA8]">
                      <Clock className="h-3 w-3" /> {formatDate(n.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationsPage
