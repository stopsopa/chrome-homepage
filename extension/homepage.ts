/** @es.ts
{
    mode: "transform",
    extension: ".js"
}
@es.ts */
import { serialize, decode } from './modules.js';
import engines from './search.js';
import type { Bookmark } from './types.js';

declare const chrome: any;

console.log('Homepage script initializing...');

const searchInput = document.getElementById('search-input') as HTMLTextAreaElement;
const enginesTop = document.getElementById('engines-top') as HTMLElement;
const enginesBottom = document.getElementById('engines-bottom') as HTMLElement;
const skillsList = document.getElementById('skills-list') as HTMLElement;
const editToggle = document.getElementById('edit-toggle') as HTMLButtonElement;
const gridContainer = document.getElementById('grid-container') as HTMLElement;

const addBtn = document.getElementById('add-bookmark') as HTMLButtonElement;
const addSkillBtn = document.getElementById('add-skill') as HTMLButtonElement;

const bookmarkDialog = document.getElementById('bookmark-dialog') as HTMLDialogElement;
const bookmarkForm = document.getElementById('bookmark-form') as HTMLFormElement;
const dialogCancel = document.getElementById('dialog-cancel') as HTMLButtonElement;

const skillsDialog = document.getElementById('skills-dialog') as HTMLDialogElement;
const skillsManagerList = document.getElementById('skills-manager-list') as HTMLElement;
const skillForm = document.getElementById('skill-form') as HTMLFormElement;
const newSkillBtn = document.getElementById('new-skill-btn') as HTMLButtonElement;
const deleteSkillBtn = document.getElementById('delete-skill-btn') as HTMLButtonElement;
const skillContent = document.getElementById('skill-content') as HTMLTextAreaElement;

const closeSkillsBtn = document.getElementById('close-skills-btn') as HTMLButtonElement;

let isEditMode = false;
let currentFolderId: string | null = null;
let currentEditId: string | null = null;
let currentSkillId: string | null = null;
let activeSkillId: string | null = null;

let dragElement: HTMLElement | null = null;
let dragStartX = 0;
let dragStartY = 0;
let initialX = 0;
let initialY = 0;

// Init Search Engines
function initEngines() {
    enginesTop.innerHTML = '';
    enginesBottom.innerHTML = '';
    
    Object.entries(engines).forEach(([id, engine]: [string, any]) => {
        const a = document.createElement('a');
        a.id = `engine-${id}`;
        a.className = 'engine-link disabled';
        a.href = '';
        a.title = engine.label;
        a.tabIndex = 0;
        a.innerHTML = `<img src="${engine.icon}" alt="${engine.label}">`;
        
        a.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                (a.nextElementSibling as HTMLElement)?.focus();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                (a.previousElementSibling as HTMLElement)?.focus();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const container = a.parentElement === enginesTop ? enginesBottom : null;
                if (container) {
                    const index = Array.from(enginesTop.children).indexOf(a);
                    const target = container.children[index] || container.lastElementChild;
                    (target as HTMLElement)?.focus();
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const container = a.parentElement === enginesBottom ? enginesTop : null;
                if (container) {
                    const index = Array.from(enginesBottom.children).indexOf(a);
                    const target = container.children[index] || container.lastElementChild;
                    (target as HTMLElement)?.focus();
                } else {
                    searchInput.focus();
                }
            } else if (e.key === ' ') {
                e.preventDefault();
                a.classList.toggle('selected');
            } else if (e.key === 'Enter') {
                e.preventDefault();
                handleOpen();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                searchInput.focus();
            }
        });

        const targetRow = engine.position === 'bottom' ? enginesBottom : enginesTop;
        targetRow.appendChild(a);
    });
}

async function handleOpen() {
    const rawQuery = searchInput.value.trim();
    if (!rawQuery) return;

    let query = rawQuery;
    if (activeSkillId) {
        const [bm] = await chrome.bookmarks.get(activeSkillId);
        const skillData = decode({ name: bm.title, url: bm.url || '' }) as Bookmark;
        query = `${skillData.content}\n\n${rawQuery}`;
    }

    const selectedEngines = Array.from(document.querySelectorAll('.engine-link.selected')) as HTMLElement[];
    const active = document.activeElement as HTMLElement;
    let targetEngines = selectedEngines;
    
    if (targetEngines.length === 0 && active && active.classList.contains('engine-link')) {
        targetEngines = [active];
    }

    if (targetEngines.length === 0) return;

    if (targetEngines.length === 1) {
        const id = targetEngines[0].id.replace('engine-', '');
        const engine = (engines as any)[id];
        window.location.href = engine.search(query);
    } else {
        targetEngines.forEach((el) => {
            const id = el.id.replace('engine-', '');
            const engine = (engines as any)[id];
            const url = engine.search(query);
            chrome.tabs.create({ url, active: false });
        });
    }
}

