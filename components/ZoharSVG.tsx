'use client';

import React from 'react';

interface ZoharProps {
  size?: number;
  phase?: 'idle' | 'howling' | 'waiting' | 'reuniting';
  saturation?: number;
  className?: string;
}

export default function ZoharSVG({ 
  size = 280, 
  phase = 'idle', 
  saturation = 100, 
  className = '' 
}: ZoharProps) {
  
  const sat = saturation / 100;

  return (
    <div className={`relative mx-auto ${className}`} style={{ width: size, height: size }}>
      {/* Big Anime Glow Aura */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-400 rounded-full blur-3xl opacity-40 animate-pulse" />
      
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 200 200" 
        className="drop-shadow-[0_0_40px_rgba(255,255,255,0.5)]"
      >
        {/* Main Body - Light Base with Colorful Gradient */}
        <ellipse 
          cx="100" 
          cy="135" 
          rx="52" 
          ry="44" 
          fill="#2a1b4d" 
        />
        
        {/* Head - Light Anime Base */}
        <circle 
          cx="100" 
          cy="78" 
          r="42" 
          fill="#3b2a6b" 
        />

        {/* === MULTICOLOR ANIME PATCHES === */}
        {/* Cyan Patch */}
        <ellipse cx="72" cy="125" rx="19" ry="17" fill={`rgba(0, 245, 255, ${sat * 0.95})`} />
        {/* Magenta Patch */}
        <ellipse cx="130" cy="118" rx="20" ry="16" fill={`rgba(255, 20, 180, ${sat * 0.95})`} />
        {/* Gold/Yellow Patch */}
        <ellipse cx="75" cy="157" rx="16" ry="14" fill={`rgba(255, 220, 50, ${sat})`} />
        {/* Neon Green Patch */}
        <ellipse cx="125" cy="155" rx="15" ry="13" fill={`rgba(80, 255, 100, ${sat})`} />
        {/* Purple Accent */}
        <ellipse cx="98" cy="98" rx="12" ry="14" fill={`rgba(180, 70, 255, ${sat})`} />

        {/* Big Shiny Anime Eyes */}
        <ellipse cx="81" cy="70" rx="11" ry="13" fill="#ffffff" />
        <ellipse cx="119" cy="70" rx="11" ry="13" fill="#ffffff" />
        
        {/* Eye Color */}
        <ellipse cx="81" cy="70" rx="6" ry="8" fill="#00ddff" />
        <ellipse cx="119" cy="70" rx="6" ry="8" fill="#ff44aa" />
        
        {/* Eye Sparkles */}
        <circle cx="84" cy="66" r="3" fill="#ffffff" />
        <circle cx="122" cy="66" r="3" fill="#ffffff" />

        {/* Anime Ears */}
        <path d="M65 45 Q47 18 78 35 Z" fill="#4a2e8c" />
        <path d="M135 45 Q153 18 122 35 Z" fill="#4a2e8c" />

        {/* Tail with Color Gradient */}
        <path 
          d="M150 145 Q175 130 165 105" 
          fill="none" 
          stroke="#ff88dd" 
          strokeWidth="18" 
          strokeLinecap="round" 
        />
      </svg>
    </div>
  );
}
