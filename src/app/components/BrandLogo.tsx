// Canonical brand mark — identical to /app/icon.svg (the single shared logo
// across services, mi-cv and blog): rounded "cosmos" square with a gold->orange
// ->teal lemniscate (figure-eight) and orbiting bodies.
// DO NOT replace with a monogram, initials or any other mark.
import React from 'react';

interface BrandLogoProps {
  size?: number;
  className?: string;
  title?: string;
}

export default function BrandLogo({
  size = 30,
  className,
  title = 'Steven Vallejo',
}: BrandLogoProps) {
  // useId() is stable across SSR/CSR and unique per instance — do NOT mix in a
  // module-level mutable counter, which increments differently on server vs
  // client and causes a hydration id mismatch.
  const id = React.useId().replace(/:/g, '');
  const sig = `sv-sig-${id}`;
  const cosmos = `sv-cosmos-${id}`;
  const core = `sv-core-${id}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label={title}
      className={className}
    >
      <defs>
        <linearGradient
          id={sig}
          x1="12"
          y1="16"
          x2="52"
          y2="50"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#e0a85e" />
          <stop offset="0.35" stopColor="#cf6a3c" />
          <stop offset="1" stopColor="#43b5a6" />
        </linearGradient>
        <radialGradient id={cosmos} cx="0.32" cy="0.26" r="0.95">
          <stop offset="0" stopColor="#0f1c20" />
          <stop offset="0.55" stopColor="#0b1417" />
          <stop offset="1" stopColor="#091012" />
        </radialGradient>
        <radialGradient id={core} cx="0.5" cy="0.42" r="0.6">
          <stop offset="0" stopColor="#f0c887" />
          <stop offset="1" stopColor="#e0a85e" />
        </radialGradient>
      </defs>

      <rect x="2" y="2" width="60" height="60" rx="15" fill={`url(#${cosmos})`} />
      <rect
        x="2.5"
        y="2.5"
        width="59"
        height="59"
        rx="14.5"
        fill="none"
        stroke="#43b5a6"
        strokeOpacity="0.22"
        strokeWidth="1"
      />

      <circle cx="14" cy="14" r="0.9" fill="#f3ece0" fillOpacity="0.55" />
      <circle cx="50" cy="13" r="0.7" fill="#8d7cc0" fillOpacity="0.75" />
      <circle cx="51" cy="49" r="0.7" fill="#6fd3c4" fillOpacity="0.55" />
      <circle cx="13" cy="50" r="0.6" fill="#f3ece0" fillOpacity="0.40" />

      <path
        d="M32 32
           C 24 22, 14 24, 14 32
           C 14 40, 24 42, 32 32
           C 40 22, 50 24, 50 32
           C 50 40, 40 42, 32 32 Z"
        fill="none"
        stroke={`url(#${sig})`}
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="50" cy="32" r="2.6" fill="#6fd3c4" />
      <circle cx="14" cy="32" r="2.1" fill="#cf6a3c" />

      <circle cx="32" cy="32" r="3" fill={`url(#${core})`} />
      <circle
        cx="32"
        cy="32"
        r="6"
        fill="none"
        stroke="#f0c887"
        strokeOpacity="0.30"
        strokeWidth="1"
      />
    </svg>
  );
}
