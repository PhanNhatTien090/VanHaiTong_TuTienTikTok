// QA: chơi thử Lịch Luyện thật trong Chrome ẩn (server thử riêng, dữ liệu tạm — không đụng LIVE/web thật).
// node scripts/qa-lich-luyen-play.mjs <thư-mục-ảnh> [path.kiem-tu|path.the-tu|path.phap-tu]
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import WebSocket from 'ws';
import { createWebApp } from '../web/app.mjs';
import { createWorld } from '../engine.mjs';
import { createLichLuyen } from '../web/lich-luyen/service/api.mjs';

const out = path.resolve(process.argv[2] || 'output/qa-lich-luyen'), pathId = process.argv[3] || 'path.kiem-tu';
await fs.mkdir(out, { recursive: true });
const pause = ms => new Promise(r => setTimeout(r, ms));
const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'll-play-'));
const ll = createLichLuyen({ dataDir: dir, enabled: true });
const app = createWebApp({ world: createWorld('live'), dataDir: dir, profileOnly: true, tikfinity: false, lichLuyen: ll });
await new Promise(r => app.server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${app.server.address().port}`;

const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'll-chrome-'));
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--remote-debugging-port=0', '--no-first-run', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
let ws, id = 0; const pending = new Map(), logs = [];
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); setTimeout(() => { if (pending.has(i)) { pending.delete(i); rej(Error('timeout ' + method)); } }, 20000); });
const evalJs = async expr => (await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result.value;
const shot = async name => { const r = await send('Page.captureScreenshot', { format: 'png' }); await fs.writeFile(path.join(out, name + '.png'), Buffer.from(r.data, 'base64')); console.log('ảnh', name); };
const key = (type, code, k) => send('Input.dispatchKeyEvent', { type, code, key: k, windowsVirtualKeyCode: k.length === 1 ? k.toUpperCase().charCodeAt(0) : 32 });
try {
  let port; for (let i = 0; i < 100 && !port; i++) { try { port = Number((await fs.readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]); } catch { await pause(100); } }
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl); await new Promise(r => ws.on('open', r));
  ws.on('message', m => { const d = JSON.parse(m); if (d.id && pending.has(d.id)) { const p = pending.get(d.id); pending.delete(d.id); d.error ? p.rej(Error(d.error.message)) : p.res(d.result); } if (d.method === 'Runtime.exceptionThrown') logs.push('LỖI ' + JSON.stringify(d.params.exceptionDetails).slice(0, 400)); if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') logs.push('console.error ' + JSON.stringify(d.params.args).slice(0, 300)); });
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 860, height: 400, deviceScaleFactor: 2, mobile: true }); // điện thoại nằm ngang
  await send('Page.navigate', { url: base + '/lich-luyen.html' }); await pause(1500);
  console.log('đăng ký', await evalJs(`fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'qa${Date.now() % 1e6}',password:'matkhau123'})}).then(r=>r.status)`));
  await send('Page.reload'); await pause(2500);
  await shot('01-chon-dao-lo');
  await evalJs(`(()=>{const i=${JSON.stringify(['path.kiem-tu', 'path.the-tu', 'path.phap-tu'].indexOf(pathId))};document.querySelectorAll('.path')[i].click();document.getElementById('avatarName').value='Thử Kiếm';document.getElementById('createBtn').click();return 1})()`);
  await pause(1500); await shot('02-phan-than');
  await evalJs(`document.querySelector('#stageList button').click()`); await pause(1200);
  await shot('03-vao-tran');
  await key('keyDown', 'KeyJ', 'j');
  await key('keyDown', 'KeyD', 'd'); await pause(700); await key('keyUp', 'KeyD', 'd');
  await pause(2500); await shot('04-dang-danh');
  await key('keyDown', 'KeyK', 'k'); await pause(200); await key('keyUp', 'KeyK', 'k'); await pause(400); await shot('05-tuyet-ky');
  for (let i = 0; i < 120; i++) {
    const st = await evalJs(`document.getElementById('result').classList.contains('on') ? document.getElementById('resultText').textContent : ''`);
    if (st && !st.includes('Đang xác nhận')) break;
    if (i % 8 === 0) { await key('keyDown', 'KeyK', 'k'); await pause(150); await key('keyUp', 'KeyK', 'k'); }
    await pause(1000);
  }
  await key('keyUp', 'KeyJ', 'j');
  await shot('06-ket-qua');
  console.log('kết quả:', await evalJs(`document.getElementById('resultTitle').textContent+' | '+document.getElementById('resultStars').textContent+' | '+document.getElementById('resultText').textContent`));
  await evalJs(`document.getElementById('resultBtn').click()`); await pause(800); await shot('07-sau-tran');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await pause(800); await shot('08-dien-thoai-doc');
  const battles = ll.db.prepare('SELECT status, mismatch, result FROM ll_battles').all().map(b => ({ status: b.status, mismatch: b.mismatch, hash: JSON.parse(b.result || '{}').hash }));
  console.log('trận trên server:', JSON.stringify(battles));
} finally {
  console.log(logs.length ? logs.join('\n') : 'Không có lỗi JavaScript trên trang.');
  ws?.close(); chrome.kill(); app.server.close(); ll.close();
}
process.exit(0);
