function log(msg, ...args) {
  console.log(`chrome-homepage extension ${msg}`, ...args);
}
var search_default = {
  chatgpt: {
    position: "bottom",
    label: "ChatGPT",
    icon: "./icons/chatgpt.png",
    search: function(query) {
      return `https://chatgpt.com/?prompt=${encodeURIComponent(query)}`;
    },
    detect: function(url) {
      const prefix = "https://chatgpt.com";
      const detect = url.startsWith(prefix);
      log(`url plugin '${url}'.startsWith("${prefix}")`, detect);
      return detect;
    },
    act: async function(url) {
      log(`chatgpt.act(): >${url}< before wait`);
      await new Promise((resolve) => setTimeout(resolve, 2e3));
      log(`chatgpt.act(): >${url}< after wait`);
      try {
        const button = document.querySelector('[id="composer-submit-button"]');
        log(`chatgpt.act(): clicking button`, button);
        button.click();
        log(`chatgpt.act(): >${url}< finished`);
      } catch (error) {
        log(`chatgpt.act() error: >${error}<`);
      }
    }
  },
  gemini: {
    position: "bottom",
    label: "Gemini",
    icon: "./icons/gemini.png",
    search: function(query) {
      return `https://gemini.google.com/app?prompt=${encodeURIComponent(query)}`;
    },
    detect: function(url) {
      const prefix = "https://gemini.google.com";
      const detect = url.startsWith(prefix);
      log(`url plugin '${url}'.startsWith("${prefix}")`, detect);
      return detect;
    },
    act: async function(url) {
      await new Promise((resolve) => setTimeout(resolve, 2e3));
      // extract prompt from url  use new URL()
      const prompt = new URL(url).searchParams.get("prompt");
      if (!prompt) {
        log("gemini.act(): no prompt");
        return;
      }
      const contenteditable = document.querySelector('[contenteditable="true"]');
      if (contenteditable) {
        log(`gemini.act(): injecting prompt "${prompt}"`);
        contenteditable.textContent = prompt;
        let attempts = 0;
        (function attempt() {
          attempts += 1;
          if (attempts > 5) {
            log("gemini.act(): too many attempts");
            return;
          }
          if (contenteditable.textContent === "") {
            log("gemini.act(): empty contenteditable - stop processing");
            return;
          }
          log(`gemini.act(): attempt >${attempts}<`);
          try {
            const button = document.querySelector("[mat-icon-button].send-button");
            log(`gemini.act(): clicking button`, button);
            button.click();
          } catch (e) {
            log("gemini.act(): button not found");
          }
          setTimeout(attempt, 1e3);
        })();
      } else {
        log("gemini.act(): no contenteditable");
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
