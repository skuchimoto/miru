'use client';

import dynamic from 'next/dynamic';

const MiruGame = dynamic(() => import('@/components/MiruGame'), { ssr: false });

export default function Home() {
  return <MiruGame />;
}
