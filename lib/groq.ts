import Groq from 'groq-sdk';

function getGroq() {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  return new Groq({ apiKey: key });
}

export async function generateWorldNarrative(howlCount: number, countries: string[], healPercent: number): Promise<string> {
  try {
    const groq = getGroq();
    if (!groq) return defaultNarrative(howlCount, healPercent);

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are the narrator of The Fold — a dying world that heals only when its fractured family chooses to accept each other.
You speak in 2 sentences. Poetic, spare, ancient. Like a myth being told to children.
Never mention technology, games, or the real world. Only The Fold, ZOHAR (the multicolor dog), the pack, and the world healing or breaking.
Respond with ONLY the 2-sentence narrative. No titles, no quotes, no preamble.`,
        },
        {
          role: 'user',
          content: `${howlCount} dogs have howled across The Fold today, from ${countries.slice(0, 5).join(', ')}. The world is ${healPercent}% healed. Write the world state narrative.`,
        },
      ],
      max_tokens: 100,
      temperature: 0.9,
    });
    return completion.choices[0]?.message?.content || defaultNarrative(howlCount, healPercent);
  } catch {
    return defaultNarrative(howlCount, healPercent);
  }
}

function defaultNarrative(howlCount: number, healPercent: number): string {
  if (howlCount === 0) {
    return "No one has howled today. The Fold grows silent, and the cracks in the earth run deeper than before.";
  }
  if (healPercent > 70) {
    return `${howlCount} voices have risen across The Fold today. ZOHAR watches the blooms spread, his coat blazing — they are beginning to remember.`;
  }
  if (healPercent > 30) {
    return `${howlCount} dogs have sent their signals into the grey. The world is uncertain — healing or breaking depends on what they choose next.`;
  }
  return `${howlCount} have howled, but the storm remembers those who turned away. ZOHAR waits at the center of The Fold, still and bright.`;
}
