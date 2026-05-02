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
const searchClear = document.getElementById('search-clear') as HTMLButtonElement;
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
const skillContent = document.getElementById('skill-content') as HTMLTextAreaElement;

const closeSkillsBtn = document.getElementById('close-skills-btn') as HTMLButtonElement;
const historyList = document.getElementById('history-list') as HTMLElement;
const historyPreview = document.getElementById('history-preview') as HTMLElement;
const historyPopover = document.getElementById('history-popover') as any;
const historyBtn = document.getElementById('history-btn') as HTMLButtonElement;

let isEditMode = false;
let currentFolderId: string | null = null;
let currentEditId: string | null = null;
let currentSkillId: string | null = null;

// Persistence
let activeSkillIds = new Set<string>(JSON.parse(localStorage.getItem('selected_skills') || '[]'));
let selectedEngineIds = new Set<string>(JSON.parse(localStorage.getItem('selected_engines') || '[]'));

let dragElement: HTMLElement | null = null;
let dragStartX = 0;
let dragStartY = 0;
let initialX = 0;
let initialY = 0;

function savePersistence() {
    localStorage.setItem('selected_skills', JSON.stringify(Array.from(activeSkillIds)));
    localStorage.setItem('selected_engines', JSON.stringify(Array.from(selectedEngineIds)));
}

