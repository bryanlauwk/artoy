export type Item = { label: string; kind: "experience" | "merch"; prompt: string };
export type Result = {
  label: string;
  kind: "experience" | "merch";
  image: string | null;
  error?: string;
};
const IDENTITY =
  "Use the original artwork as the identity reference. Preserve the distinctive face, silhouette, costume, markings and palette. If a second reference is supplied, it is the approved character or product: match its identity and design consistently. Do not replace it with a generic mascot. No captions, labels, watermark or UI. ";
export const ITEMS: Item[] = [
  {
    label: "Character Identity",
    kind: "experience",
    prompt:
      IDENTITY +
      "Create one polished full-body character portrait, gentle three-quarter front view, complete body visible, expressive personality. Premium illustrated collectible character style on a clean warm ivory studio background. Preserve the original artistic personality.",
  },
  {
    label: "Illustrated Universe",
    kind: "experience",
    prompt:
      IDENTITY +
      "Create one rich illustrated world starring this character. Derive architecture, accessories and landscape details from its recognizable visual motifs. A coherent miniature storybook world with a strong focal point, warm lighting, textured cream paper, expressive ink detail and restrained accents from the character palette. No game screenshot, grid, HUD or product mockup.",
  },
  {
    label: "Character Figurine",
    kind: "merch",
    prompt:
      IDENTITY +
      "Design one premium palm-sized character figurine on a simple plinth. Clear three-quarter studio product view, complete toy visible, carefully sculpted materials, restrained details, clean ivory backdrop. Preserve the approved character exactly. A tangible collectible concept, no scene, packaging or other variants.",
  },
  {
    label: "Miniature World",
    kind: "merch",
    prompt:
      IDENTITY +
      "Design one palm-sized miniature diorama of this character and its world. Integrate three meaningful motifs from the artwork into a compact cohesive scene on a simple base. Premium sculpted collectible, readable large forms, limited small details, three-quarter product photography on ivory. One design only, no electronics, text or packaging.",
  },
  {
    label: "Acrylic Charm",
    kind: "merch",
    prompt:
      IDENTITY +
      "Design one everyday collectible acrylic bag charm of this character. Full-body printed cutout, transparent acrylic edge, simple metal loop and tasteful matching accent charm. Premium realistic studio product photography, clean ivory backdrop. Preserve identity and palette, one cohesive product only.",
  },
];
export const EXPANSIONS = {
  "product-views": {
    label: "Product Views",
    kind: "experience",
    prompt:
      IDENTITY +
      "The second reference is the chosen collectible. Create one landscape product reference sheet showing exactly THREE consistent views of THAT SAME product: front, side and back, evenly spaced on a clean ivory background. Preserve geometry, base, accessories, proportions, materials and colors across views. Do not redesign, invent variants, add labels or show an exploded view. This is a visual concept, not an engineering drawing.",
  },
  packaging: {
    label: "Packaging Concept",
    kind: "experience",
    prompt:
      IDENTITY +
      "The second reference is the chosen collectible. Create one premium packaging concept for exactly that product: an illustrated presentation box, open insert holding the matching collectible, and a small character story card. Use original artwork motifs and palette for the box illustration, ivory paper, restrained graphic layout. Studio product photo, no invented brand, slogans or long text. Do not change the collectible.",
  },
  series: {
    label: "Collect the Series",
    kind: "experience",
    prompt:
      IDENTITY +
      "The second reference is the chosen collectible. Design a cohesive THREE-piece collectible series of this same character/product, side by side on ivory. Preserve the core face, silhouette and recognizable design; vary only themed accessories, scenery or color accents. Clearly related editions, no extra characters, duplicate identical products, text, numbered labels or UI.",
  },
} satisfies Record<string, Item>;
export type ExpansionType = keyof typeof EXPANSIONS;
export const isImageDataUrl = (value: unknown): value is string =>
  typeof value === "string" &&
  value.length <= 12_000_000 &&
  /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value);

/** One identity request followed by four conditioned images; no game assets or automatic expansions. */
export async function generateCollection(apiKey: string, original: string): Promise<Result[]> {
  const run = async (item: Item, reference?: string): Promise<Result> => {
    try {
      return await generateOne(apiKey, original, item, reference);
    } catch {
      return {
        label: item.label,
        kind: item.kind,
        image: null,
        error: "Asset generation unavailable",
      };
    }
  };
  const identity = await run(ITEMS[0]);
  const rest = await Promise.all(
    ITEMS.slice(1).map((item) => run(item, identity.image ?? undefined)),
  );
  return [identity, ...rest];
}

export async function generateOne(
  apiKey: string,
  imageDataUrl: string,
  item: Item,
  conceptReference?: string,
): Promise<Result> {
  const sources = conceptReference ? [imageDataUrl, conceptReference] : [imageDataUrl];
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
