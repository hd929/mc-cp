const socket = io();

// UI Elements: Status & Controls
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const btnStart = document.getElementById('btnStart');
const btnStop = document.getElementById('btnStop');
const btnClear = document.getElementById('btnClear');
const terminal = document.getElementById('terminal');
const cmdForm = document.getElementById('cmdForm');
const cmdInput = document.getElementById('cmdInput');
const submitBtn = cmdForm.querySelector('button');

// Nav & Views
const navConsole = document.getElementById('navConsole');
const navFiles = document.getElementById('navFiles');
const navSettings = document.getElementById('navSettings');
const viewConsole = document.getElementById('viewConsole');
const viewFiles = document.getElementById('viewFiles');
const viewSettings = document.getElementById('viewSettings');
const settingsForm = document.getElementById('settingsForm');

// Modal Elements
const eulaModal = document.getElementById('eulaModal');
const btnAgreeEula = document.getElementById('btnAgreeEula');
const btnCloseEula = document.getElementById('btnCloseEula');

// Editor Modal Elements
const editModal = document.getElementById('editModal');
const editModalTitle = document.getElementById('editModalTitle');
const editModalContent = document.getElementById('editModalContent');
const btnSaveFile = document.getElementById('btnSaveFile');
const btnCloseEdit = document.getElementById('btnCloseEdit');

// File Manager Elements
const fileListBody = document.getElementById('fileListBody');
const breadcrumb = document.getElementById('breadcrumb');
const btnUpload = document.getElementById('btnUpload');
const btnUploadFolder = document.getElementById('btnUploadFolder');
const fileUploadInput = document.getElementById('fileUploadInput');
const folderUploadInput = document.getElementById('folderUploadInput');
const btnRefresh = document.getElementById('btnRefresh');
const uploadProgress = document.getElementById('uploadProgress');

// Drag & Drop
const dropZone = document.getElementById('dropZoneContainer');
const dropOverlay = document.getElementById('dropOverlay');

// Global States
let isFirstLog = true;
let currentPath = '';
let currentEditFilePath = '';

// Khả năng nhận diện file sửa được bằng Web editor
const EDITABLE_EXTENSIONS = ['.txt', '.json', '.yml', '.yaml', '.properties', '.conf', '.properties', '.log'];

