// QA: xem màn Lôi Kiếp thật trong Chrome ẩn (server thử riêng, dữ liệu tạm).
// node scripts/qa-lich-luyen-trial.mjs <thư-mục-ảnh>
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import WebSocket from 'ws';
import { createWebApp } from '../web/app.mjs';
import { createWorld } from '../engine.mjs';
import { createLichLuyen } from '../web/lich-luyen/service/api.mjs';
import { addItems } from '../web/lich-luyen/service/inventory.mjs';
import { loadContent } from '../web/lich-luyen/content/index.js';

const out = path.resolve(process.argv[2] || 'output/qa-lich-luyen-trial');
await fs.mkdir(out, { recursive: true });
const pause = ms => new Promise(r => setTimeout(r, ms));
const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'll-trial-'));
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
const key = (type, code, k) => send('Input.dispatchKeyEvent', { type, code, key: k, windowsVirtualKeyCode: k.toUpperCase().charCodeAt(0) });
try {
  let port; for (let i = 0; i < 100 && !port; i++) { try { port = Number((await fs.readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]); } catch { await pause(100); } }
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl); await new Promise(r => ws.on('open', r));
  ws.on('message', m => { const d = JSON.parse(m); if (d.id && pending.has(d.id)) { const p = pending.get(d.id); pending.delete(d.id); d.error ? p.rej(Error(d.error.message)) : p.res(d.result); } if (d.method === 'Runtime.exceptionThrown') logs.push('LỖI ' + JSON.stringify(d.params.exceptionDetails).slice(0, 400)); });
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 860, height: 400, deviceScaleFactor: 2, mobile: true });
  await send('Page.navigate', { url: base + '/lich-luyen.html' }); await pause(1500);
  await evalJs(`fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'dokiep${Date.now() % 1e6}',password:'matkhau123'})}).then(r=>r.status)`);
  await evalJs(`fetch('/api/ll/avatar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pathId:'path.kiem-tu',name:'Độ Kiếp'})}).then(r=>r.status)`);
  const L = ll.game.ladder, g = L.findIndex(x => x.realmId === 'realm.truc-co' && x.gate), av = ll.db.prepare('SELECT id FROM ll_avatars').get();
  ll.db.prepare('UPDATE ll_avatars SET step=?, qi=?, payload=? WHERE id=?').run(g, L[g].qi, JSON.stringify({ breakthroughs: [{ realmId: 'realm.truc-co', quality: 'thien', points: 20 }], stages: { 'stage.thanh-van.10': { stars: 3, clears: 2 }, 'stage.lac-ha.1': { stars: 2, clears: 1 } } }), av.id);
  addItems(ll.db, av.id, { 'item.ket-dan-dan': 1, 'item.xich-viem-tinh': 1, 'item.loi-kich-moc': 1, 'item.han-ngoc-tuy': 1 }, loadContent());
  await send('Page.reload'); await pause(2000);
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }); await pause(500);
  await shot('01-bang-do-kiep');
  await evalJs(`document.getElementById('home').scrollTop=1200`); await pause(300); await shot('02-danh-sach-chau');
  await send('Emulation.setDeviceMetricsOverride', { width: 860, height: 400, deviceScaleFactor: 2, mobile: true }); await pause(500);
  await evalJs(`[...document.querySelectorAll('#breakBox button')].find(b=>b.textContent.startsWith('Độ')).click()`); await pause(2600);
  await shot('03-vong-bao-set');
  // chạy vòng tròn để né, chụp vài lúc sét giáng
  const dirs = [['KeyD', 'd'], ['KeyS', 's'], ['KeyA', 'a'], ['KeyW', 'w']];
  for (let i = 0; i < 9; i++) {
    const [code, k] = dirs[i % 4];
    await key('keyDown', code, k); await pause(1100); await key('keyUp', code, k);
    if (i === 2 || i === 6) await shot('04-set-' + i);
  }
  for (let i = 0; i < 60; i++) { const t = await evalJs(`document.getElementById('result').classList.contains('on') ? document.getElementById('resultText').textContent : ''`); if (t && !t.includes('Đang xác nhận')) break; const [code, k] = dirs[i % 4]; await key('keyDown', code, k); await pause(900); await key('keyUp', code, k); }
  await shot('05-ket-qua');
  console.log('kết quả:', await evalJs(`document.getElementById('resultTitle').textContent+' | '+document.getElementById('resultText').textContent`));
  console.log('trận:', JSON.stringify(ll.db.prepare('SELECT status, mismatch FROM ll_battles').all()));
} finally {
  console.log(logs.length ? logs.join('\n') : 'Không có lỗi JavaScript trên trang.');
  ws?.close(); chrome.kill(); app.server.close(); ll.close();
}
process.exit(0);
