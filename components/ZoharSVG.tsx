'use client';

import React from 'react';

interface ZoharProps {
  size?: number;
  phase?: 'idle' | 'howling' | 'waiting' | 'reuniting';
  saturation?: number; // 0-100
  className?: string;
}

export default function ZoharSVG({ size = 200, phase = 'idle', saturation = 100, className = '' }: ZoharProps) {
  const sat = saturation / 100;
  
  // Desaturate colors based on world state
  const violet = sat > 0.5 ? '#7F77DD' : `hsl(243, ${Math.round(sat * 52)}%, ${Math.round(50 + (1-sat)*20)}%)`;
  const amber = sat > 0.5 ? '#EF9F27' : `hsl(38, ${Math.round(sat * 85)}%, ${Math.round(55 + (1-sat)*20)}%)`;
  const teal = sat > 0.5 ? '#1D9E75' : `hsl(160, ${Math.round(sat * 68)}%, ${Math.round(37 + (1-sat)*20)}%)`;
  const rose = sat > 0.5 ? '#ED93B1' : `hsl(337, ${Math.round(sat * 60)}%, ${Math.round(75 + (1-sat)*10)}%)`;
  const bodyBase = sat > 0.3 ? '#2A2A3A' : '#1A1A22';
  
  const headTilt = phase === 'howling' ? -25 : phase === 'waiting' ? 5 : 0;
  const tailWag = phase === 'reuniting' ? 'animate-bounce' : '';
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${sat < 0.5 ? '' : 'coat-shimmer'}`}
      style={{ filter: `saturate(${0.3 + sat * 0.7})` }}
    >
      <defs>
        <filter id="glow-zohar">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="soft-shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.4"/>
        </filter>
      </defs>

      <g style={{ transform: `rotate(${headTilt}deg)`, transformOrigin: '100px 90px', transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
        {/* Body */}
        <ellipse cx="100" cy="155" rx="45" ry="38" fill={bodyBase} filter="url(#soft-shadow)"/>
        
        {/* Coat patches on body */}
        <ellipse cx="82" cy="148" rx="16" ry="12" fill={violet} opacity="0.9"/>
        <ellipse cx="115" cy="152" rx="14" ry="10" fill={amber} opacity="0.85"/>
        <ellipse cx="95" cy="165" rx="12" ry="9" fill={teal} opacity="0.8"/>
        <ellipse cx="108" cy="143" rx="10" ry="8" fill={rose} opacity="0.75"/>
        
        {/* Front legs */}
        <rect x="75" y="178" width="16" height="30" rx="8" fill={bodyBase}/>
        <rect x="109" y="178" width="16" height="30" rx="8" fill={bodyBase}/>
        <ellipse cx="83" cy="208" rx="10" ry="5" fill="#1A1A22"/>
        <ellipse cx="117" cy="208" rx="10" ry="5" fill="#1A1A22"/>
        
        {/* Back legs peeking */}
        <rect x="62" y="170" width="15" height="25" rx="7" fill={bodyBase} opacity="0.7"/>
        <rect x="123" y="170" width="15" height="25" rx="7" fill={bodyBase} opacity="0.7"/>
        
        {/* Tail */}
        <path
          d={phase === 'reuniting' ? "M145 158 Q168 140 162 125 Q158 112 150 120" : "M145 158 Q165 145 160 130 Q155 118 148 125"}
          stroke={amber}
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          style={{ transition: 'all 0.5s ease' }}
        />
        
        {/* Neck */}
        <ellipse cx="100" cy="125" rx="22" ry="16" fill={bodyBase}/>
        <ellipse cx="92" cy="122" rx="10" ry="8" fill={violet} opacity="0.7"/>
        
        {/* Head */}
        <ellipse cx="100" cy="95" rx="32" ry="28" fill={bodyBase} filter="url(#soft-shadow)"/>
        
        {/* Head coat patches */}
        <ellipse cx="88" cy="88" rx="14" ry="11" fill={amber} opacity="0.8"/>
        <ellipse cx="112" cy="92" rx="12" ry="10" fill={violet} opacity="0.75"/>
        <ellipse cx="100" cy="102" rx="10" ry="8" fill={rose} opacity="0.6"/>
        
        {/* Ears */}
        {/* Left ear - upright */}
        <path d="M72 78 Q62 52 72 48 Q82 44 84 72" fill={bodyBase}/>
        <path d="M73 76 Q65 55 73 52 Q80 48 82 70" fill={violet} opacity="0.6"/>
        
        {/* Right ear - folded gently */}
        <path d="M128 76 Q140 58 136 50 Q128 44 122 60 Q118 72 124 78" fill={bodyBase}/>
        <path d="M127 74 Q137 60 133 53 Q127 47 122 62 Q119 71 125 76" fill={amber} opacity="0.6"/>
        
        {/* Snout */}
        <ellipse cx="100" cy="108" rx="14" ry="10" fill="#1E1E2E"/>
        <ellipse cx="100" cy="106" rx="12" ry="8" fill="#252535"/>
        
        {/* Nose */}
        <ellipse cx="100" cy="103" rx="7" ry="5" fill="#111118"/>
        <ellipse cx="98" cy="101" rx="2" ry="1.5" fill="rgba(255,255,255,0.3)"/>
        
        {/* Mouth - slight open on howl */}
        {phase === 'howling' ? (
          <>
            <path d="M93 110 Q100 116 107 110" stroke="#666" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <ellipse cx="100" cy="113" rx="5" ry="4" fill="#0A0A10"/>
          </>
        ) : (
          <path d="M93 110 Q100 114 107 110" stroke="#555" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        )}
        
        {/* Eyes */}
        {/* Left eye */}
        <ellipse cx="87" cy="90" rx="8" ry="7" fill="#0A0A12"/>
        <ellipse cx="87" cy="90" rx="6" ry="5.5" fill="#C4881A"/>
        <ellipse cx="87" cy="90" rx="4" ry="4" fill="#0A0A12"/>
        <ellipse cx="85.5" cy="88.5" rx="1.5" ry="1.5" fill="rgba(255,255,255,0.6)"/>
        
        {/* Right eye */}
        <ellipse cx="113" cy="90" rx="8" ry="7" fill="#0A0A12"/>
        <ellipse cx="113" cy="90" rx="6" ry="5.5" fill="#C4881A"/>
        <ellipse cx="113" cy="90" rx="4" ry="4" fill="#0A0A12"/>
        <ellipse cx="111.5" cy="88.5" rx="1.5" ry="1.5" fill="rgba(255,255,255,0.6)"/>
        
        {/* Eye line on howl - closed slightly */}
        {phase === 'howling' && (
          <>
            <path d="M80 87 Q87 84 94 87" stroke="#1A1A2A" strokeWidth="2" fill="none"/>
            <path d="M106 87 Q113 84 120 87" stroke="#1A1A2A" strokeWidth="2" fill="none"/>
          </>
        )}
        
        {/* Forehead marking */}
        <path d="M96 72 Q100 66 104 72" stroke={teal} strokeWidth="2" fill="none" opacity="0.5" strokeLinecap="round"/>
      </g>
      
      {/* Ground shadow */}
      <ellipse cx="100" cy="215" rx="40" ry="6" fill="#000" opacity="0.3"/>
    </svg>
  );
}
