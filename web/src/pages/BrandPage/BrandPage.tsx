import { navigate, routes } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'
import { ChevronLeft } from 'lucide-react'
import YumzeeLogo from 'src/components/YumzeeLogo/YumzeeLogo'

const BrandPage = () => {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-[#3E2679] font-sans">
      <Metadata title="YumZee Brand" />

      <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-white/10 bg-[#3E2679] p-4 text-white">
        <button
          onClick={() => navigate(routes.home())}
          className="rounded-full p-1 hover:bg-white/10"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-bold">Brand</h1>
      </div>

      <div className="flex flex-col items-center justify-center p-10 text-center">
        {/* Big Logo */}
        <YumzeeLogo size={280} />

        <h2 className="mt-6 text-3xl font-black text-white">
          Our Brand
        </h2>
        <p className="mt-2 text-sm text-white/70 max-w-xs">
          Snacks delivered fast. Cravings sorted. Fresh, hot, and at your doorstep in minutes.
        </p>

        {/* Color Palette */}
        <div className="mt-10 w-full max-w-xs rounded-2xl bg-white/10 p-5 text-left backdrop-blur">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/60">
            Brand Colors
          </p>

          <div className="flex items-center gap-3 py-2">
            <div className="h-8 w-8 rounded-full bg-[#FFC107]" />
            <span className="text-sm font-bold text-white">#FFC107 — Primary Yellow</span>
          </div>

          <div className="flex items-center gap-3 py-2">
            <div className="h-8 w-8 rounded-full bg-[#3E2679]" />
            <span className="text-sm font-bold text-white">#3E2679 — Deep Purple</span>
          </div>

          <div className="flex items-center gap-3 py-2">
            <div className="h-8 w-8 rounded-full bg-[#FFF9E5]" />
            <span className="text-sm font-bold text-white">#FFF9E5 — Cream</span>
          </div>
        </div>

        <p className="mt-8 text-[10px] tracking-wider text-white/40">
          Powered by Yumzee Logistics 2026
        </p>
      </div>
    </div>
  )
}

export default BrandPage
