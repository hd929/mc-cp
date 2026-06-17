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
const navDashboard = document.getElementById('navDashboard');
const navConsole = document.getElementById('navConsole');
const navFiles = document.getElementById('navFiles');
const navPlayers = document.getElementById('navPlayers');
const navSettings = document.getElementById('navSettings');
const viewDashboard = document.getElementById('viewDashboard');
const viewConsole = document.getElementById('viewConsole');
const viewFiles = document.getElementById('viewFiles');
const viewPlayers = document.getElementById('viewPlayers');
const viewSettings = document.getElementById('viewSettings');
const settingsForm = document.getElementById('settingsForm');

// Dashboard Elements
const statCpu = document.getElementById('statCpu');
const statRam = document.getElementById('statRam');
const statUptime = document.getElementById('statUptime');
const statPlayers = document.getElementById('statPlayers');
const dashTerminal = document.getElementById('dashTerminal');
const playerCount = document.getElementById('playerCount');

// Players Elements
const playerCmdInput = document.getElementById('playerCmdInput');
const onlinePlayersList = document.getElementById('onlinePlayersList');
const opsPlayersList = document.getElementById('opsPlayersList');
const whitelistPlayersList = document.getElementById('whitelistPlayersList');
const bannedPlayersList = document.getElementById('bannedPlayersList');

// Backup Elements
const btnCreateBackup = document.getElementById('btnCreateBackup');
const backupList = document.getElementById('backupList');

// Properties Elements
const propertiesGrid = document.getElementById('propertiesGrid');
const btnSaveProperties = document.getElementById('btnSaveProperties');

// New folder button
const btnNewFolder = document.getElementById('btnNewFolder');

// File search
const fileSearchInput = document.getElementById('fileSearchInput');

// Player action buttons
const btnPlayerOp = document.getElementById('btnPlayerOp');
const btnPlayerDeop = document.getElementById('btnPlayerDeop');
const btnPlayerWhitelist = document.getElementById('btnPlayerWhitelist');
const btnPlayerKick = document.getElementById('btnPlayerKick');
const btnPlayerBan = document.getElementById('btnPlayerBan');
const btnPlayerPardon = document.getElementById('btnPlayerPardon');

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

// Khả năng nhận diện file sửa được bằng web editor
const EDITABLE_EXTENSIONS = ['.txt', '.json', '.yml', '.yaml', '.properties', '.conf', '.log'];

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
        "msg-settings-saved": "Đã lưu cài đặt thành công!",
        "nav-dashboard": "Dashboard",
        "nav-players": "Players",
        "dashboard-title": "Dashboard",
        "stat-cpu": "CPU Usage",
        "stat-ram": "RAM Usage",
        "stat-uptime": "Uptime",
        "stat-players": "Players Online",
        "quick-console": "Quick Console",
        "players-title": "Quản lý Players",
        "players-online": "Online",
        "players-ops": "Operators",
        "players-whitelist": "Whitelist",
        "players-banned": "Banned",
        "backup-title": "Backup",
        "btn-create-backup": "Tạo Backup",
        "btn-save-props": "Lưu Properties",
        "btn-new-folder": "Thư mục mới",
        "search-placeholder": "Tìm kiếm file...",
        "confirm-backup-delete": "Xóa backup",
        "confirm-new-folder": "Tên thư mục mới:",
        "confirm-rename": "Đổi tên",
        "msg-folder-created": "Đã tạo",
        "msg-backup-created": "Đã tạo: ",
        "msg-extracting": "Đang giải nén...",
        "msg-extract-success": "Giải nén thành công",
        "msg-extract-error": "Lỗi giải nén",
        "msg-deleted": "đã xóa",
        "msg-saved": "đã lưu",
        "msg-creating-backup": "Đang tạo backup...",
        "msg-props-saved": "Đã lưu server.properties!",
        "msg-no-backups": "Chưa có backup nào",
        "msg-no-props": "Chưa có server.properties",
        "msg-player-input": "Nhập tên player trước!",
        "conn-label": "Đã kết nối",
        "conn-disconnected": "Mất kết nối"
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
        "msg-settings-saved": "Settings saved successfully!",
        "nav-dashboard": "Dashboard",
        "nav-players": "Players",
        "dashboard-title": "Dashboard",
        "stat-cpu": "CPU Usage",
        "stat-ram": "RAM Usage",
        "stat-uptime": "Uptime",
        "stat-players": "Players Online",
        "quick-console": "Quick Console",
        "players-title": "Player Management",
        "players-online": "Online",
        "players-ops": "Operators",
        "players-whitelist": "Whitelist",
        "players-banned": "Banned",
        "backup-title": "Backup",
        "btn-create-backup": "Create Backup",
        "btn-save-props": "Save Properties",
        "btn-new-folder": "New Folder",
        "search-placeholder": "Search files...",
        "confirm-backup-delete": "Delete backup",
        "confirm-new-folder": "New folder name:",
        "confirm-rename": "Rename",
        "msg-folder-created": "Created",
        "msg-backup-created": "Created: ",
        "msg-extracting": "Extracting...",
        "msg-extract-success": "Extraction complete",
        "msg-extract-error": "Extraction error",
        "msg-deleted": "deleted",
        "msg-saved": "saved",
        "msg-creating-backup": "Creating backup...",
        "msg-props-saved": "server.properties saved!",
        "msg-no-backups": "No backups yet",
        "msg-no-props": "No server.properties found",
        "msg-player-input": "Enter a player name first!",
        "conn-label": "Connected",
        "conn-disconnected": "Disconnected"
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

