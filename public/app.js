const socket = io();

// UI Elements: Status & Controls
const statusIndicator = document.getElementById('statusIndicator');
const statusIndicatorMobile = document.getElementById('statusIndicatorMobile');
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
const navProperties = document.getElementById('navProperties');
const navSettings = document.getElementById('navSettings');
const viewConsole = document.getElementById('viewConsole');
const viewFiles = document.getElementById('viewFiles');
const viewProperties = document.getElementById('viewProperties');
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

// Confirm Modal
const confirmModal = document.getElementById('confirmModal');
const confirmMessage = document.getElementById('confirmMessage');
const btnConfirmOk = document.getElementById('btnConfirmOk');
const btnConfirmCancel = document.getElementById('btnConfirmCancel');

// File Manager Elements
const fileListBody = document.getElementById('fileListBody');
const breadcrumb = document.getElementById('breadcrumb');
const btnUpload = document.getElementById('btnUpload');
const btnUploadFolder = document.getElementById('btnUploadFolder');
const fileUploadInput = document.getElementById('fileUploadInput');
const folderUploadInput = document.getElementById('folderUploadInput');
const btnRefresh = document.getElementById('btnRefresh');
const uploadProgress = document.getElementById('uploadProgress');

// Server Properties Elements
const propFormView = document.getElementById('propFormView');
const propRawView = document.getElementById('propRawView');
const propRawTextarea = document.getElementById('propRawTextarea');
const propBanner = document.getElementById('propBanner');
const btnPropFormMode = document.getElementById('btnPropFormMode');
const btnPropRawMode = document.getElementById('btnPropRawMode');
const btnPropReload = document.getElementById('btnPropReload');
const btnPropSave = document.getElementById('btnPropSave');
const propSearch = document.getElementById('propSearch');

// Sidebar Elements
const sidebar = document.getElementById('sidebar');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');
const btnSidebarOpen = document.getElementById('btnSidebarOpen');
const btnSidebarToggle = document.getElementById('btnSidebarToggle');

// Drag & Drop
const dropZone = document.getElementById('dropZoneContainer');
const dropOverlay = document.getElementById('dropOverlay');

// Toast container
const toastContainer = document.getElementById('toastContainer');

// Global States
let isFirstLog = true;
let currentPath = '';
let currentEditFilePath = '';
let propMode = 'form'; // 'form' or 'raw'
let currentProperties = {}; // current in-memory state
let originalRaw = '';