// --- LOCALIZATION LOGIC ---
const translations = {
    vi: {
        "app-title": "MC Panel",
        "status-title": "Trạng thái",
        "status-loading": "Đang tải...",
        "status-online": "Trực tuyến",
        "status-offline": "Ngoại tuyến",
        "status-starting": "Đang khởi động...",
        "nav-console": "Console",
        "nav-files": "Quản lý File",
        "btn-start": "Khởi động",
        "btn-stop": "Tắt Server",
        "btn-clear": "Xóa Console",
        "console-title": "Server Console",
        "welcome-title": "Chào mừng đến với MC Panel",
        "welcome-desc": "Nhấn Khởi động để bật server Minecraft của bạn.",
        "cmd-placeholder": "Nhập lệnh (vd: help, op player)...",
        "files-title": "Quản lý File",
        "btn-upload": "Tải file",
        "btn-upload-folder": "Tải folder",
        "file-name": "Tên tập tin",
        "file-size": "Kích thước",
        "file-date": "Cập nhật lần cuối",
        "file-action": "Thao tác",
        "uploading": "Đang tải lên... Xin chờ!",
        "eula-title": "Chấp nhận EULA",
        "eula-desc1": "Minecraft yêu cầu bạn phải đồng ý với EULA để chạy máy chủ.",
        "eula-desc2": "Bằng việc nhấn 'Đồng ý', hệ thống sẽ tự động xác nhận ",
        "btn-agree": "Đồng ý EULA",
        "btn-close": "Đóng",
        "btn-save": "Lưu nội dung",
        "drop-files": "Thả file/folder vào đây để tải lên",
        "confirm-stop": "Bạn có chắc muốn tắt server? Việc này có thể cần thời gian lưu dữ liệu.",
        "confirm-delete": "Bạn có chắc muốn xóa",
        "err-upload": "Upload thất bại",
        "err-delete": "Lỗi khi xóa!",
        "err-read": "Lỗi mở tệp!",
        "err-save": "Lỗi lưu tệp!",
        "nav-settings": "Cài đặt",
        "settings-title": "Cài đặt Server",
        "lbl-java-path": "Đường dẫn Java (mặc định: java)",
        "lbl-ram-max": "RAM tối đa (Xmx)",
        "lbl-ram-min": "RAM tối thiểu (Xms)",
        "lbl-jar-file": "File Server (.jar)",
        "lbl-extra-args": "Tham số JVM khác",
        "btn-save-settings": "Lưu Cài Đặt",
        "msg-settings-saved": "Đã lưu cài đặt thành công!"
    },
    en: {
        "app-title": "MC Panel",
        "status-title": "Status",
        "status-loading": "Loading...",
        "status-online": "Online",
        "status-offline": "Offline",
        "status-starting": "Starting...",
        "nav-console": "Console",
        "nav-files": "File Manager",
        "btn-start": "Start",
        "btn-stop": "Stop Server",
        "btn-clear": "Clear Console",
        "console-title": "Server Console",
        "welcome-title": "Welcome to MC Panel",
        "welcome-desc": "Click Start to boot your Minecraft server.",
        "cmd-placeholder": "Enter command (e.g. help, op player)...",
        "files-title": "File Manager",
        "btn-upload": "Upload files",
        "btn-upload-folder": "Upload folder",
        "file-name": "File Name",
        "file-size": "Size",
        "file-date": "Last Modified",
        "file-action": "Action",
        "uploading": "Uploading... Please wait!",
        "eula-title": "Accept EULA",
        "eula-desc1": "Minecraft requires you to agree to the EULA to run the server.",
        "eula-desc2": "By clicking 'Agree', we will automatically set eula=true.",
        "btn-agree": "Agree EULA",
        "btn-close": "Close",
        "btn-save": "Save Changes",
        "drop-files": "Drop files/folders here to upload",
        "confirm-stop": "Are you sure you want to stop the server? World saving might take some time.",
        "confirm-delete": "Are you sure you want to delete",
        "err-upload": "Upload failed",
        "err-delete": "Delete failed!",
        "err-read": "Error reading file!",
        "err-save": "Error saving file!",
        "nav-settings": "Settings",
        "settings-title": "Server Settings",
        "lbl-java-path": "Java Path (default: java)",
        "lbl-ram-max": "Max RAM (Xmx)",
        "lbl-ram-min": "Min RAM (Xms)",
        "lbl-jar-file": "Server executable (.jar)",
        "lbl-extra-args": "Extra JVM Args",
        "btn-save-settings": "Save Settings",
        "msg-settings-saved": "Settings saved successfully!"
    }
};

let currentLang = localStorage.getItem('mc-lang') || 'vi';

function updateLanguage() {
    const t = translations[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        if (t[el.getAttribute('data-i18n')]) el.textContent = t[el.getAttribute('data-i18n')];
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        if (t[el.getAttribute('data-i18n-ph')]) el.setAttribute('placeholder', t[el.getAttribute('data-i18n-ph')]);
    });
    document.getElementById('currentLangLabel').textContent = currentLang === 'vi' ? 'Tiếng Việt' : 'English';
    const state = statusIndicator.className.replace('status-indicator ', '');
    updateStateUI(state); 
}

document.getElementById('btnLang').addEventListener('click', () => {
    currentLang = currentLang === 'vi' ? 'en' : 'vi';
    localStorage.setItem('mc-lang', currentLang);
    updateLanguage();
});

function t(key) { return translations[currentLang][key] || key; }

// --- TAB SWITCH LOGIC ---
navConsole.addEventListener('click', () => {
    navConsole.classList.add('active'); navFiles.classList.remove('active'); navSettings.classList.remove('active');
    viewConsole.classList.add('active'); viewFiles.classList.remove('active'); viewSettings.classList.remove('active');
});

navFiles.addEventListener('click', () => {
    navFiles.classList.add('active'); navConsole.classList.remove('active'); navSettings.classList.remove('active');
    viewFiles.classList.add('active'); viewConsole.classList.remove('active'); viewSettings.classList.remove('active');
    fetchFiles(currentPath);
});

