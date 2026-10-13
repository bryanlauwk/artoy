import { createFileRoute } from "@tanstack/react-router";
import {
  EXPANSIONS,
  ITEMS,
  generateCollection,
  generateOne,
  isImageDataUrl,
  type ExpansionType,
  type Result,
} from "@/lib/universe-generation";
const headers = { "X-ARTOY-Generation-Contract": "collection-json-v2" };
export const Route = createFileRoute("/api/generate-universe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey)
          return Response.json({ error: "Generation unavailable" }, { status: 500, headers });
        let body: {
          imageDataUrl?: unknown;
          mode?: unknown;
          expansion?: unknown;
          conceptLabel?: unknown;
          conceptImageDataUrl?: unknown;
        };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400, headers });
        }
        if (!body || !isImageDataUrl(body.imageDataUrl))
          return Response.json(
            { error: "Choose a valid PNG, JPG or WebP reference" },
            { status: 400, headers },
          );
        if (body.mode !== undefined && body.mode !== "initial" && body.mode !== "detail")
          return Response.json({ error: "Invalid generation mode" }, { status: 400, headers });
        let results: Result[];
        if (body.mode === "detail") {
          if (
            typeof body.expansion !== "string" ||
            !Object.hasOwn(EXPANSIONS, body.expansion) ||
            !ITEMS.some((item) => item.kind === "merch" && item.label === body.conceptLabel) ||
            !isImageDataUrl(body.conceptImageDataUrl)
          )
            return Response.json(
              { error: "Choose a collectible and a valid expansion" },
              { status: 400, headers },
            );
          const item = EXPANSIONS[body.expansion as ExpansionType];
          try {
            results = [
              await generateOne(apiKey, body.imageDataUrl, item, body.conceptImageDataUrl),
            ];
          } catch {
            results = [
              {
                label: item.label,
                kind: item.kind,
                image: null,
                error: "Asset generation unavailable",
              },
            ];
          }
        } else results = await generateCollection(apiKey, body.imageDataUrl);
        if (!results.some((item) => item.image)) {
          const error = results.find((item) => item.error)?.error ?? "Generation failed";
          const status = error.startsWith("402") ? 402 : error.startsWith("429") ? 429 : 502;
          return Response.json({ error, results }, { status, headers });
        }
        return Response.json({ results }, { headers });
      },
    },
  },
});
