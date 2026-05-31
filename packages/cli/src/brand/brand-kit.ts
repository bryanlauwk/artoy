/**
 * Brand Game Studio — brand-kit reader.
 *
 * Reads brand-brief.json + validates uploaded asset paths from a brand-kit
 * folder, then produces a BrandContext object that gets injected into the
 * OpenGame pipeline (GDD prompt, style_anchor, asset descriptions).
 */

import * as fs from 'fs';
import * as path from 'path';

export interface BrandContext {
  /** Human-readable IP / brand name, e.g. "Milo the Fox" */
  ipName: string;
  /** One-line tagline used in the game UI */
  tagline: string;
  /** Hex color strings, e.g. ["#FF6B00", "#0055FF"] */
  brandColors: string[];
  /** Natural-language description of the mascot character */
  characterDescription: string;
  /** OpenGame archetype: platformer | top_down | grid_logic | tower_defense | ui_heavy */
  gameType:
    | 'platformer'
    | 'top_down'
    | 'grid_logic'
    | 'tower_defense'
    | 'ui_heavy';
  /** Who the game is designed for */
  targetAudience: string;
  /** Absolute path to the mascot/key-visual PNG (already validated to exist) */
  mascotPath: string | null;
  /** Absolute path to the logo PNG (already validated to exist) */
  logoPath: string | null;
  /** Auto-generated style_anchor string derived from colors + character */
  styleAnchor: string;
  /** The full prompt prefix injected into the GDD raw_user_requirement */
  gddPromptPrefix: string;
}

interface BrandBriefJson {
  ipName?: string;
  tagline?: string;
  brandColors?: string[];
  characterDescription?: string;
  gameType?: string;
  targetAudience?: string;
  keyVisualPath?: string;
  logoPath?: string;
}

const VALID_GAME_TYPES = new Set([
  'platformer',
  'top_down',
  'grid_logic',
  'tower_defense',
  'ui_heavy',
]);

/**
 * Load and validate a brand-kit folder, returning a BrandContext.
 * Throws a descriptive Error if brand-brief.json is missing or malformed.
 */
export function loadBrandKit(brandKitPath: string): BrandContext {
  const absPath = path.resolve(brandKitPath);

  if (!fs.existsSync(absPath)) {
    throw new Error(`Brand-kit folder not found: ${absPath}`);
  }

  const briefPath = path.join(absPath, 'brand-brief.json');
  if (!fs.existsSync(briefPath)) {
    throw new Error(
      `brand-brief.json not found in ${absPath}. ` +
        `Create it or use the brand-studio.html web form to generate it.`,
    );
  }

  let brief: BrandBriefJson;
  try {
    brief = JSON.parse(fs.readFileSync(briefPath, 'utf-8'));
  } catch (e) {
    throw new Error(
      `Failed to parse brand-brief.json: ${(e as Error).message}`,
    );
  }

  const ipName = brief.ipName?.trim() || 'Brand Hero';
  const tagline = brief.tagline?.trim() || '';
  const brandColors = brief.brandColors?.filter(Boolean) ?? [];
  const characterDescription =
    brief.characterDescription?.trim() || `${ipName} character`;
  const targetAudience = brief.targetAudience?.trim() || 'General audience';

  const gameType =
    brief.gameType && VALID_GAME_TYPES.has(brief.gameType)
      ? (brief.gameType as BrandContext['gameType'])
      : 'platformer';

  // Resolve optional image paths — log warnings but don't throw
  const mascotPath = resolveAssetPath(absPath, brief.keyVisualPath, 'mascot');
  const logoPath = resolveAssetPath(absPath, brief.logoPath, 'logo');

  const styleAnchor = buildStyleAnchor(brandColors, characterDescription);
  const gddPromptPrefix = buildGddPromptPrefix({
    ipName,
    tagline,
    brandColors,
    characterDescription,
    targetAudience,
    mascotPath,
  });

  return {
    ipName,
    tagline,
    brandColors,
    characterDescription,
    gameType,
    targetAudience,
    mascotPath,
    logoPath,
    styleAnchor,
    gddPromptPrefix,
  };
}

function resolveAssetPath(
  base: string,
  relPath: string | undefined,
  label: string,
): string | null {
  if (!relPath) return null;
  const abs = path.isAbsolute(relPath) ? relPath : path.join(base, relPath);
  if (!fs.existsSync(abs)) {
    console.warn(`[brand-kit] ${label} file not found at ${abs} — skipping.`);
    return null;
  }
  return abs;
}

function buildStyleAnchor(colors: string[], characterDesc: string): string {
  const colorStr =
    colors.length > 0 ? `brand colors ${colors.join(' and ')}, ` : '';
  return (
    `${colorStr}clean modern cartoon style, bold outlines, ` +
    `friendly character design inspired by: ${characterDesc}, ` +
    `16-bit pixel art aesthetic, vibrant and expressive`
  );
}

function buildGddPromptPrefix(opts: {
  ipName: string;
  tagline: string;
  brandColors: string[];
  characterDescription: string;
  targetAudience: string;
  mascotPath: string | null;
}): string {
  const colorLine =
    opts.brandColors.length > 0
      ? `Brand colors: ${opts.brandColors.join(', ')}.`
      : '';
  const mascotLine = opts.mascotPath
    ? `A reference mascot image has been uploaded and will be used as the player character sprite source.`
    : '';
  const taglineLine = opts.tagline ? `Tagline: "${opts.tagline}".` : '';

  return [
    `=== BRAND GAME STUDIO ===`,
    `IP / Brand Name: ${opts.ipName}`,
    taglineLine,
    colorLine,
    `Main character: ${opts.characterDescription}`,
    mascotLine,
    `Target audience: ${opts.targetAudience}`,
    ``,
    `All game assets (characters, backgrounds, UI, audio) MUST reflect the brand identity above.`,
    `The player character must visually resemble the brand mascot description.`,
    `Apply brand colors to UI elements, backgrounds, and environmental details.`,
    `=== END BRAND CONTEXT ===`,
    ``,
  ]
    .filter(Boolean)
    .join('\n');
}
