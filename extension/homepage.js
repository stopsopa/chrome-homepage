/** @es.ts
{
    mode: "transform",
    extension: ".js"
}
@es.ts */window.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.altKey && e.code === "KeyT") {
    window.location.href = "sandbox.html";
  }
});
console.log("Homepage loaded");