const EDITABLE_EXTENSIONS = ['.txt', '.json', '.yml', '.yaml', '.properties', '.conf', '.log', '.md', '.cfg', '.ini'];

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
        "nav-properties": "Server Properties",
        "nav-settings": "Cài đặt",
        "btn-start": "Khởi động",
        "btn-stop": "Tắt Server",
        "btn-clear": "Xóa Console",
        "btn-confirm": "Đồng ý",
        "btn-cancel": "Hủy",
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
        "confirm-title": "Xác nhận",
        "confirm-stop": "Bạn có chắc muốn tắt server? Việc này có thể cần thời gian lưu dữ liệu.",
        "confirm-delete": "Bạn có chắc muốn xóa",
        "err-upload": "Upload thất bại",
        "err-delete": "Lỗi khi xóa!",
        "err-read": "Lỗi mở tệp!",
        "err-save": "Lỗi lưu tệp!",
        "settings-title": "Cài đặt Server",
        "settings-section-java": "Java & JVM",
        "settings-section-java-desc": "Cấu hình runtime Java dùng để khởi chạy server.",
        "lbl-java-path": "Đường dẫn Java (mặc định: java)",
        "lbl-ram-max": "RAM tối đa (Xmx)",
        "lbl-ram-min": "RAM tối thiểu (Xms)",
        "lbl-jar-file": "File Server (.jar)",
        "lbl-extra-args": "Tham số JVM khác",
        "btn-save-settings": "Lưu Cài Đặt",
        "msg-settings-saved": "Đã lưu cài đặt thành công!",
        "msg-saved": "Đã lưu thành công!",
        "msg-extracted": "Giải nén thành công!",
        "properties-title": "Server Properties",
        "props-mode-form": "Form",
        "props-mode-raw": "Raw",
        "props-search-ph": "Tìm thuộc tính...",
        "props-banner-new": "Chưa tìm thấy server.properties. Đang hiển thị mặc định — nhấn Lưu để tạo file.",
        "props-section-game": "Gameplay",
        "props-section-world": "Thế giới",
        "props-section-players": "Người chơi",
        "props-section-network": "Mạng",
        "props-section-advanced": "Nâng cao",
        "props-section-other": "Khác",
        "msg-no-match": "Không có thuộc tính nào khớp.",
        "msg-load-error": "Không tải được server.properties"
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
        "nav-properties": "Server Properties",
        "nav-settings": "Settings",
        "btn-start": "Start",
        "btn-stop": "Stop Server",
        "btn-clear": "Clear Console",
        "btn-confirm": "Confirm",
        "btn-cancel": "Cancel",
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
        "confirm-title": "Confirm",
        "confirm-stop": "Are you sure you want to stop the server? World saving might take some time.",
        "confirm-delete": "Are you sure you want to delete",
        "err-upload": "Upload failed",
        "err-delete": "Delete failed!",
        "err-read": "Error reading file!",
        "err-save": "Error saving file!",
        "settings-title": "Server Settings",
        "settings-section-java": "Java & JVM",
        "settings-section-java-desc": "Configure the Java runtime used to launch the server.",
        "lbl-java-path": "Java Path (default: java)",
        "lbl-ram-max": "Max RAM (Xmx)",
        "lbl-ram-min": "Min RAM (Xms)",
        "lbl-jar-file": "Server executable (.jar)",
        "lbl-extra-args": "Extra JVM Args",
        "btn-save-settings": "Save Settings",
        "msg-settings-saved": "Settings saved successfully!",
        "msg-saved": "Saved successfully!",
        "msg-extracted": "Extracted successfully!",
        "properties-title": "Server Properties",
        "props-mode-form": "Form",
        "props-mode-raw": "Raw",
        "props-search-ph": "Search properties...",
        "props-banner-new": "server.properties not found yet. Showing defaults — click Save to create the file.",
        "props-section-game": "Gameplay",
        "props-section-world": "World",
        "props-section-players": "Players",
        "props-section-network": "Network",
        "props-section-advanced": "Advanced",
        "props-section-other": "Other",
        "msg-no-match": "No properties matched.",
        "msg-load-error": "Failed to load server.properties"
    }
};

let currentLang = localStorage.getItem('mc-lang') || 'vi';

function updateLanguage() {
    const tdict = translations[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        if (tdict[el.getAttribute('data-i18n')]) el.textContent = tdict[el.getAttribute('data-i18n')];
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        if (tdict[el.getAttribute('data-i18n-ph')]) el.setAttribute('placeholder', tdict[el.getAttribute('data-i18n-ph')]);
    });
    document.getElementById('currentLangLabel').textContent = currentLang === 'vi' ? 'Tiếng Việt' : 'English';
    const state = (statusIndicator.className.match(/online|offline|starting/) || [''])[0];
    if (state) updateStateUI(state);
    // Refresh prop section names if rendered
    if (Object.keys(currentProperties).length) renderPropertiesForm(currentProperties);
}

document.getElementById('btnLang').addEventListener('click', () => {
    currentLang = currentLang === 'vi' ? 'en' : 'vi';
    localStorage.setItem('mc-lang', currentLang);
    updateLanguage();
});

function t(key) { return translations[currentLang][key] || key; }

// --- TOAST ---
function toast(message, type = 'info', timeout = 3200) {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    const iconMap = { success: 'fa-circle-check', error: 'fa-circle-xmark', warning: 'fa-triangle-exclamation', info: 'fa-circle-info' };
    el.innerHTML = `<i class="fa-solid ${iconMap[type] || iconMap.info}"></i><div>${escapeHtml(message)}</div>`;
    toastContainer.appendChild(el);
    setTimeout(() => {
        el.classList.add('dismissing');
        setTimeout(() => el.remove(), 220);
    }, timeout);
}
function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

