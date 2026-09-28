import React, { useId } from 'react'

interface Props {
  size?: number
  className?: string
}

const YumzeeLogo: React.FC<Props> = ({ size = 40, className = '' }) => {
  const arcId = `yumzee-arc-${useId().replace(/:/g, '')}`
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* ===== TEXT ARCH PATH ===== */}
      <defs>
        <path id={arcId} d="M 22,118 Q 100,38 178,118" fill="none" />
      </defs>

      {/* ===== YUM (yellow, arched, bubbly) ===== */}
      <text
        fontFamily="'Arial Rounded MT Bold','Baloo 2','Fredoka','Nunito','Arial Black',Arial,sans-serif"
        fontWeight="900"
        fontSize="38"
        fill="#FFC107"
        letterSpacing="-1"
        stroke="#FFC107"
        strokeWidth="1.5"
        strokeLinejoin="round"
        style={{ paintOrder: 'stroke' }}
      >
        <textPath href={`#${arcId}`} xlinkHref={`#${arcId}`} startOffset="4%">
          YUM
        </textPath>
      </text>

      {/* ===== ZEE (white, arched, bubbly) ===== */}
      <text
        fontFamily="'Arial Rounded MT Bold','Baloo 2','Fredoka','Nunito','Arial Black',Arial,sans-serif"
        fontWeight="900"
        fontSize="38"
        fill="#FFFFFF"
        letterSpacing="-1"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinejoin="round"
        style={{ paintOrder: 'stroke' }}
      >
        <textPath href={`#${arcId}`} xlinkHref={`#${arcId}`} startOffset="52%">
          ZEE
        </textPath>
      </text>

      {/* ===== LEFT EYE (gentle curve) ===== */}
      <path
        d="M 58,148 Q 74,130 90,148"
        stroke="#FFC107"
        strokeWidth="8.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* ===== RIGHT EYE (gentle curve) ===== */}
      <path
        d="M 110,148 Q 126,130 142,148"
        stroke="#FFC107"
        strokeWidth="8.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* ===== TONGUE (tucked UNDER right side of smile, pointing down-right) ===== */}
      <path
        d="M 118,182 Q 133,190 148,176 Q 146,199 135,207 Q 122,201 118,182 Z"
        fill="#FFFFFF"
        stroke="#FFC107"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* ===== SMILE (big smooth arc, drawn OVER tongue top so it tucks inside) ===== */}
      <path
        d="M 46,168 Q 100,214 154,168"
        stroke="#FFC107"
        strokeWidth="11"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export default YumzeeLogo
