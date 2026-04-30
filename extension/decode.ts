import type { Bookmark } from "./types.js";

function decode(str: string): Bookmark {
  return {
    type: 'url',    
    url: 'https://stopsopa.github.io',
  };
}