// --- CONFIRM MODAL ---
let confirmResolver = null;
function showConfirm(message) {
    confirmMessage.textContent = message;
    confirmModal.classList.remove('hidden');
    return new Promise(resolve => { confirmResolver = resolve; });
}
btnConfirmOk.addEventListener('click', () => { confirmModal.classList.add('hidden'); if (confirmResolver) confirmResolver(true); });
btnConfirmCancel.addEventListener('click', () => { confirmModal.classList.add('hidden'); if (confirmResolver) confirmResolver(false); });
confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) { confirmModal.classList.add('hidden'); if (confirmResolver) confirmResolver(false); }
});

// --- TAB SWITCH LOGIC ---
function activateView(viewName) {
    const map = {
        console: { nav: navConsole, view: viewConsole },
        files: { nav: navFiles, view: viewFiles, init: () => fetchFiles(currentPath) },
        properties: { nav: navProperties, view: viewProperties, init: () => loadServerProperties() },
        settings: { nav: navSettings, view: viewSettings, init: () => loadSettings() },
    };
    Object.values(map).forEach(({ nav, view }) => {
        nav.classList.remove('active');
        view.classList.remove('active');
    });
    const target = map[viewName];
    if (target) {
        target.nav.classList.add('active');
        target.view.classList.add('active');
        if (target.init) target.init();
    }
    // Close mobile sidebar after navigation
    if (window.innerWidth <= 900) closeSidebar();
}

navConsole.addEventListener('click', () => activateView('console'));
navFiles.addEventListener('click', () => activateView('files'));
navProperties.addEventListener('click', () => activateView('properties'));
navSettings.addEventListener('click', () => activateView('settings'));

// --- SIDEBAR (mobile) ---
function openSidebar() { sidebar.classList.add('open'); sidebarBackdrop.classList.add('visible'); }
function closeSidebar() { sidebar.classList.remove('open'); sidebarBackdrop.classList.remove('visible'); }
btnSidebarOpen?.addEventListener('click', openSidebar);
btnSidebarToggle?.addEventListener('click', closeSidebar);
sidebarBackdrop?.addEventListener('click', closeSidebar);

// --- EULA LOGIC ---
socket.on('eula-required', () => eulaModal.classList.remove('hidden'));
btnAgreeEula.addEventListener('click', () => { socket.emit('accept-eula'); eulaModal.classList.add('hidden'); });
btnCloseEula.addEventListener('click', () => eulaModal.classList.add('hidden'));

// --- ANSI TO HTML CONVERTER ---
function ansiToHtml(text) {
    let result = text.replace(/&/g, '&amp;').replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
    if (statusIndicatorMobile) statusIndicatorMobile.className = `status-indicator status-indicator-sm ${state}`;
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
        span.style.display = 'block';
        span.innerHTML = ansiToHtml(line);
        terminal.appendChild(span);
    });
    if (isAtBottom) terminal.scrollTop = terminal.scrollHeight;
});

