#!/usr/bin/env node
// Quản trị web cloud từ máy LIVE: xem / cấp / gỡ quyền quản trị cho một tài khoản đã TỰ đăng ký trên web.
// Ký bằng WEB_SYNC_SECRET trong data/web-cloud-agent.json (giống agent đồng bộ); không gửi hay nhận mật khẩu.
//   node web/cloud/admin.mjs "Tông chủ"          → xem tài khoản
//   node web/cloud/admin.mjs "Tông chủ" grant    → cấp quyền
//   node web/cloud/admin.mjs "Tông chủ" revoke   → gỡ quyền
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { signature } from './protocol.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const [username, action] = process.argv.slice(2);
if (!username || (action && !['grant', 'revoke'].includes(action))) { console.error('Cách dùng: node web/cloud/admin.mjs <tên đăng nhập> [grant|revoke]'); process.exit(2); }
const config = JSON.parse(fs.readFileSync(process.env.WEB_CLOUD_AGENT_CONFIG || path.join(root, 'data', 'web-cloud-agent.json'), 'utf8'));
const url = new URL('/internal/admin', config.url), at = String(Date.now());
const raw = Buffer.from(JSON.stringify({ username, ...(action ? { grant: action === 'grant' } : {}) }));
const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-VH-Time': at, 'X-VH-Signature': signature(config.secret, 'POST', url.pathname, at, raw) }, body: raw, signal: AbortSignal.timeout(15000) });
const out = await res.json().catch(() => ({ ok: false, message: 'HTTP ' + res.status }));
if (out.createdAt) out.createdAt = new Date(out.createdAt).toLocaleString('vi-VN');
console.log(JSON.stringify(out, null, 1));
process.exit(out.ok ? 0 : 1);
