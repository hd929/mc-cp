const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// --- CẤU HÌNH THƯ MỤC MINECRAFT ĐỘC LẬP ---
const MC_DIR = path.join(__dirname, 'minecraft');
if (!fs.existsSync(MC_DIR)) {
    fs.mkdirSync(MC_DIR, { recursive: true });
}

// Cấu hình Multer để tải lên file vào đúng thư mục Minecraft
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = req.body.path ? path.join(MC_DIR, req.body.path) : MC_DIR;
        const relativeDir = path.dirname(file.originalname);
        if (relativeDir && relativeDir !== '.') {
             uploadPath = path.join(uploadPath, relativeDir);
        }
        if (!uploadPath.startsWith(MC_DIR)) uploadPath = MC_DIR; 
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => cb(null, path.basename(file.originalname))
});
const upload = multer({ storage });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '50mb' }));

let mcServer = null;

// --- FILE MANAGER APIs ---
app.get('/api/files', (req, res) => {
    try {
        const queryPath = req.query.path || '';
        const targetPath = path.join(MC_DIR, queryPath);
        if (!targetPath.startsWith(MC_DIR)) return res.status(403).json({ error: 'Truy cập bị từ chối' });
        if (!fs.existsSync(targetPath)) return res.json([]);

        const items = fs.readdirSync(targetPath, { withFileTypes: true });
        const result = items.map(item => {
            const stat = fs.statSync(path.join(targetPath, item.name));
            return { name: item.name, isDir: item.isDirectory(), size: item.isDirectory() ? 0 : stat.size, mtime: stat.mtime };
        });

        result.sort((a, b) => {
            if (a.isDir && !b.isDir) return -1;
            if (!a.isDir && b.isDir) return 1;
            return a.name.localeCompare(b.name);
        });

        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/upload', upload.array('files'), (req, res) => res.json({ success: true, message: 'Upload thành công' }));

app.delete('/api/files', (req, res) => {
    try {
        const { targetPath } = req.body;
        const fullPath = path.join(MC_DIR, targetPath || '');
        if (!fullPath.startsWith(MC_DIR) || fullPath === MC_DIR) return res.status(403).json({ error: 'Thao tác không được phép!' });
        
        if (fs.existsSync(fullPath)) {
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) fs.rmdirSync(fullPath, { recursive: true });
            else fs.unlinkSync(fullPath);
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// QUICK EDIT APIS
app.get('/api/file-content', (req, res) => {
    try {
        const queryPath = req.query.path || '';
        const targetPath = path.join(MC_DIR, queryPath);
        if (!targetPath.startsWith(MC_DIR)) return res.status(403).json({ error: 'Truy cập bị từ chối' });
        if (!fs.existsSync(targetPath)) return res.status(404).json({ error: 'File không tồn tại' });
        
        const stat = fs.statSync(targetPath);
        if (stat.size > 2 * 1024 * 1024) return res.status(400).json({ error: 'Tệp quá lớn để sửa trên web (Giới hạn 2MB)' });

        const content = fs.readFileSync(targetPath, 'utf8');
        res.json({ content });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/file-content', (req, res) => {
    try {
        const { targetPath, content } = req.body;
        const fullPath = path.join(MC_DIR, targetPath || '');
        if (!fullPath.startsWith(MC_DIR) || fullPath === MC_DIR) return res.status(403).json({ error: 'Thao tác không được phép' });
        
        fs.writeFileSync(fullPath, content, 'utf8');
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// SETTINGS APIS
const CONFIG_PATH = path.join(__dirname, 'config.json');
let config = { javaPath: 'java', maxRam: '2048M', minRam: '1024M', jarFile: 'server.jar', extraArgs: '' };

if (fs.existsSync(CONFIG_PATH)) {
    try { config = { ...config, ...JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')) }; } catch (e) {}
}

app.get('/api/settings', (req, res) => res.json(config));
app.post('/api/settings', (req, res) => {
    config = { ...config, ...req.body };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    res.json({ success: true });
});
// DOWNLOAD API
app.get('/api/download', (req, res) => {
    try {
        const queryPath = req.query.path || '';
        const targetPath = path.join(MC_DIR, queryPath);
        if (!targetPath.startsWith(MC_DIR)) return res.status(403).send('Truy cập bị từ chối');
        if (!fs.existsSync(targetPath)) return res.status(404).send('Không tìm thấy file/folder');

        const stat = fs.statSync(targetPath);
        if (stat.isFile()) {
            res.download(targetPath);
        } else if (stat.isDirectory()) {
            const zipName = `${path.basename(targetPath) || 'minecraft-archive'}.zip`;
            const zipPath = path.join(__dirname, zipName);
            
            if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
            
            // Hỗ trợ cả 2 môi trường: Docker (Linux) và chạy ngoài (Windows)
            const isWin = process.platform === 'win32';
            const cmd = isWin ? 'powershell.exe' : 'zip';
            const args = isWin 
                ? ['-NoProfile', '-NonInteractive', '-Command', `Compress-Archive -Path "${targetPath}\\*" -DestinationPath "${zipPath}" -Force`]
                : ['-r', zipPath, '.'];

            const procOptions = isWin ? { shell: true } : { cwd: targetPath, shell: true };
            const procProcess = spawn(cmd, args, procOptions);
            
            procProcess.on('close', (code) => {
                if (code === 0 && fs.existsSync(zipPath)) {
                    res.download(zipPath, zipName, (err) => {
                        if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
                    });
                } else {
                    res.status(500).send('Lỗi khi nén thư mục (Mã code: ' + code + ')');
                }
            });
        }
    } catch (e) {
        res.status(500).send(e.message);
    }
});

// EXTRACT API
app.post('/api/extract', (req, res) => {
    try {
        const { targetPath } = req.body;
        const fullPath = path.join(MC_DIR, targetPath || '');
        if (!fullPath.startsWith(MC_DIR) || fullPath === MC_DIR) return res.status(403).json({ error: 'Thao tác không hợp lệ' });
        if (!fs.existsSync(fullPath)) return res.status(404).json({ error: 'Không tìm thấy file' });

        const ext = path.extname(fullPath).toLowerCase();
        const destDir = path.dirname(fullPath);
        
        let cmdLine = '';
        const isWin = process.platform === 'win32';
        
        if (ext === '.zip') {
            cmdLine = isWin 
                ? `powershell.exe -NoProfile -NonInteractive -Command "Expand-Archive -Path '${fullPath}' -DestinationPath '${destDir}' -Force"`
                : `7z x "${fullPath}" -o"${destDir}" -y`;
        } else if (ext === '.rar') {
            cmdLine = `7z x "${fullPath}" -o"${destDir}" -y`;
        } else {
            return res.status(400).json({ error: 'Chỉ hỗ trợ .zip và .rar' });
        }

        exec(cmdLine, { cwd: destDir }, (error, stdout, stderr) => {
            if (error) {
                // Ignore warning exit codes (like 1 for 7z non-fatal errors) if the files were still extracted
                if (error.code && error.code !== 1) {
                     return res.status(500).json({ error: `Lỗi giải nén: ${error.message}` });
                }
            }
            res.json({ success: true, message: 'Giải nén thành công!' });
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// -------------------------

io.on('connection', (socket) => {
    console.log('Client connected');
    socket.emit('status', mcServer ? 'online' : 'offline');

    socket.on('start', () => {
        if (mcServer) { socket.emit('log', '\x1b[33mServer is already running!\x1b[0m\n'); return; }

        socket.emit('log', '\x1b[36mStarting Minecraft server...\x1b[0m\n');
        socket.emit('status', 'starting');

        const serverJar = config.jarFile || 'server.jar';
        const serverJarPath = path.join(MC_DIR, serverJar);
        if (!fs.existsSync(serverJarPath)) {
             socket.emit('log', `\x1b[31mError: Không tìm thấy ${serverJar} trong thư mục dữ liệu Minecraft.\x1b[0m\n`);
             socket.emit('log', `\x1b[33mVui lòng tải file lên qua tab QUẢN LÝ FILE hoặc chỉnh sửa tên file trong cài đặt.\x1b[0m\n`);
             socket.emit('status', 'offline');
             return;
        }

        try {
            let args = [];
            if (config.minRam) args.push(`-Xms${config.minRam}`);
            if (config.maxRam) args.push(`-Xmx${config.maxRam}`);
            if (config.extraArgs) args.push(...config.extraArgs.split(' ').filter(a => a));
            args.push('-jar', serverJar, 'nogui');

            mcServer = spawn(config.javaPath || 'java', args, { cwd: MC_DIR });
            io.emit('status', 'online');

            const handleOutput = (data) => {
                const text = data.toString();
                io.emit('log', text);
                if (text.includes('agree to the EULA') || text.includes('Failed to load eula.txt')) io.emit('eula-required');
            };

            mcServer.stdout.on('data', handleOutput);
            mcServer.stderr.on('data', handleOutput);

            mcServer.on('close', (code) => {
                mcServer = null;
                io.emit('status', 'offline');
                io.emit('log', `\x1b[33mServer stopped with code ${code}\x1b[0m\n`);
            });

            mcServer.on('error', (err) => {
                mcServer = null;
                io.emit('status', 'offline');
                io.emit('log', `\x1b[31mFailed to start server: ${err.message}\x1b[0m\n`);
            });
        } catch (err) {
            mcServer = null;
            io.emit('status', 'offline');
            io.emit('log', `\x1b[31mError: ${err.message}\x1b[0m\n`);
        }
    });

    socket.on('accept-eula', () => {
        try {
            const eulaPath = path.join(MC_DIR, 'eula.txt');
            fs.writeFileSync(eulaPath, 'eula=true\n');
            io.emit('log', '\x1b[32m[SYSTEM] Đã ghi nhận EULA = true thành công. Hãy bấm Khởi động lại.\x1b[0m\n');
        } catch (e) { io.emit('log', `\x1b[31mLỗi khi ghi EULA: ${e.message}\x1b[0m\n`); }
    });

    socket.on('stop', () => { if (mcServer) { io.emit('log', '\x1b[36mSending stop command...\x1b[0m\n'); mcServer.stdin.write('stop\n'); }});
    socket.on('command', (cmd) => { if (mcServer) mcServer.stdin.write(cmd + '\n'); });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Configured panel on port ${PORT}`));
