const { app, BrowserWindow } = require('electron');
const path = require('path');
const http = require('http');

// Khởi động server Node.js của Control Panel ngầm
require('./server.js');

let mainWindow;

function createWindow() {
    // Tạo cửa sổ ứng dụng Desktop
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: 'Minecraft Server Control Panel',
        autoHideMenuBar: true, // Ẩn thanh menu mặc định
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            devTools: process.env.NODE_ENV === 'development',
        },
        icon: path.join(__dirname, 'public', 'assets', 'favicon.ico') // Nếu bạn có icon
    });

    // Chờ server sẵn sàng thay vì đợi cứng 1.5s
    const checkServer = (retries = 0) => {
        if (retries > 20) {
            console.error('Server failed to start after 20 attempts');
            return;
        }
        const req = http.get('http://localhost:3000', (res) => {
            if (res.statusCode === 200) {
                mainWindow.loadURL('http://localhost:3000');
            }
        });
        req.on('error', () => {
            setTimeout(() => checkServer(retries + 1), 250);
        });
        req.setTimeout(1000, () => req.destroy());
    };
    setTimeout(checkServer, 500);

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

// Graceful shutdown for Electron
app.on('before-quit', () => {
    if (mainWindow) {
        mainWindow.destroy();
    }
});
