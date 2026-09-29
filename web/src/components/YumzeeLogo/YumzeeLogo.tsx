import React from 'react'

interface Props {
  size?: number
  className?: string
}

const YumzeeLogo: React.FC<Props> = ({ size = 40, className = '' }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="4" y="4" width="92" height="92" rx="24" fill="#3E2679" />
      <text x="50" y="62" fontFamily="'Arial Black', Arial, sans-serif" fontWeight="900" fontSize="50" fill="#FFC107" textAnchor="middle">Y</text>
      <path d="M 34,78 Q 50,92 66,78" stroke="#FFC107" strokeWidth="4.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export default YumzeeLogo
