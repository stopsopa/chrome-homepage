var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/.pnpm/lz-string@1.5.0/node_modules/lz-string/libs/lz-string.js
var require_lz_string = __commonJS({
  "node_modules/.pnpm/lz-string@1.5.0/node_modules/lz-string/libs/lz-string.js"(exports, module) {
    var LZString3 = (function() {
      var f = String.fromCharCode;
      var keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      var keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
      var baseReverseDic = {};
      function getBaseValue(alphabet, character) {
        if (!baseReverseDic[alphabet]) {
          baseReverseDic[alphabet] = {};
          for (var i = 0; i < alphabet.length; i++) {
            baseReverseDic[alphabet][alphabet.charAt(i)] = i;
          }
        }
        return baseReverseDic[alphabet][character];
      }
      var LZString4 = {
        compressToBase64: function(input) {
          if (input == null) return "";
          var res = LZString4._compress(input, 6, function(a) {
            return keyStrBase64.charAt(a);
          });
          switch (res.length % 4) {
            // To produce valid Base64
            default:
            // When could this happen ?
            case 0:
              return res;
            case 1:
              return res + "===";
            case 2:
              return res + "==";
            case 3:
              return res + "=";
          }
        },
        decompressFromBase64: function(input) {
          if (input == null) return "";
          if (input == "") return null;
          return LZString4._decompress(input.length, 32, function(index) {
            return getBaseValue(keyStrBase64, input.charAt(index));
          });
        },
        compressToUTF16: function(input) {
          if (input == null) return "";
          return LZString4._compress(input, 15, function(a) {
            return f(a + 32);
          }) + " ";
        },
        decompressFromUTF16: function(compressed) {
          if (compressed == null) return "";
          if (compressed == "") return null;
          return LZString4._decompress(compressed.length, 16384, function(index) {
            return compressed.charCodeAt(index) - 32;
          });
        },
        //compress into uint8array (UCS-2 big endian format)
        compressToUint8Array: function(uncompressed) {
          var compressed = LZString4.compress(uncompressed);
          var buf = new Uint8Array(compressed.length * 2);
          for (var i = 0, TotalLen = compressed.length; i < TotalLen; i++) {
            var current_value = compressed.charCodeAt(i);
            buf[i * 2] = current_value >>> 8;
            buf[i * 2 + 1] = current_value % 256;
          }
          return buf;
        },
        //decompress from uint8array (UCS-2 big endian format)
        decompressFromUint8Array: function(compressed) {
          if (compressed === null || compressed === void 0) {
            return LZString4.decompress(compressed);
          } else {
            var buf = new Array(compressed.length / 2);
            for (var i = 0, TotalLen = buf.length; i < TotalLen; i++) {
              buf[i] = compressed[i * 2] * 256 + compressed[i * 2 + 1];
            }
            var result = [];
            buf.forEach(function(c) {
              result.push(f(c));
            });
            return LZString4.decompress(result.join(""));
          }
        },
        //compress into a string that is already URI encoded
        compressToEncodedURIComponent: function(input) {
          if (input == null) return "";
          return LZString4._compress(input, 6, function(a) {
            return keyStrUriSafe.charAt(a);
          });
        },
        //decompress from an output of compressToEncodedURIComponent
        decompressFromEncodedURIComponent: function(input) {
          if (input == null) return "";
          if (input == "") return null;
          input = input.replace(/ /g, "+");
          return LZString4._decompress(input.length, 32, function(index) {
            return getBaseValue(keyStrUriSafe, input.charAt(index));
          });
        },
        compress: function(uncompressed) {
          return LZString4._compress(uncompressed, 16, function(a) {
            return f(a);
          });
        },
        _compress: function(uncompressed, bitsPerChar, getCharFromInt) {
          if (uncompressed == null) return "";
          var i, value, context_dictionary = {}, context_dictionaryToCreate = {}, context_c = "", context_wc = "", context_w = "", context_enlargeIn = 2, context_dictSize = 3, context_numBits = 2, context_data = [], context_data_val = 0, context_data_position = 0, ii;
          for (ii = 0; ii < uncompressed.length; ii += 1) {
            context_c = uncompressed.charAt(ii);
            if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
              context_dictionary[context_c] = context_dictSize++;
              context_dictionaryToCreate[context_c] = true;
            }
            context_wc = context_w + context_c;
            if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
              context_w = context_wc;
            } else {
              if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                if (context_w.charCodeAt(0) < 256) {
                  for (i = 0; i < context_numBits; i++) {
                    context_data_val = context_data_val << 1;
                    if (context_data_position == bitsPerChar - 1) {
                      context_data_position = 0;
                      context_data.push(getCharFromInt(context_data_val));
                      context_data_val = 0;
                    } else {
                      context_data_position++;
                    }
                  }
                  value = context_w.charCodeAt(0);
                  for (i = 0; i < 8; i++) {
                    context_data_val = context_data_val << 1 | value & 1;
                    if (context_data_position == bitsPerChar - 1) {
                      context_data_position = 0;
                      context_data.push(getCharFromInt(context_data_val));
                      context_data_val = 0;
                    } else {
                      context_data_position++;
                    }
                    value = value >> 1;
                  }
                } else {
                  value = 1;
                  for (i = 0; i < context_numBits; i++) {
                    context_data_val = context_data_val << 1 | value;
                    if (context_data_position == bitsPerChar - 1) {
                      context_data_position = 0;
                      context_data.push(getCharFromInt(context_data_val));
                      context_data_val = 0;
                    } else {
                      context_data_position++;
                    }
                    value = 0;
                  }
                  value = context_w.charCodeAt(0);
                  for (i = 0; i < 16; i++) {
                    context_data_val = context_data_val << 1 | value & 1;
                    if (context_data_position == bitsPerChar - 1) {
                      context_data_position = 0;
                      context_data.push(getCharFromInt(context_data_val));
                      context_data_val = 0;
                    } else {
                      context_data_position++;
                    }
                    value = value >> 1;
                  }
                }
                context_enlargeIn--;
                if (context_enlargeIn == 0) {
                  context_enlargeIn = Math.pow(2, context_numBits);
                  context_numBits++;
                }
                delete context_dictionaryToCreate[context_w];
              } else {
                value = context_dictionary[context_w];
                for (i = 0; i < context_numBits; i++) {
                  context_data_val = context_data_val << 1 | value & 1;
                  if (context_data_position == bitsPerChar - 1) {
                    context_data_position = 0;
                    context_data.push(getCharFromInt(context_data_val));
                    context_data_val = 0;
                  } else {
                    context_data_position++;
                  }
                  value = value >> 1;
                }
              }
              context_enlargeIn--;
              if (context_enlargeIn == 0) {
                context_enlargeIn = Math.pow(2, context_numBits);
                context_numBits++;
              }
              context_dictionary[context_wc] = context_dictSize++;
              context_w = String(context_c);
            }
          }
          if (context_w !== "") {
            if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
              if (context_w.charCodeAt(0) < 256) {
                for (i = 0; i < context_numBits; i++) {
                  context_data_val = context_data_val << 1;
                  if (context_data_position == bitsPerChar - 1) {
                    context_data_position = 0;
                    context_data.push(getCharFromInt(context_data_val));
                    context_data_val = 0;
                  } else {
                    context_data_position++;
                  }
                }
                value = context_w.charCodeAt(0);
                for (i = 0; i < 8; i++) {
                  context_data_val = context_data_val << 1 | value & 1;
                  if (context_data_position == bitsPerChar - 1) {
                    context_data_position = 0;
                    context_data.push(getCharFromInt(context_data_val));
                    context_data_val = 0;
                  } else {
                    context_data_position++;
                  }
                  value = value >> 1;
                }
              } else {
                value = 1;
                for (i = 0; i < context_numBits; i++) {
                  context_data_val = context_data_val << 1 | value;
                  if (context_data_position == bitsPerChar - 1) {
                    context_data_position = 0;
                    context_data.push(getCharFromInt(context_data_val));
                    context_data_val = 0;
                  } else {
                    context_data_position++;
                  }
                  value = 0;
                }
                value = context_w.charCodeAt(0);
                for (i = 0; i < 16; i++) {
                  context_data_val = context_data_val << 1 | value & 1;
                  if (context_data_position == bitsPerChar - 1) {
                    context_data_position = 0;
                    context_data.push(getCharFromInt(context_data_val));
                    context_data_val = 0;
                  } else {
                    context_data_position++;
                  }
                  value = value >> 1;
                }
              }
              context_enlargeIn--;
              if (context_enlargeIn == 0) {
                context_enlargeIn = Math.pow(2, context_numBits);
                context_numBits++;
              }
              delete context_dictionaryToCreate[context_w];
            } else {
              value = context_dictionary[context_w];
              for (i = 0; i < context_numBits; i++) {
                context_data_val = context_data_val << 1 | value & 1;
                if (context_data_position == bitsPerChar - 1) {
                  context_data_position = 0;
                  context_data.push(getCharFromInt(context_data_val));
                  context_data_val = 0;
                } else {
                  context_data_position++;
                }
                value = value >> 1;
              }
            }
            context_enlargeIn--;
            if (context_enlargeIn == 0) {
              context_enlargeIn = Math.pow(2, context_numBits);
              context_numBits++;
            }
          }
          value = 2;
          for (i = 0; i < context_numBits; i++) {
            context_data_val = context_data_val << 1 | value & 1;
            if (context_data_position == bitsPerChar - 1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
          while (true) {
            context_data_val = context_data_val << 1;
            if (context_data_position == bitsPerChar - 1) {
              context_data.push(getCharFromInt(context_data_val));
              break;
            } else context_data_position++;
          }
          return context_data.join("");
        },
        decompress: function(compressed) {
          if (compressed == null) return "";
          if (compressed == "") return null;
          return LZString4._decompress(compressed.length, 32768, function(index) {
            return compressed.charCodeAt(index);
          });
        },
        _decompress: function(length, resetValue, getNextValue) {
          var dictionary = [], next, enlargeIn = 4, dictSize = 4, numBits = 3, entry = "", result = [], i, w, bits, resb, maxpower, power, c, data = { val: getNextValue(0), position: resetValue, index: 1 };
          for (i = 0; i < 3; i += 1) {
            dictionary[i] = i;
          }
          bits = 0;
          maxpower = Math.pow(2, 2);
          power = 1;
          while (power != maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb > 0 ? 1 : 0) * power;
            power <<= 1;
          }
          switch (next = bits) {
            case 0:
              bits = 0;
              maxpower = Math.pow(2, 8);
              power = 1;
              while (power != maxpower) {
                resb = data.val & data.position;
                data.position >>= 1;
                if (data.position == 0) {
                  data.position = resetValue;
                  data.val = getNextValue(data.index++);
                }
                bits |= (resb > 0 ? 1 : 0) * power;
                power <<= 1;
              }
              c = f(bits);
              break;
            case 1:
              bits = 0;
              maxpower = Math.pow(2, 16);
              power = 1;
              while (power != maxpower) {
                resb = data.val & data.position;
                data.position >>= 1;
                if (data.position == 0) {
                  data.position = resetValue;
                  data.val = getNextValue(data.index++);
                }
                bits |= (resb > 0 ? 1 : 0) * power;
                power <<= 1;
              }
              c = f(bits);
              break;
            case 2:
              return "";
          }
          dictionary[3] = c;
          w = c;
          result.push(c);
          while (true) {
            if (data.index > length) {
              return "";
            }
            bits = 0;
            maxpower = Math.pow(2, numBits);
            power = 1;
            while (power != maxpower) {
              resb = data.val & data.position;
              data.position >>= 1;
              if (data.position == 0) {
                data.position = resetValue;
                data.val = getNextValue(data.index++);
              }
              bits |= (resb > 0 ? 1 : 0) * power;
              power <<= 1;
            }
            switch (c = bits) {
              case 0:
                bits = 0;
                maxpower = Math.pow(2, 8);
                power = 1;
                while (power != maxpower) {
                  resb = data.val & data.position;
                  data.position >>= 1;
                  if (data.position == 0) {
                    data.position = resetValue;
                    data.val = getNextValue(data.index++);
                  }
                  bits |= (resb > 0 ? 1 : 0) * power;
                  power <<= 1;
                }
                dictionary[dictSize++] = f(bits);
                c = dictSize - 1;
                enlargeIn--;
                break;
              case 1:
                bits = 0;
                maxpower = Math.pow(2, 16);
                power = 1;
                while (power != maxpower) {
                  resb = data.val & data.position;
                  data.position >>= 1;
                  if (data.position == 0) {
                    data.position = resetValue;
                    data.val = getNextValue(data.index++);
                  }
                  bits |= (resb > 0 ? 1 : 0) * power;
                  power <<= 1;
                }
                dictionary[dictSize++] = f(bits);
                c = dictSize - 1;
                enlargeIn--;
                break;
              case 2:
                return result.join("");
            }
            if (enlargeIn == 0) {
              enlargeIn = Math.pow(2, numBits);
              numBits++;
            }
            if (dictionary[c]) {
              entry = dictionary[c];
            } else {
              if (c === dictSize) {
                entry = w + w.charAt(0);
              } else {
                return null;
              }
            }
            result.push(entry);
            dictionary[dictSize++] = w + entry.charAt(0);
            enlargeIn--;
            w = entry;
            if (enlargeIn == 0) {
              enlargeIn = Math.pow(2, numBits);
              numBits++;
            }
          }
        }
      };
      return LZString4;
    })();
    if (typeof define === "function" && define.amd) {
      define(function() {
        return LZString3;
      });
    } else if (typeof module !== "undefined" && module != null) {
      module.exports = LZString3;
    } else if (typeof angular !== "undefined" && angular != null) {
      angular.module("LZString", []).factory("LZString", function() {
        return LZString3;
      });
    }
  }
});

