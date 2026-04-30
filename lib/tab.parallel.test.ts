import tab from "./tab.ts";

import assert from "node:assert/strict";

import { test } from "node:test";

/**
 * PREFIXES="PROJECT1" /bin/bash ts.sh --test lib/tab.parallel.test.ts
 */
test("tab", () => {
  const str = "a\nb\nc";
  const result = tab(str);
  assert.strictEqual(result, "  a\n  b\n  c");
});
