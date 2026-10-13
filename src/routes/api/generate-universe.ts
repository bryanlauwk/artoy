import { createFileRoute } from "@tanstack/react-router";

type Body = { imageDataUrl?: string };

import { ITEMS, MOTION, generateOne } from "@/lib/universe-generation";

type Result = Awaited<ReturnType<typeof generateOne>>;

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
        if (
          !imageDataUrl ||
          imageDataUrl.length > 12_000_000 ||
          !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(imageDataUrl)
        ) {
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

        const hero = results.find((item) => item.label === "Game Character")?.image;
        if (hero) {
          try {
            results.push(await generateOne(apiKey, imageDataUrl, MOTION, hero));
          } catch {
            results.push({
              label: MOTION.label,
              kind: MOTION.kind,
              image: null,
              error: "Animation generation unavailable",
            });
          }
        }
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
