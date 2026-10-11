import { useState, useEffect } from 'react'
import { navigate, routes } from '@redwoodjs/router'
import { useAuth } from 'src/contexts/AuthContexts'
import { X } from 'lucide-react'

const SLIDES = [
  {
    image: 'welcome-image1-bgrover.png',
    title: 'Get Your Order',
    subtitle: 'Pick your favourite snacks in seconds',
  },
  {
    image: 'a8e296f6-05f7-4983-9fd3-12b4d2fecb25-removebg-preview.png',
    title: 'We Locate You',
    subtitle: 'Precise delivery to your exact doorstep',
  },
  {
    image: 'deliverd-to-owner-remove.png',
    title: 'Delivered in 20 Minutes',
    subtitle: 'Turn into a happy customer, every time',
  },
]

const WelcomePage = () => {
  const { googleSignIn } = useAuth()
  const [current, setCurrent] = useState(0)
  const [sheetOpen, setSheetOpen] = useState<null | 'signup' | 'login'>(null)

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn()
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [])

  let touchStartX = 0
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setCurrent((prev) => (prev + 1) % SLIDES.length)
      } else {
        setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)
      }
    }
  }

  return (
    // 🔥 Full-screen backdrop (centers the phone frame on desktop)
    <div className="flex h-screen w-full items-center justify-center bg-black">

      {/* 📱 Phone frame — max-w-md */}
      <div className="relative flex h-full w-full max-w-md flex-col items-center justify-center overflow-hidden bg-[#3E2679] px-6 text-center">

        {/* Slide area */}
        <div
          className="relative z-10 flex w-full max-w-sm flex-col items-center"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Images */}
          <div className="relative h-56 w-full">
            {SLIDES.map((slide, i) => (
              <img
                key={i}
                src={slide.image}
                alt={slide.title}
                className={`absolute inset-0 m-auto h-56 w-56 object-contain transition-all duration-700 ease-out ${
                  i === current
                    ? 'translate-x-0 opacity-100 scale-100'
                    : i < current
                    ? '-translate-x-full opacity-0 scale-90'
                    : 'translate-x-full opacity-0 scale-90'
                }`}
              />
            ))}
          </div>

          {/* Title + Subtitle */}
          <div className="relative mt-1 h-16 w-full overflow-hidden">
            {SLIDES.map((slide, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-all duration-700 ease-out ${
                  i === current
                    ? 'translate-x-0 opacity-100'
                    : i < current
                    ? '-translate-x-full opacity-0'
                    : 'translate-x-full opacity-0'
                }`}
              >
                <h2 className="text-2xl font-black text-[#FFC107] tracking-tight drop-shadow-lg">
                  {slide.title}
                </h2>
                <p className="mt-0.5 text-xs font-light text-white/80">
                  {slide.subtitle}
                </p>
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="mt-2 flex items-center gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? 'h-2 w-6 bg-[#FFC107]' : 'h-2 w-2 bg-white/30'
                }`}
              />
            ))}
          </div>

          {/* Brand */}
          <h1 className="mt-6 text-4xl font-black tracking-tight drop-shadow-lg">
            <span className="text-[#FFC107]">YUM</span>
            <span className="text-white">ZEE</span>
          </h1>

          <p className="mt-1 text-[10px] font-light tracking-widest text-white/60 uppercase">
            Snacks delivered fast
          </p>

          {/* Two small buttons */}
          <div className="mt-6 flex w-full gap-3">
            <button
              onClick={() => setSheetOpen('login')}
              className="flex-1 rounded-full border-2 border-white/40 bg-transparent py-3 text-sm font-bold text-white transition active:scale-95"
            >
              Log In
            </button>
            <button
              onClick={() => setSheetOpen('signup')}
              className="flex-1 rounded-full bg-[#FFC107] py-3 text-sm font-bold text-[#3E2679] transition active:scale-95"
            >
              Sign Up
            </button>
          </div>

          {/* Footer */}
          <p className="mt-4 text-[10px] tracking-wider text-white/40">
            Powered by Yumzee Logistics{' '}
            <button
              onClick={() => navigate(routes.adminLogin())}
              className="text-white/40 hover:text-white/70"
            >
              2026
            </button>
          </p>
        </div>

        {/* 🔥 BOTTOM SHEET — constrained to phone width */}
        {sheetOpen && (
          <div
            className="anim-fade-in absolute inset-0 z-50 bg-black/60"
            onClick={() => setSheetOpen(null)}
          >
            <div
              className="anim-slide-up absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white p-6 pb-10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle bar */}
              <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-gray-300" />

              {/* Close button */}
              <button
                onClick={() => setSheetOpen(null)}
                className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Title */}
              <h2 className="mt-2 text-center text-2xl font-black text-[#211F26]">
                {sheetOpen === 'signup' ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="mt-1 text-center text-sm text-[#6F6B76]">
                {sheetOpen === 'signup'
                  ? 'Sign up in one tap to start ordering'
                  : 'Log in to continue ordering your favourite snacks'}
              </p>

              {/* Continue with Google */}
              <button
                onClick={handleGoogleSignIn}
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border-2 border-gray-200 bg-white py-4 text-base font-bold text-gray-800 transition hover:bg-gray-50 active:scale-95"
              >
                <svg width="22" height="22" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                  <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                  <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                </svg>
                Continue with Google
              </button>


            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WelcomePage
