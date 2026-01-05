const { ipcRenderer, shell } = require('electron');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();

const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const noteList = document.getElementById('note-list');
const addNoteBtn = document.getElementById('add-note-btn');
const modeBtn = document.getElementById('mode-btn');
const saveAsBtn = document.getElementById('save-as-btn');
const minBtn = document.getElementById('min-btn');
const closeBtn = document.getElementById('close-btn');

let currentFilename = null;
let notes = [];
let isExpanded = true;

// 初始化
async function init() {
    await loadNotes();
    if (notes.length === 0) {
        createNewNote();
    } else {
        selectNote(notes[0].name);
    }
}

async function loadNotes() {
    notes = await ipcRenderer.invoke('get-notes');
    renderNoteList();
}

function renderNoteList() {
    noteList.innerHTML = '';
    notes.forEach(note => {
        const li = document.createElement('li');
        li.textContent = note.name.replace('.md', '');
        li.dataset.filename = note.name;
        li.onclick = () => selectNote(note.name);
        if (currentFilename === note.name) li.classList.add('active');
        noteList.appendChild(li);
    });
}

function selectNote(filename) {
    currentFilename = filename;
    const note = notes.find(n => n.name === filename);
    if (note) {
        editor.value = note.content;
        updatePreview();
        renderNoteList();
    }
}

function createNewNote() {
    const name = `Note-${new Date().toISOString().replace(/[:.]/g, '-')}.md`;
    const newNote = { name, content: '' };
    notes.unshift(newNote);
    ipcRenderer.invoke('save-note', newNote);
    selectNote(name);
}

function updatePreview() {
    preview.innerHTML = md.render(editor.value);
}

// 自动保存
let saveTimeout;
editor.addEventListener('input', () => {
    updatePreview();
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        if (currentFilename) {
            const content = editor.value;
            ipcRenderer.invoke('save-note', { name: currentFilename, content });
            // 更新本地缓存
            const note = notes.find(n => n.name === currentFilename);
            if (note) note.content = content;
        }
    }, 500);
});

// 按钮事件
addNoteBtn.onclick = createNewNote;

modeBtn.onclick = () => {
    ipcRenderer.invoke('toggle-mode');
};

minBtn.onclick = () => ipcRenderer.invoke('minimize-window');
closeBtn.onclick = () => ipcRenderer.invoke('close-window');

saveAsBtn.onclick = () => saveAs();

function saveAs() {
    if (!currentFilename) return;
    ipcRenderer.invoke('save-file-dialog', {
        defaultName: currentFilename,
        content: editor.value
    });
}

// IPC 事件
ipcRenderer.on('mode-changed', (event, mode) => {
    isExpanded = mode === 'expanded';
    document.body.classList.toggle('compact', !isExpanded);
    if (isExpanded) {
        modeBtn.textContent = '🪟';
    } else {
        modeBtn.textContent = '↗';
    }
});

// 快捷键
window.addEventListener('keydown', (e) => {
    // Ctrl+N 新建
    if (e.ctrlKey && e.key === 'n') {
        createNewNote();
    }
    
    // Ctrl+Space 切换模式 (虽然主进程已注册，但渲染进程也可以处理)
    if (e.ctrlKey && e.code === 'Space') {
        ipcRenderer.invoke('toggle-mode');
    }

    // Ctrl+Alt+S 另存为
    if (e.ctrlKey && e.altKey && e.key === 's') {
        saveAs();
    }

    // Backspace 删除 (仅在列表聚焦或非编辑状态下)
    // 简化逻辑：如果在 sidebar 区域或者 body 聚焦且不是 editor
    if (e.key === 'Backspace') {
        if (document.activeElement !== editor && currentFilename) {
             deleteNote(currentFilename);
        }
    }
});

async function deleteNote(filename) {
    if (confirm('确定要删除这条笔记吗？')) {
        await ipcRenderer.invoke('delete-note', filename);
        await loadNotes();
        if (notes.length > 0) {
            selectNote(notes[0].name);
        } else {
            editor.value = '';
            preview.innerHTML = '';
            currentFilename = null;
        }
    }
}

// 缩放
const { webFrame } = require('electron');
window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.key === '=' || e.key === '+')) {
        webFrame.setZoomLevel(webFrame.getZoomLevel() + 1);
    }
    if (e.ctrlKey && e.key === '-') {
        webFrame.setZoomLevel(webFrame.getZoomLevel() - 1);
    }
    if (e.ctrlKey && e.key === '0') {
        webFrame.setZoomLevel(0);
    }
});

init();