// --- SERVER CONTROLS ---
btnStart.addEventListener('click', () => { if (isFirstLog) { terminal.innerHTML = ''; isFirstLog = false; } socket.emit('start'); });
btnStop.addEventListener('click', async () => { if (await showConfirm(t('confirm-stop'))) socket.emit('stop'); });
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
        if (!res.ok) throw new Error(json.error || t('err-read'));

        currentEditFilePath = filePath;
        editModalTitle.textContent = fileName;
        editModalContent.value = json.content;
        editModal.classList.remove('hidden');
    } catch (e) {
        toast(`${t('err-read')}: ${e.message}`, 'error');
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
        if (!res.ok) throw new Error(json.error || t('err-save'));
        editModal.classList.add('hidden');
        toast(`${t('msg-saved')} ${editModalTitle.textContent}`, 'success');
    } catch (e) {
        toast(`${t('err-save')}: ${e.message}`, 'error');
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
    } catch (e) { console.error(e); toast(e.message, 'error'); }
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
        const isArchive = f.name.toLowerCase().endsWith('.zip') || f.name.toLowerCase().endsWith('.rar');

        let actionsHtml = `<button class="btn-download" title="Download"><i class="fa-solid fa-download"></i></button>`;
        if (isArchive && !f.isDir) {
            actionsHtml = `<button class="btn-extract" title="Giải nén"><i class="fa-solid fa-file-zipper"></i></button>` + actionsHtml;
        }
        actionsHtml += `<button class="btn-delete" title="Delete"><i class="fa-solid fa-trash-can"></i></button>`;

        if (isEditable && f.size < 2 * 1024 * 1024) {
            actionsHtml = `<button class="btn-edit" title="Edit"><i class="fa-solid fa-pen"></i></button>` + actionsHtml;
        }

        tr.innerHTML = `
            <td><div class="file-item-name"><i class="fa-solid ${icon} file-icon"></i>${escapeHtml(f.name)}</div></td>
            <td>${f.isDir ? '-' : formatBytes(f.size)}</td>
            <td>${new Date(f.mtime).toLocaleString()}</td>
            <td>${actionsHtml}</td>
        `;

        if (f.isDir) {
            tr.querySelector('.file-item-name').onclick = () => { currentPath = tPath; fetchFiles(tPath); };
        } else if (isEditable) {
            tr.querySelector('.file-item-name').onclick = () => openFileEditor(tPath, f.name);
            const btnEdit = tr.querySelector('.btn-edit');
            if (btnEdit) btnEdit.onclick = () => openFileEditor(tPath, f.name);
        }

        tr.querySelector('.btn-delete').onclick = async () => {
            if (await showConfirm(`${t('confirm-delete')} "${f.name}"?`)) {
                try {
                    const res = await fetch('/api/files', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetPath: tPath }) });
                    if (res.ok) fetchFiles(currentPath); else toast(t('err-delete'), 'error');
                } catch (e) { console.error(e); toast(e.message, 'error'); }
            }
        };

        tr.querySelector('.btn-download').onclick = () => {
            window.open(`/api/download?path=${encodeURIComponent(tPath)}`, '_blank');
        };

        const btnExtract = tr.querySelector('.btn-extract');
        if (btnExtract) {
            btnExtract.onclick = async () => {
                uploadProgress.classList.remove('hidden');
                uploadProgress.querySelector('span').textContent = "Đang giải nén...";
                try {
                    const res = await fetch('/api/extract', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ targetPath: tPath })
                    });
                    const data = await res.json();
                    if (res.ok) toast(data.message || t('msg-extracted'), 'success');
                    else toast(data.error || 'Lỗi giải nén', 'error');
                    fetchFiles(currentPath);
                } catch (e) { toast(e.message, 'error'); }
                finally {
                    uploadProgress.classList.add('hidden');
                    uploadProgress.querySelector('span').textContent = t('uploading') || "Đang xử lý...";
                }
            };
        }

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
    for (let i = 0; i < files.length; i++) filesArray.push(files[i]);
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
        if (res.ok) fetchFiles(currentPath); else toast(t('err-upload'), 'error');
    } catch (e) { toast(e.message, 'error'); }
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
        if (res.ok) toast(t('msg-settings-saved'), 'success');
        else toast(t('err-save'), 'error');
    } catch (err) {
        console.error(err); toast(err.message, 'error');
    }
});