navSettings.addEventListener('click', () => {
    navSettings.classList.add('active'); navConsole.classList.remove('active'); navFiles.classList.remove('active');
    viewSettings.classList.add('active'); viewConsole.classList.remove('active'); viewFiles.classList.remove('active');
    loadSettings();
});

// --- EULA LOGIC ---
socket.on('eula-required', () => eulaModal.classList.remove('hidden'));
btnAgreeEula.addEventListener('click', () => { socket.emit('accept-eula'); eulaModal.classList.add('hidden'); });
btnCloseEula.addEventListener('click', () => eulaModal.classList.add('hidden') );

// --- ANSI TO HTML CONVERTER ---
function ansiToHtml(text) {
    let result = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const colors = { '30': 'black', '31': '#ef4444', '32': '#10b981', '33': '#f59e0b', '34': '#3b82f6', '35': '#d946ef', '36': '#06b6d4', '37': '#f8fafc', '90': '#94a3b8' };
    result = result.replace(/\x1b\[([0-9;]*)m/g, (match, codes) => {
        if (codes === '0' || codes === '') return '</span>';
        let css = '';
        codes.split(';').forEach(code => {
            if (colors[code]) css += `color: ${colors[code]};`;
            if (code === '1') css += 'font-weight: bold;';
        });
        return `<span style="${css}">`;
    });
    return result;
}

// --- SOCKET EVENTS ---
function updateStateUI(state) {
    statusIndicator.className = `status-indicator ${state}`;
    if (state === 'online') {
        statusText.textContent = t('status-online'); statusText.style.color = 'var(--success)';
        btnStart.disabled = true; btnStop.disabled = false; cmdInput.disabled = false; submitBtn.disabled = false;
    } else if (state === 'offline') {
        statusText.textContent = t('status-offline'); statusText.style.color = 'var(--danger)';
        btnStart.disabled = false; btnStop.disabled = true; cmdInput.disabled = true; submitBtn.disabled = true;
    } else if (state === 'starting') {
        statusText.textContent = t('status-starting'); statusText.style.color = 'var(--warning)';
        btnStart.disabled = true; btnStop.disabled = false; cmdInput.disabled = false; submitBtn.disabled = false;
    }
}
socket.on('status', updateStateUI);

socket.on('log', (data) => {
    if (isFirstLog) { terminal.innerHTML = ''; isFirstLog = false; }
    const isAtBottom = terminal.scrollHeight - terminal.scrollTop <= terminal.clientHeight + 50;
    data.split('\n').forEach(line => {
        if (!line && data.split('\n').length > 1) return;
        const span = document.createElement('span');
        span.innerHTML = ansiToHtml(line);
        terminal.appendChild(span);
    });
    if (isAtBottom) terminal.scrollTop = terminal.scrollHeight;
});

// --- SERVER CONTROLS ---
btnStart.addEventListener('click', () => { if (isFirstLog) { terminal.innerHTML = ''; isFirstLog = false; } socket.emit('start'); });
btnStop.addEventListener('click', () => { if (confirm(t('confirm-stop'))) socket.emit('stop'); });
btnClear.addEventListener('click', () => { terminal.innerHTML = ''; isFirstLog = false; });
cmdForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const cmd = cmdInput.value.trim();
    if (cmd) { socket.emit('command', cmd); cmdInput.value = ''; }
});

// --- FILE EDITOR LOGIC ---
async function openFileEditor(filePath, fileName) {
    try {
        const res = await fetch(`/api/file-content?path=${encodeURIComponent(filePath)}`);
        const json = await res.json();
        if(!res.ok) throw new Error(json.error || t('err-read'));
        
        currentEditFilePath = filePath;
        editModalTitle.textContent = fileName;
        editModalContent.value = json.content;
        editModal.classList.remove('hidden');
    } catch(e) {
        alert(t('err-read') + "\n" + e.message);
    }
}

btnCloseEdit.addEventListener('click', () => {
    editModal.classList.add('hidden');
    currentEditFilePath = '';
});

