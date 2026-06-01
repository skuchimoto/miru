'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ZoharSVG from '@/components/ZoharSVG';
import Bloom from '@/components/Bloom';
import Storm from '@/components/Storm';

interface HowlData {
  id: string;
  country: string;
  color_code: string;
  character: string;
  held_duration: number;
  timestamp: string;
}

interface EncounterChar {
  name: string;
  color: string;
  country: string;
  description: string;
}

type GamePhase = 'landing' | 'world' | 'encounter' | 'decision_made' | 'pack_moment' | 'end_card';

const CHARACTERS: Record<string, { color: string; description: string; arc: string }> = {
  AMBER:  { color: '#EF9F27', description: 'Your eldest. Strong jaw, healed scar on her left ear. She was the first to look away.', arc: 'The hardest rejection. The most powerful reunion.' },
  INDIGO: { color: '#2D4A9A', description: 'The middle one. Fast, slender. Never openly rejected ZOHAR — but never defended him either.', arc: 'The bystander chose silence. The world does not forget.' },
  RUST:   { color: '#C0522A', description: 'Smallest. Brick-red coat. Wide eyes performing confidence they do not feel.', arc: 'He was afraid, and being afraid was his whole reason.' },
  SAGE:   { color: '#1D9E75', description: 'The mother. Forest green. She never left — she was simply lost in grief.', arc: 'Her grief is the weather. Find her and the storm halves.' },
};

const COUNTRY_FLAGS: Record<string, string> = {
  JP: '🇯🇵', BR: '🇧🇷', DE: '🇩🇪', NG: '🇳🇬', IN: '🇮🇳',
  TH: '🇹🇭', MX: '🇲🇽', KR: '🇰🇷', FR: '🇫🇷', AU: '🇦🇺',
  US: '🇺🇸', GB: '🇬🇧', ES: '🇪🇸', IT: '🇮🇹', CN: '🇨🇳',
};

function getFlag(code: string) {
  return COUNTRY_FLAGS[code] || '🌍';
}

function bloomPosition(country: string, index: number): { x: number; y: number } {
  let hash = 0;
  for (const ch of country + index) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff;
  return {
    x: 5 + ((Math.abs(hash) % 1000) / 1000) * 90,
    y: 10 + ((Math.abs(hash >> 8) % 1000) / 1000) * 75,
  };
}

