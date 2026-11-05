// Vân Hải Tông WEB — chế độ CHẠY THỬ: tiến trình riêng, dữ liệu là BẢN SAO của data/live.json (web/data/world.json).
// Không ghi gì vào LIVE. Tình hình LIVE (người đang chơi, sự kiện) đọc nhẹ từ server LIVE trên máy mỗi 10 giây.
// Chạy thật cùng dữ liệu LIVE: xem web/embed.mjs (VAN_HAI_WEB=1 khi mở server LIVE).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createWorld, prepareSocial, migrateDivineWardrobe } from '../engine.mjs';
import { createWebApp } from './app.mjs';
import { pollLive } from './live-view.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.WEB_DATA_DIR || path.join(here, 'data');
const worldFile = path.join(dataDir, 'world.json');
fs.mkdirSync(dataDir, { recursive: true });

function loadWorld() {
  if (!fs.existsSync(worldFile)) {
    const seed = process.env.WEB_SEED_FILE || path.join(here, '..', 'data', 'live.json');
    if (fs.existsSync(seed)) { fs.copyFileSync(seed, worldFile); console.log('Đã sao chép dữ liệu LIVE làm bản thử: ' + worldFile); }
    else fs.writeFileSync(worldFile, JSON.stringify(createWorld('live')));
  }
  const w = JSON.parse(fs.readFileSync(worldFile, 'utf8'));
  if (w.version !== 1 || !w.players) throw Error('Sai định dạng ' + worldFile);
  prepareSocial(w); migrateDivineWardrobe(w);
  return w;
}
const world = loadWorld();

let dirty = false;
function persist() {
  if (!dirty) return;
  dirty = false;
  const tmp = worldFile + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(world));
  fs.renameSync(tmp, worldFile);
}

let liveState = null;
const liveUrl = process.env.WEB_LIVE_URL ?? 'http://127.0.0.1:4317/api/state?world=live';
if (liveUrl && process.env.WEB_NO_LISTEN !== '1') pollLive(liveUrl, s => { liveState = s; });

const app = createWebApp({
  world, dataDir,
  markDirty: () => { dirty = true; },
  liveState: () => liveState,
  devTools: process.env.WEB_DEV_TOOLS !== '0',
  trustProxy: process.env.WEB_TRUST_PROXY === '1',
  secureCookie: process.env.WEB_SECURE_COOKIE === '1',
  tikfinity: process.env.WEB_TIKFINITY !== '0',
});
setInterval(() => { persist(); app.accounts.save(); }, 3000).unref();
function shutdown() { try { dirty = true; persist(); app.save(); } finally { process.exit(0); } }
process.on('SIGINT', shutdown); process.on('SIGTERM', shutdown);

export const { server, accounts, completeLink, perform } = app;
export { world };
if (process.env.WEB_NO_LISTEN !== '1') {
  const port = Number(process.env.WEB_PORT ?? 4320), host = process.env.WEB_HOST || '127.0.0.1';
  server.listen(port, host, () => { console.log(`Vân Hải Tông WEB (chạy thử): http://${host}:${server.address().port}/`); app.connectBridge(); });
}