// --- SERVER PROPERTIES LOGIC ---
const PROPERTIES_SCHEMA = [
    { id: 'game', i18n: 'props-section-game', icon: 'fa-gamepad', fields: [
        { key: 'gamemode', type: 'select', options: ['survival', 'creative', 'adventure', 'spectator'] },
        { key: 'difficulty', type: 'select', options: ['peaceful', 'easy', 'normal', 'hard'] },
        { key: 'hardcore', type: 'bool' },
        { key: 'pvp', type: 'bool' },
        { key: 'force-gamemode', type: 'bool' },
        { key: 'allow-flight', type: 'bool' },
        { key: 'allow-nether', type: 'bool' },
        { key: 'enable-command-block', type: 'bool' },
    ]},
    { id: 'world', i18n: 'props-section-world', icon: 'fa-earth-americas', fields: [
        { key: 'level-name', type: 'text' },
        { key: 'level-seed', type: 'text' },
        { key: 'level-type', type: 'select', options: ['minecraft:normal', 'minecraft:flat', 'minecraft:large_biomes', 'minecraft:amplified', 'minecraft:single_biome_surface'] },
        { key: 'generate-structures', type: 'bool' },
        { key: 'generator-settings', type: 'text' },
        { key: 'max-world-size', type: 'number' },
        { key: 'spawn-protection', type: 'number' },
        { key: 'spawn-animals', type: 'bool' },
        { key: 'spawn-monsters', type: 'bool' },
        { key: 'spawn-npcs', type: 'bool' },
    ]},
    { id: 'players', i18n: 'props-section-players', icon: 'fa-users', fields: [
        { key: 'max-players', type: 'number' },
        { key: 'online-mode', type: 'bool' },
        { key: 'white-list', type: 'bool' },
        { key: 'enforce-whitelist', type: 'bool' },
        { key: 'enforce-secure-profile', type: 'bool' },
        { key: 'player-idle-timeout', type: 'number' },
        { key: 'view-distance', type: 'number', min: 3, max: 32 },
        { key: 'simulation-distance', type: 'number', min: 3, max: 32 },
        { key: 'op-permission-level', type: 'select', options: ['1','2','3','4'] },
        { key: 'function-permission-level', type: 'select', options: ['1','2','3','4'] },
    ]},
    { id: 'network', i18n: 'props-section-network', icon: 'fa-network-wired', fields: [
        { key: 'server-ip', type: 'text' },
        { key: 'server-port', type: 'number' },
        { key: 'motd', type: 'text' },
        { key: 'enable-query', type: 'bool' },
        { key: 'query.port', type: 'number' },
        { key: 'enable-rcon', type: 'bool' },
        { key: 'rcon.port', type: 'number' },
        { key: 'rcon.password', type: 'password' },
        { key: 'network-compression-threshold', type: 'number' },
        { key: 'prevent-proxy-connections', type: 'bool' },
        { key: 'hide-online-players', type: 'bool' },
        { key: 'enable-status', type: 'bool' },
    ]},
    { id: 'advanced', i18n: 'props-section-advanced', icon: 'fa-screwdriver-wrench', fields: [
        { key: 'max-tick-time', type: 'number' },
        { key: 'sync-chunk-writes', type: 'bool' },
        { key: 'entity-broadcast-range-percentage', type: 'number' },
        { key: 'max-chained-neighbor-updates', type: 'number' },
        { key: 'broadcast-console-to-ops', type: 'bool' },
        { key: 'broadcast-rcon-to-ops', type: 'bool' },
        { key: 'use-native-transport', type: 'bool' },
        { key: 'enable-jmx-monitoring', type: 'bool' },
        { key: 'rate-limit', type: 'number' },
        { key: 'resource-pack', type: 'text' },
        { key: 'resource-pack-sha1', type: 'text' },
        { key: 'resource-pack-prompt', type: 'text' },
        { key: 'require-resource-pack', type: 'bool' },
        { key: 'initial-enabled-packs', type: 'text' },
        { key: 'initial-disabled-packs', type: 'text' },
        { key: 'text-filtering-config', type: 'text' },
    ]},
];

function getKnownKeys() {
    const set = new Set();
    PROPERTIES_SCHEMA.forEach(s => s.fields.forEach(f => set.add(f.key)));
    return set;
}

async function loadServerProperties() {
    try {
        const res = await fetch('/api/server-properties');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        currentProperties = data.properties || {};
        originalRaw = data.raw || '';
        propBanner.classList.toggle('hidden', !data.generated);
        if (data.generated) {
            propBanner.innerHTML = `<i class="fa-solid fa-circle-info"></i> <span>${escapeHtml(t('props-banner-new'))}</span>`;
        }
        renderPropertiesForm(currentProperties);
        propRawTextarea.value = originalRaw;
    } catch (e) {
        console.error(e);
        toast(`${t('msg-load-error')}: ${e.message}`, 'error');
    }
}

