import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type HowlRecord = {
  id: string;
  country: string;
  color_code: string;
  character: string;
  timestamp: string;
  held_duration: number;
  session_id?: string;
};

export type DecisionRecord = {
  id: string;
  session_id: string;
  player_color: string;
  decision: 'accept' | 'wait' | 'turn_away';
  time_to_decision_ms: number;
  timestamp: string;
};

export type SessionRecord = {
  id: string;
  players: string[];
  state: 'waiting' | 'active' | 'complete';
  heal_percent: number;
  created_at: string;
};
