export type Bookmark = {
  type: string;
  title: string;
  url?: string;
  logo?: string;
  content?: string;
  x?: string;
  y?: string;
  [key: string]: string | undefined;
};

export type BookmarkStored = {
  name: string;
  url: string;
};