btnSaveFile.addEventListener('click', async () => {
    try {
        const content = editModalContent.value;
        const res = await fetch('/api/file-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetPath: currentEditFilePath, content })
        });
        const json = await res.json();
        if(!res.ok) throw new Error(json.error || t('err-save'));
        
        // Success
        editModal.classList.add('hidden');
        alert("Thành công! Saved " + editModalTitle.textContent);
    } catch(e) {
        alert(t('err-save') + "\n" + e.message);
    }
});


// --- DRAG AND DROP FILE MANAGER LOGIC ---
let dragCounter = 0;
dropZone.addEventListener('dragenter', (e) => { e.preventDefault(); dragCounter++; dropOverlay.classList.remove('hidden'); });
dropZone.addEventListener('dragleave', (e) => { e.preventDefault(); dragCounter--; if (dragCounter === 0) dropOverlay.classList.add('hidden'); });
dropZone.addEventListener('dragover', (e) => e.preventDefault());
dropZone.addEventListener('drop', async (e) => {
    e.preventDefault(); dragCounter = 0; dropOverlay.classList.add('hidden');
    if (e.dataTransfer.items) {
        let filesToUpload = [];
        let promises = [];
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
            let item = e.dataTransfer.items[i];
            if (item.kind === 'file') {
                let entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
                if (entry) promises.push(traverseFileTree(entry, '', filesToUpload));
            }
        }
        await Promise.all(promises);
        if (filesToUpload.length > 0) uploadFilesArrayAsync(filesToUpload);
    } else if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        uploadFileListAsync(e.dataTransfer.files);
    }
});

function traverseFileTree(item, path = '', filesList) {
    return new Promise((resolve) => {
        if (item.isFile) {
            item.file((file) => {
                file.customPath = path + file.name;
                filesList.push(file);
                resolve();
            });
        } else if (item.isDirectory) {
            let dirReader = item.createReader();
            let entries = [];
            let readEntries = () => {
                dirReader.readEntries((results) => {
                    if (!results.length) {
                        Promise.all(entries.map(ent => traverseFileTree(ent, path + item.name + "/", filesList))).then(resolve);
                    } else {
                        entries = entries.concat(Array.from(results));
                        readEntries();
                    }
                });
            };
            readEntries();
        } else {
            resolve();
        }
    });
}


// --- FILE MANAGER LISTING LOGIC ---
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'], i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function fetchFiles(path = '') {
    try {
        const res = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
        if (!res.ok) throw new Error('Network error');
        renderFiles(await res.json(), path);
    } catch (e) { console.error(e); }
}

function renderBreadcrumbs(path) {
    breadcrumb.innerHTML = '';
    const rootSpan = document.createElement('span');
    rootSpan.className = 'path-item'; rootSpan.textContent = '/ Root';
    rootSpan.onclick = () => { currentPath = ''; fetchFiles(''); };
    breadcrumb.appendChild(rootSpan);

    if (path) {
        let acc = '';
        path.split('/').filter(p => p).forEach((p) => {
            acc += '/' + p;
            breadcrumb.appendChild(document.createTextNode(' / '));
            const span = document.createElement('span');
            span.className = 'path-item'; span.textContent = p;
            const targetPath = acc.substring(1);
            span.onclick = () => { currentPath = targetPath; fetchFiles(targetPath); };
            breadcrumb.appendChild(span);
        });
    }
}

