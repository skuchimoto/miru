import { NextResponse } from 'next/server';
import { generateWorldNarrative } from '@/lib/groq';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET() {
  let howlCount = 47;
  let countries = ['JP', 'BR', 'DE', 'NG', 'TH'];
  let healPercent = 38;

  try {
    const supabase = getSupabase();
    if (supabase) {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from('howls')
        .select('country')
        .gte('timestamp', twentyFourHoursAgo);
      if (data && data.length > 0) {
        howlCount = data.length;
        countries = [...new Set(data.map((h: { country: string }) => h.country))];
        healPercent = Math.min(100, Math.round((howlCount / 50) * 100));
      }
    }
  } catch {}

  const narrative = await generateWorldNarrative(howlCount, countries, healPercent);

  return NextResponse.json({
    narrative,
    howlCount,
    countries,
    healPercent,
    worldState: healPercent > 70 ? 'healing' : healPercent > 30 ? 'fractured' : 'broken',
  });
}