// Init Search Engines
function initEngines() {
    enginesTop.innerHTML = '';
    enginesBottom.innerHTML = '';
    
    const allEngines = Object.entries(engines);
    allEngines.forEach(([id, engine]: [string, any], index) => {
        const a = document.createElement('a');
        a.id = `engine-${id}`;
        a.className = 'engine-link disabled';
        if (selectedEngineIds.has(id)) a.classList.add('selected');
        a.href = '';
        a.title = engine.label;
        a.tabIndex = index === 0 ? 0 : -1;
        a.innerHTML = `<img src="${engine.icon}" alt="${engine.label}">`;
        
        a.addEventListener('click', (e) => {
            e.preventDefault();
            a.classList.toggle('selected');
            if (a.classList.contains('selected')) {
                selectedEngineIds.add(id);
            } else {
                selectedEngineIds.delete(id);
            }
            savePersistence();
        });

        a.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                const next = (a.nextElementSibling as HTMLElement) || (a.parentElement === enginesTop ? enginesBottom.firstElementChild : null);
                next?.focus();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                const prev = (a.previousElementSibling as HTMLElement) || (a.parentElement === enginesBottom ? enginesTop.lastElementChild : null);
                prev?.focus();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const container = a.parentElement === enginesTop ? enginesBottom : null;
                if (container) {
                    const idx = Array.from(enginesTop.children).indexOf(a);
                    const target = container.children[idx] || container.lastElementChild;
                    (target as HTMLElement)?.focus();
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const container = a.parentElement === enginesBottom ? enginesTop : null;
                if (container) {
                    const idx = Array.from(enginesBottom.children).indexOf(a);
                    const target = container.children[idx] || container.lastElementChild;
                    (target as HTMLElement)?.focus();
                } else {
                    searchInput.focus();
                }
            } else if (e.key === ' ') {
                e.preventDefault();
                a.click();
            } else if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
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

    saveToHistory(rawQuery);

    const selectedEngines = Array.from(document.querySelectorAll('.engine-link.selected')) as HTMLElement[];
    const active = document.activeElement as HTMLElement;
    let targetEngines = selectedEngines;
    
    if (targetEngines.length === 0 && active && active.classList.contains('engine-link')) {
        targetEngines = [active];
    }

    if (targetEngines.length === 0) return;

    // Get combined skills prompt
    let skillsPrompt = '';
    if (activeSkillIds.size > 0) {
        const skillsData = await Promise.all(
            Array.from(activeSkillIds).map(async (id) => {
                try {
                    const [bm] = await chrome.bookmarks.get(id);
                    return decode({ name: bm.title, url: bm.url || '' }) as Bookmark;
                } catch (e) {
                    return null;
                }
            })
        );
        skillsPrompt = skillsData
            .map(s => s?.content?.trim())
            .filter(Boolean)
            .join('\n-----\n');
    }

    const processEngine = (id: string) => {
        const engine = (engines as any)[id];
        let query = rawQuery;
        if (engine.position === 'bottom' && skillsPrompt) {
            query = `${skillsPrompt}\n-----\n${rawQuery}`;
        }
        return engine.search(query);
    };

    if (targetEngines.length === 1) {
        const id = targetEngines[0].id.replace('engine-', '');
        const url = processEngine(id);
        console.log('handleOpen: single engine redirecting to', url);
        setTimeout(() => {
            window.location.href = url;
        }, 100);
    } else {
        targetEngines.forEach((el) => {
            const id = el.id.replace('engine-', '');
            const url = processEngine(id);
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
    localStorage.setItem('search_query', searchInput.value);
    searchClear.classList.toggle('hidden', !searchInput.value);

    const query = searchInput.value.trim();
    Object.entries(engines).forEach(([id, engine]: [string, any]) => {
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

searchClear.addEventListener('click', () => {
    searchInput.value = '';
    localStorage.removeItem('search_query');
    searchClear.classList.add('hidden');
    resizeSearch();
    searchInput.dispatchEvent(new Event('input'));
    searchInput.focus();
});

const searchGo = document.getElementById('search-go') as HTMLButtonElement;
searchGo.addEventListener('click', (e) => {
    e.preventDefault();
    handleOpen();
});

// Global Cmd+Enter and Navigation
window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        e.stopPropagation();
        handleOpen();
    }
}, true);

searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' && searchInput.selectionStart === searchInput.value.length) {
        if (searchInput.value.trim()) {
            e.preventDefault();
            const firstEngine = enginesTop.querySelector('.engine-link:not(.disabled)') as HTMLElement;
            if (firstEngine) firstEngine.focus();
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
    skills.forEach((bm, i) => renderSkill(bm, i === 0));
    
    // Refresh disabled state for engines
    searchInput.dispatchEvent(new Event('input'));
}

function renderBookmark(bm: any) {
    const data = decode({ name: bm.title, url: bm.url || '' }) as Bookmark;
    const a = document.createElement('a');
    a.className = 'bookmark';
    a.href = bm.url || '';
    a.dataset.id = bm.id;
    a.tabIndex = 0;
    a.style.left = `${data.x || 100}px`;
    a.style.top = `${data.y || 100}px`;

    a.innerHTML = `
        <div class="bookmark-icon"><img src="${data.logo || ''}"></div>
        <div class="bookmark-title">${data.title || 'No Title'}</div>
        <div class="bookmark-actions">
            <button class="action-btn btn-edit" data-id="${bm.id}">e</button>
            <button class="action-btn btn-del" data-id="${bm.id}">x</button>
        </div>
    `;

    a.addEventListener('mousedown', startDrag);
    a.addEventListener('click', (e) => { 
        if (isEditMode) {
            e.preventDefault();
        }
    });

    a.querySelector('.btn-edit')!.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation(); openEdit(bm.id);
    });
    a.querySelector('.btn-del')!.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation(); removeBookmark(bm.id);
    });

    gridContainer.appendChild(a);
}

function renderSkill(bm: any, isFirst: boolean) {
    const data = decode({ name: bm.title, url: bm.url || '' }) as Bookmark;
    const btn = document.createElement('button');
    btn.className = 'skill-btn';
    if (activeSkillIds.has(bm.id)) btn.classList.add('active');
    btn.textContent = data.title || '';
    btn.tabIndex = isFirst ? 0 : -1;
    
    btn.addEventListener('click', () => {
        if (activeSkillIds.has(bm.id)) {
            activeSkillIds.delete(bm.id);
        } else {
            activeSkillIds.add(bm.id);
        }
        savePersistence();
        
        const idx = Array.from(skillsList.children).indexOf(btn);
        loadData().then(() => {
            const nextBtn = skillsList.children[idx] as HTMLElement;
            nextBtn?.focus();
        });
    });

    btn.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            (btn.nextElementSibling as HTMLElement)?.focus();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            (btn.previousElementSibling as HTMLElement)?.focus();
        } else if (e.key === 'ArrowUp' && !btn.previousElementSibling) {
            e.preventDefault();
            const firstEngine = enginesTop.querySelector('.engine-link:not(.disabled)') as HTMLElement;
            if (firstEngine) firstEngine.focus();
        }
    });

    btn.addEventListener('focus', () => {
        Array.from(skillsList.children).forEach(c => (c as HTMLElement).tabIndex = -1);
        btn.tabIndex = 0;
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
                const row = document.createElement('div');
                row.className = 'skill-manager-row';
                if (currentSkillId === item.id) row.classList.add('active');
                
                row.innerHTML = `
                    <div class="skill-info">${data.title || ''}</div>
                    <div class="skill-row-actions">
                        <button class="action-btn btn-edit" title="Edit">e</button>
                        <button class="action-btn btn-del" title="Delete">x</button>
                    </div>
                `;

                const info = row.querySelector('.skill-info') as HTMLElement;
                info.onclick = () => {
                    currentSkillId = item.id;
                    editSkill(item);
                    renderSkillsManager();
                };

                row.querySelector('.btn-edit')!.addEventListener('click', (e) => {
                    e.stopPropagation();
                    currentSkillId = item.id;
                    editSkill(item);
                    renderSkillsManager();
                });

                row.querySelector('.btn-del')!.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm('Delete this skill?')) {
                        chrome.bookmarks.remove(item.id, () => {
                            if (currentSkillId === item.id) {
                                currentSkillId = null;
                                skillForm.reset();
                                skillContent.style.height = 'auto';
                            }
                            activeSkillIds.delete(item.id);
                            savePersistence();
                            renderSkillsManager();
                            loadData();
                        });
                    }
                });

                skillsManagerList.appendChild(row);
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
}

