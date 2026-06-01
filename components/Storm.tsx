'use client';

import React, { useEffect, useRef } from 'react';

interface StormProps {
  intensity?: number; // 0-100
}

export default function Storm({ intensity = 50 }: StormProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const count = Math.floor((intensity / 100) * 40) + 5;
    const particles: HTMLDivElement[] = [];

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      const size = Math.random() * 3 + 1;
      const opacity = Math.random() * 0.4 + 0.1;
      const duration = Math.random() * 8 + 4;
      const delay = Math.random() * duration;
      
      p.className = 'particle';
      p.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${Math.random() * 100}vw;
        bottom: -10px;
        background: rgba(200, 190, 240, ${opacity});
        animation-duration: ${duration}s;
        animation-delay: -${delay}s;
        filter: blur(${Math.random() * 1}px);
      `;
      container.appendChild(p);
      particles.push(p);
    }

    return () => {
      particles.forEach(p => p.remove());
    };
  }, [intensity]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {/* Lightning effect */}
      <div 
        className="lightning absolute inset-0"
        style={{ background: 'linear-gradient(135deg, rgba(127,119,221,0.3) 0%, transparent 70%)' }}
      />
      
      {/* Storm gradient overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, rgba(30,20,60,${intensity/200}) 0%, transparent 70%)`,
          animation: `storm-pulse ${3 + (100-intensity)/20}s ease-in-out infinite`,
        }}
      />
      
      {/* Horizon glow - faint */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '30vh',
          background: `linear-gradient(to top, rgba(127,119,221,0.05) 0%, transparent 100%)`,
        }}
      />
    </div>
  );
}
