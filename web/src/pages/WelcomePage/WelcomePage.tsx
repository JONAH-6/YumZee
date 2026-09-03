import React, { useState } from 'react'

import { navigate } from '@redwoodjs/router'

import { useAuth } from 'src/contexts/AuthContexts'

const WelcomePage = () => {
  const { googleSignIn } = useAuth()
  const [isSigningIn, setIsSigningIn] = useState(false)

  const handleGetStarted = async () => {
    setIsSigningIn(true)
    try {
      await googleSignIn()
      navigate('/', { replace: true })
    } catch (error) {
      console.error('Sign in failed:', error)
      setIsSigningIn(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#3E2679] px-4">
      {/* Floating circular snack image */}
      <div className="absolute top-20 h-32 w-32 overflow-hidden rounded-full border-4 border-white/20 shadow-2xl">
        <img
          src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop"
          alt="Snacks"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Logo */}
      <div className="mb-2 mt-40">
        <h1 className="text-6xl font-extrabold tracking-tight">
          <span className="text-[#FFC107]">YUM</span>
          <span className="text-white">ZEE</span>
        </h1>
      </div>

      {/* Tagline */}
      <p className="mb-8 text-lg text-white/80">
        Good Food. Right Where You Need It.
      </p>

      {/* Giant Yellow Get Started button */}
      <button
        onClick={handleGetStarted}
        disabled={isSigningIn}
        className="rounded-full bg-[#FFC107] px-12 py-4 text-xl font-bold text-[#3E2679] shadow-lg transition-colors hover:bg-[#E5A925] disabled:opacity-60"
      >
        {isSigningIn ? 'Signing in...' : 'Get Started'}
      </button>

      {/* Footer */}
      <p className="absolute bottom-6 text-xs text-white/50">
        Powered by Yumzee Campus Logistics
      </p>
    </div>
  )
}

export default WelcomePage
