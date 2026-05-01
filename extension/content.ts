/** @es.ts
{
    mode: "transform",
    extension: ".js"
}
@es.ts */
import engines from "./search.js";

const url = window.location.href;

Object.values(engines).forEach((engine: any) => {
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
      setTimeout(runAct, 1000);
    } else {
      window.addEventListener("load", () => setTimeout(runAct, 1000));
    }
  }
});
