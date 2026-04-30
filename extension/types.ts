export type Bookmark =
  | {
      type: string;
      url: string;
      [key: string]: string;
    }
  | {
      type: string;
      [key: string]: string;
    };
