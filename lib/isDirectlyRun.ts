import { fileURLToPath } from "node:url";

/**
 * if (isDirectlyRun(import.meta.url)) {
 */
export function isDirectlyRun(importMetaUrl: string) {
  return process.argv[1] && fileURLToPath(importMetaUrl).endsWith(process.argv[1]);
}
