import test from "node:test";
import assert from "node:assert/strict";
import { generateOne, ITEMS, MOTION, WORLD_RELICS } from "../src/lib/universe-generation.ts";
const original = "data:image/png;base64,aGVsbG8=";
const hero = "data:image/png;base64,aGVybw==";
test("generation preserves original and hero references in the production JSON contract", async () => {
  const realFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    return Response.json({ data: [{ b64_json: "Z2FtZQ==" }] });
  };
  try {
    const result = await generateOne("test-key", original, ITEMS[0]);
    assert.equal(result.image, "data:image/png;base64,Z2FtZQ==");
    await generateOne("test-key", original, MOTION, hero);
    assert.equal(requests.length, 2);
    assert.equal(requests[0].url, "https://ai.gateway.lovable.dev/v1/images/generations");
    assert.equal(requests[0].options.headers["Content-Type"], "application/json");
    assert.equal(requests[0].options.headers.Authorization, "Bearer test-key");
    const primary = JSON.parse(requests[0].options.body);
    assert.equal(primary.model, "google/gemini-3.1-flash-image-preview");
    assert.deepEqual(primary.modalities, ["image", "text"]);
    assert.deepEqual(primary.messages, [
      {
        role: "user",
        content: [
          { type: "text", text: ITEMS[0].prompt },
          { type: "image_url", image_url: { url: original } },
        ],
      },
    ]);
    const motion = JSON.parse(requests[1].options.body).messages[0].content;
    assert.deepEqual(
      motion.slice(1),
      [original, hero].map((url) => ({ type: "image_url", image_url: { url } })),
    );
    assert.match(motion[0].text, /original identity/);
    await generateOne("test-key", original, WORLD_RELICS, hero);
    const world = JSON.parse(requests[2].options.body).messages[0].content;
    assert.deepEqual(
      world.slice(1),
      [original, hero].map((url) => ({ type: "image_url", image_url: { url } })),
    );
    assert.match(world[0].text, /THREE equal vertical cells/);
  } finally {
    globalThis.fetch = realFetch;
  }
});
test("invalid references never call the provider; asset errors do not invent successful images", async () => {
  const realFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return new Response("private-provider-detail", { status: 429 });
  };
  try {
    assert.equal(
      (await generateOne("test-key", "https://untrusted.test/image", ITEMS[0])).image,
      null,
    );
    assert.equal(calls, 0);
    assert.equal(
      (await generateOne("test-key", original, MOTION, "https://untrusted.test/hero")).image,
      null,
    );
    assert.equal(calls, 0);
    const failed = await generateOne("test-key", original, MOTION, hero);
    assert.equal(failed.image, null);
    assert.equal(failed.error, "429: Asset generation unavailable");
    globalThis.fetch = async () => Response.json({ data: [] });
    assert.equal((await generateOne("test-key", original, ITEMS[0])).image, null);
  } finally {
    globalThis.fetch = realFetch;
  }
});