// extension/encode.ts
var import_lz_string = __toESM(require_lz_string(), 1);
/** @es.ts
{
    mode: "bundle",
    extension: ".js"
}
@es.ts */function serialize(bookmark) {
  const { type, url, ...rest } = bookmark;
  const finalUrl = url || "chrome://new-tab-page";
  if (!type) {
    throw new Error("Bookmark type is required");
  }
  const serializedRest = import_lz_string.default.compressToBase64(JSON.stringify(rest));
  const name = `${type}:${serializedRest}`;
  if (!name || !finalUrl) {
    throw new Error("Produced name and url cannot be empty");
  }
  return { name, url: finalUrl };
}

// extension/decode.ts
var import_lz_string2 = __toESM(require_lz_string(), 1);
/** @es.ts
{
    mode: "bundle",
    extension: ".js"
}
@es.ts */function decode(data) {
  const { name, url } = data;
  const firstColonIndex = name.indexOf(":");
  if (firstColonIndex === -1) {
    throw new Error("Invalid encoded name format");
  }
  const type = name.substring(0, firstColonIndex);
  const serializedRest = name.substring(firstColonIndex + 1);
  const decompressed = import_lz_string2.default.decompressFromBase64(serializedRest);
  if (decompressed === null) {
    throw new Error("Failed to decompress name");
  }
  const rest = JSON.parse(decompressed);
  if (url === "chrome://new-tab-page") {
    return {
      type,
      ...rest
    };
  }
  return {
    type,
    url,
    ...rest
  };
}

