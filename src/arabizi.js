// Arabizi ("3aslema", "chnowa") to Arabic script as you type, the way Yamli
// does it, through Google Input Tools. Results are cached per word for the
// session, so the conversion on space is usually instant.
const API = "https://inputtools.google.com/request";
const cache = new Map();

// Latin letters plus the digits Arabizi uses for sounds (3 = ع, 7 = ح, …).
// Needs at least one letter so plain numbers stay numbers.
const LATIN_WORD = /^[a-z0-9']*[a-z][a-z0-9']*$/i;

export const cachedArabic = (word) => cache.get(word.toLowerCase());

export async function toArabic(word, signal) {
  const key = word.toLowerCase();
  if (cache.has(key)) return cache.get(key);
  const response = await fetch(
    `${API}?text=${encodeURIComponent(key)}&itc=ar-t-i0-und&num=5`,
    { signal },
  );
  if (!response.ok) throw new Error("Transliteration request failed");
  const data = await response.json();
  const list = data[0] === "SUCCESS" ? (data[1]?.[0]?.[1] ?? []) : [];
  cache.set(key, list);
  return list;
}

// The Latin word that ends at the caret, if there is one to convert
export function wordBefore(text, caret) {
  const match = /[A-Za-z0-9']+$/.exec(text.slice(0, caret));
  if (!match || !LATIN_WORD.test(match[0])) return null;
  return { word: match[0], start: match.index, end: caret };
}

// Addresses are left alone, so "facebook.com" doesn't become Arabic
export const looksLikeUrl = (text) =>
  /^https?:/i.test(text) || (!/\s/.test(text.trim()) && text.includes("."));
