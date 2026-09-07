import { useState } from 'react'
import { navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'
import { Mail, Lock, ShieldAlert, Loader2 } from 'lucide-react'

const AdminLoginPage = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // The secret email gate
    if (email.trim().toLowerCase() === 'maziemeka6@gmail.com') {
      // Success - Go to Admin Portal
      navigate(routes.admin())
    } else {
      setError('Access Denied. Only the Admin can enter.')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-red-50 p-4">
      <Metadata title="Admin Login" />

      <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 shadow-2xl">
        {/* Logo Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600">
            <ShieldAlert className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-red-600">Admin Access</h1>
          <p className="mt-2 text-sm text-gray-500">Restricted area. Authorized personnel only.</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-300 bg-red-100 p-3 text-center text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-red-600">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-red-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email"
                required
                className="w-full rounded-xl border border-red-200 bg-red-50 py-3 pl-10 pr-4 text-sm font-medium text-gray-800 placeholder-red-300 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-black text-white transition hover:bg-red-700 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            {isLoading ? 'Checking...' : 'Unlock Dashboard'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => navigate(routes.home())} className="text-xs font-bold text-gray-400 hover:text-red-600">
            ← Back to Store
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginPage
