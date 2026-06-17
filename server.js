const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { spawn } = require('child_process');
const path = require('path');
const fsSync = require('fs');
const fs = fsSync.promises;
const multer = require('multer');
const os = require('os');
const crypto = require('crypto');
const compression = require('compression');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const MC_DIR = path.resolve(path.join(__dirname, 'minecraft'));
const BACKUP_DIR = path.resolve(path.join(__dirname, 'backups'));

if (!fsSync.existsSync(MC_DIR)) fsSync.mkdirSync(MC_DIR, { recursive: true });
if (!fsSync.existsSync(BACKUP_DIR)) fsSync.mkdirSync(BACKUP_DIR, { recursive: true });

// --- SECURITY HELPERS ---
function sanitizePath(baseDir, inputPath) {
    const resolved = path.resolve(baseDir, inputPath || '');
    if (!resolved.startsWith(baseDir + path.sep) && resolved !== baseDir) return null;
    return resolved;
}

function escapeShellArg(str) {
    // Escape for PowerShell single-quoted strings
    return str.replace(/'/g, "''");
}

function isValidFilename(name) {
    if (!name || typeof name !== 'string') return false;
    // Block path traversal and dangerous characters
    if (name.includes('..') || name.includes('/') || name.includes('\\') || name.includes('\0')) return false;
    // Block hidden files and reserved names
    if (name.startsWith('.') && name !== '.') return false;
    // Windows reserved names
    const reserved = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i;
    if (reserved.test(name)) return false;
    return true;
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const basePath = sanitizePath(MC_DIR, req.body.path);
        if (!basePath) return cb(new Error('Invalid upload path'));
        let uploadPath = basePath;
        const relativeDir = path.dirname(file.originalname);
        if (relativeDir && relativeDir !== '.') {
            const safeSubdir = sanitizePath(basePath, relativeDir);
            if (!safeSubdir) return cb(new Error('Invalid subdirectory in upload'));
            uploadPath = safeSubdir;
        }
        if (!fsSync.existsSync(uploadPath)) fsSync.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const basename = path.basename(file.originalname);
        if (!isValidFilename(basename)) return cb(new Error('Invalid filename'));
        cb(null, basename);
    }
});
const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } });

// --- MIDDLEWARE ---
app.use(compression());
// Static assets: cache for 1 hour in production, disable in dev
const staticMaxAge = process.env.NODE_ENV === 'production' ? '1h' : 0;
app.use(express.static(path.join(__dirname, 'public'), { maxAge: staticMaxAge, etag: true }));
app.use(express.json({ limit: '50mb' }));

let mcServer = null;
let serverStartTime = null;
let onlinePlayers = [];

// --- LOG BUFFER (send recent context to reconnecting clients) ---
const LOG_BUFFER_MAX = 500;
const logBuffer = [];
function pushLog(text) {
    logBuffer.push(text);
    if (logBuffer.length > LOG_BUFFER_MAX) logBuffer.shift();
}

// --- HELPERS ---
async function pathExists(p) {
    try { await fs.access(p); return true; } catch { return false; }
}

// --- TTL CACHE ---
const cache = new Map();
function cacheGet(key) {
    const entry = cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiry) { cache.delete(key); return undefined; }
    return entry.value;
}
function cacheSet(key, value, ttlMs = 5000) {
    cache.set(key, { value, expiry: Date.now() + ttlMs });
}
function cacheInvalidate(prefix) {
    for (const key of cache.keys()) {
        if (key.startsWith(prefix)) cache.delete(key);
    }
}

// --- RATE LIMITER (30 req / 10s per IP, capped at 1000 IPs) ---
const rateLimitMap = new Map();
const RATE_LIMIT_MAX_IPS = 1000;
function rateLimit(maxRequests = 30, windowMs = 10000) {
    return (req, res, next) => {
        const key = req.ip;
        const now = Date.now();
        const windowStart = now - windowMs;
        if (!rateLimitMap.has(key)) {
            // Evict oldest entries if map is too large
            if (rateLimitMap.size >= RATE_LIMIT_MAX_IPS) {
                const oldestKey = rateLimitMap.keys().next().value;
                rateLimitMap.delete(oldestKey);
            }
            rateLimitMap.set(key, []);
        }
        const timestamps = rateLimitMap.get(key).filter(t => t > windowStart);
        if (timestamps.length >= maxRequests) {
            return res.status(429).json({ error: 'Quá nhiều request. Vui lòng thử lại sau.' });
        }
        timestamps.push(now);
        rateLimitMap.set(key, timestamps);
        next();
    };
}
setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of rateLimitMap) {
        const filtered = timestamps.filter(t => t > now - 10000);
        if (filtered.length === 0) rateLimitMap.delete(key);
        else rateLimitMap.set(key, filtered);
    }
}, 30000);

