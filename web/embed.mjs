// Gắn bản web vào CHÍNH tiến trình server LIVE để dùng chung một thế giới (một nơi ghi dữ liệu, không lệch).
// Chỉ chạy khi mở server LIVE với VAN_HAI_WEB=1 (xem start-live-web.cmd). Mặc định TẮT.
// Web nghe ở cổng riêng (WEB_PORT, mặc định 4320) và chỉ có đường dẫn của web; trang quản trị LIVE vẫn ở 4317 chỉ cho máy này.
// Hành động web chạy trên thế giới tạm cách ly (isolate.mjs): người xem LIVE không thấy người chơi web.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createWebApp } from './app.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

export function mountWeb({ world, persist, dataDir }) {
  let dirty = false;
  const app = createWebApp({
    world,
    dataDir: process.env.WEB_DATA_DIR || path.join(dataDir, 'web'),
    markDirty: () => { dirty = true; },
    liveState: undefined, // đọc thẳng từ thế giới LIVE
    devTools: false, // chạy thật: luôn tắt công cụ thử
    trustProxy: process.env.WEB_TRUST_PROXY !== '0',
    secureCookie: process.env.WEB_SECURE_COOKIE === '1',
    tikfinity: process.env.WEB_TIKFINITY !== '0',
  });
  // Sao lưu tài khoản web mỗi 30 phút (dữ liệu nhân vật đã nằm trong live.json, LIVE tự sao lưu).
  const webDir = process.env.WEB_DATA_DIR || path.join(dataDir, 'web');
  setInterval(() => {
    try {
      const src = path.join(webDir, 'accounts.json'); if (!fs.existsSync(src)) return;
      const dir = path.join(webDir, 'backups'); fs.mkdirSync(dir, { recursive: true });
      fs.copyFileSync(src, path.join(dir, `accounts-${new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '')}.json`));
      const files = fs.readdirSync(dir).filter(f => f.startsWith('accounts-')).sort();
      for (const f of files.slice(0, Math.max(0, files.length - 48))) fs.rmSync(path.join(dir, f), { force: true });
    } catch (e) { console.error('[web] Sao lưu tài khoản lỗi:', e.message); }
  }, 30 * 60000).unref();
  // Lưu ngay khi web có thay đổi (tối đa 5 giây một lần), ngoài lịch lưu sẵn của LIVE.
  setInterval(() => { if (dirty) { dirty = false; persist(true); } app.accounts.save(); }, 5000).unref();
  const port = Number(process.env.WEB_PORT ?? 4320), host = process.env.WEB_HOST || '127.0.0.1';
  app.server.listen(port, host, () => { console.log(`Vân Hải Tông WEB (chung dữ liệu LIVE): http://${host}:${port}/`); app.connectBridge(); });
  app.server.on('error', e => console.error('[web] Không mở được cổng web:', e.message));
  return app;
}
export { here };
