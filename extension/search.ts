export default {
  google: {
    label: "Google",
    icon: "./icons/google.png",
    search: function (query: string) {
      return `https://google.com/search?q=${encodeURIComponent(query)}`;
    },
  },
  duckduckgo: {
    label: "DuckDuckGo",
    icon: "./icons/duckduckgo.png",
    search: function (query: string) {
      return `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
    },
  },
  brave: {
    label: "Brave",
    icon: "./icons/brave.png",
    search: function (query: string) {
      return `https://search.brave.com/search?q=${encodeURIComponent(query)}`;
    },
  },
  startpage: {
    label: "Startpage",
    icon: "./icons/startpage.png",
    search: function (query: string) {
      return `https://www.startpage.com/do/search?q=${encodeURIComponent(query)}`;
    },
  },
  bing: {
    label: "Bing",
    icon: "./icons/bing.png",
    search: function (query: string) {
      return `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
    },
  },
};
