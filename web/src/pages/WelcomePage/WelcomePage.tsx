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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#3E2679] p-6 text-center">
      <div className="mb-8 h-48 w-48 overflow-hidden rounded-full border-4 border-white/20">
        <img src="/snacks.jpg" alt="Snacks" className="h-full w-full object-cover" />
      </div>

      <h1 className="text-4xl font-black tracking-tight">
        <span className="text-[#FFC107]">YUM</span>
        <span className="text-white">ZEE</span>
      </h1>
      <p className="mt-2 text-white/80">Good Food. Right Where You Need It.</p>

      <button
        onClick={handleGetStarted}
        className="mt-8 w-full max-w-xs rounded-full bg-[#FFC107] py-4 text-lg font-bold text-black shadow-lg transition hover:bg-yellow-400"
      >
        Get Started
      </button>

      {/* Hidden Admin Link */}
      <p className="absolute bottom-6 text-xs text-white/50">
        Powered by Yumzee Campus Logistics{' '}
        <button
          onClick={() => navigate(routes.adminLogin())}
          className="text-white/50 hover:text-white"
        >
          2026
        </button>
      </p>
    </div>
  )
}

export default WelcomePage
