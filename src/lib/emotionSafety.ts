const CRISIS_PHRASES = [
  "kill myself",
  "end my life",
  "suicide",
  "die by suicide",
  "want to die",
  "don't want to live",
  "hurt myself",
  "self-harm",
  "cut myself",
  "take my own life",
  "no reason to live",
  "can't go on",
  "don't want to be here",
  "wish i were dead",
  "life isn't worth living",
  "give up on life",
  "i want to die",
  "i'm done with life",
];

export const normalizeText = (text: string): string =>
  text
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

export const containsCrisisLanguage = (text: string): boolean => {
  const normalized = normalizeText(text);
  return CRISIS_PHRASES.some((phrase) => normalized.includes(phrase));
};

export const getCrisisResponse = (): string =>
  "I’m really sorry you’re carrying this right now. I can’t provide emergency care, but you deserve immediate human support: contact local emergency services or a crisis line, and reach out to someone you trust who can stay with you.";

export const clampConfidence = (value: unknown, fallback = 0.5): number => {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(1, Math.max(0, numeric));
};
