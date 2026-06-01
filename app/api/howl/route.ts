import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { country, color_code, character, held_duration, session_id } = body;
    const supabase = getSupabase();

    if (!supabase) {
      return NextResponse.json({ success: true, mock: true });
    }

    const { data, error } = await supabase
      .from('howls')
      .insert({
        country: country || 'Unknown',
        color_code: color_code || '#7F77DD',
        character: character || 'ZOHAR',
        held_duration: held_duration || 1000,
        session_id: session_id || null,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: true, mock: true });
    }
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: true, mock: true });
  }
}

export async function GET() {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ howls: getMockHowls(), total: 47 });
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('howls')
      .select('*')
      .gte('timestamp', twentyFourHoursAgo)
      .order('timestamp', { ascending: false })
      .limit(200);

    if (error || !data) {
      return NextResponse.json({ howls: getMockHowls(), total: 47 });
    }
    return NextResponse.json({ howls: data, total: data.length });
  } catch {
    return NextResponse.json({ howls: getMockHowls(), total: 47 });
  }
}

function getMockHowls() {
  const countries = ['JP', 'BR', 'DE', 'NG', 'IN', 'TH', 'MX', 'KR', 'FR', 'AU'];
  const colors = ['#7F77DD', '#EF9F27', '#1D9E75', '#C0522A', '#2D4A9A', '#ED93B1'];
  const characters = ['AMBER', 'INDIGO', 'RUST', 'SAGE'];
  return Array.from({ length: 12 }, (_, i) => ({
    id: `mock-${i}`,
    country: countries[i % countries.length],
    color_code: colors[i % colors.length],
    character: characters[i % characters.length],
    held_duration: 1000 + Math.random() * 3000,
    timestamp: new Date(Date.now() - Math.random() * 20 * 60 * 60 * 1000).toISOString(),
    session_id: null,
  }));
}
