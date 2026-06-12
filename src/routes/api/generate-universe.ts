import { createFileRoute } from "@tanstack/react-router";

type Body = { imageDataUrl?: string; characterName?: string };

const EXPERIENCES = [
  {
    label: "Mini Game",
    prompt:
      "Transform this character into a vibrant pixel-art sprite sheet for a retro 2D mini game: 4 poses (idle, run, jump, attack) on a clean checkerboard background. Preserve the character's colors, silhouette and personality. Crisp pixels, no anti-aliasing, playful arcade vibe.",
  },
  {
    label: "Virtual Pet",
    prompt:
      "Render this character as an adorable 3D virtual pet inside a glossy soft-shaded bubble habitat, big sparkly eyes, chibi proportions, soft studio lighting, pastel gradient backdrop. Preserve the character's colors and identity. Toy-like, collectible, Tamagotchi energy.",
  },
  {
    label: "Vinyl Toy",
    prompt:
      "Product photo of this character as a premium designer vinyl art toy figurine, glossy plastic finish, standing on a minimal pedestal, soft studio lighting, subtle shadow, neutral seamless backdrop. Preserve the character's exact look. KAWS / Pop Mart blind-box aesthetic.",
  },
  {
    label: "Trading Card",
    prompt:
      "Design a premium collectible trading card featuring this character as the centerpiece artwork. Holographic foil frame, character name banner, stat icons (HP, ATK, DEF), rarity gem, decorative border. Preserve the character's style. TCG / Pokémon-card composition, portrait orientation.",
  },
  {
    label: "Wallpaper",
    prompt:
      "Create a stunning phone wallpaper / key art featuring this character heroically posed, dramatic lighting, dynamic background with abstract shapes, particles and color splashes that match the character's palette. Preserve the character's identity. Cinematic, poster-quality, portrait 9:16 feel.",
  },
];

async function generateOne(
  apiKey: string,
  imageDataUrl: string,
  label: string,
  prompt: string,
): Promise<{ label: string; image: string | null; error?: string }> {
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
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        },
      ],
      modalities: ["image", "text"],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { label, image: null, error: `${res.status}: ${text.slice(0, 200)}` };
  }

  const json = (await res.json()) as { data?: Array<{ b64_json?: string }> };
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) return { label, image: null, error: "No image data returned" };
  return { label, image: `data:image/png;base64,${b64}` };
}

export const Route = createFileRoute("/api/generate-universe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          return Response.json({ error: "Missing LOVABLE_API_KEY" }, { status: 500 });
        }

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
          EXPERIENCES.map((e) => generateOne(apiKey, imageDataUrl, e.label, e.prompt)),
        );

        const anySuccess = results.some((r) => r.image);
        if (!anySuccess) {
          const first = results.find((r) => r.error);
          const msg = first?.error ?? "Generation failed";
          const status = msg.startsWith("402")
            ? 402
            : msg.startsWith("429")
              ? 429
              : 502;
          return Response.json({ error: msg, results }, { status });
        }

        return Response.json({ results });
      },
    },
  },
});