function isTruthy(v) { return String(v).toLowerCase() === 'true'; }

function renderPropertiesForm(props) {
    propFormView.innerHTML = '';
    const known = getKnownKeys();

    PROPERTIES_SCHEMA.forEach(section => {
        const sectionEl = document.createElement('div');
        sectionEl.className = 'prop-section';
        sectionEl.dataset.section = section.id;
        sectionEl.innerHTML = `
            <div class="prop-section-header">
                <i class="fa-solid ${section.icon}"></i>
                <h4>${escapeHtml(t(section.i18n))}</h4>
            </div>
            <div class="prop-grid"></div>
        `;
        const grid = sectionEl.querySelector('.prop-grid');
        section.fields.forEach(field => {
            const value = props[field.key] !== undefined ? props[field.key] : '';
            grid.appendChild(buildPropRow(field, value));
        });
        propFormView.appendChild(sectionEl);
    });

    // "Other" section for unknown keys
    const otherKeys = Object.keys(props).filter(k => !known.has(k));
    if (otherKeys.length) {
        const sectionEl = document.createElement('div');
        sectionEl.className = 'prop-section';
        sectionEl.dataset.section = 'other';
        sectionEl.innerHTML = `
            <div class="prop-section-header">
                <i class="fa-solid fa-ellipsis"></i>
                <h4>${escapeHtml(t('props-section-other'))}</h4>
            </div>
            <div class="prop-grid"></div>
        `;
        const grid = sectionEl.querySelector('.prop-grid');
        otherKeys.sort().forEach(k => {
            // Heuristic: detect bool
            const v = props[k];
            const looksBool = v === 'true' || v === 'false';
            grid.appendChild(buildPropRow({ key: k, type: looksBool ? 'bool' : 'text' }, v));
        });
        propFormView.appendChild(sectionEl);
    }

    applyPropSearchFilter();
}

function buildPropRow(field, value) {
    const row = document.createElement('div');
    row.className = 'prop-row';
    row.dataset.key = field.key;

    const labelText = field.key;
    if (field.type === 'bool') {
        row.classList.add('prop-bool');
        const checked = isTruthy(value);
        row.innerHTML = `
            <label for="prop-${cssEscape(field.key)}">${escapeHtml(labelText)}</label>
            <label class="toggle-switch">
                <input type="checkbox" id="prop-${cssEscape(field.key)}" data-key="${escapeHtml(field.key)}" ${checked ? 'checked' : ''}>
                <span class="toggle-slider"></span>
            </label>
        `;
    } else if (field.type === 'select') {
        const opts = (field.options || []).map(o =>
            `<option value="${escapeHtml(o)}" ${String(value) === o ? 'selected' : ''}>${escapeHtml(o)}</option>`
        ).join('');
        // If value isn't in options, include it as a custom option
        let extra = '';
        if (value && !(field.options || []).includes(String(value))) {
            extra = `<option value="${escapeHtml(value)}" selected>${escapeHtml(value)} (custom)</option>`;
        }
        row.innerHTML = `
            <label for="prop-${cssEscape(field.key)}">${escapeHtml(labelText)}</label>
            <select id="prop-${cssEscape(field.key)}" data-key="${escapeHtml(field.key)}">${extra}${opts}</select>
        `;
    } else if (field.type === 'number') {
        const minAttr = field.min !== undefined ? `min="${field.min}"` : '';
        const maxAttr = field.max !== undefined ? `max="${field.max}"` : '';
        row.innerHTML = `
            <label for="prop-${cssEscape(field.key)}">${escapeHtml(labelText)}</label>
            <input type="number" id="prop-${cssEscape(field.key)}" data-key="${escapeHtml(field.key)}" value="${escapeHtml(value)}" ${minAttr} ${maxAttr}>
        `;
    } else if (field.type === 'password') {
        row.innerHTML = `
            <label for="prop-${cssEscape(field.key)}">${escapeHtml(labelText)}</label>
            <input type="password" id="prop-${cssEscape(field.key)}" data-key="${escapeHtml(field.key)}" value="${escapeHtml(value)}" autocomplete="new-password">
        `;
    } else {
        row.innerHTML = `
            <label for="prop-${cssEscape(field.key)}">${escapeHtml(labelText)}</label>
            <input type="text" id="prop-${cssEscape(field.key)}" data-key="${escapeHtml(field.key)}" value="${escapeHtml(value)}">
        `;
    }
    return row;
}

