/** @es.ts
{
    mode: "transform",
    extension: ".js"
}
@es.ts */
import { serialize, decode } from './modules.js';
import engines from './search.js';
import type { BookmarkStored } from './types.js';

declare const chrome: any;

const searchInput = document.getElementById('search-input') as HTMLInputElement;
const enginesNav = document.getElementById('search-engines') as HTMLElement;
const editToggle = document.getElementById('edit-toggle') as HTMLButtonElement;
const gridContainer = document.getElementById('grid-container') as HTMLElement;
const editControls = document.getElementById('edit-controls') as HTMLElement;
const addBtn = document.getElementById('add-bookmark') as HTMLButtonElement;
const dialog = document.getElementById('bookmark-dialog') as HTMLDialogElement;
const form = document.getElementById('bookmark-form') as HTMLFormElement;
const cancelBtn = document.getElementById('dialog-cancel') as HTMLButtonElement;
const dialogTitle = document.getElementById('dialog-title') as HTMLElement;

let isEditMode = false;
let currentFolderId: string | null = null;
let currentEditId: string | null = null;
let dragElement: HTMLElement | null = null;
let dragStartX = 0;
let dragStartY = 0;
let initialX = 0;
let initialY = 0;

// Init Search Engines
function initEngines() {
    enginesNav.innerHTML = '';
    Object.entries(engines).forEach(([id, engine]) => {
        const a = document.createElement('a');
        a.id = `engine-${id}`;
        a.className = 'engine-link disabled';
        a.href = '';
        a.title = engine.label;
        a.innerHTML = `<img src="${engine.icon}" alt="${engine.label}">`;
        enginesNav.appendChild(a);
    });
}

searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    Object.entries(engines).forEach(([id, engine]) => {
        const a = document.getElementById(`engine-${id}`) as HTMLAnchorElement;
        if (query) {
            a.classList.remove('disabled');
            a.href = engine.search(query);
        } else {
            a.classList.add('disabled');
            a.href = '';
        }
    });
});

// Bookmark Management
async function getFolder() {
    if (currentFolderId) return currentFolderId;
    const barId = '1';
    let folder: any;
    try {
        const children = await chrome.bookmarks.getChildren(barId);
        folder = children.find((c: any) => c.title === '_' && !c.url);
    } catch (e) {}

    if (!folder) {
        const tree = await chrome.bookmarks.getTree();
        const find = (nodes: any[]): any => {
            for (const n of nodes) {
                if (n.title === '_' && !n.url) return n;
                if (n.children) {
                    const f = find(n.children);
                    if (f) return f;
                }
            }
        };
        folder = find(tree);
    }

    if (!folder) {
        folder = await chrome.bookmarks.create({ parentId: barId, title: '_' });
    }
    currentFolderId = folder.id;
    return folder.id;
}

async function loadBookmarks() {
    const folderId = await getFolder();
    const bookmarks = await chrome.bookmarks.getChildren(folderId);
    gridContainer.innerHTML = '';
    bookmarks.forEach(renderBookmark);
}

function renderBookmark(bm: any) {
    let data: any;
    try {
        data = decode({ name: bm.title, url: bm.url });
    } catch (e) {
        return; // Skip invalid
    }

    const div = document.createElement('a');
    div.className = 'bookmark';
    div.href = bm.url;
    div.dataset.id = bm.id;
    div.style.left = `${data.x || 100}px`;
    div.style.top = `${data.y || 100}px`;

    div.innerHTML = `
        <div class="bookmark-icon">
            <img src="${data.logo || ''}" alt="">
        </div>
        <div class="bookmark-title">${data.title || 'No Title'}</div>
        <div class="bookmark-actions">
            <button class="action-btn btn-edit" data-id="${bm.id}">e</button>
            <button class="action-btn btn-del" data-id="${bm.id}">x</button>
        </div>
    `;

    div.addEventListener('mousedown', startDrag);
    
    // Prevent navigation in edit mode
    div.addEventListener('click', (e) => {
        if (isEditMode) {
            e.preventDefault();
        }
    });

    div.querySelector('.btn-edit')!.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openEdit(bm.id);
    });
    div.querySelector('.btn-del')!.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        removeBookmark(bm.id);
    });

    gridContainer.appendChild(div);
}

