import { it, determineMode } from "./utils.ts";
import assert from "node:assert/strict";


determineMode(import.meta.url);

/**
 *  CONCURRENCY=10 /bin/bash ts.sh --test test/test.parallel.test.ts
 */

it("test", () => {
  assert.strictEqual(1, 1);
});