// extension/sandbox.ts
/** @es.ts
{
    mode: "bundle",
    extension: ".js"
}
@es.ts */var listContainer = document.getElementById("bookmark-list");
var formContainer = document.getElementById("form-container");
var addBtn = document.getElementById("add-btn");
var saveBtn = document.getElementById("save-btn");
var cancelBtn = document.getElementById("cancel-btn");
var addExtraBtn = document.getElementById("add-extra-btn");
var extraFieldsContainer = document.getElementById("extra-fields-container");
var bookmarkForm = document.getElementById("bookmark-form");
var typeInput = document.getElementById("type-input");
var urlInput = document.getElementById("url-input");
var currentBookmarkId = null;
var underscoreFolderId = null;
async function getUnderscoreFolder() {
  // ID '1' is the standard ID for the Bookmarks Bar in Chrome
  const barId = "1";
  let folder;
  try {
    const children = await chrome.bookmarks.getChildren(barId);
    folder = children.find((c) => c.title === "_" && !c.url);
  } catch (e) {
    // If barId '1' fails, fallback to searching the whole tree but prefer the bar
    const tree = await chrome.bookmarks.getTree();
    const findFolder = (nodes) => {
      for (const node of nodes) {
        if (node.title === "_" && !node.url) return node;
        if (node.children) {
          const found = findFolder(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    folder = findFolder(tree);
  }
  if (!folder) {
    folder = await chrome.bookmarks.create({ parentId: barId, title: "_" });
  }
  underscoreFolderId = folder.id;
  return folder;
}
async function renderList() {
  const folder = await getUnderscoreFolder();
  const bookmarks = await chrome.bookmarks.getChildren(folder.id);
  listContainer.innerHTML = "";
  bookmarks.forEach((bm) => {
    const div = document.createElement("div");
    div.className = "bookmark-item";
    div.draggable = true;
    let data;
    try {
      data = decode({ name: bm.title, url: bm.url });
    } catch (e) {
      data = { type: "invalid", name: bm.title };
    }
    div.innerHTML = `
            <div class="drag-handle" title="Drag to reorder">☰</div>
            <div class="bookmark-info">
                <strong>${data.type}</strong>: ${bm.url || ""}
            </div>
            <div class="bookmark-actions">
                <button class="up-btn" data-id="${bm.id}">↑</button>
                <button class="down-btn" data-id="${bm.id}">↓</button>
                <button class="edit-btn" data-id="${bm.id}">edit</button>
                <button class="delete-btn" data-id="${bm.id}">delete</button>
            </div>
        `;
    div.addEventListener("dragstart", (e) => {
      div.classList.add("dragging");
      e.dataTransfer.setData("text/plain", bm.id);
      e.dataTransfer.effectAllowed = "move";
    });
    div.addEventListener("dragend", () => {
      div.classList.remove("dragging");
    });
    div.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      const rect = div.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      if (e.clientY < midpoint) {
        div.classList.add("drag-over-top");
        div.classList.remove("drag-over-bottom");
      } else {
        div.classList.add("drag-over-bottom");
        div.classList.remove("drag-over-top");
      }
    });
    div.addEventListener("dragleave", () => {
      div.classList.remove("drag-over-top");
      div.classList.remove("drag-over-bottom");
    });
    div.addEventListener("drop", async (e) => {
      e.preventDefault();
      div.classList.remove("drag-over-top");
      div.classList.remove("drag-over-bottom");
      const draggedId = e.dataTransfer.getData("text/plain");
      if (draggedId === bm.id) return;
      const rect = div.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      const isBottom = e.clientY >= midpoint;
      let targetIndex = bm.index;
      if (isBottom) {
        targetIndex++;
      }
      // Move dragged item to the calculated position
      await chrome.bookmarks.move(draggedId, { index: targetIndex });
      renderList();
    });
    listContainer.appendChild(div);
  });
  document.querySelectorAll(".up-btn").forEach((btn) => {
    btn.onclick = () => moveBookmark(btn.dataset.id, -1);
  });
  document.querySelectorAll(".down-btn").forEach((btn) => {
    btn.onclick = () => moveBookmark(btn.dataset.id, 1);
  });
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.onclick = () => editBookmark(btn.dataset.id);
  });
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.onclick = () => deleteBookmark(btn.dataset.id);
  });
}
async function moveBookmark(id, delta) {
  const [bm] = await chrome.bookmarks.get(id);
  const parentId = bm.parentId;
  const index = bm.index;
  const children = await chrome.bookmarks.getChildren(parentId);
  let newIndex = index + delta;
  if (newIndex < 0) newIndex = 0;
  if (newIndex >= children.length) newIndex = children.length - 1;
  if (newIndex === index) return;
  // For moving down, we need to target index + 1 in the current list
  const finalIndex = delta > 0 ? newIndex + 1 : newIndex;
  await chrome.bookmarks.move(id, { parentId, index: finalIndex });
  renderList();
}
function showForm(bookmark = null) {
  currentBookmarkId = bookmark ? bookmark.id : null;
  formContainer.style.display = "block";
  extraFieldsContainer.innerHTML = "";
  if (bookmark) {
    const data = decode({ name: bookmark.title, url: bookmark.url });
    typeInput.value = data.type;
    urlInput.value = data.url || "";
    Object.keys(data).forEach((key) => {
      if (key !== "type" && key !== "url") {
        addExtraField(key, data[key]);
      }
    });
  } else {
    typeInput.value = "";
    urlInput.value = "";
  }
}
function addExtraField(key = "", value = "") {
  const div = document.createElement("div");
  div.className = "extra-field";
  div.innerHTML = `
        <input type="text" class="extra-key" placeholder="key" value="${key}">
        <input type="text" class="extra-value" placeholder="value" value="${value}">
        <button type="button" class="remove-extra-btn">x</button>
    `;
  div.querySelector(".remove-extra-btn").addEventListener("click", () => div.remove());
  extraFieldsContainer.appendChild(div);
}
async function saveBookmark() {
  const type = typeInput.value;
  const url = urlInput.value;
  const extra = {};
  document.querySelectorAll(".extra-field").forEach((div) => {
    const k = div.querySelector(".extra-key").value;
    const v = div.querySelector(".extra-value").value;
    if (k) extra[k] = v;
  });
  const bookmarkData = { type, ...extra };
  if (url) bookmarkData.url = url;
  const { name, url: finalUrl } = serialize(bookmarkData);
  if (currentBookmarkId) {
    await chrome.bookmarks.update(currentBookmarkId, { title: name, url: finalUrl });
  } else {
    await chrome.bookmarks.create({ parentId: underscoreFolderId, title: name, url: finalUrl });
  }
  formContainer.style.display = "none";
  renderList();
}
async function deleteBookmark(id) {
  if (confirm("Are you sure?")) {
    await chrome.bookmarks.remove(id);
    renderList();
  }
}
async function editBookmark(id) {
  const [bm] = await chrome.bookmarks.get(id);
  showForm(bm);
}
addBtn.onclick = () => showForm();
cancelBtn.onclick = () => formContainer.style.display = "none";
addExtraBtn.onclick = () => addExtraField();
bookmarkForm.onsubmit = (e) => {
  e.preventDefault();
  saveBookmark();
};
renderList();
