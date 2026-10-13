import test from "node:test";
import assert from "node:assert/strict";
import {
  generateOne,
  generateCollection,
  ITEMS,
  EXPANSIONS,
  isImageDataUrl,
} from "../src/lib/universe-generation.ts";
const original = "data:image/png;base64,aGVsbG8=";
const approved = "data:image/png;base64,YXBwcm92ZWQ=";
test("initial collection spends exactly five requests and conditions downstream designs on one identity", async () => {
  const realFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options, body: JSON.parse(options.body) });
    return Response.json({ data: [{ b64_json: "YXBwcm92ZWQ=" }] });
  };
  try {
    const results = await generateCollection("test-key", original);
    assert.equal(requests.length, 5);
    assert.equal(results.length, 5);
    assert.equal(results.filter((x) => x.kind === "merch").length, 3);
    assert.equal(requests[0].url, "https://ai.gateway.lovable.dev/v1/images/generations");
    assert.equal(requests[0].options.headers.Authorization, "Bearer test-key");
    assert.equal(requests[0].body.model, "google/gemini-3.1-flash-image-preview");
    assert.deepEqual(requests[0].body.messages[0].content.slice(1), [
      { type: "image_url", image_url: { url: original } },
    ]);
    for (const request of requests.slice(1))
      assert.deepEqual(
        request.body.messages[0].content.slice(1),
        [original, approved].map((url) => ({ type: "image_url", image_url: { url } })),
      );
    assert.ok(results.every((x) => x.image));
    assert.ok(results.every((x) => !/Game|Motion|Relics/.test(x.label)));
    requests.length = 0;
    await generateOne("test-key", original, EXPANSIONS.packaging, approved);
    assert.equal(requests.length, 1, "expansion generates one image only");
    assert.deepEqual(
      requests[0].body.messages[0].content.slice(1),
      [original, approved].map((url) => ({ type: "image_url", image_url: { url } })),
    );
  } finally {
    globalThis.fetch = realFetch;
  }
});
test("malformed references do not call provider and failed identity preserves partial collection", async () => {
  const realFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    if (calls === 1) return new Response("private-provider-detail", { status: 429 });
    return Response.json({ data: [{ b64_json: "YXBwcm92ZWQ=" }] });
  };
  try {
    assert.equal(isImageDataUrl("https://untrusted.test/image"), false);
    assert.equal(isImageDataUrl("data:image/png;base64,"), false);
    assert.equal(
      (await generateOne("key", original, EXPANSIONS.series, "https://untrusted.test/hero")).image,
      null,
    );
    assert.equal(calls, 0);
    const results = await generateCollection("key", original);
    assert.equal(calls, 5);
    assert.equal(results[0].error, "429: Asset generation unavailable");
    assert.equal(results.filter((x) => x.image).length, 4);
    globalThis.fetch = async () => Response.json({ data: [] });
    assert.equal((await generateOne("key", original, ITEMS[0])).image, null);
  } finally {
    globalThis.fetch = realFetch;
  }
});
