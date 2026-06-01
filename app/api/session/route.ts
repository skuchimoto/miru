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
    const { session_id, player_color, decision, time_to_decision_ms, character_encountered } = body;
    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ success: true, mock: true });

    await supabase.from('decisions').insert({
      session_id,
      player_color,
      decision,
      time_to_decision_ms,
      character_encountered,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true, mock: true });
  }
}
