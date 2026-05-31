/**
 * IP-to-Character Tool
 *
 * Takes a brand's uploaded mascot/key-visual PNG and converts it into
 * game-ready pixel-art sprite frames, using:
 *   1. Background removal (reuses BackgroundRemovalService)
 *   2. Style-transfer re-render via the configured image provider
 *   3. Animation frame generation (idle, walk, attack) for the chosen archetype
 *
 * Outputs are written to public/assets/ and registered in asset-pack.json,
 * making them drop-in replacements for AI-generated character sprites.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import {
  BaseDeclarativeTool,
  BaseToolInvocation,
  Kind,
  type ToolResult,
} from './tools.js';
import type { Config } from '../config/config.js';
import { BackgroundRemovalService } from '../utils/backgroundRemoval.js';
import { createModelRouter } from '../services/assetModelRouter.js';
import type { ModelRouter } from '../services/assetModelRouter.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface IpToCharacterParams {
  /** Absolute or cwd-relative path to the source mascot PNG */
  source_image_path: string;
  /** Natural-language description of the character (from brand-brief) */
  character_description: string;
  /**
   * Target game archetype — controls which animation set to generate and
   * the camera perspective used in style-transfer prompts.
   */
  archetype:
    | 'platformer'
    | 'top_down'
    | 'grid_logic'
    | 'tower_defense'
    | 'ui_heavy';
  /** Global style anchor from brand-brief (e.g. brand colors + "pixel art") */
  style_anchor: string;
  /** Asset key prefix, e.g. "hero" → generates hero_idle_01.png etc. */
  asset_key: string;
  /** Output directory (default: public/assets) */
  output_dir?: string;
}

interface AnimationSpec {
  name: string;
  actionDesc: string;
  frameCount: number;
}

// ---------------------------------------------------------------------------
// Animation specs per archetype
// ---------------------------------------------------------------------------

const ARCHETYPE_ANIMATIONS: Record<string, AnimationSpec[]> = {
  platformer: [
    {
      name: 'idle',
      actionDesc:
        'standing idle, slight breathing motion, SIDE VIEW facing right',
      frameCount: 2,
    },
    {
      name: 'run',
      actionDesc: 'running full-speed, SIDE VIEW facing right, legs cycling',
      frameCount: 2,
    },
    {
      name: 'jump',
      actionDesc: 'mid-air jump pose, SIDE VIEW facing right, arms raised',
      frameCount: 2,
    },
    {
      name: 'attack_1',
      actionDesc: 'basic attack swing, SIDE VIEW facing right',
      frameCount: 2,
    },
    { name: 'die', actionDesc: 'falling defeated, SIDE VIEW', frameCount: 2 },
  ],
  top_down: [
    {
      name: 'idle_front',
      actionDesc: 'idle, facing camera (front view, top-down)',
      frameCount: 1,
    },
    {
      name: 'idle_back',
      actionDesc: 'idle, facing away from camera (back view, top-down)',
      frameCount: 1,
    },
    {
      name: 'idle_side',
      actionDesc: 'idle, facing right (side view, top-down)',
      frameCount: 1,
    },
    {
      name: 'walk_front',
      actionDesc: 'walking toward camera (front, top-down)',
      frameCount: 2,
    },
    {
      name: 'walk_back',
      actionDesc: 'walking away from camera (back, top-down)',
      frameCount: 2,
    },
    {
      name: 'walk_side',
      actionDesc: 'walking rightward (side, top-down)',
      frameCount: 2,
    },
  ],
  grid_logic: [
    { name: 'idle', actionDesc: 'idle, top-down perspective', frameCount: 2 },
    { name: 'move', actionDesc: 'moving one tile, top-down', frameCount: 2 },
    {
      name: 'attack',
      actionDesc: 'attacking adjacent tile, top-down',
      frameCount: 2,
    },
  ],
  tower_defense: [
    {
      name: 'idle',
      actionDesc: 'tower idle, overhead view, stationary',
      frameCount: 1,
    },
    {
      name: 'attack',
      actionDesc: 'tower firing, overhead view',
      frameCount: 2,
    },
  ],
  ui_heavy: [
    {
      name: 'neutral',
      actionDesc: 'bust shot, facing camera, neutral expression, front view',
      frameCount: 1,
    },
    {
      name: 'happy',
      actionDesc:
        'bust shot, facing camera, happy smiling expression, front view',
      frameCount: 1,
    },
    {
      name: 'serious',
      actionDesc: 'bust shot, facing camera, determined expression, front view',
      frameCount: 1,
    },
  ],
};

