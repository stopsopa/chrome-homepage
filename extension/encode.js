import LZString from "lz-string";
function serialize(bookmark) {
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
export {
  serialize
};