function cssEscape(s) {
    return String(s).replace(/[^a-zA-Z0-9_-]/g, '_');
}

function collectPropertiesFromForm() {
    const result = {};
    propFormView.querySelectorAll('[data-key]').forEach(el => {
        const key = el.dataset.key;
        if (el.type === 'checkbox') {
            result[key] = el.checked ? 'true' : 'false';
        } else {
            result[key] = el.value;
        }
    });
    return result;
}

function applyPropSearchFilter() {
    const term = (propSearch.value || '').toLowerCase().trim();
    let anyVisible = false;
    propFormView.querySelectorAll('.prop-section').forEach(section => {
        let sectionVisible = false;
        section.querySelectorAll('.prop-row').forEach(row => {
            const match = !term || row.dataset.key.toLowerCase().includes(term);
            row.classList.toggle('hidden-search', !match);
            if (match) sectionVisible = true;
        });
        section.classList.toggle('hidden', !sectionVisible);
        if (sectionVisible) anyVisible = true;
    });
    // Remove existing empty banner first
    const existing = document.getElementById('propEmptyBanner');
    if (existing) existing.remove();
    if (!anyVisible && term) {
        const empty = document.createElement('div');
        empty.id = 'propEmptyBanner';
        empty.className = 'banner';
        empty.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i> ${escapeHtml(t('msg-no-match'))}`;
        propFormView.appendChild(empty);
    }
}

propSearch.addEventListener('input', applyPropSearchFilter);

btnPropFormMode.addEventListener('click', () => switchPropMode('form'));
btnPropRawMode.addEventListener('click', () => switchPropMode('raw'));

function switchPropMode(mode) {
    if (mode === propMode) return;
    if (mode === 'raw') {
        // Sync current form state into raw textarea (best-effort)
        propRawTextarea.value = originalRaw;
    } else {
        // Re-parse raw to update form (in case user edited raw)
        try {
            const parsed = parseRawProperties(propRawTextarea.value);
            currentProperties = parsed;
            renderPropertiesForm(parsed);
        } catch (e) { console.error(e); }
    }
    propMode = mode;
    btnPropFormMode.classList.toggle('active', mode === 'form');
    btnPropRawMode.classList.toggle('active', mode === 'raw');
    propFormView.classList.toggle('hidden', mode !== 'form');
    propRawView.classList.toggle('hidden', mode !== 'raw');
    propSearch.style.visibility = mode === 'form' ? 'visible' : 'hidden';
}

function parseRawProperties(raw) {
    const out = {};
    raw.split(/\r?\n/).forEach(line => {
        if (!line || line.trim().startsWith('#')) return;
        const idx = line.indexOf('=');
        if (idx === -1) return;
        const key = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).replace(/\\:/g, ':').replace(/\\=/g, '=');
        if (key) out[key] = value;
    });
    return out;
}

btnPropReload.addEventListener('click', () => loadServerProperties());

btnPropSave.addEventListener('click', async () => {
    btnPropSave.disabled = true;
    try {
        let payload;
        if (propMode === 'raw') {
            payload = { raw: propRawTextarea.value };
        } else {
            payload = { properties: collectPropertiesFromForm() };
        }
        const res = await fetch('/api/server-properties', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Save failed');
        toast(t('msg-saved'), 'success');
        // Reload to reflect any merging/escaping the backend did
        await loadServerProperties();
    } catch (e) {
        toast(`${t('err-save')}: ${e.message}`, 'error');
    } finally {
        btnPropSave.disabled = false;
    }
});
