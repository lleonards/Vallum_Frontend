import React from 'react';

// The exact Vellum logo - open book forming a V shape
const VellumLogo = ({ size = 36, showText = true, className = '' }) => {
  return (
    <div className={`vellum-logo ${className}`} style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      textDecoration: 'none',
      userSelect: 'none'
    }}>
      {/* Logo SVG - replicating the exact Vellum book/V icon from provided image */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Outer V shape - left stroke */}
        <path
          d="M12 10 L12 20 L48 78 L52 78 L88 20 L88 10 L52 68 L48 68 Z"
          fill="currentColor"
          opacity="1"
        />
        {/* Inner book pages left */}
        <path
          d="M30 38 L48 72 L50 72 L50 56"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.7"
        />
        {/* Inner book pages right */}
        <path
          d="M70 38 L52 72 L50 72 L50 56"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.7"
        />
        {/* Book spine horizontal line */}
        <path
          d="M36 52 L64 52"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>

      {showText && (
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: size * 0.56,
          letterSpacing: '0.18em',
          color: 'currentColor',
          lineHeight: 1
        }}>
          VELLUM
        </span>
      )}
    </div>
  );
};

export default VellumLogo;