// ---------------------------------------------------------------------------
// Invocation
// ---------------------------------------------------------------------------

class IpToCharacterInvocation extends BaseToolInvocation<
  IpToCharacterParams,
  ToolResult
> {
  private modelRouter: ModelRouter | null = null;
  private bgRemovalService: BackgroundRemovalService;

  constructor(
    params: IpToCharacterParams,
    private config: Config,
  ) {
    super(params);
    this.bgRemovalService = new BackgroundRemovalService({
      projectRoot: config.getProjectRoot(),
    });
  }

  getDescription(): string {
    return `Converting brand mascot to game sprites: ${this.params.asset_key}`;
  }

  async execute(signal: AbortSignal): Promise<ToolResult> {
    const {
      source_image_path,
      character_description,
      archetype,
      style_anchor,
      asset_key,
      output_dir = 'public/assets',
    } = this.params;

    // Resolve source image
    const srcAbs = path.resolve(source_image_path);
    try {
      await fs.access(srcAbs);
    } catch {
      return {
        llmContent: `Error: source_image_path not found: ${srcAbs}`,
        returnDisplay: `Source image not found: ${srcAbs}`,
      };
    }

    // Ensure output dir exists
    await fs.mkdir(output_dir, { recursive: true });

    // Initialise model router (lazy)
    try {
      this.modelRouter = createModelRouter({
        providers: this.config.getOpenGameProviders(),
      });
    } catch (e) {
      return {
        llmContent:
          `Error: Could not initialise image provider. ` +
          `Ensure OPENGAME_IMAGE_API_KEY and OPENGAME_IMAGE_PROVIDER are set. ` +
          `Details: ${(e as Error).message}`,
        returnDisplay: 'Image provider not configured.',
      };
    }

    const animations =
      ARCHETYPE_ANIMATIONS[archetype] ?? ARCHETYPE_ANIMATIONS['platformer'];
    const generated: string[] = [];
    const assetPackEntries: Record<string, { type: string; url: string }> = {};

    // Step 1: Remove background from uploaded mascot
    console.log(`[IpToCharacter] Removing background from ${srcAbs}`);
    const srcDataUrl = await this.imageFileToDataUrl(srcAbs);
    const cleanBuffer =
      await this.bgRemovalService.removeBackgroundSafe(srcDataUrl);
    const cleanKey = `${asset_key}_source_clean`;
    const cleanPath = path.join(output_dir, `${cleanKey}.png`);
    await fs.writeFile(cleanPath, cleanBuffer);
    console.log(`[IpToCharacter] Clean source saved: ${cleanPath}`);

    // Step 2: For each animation spec, style-transfer re-render
    for (const anim of animations) {
      if (signal.aborted) break;

      const frameKeys: string[] = [];

      for (let frame = 1; frame <= anim.frameCount; frame++) {
        if (signal.aborted) break;

        const frameKey = `${asset_key}_${anim.name}_${String(frame).padStart(2, '0')}`;
        const perspective = this.perspectiveHint(archetype, anim.name);

        const prompt =
          `Pixel art game sprite, ${character_description}, ${anim.actionDesc}. ` +
          `${perspective}. ` +
          `Style: ${style_anchor}. ` +
          `Re-draw in 16-bit pixel art game style preserving the character's key visual identity. ` +
          `Single character only, isolated on pure white background, centered composition, ` +
          `consistent scale across frames. No text, no UI elements.` +
          (frame > 1
            ? ` This is frame ${frame} of ${anim.frameCount} for the ${anim.name} animation.`
            : '');

        console.log(`[IpToCharacter] Generating ${frameKey}...`);

        try {
          const imageUrl = await this.modelRouter!.generateImage(
            prompt,
            '1024*1024',
          );
          const buffer =
            await this.bgRemovalService.removeBackgroundSafe(imageUrl);
          const outPath = path.join(output_dir, `${frameKey}.png`);
          await fs.writeFile(outPath, buffer);
          assetPackEntries[frameKey] = { type: 'animation', url: outPath };
          frameKeys.push(frameKey);
          generated.push(frameKey);
          console.log(`[IpToCharacter] Saved: ${outPath}`);
        } catch (e) {
          console.warn(
            `[IpToCharacter] Failed to generate ${frameKey}: ${(e as Error).message}`,
          );
        }
      }
    }

    // Step 3: Write asset-pack entries
    const assetPackPath = path.join(output_dir, 'asset-pack.json');
    let assetPack: Record<string, unknown> = {};
    try {
      const existing = await fs.readFile(assetPackPath, 'utf-8');
      assetPack = JSON.parse(existing);
    } catch {
      // No existing pack — start fresh
    }

    for (const [key, val] of Object.entries(assetPackEntries)) {
      assetPack[key] = val;
    }
    await fs.writeFile(assetPackPath, JSON.stringify(assetPack, null, 2));

    const summary =
      `IP-to-Character complete for asset_key="${asset_key}" (archetype: ${archetype}).\n` +
      `Generated ${generated.length} sprite frames:\n` +
      generated.map((k) => `  - ${k}.png`).join('\n') +
      '\n' +
      `Clean source (bg removed): ${cleanKey}.png\n` +
      `asset-pack.json updated at ${assetPackPath}`;

    return {
      llmContent: summary,
      returnDisplay: summary,
    };
  }

  private perspectiveHint(archetype: string, animName: string): string {
    if (archetype === 'platformer') return 'SIDE VIEW (profile), facing right';
    if (archetype === 'ui_heavy')
      return 'FRONT VIEW, bust shot (chest and above)';
    if (animName.includes('back')) return 'BACK VIEW (top-down overhead)';
    if (animName.includes('front')) return 'FRONT VIEW (top-down overhead)';
    return 'TOP-DOWN overhead perspective';
  }

  private async imageFileToDataUrl(filePath: string): Promise<string> {
    const buf = await fs.readFile(filePath);
    const b64 = buf.toString('base64');
    return `data:image/png;base64,${b64}`;
  }
}