// --- TOAST NOTIFICATION SYSTEM ---
function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

function showToast(type, title, msg, duration = 4000) {
    const container = document.getElementById('toastContainer');
    const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', warning: 'fa-triangle-exclamation', info: 'fa-circle-info' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon"><i class="fa-solid ${icons[type] || icons.info}"></i></div>
        <div class="toast-body"><div class="toast-title">${escapeHtml(title)}</div><div class="toast-msg">${escapeHtml(msg)}</div></div>
        <button class="toast-close"><i class="fa-solid fa-xmark"></i></button>
        <div class="toast-progress" style="animation-duration:${duration}ms"></div>`;
    toast.querySelector('.toast-close').onclick = () => { toast.classList.add('removing'); setTimeout(() => toast.remove(), 300); };
    container.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) { toast.classList.add('removing'); setTimeout(() => toast.remove(), 300); } }, duration);
}

// --- TAB SWITCH LOGIC ---
function switchTab(activeNav, activeView) {
    [navDashboard, navConsole, navFiles, navPlayers, navSettings].forEach(n => n.classList.remove('active'));
    [viewDashboard, viewConsole, viewFiles, viewPlayers, viewSettings].forEach(v => v.classList.remove('active'));
    activeNav.classList.add('active');
    activeView.classList.add('active');
}
let statsInterval = null;

function startStatsPolling() {
    if (statsInterval) clearInterval(statsInterval);
    fetchStats();
    statsInterval = setInterval(fetchStats, 3000);
}

function stopStatsPolling() {
    if (statsInterval) {
        clearInterval(statsInterval);
        statsInterval = null;
    }
}

// --- PAGE VISIBILITY API ---
// Pause stats polling and refresh when tab becomes visible again
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Tab hidden: pause stats polling
        if (statsInterval) { clearInterval(statsInterval); statsInterval = null; }
    } else {
        // Tab visible: resume polling if dashboard is active
        if (viewDashboard.classList.contains('active')) startStatsPolling();
        // Refresh data for active tab
        if (viewFiles.classList.contains('active')) fetchFiles(currentPath);
        if (viewPlayers.classList.contains('active')) fetchPlayers();
    }
});

navDashboard.addEventListener('click', () => {
    switchTab(navDashboard, viewDashboard);
    startStatsPolling();
});
navConsole.addEventListener('click', () => { switchTab(navConsole, viewConsole); stopStatsPolling(); });
navFiles.addEventListener('click', () => { switchTab(navFiles, viewFiles); fetchFiles(currentPath); stopStatsPolling(); });
navPlayers.addEventListener('click', () => { switchTab(navPlayers, viewPlayers); fetchPlayers(); stopStatsPolling(); });
navSettings.addEventListener('click', () => { switchTab(navSettings, viewSettings); loadSettings(); fetchBackups(); fetchServerProperties(); stopStatsPolling(); });

// --- EULA LOGIC ---
socket.on('eula-required', () => eulaModal.classList.remove('hidden'));
btnAgreeEula.addEventListener('click', () => { socket.emit('accept-eula'); eulaModal.classList.add('hidden'); });
btnCloseEula.addEventListener('click', () => eulaModal.classList.add('hidden') );

// --- ANSI TO HTML CONVERTER ---
function ansiToHtml(text) {
    let result = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
const MAX_CONSOLE_LINES = 2000;
const MAX_DASH_LINES = 500;

function trimTerminal(termEl, maxLines) {
    while (termEl.childElementCount > maxLines) {
        termEl.removeChild(termEl.firstChild);
    }
}

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

let logRafPending = false;
let pendingLogLines = [];

function flushLogLines() {
    logRafPending = false;
    const isAtBottom = terminal.scrollHeight - terminal.scrollTop <= terminal.clientHeight + 50;
    const isDashAtBottom = dashTerminal.scrollHeight - dashTerminal.scrollTop <= dashTerminal.clientHeight + 50;
    const termFrag = document.createDocumentFragment();
    const dashFrag = document.createDocumentFragment();
    for (let i = 0; i < pendingLogLines.length; i++) {
        const line = pendingLogLines[i];
        if (!line) continue;
        const html = ansiToHtml(line);
        const span = document.createElement('span');
        span.innerHTML = html;
        termFrag.appendChild(span);
        const dashSpan = document.createElement('span');
        dashSpan.innerHTML = html;
        dashFrag.appendChild(dashSpan);
    }
    terminal.appendChild(termFrag);
    dashTerminal.appendChild(dashFrag);
    pendingLogLines.length = 0;
    if (isAtBottom) terminal.scrollTop = terminal.scrollHeight;
    if (isDashAtBottom) dashTerminal.scrollTop = dashTerminal.scrollHeight;
    trimTerminal(terminal, MAX_CONSOLE_LINES);
    trimTerminal(dashTerminal, MAX_DASH_LINES);
}

socket.on('log', (data) => {
    if (isFirstLog) { terminal.innerHTML = ''; dashTerminal.innerHTML = ''; isFirstLog = false; }
    const lines = data.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (!lines[i] && lines.length > 1) continue;
        pendingLogLines.push(lines[i]);
    }
    if (!logRafPending) { logRafPending = true; requestAnimationFrame(flushLogLines); }
});

// Player update listener
socket.on('player-update', (players) => {
    playerCount.textContent = players.length + ' online';
    statPlayers.textContent = players.length;
    if (viewPlayers.classList.contains('active')) fetchPlayers();
});

// --- SOCKET RECONNECTION STATUS ---
const connIndicator = document.getElementById('connIndicator');
const connLabel = document.querySelector('.conn-label');
function setConnState(connected) {
    if (connIndicator) { connIndicator.className = 'conn-indicator ' + (connected ? 'connected' : 'disconnected'); connIndicator.title = t(connected ? 'conn-label' : 'conn-disconnected'); }
    if (connLabel) connLabel.textContent = t(connected ? 'conn-label' : 'conn-disconnected');
}
socket.on('connect', () => setConnState(true));
socket.on('disconnect', () => setConnState(false));
socket.on('connect_error', () => setConnState(false));

// --- SERVER CONTROLS ---
btnStart.addEventListener('click', () => { if (isFirstLog) { terminal.innerHTML = ''; dashTerminal.innerHTML = ''; isFirstLog = false; } socket.emit('start'); });
btnStop.addEventListener('click', () => { if (confirm(t('confirm-stop'))) socket.emit('stop'); });
btnClear.addEventListener('click', () => { terminal.innerHTML = ''; dashTerminal.innerHTML = ''; isFirstLog = false; });

cmdForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const cmd = cmdInput.value.trim();
    if (cmd) {
        socket.emit('command', cmd);
        // Update command history
        if (cmdHistory.length === 0 || cmdHistory[cmdHistory.length - 1] !== cmd) {
            cmdHistory.push(cmd);
            if (cmdHistory.length > MAX_CMD_HISTORY) cmdHistory.shift();
        }
        cmdHistoryIndex = -1;
        cmdInput.value = '';
    }
});

// --- COMMAND HISTORY ---
let cmdHistory = [];
let cmdHistoryIndex = -1;
const MAX_CMD_HISTORY = 100;

cmdInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (cmdHistory.length > 0 && cmdHistoryIndex < cmdHistory.length - 1) {
            cmdHistoryIndex++;
            cmdInput.value = cmdHistory[cmdHistory.length - 1 - cmdHistoryIndex];
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (cmdHistoryIndex > 0) {
            cmdHistoryIndex--;
            cmdInput.value = cmdHistory[cmdHistory.length - 1 - cmdHistoryIndex];
        } else {
            cmdHistoryIndex = -1;
            cmdInput.value = '';
        }
    }
});

// --- KEYBOARD SHORTCUTS ---
document.addEventListener('keydown', (e) => {
    // Ctrl+1-5 for tab switching
    if (e.ctrlKey && e.key >= '1' && e.key <= '5') {
        e.preventDefault();
        const tabs = [
            [navDashboard, viewDashboard, true],
            [navConsole, viewConsole, false],
            [navFiles, viewFiles, false],
            [navPlayers, viewPlayers, false],
            [navSettings, viewSettings, false]
        ];
        const idx = parseInt(e.key) - 1;
        if (tabs[idx]) {
            switchTab(tabs[idx][0], tabs[idx][1]);
            if (tabs[idx][2]) startStatsPolling(); else stopStatsPolling();
        }
    }
    // Ctrl+K to focus command input (when console is active)
    if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        if (viewConsole.classList.contains('active')) {
            cmdInput.focus();
        }
    }
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
        showToast('error', t('err-read'), e.message);
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
        showToast('success', 'Saved', editModalTitle.textContent + ' saved!');
    } catch(e) {
        showToast('error', t('err-save'), e.message);
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

    const fragment = document.createDocumentFragment();

    if (path) {
        const tr = document.createElement('tr');
        tr.dataset.action = 'navigate-up';
        tr.innerHTML = `<td colspan="4"><div class="file-item-name" style="color: var(--text-secondary)"><i class="fa-solid fa-level-up-alt file-icon"></i>...</div></td>`;
        fragment.appendChild(tr);
    }

    files.forEach(f => {
        const tr = document.createElement('tr');
        const isEditable = !f.isDir && EDITABLE_EXTENSIONS.some(ext => f.name.toLowerCase().endsWith(ext));
        const icon = f.isDir ? 'fa-folder' : (isEditable ? 'fa-file-code' : 'fa-file');
        const tPath = path ? `${path}/${f.name}` : f.name;
        const isArchive = f.name.toLowerCase().endsWith('.zip') || f.name.toLowerCase().endsWith('.rar');

        // Store metadata on the row for event delegation
        tr.dataset.path = tPath;
        tr.dataset.name = f.name;
        tr.dataset.isDir = f.isDir ? '1' : '0';
        tr.dataset.isEditable = isEditable ? '1' : '0';
        tr.dataset.isArchive = isArchive ? '1' : '0';

        // Render Action buttons based on editability
        let actionsHtml = `<button class="btn-download" title="Download"><i class="fa-solid fa-download"></i></button>`;
        if (isArchive && !f.isDir) {
            actionsHtml = `<button class="btn-extract" title="Extract"><i class="fa-solid fa-file-zipper"></i></button>` + actionsHtml;
        }
        actionsHtml += `<button class="btn-delete" title="Delete"><i class="fa-solid fa-trash-can"></i></button>`;
        
        if (isEditable && f.size < 2 * 1024 * 1024) {
            actionsHtml = `<button class="btn-edit" title="Edit"><i class="fa-solid fa-pen"></i></button>` + actionsHtml;
        }
        // Add rename button for all items
        actionsHtml = `<button class="btn-rename" title="Rename"><i class="fa-solid fa-i-cursor"></i></button>` + actionsHtml;

        tr.innerHTML = `
            <td><div class="file-item-name"><i class="fa-solid ${icon} file-icon"></i>${escapeHtml(f.name)}</div></td>
            <td>${f.isDir ? '-' : formatBytes(f.size)}</td>
            <td>${new Date(f.mtime).toLocaleString()}</td>
            <td>${actionsHtml}</td>
        `;
        fragment.appendChild(tr);
    });

    fileListBody.appendChild(fragment);
}

// --- EVENT DELEGATION for file table ---
fileListBody.addEventListener('click', async (e) => {
    const tr = e.target.closest('tr');
    if (!tr) return;

    const btn = e.target.closest('button');
    const nameEl = e.target.closest('.file-item-name');
    const tPath = tr.dataset.path;
    const fname = tr.dataset.name;

    // Navigate up
    if (tr.dataset.action === 'navigate-up' && nameEl) {
        const upPath = currentPath.split('/').slice(0, -1).join('/');
        currentPath = upPath;
        fetchFiles(upPath);
        return;
    }

    // Action buttons
    if (btn) {
        if (btn.classList.contains('btn-delete')) {
            if (confirm(`${t('confirm-delete')} "${fname}"?`)) {
                try {
                    const res = await fetch('/api/files', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetPath: tPath }) });
                    if (res.ok) { fetchFiles(currentPath); showToast('success', 'Deleted', fname + ' deleted'); }
                    else showToast('error', 'Delete', t('err-delete'));
                } catch (err) { showToast('error', 'Delete', err.message); }
            }
            return;
        }
        if (btn.classList.contains('btn-download')) {
            window.open(`/api/download?path=${encodeURIComponent(tPath)}`, '_blank');
            return;
        }
        if (btn.classList.contains('btn-edit')) {
            openFileEditor(tPath, fname);
            return;
        }
        if (btn.classList.contains('btn-rename')) {
            const newName = prompt(t('confirm-rename') + ' ' + fname + ':', fname);
            if (!newName || newName === fname) return;
            try {
                const res = await fetch('/api/rename', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ oldPath: tPath, newName: newName }) });
                if (res.ok) { showToast('success', 'Rename', fname + ' \u2192 ' + newName); fetchFiles(currentPath); }
                else { const d = await res.json(); showToast('error', 'Rename', d.error); }
            } catch (err) { showToast('error', 'Rename', err.message); }
            return;
        }
        if (btn.classList.contains('btn-extract')) {
            uploadProgress.classList.remove('hidden');
            uploadProgress.querySelector('span').textContent = t('msg-extracting');
            try {
                const res = await fetch('/api/extract', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetPath: tPath }) });
                const data = await res.json();
                if (res.ok) showToast('success', 'Extract', data.message || t('msg-extract-success'));
                else showToast('error', 'Extract', data.error || t('msg-extract-error'));
                fetchFiles(currentPath);
            } catch (err) { showToast('error', 'Extract', err.message); }
            finally {
                uploadProgress.classList.add('hidden');
                uploadProgress.querySelector('span').textContent = t('uploading');
            }
            return;
        }
    }

    // Click on name (navigate dir or open editor)
    if (nameEl && !btn) {
        if (tr.dataset.isDir === '1') {
            currentPath = tPath;
            fetchFiles(tPath);
        } else if (tr.dataset.isEditable === '1') {
            openFileEditor(tPath, fname);
        }
    }
});

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
        if (res.ok) { fetchFiles(currentPath); showToast('success', 'Upload', 'Files uploaded!'); }
        else showToast('error', 'Upload', t('err-upload'));
    } catch (e) { showToast('error', 'Upload', e.message); } 
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
        if (res.ok) showToast('success', 'Settings', t('msg-settings-saved') || 'Settings saved!');
    } catch (e) {
        console.error(e);
    }
});

// --- DASHBOARD STATS ---
async function fetchStats() {
    try {
        const res = await fetch('/api/stats');
        const stats = await res.json();
        statCpu.textContent = stats.cpu + '%';
        statRam.textContent = stats.ramUsed + ' / ' + stats.ramTotal + ' MB';
        const uptimeSec = stats.uptime || 0;
        const h = Math.floor(uptimeSec / 3600), m = Math.floor((uptimeSec % 3600) / 60), s = uptimeSec % 60;
        statUptime.textContent = String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
        statPlayers.textContent = stats.onlinePlayers ? stats.onlinePlayers.length : 0;
        playerCount.textContent = (stats.onlinePlayers ? stats.onlinePlayers.length : 0) + ' online';
    } catch (e) { console.error('Stats error:', e); }
}

// --- PLAYERS LOGIC ---
async function fetchPlayers() {
    try {
        const res = await fetch('/api/players');
        const data = await res.json();
        const renderPlayerCards = (list, container, showRole) => {
            const frag = document.createDocumentFragment();
            if (!list || list.length === 0) {
                const empty = document.createElement('div');
                empty.style.cssText = 'color:var(--text-secondary);padding:.5rem;font-size:.85rem;';
                empty.textContent = '-';
                frag.appendChild(empty);
            } else {
                list.forEach(p => {
                    const name = typeof p === 'string' ? p : (p.name || p.uuid);
                    const card = document.createElement('div');
                    card.className = 'player-card';
                    card.innerHTML = `
                        <div class="player-info"><div class="player-avatar">${escapeHtml((name||'?')[0].toUpperCase())}</div>
                        <div><div class="player-name">${escapeHtml(name)}</div>${showRole ? '<div class="player-role">Online</div>' : ''}</div></div>
                        <div class="player-actions">${showRole ? '<button class="kick-btn danger-action">Kick</button>' : ''}</div>`;
                    if (showRole) {
                        card.querySelector('.kick-btn').onclick = () => { socket.emit('command', 'kick ' + name); showToast('info', 'Kick', 'Kicked ' + name); };
                    }
                    frag.appendChild(card);
                });
            }
            container.replaceChildren(frag);
        };
        renderPlayerCards(data.online, onlinePlayersList, true);
        renderPlayerCards(data.ops, opsPlayersList, false);
        renderPlayerCards(data.whitelist, whitelistPlayersList, false);
        renderPlayerCards(data.banned, bannedPlayersList, false);
    } catch (e) { console.error('Players error:', e); }
}

function sendPlayerCmd(cmd) {
    const name = playerCmdInput.value.trim();
    if (!name) { showToast('warning', 'Input', t('msg-player-input'), 2000); return; }
    socket.emit('command', cmd + ' ' + name);
    showToast('success', 'Command', cmd + ' ' + name);
    playerCmdInput.value = '';
}

btnPlayerOp.addEventListener('click', () => sendPlayerCmd('op'));
btnPlayerDeop.addEventListener('click', () => sendPlayerCmd('deop'));
btnPlayerWhitelist.addEventListener('click', () => sendPlayerCmd('whitelist add'));
btnPlayerKick.addEventListener('click', () => sendPlayerCmd('kick'));
btnPlayerBan.addEventListener('click', () => sendPlayerCmd('ban'));
btnPlayerPardon.addEventListener('click', () => sendPlayerCmd('pardon'));

// --- BACKUP LOGIC ---
async function fetchBackups() {
    try {
        const res = await fetch('/api/backups');
        const backups = await res.json();
        const frag = document.createDocumentFragment();
        if (!backups || backups.length === 0) {
            const empty = document.createElement('div');
            empty.style.cssText = 'color:var(--text-secondary);padding:.5rem;font-size:.85rem;';
            empty.textContent = t('msg-no-backups');
            frag.appendChild(empty);
        } else {
            backups.forEach(b => {
                const item = document.createElement('div');
                item.className = 'backup-item';
                item.innerHTML = `
                    <div class="backup-info"><i class="fa-solid fa-file-zipper"></i>
                    <div><div class="backup-name">${escapeHtml(b.name)}</div><div class="backup-meta">${formatBytes(b.size)} - ${new Date(b.date).toLocaleString()}</div></div></div>
                    <div class="backup-actions">
                        <button class="btn btn-sm btn-primary backup-dl"><i class="fa-solid fa-download"></i></button>
                        <button class="btn btn-sm btn-danger backup-del"><i class="fa-solid fa-trash-can"></i></button>
                    </div>`;
                item.querySelector('.backup-dl').onclick = () => window.open('/api/backup/download?name=' + encodeURIComponent(b.name), '_blank');
                item.querySelector('.backup-del').onclick = async () => {
                    if (confirm(t('confirm-backup-delete') + ' ' + b.name + '?')) {
                        await fetch('/api/backups', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: b.name }) });
                        fetchBackups();
                    }
                };
                frag.appendChild(item);
            });
        }
        backupList.replaceChildren(frag);
    } catch (e) { console.error('Backups error:', e); }
}

btnCreateBackup.addEventListener('click', async () => {
    showToast('info', 'Backup', t('msg-creating-backup'), 3000);
    try {
        const res = await fetch('/api/backup', { method: 'POST' });
        const data = await res.json();
        if (res.ok) { showToast('success', 'Backup', t('msg-backup-created') + data.name); fetchBackups(); }
        else showToast('error', 'Backup', data.error || 'Lỗi backup');
    } catch (e) { showToast('error', 'Backup', e.message); }
});

// --- SERVER PROPERTIES LOGIC ---
async function fetchServerProperties() {
    try {
        const res = await fetch('/api/server-properties');
        const props = await res.json();
        const frag = document.createDocumentFragment();
        if (!props || Object.keys(props).length === 0) {
            const empty = document.createElement('div');
            empty.style.cssText = 'color:var(--text-secondary);padding:.5rem;font-size:.85rem;';
            empty.textContent = t('msg-no-props');
            frag.appendChild(empty);
        } else {
            Object.keys(props).sort().forEach(key => {
                const fg = document.createElement('div');
                fg.className = 'form-group';
                const label = document.createElement('label');
                label.textContent = key;
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'prop-input';
                input.dataset.key = key;
                input.value = props[key];
                fg.appendChild(label);
                fg.appendChild(input);
                frag.appendChild(fg);
            });
        }
        propertiesGrid.replaceChildren(frag);
    } catch (e) { console.error('Properties error:', e); }
}

btnSaveProperties.addEventListener('click', async () => {
    const props = {};
    document.querySelectorAll('.prop-input').forEach(inp => { props[inp.dataset.key] = inp.value; });
    try {
        const res = await fetch('/api/server-properties', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(props) });
        if (res.ok) showToast('success', 'Properties', t('msg-props-saved'));
    } catch (e) { showToast('error', 'Properties', e.message); }
});

// --- FILE MANAGER ENHANCEMENTS ---
btnNewFolder.addEventListener('click', async () => {
    const name = prompt(t('confirm-new-folder'));
    if (!name) return;
    const folderPath = currentPath ? currentPath + '/' + name : name;
    try {
        const res = await fetch('/api/mkdir', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetPath: folderPath }) });
        const data = await res.json();
        if (res.ok) { showToast('success', 'Folder', t('msg-folder-created') + ': ' + name); fetchFiles(currentPath); }
        else showToast('error', 'Folder', data.error);
    } catch (e) { showToast('error', 'Folder', e.message); }
});

// --- FILE SEARCH (debounced) ---
let searchTimer = null;
fileSearchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        const q = fileSearchInput.value.toLowerCase();
        const rows = fileListBody.querySelectorAll('tr');
        rows.forEach(tr => {
            const nameCell = tr.querySelector('.file-item-name');
            if (!nameCell) { tr.style.display = ''; return; }
            tr.style.display = nameCell.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
    }, 150);
});
