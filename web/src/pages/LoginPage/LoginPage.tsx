// web/src/pages/LoginPage/LoginPage.tsx
import { useState, useEffect } from 'react'

import { Link, routes, navigate } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'

import { useAuth } from 'src/contexts/AuthContexts'

// Custom Google SVG icon
const GoogleIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
)

const LoginPage = () => {
  const { googleSignIn, isAuthenticated, loading } = useAuth()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(routes.home(), { replace: true })
    }
  }, [isAuthenticated, loading])

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true)
      setErrorMessage(null)
      const signedInUser = await googleSignIn()
      if (signedInUser) {
        navigate(routes.home(), { replace: true })
      }
    } catch (error: unknown) {
      console.error('Google sign-in error:', error)
      const err = error as { code?: string }
      if (
        err?.code !== 'auth/popup-closed-by-user' &&
        err?.code !== 'auth/cancelled-popup-request'
      ) {
        setErrorMessage('Sign in failed. Please try again.')
      }
    } finally {
      setIsSigningIn(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-white md:flex-row">
      <Metadata title="Login" description="Sign in to Yumzee" />

      {/* Left side - Branding */}
      <div className="relative flex min-h-[240px] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#4B2E83] via-[#3A2366] to-[#2A1A4E] p-8 text-white md:min-h-screen md:w-1/2 md:p-12">
        <div className="relative z-10 flex w-full flex-col items-center text-center">
          <Link
            to={routes.home()}
            className="mb-4 inline-block transition hover:opacity-90"
          >
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
              <span className="text-white">YUM</span>
              <span className="text-[#FFC928]">ZEE</span>
            </h1>
          </Link>
          <p className="mb-6 max-w-sm text-base font-light text-white/80 md:text-lg">
            Good Food. Right Where You Need It.
          </p>

          <div className="hidden w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 shadow-2xl sm:block">
            <img
              src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop"
              alt="Delicious Snacks"
              className="h-48 w-full object-cover md:h-56"
            />
          </div>
        </div>
      </div>

      {/* Right side - Sign In Action */}
      <div className="flex min-h-[calc(100vh-240px)] items-center justify-center p-6 md:min-h-screen md:w-1/2 md:p-12">
        <div className="w-full max-w-sm text-center">
          <div className="mb-8">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5F1FB] text-[#4B2E83] shadow-sm">
              <span className="text-2xl">🍔</span>
            </div>
            <h2 className="text-xl font-bold text-[#211F26]">Welcome Back</h2>
            <p className="mt-2 text-xs text-[#6F6B76]">Sign in to order and track.</p>
          </div>

          {errorMessage && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSigningIn || (loading && isAuthenticated)}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#DADCE0] bg-white px-6 py-3 shadow-sm transition hover:border-[#4B2E83] hover:bg-[#F8F9FA] focus:outline-none focus:ring-2 focus:ring-[#4B2E83]/30 active:scale-[0.99] disabled:opacity-60"
          >
            {isSigningIn ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#4B2E83] border-t-transparent"></div>
            ) : (
              <GoogleIcon />
            )}
            <span className="text-sm font-semibold text-[#3C4043]">
              {isSigningIn ? 'Signing in...' : 'Continue with Google'}
            </span>
          </button>

          <div className="mt-8 text-xs leading-relaxed text-[#6F6B76]">
            By continuing you agree to YumZee&apos;s{' '}
            <Link
              to={routes.home()}
              className="font-medium text-[#4B2E83] hover:underline"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              to={routes.home()}
              className="font-medium text-[#4B2E83] hover:underline"
            >
              Privacy Policy
            </Link>
          </div>

          <div className="mt-6 border-t border-[#E9E5EE] pt-6">
            <Link
              to={routes.home()}
              className="inline-flex items-center gap-1 text-sm font-medium text-[#4B2E83] transition hover:text-[#3A2366]"
            >
              ← Back to Explore Menu
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
