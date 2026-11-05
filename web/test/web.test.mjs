import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createAccountStore, parseLinkComment } from '../accounts.mjs';

// Thế giới mẫu: một người chơi TikTok có sẵn đồ, để kiểm tra liên kết giữ nguyên tiến trình.
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-web-'));
const seed = path.join(dir, 'seed.json');
const { createWorld, action } = await import('../../engine.mjs');
const w0 = createWorld('live');
action(w0, { type: 'join', userId: '7001', name: 'Kiếm Khách' }, 1);
Object.assign(w0.players['7001'], { realm: 3, stones: 999, herbs: 50, qi: 10, totalQi: 5000, artifacts: ['jade', 'bell'], equipped: 'bell', giftCoins: 120 });
fs.writeFileSync(seed, JSON.stringify(w0));
Object.assign(process.env, { WEB_DATA_DIR: path.join(dir, 'data'), WEB_SEED_FILE: seed, WEB_NO_LISTEN: '1', WEB_TIKFINITY: '0' });
process.env.WEB_PROFILE_ONLY='0'; // Legacy game behavior remains covered only when explicitly enabled.
const { server, world, completeLink } = await import('../server.mjs');
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;
test.after(() => server.close());

function client() {
  let cookie = '';
  return async (p, body) => {
    const res = await fetch(base + p, {
      method: body === undefined ? 'GET' : 'POST',
      headers: { ...(cookie ? { cookie } : {}), ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const set = res.headers.get('set-cookie');
    if (set) cookie = set.split(';')[0];
    return { status: res.status, ...(await res.json()) };
  };
}

test('mã liên kết nhận dạng được cách gõ có dấu, viết thường, có dấu cách', () => {
  assert.equal(parseLinkComment('lienket 4kx9p2'), '4KX9P2');
  assert.equal(parseLinkComment('Liên kết: 4KX9P2'), '4KX9P2');
  assert.equal(parseLinkComment('!lienket4KX9P2'), '4KX9P2');
  assert.equal(parseLinkComment('tuluyen'), null);
  assert.equal(parseLinkComment('lienket abc'), null);
});

test('mật khẩu sai bị từ chối, mã liên kết chỉ dùng một lần và hết hạn', () => {
  const s = createAccountStore(null);
  const r = s.register('Tien_01', 'matkhau1', 0);
  assert.equal(r.ok, true);
  assert.equal(s.register('tien_01', 'khac123', 0).ok, false);
  assert.equal(s.login('tien_01', 'sai').ok, false);
  assert.equal(s.login('TIEN_01', 'matkhau1').ok, true);
  const { code } = s.startLink(r.user, 0);
  assert.equal(s.consumeLink(code, 1000)?.username, 'tien_01');
  assert.equal(s.consumeLink(code, 1000), null);
  const late = s.startLink(r.user, 0);
  assert.equal(s.consumeLink(late.code, 11 * 60 * 1000), null);
});

test('liên kết TikTok giữ nguyên cảnh giới, pháp bảo, linh thạch', async () => {
  const api = client();
  assert.equal((await api('/api/me')).status, 401);
  const reg = await api('/api/register', { username: 'kiemkhach', password: '123456' });
  assert.equal(reg.ok, true);
  assert.equal(reg.player, null);
  const link = await api('/api/link/start', {});
  assert.match(link.code, /^[A-Z2-9]{6}$/);
  assert.equal(completeLink(link.code, { userId: '7001', name: 'Kiếm Khách' }).ok, true);
  const me = await api('/api/me');
  assert.equal(me.player.id, '7001');
  assert.equal(me.player.realm, 3);
  assert.equal(me.player.stones, 999);
  assert.equal(me.player.giftCoins, 120);
  assert.equal(me.player.fromTikTok, true);
  const owned = me.inventory.artifacts.filter(x => x.owned).map(x => x.id).sort();
  assert.deepEqual(owned, ['bell', 'jade']);
  assert.equal(me.inventory.artifacts.find(x => x.id === 'bell').equipped, true);
});

test('nút bấm đi qua đúng luật engine: hồi chiêu, giá, cảnh giới', async () => {
  const api = client();
  await api('/api/register', { username: 'tanthu', password: '123456' });
  const made = await api('/api/character', { name: 'Tân Thủ', gender: 'nu' });
  assert.equal(made.ok, true);
  assert.equal(made.player.address, 'sư tỷ');
  const first = await api('/api/act', { type: 'cultivate' });
  assert.equal(first.ok, true);
  assert.ok(first.player.qi > 0);
  assert.ok(first.events.length >= 1);
  const again = await api('/api/act', { type: 'cultivate' });
  assert.equal(again.ok, false); // còn hồi chiêu 10 giây
  const tooHigh = await api('/api/act', { type: 'craft', itemId: 'orb' });
  assert.equal(tooHigh.ok, false); // Tinh Hà Châu cần cảnh giới cao hơn
  const bad = await api('/api/act', { type: 'gift', coins: 100000 });
  assert.equal(bad.ok, false); // web không tự cộng quà
  const checkin = await api('/api/act', { type: 'checkin' });
  assert.equal(checkin.ok, true);
  assert.equal(checkin.player.checkedInToday, true);
  assert.equal((await api('/api/act', { type: 'checkin' })).ok, false);
});

test('một nhân vật TikTok chỉ thuộc một tài khoản; người gõ mã sau cùng là chủ', async () => {
  const a = client(), b = client();
  await a('/api/register', { username: 'nguoia', password: '123456' });
  await b('/api/register', { username: 'nguoib', password: '123456' });
  completeLink((await a('/api/link/start', {})).code, { userId: '7002', name: 'X' });
  completeLink((await b('/api/link/start', {})).code, { userId: '7002', name: 'X' });
  assert.equal((await b('/api/me')).player.id, '7002');
  assert.equal((await a('/api/me')).status, 400); // a mất quyền điều khiển
  assert.ok(world.players['7002']);
});

test('POST không phải JSON bị chặn, công cụ thử chỉ cho máy chủ', async () => {
  const res = await fetch(base + '/api/login', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'username=a&password=b' });
  assert.equal(res.status, 400);
  const page = await fetch(base + '/');
  assert.equal(page.status, 200);
  assert.match(await page.text(), /VÂN HẢI TÔNG/);
  assert.equal((await fetch(base + '/manual.html')).status, 404); // không lộ trang quản trị LIVE
  assert.equal((await fetch(base + '/scene.js')).status, 200); // mượn bộ vẽ nhân vật
  assert.equal((await fetch(base + '/..%2f..%2fdata%2flive.json')).status, 404);
});

test('MỘT CHIỀU: hành động web không lọt lên LIVE, không làm nhân vật "có mặt" trên LIVE', async () => {
  const api = client();
  await api('/api/register', { username: 'motchieu', password: '123456' });
  completeLink((await api('/api/link/start', {})).code, { userId: '7001', name: 'Kiếm Khách' });
  const p = world.players['7001'];
  const eventsBefore = world.events.length, feedBefore = world.feed.length, lastActive = p.lastActive;
  p.cooldowns = {};
  const r = await api('/api/act', { type: 'cultivate' });
  assert.equal(r.ok, true);
  assert.ok(r.events.length >= 1);            // trình duyệt vẫn nhận hiệu ứng
  assert.equal(world.events.length, eventsBefore); // ký sự LIVE không đổi
  assert.equal(world.feed.length, feedBefore);
  assert.equal(p.lastActive, lastActive);      // không hiện lên sân khấu LIVE
});

test('nhân vật chỉ có trên web được đánh dấu webOnly và không có mặt trên LIVE', async () => {
  const api = client();
  await api('/api/register', { username: 'chiweb', password: '123456' });
  const made = await api('/api/character', { name: 'Chỉ Web', gender: 'nam' });
  const p = world.players[made.player.id];
  assert.equal(p.webOnly, true);
  assert.equal(p.lastActive, 0);
  assert.equal(world.events.some(e => e.user === p.id), false);
});

test('công cụ thử bị chặn khi truy cập qua tunnel/proxy', async () => {
  const res = await fetch(base + '/dev/players', { headers: { 'x-forwarded-for': '1.2.3.4' } });
  assert.equal(res.status, 403);
  const gz = await fetch(base + '/web.js', { headers: { 'accept-encoding': 'gzip' } });
  assert.equal(gz.status, 200);
});

test('một màn đăng nhập: kiểm tra tên → có tài khoản / có nhân vật LIVE trùng tên / chưa có', async () => {
  const api = client();
  const live = await api('/api/check', { name: 'kiem khach' }); // nhân vật 7001 "Kiếm Khách", đã được liên kết ở bài trước
  assert.equal(live.account, false);
  assert.equal(live.characters[0].realmName.length > 0, true);
  const none = await api('/api/check', { name: 'Người Lạ Mới' });
  assert.equal(none.account, false); assert.equal(none.characters.length, 0);
  const reg = await api('/api/register', { username: 'Người Lạ Mới', password: '123456' });
  assert.equal(reg.ok, true);
  assert.equal((await api('/api/check', { name: 'nguoi la moi' })).account, true); // không dấu vẫn là cùng tên
  const other = client();
  assert.equal((await other('/api/login', { username: 'NGƯỜI LẠ MỚI', password: '123456' })).ok, true);
});

test('quản trị: chỉ máy này xem hồ sơ người chơi, chỉ đọc; qua tunnel bị chặn', async () => {
  const blocked = await fetch(base + '/admin/players', { headers: { 'cf-connecting-ip': '1.2.3.4' } });
  assert.equal(blocked.status, 403);
  const list = await (await fetch(base + '/admin/players?q=kiem')).json();
  assert.ok(list.some(p => p.id === '7001'));
  const go = await fetch(base + '/admin/view?id=7001', { redirect: 'manual' });
  const cookie = go.headers.get('set-cookie').split(';')[0];
  const s = await (await fetch(base + '/api/session', { headers: { cookie } })).json();
  assert.equal(s.adminView.id, '7001'); assert.equal(s.player.realm, 3);
  const me = await (await fetch(base + '/api/me', { headers: { cookie } })).json();
  assert.equal(me.player.id, '7001');
  const act = await fetch(base + '/api/act', { method: 'POST', headers: { cookie, 'Content-Type': 'application/json' }, body: '{"type":"cultivate"}' });
  assert.equal(act.status, 403);
  const viaTunnel = await (await fetch(base + '/api/session', { headers: { cookie, 'cf-connecting-ip': '1.2.3.4' } })).json();
  assert.equal(viaTunnel.adminView, undefined);
});
