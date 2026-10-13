import { createFileRoute } from "@tanstack/react-router";

type Body = { imageDataUrl?: string };

type Item = { label: string; kind: "experience" | "merch"; prompt: string };

const ITEMS: Item[] = [
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

async function generateOne(apiKey: string, imageDataUrl: string, item: Item): Promise<Result> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3.1-flash-image-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: item.prompt },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        },
      ],
      modalities: ["image", "text"],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return {
      label: item.label,
      kind: item.kind,
      image: null,
      error: `${res.status}: ${text.slice(0, 200)}`,
    };
  }

  const json = (await res.json()) as { data?: Array<{ b64_json?: string }> };
  const b64 = json.data?.[0]?.b64_json;
  if (!b64)
    return { label: item.label, kind: item.kind, image: null, error: "No image data returned" };
  return { label: item.label, kind: item.kind, image: `data:image/png;base64,${b64}` };
}

export const Route = createFileRoute("/api/generate-universe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) return Response.json({ error: "Missing LOVABLE_API_KEY" }, { status: 500 });

        let body: Body;
        try {
          body = (await request.json()) as Body;
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const { imageDataUrl } = body;
        if (!imageDataUrl || !imageDataUrl.startsWith("data:image/")) {
          return Response.json(
            { error: "imageDataUrl must be a data:image/... URL" },
            { status: 400 },
          );
        }

        const results = await Promise.all(
          ITEMS.map(async (item): Promise<Result> => {
            try {
              return await generateOne(apiKey, imageDataUrl, item);
            } catch {
              return {
                label: item.label,
                kind: item.kind,
                image: null,
                error: "Asset generation unavailable",
              };
            }
          }),
        );

        const anySuccess = results.some((r) => r.image);
        if (!anySuccess) {
          const first = results.find((r) => r.error);
          const msg = first?.error ?? "Generation failed";
          const status = msg.startsWith("402") ? 402 : msg.startsWith("429") ? 429 : 502;
          return Response.json({ error: msg, results }, { status });
        }

        return Response.json({ results });
      },
    },
  },
});
