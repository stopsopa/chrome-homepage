import { it, determineMode } from "./utils.ts";
import assert from "node:assert/strict";
import { serialize } from "../extension/encode.ts";
import { decode } from "../extension/decode.ts";
import type { Bookmark } from "../extension/types.ts";

determineMode(import.meta.url);

/**
 *  CONCURRENCY=10 /bin/bash ts.sh --test test/encoder.parallel.test.ts
 */

it("should serialize and decode a bookmark with a normal URL", () => {
  const bookmark: Bookmark = {
    type: "link",
    url: "https://example.com",
    title: "Example",
    extra: "data"
  };

  const serialized = serialize(bookmark);

  assert.strictEqual(serialized.name, "link:N4IgLglmA2CmIC4QFEAeBDAtgBziANCLKmAE7qIgAm6YFAvkA===");

  assert.strictEqual(serialized.url, "https://example.com");

  const decoded = decode(serialized);
  
  assert.deepStrictEqual(decoded, bookmark);
});

it("should serialize and decode a bookmark without a URL (fallback to chrome://new-tab-page)", () => {
  const bookmark: Bookmark = {
    type: "folder",
    title: "My Folder",
    color: "blue"
  };

  const serialized = serialize(bookmark);
  
  assert.ok(serialized.name.startsWith("folder:"), "Name should start with type followed by colon");
  assert.strictEqual(serialized.url, "chrome://new-tab-page");

  const decoded = decode(serialized);
  
  // The decoded bookmark should NOT have the url property if it was chrome://new-tab-page
  assert.deepStrictEqual(decoded, bookmark);
  assert.strictEqual((decoded as any).url, undefined);
});

it("should handle bookmark with chrome://new-tab-page explicitly", () => {
  const bookmark: Bookmark = {
    type: "special",
    url: "chrome://new-tab-page",
    description: "Home"
  };

  const serialized = serialize(bookmark);
  assert.strictEqual(serialized.url, "chrome://new-tab-page");

  const decoded = decode(serialized);
  
  // Requirement says: when url is 'chrome://new-tab-page' then we should generate variant without url
  const expected: Bookmark = {
    type: "special",
    description: "Home"
  };
  assert.deepStrictEqual(decoded, expected);
});

it("should throw error if type is missing", () => {
  const bookmark = {
    url: "https://example.com"
  } as any;

  assert.throws(() => {
    serialize(bookmark);
  }, /Bookmark type is required/);
});
