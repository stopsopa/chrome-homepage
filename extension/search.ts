function log(msg: string, ...args: any[]) {
  console.log(`chrome-homepage extension ${msg}`, ...args);
}

let interrupted = false;

if (typeof window !== "undefined") {
  window.addEventListener(
    "mousedown",
    () => {
      if (!interrupted) {
        log("user interaction detected - stopping automation");
        interrupted = true;
      }
    },
    { once: true, capture: true },
  );
}

function shouldStop() {
  return interrupted;
}

function type_v2(element: HTMLElement, value: string) {
  if (!element) return false;

  (element as any).value = value;

  element.dispatchEvent(
    new Event("input", {
      bubbles: true,
    }),
  );

  return true;
}

export default {
  chatgpt: {
    position: "bottom",
    label: "ChatGPT",
    icon: "./icons/chatgpt.png",
    search: function (query: string) {
      return `https://chatgpt.com/?prompt=${encodeURIComponent(query)}`;
    },
    detect: function (url: string) {
      const prefix = "https://chatgpt.com";

      const detect = url.startsWith(prefix);

      log(`url plugin '${url}'.startsWith("${prefix}")`, detect);

      return detect;
    },
    act: async function (url: string) {
      log(`chatgpt.act(): >${url}< before wait`);

      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (shouldStop()) return;
      log(`chatgpt.act(): >${url}< after wait`);

      try {
        const button = document.querySelector('[id="composer-submit-button"]') as HTMLElement;

        log(`chatgpt.act(): clicking button`, button);

        button.click();

        log(`chatgpt.act(): >${url}< finished`);
      } catch (error) {
        log(`chatgpt.act() error: >${error}<`);
      }
    },
  },
  gemini: {
    position: "bottom",
    label: "Gemini",
    icon: "./icons/gemini.png",
    search: function (query: string) {
      return `https://gemini.google.com/app?prompt=${encodeURIComponent(query)}`;
    },
    detect: function (url: string) {
      const prefix = "https://gemini.google.com";

      const detect = url.startsWith(prefix);

      log(`url plugin '${url}'.startsWith("${prefix}")`, detect);

      return detect;
    },
    act: async function (url: string) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (shouldStop()) return;

      // extract prompt from url  use new URL()
      const prompt = new URL(url).searchParams.get("prompt");

      if (!prompt) {
        log("gemini.act(): no prompt");
        return;
      }

      const contenteditable = document.querySelector('[contenteditable="true"]');

      if (contenteditable) {
        log(`gemini.act(): injecting prompt "${prompt}"`);

        (contenteditable as HTMLElement).textContent = prompt;

        let attempts = 0;

        (function attempt() {
          if (shouldStop()) return;
          attempts += 1;

          if (attempts > 5) {
            log("gemini.act(): too many attempts");

            return;
          }

          if ((contenteditable as HTMLElement).textContent === "") {
            log("gemini.act(): empty contenteditable - stop processing");

            return;
          }

          log(`gemini.act(): attempt >${attempts}<`);

          try {
            const button = document.querySelector("[mat-icon-button].send-button") as HTMLElement;

            log(`gemini.act(): clicking button`, button);

            button.click();
          } catch (e) {
            log("gemini.act(): button not found");
          }

          setTimeout(attempt, 1000);
        })();
      } else {
        log("gemini.act(): no contenteditable");
      }
    },
  },

  claude: {
    position: "bottom",
    label: "Claude",
    icon: "./icons/claude.png",
    search: function (query: string) {
      return `https://claude.ai/new?q=${encodeURIComponent(query)}`;
    },
    detect: function (url: string) {
      const prefix = "https://claude.ai";

      const detect = url.startsWith(prefix);

      log(`url plugin '${url}'.startsWith("${prefix}")`, detect);

      return detect;
    },
    act: async function (url: string) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (shouldStop()) return;

      // extract prompt from url  use new URL()
      const prompt = new URL(url).searchParams.get("q");

      if (!prompt) {
        log("claude.act(): no prompt");
        return;
      }

      const contenteditable = document.querySelector('[contenteditable="true"]');

      if (contenteditable) {
        log(`claude.act(): injecting prompt "${prompt}"`);

        // no need to inject since claude seems to ingest 'q' from url automatically
        // (contenteditable as HTMLElement).textContent = prompt;

        let attempts = 0;

        (function attempt() {
          if (shouldStop()) return;
          attempts += 1;

          if (attempts > 5) {
            log("claude.act(): too many attempts");

            return;
          }

          if ((contenteditable as HTMLElement).textContent === "") {
            log("claude.act(): empty contenteditable - stop processing");

            return;
          }

          log(`claude.act(): attempt >${attempts}<`);

          try {
            const button = document.querySelector(`button[aria-label="Send message"]`) as HTMLElement;

            log(`claude.act(): clicking button`, button);

            button.click();
          } catch (e) {
            log("claude.act(): button not found");
          }

          setTimeout(attempt, 1000);
        })();
      } else {
        log("claude.act(): no contenteditable");
      }
    },
  },

  perplexity: {
    position: "bottom",
    label: "Perplexity",
    icon: "./icons/perplexity.png",
    search: function (query: string) {
      return `https://www.perplexity.ai/?q=${encodeURIComponent(query)}`;
    },
  },

  t3: {
    position: "bottom",
    label: "T3",
    icon: "./icons/t3.png",
    search: function (query: string) {
      return `https://t3.chat/?q=${encodeURIComponent(query)}`;
    },
    detect: function (url: string) {
      const prefix = "https://t3.chat";

      const detect = url.startsWith(prefix);

      log(`url plugin '${url}'.startsWith("${prefix}")`, detect);

      return detect;
    },
    act: async function (url: string) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (shouldStop()) return;

      // extract prompt from url  use new URL()
      const prompt = new URL(url).searchParams.get("q");

      if (!prompt) {
        log("T3.act(): no prompt");

        return;
      }
      const contenteditable = document.querySelector('[id="chat-input"]') as HTMLInputElement;

      if (contenteditable) {
        log(`T3.act(): injecting prompt "${prompt}"`);

        type_v2(contenteditable, prompt);

        let attempts = 0;

        (function attempt() {
          if (shouldStop()) return;
          attempts += 1;
          if (attempts > 5) {
            log("T3.act(): too many attempts");

            return;
          }
          if (contenteditable.value === "") {
            log("T3.act(): empty contenteditable - stop processing");

            return;
          }
          log(`T3.act(): attempt >${attempts}<`);
          try {
            const button = document.querySelector(`[type="submit"]`) as HTMLButtonElement;

            log(`T3.act(): clicking button`, button);

            button.click();
          } catch (e) {
            log("T3.act(): button not found");
          }

          setTimeout(attempt, 1e3);
        })();
      } else {
        log("T3.act(): no contenteditable");
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
