import React from 'react'

interface Props {
  size?: number
  className?: string
}

const YumzeeLogo: React.FC<Props> = ({ size = 40, className = '' }) => {
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
        <path
          id="textArc"
          d="M 22,118 Q 100,38 178,118"
          fill="none"
        />
      </defs>

      {/* ===== YUM (yellow, arched) ===== */}
      <text
        fontFamily="'Arial Black', Arial, Helvetica, sans-serif"
        fontWeight="900"
        fontSize="40"
        fill="#FFC107"
        letterSpacing="-2"
      >
        <textPath href="#textArc" startOffset="2%">
          YUM
        </textPath>
      </text>

      {/* ===== ZEE (white, arched) ===== */}
      <text
        fontFamily="'Arial Black', Arial, Helvetica, sans-serif"
        fontWeight="900"
        fontSize="40"
        fill="#FFFFFF"
        letterSpacing="-2"
      >
        <textPath href="#textArc" startOffset="53%">
          ZEE
        </textPath>
      </text>

      {/* ===== LEFT EYE (curved ^) ===== */}
      <path
        d="M 62,152 Q 78,134 94,152"
        stroke="#FFC107"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />

      {/* ===== RIGHT EYE (curved ^) ===== */}
      <path
        d="M 106,152 Q 122,134 138,152"
        stroke="#FFC107"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />

      {/* ===== TONGUE (rounded blob tucked under center of smile) ===== */}
      <path
        d="M 88,186 Q 100,194 112,186 Q 110,208 100,208 Q 90,208 88,186 Z"
        fill="#FFFFFF"
      />

      {/* ===== SMILE (big arc, drawn over tongue so it peeks from inside) ===== */}
      <path
        d="M 48,170 Q 100,212 152,170"
        stroke="#FFC107"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export default YumzeeLogo
