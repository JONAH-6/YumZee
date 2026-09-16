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
    <div className="relative flex min-h-screen flex-col items-center justify-between bg-[#3E2679] p-8 text-center">

      {/* Top Spacer for centering */}
      <div className="flex-1" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Image */}
        <img
          src="/welcome-image1-bgrover.png"
          alt="YumZee"
          className="mb-6 h-56 w-56 object-contain"
        />

        {/* Brand Name */}
        <h1 className="text-5xl font-black tracking-tight">
          <span className="text-[#FFC107]">YUM</span>
          <span className="text-white">ZEE</span>
        </h1>

        {/* Tagline */}
        <p className="mt-3 text-sm font-light tracking-wide text-white/70">
          Snacks delivered fast.
        </p>
      </div>

      {/* Bottom Section */}
      <div className="relative z-10 w-full max-w-xs flex-1 flex flex-col justify-end">

        {/* Get Started Button */}
        <button
          onClick={handleGetStarted}
          className="w-full rounded-full bg-[#FFC107] py-4 text-base font-bold text-[#3E2679] transition hover:bg-[#FFD54F] active:scale-95"
        >
          Get Started
        </button>

        {/* Hidden Admin Link */}
        <p className="mt-8 text-[10px] tracking-wider text-white/30">
          Powered by Yumzee Logistics{' '}
          <button
            onClick={() => navigate(routes.adminLogin())}
            className="text-white/30 hover:text-white/60"
          >
            2026
          </button>
        </p>
      </div>
    </div>
  )
}

export default WelcomePage