function renderFiles(files, path) {
    fileListBody.innerHTML = '';
    renderBreadcrumbs(path);

    if (path) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="4"><div class="file-item-name" style="color: var(--text-secondary)"><i class="fa-solid fa-level-up-alt file-icon"></i>...</div></td>`;
        tr.querySelector('.file-item-name').onclick = () => {
            const upPath = path.split('/').slice(0, -1).join('/');
            currentPath = upPath; fetchFiles(upPath);
        };
        fileListBody.appendChild(tr);
    }

    files.forEach(f => {
        const tr = document.createElement('tr');
        const isEditable = !f.isDir && EDITABLE_EXTENSIONS.some(ext => f.name.toLowerCase().endsWith(ext));
        const icon = f.isDir ? 'fa-folder' : (isEditable ? 'fa-file-code' : 'fa-file');
        const tPath = path ? `${path}/${f.name}` : f.name;

        // Render Action buttons based on editability
        let actionsHtml = `<button class="btn-download" title="Download"><i class="fa-solid fa-download"></i></button>
                           <button class="btn-delete" title="Delete"><i class="fa-solid fa-trash-can"></i></button>`;
        if (isEditable && f.size < 2 * 1024 * 1024) { 
            actionsHtml = `<button class="btn-edit" title="Edit"><i class="fa-solid fa-pen"></i></button>` + actionsHtml; 
        }

        tr.innerHTML = `
            <td><div class="file-item-name"><i class="fa-solid ${icon} file-icon"></i>${f.name}</div></td>
            <td>${f.isDir ? '-' : formatBytes(f.size)}</td>
            <td>${new Date(f.mtime).toLocaleString()}</td>
            <td>${actionsHtml}</td>
        `;

        if (f.isDir) {
            tr.querySelector('.file-item-name').onclick = () => { currentPath = tPath; fetchFiles(tPath); };
        } else if (isEditable) {
            tr.querySelector('.file-item-name').onclick = () => openFileEditor(tPath, f.name);
            const btnEdit = tr.querySelector('.btn-edit');
            if(btnEdit) btnEdit.onclick = () => openFileEditor(tPath, f.name);
        }

        tr.querySelector('.btn-delete').onclick = async () => {
            if (confirm(`${t('confirm-delete')} "${f.name}"?`)) {
                try {
                    const res = await fetch('/api/files', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetPath: tPath }) });
                    if (res.ok) fetchFiles(currentPath); else alert(t('err-delete'));
                } catch (e) { console.error(e); }
            }
        };

        tr.querySelector('.btn-download').onclick = () => {
            window.open(`/api/download?path=${encodeURIComponent(tPath)}`, '_blank');
        };

        fileListBody.appendChild(tr);
    });
}

btnRefresh.addEventListener('click', () => fetchFiles(currentPath));
btnUpload.addEventListener('click', () => { fileUploadInput.click(); });
btnUploadFolder.addEventListener('click', () => { folderUploadInput.click(); });
fileUploadInput.addEventListener('change', (e) => { if (e.target.files.length) uploadFileListAsync(e.target.files); });
folderUploadInput.addEventListener('change', (e) => { if (e.target.files.length) uploadFileListAsync(e.target.files); });

async function uploadFileListAsync(files) {
    let filesArray = [];
    for(let i = 0; i < files.length; i++) filesArray.push(files[i]);
    return uploadFilesArrayAsync(filesArray);
}

async function uploadFilesArrayAsync(filesArray) {
    if (!filesArray || filesArray.length === 0) return;
    const formData = new FormData(); formData.append('path', currentPath);
    for (let i = 0; i < filesArray.length; i++) {
        const f = filesArray[i];
        const filepath = f.customPath || f.webkitRelativePath || f.name;
        formData.append('files', f, filepath);
    }
    uploadProgress.classList.remove('hidden');

    try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (res.ok) fetchFiles(currentPath); else alert(t('err-upload'));
    } catch (e) { alert(e.message); } 
    finally { 
        uploadProgress.classList.add('hidden'); 
        if (fileUploadInput) fileUploadInput.value = ''; 
        if (folderUploadInput) folderUploadInput.value = ''; 
    }
}

updateLanguage();

// --- SETTINGS LOGIC ---
async function loadSettings() {
    try {
        const res = await fetch('/api/settings');
        const config = await res.json();
        document.getElementById('cfgJavaPath').value = config.javaPath || '';
        document.getElementById('cfgMaxRam').value = config.maxRam || '';
        document.getElementById('cfgMinRam').value = config.minRam || '';
        document.getElementById('cfgJarFile').value = config.jarFile || '';
        document.getElementById('cfgExtraArgs').value = config.extraArgs || '';
    } catch (e) {
        console.error(e);
    }
}

settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const config = {
        javaPath: document.getElementById('cfgJavaPath').value,
        maxRam: document.getElementById('cfgMaxRam').value,
        minRam: document.getElementById('cfgMinRam').value,
        jarFile: document.getElementById('cfgJarFile').value,
        extraArgs: document.getElementById('cfgExtraArgs').value
    };
    try {
        const res = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });
        if (res.ok) alert(t('msg-settings-saved') || "Settings saved!");
    } catch (e) {
        console.error(e);
    }
});
