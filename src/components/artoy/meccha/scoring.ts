export type RunStats = {
  gems: number;
  hearts: number;
  perfectCount: number;
  timeLeftSec: number;
  won: boolean;
};

/**
 * Style Score formula (kept simple so it reads cleanly on the scorecard):
 *   gems     × 200
 *   hearts   × 150
 *   time     × 5   (per second remaining)
 *   perfects × 100 (gems collected with ≥85% blend)
 *   win bonus +250
 */
export function computeScore(s: RunStats): number {
  return Math.max(
    0,
    s.gems * 200 +
      s.hearts * 150 +
      Math.round(s.timeLeftSec) * 5 +
      s.perfectCount * 100 +
      (s.won ? 250 : 0),
  );
}

export function formatMs(ms: number): string {
  if (!ms || ms <= 0) return "—";
  const s = ms / 1000;
  if (s < 10) return `${s.toFixed(2)}s`;
  return `${s.toFixed(1)}s`;
}
