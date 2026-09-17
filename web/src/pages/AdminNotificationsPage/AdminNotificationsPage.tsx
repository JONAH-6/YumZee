import { useState, useEffect } from 'react'
import { navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'
import { db } from 'src/lib/firebase'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore'
import {
  ArrowLeft,
  Send,
  Bell,
  Loader2,
  CheckCircle2,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react'

const AdminNotificationsPage = () => {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'notifications'), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[]
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      setNotifications(data)
    })
    return () => unsub()
  }, [])

  // Add or Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    setSending(true)
    try {
      if (editingId) {
        // UPDATE
        await updateDoc(doc(db, 'notifications', editingId), {
          title: title.trim(),
          body: body.trim(),
        })
        setEditingId(null)
      } else {
        // ADD
        await addDoc(collection(db, 'notifications'), {
          title: title.trim(),
          body: body.trim(),
          createdAt: serverTimestamp(),
        })
      }
      setTitle('')
      setBody('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const handleEditClick = (n: any) => {
    setEditingId(n.id)
    setTitle(n.title || '')
    setBody(n.body || '')
    setOpenMenuId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this notification?')) return
    try {
      await deleteDoc(doc(db, 'notifications', id))
      setOpenMenuId(null)
    } catch (err) {
      console.error(err)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setTitle('')
    setBody('')
  }

  const formatDate = (ts: any) => {
    if (!ts) return 'Just now'
    const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts)
    return date.toLocaleString()
  }

  return (
    <div className="min-h-screen bg-red-50">
      <Metadata title="Admin Notifications" />
      <header className="bg-red-600 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(routes.admin())}
              className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-bold hover:bg-white/30"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <h1 className="text-2xl font-black">Notifications</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="rounded-2xl bg-red-600 p-6 text-white">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black">
              <Bell className="h-5 w-5" />
              {editingId ? 'Edit Notification' : 'Send Notification'}
            </h2>
            {success && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-white p-3 text-red-600">
                <CheckCircle2 className="h-5 w-5" /> Success!
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Notification Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-lg border border-red-300 bg-white px-4 py-2 text-sm text-gray-800 placeholder-red-300"
              />
              <textarea
                placeholder="Type your message..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                required
                className="w-full rounded-lg border border-red-300 bg-white px-4 py-2 text-sm text-gray-800 placeholder-red-300"
              />
              <button
                type="submit"
                disabled={sending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-3 text-sm font-black text-red-600 hover:bg-red-100 disabled:opacity-50"
              >
                {sending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : editingId ? (
                  <Pencil className="h-5 w-5" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
                {sending ? 'Saving...' : editingId ? 'Update' : 'Send to All Users'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="w-full rounded-lg bg-red-800 py-3 text-sm font-bold text-white hover:bg-red-700"
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>

          {/* Sent List */}
          <div className="lg:col-span-2 rounded-2xl bg-white p-6 border border-red-100">
            <h2 className="mb-4 text-xl font-black text-red-600">
              Sent Notifications ({notifications.length})
            </h2>
            {notifications.length === 0 ? (
              <p className="py-8 text-center text-gray-400">No notifications sent yet...</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="relative rounded-xl border border-red-100 p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800">{n.title}</p>
                        <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">
                          {n.body}
                        </p>
                        <p className="mt-2 text-xs text-gray-400">
                          {formatDate(n.createdAt)}
                        </p>
                      </div>

                      {/* 3-Dot Menu */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenMenuId(openMenuId === n.id ? null : n.id)
                          }
                          className="rounded-full p-2 text-gray-400 hover:bg-red-50"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>

                        {openMenuId === n.id && (
                          <div className="absolute right-0 top-8 z-10 w-32 rounded-lg border border-red-200 bg-white p-1">
                            <button
                              onClick={() => handleEditClick(n)}
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-bold text-gray-700 hover:bg-red-50"
                            >
                              <Pencil className="h-4 w-4 text-red-600" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(n.id)}
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </button>
                          </div>
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
    </div>
  )
}

export default AdminNotificationsPage
