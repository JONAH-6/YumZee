import { navigate, routes } from '@redwoodjs/router'
import {
  Bike,
  Cookie,
  CupSoda,
  Donut,
  Drumstick,
  Flame,
  Hamburger,
  Pizza,
  Popcorn,
  Sandwich,
  Timer,
} from 'lucide-react'
import { useAuth } from 'src/contexts/AuthContexts'

const TICKER = [
  { Icon: Pizza, label: 'Pizza' },
  { Icon: Hamburger, label: 'Burgers' },
  { Icon: Cookie, label: 'Cookies' },
  { Icon: Sandwich, label: 'Sandwiches' },
  { Icon: Donut, label: 'Donuts' },
  { Icon: CupSoda, label: 'Drinks' },
  { Icon: Popcorn, label: 'Popcorn' },
  { Icon: Drumstick, label: 'Chicken' },
]

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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#3E2679] px-6 text-center">
      {/* Content */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        {/* Video hero */}
        <div className="anim-pop-in relative">
          <video
            src="/f838bb38b0f04fe18b31bfc18a88b80b.webm"
            autoPlay
            loop
            muted
            playsInline
            className="anim-bounce-soft mb-1 h-60 w-80 object-contain drop-shadow-2xl"
          />
          {/* Delivery time badge */}
          <div className="anim-wiggle absolute -right-4 top-4 flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-left shadow-xl">
            <Bike size={20} className="text-[#3E2679]" />
            <div>
              <p className="flex items-center gap-1 text-[11px] font-black text-[#3E2679]">
                <Timer size={12} /> ~30 min
              </p>
              <p className="text-[10px] font-semibold text-gray-500">Fast delivery</p>
            </div>
          </div>
          {/* Hot & fresh badge */}
          <div
            className="anim-wiggle absolute -left-6 bottom-6 flex items-center gap-2 rounded-2xl bg-[#FFC107] px-3 py-2 text-left shadow-xl"
            style={{ animationDelay: '0.8s' }}
          >
            <Flame size={20} className="text-[#3E2679]" />
            <div>
              <p className="text-[11px] font-black text-[#3E2679]">Hot & fresh</p>
              <p className="text-[10px] font-semibold text-[#3E2679]/70">Straight to you</p>
            </div>
          </div>
        </div>

        {/* Brand */}
        <h1 className="anim-fade-up mt-2 text-6xl font-black tracking-tight drop-shadow-lg" style={{ animationDelay: '0.15s' }}>
          <span className="text-[#FFC107]">YUM</span>
          <span className="text-white">ZEE</span>
        </h1>

        {/* Tagline */}
        <p className="anim-fade-up mt-2 text-sm font-light tracking-wide text-white/80" style={{ animationDelay: '0.3s' }}>
          Snacks delivered fast. Cravings sorted.
        </p>

        {/* Snack ticker with real icons */}
        <div
          className="anim-fade-up mt-5 w-full max-w-xs overflow-hidden rounded-full border border-white/15 bg-white/10 py-2 backdrop-blur"
          style={{ animationDelay: '0.45s' }}
        >
          <div className="anim-marquee flex w-max items-center gap-6 whitespace-nowrap px-4 text-xs font-bold text-white/90">
            {[...TICKER, ...TICKER].map(({ Icon, label }, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <Icon size={14} className="text-[#FFC107]" />
                {label}
                <span className="ml-4 text-white/40">•</span>
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleGetStarted}
          className="mt-3 flex w-full max-w-[220px] items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-bold text-gray-800 transition hover:bg-gray-100 active:scale-95"
        >
          <svg width="30" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
            <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
          </svg>
          Continue with Google
        </button>
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 z-10 text-[10px] tracking-wider text-white/40">
        Powered by Yumzee Logistics{' '}
        <button onClick={() => navigate(routes.adminLogin())} className="text-white/40 hover:text-white/70">
          2026
        </button>
      </p>
    </div>
  )
}

export default WelcomePage
