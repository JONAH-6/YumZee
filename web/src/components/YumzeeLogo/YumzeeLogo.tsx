import React from 'react'

interface Props {
  size?: number
  className?: string
}

const YumzeeLogo: React.FC<Props> = ({ size = 40, className = '' }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="50" cy="50" r="46" fill="#FFC107" />
      <text x="50" y="62" fontFamily="'Arial Black', Arial, sans-serif" fontWeight="900" fontSize="50" fill="#3E2679" textAnchor="middle">Y</text>
      <path d="M 34,76 Q 50,90 66,76" stroke="#3E2679" strokeWidth="4.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export default YumzeeLogo
