import type { SampleId } from "./stages";

const KEY = "meccha.bests.v1";

export type Best = { bestScore: number; bestMs: number; runs: number; cleared: boolean };

export type BestsBlob = {
  nova: Best;
  mochi: Best;
  hexx: Best;
  mirrorUnlocked: boolean;
};

const EMPTY: Best = { bestScore: 0, bestMs: 0, runs: 0, cleared: false };

const DEFAULTS: BestsBlob = {
  nova: { ...EMPTY },
  mochi: { ...EMPTY },
  hexx: { ...EMPTY },
  mirrorUnlocked: false,
};

export function loadBests(): BestsBlob {
  if (typeof window === "undefined") return structuredClone(DEFAULTS);
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULTS);
    const parsed = JSON.parse(raw) as Partial<BestsBlob>;
    return {
      nova: { ...EMPTY, ...(parsed.nova ?? {}) },
      mochi: { ...EMPTY, ...(parsed.mochi ?? {}) },
      hexx: { ...EMPTY, ...(parsed.hexx ?? {}) },
      mirrorUnlocked: !!parsed.mirrorUnlocked,
    };
  } catch {
    return structuredClone(DEFAULTS);
  }
}

export function saveBests(b: BestsBlob): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY, JSON.stringify(b)); } catch { /* quota */ }
}

export function resetBests(): BestsBlob {
  const fresh = structuredClone(DEFAULTS);
  saveBests(fresh);
  return fresh;
}

export function isUnlocked(id: SampleId, b: BestsBlob): boolean {
  if (id === "nova") return true;
  if (id === "mochi") return b.nova.cleared;
  if (id === "hexx") return b.mochi.cleared;
  return false;
}

export function prevStage(id: SampleId): SampleId | null {
  if (id === "mochi") return "nova";
  if (id === "hexx") return "mochi";
  return null;
}

/** Returns the updated blob plus whether this run set a new best. */
export function recordRun(
  id: SampleId,
  result: { won: boolean; ms: number; score: number },
  prev: BestsBlob,
): { next: BestsBlob; newBest: boolean } {
  const cur = prev[id];
  const cleared = cur.cleared || result.won;
  const newBestScore = result.won && result.score > cur.bestScore;
  const newBestMs = result.won && (cur.bestMs === 0 || result.ms < cur.bestMs);
  const newBest = newBestScore || newBestMs;
  const updated: Best = {
    bestScore: newBestScore ? result.score : cur.bestScore,
    bestMs: newBestMs ? result.ms : cur.bestMs,
    runs: cur.runs + 1,
    cleared,
  };
  const next: BestsBlob = {
    ...prev,
    [id]: updated,
    mirrorUnlocked: prev.mirrorUnlocked || (id === "hexx" && result.won),
  };
  saveBests(next);
  return { next, newBest };
}
