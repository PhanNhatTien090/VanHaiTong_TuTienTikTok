// QA: tài khoản quản trị + hình tạm mượn LIVE (nhân vật skin LIVE, quái linh thú/boss) trong Chrome ẩn.
// node scripts/qa-lich-luyen-admin.mjs <thư-mục-ảnh>
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import WebSocket from 'ws';
import { createWebApp } from '../web/app.mjs';
import { createWorld, ensurePlayer } from '../engine.mjs';
import { createLichLuyen } from '../web/lich-luyen/service/api.mjs';
import { addItems } from '../web/lich-luyen/service/inventory.mjs';
import { loadContent } from '../web/lich-luyen/content/index.js';

const out = path.resolve(process.argv[2] || 'output/qa-lich-luyen-admin');
await fs.mkdir(out, { recursive: true });
const pause = ms => new Promise(r => setTimeout(r, ms));
const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'll-admin-'));
const ll = createLichLuyen({ dataDir: dir, adminPreview: true });
const world = createWorld('live'); ensurePlayer(world, '7001', 'Đạo Hữu Skin', Date.now()); Object.assign(world.players['7001'], { giftCoins: 50000, realm: 6, gender: 'nu' });
const app = createWebApp({ world, dataDir: dir, profileOnly: true, tikfinity: false, lichLuyen: ll });
await new Promise(r => app.server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${app.server.address().port}`;
const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'll-chrome-'));
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--remote-debugging-port=0', '--no-first-run', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
let ws, id = 0; const pending = new Map(), logs = [];
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); setTimeout(() => { if (pending.has(i)) { pending.delete(i); rej(Error('timeout ' + method)); } }, 20000); });
const evalJs = async expr => (await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result.value;
const shot = async name => { const r = await send('Page.captureScreenshot', { format: 'png' }); await fs.writeFile(path.join(out, name + '.png'), Buffer.from(r.data, 'base64')); console.log('ảnh', name); };
const key = (type, code, k) => send('Input.dispatchKeyEvent', { type, code, key: k, windowsVirtualKeyCode: k.toUpperCase().charCodeAt(0) });
try {
  let port; for (let i = 0; i < 100 && !port; i++) { try { port = Number((await fs.readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]); } catch { await pause(100); } }
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl); await new Promise(r => ws.on('open', r));
  ws.on('message', m => { const d = JSON.parse(m); if (d.id && pending.has(d.id)) { const p = pending.get(d.id); pending.delete(d.id); d.error ? p.rej(Error(d.error.message)) : p.res(d.result); } if (d.method === 'Runtime.exceptionThrown') logs.push('LỖI ' + JSON.stringify(d.params.exceptionDetails).slice(0, 400)); });
  await send('Runtime.enable'); await send('Page.enable');
  await send('Page.navigate', { url: base + '/' }); await pause(1200);
  await evalJs(`fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'Tông chủ',password:'matkhau123'})}).then(r=>r.status)`);
  app.accounts.setAdmin('Tông chủ', true);
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send('Page.reload'); await pause(1500); await shot('01-trang-chinh-admin');
  await send('Page.navigate', { url: base + '/lich-luyen.html' }); await pause(1500);
  await evalJs(`fetch('/api/ll/avatar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pathId:'path.kiem-tu',name:'Tông chủ'})}).then(r=>r.status)`);
  await send('Page.reload'); await pause(1500); await shot('02-nha-admin');
  await evalJs(`fetch('/api/ll/look',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({playerId:'7001'})}).then(r=>r.status)`);
  await send('Page.reload'); await pause(1200);
  await send('Emulation.setDeviceMetricsOverride', { width: 860, height: 400, deviceScaleFactor: 2, mobile: true }); await pause(400);
  for (const [n, stage] of [['03-thanh-van', 'stage.thanh-van.1'], ['04-lac-ha-boss', 'stage.lac-ha.10']]) {
    await evalJs(`(b=>b${stage === 'stage.thanh-van.1' ? '[0]' : '.at(-1)'}.click())([...document.querySelectorAll('#stageList button')].filter(b=>b.textContent==='Vào ải'))`);
    await pause(1500);
    await pause(400);
    const dirs = [['KeyD', 'd'], ['KeyJ', 'j'], ['KeyS', 's'], ['KeyJ', 'j']];
    for (let i = 0; i < 6; i++) { const [code, k] = dirs[i % 4]; await key('keyDown', code, k); await pause(600); await key('keyUp', code, k); if (i === 3) await shot(n); }
    await send('Page.reload'); await pause(1500);
  }
  await send('Page.navigate', { url: base + '/admin.html' }); await pause(1200); await shot('05-quan-tri');
} finally {
  console.log(logs.length ? logs.join('\n') : 'Không có lỗi JavaScript trên trang.');
  ws?.close(); chrome.kill(); app.server.close(); ll.close();
}
process.exit(0);