function resizeSearch() {
    searchInput.style.height = 'auto';
    searchInput.style.height = searchInput.scrollHeight + 'px';
}

searchInput.addEventListener('input', () => {
    resizeSearch();
    const query = searchInput.value.trim();
    Object.entries(engines).forEach(([id, engine]: [string, any]) => {
        const a = document.getElementById(`engine-${id}`) as HTMLAnchorElement;
        if (query) {
            a.classList.remove('disabled');
            a.href = engine.search(query);
        } else {
            a.classList.add('disabled');
            a.href = '';
            a.classList.remove('selected');
        }
    });
});

searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        if (searchInput.value.trim()) {
            e.preventDefault();
            const firstEngine = enginesTop.querySelector('.engine-link:not(.disabled)') as HTMLElement;
            if (firstEngine) firstEngine.focus();
        }
    } else if (e.key === 'ArrowDown') {
        if (searchInput.selectionStart === searchInput.value.length) {
            if (searchInput.value.trim()) {
                e.preventDefault();
                const firstEngine = enginesTop.querySelector('.engine-link:not(.disabled)') as HTMLElement;
                if (firstEngine) firstEngine.focus();
            }
        }
    }
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

async function loadData() {
    const folderId = await getFolder();
    const items = await chrome.bookmarks.getChildren(folderId);
    
    gridContainer.innerHTML = '';
    skillsList.innerHTML = '';
    
    const bookmarks: any[] = [];
    const skills: any[] = [];

    items.forEach((item: any) => {
        try {
            const data = decode({ name: item.title, url: item.url || '' }) as Bookmark;
            if (data.type === 'skill') {
                skills.push(item);
            } else {
                bookmarks.push(item);
            }
        } catch (e) {}
    });

    bookmarks.forEach(renderBookmark);
    skills.forEach(renderSkill);
}

function renderBookmark(bm: any) {
    const data = decode({ name: bm.title, url: bm.url || '' }) as Bookmark;
    const div = document.createElement('a');
    div.className = 'bookmark';
    div.href = bm.url || '';
    div.dataset.id = bm.id;
    div.style.left = `${data.x || 100}px`;
    div.style.top = `${data.y || 100}px`;

    div.innerHTML = `
        <div class="bookmark-icon"><img src="${data.logo || ''}"></div>
        <div class="bookmark-title">${data.title || 'No Title'}</div>
        <div class="bookmark-actions">
            <button class="action-btn btn-edit" data-id="${bm.id}">e</button>
            <button class="action-btn btn-del" data-id="${bm.id}">x</button>
        </div>
    `;

    div.addEventListener('mousedown', startDrag);
    div.addEventListener('click', (e) => { if (isEditMode) e.preventDefault(); });

    div.querySelector('.btn-edit')!.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation(); openEdit(bm.id);
    });
    div.querySelector('.btn-del')!.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation(); removeBookmark(bm.id);
    });

    gridContainer.appendChild(div);
}

function renderSkill(bm: any) {
    const data = decode({ name: bm.title, url: bm.url || '' }) as Bookmark;
    const btn = document.createElement('button');
    btn.className = 'skill-btn';
    if (activeSkillId === bm.id) btn.classList.add('active');
    btn.textContent = data.title || '';
    btn.addEventListener('click', () => {
        if (activeSkillId === bm.id) {
            activeSkillId = null;
        } else {
            activeSkillId = bm.id;
        }
        loadData();
    });
    skillsList.appendChild(btn);
}

// Drag & Drop
function startDrag(e: MouseEvent) {
    if (!isEditMode) return;
    const target = e.target as HTMLElement;
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

    const [bm] = await chrome.bookmarks.get(id);
    const data = decode({ name: bm.title, url: bm.url || '' }) as Bookmark;
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
    addBtn.classList.toggle('hidden', !isEditMode);
    addSkillBtn.classList.toggle('hidden', !isEditMode);
});