app.use('/api', rateLimit());

// --- FILE MANAGER APIs ---
app.get('/api/files', async (req, res) => {
    try {
        const queryPath = req.query.path || '';
        const targetPath = sanitizePath(MC_DIR, queryPath);
        if (!targetPath) return res.status(403).json({ error: 'Access denied' });
        const cacheKey = `files:${queryPath}`;
        const cached = cacheGet(cacheKey);
        if (cached) return res.json(cached);
        if (!await pathExists(targetPath)) return res.json([]);
        const items = await fs.readdir(targetPath, { withFileTypes: true });
        const result = await Promise.all(items.map(async (item) => {
            const stat = await fs.stat(path.join(targetPath, item.name));
            return { name: item.name, isDir: item.isDirectory(), size: item.isDirectory() ? 0 : stat.size, mtime: stat.mtime };
        }));
        result.sort((a, b) => { if (a.isDir && !b.isDir) return -1; if (!a.isDir && b.isDir) return 1; return a.name.localeCompare(b.name); });
        cacheSet(cacheKey, result, 3000);
        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/upload', upload.array('files'), (req, res) => {
    cacheInvalidate('files:');
    res.json({ success: true, message: 'Upload thành công' });
});

app.delete('/api/files', async (req, res) => {
    try {
        const { targetPath } = req.body;
        const fullPath = sanitizePath(MC_DIR, targetPath);
        if (!fullPath || fullPath === MC_DIR) return res.status(403).json({ error: 'Operation not permitted!' });
        if (await pathExists(fullPath)) {
            const stat = await fs.stat(fullPath);
            if (stat.isDirectory()) await fs.rm(fullPath, { recursive: true, force: true });
            else await fs.unlink(fullPath);
        }
        cacheInvalidate('files:');
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/file-content', async (req, res) => {
    try {
        const queryPath = req.query.path || '';
        const targetPath = sanitizePath(MC_DIR, queryPath);
        if (!targetPath) return res.status(403).json({ error: 'Access denied' });
        if (!await pathExists(targetPath)) return res.status(404).json({ error: 'File not found' });
        const stat = await fs.stat(targetPath);
        if (stat.isDirectory()) return res.status(400).json({ error: 'Cannot read directory' });
        if (stat.size > 2 * 1024 * 1024) return res.status(400).json({ error: 'File too large (limit 2MB)' });
        const content = await fs.readFile(targetPath, 'utf8');
        res.json({ content });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/file-content', async (req, res) => {
    try {
        const { targetPath, content } = req.body;
        if (!targetPath || typeof content !== 'string') return res.status(400).json({ error: 'Missing required fields' });
        if (content.length > 2 * 1024 * 1024) return res.status(400).json({ error: 'Content too large' });
        const fullPath = sanitizePath(MC_DIR, targetPath);
        if (!fullPath || fullPath === MC_DIR) return res.status(403).json({ error: 'Operation not permitted' });
        await fs.writeFile(fullPath, content, 'utf8');
        cacheInvalidate('files:');
        cacheInvalidate('props:');
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/rename', async (req, res) => {
    try {
        const { oldPath, newName } = req.body;
        if (!newName || !isValidFilename(newName)) return res.status(400).json({ error: 'Invalid filename' });
        const fullOld = sanitizePath(MC_DIR, oldPath);
        if (!fullOld || fullOld === MC_DIR) return res.status(403).json({ error: 'Operation not permitted' });
        const fullNew = path.join(path.dirname(fullOld), newName);
        if (!fullNew.startsWith(MC_DIR + path.sep) && fullNew !== MC_DIR) return res.status(403).json({ error: 'Operation not permitted' });
        if (!await pathExists(fullOld)) return res.status(404).json({ error: 'Not found' });
        if (await pathExists(fullNew)) return res.status(400).json({ error: 'A file with that name already exists' });
        await fs.rename(fullOld, fullNew);
        cacheInvalidate('files:');
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/mkdir', async (req, res) => {
    try {
        const { targetPath } = req.body;
        const fullPath = sanitizePath(MC_DIR, targetPath);
        if (!fullPath || fullPath === MC_DIR) return res.status(403).json({ error: 'Operation not permitted' });
        if (await pathExists(fullPath)) return res.status(400).json({ error: 'Directory already exists' });
        await fs.mkdir(fullPath, { recursive: true });
        cacheInvalidate('files:');
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- SETTINGS APIs ---
const CONFIG_PATH = path.join(__dirname, 'config.json');
const CONFIG_KEYS = new Set(['javaPath', 'maxRam', 'minRam', 'jarFile', 'extraArgs']);
let config = { javaPath: 'java', maxRam: '2048M', minRam: '1024M', jarFile: 'server.jar', extraArgs: '' };

(async () => {
    if (fsSync.existsSync(CONFIG_PATH)) {
        try { config = { ...config, ...JSON.parse(fsSync.readFileSync(CONFIG_PATH, 'utf8')) }; } catch (e) {}
    }
})();

app.get('/api/settings', (req, res) => res.json(config));

app.post('/api/settings', async (req, res) => {
    // Only allow whitelisted config keys
    const cleaned = {};
    for (const key of CONFIG_KEYS) {
        if (req.body[key] !== undefined) cleaned[key] = req.body[key];
    }
    config = { ...config, ...cleaned };
    const tmpPath = CONFIG_PATH + '.tmp';
    try {
        await fs.writeFile(tmpPath, JSON.stringify(config, null, 2));
        await fs.rename(tmpPath, CONFIG_PATH);
    } catch (e) {
        try { await fs.unlink(tmpPath); } catch {}
        return res.status(500).json({ error: e.message });
    }
    res.json({ success: true });
});

// --- DOWNLOAD API ---
app.get('/api/download', async (req, res) => {
    try {
        const queryPath = req.query.path || '';
        const targetPath = sanitizePath(MC_DIR, queryPath);
        if (!targetPath) return res.status(403).send('Access denied');
        if (!await pathExists(targetPath)) return res.status(404).send('Not found');
        const stat = await fs.stat(targetPath);
        if (stat.isFile()) { res.download(targetPath); return; }
        if (stat.isDirectory()) {
            const zipName = `${path.basename(targetPath) || 'archive'}.zip`;
            const zipPath = path.join(BACKUP_DIR, `.tmp-${crypto.randomUUID()}.zip`);
            const isWin = process.platform === 'win32';
            const safeTarget = escapeShellArg(targetPath);
            const safeZip = escapeShellArg(zipPath);
            const cmd = isWin ? 'powershell.exe' : '/usr/bin/zip';
            const args = isWin
                ? ['-NoProfile', '-NonInteractive', '-Command', `Compress-Archive -Path '${safeTarget}\\*' -DestinationPath '${safeZip}' -Force`]
                : ['-r', zipPath, '.'];
            const procOptions = isWin ? { shell: false } : { cwd: targetPath, shell: false };
            const p = spawn(cmd, args, procOptions);
            const timeout = setTimeout(() => { p.kill(); if (!res.headersSent) res.status(500).send('Timeout compressing files'); }, 120000);
            p.on('close', (code) => {
                clearTimeout(timeout);
                if (code === 0 && fsSync.existsSync(zipPath)) { res.download(zipPath, zipName, () => { try { fsSync.unlinkSync(zipPath); } catch {} }); }
                else { try { if (fsSync.existsSync(zipPath)) fsSync.unlinkSync(zipPath); } catch {}; res.status(500).send('Compression error (Code: ' + code + ')'); }
            });
            p.on('error', (err) => { clearTimeout(timeout); try { if (fsSync.existsSync(zipPath)) fsSync.unlinkSync(zipPath); } catch {}; res.status(500).send('Zip error: ' + err.message); });
        }
    } catch (e) { res.status(500).send(e.message); }
});

// --- EXTRACT API ---
app.post('/api/extract', async (req, res) => {
    try {
        const { targetPath } = req.body;
        const fullPath = sanitizePath(MC_DIR, targetPath);
        if (!fullPath || fullPath === MC_DIR) return res.status(403).json({ error: 'Operation not permitted' });
        if (!await pathExists(fullPath)) return res.status(404).json({ error: 'File not found' });
        const ext = path.extname(fullPath).toLowerCase();
        const destDir = path.dirname(fullPath);
        const isWin = process.platform === 'win32';
        let extractCmd, extractArgs;
        if (ext === '.zip') {
            const safeFull = escapeShellArg(fullPath);
            const safeDest = escapeShellArg(destDir);
            extractCmd = isWin ? 'powershell.exe' : '/usr/bin/unzip';
            extractArgs = isWin
                ? ['-NoProfile', '-NonInteractive', '-Command', `Expand-Archive -Path '${safeFull}' -DestinationPath '${safeDest}' -Force`]
                : ['-o', fullPath, '-d', destDir];
        } else if (ext === '.rar') {
            extractCmd = isWin ? '7z' : '/usr/bin/7z';
            extractArgs = ['x', fullPath, `-o${destDir}`, '-y'];
        } else { return res.status(400).json({ error: 'Only .zip and .rar are supported' }); }
        const ep = spawn(extractCmd, extractArgs, { shell: false });
        const timeout = setTimeout(() => { ep.kill(); if (!res.headersSent) res.status(500).json({ error: 'Extraction timeout' }); }, 120000);
        ep.on('close', (code) => {
            clearTimeout(timeout);
            cacheInvalidate('files:');
            if (code === 0 || code === 1) res.json({ success: true, message: 'Extraction complete!' });
            else res.status(500).json({ error: `Extraction error (Code: ${code})` });
        });
        ep.on('error', (err) => { clearTimeout(timeout); res.status(500).json({ error: `Error: ${err.message}` }); });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- STATS API ---
let lastCpuInfo = null;
let lastCpuTime = 0;
let cachedCpuPercent = '0';
let cpuCacheTime = 0;

function computeCpuPercent() {
    const cpus = os.cpus();
    const now = Date.now();
    if (!lastCpuInfo || now - lastCpuTime < 1000) {
        lastCpuInfo = cpus;
        lastCpuTime = now;
        return cachedCpuPercent;
    }
    let totalDiff = 0, idleDiff = 0;
    for (let i = 0; i < cpus.length; i++) {
        const prev = lastCpuInfo[i] ? lastCpuInfo[i].times : null;
        const curr = cpus[i].times;
        if (!prev) continue;
        const prevTotal = Object.values(prev).reduce((a, b) => a + b, 0);
        const currTotal = Object.values(curr).reduce((a, b) => a + b, 0);
        totalDiff += (currTotal - prevTotal);
        idleDiff += (curr.idle - prev.idle);
    }
    lastCpuInfo = cpus;
    lastCpuTime = now;
    if (totalDiff === 0) return '0.0';
    const usage = ((1 - idleDiff / totalDiff) * 100).toFixed(1);
    return usage;
}

app.get('/api/stats', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const now = Date.now();
    if (now - cpuCacheTime >= 2000) {
        cachedCpuPercent = computeCpuPercent();
        cpuCacheTime = now;
    }
    const mem = process.memoryUsage();
    res.json({
        cpu: cachedCpuPercent,
        ramUsed: Math.round(mem.rss / 1024 / 1024),
        ramTotal: Math.round(os.totalmem() / 1024 / 1024),
        uptime: mcServer ? Math.floor((now - serverStartTime) / 1000) : 0,
        serverRunning: !!mcServer,
        onlinePlayers: onlinePlayers
    });
});

// --- PLAYERS API ---
async function readJsonSafe(filePath) {
    if (await pathExists(filePath)) {
        try { return JSON.parse(await fs.readFile(filePath, 'utf8')); } catch (e) {}
    }
    return [];
}

app.get('/api/players', async (req, res) => {
    try {
        res.setHeader('Cache-Control', 'no-store');
        const cached = cacheGet('players');
        if (cached) return res.json({ ...cached, online: onlinePlayers });
        const [ops, whitelist, banned] = await Promise.all([
            readJsonSafe(path.join(MC_DIR, 'ops.json')),
            readJsonSafe(path.join(MC_DIR, 'whitelist.json')),
            readJsonSafe(path.join(MC_DIR, 'banned-players.json'))
        ]);
        const result = { ops, whitelist, banned };
        cacheSet('players', result, 5000);
        res.json({ ...result, online: onlinePlayers });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- SERVER PROPERTIES API ---
app.get('/api/server-properties', async (req, res) => {
    try {
        const cached = cacheGet('props');
        if (cached) return res.json(cached);
        const propPath = path.join(MC_DIR, 'server.properties');
        if (!await pathExists(propPath)) return res.json({});
        const content = await fs.readFile(propPath, 'utf8');
        const props = {};
        content.split('\n').forEach(line => {
            line = line.trim();
            if (!line || line.startsWith('#')) return;
            const idx = line.indexOf('=');
            if (idx !== -1) props[line.substring(0, idx).trim()] = line.substring(idx + 1).trim();
        });
        cacheSet('props', props, 10000);
        res.json(props);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/server-properties', async (req, res) => {
    try {
        const propPath = path.join(MC_DIR, 'server.properties');
        const props = req.body;
        let content = '#Minecraft server properties\n#Generated by MC Panel\n';
        Object.keys(props).sort().forEach(key => { content += `${key}=${props[key]}\n`; });
        await fs.writeFile(propPath, content, 'utf8');
        cacheInvalidate('props');
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- BACKUP APIs ---
app.get('/api/backups', async (req, res) => {
    try {
        const cached = cacheGet('backups');
        if (cached) return res.json(cached);
        if (!await pathExists(BACKUP_DIR)) return res.json([]);
        const files = (await fs.readdir(BACKUP_DIR)).filter(f => f.endsWith('.zip') && !f.startsWith('.tmp-'));
        const result = (await Promise.all(files.map(async (f) => {
            const stat = await fs.stat(path.join(BACKUP_DIR, f));
            return { name: f, size: stat.size, date: stat.mtime };
        }))).sort((a, b) => new Date(b.date) - new Date(a.date));
        cacheSet('backups', result, 5000);
        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/backup', async (req, res) => {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const zipName = `backup-${timestamp}.zip`;
        const zipPath = path.join(BACKUP_DIR, zipName);
        const isWin = process.platform === 'win32';
        const safeMC = escapeShellArg(MC_DIR);
        const safeZip = escapeShellArg(zipPath);
        const cmd = isWin ? 'powershell.exe' : '/usr/bin/zip';
        const args = isWin
            ? ['-NoProfile', '-NonInteractive', '-Command', `Compress-Archive -Path '${safeMC}\\*' -DestinationPath '${safeZip}' -Force`]
            : ['-r', zipPath, '.'];
        const opts = isWin ? { shell: false } : { cwd: MC_DIR, shell: false };
        const p = spawn(cmd, args, opts);
        const timeout = setTimeout(() => { p.kill(); if (!res.headersSent) res.status(500).json({ error: 'Backup timeout' }); }, 300000);
        p.on('close', (code) => {
            clearTimeout(timeout);
            cacheInvalidate('backups');
            if (code === 0) res.json({ success: true, name: zipName });
            else res.status(500).json({ error: 'Backup error (Code: ' + code + ')' });
        });
        p.on('error', (err) => { clearTimeout(timeout); res.status(500).json({ error: err.message }); });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/backups', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || typeof name !== 'string') return res.status(400).json({ error: 'Missing backup name' });
        const fullPath = path.resolve(BACKUP_DIR, name);
        if (!fullPath.startsWith(BACKUP_DIR + path.sep)) return res.status(403).json({ error: 'Not permitted' });
        if (await pathExists(fullPath)) await fs.unlink(fullPath);
        cacheInvalidate('backups');
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/backup/download', async (req, res) => {
    try {
        const name = req.query.name;
        if (!name || typeof name !== 'string') return res.status(400).send('Missing backup name');
        const fullPath = path.resolve(BACKUP_DIR, name);
        if (!fullPath.startsWith(BACKUP_DIR + path.sep)) return res.status(403).send('Not permitted');
        if (!await pathExists(fullPath)) return res.status(404).send('Not found');
        res.download(fullPath);
    } catch (e) { res.status(500).send(e.message); }
});

// --- SOCKET.IO ---
const PLAYER_JOIN_RE = /(\w+) joined the game/;
const PLAYER_LEAVE_RE = /(\w+) left the game/;

io.on('connection', (socket) => {
    console.log('Client connected');
    socket.emit('status', mcServer ? 'online' : 'offline');
    // Send buffered log so reconnecting clients get context
    if (logBuffer.length > 0) {
        socket.emit('log', logBuffer.join(''));
    }

    socket.on('start', async () => {
        if (mcServer) { socket.emit('log', '\x1b[33mServer is already running!\x1b[0m\n'); return; }
        socket.emit('log', '\x1b[36mStarting Minecraft server...\x1b[0m\n');
        socket.emit('status', 'starting');
        const serverJar = config.jarFile || 'server.jar';
        const serverJarPath = path.join(MC_DIR, serverJar);
        if (!await pathExists(serverJarPath)) {
            socket.emit('log', `\x1b[31mError: ${serverJar} not found\x1b[0m\n`);
            socket.emit('log', `\x1b[33mPlease upload the file via File Manager tab.\x1b[0m\n`);
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
            serverStartTime = Date.now();
            onlinePlayers = [];
            cacheInvalidate('players');
            io.emit('status', 'online');

            if (mcServer.stdin) mcServer.stdin.on('error', (err) => console.error('MC stdin error:', err.message));
            if (mcServer.stdout) mcServer.stdout.on('error', (err) => console.error('MC stdout error:', err.message));
            if (mcServer.stderr) mcServer.stderr.on('error', (err) => console.error('MC stderr error:', err.message));

            const handleOutput = (data) => {
                const text = data.toString();
                pushLog(text);
                // Use volatile to drop log frames if client can't keep up
                io.volatile.emit('log', text);
                const joinMatch = text.match(PLAYER_JOIN_RE);
                if (joinMatch && !onlinePlayers.includes(joinMatch[1])) {
                    onlinePlayers.push(joinMatch[1]);
                    cacheInvalidate('players');
                    io.emit('player-update', onlinePlayers);
                }
                const leaveMatch = text.match(PLAYER_LEAVE_RE);
                if (leaveMatch) {
                    onlinePlayers = onlinePlayers.filter(p => p !== leaveMatch[1]);
                    cacheInvalidate('players');
                    io.emit('player-update', onlinePlayers);
                }
                if (text.includes('agree to the EULA') || text.includes('Failed to load eula.txt')) io.emit('eula-required');
            };
            mcServer.stdout.on('data', handleOutput);
            mcServer.stderr.on('data', handleOutput);

            mcServer.on('close', (code) => {
                mcServer = null; serverStartTime = null; onlinePlayers = [];
                cacheInvalidate('players');
                io.emit('status', 'offline');
                io.emit('player-update', []);
                io.emit('log', `\x1b[33mServer stopped with code ${code}\x1b[0m\n`);
            });
            mcServer.on('error', (err) => {
                mcServer = null; serverStartTime = null;
                io.emit('status', 'offline');
                io.emit('log', `\x1b[31mFailed to start: ${err.message}\x1b[0m\n`);
            });
        } catch (err) {
            mcServer = null; serverStartTime = null;
            io.emit('status', 'offline');
            io.emit('log', `\x1b[31mError: ${err.message}\x1b[0m\n`);
        }
    });

    socket.on('accept-eula', async () => {
        try {
            await fs.writeFile(path.join(MC_DIR, 'eula.txt'), 'eula=true\n');
            io.emit('log', '\x1b[32m[SYSTEM] EULA accepted. Please restart the server.\x1b[0m\n');
        } catch (e) { io.emit('log', `\x1b[31mEULA error: ${e.message}\x1b[0m\n`); }
    });

    socket.on('stop', () => { if (mcServer) { io.emit('log', '\x1b[36mSending stop command...\x1b[0m\n'); mcServer.stdin.write('stop\n'); } });
    socket.on('command', (cmd) => {
        if (mcServer && typeof cmd === 'string' && cmd.length < 1024) mcServer.stdin.write(cmd + '\n');
    });
});

// --- GRACEFUL SHUTDOWN ---
function gracefulShutdown(signal) {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    if (mcServer) {
        console.log('Sending stop command to Minecraft server...');
        try { mcServer.stdin.write('stop\n'); } catch (e) { /* stdin may be closed */ }
        // Give the MC server time to save and exit
        const forceTimer = setTimeout(() => {
            console.log('Force killing Minecraft server...');
            mcServer.kill('SIGKILL');
            process.exit(0);
        }, 30000);
        mcServer.on('close', () => {
            clearTimeout(forceTimer);
            console.log('Minecraft server stopped.');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`MC Panel running on port ${PORT}`));
