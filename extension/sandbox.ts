
import { serialize, decode } from './modules.js';
import type { BookmarkStored } from './types.js';

const listContainer = document.getElementById('bookmark-list') as HTMLDivElement;
const formContainer = document.getElementById('form-container') as HTMLDivElement;
const addBtn = document.getElementById('add-btn') as HTMLButtonElement;
const saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
const cancelBtn = document.getElementById('cancel-btn') as HTMLButtonElement;
const addExtraBtn = document.getElementById('add-extra-btn') as HTMLButtonElement;
const extraFieldsContainer = document.getElementById('extra-fields-container') as HTMLDivElement;

const bookmarkForm = document.getElementById('bookmark-form') as HTMLFormElement;

const typeInput = document.getElementById('type-input') as HTMLInputElement;
const urlInput = document.getElementById('url-input') as HTMLInputElement;

let currentBookmarkId: string | null = null;
let underscoreFolderId: string | null = null;

declare const chrome: any;

async function getUnderscoreFolder() {
    // ID '1' is the standard ID for the Bookmarks Bar in Chrome
    const barId = '1';
    let folder: any;
    try {
        const children = await chrome.bookmarks.getChildren(barId);
        folder = children.find((c: any) => c.title === '_' && !c.url);
    } catch (e) {
        // If barId '1' fails, fallback to searching the whole tree but prefer the bar
        const tree = await chrome.bookmarks.getTree();
        const findFolder = (nodes: any[]): any => {
            for (const node of nodes) {
                if (node.title === '_' && !node.url) return node;
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
        folder = await chrome.bookmarks.create({ parentId: barId, title: '_' });
    }
    underscoreFolderId = folder.id;
    return folder;
}

async function renderList() {
    const folder = await getUnderscoreFolder();
    const bookmarks = await chrome.bookmarks.getChildren(folder.id);
    listContainer.innerHTML = '';
    bookmarks.forEach((bm: any) => {
        const div = document.createElement('div');
        div.className = 'bookmark-item';
        div.draggable = true;
        let data: any;
        try {
            data = decode({ name: bm.title, url: bm.url });
        } catch (e) {
            data = { type: 'invalid', name: bm.title };
        }
        div.innerHTML = `
            <div class="drag-handle" title="Drag to reorder">☰</div>
            <div class="bookmark-info">
                <strong>${data.type}</strong>: ${bm.url || ''}
            </div>
            <div class="bookmark-actions">
                <button class="up-btn" data-id="${bm.id}">↑</button>
                <button class="down-btn" data-id="${bm.id}">↓</button>
                <button class="edit-btn" data-id="${bm.id}">edit</button>
                <button class="delete-btn" data-id="${bm.id}">delete</button>
            </div>
        `;

        div.addEventListener('dragstart', (e) => {
            div.classList.add('dragging');
            e.dataTransfer!.setData('text/plain', bm.id);
            e.dataTransfer!.effectAllowed = 'move';
        });
        div.addEventListener('dragend', () => {
            div.classList.remove('dragging');
        });
        div.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer!.dropEffect = 'move';
            
            const rect = div.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            if (e.clientY < midpoint) {
                div.classList.add('drag-over-top');
                div.classList.remove('drag-over-bottom');
            } else {
                div.classList.add('drag-over-bottom');
                div.classList.remove('drag-over-top');
            }
        });
        div.addEventListener('dragleave', () => {
            div.classList.remove('drag-over-top');
            div.classList.remove('drag-over-bottom');
        });
        div.addEventListener('drop', async (e) => {
            e.preventDefault();
            div.classList.remove('drag-over-top');
            div.classList.remove('drag-over-bottom');
            
            const draggedId = e.dataTransfer!.getData('text/plain');
            if (draggedId === bm.id) return;
            
            const rect = div.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            const isBottom = e.clientY >= midpoint;
            
            let targetIndex = bm.index!;
            if (isBottom) {
                targetIndex++;
            }
            
            // Move dragged item to the calculated position
            await chrome.bookmarks.move(draggedId, { index: targetIndex });
            renderList();
        });

        listContainer.appendChild(div);
    });

    document.querySelectorAll('.up-btn').forEach(btn => {
        (btn as HTMLButtonElement).onclick = () => moveBookmark((btn as HTMLButtonElement).dataset.id!, -1);
    });
    document.querySelectorAll('.down-btn').forEach(btn => {
        (btn as HTMLButtonElement).onclick = () => moveBookmark((btn as HTMLButtonElement).dataset.id!, 1);
    });
    document.querySelectorAll('.edit-btn').forEach(btn => {
        (btn as HTMLButtonElement).onclick = () => editBookmark((btn as HTMLButtonElement).dataset.id!);
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        (btn as HTMLButtonElement).onclick = () => deleteBookmark((btn as HTMLButtonElement).dataset.id!);
    });
}