// Bookmark Dialog
addBtn.addEventListener('click', () => {
    currentEditId = null;
    bookmarkForm.reset();
    bookmarkDialog.showModal();
});
dialogCancel.addEventListener('click', () => bookmarkDialog.close());

async function openEdit(id: string) {
    currentEditId = id;
    const [bm] = await chrome.bookmarks.get(id);
    const data = decode({ name: bm.title, url: bm.url || '' }) as Bookmark;
    (bookmarkForm.elements.namedItem('title') as HTMLInputElement).value = data.title || '';
    (bookmarkForm.elements.namedItem('url') as HTMLInputElement).value = bm.url || '';
    (bookmarkForm.elements.namedItem('logo') as HTMLInputElement).value = data.logo || '';
    bookmarkDialog.showModal();
}

async function removeBookmark(id: string) {
    if (confirm('Delete this bookmark?')) {
        await chrome.bookmarks.remove(id);
        loadData();
    }
}

bookmarkForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(bookmarkForm);
    const folderId = await getFolder();
    let data: Bookmark = { 
        type: 'link', 
        title: (fd.get('title') as string) || '', 
        logo: (fd.get('logo') as string) || '', 
        url: (fd.get('url') as string) || '' 
    };
    
    if (currentEditId) {
        const [bm] = await chrome.bookmarks.get(currentEditId);
        const old = decode({ name: bm.title, url: bm.url || '' }) as Bookmark;
        data.x = old.x; data.y = old.y;
        const { name, url } = serialize(data);
        await chrome.bookmarks.update(currentEditId, { title: name, url });
    } else {
        data.x = "100"; data.y = "100";
        const { name, url } = serialize(data);
        await chrome.bookmarks.create({ parentId: folderId, title: name, url });
    }
    bookmarkDialog.close();
    loadData();
});

// Skills Management
addSkillBtn.addEventListener('click', async () => {
    await renderSkillsManager();
    skillsDialog.showModal();
});

closeSkillsBtn.addEventListener('click', () => skillsDialog.close());

async function renderSkillsManager() {
    const folderId = await getFolder();
    const items = await chrome.bookmarks.getChildren(folderId);
    skillsManagerList.innerHTML = '';
    
    items.forEach((item: any) => {
        try {
            const data = decode({ name: item.title, url: item.url || '' }) as Bookmark;
            if (data.type === 'skill') {
                const div = document.createElement('div');
                div.className = 'skill-item';
                if (currentSkillId === item.id) div.classList.add('active');
                div.textContent = data.title || '';
                div.onclick = () => {
                    currentSkillId = item.id;
                    editSkill(item);
                    renderSkillsManager();
                };
                skillsManagerList.appendChild(div);
            }
        } catch (e) {}
    });
}

function editSkill(bm: any) {
    const data = decode({ name: bm.title, url: bm.url || '' }) as Bookmark;
    (skillForm.elements.namedItem('title') as HTMLInputElement).value = data.title || '';
    skillContent.value = data.content || '';
    
    // Auto-expand
    skillContent.style.height = 'auto';
    skillContent.style.height = skillContent.scrollHeight + 'px';
    
    deleteSkillBtn.classList.remove('hidden');
}

newSkillBtn.addEventListener('click', () => {
    currentSkillId = null;
    skillForm.reset();
    skillContent.style.height = 'auto'; // Reset height
    deleteSkillBtn.classList.add('hidden');
    renderSkillsManager();
});

skillContent.addEventListener('input', () => {
    skillContent.style.height = 'auto';
    skillContent.style.height = skillContent.scrollHeight + 'px';
});

skillForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(skillForm);
    const folderId = await getFolder();
    const data: Bookmark = { 
        type: 'skill', 
        title: (fd.get('title') as string) || '', 
        content: (fd.get('content') as string) || ''
    };
    const { name, url } = serialize(data);

    if (currentSkillId) {
        await chrome.bookmarks.update(currentSkillId, { title: name, url });
    } else {
        await chrome.bookmarks.create({ parentId: folderId, title: name, url });
    }
    renderSkillsManager();
    loadData();
});

deleteSkillBtn.addEventListener('click', async () => {
    if (currentSkillId && confirm('Delete this skill?')) {
        await chrome.bookmarks.remove(currentSkillId);
        currentSkillId = null;
        skillForm.reset();
        deleteSkillBtn.classList.add('hidden');
        renderSkillsManager();
        loadData();
    }
});

// Start
initEngines();
loadData();
resizeSearch();
