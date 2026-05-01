/** @es.ts
{
    mode: "transform",
    extension: ".js"
}
@es.ts */
export default {
  chatgpt: {
    position: "bottom",
    label: "ChatGPT",
    icon: "./icons/chatgpt.png",
    search: function (query: string) {
      return `https://chatgpt.com/?prompt=${encodeURIComponent(query)}`;
    },
  },
  gemini: {
    position: "bottom",
    label: "Gemini",
    icon: "./icons/gemini.png",
    search: function (query: string) {
      return `https://gemini.google.com/app/?prompt=${encodeURIComponent(query)}`;
    },
    detect: function (url: string) {
      return url.includes("gemini.google.com");
    },
    act: function (query: string) {
      // extract prompt from url  use new URL()
      const prompt = new URL(query).searchParams.get("prompt");

      if (!prompt) {
        return;
      }

      const contenteditable = document.querySelector('[contenteditable="true"]');

      if (contenteditable) {
        (contenteditable as HTMLElement).textContent = prompt;
        (document.querySelector("[mat-icon-button].send-button") as HTMLElement).click();
      }
    },
  },
  google: {
    position: "top",
    label: "Google",
    icon: "./icons/google.png",
    search: function (query: string) {
      return `https://google.com/search?q=${encodeURIComponent(query)}`;
    },
  },
  duckduckgo: {
    position: "top",
    label: "DuckDuckGo",
    icon: "./icons/duckduckgo.png",
    search: function (query: string) {
      return `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
    },
  },
  brave: {
    position: "top",
    label: "Brave",
    icon: "./icons/brave.png",
    search: function (query: string) {
      return `https://search.brave.com/search?q=${encodeURIComponent(query)}`;
    },
  },
  startpage: {
    position: "top",
    label: "Startpage",
    icon: "./icons/startpage.png",
    search: function (query: string) {
      return `https://www.startpage.com/do/search?q=${encodeURIComponent(query)}`;
    },
  },
  bing: {
    position: "top",
    label: "Bing",
    icon: "./icons/bing.png",
    search: function (query: string) {
      return `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
    },
  },
};