async function moveBookmark(id: string, delta: number) {
    const [bm] = await chrome.bookmarks.get(id);
    const parentId = bm.parentId!;
    const index = bm.index!;
    const children = await chrome.bookmarks.getChildren(parentId);
    
    let newIndex = index + delta;
    
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= children.length) newIndex = children.length - 1;

    if (newIndex === index) return;

    // For moving down, we need to target index + 1 in the current list
    const finalIndex = (delta > 0) ? newIndex + 1 : newIndex;
    
    await chrome.bookmarks.move(id, { parentId, index: finalIndex });
    renderList();
}

function showForm(bookmark: any = null) {
    currentBookmarkId = bookmark ? bookmark.id : null;
    formContainer.style.display = 'block';
    extraFieldsContainer.innerHTML = '';
    
    if (bookmark) {
        const data = decode({ name: bookmark.title, url: bookmark.url });
        typeInput.value = data.type;
        urlInput.value = data.url || '';
        Object.keys(data).forEach(key => {
            if (key !== 'type' && key !== 'url') {
                addExtraField(key, (data as any)[key]);
            }
        });
    } else {
        typeInput.value = '';
        urlInput.value = '';
    }
}

function addExtraField(key: string = '', value: string = '') {
    const div = document.createElement('div');
    div.className = 'extra-field';
    div.innerHTML = `
        <input type="text" class="extra-key" placeholder="key" value="${key}">
        <input type="text" class="extra-value" placeholder="value" value="${value}">
        <button type="button" class="remove-extra-btn">x</button>
    `;
    div.querySelector('.remove-extra-btn')!.addEventListener('click', () => div.remove());
    extraFieldsContainer.appendChild(div);
}

async function saveBookmark() {
    const type = typeInput.value;
    const url = urlInput.value;
    const extra: Record<string, string> = {};
    document.querySelectorAll('.extra-field').forEach(div => {
        const k = (div.querySelector('.extra-key') as HTMLInputElement).value;
        const v = (div.querySelector('.extra-value') as HTMLInputElement).value;
        if (k) extra[k] = v;
    });

    const bookmarkData: any = { type, ...extra };
    if (url) bookmarkData.url = url;

    const { name, url: finalUrl }: BookmarkStored = serialize(bookmarkData);

    if (currentBookmarkId) {
        await chrome.bookmarks.update(currentBookmarkId, { title: name, url: finalUrl });
    } else {
        await chrome.bookmarks.create({ parentId: underscoreFolderId, title: name, url: finalUrl });
    }
    
    formContainer.style.display = 'none';
    renderList();
}

async function deleteBookmark(id: string) {
    if (confirm('Are you sure?')) {
        await chrome.bookmarks.remove(id);
        renderList();
    }
}

async function editBookmark(id: string) {
    const [bm] = await chrome.bookmarks.get(id);
    showForm(bm);
}

addBtn.onclick = () => showForm();
cancelBtn.onclick = () => formContainer.style.display = 'none';
addExtraBtn.onclick = () => addExtraField();

bookmarkForm.onsubmit = (e) => {
    e.preventDefault();
    saveBookmark();
};

renderList();
