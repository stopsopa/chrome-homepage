/** @es.ts
{
    mode: "transform",
    extension: ".js"
}
@es.ts */import { serialize, decode } from "./modules.js";
console.log("Homepage script initializing...");
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").then((reg) => {
    console.log("SW registered", reg);
  }).catch((err) => {
    console.error("SW registration failed", err);
  });
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SW_IMAGE_STATUS") {
      const { url, status, error } = event.data;
      if (status === "HIT") {
        console.log(`%c[SW CACHE HIT] %c${url}`, "color: #10b981; font-weight: bold;", "color: inherit;");
      } else if (status === "MISS_CACHED") {
        console.log(`%c[SW CACHE SAVE] %c${url}`, "color: #3b82f6; font-weight: bold;", "color: inherit;");
      } else if (status === "MISS_NOT_CACHED") {
        console.log(`%c[SW BYPASS NO-CACHE] %c${url}`, "color: #f59e0b; font-weight: bold;", "color: inherit;");
      } else if (status === "ERROR_FALLBACK") {
        console.log(`%c[SW ERROR FALLBACK] %c${url} %c(Error: ${error || "Unknown"})`, "color: #ef4444; font-weight: bold;", "color: inherit;", "color: #ef4444; font-style: italic;");
      }
    }
  });
}
const editToggle = document.getElementById("edit-toggle");
const gridContainer = document.getElementById("grid-container");
const addBtn = document.getElementById("add-bookmark");
const bookmarkDialog = document.getElementById("bookmark-dialog");
const bookmarkForm = document.getElementById("bookmark-form");
const dialogCancel = document.getElementById("dialog-cancel");
const headerPanel = document.getElementById("header-panel");
const headerToggle = document.getElementById("header-toggle");
const headerHide = document.getElementById("header-hide");
let isEditMode = false;
let currentFolderId = null;
let currentEditId = null;
headerToggle.addEventListener("click", () => {
  headerPanel.classList.remove("hidden");
});
headerHide.addEventListener("click", () => {
  headerPanel.classList.add("hidden");
  // Also exit edit mode when hiding
  if (isEditMode) {
    isEditMode = false;
    document.body.classList.remove("edit-mode");
    editToggle.classList.remove("active");
    addBtn.classList.add("hidden");
  }
});
let dragElement = null;
let dragStartX = 0;
let dragStartY = 0;
let initialX = 0;
let initialY = 0;
// Bookmark Management
async function getFolder() {
  if (currentFolderId) return currentFolderId;
  const barId = "1";
  let folder;
  try {
    const children = await chrome.bookmarks.getChildren(barId);
    folder = children.find((c) => c.title === "_" && !c.url);
  } catch (e) {
  }
  if (!folder) {
    const tree = await chrome.bookmarks.getTree();
    const find = (nodes) => {
      for (const n of nodes) {
        if (n.title === "_" && !n.url) return n;
        if (n.children) {
          const f = find(n.children);
          if (f) return f;
        }
      }
    };
    folder = find(tree);
  }
  if (!folder) {
    folder = await chrome.bookmarks.create({ parentId: barId, title: "_" });
  }
  currentFolderId = folder.id;
  return folder.id;
}
async function loadData() {
  const folderId = await getFolder();
  const items = await chrome.bookmarks.getChildren(folderId);
  // Cache flushing logic
  const iconUrls = items.map((item) => {
    try {
      const data = decode({ name: item.title, url: item.url || "" });
      return data.logo || "";
    } catch (e) {
      return "";
    }
  }).filter(Boolean).sort().join("|");
  if (localStorage.getItem("icon_cache_hash") !== iconUrls) {
    if ("caches" in window) {
      console.log("Icons changed or new icon introduced, flushing cache...");
      await caches.delete("images");
    }
    localStorage.setItem("icon_cache_hash", iconUrls);
  }
  gridContainer.innerHTML = "";
  items.forEach((item) => {
    try {
      const data = decode({ name: item.title, url: item.url || "" });
      if (data.type !== "skill") {
        renderBookmark(item);
      }
    } catch (e) {
    }
  });
}
function renderBookmark(bm) {
  const data = decode({ name: bm.title, url: bm.url || "" });
  const a = document.createElement("a");
  a.className = "bookmark";
  a.href = bm.url || "";
  a.dataset.id = bm.id;
  a.tabIndex = 0;
  a.style.left = `${data.x || 100}px`;
  a.style.top = `${data.y || 100}px`;
  a.innerHTML = `
        <div class="bookmark-icon"><img src="${data.logo || ""}"></div>
        <div class="bookmark-title">${data.title || "No Title"}</div>
        <div class="bookmark-actions">
            <button class="action-btn btn-edit" data-id="${bm.id}">e</button>
            <button class="action-btn btn-del" data-id="${bm.id}">x</button>
        </div>
    `;
  a.addEventListener("mousedown", startDrag);
  a.addEventListener("click", (e) => {
    if (isEditMode) {
      e.preventDefault();
    }
  });
  a.querySelector(".btn-edit").addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openEdit(bm.id);
  });
  a.querySelector(".btn-del").addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    removeBookmark(bm.id);
  });
  gridContainer.appendChild(a);
}
// Drag & Drop
function startDrag(e) {
  if (!isEditMode) return;
  const target = e.target;
  if (!target.closest(".bookmark-icon")) return;
  if (target.closest(".bookmark-actions")) return;
  e.preventDefault();
  dragElement = e.currentTarget;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  initialX = parseInt(dragElement.style.left);
  initialY = parseInt(dragElement.style.top);
  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", stopDrag);
}
function onDrag(e) {
  if (!dragElement) return;
  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;
  const newX = Math.round((initialX + dx) / 10) * 10;
  const newY = Math.round((initialY + dy) / 10) * 10;
  dragElement.style.left = `${newX}px`;
  dragElement.style.top = `${newY}px`;
}
async function stopDrag() {
  if (!dragElement) return;
  const id = dragElement.dataset.id;
  const x = parseInt(dragElement.style.left);
  const y = parseInt(dragElement.style.top);
  const [bm] = await chrome.bookmarks.get(id);
  const data = decode({ name: bm.title, url: bm.url || "" });
  data.x = x.toString();
  data.y = y.toString();
  const { name, url } = serialize(data);
  await chrome.bookmarks.update(id, { title: name, url });
  dragElement = null;
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
}
// Edit Mode
editToggle.addEventListener("click", () => {
  isEditMode = !isEditMode;
  document.body.classList.toggle("edit-mode", isEditMode);
  editToggle.classList.toggle("active", isEditMode);
  addBtn.classList.toggle("hidden", !isEditMode);
});
// Bookmark Dialog
addBtn.addEventListener("click", () => {
  currentEditId = null;
  bookmarkForm.reset();
  bookmarkDialog.showModal();
});
dialogCancel.addEventListener("click", () => bookmarkDialog.close());
async function openEdit(id) {
  currentEditId = id;
  const [bm] = await chrome.bookmarks.get(id);
  const data = decode({ name: bm.title, url: bm.url || "" });
  bookmarkForm.elements.namedItem("title").value = data.title || "";
  bookmarkForm.elements.namedItem("url").value = bm.url || "";
  bookmarkForm.elements.namedItem("logo").value = data.logo || "";
  bookmarkDialog.showModal();
}
async function removeBookmark(id) {
  if (confirm("Delete this bookmark?")) {
    await chrome.bookmarks.remove(id);
    loadData();
  }
}
bookmarkForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(bookmarkForm);
  const folderId = await getFolder();
  let data = {
    type: "link",
    title: fd.get("title") || "",
    logo: fd.get("logo") || "",
    url: fd.get("url") || ""
  };
  if (currentEditId) {
    const [bm] = await chrome.bookmarks.get(currentEditId);
    const old = decode({ name: bm.title, url: bm.url || "" });
    data.x = old.x;
    data.y = old.y;
    const { name, url } = serialize(data);
    await chrome.bookmarks.update(currentEditId, { title: name, url });
  } else {
    data.x = "100";
    data.y = "100";
    const { name, url } = serialize(data);
    await chrome.bookmarks.create({ parentId: folderId, title: name, url });
  }
  bookmarkDialog.close();
  loadData();
});
const wallpaperEl = document.getElementById("wallpaper");
const wpSettingsOpenBtn = document.getElementById("wallpaper-settings-open");
const wpReloadBtn = document.getElementById("wallpaper-reload");
const wpDialog = document.getElementById("wallpaper-dialog");
const wpDialogCloseBtn = document.getElementById("wallpaper-dialog-close");
const brightnessInput = document.getElementById("brightness");
const saturationInput = document.getElementById("saturation");
const contrastInput = document.getElementById("contrast");
const brightnessEnabledCb = document.getElementById("brightnessEnabled");
const saturationEnabledCb = document.getElementById("saturationEnabled");
const contrastEnabledCb = document.getElementById("contrastEnabled");
const brightnessValueEl = document.getElementById("brightnessValue");
const saturationValueEl = document.getElementById("saturationValue");
const contrastValueEl = document.getElementById("contrastValue");
const animationEnabledCb = document.getElementById("animationEnabled");
const animationSpeedInput = document.getElementById("animationSpeed");
const animationSpeedValueEl = document.getElementById("animationSpeedValue");
function todayString(d = /* @__PURE__ */ new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
/**
 * Checks whether a saved timestamp or date string belongs to today (local time).
 * Returns true if both match the current calendar day, false otherwise.
 */
function isSameDay(savedTime, savedDate) {
  const today = todayString();
  if (savedDate && savedDate === today) {
    return true;
  }
  if (savedTime) {
    const ms = Number(savedTime);
    if (isNaN(ms)) {
      const parsed = new Date(savedTime);
      if (isNaN(parsed.getTime())) {
        return false;
      }
      return todayString(parsed) === today;
    }
    if (ms > 0) {
      return todayString(new Date(ms)) === today;
    }
  }
  return false;
}
/**
 * Extracts average color from the wallpaper image using an offscreen canvas
 * and applies it to --backgroundColor on the root element.
 */
function updateBackgroundColorFromImage(url) {
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.onload = () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        const color = `rgb(${r}, ${g}, ${b})`;
        document.documentElement.style.setProperty("--backgroundColor", color);
        localStorage.setItem("wallpaper_bg_color", color);
      }
    } catch (e) {
      console.warn("Could not extract image color:", e);
    }
  };
  img.src = url;
}
/**
 * Generates a fresh seeded picsum URL and follows HTTP redirect to obtain the
 * final static image URL (e.g. fastly.picsum.photos/id/...).
 * Using a seed and storing the resolved URL ensures the image remains identical across reloads.
 */