// ---------------------------------------------------------------------------
// Tool declaration
// ---------------------------------------------------------------------------

export class IpToCharacterTool extends BaseDeclarativeTool<
  IpToCharacterParams,
  ToolResult
> {
  static readonly Name = 'ip_to_character';

  constructor(private config: Config) {
    super(
      'ip_to_character',
      'IP → Character Sprites',
      `Brand Game Studio tool: converts a brand's uploaded mascot/key-visual PNG into
game-ready pixel-art sprite frames. Performs background removal then style-transfer
re-renders for each animation (idle, walk, attack, etc.) required by the chosen game
archetype. Outputs are written to public/assets/ and registered in asset-pack.json.
Use this BEFORE generate_game_assets when a brand-kit is provided.`,
      Kind.Fetch,
      {
        type: 'object',
        properties: {
          source_image_path: {
            type: 'string',
            description:
              'Absolute or cwd-relative path to the uploaded mascot PNG.',
          },
          character_description: {
            type: 'string',
            description:
              'Natural-language description of the character (from brand-brief), ' +
              'e.g. "A cheerful orange fox wearing a blue scarf".',
          },
          archetype: {
            type: 'string',
            enum: [
              'platformer',
              'top_down',
              'grid_logic',
              'tower_defense',
              'ui_heavy',
            ],
            description:
              'Target game archetype — controls animation set and perspective.',
          },
          style_anchor: {
            type: 'string',
            description:
              'Global visual style from brand-brief, e.g. "brand colors #FF6B00 and #0055FF, pixel art".',
          },
          asset_key: {
            type: 'string',
            description:
              'Asset key prefix, e.g. "hero" → outputs hero_idle_01.png, hero_run_01.png, etc.',
          },
          output_dir: {
            type: 'string',
            description: 'Output directory (default: public/assets).',
          },
        },
        required: [
          'source_image_path',
          'character_description',
          'archetype',
          'style_anchor',
          'asset_key',
        ],
      },
    );
  }

  createInvocation(params: IpToCharacterParams): IpToCharacterInvocation {
    return new IpToCharacterInvocation(params, this.config);
  }
}
