-- Run this in your Supabase SQL Editor

-- Howls table: stores every player howl
CREATE TABLE IF NOT EXISTS howls (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  country text NOT NULL DEFAULT 'Unknown',
  color_code text NOT NULL DEFAULT '#7F77DD',
  character text NOT NULL DEFAULT 'ZOHAR',
  held_duration integer NOT NULL DEFAULT 1000,
  session_id text,
  timestamp timestamptz NOT NULL DEFAULT now()
);

-- Decisions table: tracks accept/wait/turn_away choices
CREATE TABLE IF NOT EXISTS decisions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,
  player_color text NOT NULL,
  decision text NOT NULL CHECK (decision IN ('accept', 'wait', 'turn_away')),
  time_to_decision_ms integer NOT NULL,
  character_encountered text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security (allow public reads/writes for game data)
ALTER TABLE howls ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;

-- Public read policy
CREATE POLICY "howls_public_read" ON howls FOR SELECT USING (true);
CREATE POLICY "howls_public_insert" ON howls FOR INSERT WITH CHECK (true);
CREATE POLICY "decisions_public_insert" ON decisions FOR INSERT WITH CHECK (true);

-- Index for fast time-range queries
CREATE INDEX IF NOT EXISTS howls_timestamp_idx ON howls(timestamp DESC);
