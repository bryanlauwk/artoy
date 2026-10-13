import test from "node:test";
import assert from "node:assert/strict";
import { generateOne, ITEMS, MOTION, WORLD_RELICS } from "../src/lib/universe-generation.ts";
const original = "data:image/png;base64,aGVsbG8=";
const hero = "data:image/png;base64,aGVybw==";
test("identity and motion requests upload references through the multipart edit contract", async () => {
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
    assert.equal(requests[0].url, "https://ai.gateway.lovable.dev/v1/images/edits");
    assert.equal(requests[0].options.headers["Content-Type"], undefined);
    assert.equal(requests[0].options.body.getAll("image[]").length, 1);
    const form = requests[1].options.body;
    assert.equal(form.get("size"), "1536x1024");
    assert.equal(form.getAll("image[]").length, 2);
    assert.equal(await form.getAll("image[]")[0].text(), "hello");
    assert.equal(await form.getAll("image[]")[1].text(), "hero");
    assert.match(form.get("prompt"), /original identity/);
    await generateOne("test-key", original, WORLD_RELICS, hero);
    const world = requests[2].options.body;
    assert.equal(world.get("size"), "2048x512");
    assert.equal(world.getAll("image[]").length, 2);
    assert.equal(await world.getAll("image[]")[1].text(), "hero");
    assert.match(world.get("prompt"), /THREE equal cells/);
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
    const failed = await generateOne("test-key", original, MOTION, hero);
    assert.equal(failed.image, null);
    assert.equal(failed.error, "429: Asset generation unavailable");
    globalThis.fetch = async () => Response.json({ data: [] });
    assert.equal((await generateOne("test-key", original, ITEMS[0])).image, null);
  } finally {
    globalThis.fetch = realFetch;
  }
});