// Drag & Drop
function startDrag(e: MouseEvent) {
    if (!isEditMode) return;
    
    const target = e.target as HTMLElement;
    // Only allow dragging if clicking the icon or the icon container
    if (!target.closest('.bookmark-icon')) return;
    if (target.closest('.bookmark-actions')) return;
    
    e.preventDefault();
    dragElement = (e.currentTarget as HTMLElement);
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    initialX = parseInt(dragElement.style.left);
    initialY = parseInt(dragElement.style.top);

    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
}

function onDrag(e: MouseEvent) {
    if (!dragElement) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    
    // Grid snapping (10px)
    const newX = Math.round((initialX + dx) / 10) * 10;
    const newY = Math.round((initialY + dy) / 10) * 10;
    
    dragElement.style.left = `${newX}px`;
    dragElement.style.top = `${newY}px`;
}

async function stopDrag() {
    if (!dragElement) return;
    const id = dragElement.dataset.id!;
    const x = parseInt(dragElement.style.left);
    const y = parseInt(dragElement.style.top);

    // Save position
    const [bm] = await chrome.bookmarks.get(id);
    const data = decode({ name: bm.title, url: bm.url });
    data.x = x.toString();
    data.y = y.toString();
    const { name, url } = serialize(data);
    await chrome.bookmarks.update(id, { title: name, url });

    dragElement = null;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
}

// Edit Mode
editToggle.addEventListener('click', () => {
    isEditMode = !isEditMode;
    document.body.classList.toggle('edit-mode', isEditMode);
    editToggle.classList.toggle('active', isEditMode);
    editControls.classList.toggle('hidden', !isEditMode);
});

// Dialog
addBtn.addEventListener('click', () => {
    currentEditId = null;
    dialogTitle.textContent = 'Add Bookmark';
    form.reset();
    dialog.showModal();
});

cancelBtn.addEventListener('click', () => dialog.close());

async function openEdit(id: string) {
    currentEditId = id;
    dialogTitle.textContent = 'Edit Bookmark';
    const [bm] = await chrome.bookmarks.get(id);
    const data = decode({ name: bm.title, url: bm.url });
    (form.elements.namedItem('title') as HTMLInputElement).value = data.title || '';
    (form.elements.namedItem('url') as HTMLInputElement).value = bm.url || '';
    (form.elements.namedItem('logo') as HTMLInputElement).value = data.logo || '';
    dialog.showModal();
}

async function removeBookmark(id: string) {
    if (confirm('Delete this bookmark?')) {
        await chrome.bookmarks.remove(id);
        loadBookmarks();
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const title = fd.get('title') as string;
    const url = fd.get('url') as string;
    const logo = fd.get('logo') as string;

    const folderId = await getFolder();
    
    let bookmarkData: any = { type: 'link', title, logo, url };
    
    if (currentEditId) {
        const [bm] = await chrome.bookmarks.get(currentEditId);
        const oldData = decode({ name: bm.title, url: bm.url });
        bookmarkData.x = oldData.x;
        bookmarkData.y = oldData.y;
        const { name, url: finalUrl } = serialize(bookmarkData);
        await chrome.bookmarks.update(currentEditId, { title: name, url: finalUrl });
    } else {
        bookmarkData.x = "100";
        bookmarkData.y = "100";
        const { name, url: finalUrl } = serialize(bookmarkData);
        await chrome.bookmarks.create({ parentId: folderId, title: name, url: finalUrl });
    }

    dialog.close();
    loadBookmarks();
});

// Esc to close dialog (default behavior for dialog.showModal, but let's be sure)
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dialog.open) {
        dialog.close();
    }
});

// Start
initEngines();
loadBookmarks();
searchInput.focus();
