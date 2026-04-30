/** @es.ts
{
    mode: "bundle",
    extension: ".js"
}
@es.ts */
import LZString from "lz-string";
import type { Bookmark, BookmarkStored } from "./types.js";

export function decode(data: BookmarkStored): Bookmark {
  const { name, url } = data;
  const firstColonIndex = name.indexOf(":");

  if (firstColonIndex === -1) {
    throw new Error("Invalid encoded name format");
  }

  const type = name.substring(0, firstColonIndex);
  const serializedRest = name.substring(firstColonIndex + 1);

  const decompressed = LZString.decompressFromBase64(serializedRest);
  if (decompressed === null) {
    throw new Error("Failed to decompress name");
  }

  const rest = JSON.parse(decompressed);

  if (url === "chrome://new-tab-page") {
    return {
      type,
      ...rest,
    } as Bookmark;
  }

  return {
    type,
    url,
    ...rest,
  } as Bookmark;
}
