'use client';

import React from 'react';

interface BloomProps {
  color: string;
  x: number;
  y: number;
  country: string;
  character: string;
  delay?: number;
  size?: number;
}

export default function Bloom({ color, x, y, country, character, delay = 0, size = 48 }: BloomProps) {
  return (
    <div
      className="absolute bloom-enter bloom-float pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        animationDelay: `${delay}ms, ${delay + 500}ms`,
        zIndex: 10,
      }}
    >
      {/* Bloom SVG */}
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id={`bloom-glow-${x}-${y}`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Outer petals */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <ellipse
            key={i}
            cx={24 + Math.cos((angle * Math.PI) / 180) * 12}
            cy={24 + Math.sin((angle * Math.PI) / 180) * 12}
            rx="5"
            ry="8"
            fill={color}
            opacity="0.6"
            transform={`rotate(${angle}, ${24 + Math.cos((angle * Math.PI) / 180) * 12}, ${24 + Math.sin((angle * Math.PI) / 180) * 12})`}
          />
        ))}
        
        {/* Inner petals */}
        {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((angle, i) => (
          <ellipse
            key={i}
            cx={24 + Math.cos((angle * Math.PI) / 180) * 7}
            cy={24 + Math.sin((angle * Math.PI) / 180) * 7}
            rx="4"
            ry="6"
            fill={color}
            opacity="0.8"
            transform={`rotate(${angle}, ${24 + Math.cos((angle * Math.PI) / 180) * 7}, ${24 + Math.sin((angle * Math.PI) / 180) * 7})`}
          />
        ))}
        
        {/* Center */}
        <circle cx="24" cy="24" r="7" fill={color} filter={`url(#bloom-glow-${x}-${y})`}/>
        <circle cx="24" cy="24" r="4" fill="white" opacity="0.3"/>
        
        {/* Glow aura */}
        <circle cx="24" cy="24" r="20" fill={color} opacity="0.08"/>
      </svg>
      
      {/* Country + character label */}
      <div 
        className="absolute text-center pointer-events-none"
        style={{ 
          top: '100%', 
          left: '50%', 
          transform: 'translateX(-50%)',
          marginTop: '4px',
        }}
      >
        <div 
          className="text-xs font-display px-2 py-0.5 rounded-full whitespace-nowrap"
          style={{ 
            background: `${color}22`,
            border: `1px solid ${color}44`,
            color: color,
            fontSize: '9px',
            letterSpacing: '0.05em',
          }}
        >
          {country} · {character}
        </div>
      </div>
    </div>
  );
}
