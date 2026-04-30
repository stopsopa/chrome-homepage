/** @es.ts
{
    mode: "bundle",
    extension: ".js"
}
@es.ts */
import LZString from "lz-string";
import type { Bookmark, BookmarkStored } from "./types.js";

export function serialize(bookmark: Bookmark): BookmarkStored {
  const { type, url, ...rest } = bookmark;
  const finalUrl = url || "chrome://new-tab-page";

  if (!type) {
    throw new Error("Bookmark type is required");
  }

  const serializedRest = LZString.compressToBase64(JSON.stringify(rest));
  const name = `${type}:${serializedRest}`;

  if (!name || !finalUrl) {
    throw new Error("Produced name and url cannot be empty");
  }

  return { name, url: finalUrl };
}
