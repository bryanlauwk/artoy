import { createFileRoute } from "@tanstack/react-router";
import signatureBoxStyle from "@/assets/artoy/case-study/lunarie-packaging-v2.webp?inline";
import {
  EXPANSIONS,
  ITEMS,
  generateCollection,
  generateOne,
  generatePresentation,
  packagingItem,
  isImageDataUrl,
  type ExpansionType,
  type Result,
} from "@/lib/universe-generation";
const headers = { "X-ARTOY-Generation-Contract": "collection-json-v4" };
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
          characterName?: unknown;
          itemLabel?: unknown;
          identityImageDataUrl?: unknown;
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
        if (
          body.mode !== undefined &&
          body.mode !== "initial" &&
          body.mode !== "detail" &&
          body.mode !== "retry"
        )
          return Response.json({ error: "Invalid generation mode" }, { status: 400, headers });
        let results: Result[];
        const characterName =
          typeof body.characterName === "string" ? body.characterName.slice(0, 60) : undefined;
        if (body.mode === "retry") {
          const item = ITEMS.find((item) => item.label === body.itemLabel);
          if (
            !item ||
            (body.identityImageDataUrl !== undefined && !isImageDataUrl(body.identityImageDataUrl))
          )
            return Response.json(
              { error: "Choose a valid collection image" },
              { status: 400, headers },
            );
          try {
            results = [
              await generateOne(
                apiKey,
                body.imageDataUrl,
                item,
                body.identityImageDataUrl as string | undefined,
              ),
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
        } else if (body.mode === "detail") {
          if (
            typeof body.expansion !== "string" ||
            (body.expansion !== "complete" && !Object.hasOwn(EXPANSIONS, body.expansion)) ||
            !ITEMS.some((item) => item.kind === "merch" && item.label === body.conceptLabel) ||
            !isImageDataUrl(body.conceptImageDataUrl)
          )
            return Response.json(
              { error: "Choose a collectible and a valid expansion" },
              { status: 400, headers },
            );
          if (body.expansion === "complete") {
            results = await generatePresentation(
              apiKey,
              body.imageDataUrl,
              body.conceptImageDataUrl,
              characterName,
              signatureBoxStyle,
            );
          } else {
            const item =
              body.expansion === "packaging"
                ? packagingItem(characterName)
                : EXPANSIONS[body.expansion as ExpansionType];
            try {
              results = [
                await generateOne(
                  apiKey,
                  body.imageDataUrl,
                  item,
                  body.conceptImageDataUrl,
                  body.expansion === "packaging" ? signatureBoxStyle : undefined,
                ),
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
