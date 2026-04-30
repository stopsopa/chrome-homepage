import type { Bookmark } from "./types.js";

function encode(bookmark: Bookmark): string {
  return JSON.stringify(bookmark);
}
