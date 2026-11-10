// QA: mô phỏng trận Lịch luyện phải cho CÙNG mã băm trong Chrome và trong Node.
// Chạy: node scripts/qa-lich-luyen-determinism.mjs [đường-dẫn-chrome]
// Cách làm: server tĩnh tạm phục vụ web/lich-luyen, Chrome ẩn mở trang chạy bot rồi in kết quả ra DOM (--dump-dom).
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { loadContent } from '../web/lich-luyen/content/index.js';
import { runBot } from '../web/lich-luyen/core/sim/replay.mjs';

const root = path.resolve(import.meta.dirname, '../web/lich-luyen');
const chrome = process.argv[2] || ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(p => fs.existsSync(p));
if (!chrome) { console.error('Không tìm thấy Chrome'); process.exit(2); }

const CASES = ['path.kiem-tu', 'path.the-tu', 'path.phap-tu'].flatMap(pathId => ['a', 'b', 'c'].map(seed => ({ pathId, seed })));
const BASE = { hp: 600, mp: 100, atk: 30, def: 8, spd: 220, crit: 100, critDmg: 1500 };

const page = `<!doctype html><meta charset="utf-8"><pre id="out">pending</pre><script type="module">
import { loadContent } from './content/index.js';
import { runBot } from './core/sim/replay.mjs';
const BASE = ${JSON.stringify(BASE)}, CASES = ${JSON.stringify(CASES)};
const c = loadContent();
const rows = CASES.map(({ pathId, seed }) => { const m = c.byId.get(pathId).statMult;
  const stats = Object.fromEntries(Object.entries(BASE).map(([k, v]) => [k, m[k] ? Math.trunc(v * m[k] / 1000) : v]));
  const r = runBot(c, { seed, stageId: 'stage.thanh-van.1', player: { pathId, stats } }).result; return [pathId, seed, r.hash, r.ticks]; });
document.getElementById('out').textContent = JSON.stringify({ version: c.version, rows });
</script>`;

const types = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.html': 'text/html' };
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/qa.html') { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(page); }
  const file = path.join(root, url);
  if (!file.startsWith(root) || !fs.existsSync(file)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'll-qa-'));
const out = await new Promise((resolve, reject) => {
  const ch = spawn(chrome, ['--headless=new', '--disable-gpu', '--no-first-run', `--user-data-dir=${profile}`, '--virtual-time-budget=20000', '--dump-dom', `http://127.0.0.1:${port}/qa.html`]);
  let buf = ''; ch.stdout.on('data', d => buf += d); ch.on('error', reject); ch.on('close', () => resolve(buf));
});
server.close(); fs.rmSync(profile, { recursive: true, force: true });

const m = out.match(/<pre id="out">([^<]*)<\/pre>/);
if (!m || m[1] === 'pending') { console.error('Chrome không chạy xong trang:\n' + out.slice(0, 500)); process.exit(1); }
const browser = JSON.parse(m[1].replaceAll('&quot;', '"'));
const c = loadContent();
let bad = 0;
if (browser.version !== c.version) { console.error('contentVersion khác:', browser.version, c.version); bad++; }
CASES.forEach(({ pathId, seed }, i) => {
  const stats = Object.fromEntries(Object.entries(BASE).map(([k, v]) => { const mm = c.byId.get(pathId).statMult; return [k, mm[k] ? Math.trunc(v * mm[k] / 1000) : v]; }));
  const r = runBot(c, { seed, stageId: 'stage.thanh-van.1', player: { pathId, stats } }).result;
  const b = browser.rows[i], same = b[2] === r.hash && b[3] === r.ticks;
  if (!same) bad++;
  console.log(same ? 'KHỚP' : 'LỆCH', pathId, seed, 'node', r.hash, r.ticks, 'chrome', b[2], b[3]);
});
console.log(bad ? `${bad} trường hợp lệch` : `Tất cả ${CASES.length} trận khớp giữa Chrome và Node`);
process.exit(bad ? 1 : 0);
