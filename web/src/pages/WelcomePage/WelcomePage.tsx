import { navigate, routes } from '@redwoodjs/router'
import { useAuth } from 'src/contexts/AuthContexts'

const WelcomePage = () => {
  const { googleSignIn } = useAuth()

  const handleGetStarted = async () => {
    try {
      await googleSignIn()
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#3E2679] px-8 text-center">

      {/* Video - wider now */}
      <video
        src="/f838bb38b0f04fe18b31bfc18a88b80b.webm"
        autoPlay
        loop
        muted
        playsInline
        className="mb-2 h-64 w-80 object-contain"
        style={{ mixBlendMode: 'multiply' }}
      />

      {/* Brand Name */}
      <h1 className="text-5xl font-black tracking-tight">
        <span className="text-[#FFC107]">YUM</span>
        <span className="text-white">ZEE</span>
      </h1>

      {/* Tagline */}
      <p className="mt-2 text-sm font-light tracking-wide text-white/70">
        Snacks delivered fast.
      </p>

      {/* Continue with Google Button */}
      <button
        onClick={handleGetStarted}
        className="mt-10 flex w-full max-w-xs items-center justify-center gap-3 rounded-full bg-white py-4 text-base font-bold text-gray-800 transition hover:bg-gray-100 active:scale-95"
      >
        {/* Official Google "G" Logo */}
        <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
          <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
          <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
          <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
        </svg>
        Continue with Google
      </button>

      {/* Hidden Admin Link */}
      <p className="absolute bottom-6 text-[10px] tracking-wider text-white/30">
        Powered by Yumzee Logistics{' '}
        <button
          onClick={() => navigate(routes.adminLogin())}
          className="text-white/30 hover:text-white/60"
        >
          2026
        </button>
      </p>
    </div>
  )
}

export default WelcomePage
