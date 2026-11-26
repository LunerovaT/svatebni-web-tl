import { DATES } from "./public/venue.js";

// ---------- odpočet do svatby ----------
const WEDDING = new Date(DATES.start);
export function weddingCountdown(now = new Date()) {
  const days = Math.ceil((WEDDING - now) / 86400000);
  if (days > 4) return `Do svatby zbývá ${days} dní`;
  if (days > 1) return `Do svatby zbývají ${days} dny`;
  if (days === 1) return "Svatba je zítra";
  if (days === 0) return "Svatba je dnes";
  return null;
}
