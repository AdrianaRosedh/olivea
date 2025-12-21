// lib/journal/shortcode.ts

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ" as const;

function base62FromBigInt(n: bigint): string {
  if (n === 0n) return "0";
  const base = 62n;
  let x = n;
  let out = "";
  while (x > 0n) {
    const r = Number(x % base);
    out = ALPHABET[r] + out;
    x = x / base;
  }
  return out;
}

/**
 * 64-bit FNV-1a hash (BigInt) – deterministic and works in both browser + Node.
 * Collision risk is extremely low for your scale.
 */
export function fnv1a64(input: string): bigint {
  let hash = 14695981039346656037n; // offset basis
  const prime = 1099511628211n;     // FNV prime

  for (let i = 0; i < input.length; i++) {
    hash ^= BigInt(input.charCodeAt(i));
    hash = (hash * prime) & 0xffffffffffffffffn; // keep 64-bit
  }
  return hash;
}

/**
 * Short code from an id string. We slice to 8 chars for compactness.
 * Increase to 9-10 if you ever want even lower collision probability.
 */
export function makeShortCode(id: string): string {
  const h = fnv1a64(id);
  const code = base62FromBigInt(h);
  return code.slice(0, 8);
}

/** Build a shortlink path for an article */
export function shortPathForArticle(lang: string, slug: string): string {
  return `/j/${makeShortCode(`${lang}:${slug}`)}`;
}