newSkillBtn.addEventListener('click', () => {
    currentSkillId = null;
    skillForm.reset();
    skillContent.style.height = 'auto'; // Reset height
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

// History logic
function saveToHistory(prompt: string) {
    if (!prompt || !prompt.trim()) return;
    const KEY = 'chrome_homepage_history_v2';
    let history = JSON.parse(localStorage.getItem(KEY) || '[]');
    history = history.filter((p: string) => p !== prompt);
    history.unshift(prompt);
    if (history.length > 10) history.pop();
    localStorage.setItem(KEY, JSON.stringify(history));
}

function renderHistory() {
    const KEY = 'chrome_homepage_history_v2';
    const history = JSON.parse(localStorage.getItem(KEY) || '[]');
    historyList.innerHTML = '';
    
    if (history.length === 0) {
        historyList.innerHTML = '<div style="padding: 1rem; color: #94a3b8; font-size: 0.85rem;">No history yet</div>';
        historyPreview.textContent = '';
        return;
    }

    history.forEach((prompt: string, index: number) => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <div class="history-item-text">${prompt}</div>
            <button class="use-btn">use</button>
        `;
        
        item.onclick = () => {
            Array.from(historyList.children).forEach(c => c.classList.remove('active'));
            item.classList.add('active');
            historyPreview.textContent = prompt;
        };
        
        item.querySelector('.use-btn')!.addEventListener('click', (e) => {
            e.stopPropagation();
            searchInput.value = prompt;
            searchInput.dispatchEvent(new Event('input'));
            resizeSearch();
            if (historyPopover.hidePopover) {
                historyPopover.hidePopover();
            }
            searchInput.focus();
        });
        
        historyList.appendChild(item);
        
        if (index === 0) {
            item.click();
        }
    });
}

historyPopover.addEventListener("toggle", (e: any) => {
  if (e.newState === "open") {
    renderHistory();
  }
});

// Start
initEngines();
loadData();

// Restore search
const savedQuery = localStorage.getItem('search_query');
if (savedQuery) {
    searchInput.value = savedQuery;
    searchClear.classList.toggle('hidden', !savedQuery);
}

resizeSearch();