async function getFreshImage() {
  const seed = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  const seededUrl = `https://picsum.photos/seed/${seed}/1920/1080`;
  try {
    const response = await fetch(seededUrl);
    if (response.ok && response.url) {
      console.log("[Wallpaper] Resolved final static image URL:", response.url);
      return response.url;
    }
  } catch (e) {
    console.warn("[Wallpaper] Fetch failed, fallback to seeded URL:", e);
  }
  return seededUrl;
}
function applyWallpaperUrl(url) {
  const now = /* @__PURE__ */ new Date();
  console.log("[Wallpaper] Applying:", url, "at", now.toISOString());
  wallpaperEl.style.backgroundImage = `url("${url}")`;
  localStorage.setItem("wallpaper_url", url);
  localStorage.setItem("wallpaper_time", now.getTime().toString());
  localStorage.setItem("wallpaper_date", todayString(now));
  updateBackgroundColorFromImage(url);
}
async function initWallpaper() {
  const cachedUrl = localStorage.getItem("wallpaper_url");
  const cachedTime = localStorage.getItem("wallpaper_time");
  const cachedDate = localStorage.getItem("wallpaper_date");
  const sameDay = isSameDay(cachedTime, cachedDate);
  const isCleanCachedUrl = Boolean(cachedUrl && !cachedUrl.includes("?random="));
  console.log("[Wallpaper] Stored date:", cachedDate, "stored time:", cachedTime, "today:", todayString(), "sameDay:", sameDay, "isClean:", isCleanCachedUrl);
  if (isCleanCachedUrl && sameDay) {
    // Same day — reuse cached URL, no network request needed
    console.log("[Wallpaper] Reusing cached URL for today:", cachedUrl);
    wallpaperEl.style.backgroundImage = `url("${cachedUrl}")`;
    const cachedBgColor = localStorage.getItem("wallpaper_bg_color");
    if (cachedBgColor) {
      document.documentElement.style.setProperty("--backgroundColor", cachedBgColor);
    }
    updateBackgroundColorFromImage(cachedUrl);
    return;
  }
  // New day (or first run) — fetch a fresh image
  console.log("[Wallpaper] New day or first run — fetching fresh image");
  const freshUrl = await getFreshImage();
  applyWallpaperUrl(freshUrl);
}
function loadWallpaperSettings() {
  const brightness = localStorage.getItem("wp_brightness");
  const brightnessOn = localStorage.getItem("wp_brightness_on");
  const saturation = localStorage.getItem("wp_saturation");
  const saturationOn = localStorage.getItem("wp_saturation_on");
  const contrast = localStorage.getItem("wp_contrast");
  const contrastOn = localStorage.getItem("wp_contrast_on");
  const animOn = localStorage.getItem("wp_anim_on");
  const animSpeed = localStorage.getItem("wp_anim_speed");
  if (brightness !== null) brightnessInput.value = brightness;
  if (brightnessOn !== null) brightnessEnabledCb.checked = brightnessOn === "1";
  if (saturation !== null) saturationInput.value = saturation;
  if (saturationOn !== null) saturationEnabledCb.checked = saturationOn === "1";
  if (contrast !== null) contrastInput.value = contrast;
  if (contrastOn !== null) contrastEnabledCb.checked = contrastOn === "1";
  if (animOn !== null) animationEnabledCb.checked = animOn === "1";
  if (animSpeed !== null) animationSpeedInput.value = animSpeed;
}
function saveWallpaperSettings() {
  localStorage.setItem("wp_brightness", brightnessInput.value);
  localStorage.setItem("wp_brightness_on", brightnessEnabledCb.checked ? "1" : "0");
  localStorage.setItem("wp_saturation", saturationInput.value);
  localStorage.setItem("wp_saturation_on", saturationEnabledCb.checked ? "1" : "0");
  localStorage.setItem("wp_contrast", contrastInput.value);
  localStorage.setItem("wp_contrast_on", contrastEnabledCb.checked ? "1" : "0");
  localStorage.setItem("wp_anim_on", animationEnabledCb.checked ? "1" : "0");
  localStorage.setItem("wp_anim_speed", animationSpeedInput.value);
}
function updateFilters() {
  const filters = [];
  if (brightnessEnabledCb.checked) {
    filters.push(`brightness(${brightnessInput.value}%)`);
  }
  if (saturationEnabledCb.checked) {
    filters.push(`saturate(${saturationInput.value}%)`);
  }
  if (contrastEnabledCb.checked) {
    filters.push(`contrast(${contrastInput.value}%)`);
  }
  wallpaperEl.style.filter = filters.join(" ");
  brightnessValueEl.textContent = `${brightnessInput.value}%`;
  saturationValueEl.textContent = `${saturationInput.value}%`;
  contrastValueEl.textContent = `${contrastInput.value}%`;
  saveWallpaperSettings();
}
function updateAnimation() {
  const duration = `${animationSpeedInput.value}s`;
  animationSpeedValueEl.textContent = duration;
  wallpaperEl.style.animationDuration = duration;
  wallpaperEl.style.animationPlayState = animationEnabledCb.checked ? "running" : "paused";
  saveWallpaperSettings();
}
brightnessInput.addEventListener("input", updateFilters);
saturationInput.addEventListener("input", updateFilters);
contrastInput.addEventListener("input", updateFilters);
brightnessEnabledCb.addEventListener("change", updateFilters);
saturationEnabledCb.addEventListener("change", updateFilters);
contrastEnabledCb.addEventListener("change", updateFilters);
animationEnabledCb.addEventListener("change", updateAnimation);
animationSpeedInput.addEventListener("input", updateAnimation);
wpSettingsOpenBtn.addEventListener("click", () => {
  wpDialog.showModal();
});
wpDialogCloseBtn.addEventListener("click", () => {
  wpDialog.close();
});
wpDialog.addEventListener("click", (e) => {
  if (e.target === wpDialog) {
    wpDialog.close();
  }
});
wpReloadBtn.addEventListener("click", async () => {
  console.log("[Wallpaper] Manual reload triggered");
  const freshUrl = await getFreshImage();
  applyWallpaperUrl(freshUrl);
});
// Restore persisted filter/animation settings into form controls
loadWallpaperSettings();
// Apply filters and animation from (possibly restored) control values
updateFilters();
updateAnimation();
// Load wallpaper (cached for today or fresh on new day)
initWallpaper();
// Start
loadData();
