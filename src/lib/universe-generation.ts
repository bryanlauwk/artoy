type Item = { label: string; kind: "experience" | "merch"; prompt: string };

export const ITEMS: Item[] = [
  {
    label: "Game Character",
    kind: "experience",
    prompt:
      "Create ONE isolated full-body game character for ARTOY's The Lost Fragments adventure. Use the supplied artwork as the sole identity reference. Preserve its distinctive face, silhouette, costume, markings and palette; do not substitute a generic mascot. If the artwork is abstract or has several characters, interpret its central subject as one coherent little art spirit. Polished hand-painted 2.5D storybook game art, readable chunky silhouette, gentle three-quarter front view, standing idle, complete body and feet visible, centered with minimal empty margin. Soft warm light from the upper left. Plain pure white background (#FFFFFF) for compositing. No floor, shadow, scene, UI, text, border, checkerboard, sprite sheet or additional poses. This single image will be used as the actual playable hero in a fixed explore-and-dash game; do not generate game rules or a game screenshot.",
  },
  {
    label: "Virtual Pet",
    kind: "experience",
    prompt:
      "Render this character as an adorable 3D virtual pet inside a glossy soft-shaded bubble habitat, big sparkly eyes, chibi proportions, soft studio lighting, pastel gradient backdrop. Preserve the character's colors and identity. Toy-like, Tamagotchi energy.",
  },
  {
    label: "Vinyl Toy",
    kind: "experience",
    prompt:
      "Product photo of this character as a premium designer vinyl art toy figurine, glossy plastic finish, standing on a minimal pedestal, soft studio lighting, neutral seamless backdrop. Preserve the character's exact look. KAWS / Pop Mart blind-box aesthetic.",
  },
  {
    label: "Trading Card",
    kind: "experience",
    prompt:
      "Design a premium collectible trading card featuring this character as the centerpiece artwork. Holographic foil frame, character name banner, stat icons (HP, ATK, DEF), rarity gem, decorative border. Preserve the character's style. TCG / Pokémon-card composition, portrait orientation.",
  },
  {
    label: "Wallpaper",
    kind: "experience",
    prompt:
      "Create a stunning phone wallpaper / key art featuring this character heroically posed, dramatic lighting, dynamic background with abstract shapes, particles and color splashes matching the character's palette. Preserve the character's identity. Cinematic, poster-quality, portrait 9:16 feel.",
  },
  {
    label: "Figurine",
    kind: "merch",
    prompt:
      "Product mockup of this character as a premium collectible figurine on a small acrylic base, displayed against a clean dark studio backdrop with soft rim lighting. High-end Pop Mart / Bandai product photography. Preserve the character's exact look.",
  },
  {
    label: "Acrylic Stand",
    kind: "merch",
    prompt:
      "Product mockup of an acrylic standee of this character: full-body cutout printed on clear acrylic with a small base, photographed at a 3/4 angle on a clean neutral backdrop with soft shadow. Anime merch product-photo aesthetic. Preserve the character's exact look.",
  },
  {
    label: "T-Shirt",
    kind: "merch",
    prompt:
      "Product mockup of a premium black t-shirt with this character printed large on the chest as graphic-tee artwork. Studio product shot, neutral backdrop, soft lighting, slight fabric texture. Streetwear merch energy. Preserve the character's look in the print.",
  },
];

type Result = { label: string; kind: "experience" | "merch"; image: string | null; error?: string };

export const MOTION: Item = {
  label: "Game Motion",
  kind: "experience",
  prompt:
    "Create a precise animation sprite sheet for the supplied game hero. First reference is the original identity, second is the approved full-body hero: preserve its face, silhouette, clothing, markings and palette exactly. One rectangular 4-column by 2-row grid with EIGHT isolated full-body poses. Row 1: idle eyes open, idle blink, running stride A, running opposite stride B. Row 2: dash anticipation, dash extension, hit recoil, recovery. Every pose completely inside its own cell with at least 12% blank margin on all four sides. Same camera, scale, ground line and lighting. No overlap or cropped limbs. Clear opposite arm and leg positions for the run pair. Polished hand-painted 2.5D art. Pure white background, no floor shadow, text, labels, borders, panels or checkerboard. No scene or game UI.",
};

export const WORLD_RELICS: Item = {
  label: "World Relics",
  kind: "experience",
  prompt:
    "Create a precise environment asset sheet for the supplied character's mysterious game world. First reference is the original artwork and second is the approved playable hero: preserve their distinctive visual motifs, costume details, shapes and palette. ONE landscape 3:2 image with exactly THREE equal vertical cells side by side in one row. Cell 1: a small shrine crown inspired by the character's most recognizable accessory. Cell 2: an ancient guardian faceplate inspired by the character, with readable glowing eyes. Cell 3: a magical portal crest inspired by that same identity. Each is ONE isolated painted 2.5D object, gentle three-quarter front camera, upper-left moonlight, restrained luminous accents, rich material detail, clear silhouette. Every object completely inside its own cell with at least 15 percent blank margin on all sides. Same scale and camera. Pure white background (#FFFFFF) for compositing; no floor, shadows, landscape, scene, UI, text, grid lines, borders or checkerboard. Do not include a full character or a screenshot. The objects decorate a fixed game map; do not invent mechanics.",
};

export async function generateOne(
  apiKey: string,
  imageDataUrl: string,
  item: Item,
  heroReference?: string,
): Promise<Result> {
  const sources = heroReference ? [imageDataUrl, heroReference] : [imageDataUrl];
  for (const source of sources) {
    if (!/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(source))
      return { label: item.label, kind: item.kind, image: null, error: "Invalid reference image" };
  }
  // This project's gateway accepts the multimodal JSON generation contract.
  // The SDK's multipart edit contract returned HTTP 400 in production.
  const res = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3.1-flash-image-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: item.prompt },
            ...sources.map((url) => ({ type: "image_url", image_url: { url } })),
          ],
        },
      ],
      modalities: ["image", "text"],
    }),
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok)
    return {
      label: item.label,
      kind: item.kind,
      image: null,
      error: `${res.status}: Asset generation unavailable`,
    };
  const json = (await res.json()) as { data?: Array<{ b64_json?: string }> };
  const b64 = json.data?.[0]?.b64_json;
  return b64
    ? { label: item.label, kind: item.kind, image: `data:image/png;base64,${b64}` }
    : { label: item.label, kind: item.kind, image: null, error: "No image data returned" };
}
