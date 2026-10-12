export function distance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[a.length][b.length];
}

/** Closest candidate within a small edit distance, or a prefix match. */
export function suggest(input: string, candidates: string[]): string | undefined {
  const word = input.toLowerCase();
  if (!word) return undefined;
  let best: string | undefined;
  let bestD = Infinity;
  for (const c of candidates) {
    const d = c.startsWith(word) ? 0.5 : distance(word, c);
    if (d < bestD) {
      best = c;
      bestD = d;
    }
  }
  const limit = word.length <= 3 ? 1 : 2;
  return bestD <= limit ? best : undefined;
}
