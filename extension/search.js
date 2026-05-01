/** @es.ts
{
    mode: "transform",
    extension: ".js"
}
@es.ts */var search_default = {
  chatgpt: {
    position: "bottom",
    label: "ChatGPT",
    icon: "./icons/chatgpt.png",
    search: function(query) {
      return `https://chatgpt.com/?prompt=${encodeURIComponent(query)}`;
    }
  },
  gemini: {
    position: "bottom",
    label: "Gemini",
    icon: "./icons/gemini.png",
    search: function(query) {
      return `https://gemini.google.com/app/?prompt=${encodeURIComponent(query)}`;
    },
    detect: function(url) {
      return url.includes("gemini.google.com");
    },
    act: function(query) {
      // extract prompt from url  use new URL()
      const prompt = new URL(query).searchParams.get("prompt");
      if (!prompt) {
        return;
      }
      const contenteditable = document.querySelector('[contenteditable="true"]');
      if (contenteditable) {
        contenteditable.textContent = prompt;
        document.querySelector("[mat-icon-button].send-button").click();
      }
    }
  },
  google: {
    position: "top",
    label: "Google",
    icon: "./icons/google.png",
    search: function(query) {
      return `https://google.com/search?q=${encodeURIComponent(query)}`;
    }
  },
  duckduckgo: {
    position: "top",
    label: "DuckDuckGo",
    icon: "./icons/duckduckgo.png",
    search: function(query) {
      return `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
    }
  },
  brave: {
    position: "top",
    label: "Brave",
    icon: "./icons/brave.png",
    search: function(query) {
      return `https://search.brave.com/search?q=${encodeURIComponent(query)}`;
    }
  },
  startpage: {
    position: "top",
    label: "Startpage",
    icon: "./icons/startpage.png",
    search: function(query) {
      return `https://www.startpage.com/do/search?q=${encodeURIComponent(query)}`;
    }
  },
  bing: {
    position: "top",
    label: "Bing",
    icon: "./icons/bing.png",
    search: function(query) {
      return `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
    }
  }
};
export {
  search_default as default
};
