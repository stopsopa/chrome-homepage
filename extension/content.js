// extension/search.js
function log(msg, ...args) {
  console.log(`chrome-homepage extension ${msg}`, ...args);
}
var interrupted = false;
if (typeof window !== "undefined") {
  window.addEventListener(
    "mousedown",
    () => {
      if (!interrupted) {
        log("user interaction detected - stopping automation");
        interrupted = true;
      }
    },
    { once: true, capture: true }
  );
}
function shouldStop() {
  return interrupted;
}
function type_v2(element, value) {
  if (!element) return false;
  element.value = value;
  element.dispatchEvent(
    new Event("input", {
      bubbles: true
    })
  );
  return true;
}
var search_default = {
  chatgpt: {
    position: "bottom",
    label: "ChatGPT",
    icon: "./icons/chatgpt.png",
    search: function(query) {
      return `https://chatgpt.com/?prompt=${encodeURIComponent(query)}`;
    },
    detect: function(url2) {
      const prefix = "https://chatgpt.com";
      const detect = url2.startsWith(prefix);
      log(`url plugin '${url2}'.startsWith("${prefix}")`, detect);
      return detect;
    },
    act: async function(url2) {
      log(`chatgpt.act(): >${url2}< before wait`);
      await new Promise((resolve) => setTimeout(resolve, 2e3));
      if (shouldStop()) return;
      log(`chatgpt.act(): >${url2}< after wait`);
      try {
        const button = document.querySelector('[id="composer-submit-button"]');
        log(`chatgpt.act(): clicking button`, button);
        button.click();
        log(`chatgpt.act(): >${url2}< finished`);
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
    detect: function(url2) {
      const prefix = "https://gemini.google.com";
      const detect = url2.startsWith(prefix);
      log(`url plugin '${url2}'.startsWith("${prefix}")`, detect);
      return detect;
    },
    act: async function(url2) {
      await new Promise((resolve) => setTimeout(resolve, 2e3));
      if (shouldStop()) return;
      const prompt = new URL(url2).searchParams.get("prompt");
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
          if (shouldStop()) return;
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
  claude: {
    position: "bottom",
    label: "Claude",
    icon: "./icons/claude.png",
    search: function(query) {
      return `https://claude.ai/new?q=${encodeURIComponent(query)}`;
    },
    detect: function(url2) {
      const prefix = "https://claude.ai";
      const detect = url2.startsWith(prefix);
      log(`url plugin '${url2}'.startsWith("${prefix}")`, detect);
      return detect;
    },
    act: async function(url2) {
      await new Promise((resolve) => setTimeout(resolve, 2e3));
      if (shouldStop()) return;
      const prompt = new URL(url2).searchParams.get("q");
      if (!prompt) {
        log("claude.act(): no prompt");
        return;
      }
      const contenteditable = document.querySelector('[contenteditable="true"]');
      if (contenteditable) {
        log(`claude.act(): injecting prompt "${prompt}"`);
        let attempts = 0;
        (function attempt() {
          if (shouldStop()) return;
          attempts += 1;
          if (attempts > 5) {
            log("claude.act(): too many attempts");
            return;
          }
          if (contenteditable.textContent === "") {
            log("claude.act(): empty contenteditable - stop processing");
            return;
          }
          log(`claude.act(): attempt >${attempts}<`);
          try {
            const button = document.querySelector(`button[aria-label="Send message"]`);
            log(`claude.act(): clicking button`, button);
            button.click();
          } catch (e) {
            log("claude.act(): button not found");
          }
          setTimeout(attempt, 1e3);
        })();
      } else {
        log("claude.act(): no contenteditable");
      }
    }
  },
  perplexity: {
    position: "bottom",
    label: "Perplexity",
    icon: "./icons/perplexity.png",
    search: function(query) {
      return `https://www.perplexity.ai/?q=${encodeURIComponent(query)}`;
    }
  },
  t3: {
    position: "bottom",
    label: "T3",
    icon: "./icons/t3.png",
    search: function(query) {
      return `https://t3.chat/?q=${encodeURIComponent(query)}`;
    },
    detect: function(url2) {
      const prefix = "https://t3.chat";
      const detect = url2.startsWith(prefix);
      log(`url plugin '${url2}'.startsWith("${prefix}")`, detect);
      return detect;
    },
    act: async function(url2) {
      await new Promise((resolve) => setTimeout(resolve, 2e3));
      if (shouldStop()) return;
      const prompt = new URL(url2).searchParams.get("q");
      if (!prompt) {
        log("T3.act(): no prompt");
        return;
      }
      const contenteditable = document.querySelector('[id="chat-input"]');
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
            const button = document.querySelector(`[type="submit"]`);
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

// extension/content.ts
/** @es.ts
{
    mode: "bundle",
    extension: ".js"
}
@es.ts */var url = window.location.href;
Object.values(search_default).forEach((engine) => {
  if (engine.detect && engine.act && engine.detect(url)) {
    // Run act after a short delay to ensure DOM is ready
    // and because some pages (like Gemini) are SPAs that load content late
    const runAct = () => {
      try {
        engine.act(url);
      } catch (e) {
        console.error("Action failed:", e);
      }
    };
    if (document.readyState === "complete") {
      setTimeout(runAct, 1e3);
    } else {
      window.addEventListener("load", () => setTimeout(runAct, 1e3));
    }
  }
});