export default function MiruGame() {
  const [phase, setPhase] = useState<GamePhase>('landing');
  const [zoharPhase, setZoharPhase] = useState<'idle' | 'howling' | 'waiting' | 'reuniting'>('idle');
  const [worldSat, setWorldSat] = useState(0);
  const [howling, setHowling] = useState(false);
  const [howlProgress, setHowlProgress] = useState(0);
  const [howlWaves, setHowlWaves] = useState<number[]>([]);
  const [blooms, setBlooms] = useState<HowlData[]>([]);
  const [worldState, setWorldState] = useState({ narrative: 'The Fold holds its breath...', howlCount: 0, healPercent: 0, worldState: 'broken' });
  const [encounter, setEncounter] = useState<EncounterChar | null>(null);
  const [decisionResult, setDecisionResult] = useState<'accept' | 'wait' | 'turn_away' | null>(null);
  const [decisionStart, setDecisionStart] = useState(0);
  const [sightScore, setSightScore] = useState(100);
  const [totalDecisions, setTotalDecisions] = useState(0);
  const [acceptCount, setAcceptCount] = useState(0);
  const [screenFlash, setScreenFlash] = useState<string | null>(null);
  const [packMomentChar, setPackMomentChar] = useState<string>('');
  const [showNarrator, setShowNarrator] = useState(false);
  const [narLoaded, setNarLoaded] = useState(false);
  const myColor = '#7F77DD';

  const howlTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const howlStartRef = useRef(0);
  const encounterQueue = useRef(['AMBER', 'INDIGO', 'RUST', 'SAGE']);
  const encounterIndex = useRef(0);
  const encounterQueued = useRef(false);

  useEffect(() => {
    if (phase === 'world' && !narLoaded) {
      setNarLoaded(true);
      fetchWorldState();
      fetchBlooms();
      setTimeout(() => setShowNarrator(true), 1000);
      if (!encounterQueued.current) {
        encounterQueued.current = true;
        setTimeout(() => triggerEncounter(), 7000);
      }
    }
  }, [phase, narLoaded]);

  async function fetchWorldState() {
    try {
      const res = await fetch('/api/world-state');
      const data = await res.json();
      setWorldState(data);
      setWorldSat(prev => Math.max(prev, data.healPercent || 0));
    } catch {}
  }

  async function fetchBlooms() {
    try {
      const res = await fetch('/api/howl');
      const data = await res.json();
      setBlooms(data.howls || []);
    } catch {}
  }

  async function sendHowl(heldMs: number) {
    try {
      await fetch('/api/howl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: 'Unknown', color_code: myColor, character: 'ZOHAR', held_duration: heldMs }),
      });
    } catch {}
  }

  async function sendDecision(decision: string, timeMs: number, character: string) {
    try {
      await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: `solo-${Date.now()}`, player_color: myColor, decision, time_to_decision_ms: timeMs, character_encountered: character }),
      });
    } catch {}
  }

  const startHowl = useCallback(() => {
    if (howling || phase !== 'world') return;
    setHowling(true);
    setZoharPhase('howling');
    howlStartRef.current = Date.now();
    let progress = 0;
    howlTimerRef.current = setInterval(() => {
      progress += 2;
      setHowlProgress(progress);
      if (progress % 20 === 0) {
        const waveId = Date.now() + Math.random();
        setHowlWaves(w => [...w, waveId]);
        setTimeout(() => setHowlWaves(w => w.filter(id => id !== waveId)), 1200);
      }
      if (progress >= 100) clearInterval(howlTimerRef.current!);
    }, 40);
  }, [howling, phase]);

  const endHowl = useCallback(() => {
    if (!howling) return;
    if (howlTimerRef.current) clearInterval(howlTimerRef.current);
    const heldMs = Date.now() - howlStartRef.current;
    sendHowl(heldMs);
    setHowling(false);
    setZoharPhase('waiting');
    setHowlProgress(0);
    setHowlWaves([]);
    setTimeout(() => {
      setWorldSat(s => Math.min(100, s + 5));
      setZoharPhase('idle');
    }, 2000);
  }, [howling]);

  function triggerEncounter() {
    if (encounterIndex.current >= encounterQueue.current.length) return;
    const charName = encounterQueue.current[encounterIndex.current];
    const char = CHARACTERS[charName];
    if (!char) return;
    const countries = ['JP', 'BR', 'DE', 'NG', 'TH', 'MX', 'KR', 'AU'];
    const country = countries[Math.floor(Math.random() * countries.length)];
    setEncounter({ name: charName, color: char.color, country, description: char.description });
    setDecisionStart(Date.now());
    setDecisionResult(null);
    setPhase('encounter');
  }

  function makeDecision(decision: 'accept' | 'wait' | 'turn_away') {
    const timeMs = Date.now() - decisionStart;
    setDecisionResult(decision);
    setTotalDecisions(n => n + 1);
    sendDecision(decision, timeMs, encounter!.name);

    if (decision === 'accept') {
      setAcceptCount(n => n + 1);
      setSightScore(s => Math.min(100, s + 5));
      setScreenFlash(encounter!.color);
      setWorldSat(s => Math.min(100, s + 18));
      setPhase('decision_made');
      setTimeout(() => {
        setScreenFlash(null);
        setPackMomentChar(encounter!.name);
        setPhase('pack_moment');
        setTimeout(() => {
          encounterIndex.current += 1;
          setEncounter(null);
          if (encounterIndex.current >= encounterQueue.current.length) {
            setTimeout(() => setPhase('end_card'), 2000);
          } else {
            setPhase('world');
            setTimeout(() => triggerEncounter(), 7000);
          }
        }, 4000);
      }, 1500);
    } else if (decision === 'wait') {
      setSightScore(s => Math.max(0, s - 10));
      setWorldSat(s => Math.max(0, s - 5));
      setPhase('decision_made');
      setTimeout(() => {
        encounterIndex.current += 1;
        setEncounter(null);
        setPhase(encounterIndex.current >= encounterQueue.current.length ? 'end_card' : 'world');
        if (encounterIndex.current < encounterQueue.current.length) setTimeout(() => triggerEncounter(), 6000);
      }, 3000);
    } else {
      setSightScore(s => Math.max(0, s - 28));
      setWorldSat(s => Math.max(0, s - 18));
      setScreenFlash('#200A0A');
      setPhase('decision_made');
      setTimeout(() => {
        setScreenFlash(null);
        encounterIndex.current += 1;
        setEncounter(null);
        setPhase(encounterIndex.current >= encounterQueue.current.length ? 'end_card' : 'world');
        if (encounterIndex.current < encounterQueue.current.length) setTimeout(() => triggerEncounter(), 6000);
      }, 2500);
    }
  }

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => { if (e.code === 'Space') { e.preventDefault(); startHowl(); } };
    const onUp = (e: KeyboardEvent) => { if (e.code === 'Space') endHowl(); };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); };
  }, [startHowl, endHowl]);

  const stormIntensity = Math.max(10, 85 - worldSat);
  const healState = worldSat > 70 ? 'HEALING' : worldSat > 30 ? 'FRACTURED' : 'BROKEN';
  const healColor = worldSat > 70 ? '#1D9E75' : worldSat > 30 ? '#EF9F27' : '#ED93B1';

  // ── LANDING ──────────────────────────────────────────────────────────────
  if (phase === 'landing') return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden cracked-earth">
      <Storm intensity={72} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(127,119,221,0.08) 0%, transparent 65%)' }} />

      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        <div className="mb-3 text-xs tracking-[0.45em] text-violet-400 opacity-50 font-display uppercase" style={{ letterSpacing: '0.45em' }}>
          見る · to truly witness
        </div>

        <h1 className="font-display font-black mb-2 text-glow" style={{ fontSize: 'clamp(4rem, 12vw, 7rem)', color: '#EF9F27', letterSpacing: '0.12em', lineHeight: 1 }}>
          MIRU
        </h1>
        <div className="text-base md:text-xl italic text-gray-400 mb-10" style={{ fontWeight: 300, letterSpacing: '0.05em' }}>
          The world sees what you choose to see.
        </div>

        <div className="flex justify-center mb-10">
          <div className="relative">
            <div className="absolute rounded-full pointer-events-none" style={{ inset: '-20px', background: 'radial-gradient(circle, rgba(127,119,221,0.12) 0%, transparent 70%)' }} />
            <ZoharSVG size={200} phase="idle" saturation={75} />
          </div>
        </div>

        <div className="space-y-1 mb-10">
          {['He was never the problem.', 'He was the answer.'].map((line, i) => (
            <div key={i} className="italic text-gray-500 fade-up" style={{ animationDelay: `${i * 400 + 300}ms`, fontWeight: 300 }}>{line}</div>
          ))}
        </div>

        <button
          onClick={() => setPhase('world')}
          className="font-display text-xs tracking-widest px-12 py-4 transition-all duration-500"
          style={{ background: 'transparent', border: '1px solid rgba(239,159,39,0.45)', color: '#EF9F27', letterSpacing: '0.3em' }}
          onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(239,159,39,0.08)'; (e.target as HTMLElement).style.borderColor = 'rgba(239,159,39,0.9)'; }}
          onMouseLeave={e => { (e.target as HTMLElement).style.background = 'transparent'; (e.target as HTMLElement).style.borderColor = 'rgba(239,159,39,0.45)'; }}
        >
          ENTER THE FOLD
        </button>

        <div className="mt-8 text-xs text-gray-700" style={{ letterSpacing: '0.12em' }}>
          4 strangers · 5 minutes · one fractured world
        </div>
      </div>
    </div>
  );

  // ── WORLD ────────────────────────────────────────────────────────────────
  if (phase === 'world') return (
    <div className="relative min-h-screen overflow-hidden cracked-earth select-none" style={{ filter: `saturate(${0.08 + (worldSat / 100) * 0.92})` }}>
      <Storm intensity={stormIntensity} />

      {screenFlash && <div className="fixed inset-0 pointer-events-none flash" style={{ background: screenFlash, zIndex: 50, opacity: 0.25 }} />}

      <div className="absolute bottom-0 left-0 right-0" style={{ height: '35vh', background: 'linear-gradient(to top, rgba(10,10,18,0.95) 0%, transparent 100%)', zIndex: 2 }} />

      {/* Blooms */}
      <div className="absolute inset-0" style={{ zIndex: 5 }}>
        {blooms.slice(0, 18).map((bloom, i) => {
          const pos = bloomPosition(bloom.country, i);
          return <Bloom key={bloom.id} color={bloom.color_code} x={pos.x} y={pos.y} country={`${getFlag(bloom.country)} ${bloom.country}`} character={bloom.character} delay={i * 120} size={28 + (i % 3) * 12} />;
        })}
      </div>

      {/* Howl waves */}
      {howlWaves.map(w => (
        <div key={w} className="howl-wave absolute rounded-full pointer-events-none" style={{ width: '180px', height: '180px', left: '50%', top: '52%', transform: 'translate(-50%, -50%)', border: `2px solid ${myColor}88`, zIndex: 20 }} />
      ))}

      {/* Center ZOHAR */}
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ zIndex: 15 }}>
        <div className="mb-3 flex items-center gap-3">
          <div className="font-display text-xs px-3 py-1 tracking-widest" style={{ border: '1px solid rgba(255,255,255,0.08)', color: healColor, background: 'rgba(0,0,0,0.5)', letterSpacing: '0.22em' }}>
            THE FOLD · {healState}
          </div>
        </div>

        <ZoharSVG size={210} phase={zoharPhase} saturation={18 + worldSat * 0.82} className="transition-all duration-1000" />

        {/* Howl button */}
        <div className="mt-3 relative flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            {!howling && <>
              <div className="howl-ring absolute rounded-full" style={{ width: 84, height: 84, border: '1px solid rgba(239,159,39,0.25)' }} />
              <div className="howl-ring absolute rounded-full" style={{ width: 84, height: 84, border: '1px solid rgba(239,159,39,0.15)', animationDelay: '0.6s' }} />
            </>}
            <button
              onMouseDown={startHowl} onMouseUp={endHowl}
              onTouchStart={e => { e.preventDefault(); startHowl(); }} onTouchEnd={e => { e.preventDefault(); endHowl(); }}
              className="relative z-10 font-display text-xs tracking-widest transition-all duration-300"
              style={{
                width: '84px', height: '84px', borderRadius: '50%',
                background: howling ? 'radial-gradient(circle, rgba(239,159,39,0.35) 0%, rgba(127,119,221,0.15) 100%)' : 'radial-gradient(circle, rgba(239,159,39,0.08) 0%, rgba(127,119,221,0.04) 100%)',
                border: `2px solid ${howling ? '#EF9F27' : 'rgba(239,159,39,0.35)'}`,
                color: '#EF9F27',
                letterSpacing: '0.22em',
                transform: howling ? 'scale(1.12)' : 'scale(1)',
                boxShadow: howling ? '0 0 50px rgba(239,159,39,0.25)' : 'none',
              }}
            >HOWL</button>
          </div>

          {howling && (
            <div className="mt-3 w-44 h-0.5 bg-gray-800 rounded overflow-hidden">
              <div className="h-full rounded transition-all" style={{ width: `${howlProgress}%`, background: 'linear-gradient(to right, #7F77DD, #EF9F27)' }} />
            </div>
          )}

          <div className="mt-2 text-xs text-gray-700" style={{ letterSpacing: '0.12em' }}>
            {howling ? 'ZOHAR CALLS ACROSS THE FOLD...' : 'HOLD TO HOWL · SPACEBAR'}
          </div>
        </div>
      </div>

      {/* Narrator */}
      {showNarrator && (
        <div className="absolute left-0 right-0 bottom-12 px-8 text-center panel-reveal" style={{ zIndex: 20 }}>
          <div className="inline-block max-w-md px-5 py-4 italic text-sm" style={{ color: 'rgba(232,228,240,0.6)', background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.04)', fontWeight: 300, lineHeight: 1.85 }}>
            {worldState.narrative}
          </div>
          <div className="mt-2 text-xs text-gray-700" style={{ letterSpacing: '0.15em' }}>
            {worldState.howlCount} HOWLS TODAY · {blooms.length} SIGNALS
          </div>
        </div>
      )}

      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between" style={{ zIndex: 20 }}>
        <div className="font-display text-xs text-gray-700 tracking-widest">MIRU</div>
        <div className="text-xs" style={{ color: healColor, letterSpacing: '0.12em' }}>{worldSat}% HEALED</div>
      </div>
    </div>
  );

  // ── ENCOUNTER ────────────────────────────────────────────────────────────
  if ((phase === 'encounter' || phase === 'decision_made') && encounter) {
    const isDecided = phase === 'decision_made';
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden cracked-earth">
        <Storm intensity={55} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 35%, ${encounter.color}12 0%, transparent 58%)` }} />
        {screenFlash && <div className="fixed inset-0 pointer-events-none flash" style={{ background: screenFlash, zIndex: 50, opacity: 0.2 }} />}

        <div className="relative z-10 text-center px-6 max-w-md mx-auto w-full panel-reveal">
          {/* Character badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-xs font-display tracking-widest" style={{ border: `1px solid ${encounter.color}44`, color: encounter.color, background: `${encounter.color}0E`, letterSpacing: '0.22em' }}>
            <div className="w-2 h-2 rounded-full" style={{ background: encounter.color }} />
            {getFlag(encounter.country)} {encounter.country} · {encounter.name}
          </div>

          {/* Silhouette */}
          <div className="flex justify-center mb-6">
            <div className="w-28 h-28 rounded-full flex items-center justify-center" style={{ background: `radial-gradient(circle, ${encounter.color}1A 0%, transparent 70%)`, border: `1px solid ${encounter.color}30` }}>
              <svg width="64" height="72" viewBox="0 0 64 72" fill="none">
                <ellipse cx="32" cy="44" rx="19" ry="15" fill={encounter.color} opacity="0.75" />
                <circle cx="32" cy="26" rx="14" ry="13" fill={encounter.color} opacity="0.85" />
                <rect x="19" y="54" width="8" height="15" rx="4" fill={encounter.color} opacity="0.65" />
                <rect x="37" y="54" width="8" height="15" rx="4" fill={encounter.color} opacity="0.65" />
                <path d="M16 22 Q8 13 12 9 Q17 5 19 18" fill={encounter.color} opacity="0.7" />
                <path d="M48 22 Q56 13 52 9 Q47 5 45 18" fill={encounter.color} opacity="0.5" />
                <ellipse cx="32" cy="30" rx="6" ry="5" fill="#0A0A12" opacity="0.4"/>
              </svg>
            </div>
          </div>

          {/* Prompt */}
          <div className="mb-8">
            {isDecided ? (
              <div className="text-base italic" style={{ fontWeight: 300, lineHeight: 1.9 }}>
                {decisionResult === 'accept' && <span style={{ color: encounter.color }}>You welcomed {encounter.name}. The world remembers what you chose.</span>}
                {decisionResult === 'wait' && <span className="text-gray-500">You waited. The world noticed. ZOHAR's coat dimmed, slightly.</span>}
                {decisionResult === 'turn_away' && <span style={{ color: '#ED93B1' }}>You turned away. The cracks deepen. The Fold does not forget.</span>}
              </div>
            ) : (
              <>
                <div className="text-xs text-gray-600 mb-4 tracking-widest">A dog approaches ZOHAR through the grey.</div>
                <div className="italic text-gray-300 text-sm mb-6" style={{ fontWeight: 300, lineHeight: 1.9 }}>"{encounter.description}"</div>
                <div className="text-xs text-gray-600 tracking-widest">WHAT DO YOU DO?</div>
              </>
            )}
          </div>

          {/* Buttons */}
          {!isDecided && (
            <div className="flex flex-col gap-3">
              <button onClick={() => makeDecision('accept')} className="py-4 px-6 font-display text-xs tracking-widest transition-all duration-300 hover:scale-[1.02]" style={{ background: `${encounter.color}1A`, border: `1px solid ${encounter.color}55`, color: encounter.color, letterSpacing: '0.22em' }}>
                WELCOME ∙ The world blooms
              </button>
              <button onClick={() => makeDecision('wait')} className="py-3 px-6 font-display text-xs tracking-widest transition-all duration-300 hover:opacity-60" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.22em' }}>
                WAIT ∙ The world holds
              </button>
              <button onClick={() => makeDecision('turn_away')} className="py-3 px-6 font-display text-xs tracking-widest transition-all duration-300 hover:opacity-60" style={{ background: 'transparent', border: '1px solid rgba(237,147,177,0.12)', color: 'rgba(237,147,177,0.35)', letterSpacing: '0.22em' }}>
                TURN AWAY ∙ The world knows
              </button>
            </div>
          )}
        </div>

        <div className="absolute bottom-6 left-0 right-0 flex justify-center opacity-40 pointer-events-none">
          <ZoharSVG size={70} phase="waiting" saturation={worldSat} />
        </div>
      </div>
    );
  }

  // ── PACK MOMENT ──────────────────────────────────────────────────────────
  if (phase === 'pack_moment') {
    const char = CHARACTERS[packMomentChar];
    if (!char) return null;
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden" style={{ background: `radial-gradient(ellipse at 50% 40%, ${char.color}1E 0%, var(--fold-dark) 65%)` }}>
        {Array.from({ length: 14 }, (_, i) => (
          <div key={i} className="absolute bloom-enter pointer-events-none" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${i * 80}ms` }}>
            <div className="rounded-full" style={{ width: `${18 + Math.random() * 44}px`, height: `${18 + Math.random() * 44}px`, background: char.color, opacity: 0.15 + Math.random() * 0.2, filter: 'blur(10px)' }} />
          </div>
        ))}

        <div className="relative z-10 text-center px-8 max-w-md mx-auto">
          <div className="flex justify-center items-end gap-6 mb-8">
            <ZoharSVG size={150} phase="reuniting" saturation={Math.min(100, worldSat + 10)} />
            <div className="w-24 h-28 rounded-full flex items-center justify-center mb-4" style={{ background: `${char.color}2A`, border: `2px solid ${char.color}55` }}>
              <svg width="56" height="64" viewBox="0 0 64 72" fill="none">
                <ellipse cx="32" cy="44" rx="19" ry="15" fill={char.color} opacity="0.9"/>
                <circle cx="32" cy="26" rx="14" ry="13" fill={char.color} opacity="0.95"/>
                <rect x="19" y="54" width="8" height="15" rx="4" fill={char.color} opacity="0.8"/>
                <rect x="37" y="54" width="8" height="15" rx="4" fill={char.color} opacity="0.8"/>
              </svg>
            </div>
          </div>

          <div className="font-display text-3xl md:text-4xl mb-3 text-glow" style={{ color: char.color, letterSpacing: '0.1em' }}>
            {packMomentChar} RETURNS
          </div>
          <div className="italic text-gray-400 text-sm mb-4" style={{ fontWeight: 300, lineHeight: 1.9 }}>{char.arc}</div>
          <div className="text-xs text-gray-700" style={{ letterSpacing: '0.15em' }}>THE FOLD HEALS · {Math.min(100, worldSat)}% RESTORED</div>
        </div>
      </div>
    );
  }

  // ── END CARD ─────────────────────────────────────────────────────────────
  if (phase === 'end_card') {
    const sightLabel = sightScore >= 90 ? 'THE WITNESS' : sightScore >= 70 ? 'THE OPEN-EYED' : sightScore >= 50 ? 'THE UNCERTAIN' : sightScore >= 30 ? 'THE BYSTANDER' : 'THE BLIND';
    const sightColor = sightScore >= 90 ? '#1D9E75' : sightScore >= 70 ? '#EF9F27' : sightScore >= 50 ? '#7F77DD' : sightScore >= 30 ? '#2D4A9A' : '#ED93B1';

    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden cracked-earth">
        <Storm intensity={Math.max(5, stormIntensity)} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 25%, rgba(239,159,39,0.07) 0%, transparent 55%)' }} />

        <div className="relative z-10 text-center px-6 max-w-lg mx-auto w-full panel-reveal">
          <div className="flex justify-center mb-6">
            <ZoharSVG size={160} phase={sightScore >= 70 ? 'reuniting' : 'waiting'} saturation={worldSat} />
          </div>

          {/* Sight score */}
          <div className="font-display font-black mb-1 text-glow" style={{ fontSize: 'clamp(3rem, 10vw, 5rem)', color: sightColor, letterSpacing: '0.08em' }}>{sightScore}</div>
          <div className="font-display text-xs mb-6 tracking-widest" style={{ color: sightColor, letterSpacing: '0.3em' }}>SIGHT SCORE · {sightLabel}</div>

          {/* Bar */}
          <div className="w-full h-0.5 bg-gray-800 rounded mb-1 overflow-hidden">
            <div className="h-full rounded fill-bar" style={{ width: `${sightScore}%`, background: `linear-gradient(to right, #7F77DD, ${sightColor})` }} />
          </div>
          <div className="flex justify-between text-xs text-gray-700 mb-8" style={{ letterSpacing: '0.1em' }}>
            <span>BLIND</span><span>WITNESS</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'WELCOMED', value: acceptCount, color: '#1D9E75' },
              { label: 'TURNED', value: totalDecisions - acceptCount, color: '#ED93B1' },
              { label: 'HEALED', value: `${worldSat}%`, color: '#EF9F27' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="font-display text-2xl" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-gray-700 mt-1" style={{ letterSpacing: '0.12em' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Final line */}
          <div className="italic text-sm text-gray-500 mb-8 px-2" style={{ fontWeight: 300, lineHeight: 1.95 }}>
            {sightScore >= 80
              ? '"ZOHAR\'s coat blazes now. He was not wrong. He was not strange. He was the key the family forgot they made."'
              : sightScore >= 50
              ? '"The Fold remembers what you chose. ZOHAR waits, still. He has learned to wait."'
              : '"ZOHAR stands alone at the center. The cracks deepen. You can always return."'}
          </div>

          <button
            onClick={() => {
              const text = `I played MIRU — The Fold.\nSight Score: ${sightScore} · ${sightLabel}\nThe world: ${worldSat}% healed.\n\n"He was never the problem. He was the answer."`;
              if (navigator.clipboard) { navigator.clipboard.writeText(text).then(() => alert('Copied! Share your score.')); }
            }}
            className="w-full py-4 font-display text-xs tracking-widest mb-3 transition-all hover:opacity-80"
            style={{ background: 'rgba(239,159,39,0.12)', border: '1px solid rgba(239,159,39,0.4)', color: '#EF9F27', letterSpacing: '0.25em' }}
          >
            SHARE YOUR SIGHT SCORE
          </button>

          <button
            onClick={() => {
              encounterIndex.current = 0;
              encounterQueued.current = false;
              setNarLoaded(false);
              setPhase('world');
              setWorldSat(0);
              setSightScore(100);
              setAcceptCount(0);
              setTotalDecisions(0);
              setShowNarrator(false);
              setBlooms([]);
            }}
            className="w-full py-3 font-display text-xs tracking-widest transition-all hover:opacity-50"
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.22em' }}
          >
            RETURN TO THE FOLD
          </button>
        </div>
      </div>
    );
  }

  return null;
}
