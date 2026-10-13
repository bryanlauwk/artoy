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

export async function generateOne(
  apiKey: string,
  imageDataUrl: string,
  item: Item,
  heroReference?: string,
): Promise<Result> {
  // Reference-based generation uses the gateway's multipart image-edit contract.
  const form = new FormData();
  form.set("model", "google/gemini-3.1-flash-image");
  form.set("prompt", item.prompt);
  form.set("n", "1");
  form.set("output_format", "png");
  if (item.label === "Game Motion") form.set("size", "1536x1024");
  for (const [index, source] of [imageDataUrl, heroReference].filter(Boolean).entries()) {
    const match = source!.match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/);
    if (!match)
      return { label: item.label, kind: item.kind, image: null, error: "Invalid reference image" };
    const bytes = Buffer.from(match[2], "base64");
    form.append(
      "image[]",
      new Blob([bytes], { type: match[1] }),
      `source-${index}.${match[1].split("/")[1]}`,
    );
  }
  const res = await fetch("https://ai.gateway.lovable.dev/v1/images/edits", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
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
