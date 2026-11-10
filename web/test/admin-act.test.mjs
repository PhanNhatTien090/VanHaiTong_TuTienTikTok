// Quản trị thao tác thay người chơi: chỉ tài khoản quản trị; người thường có cookie "xem" cũng không làm được gì.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createWebApp } from '../app.mjs';
import { createWorld, ensurePlayer } from '../../engine.mjs';

test('quản trị thao tác thay người chơi (qua tài khoản quản trị), khách thì không', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-admin-act-'));
  const world = createWorld('live');
  ensurePlayer(world, '7001', 'Đạo Hữu A', Date.now());
  world.players['7001'].gender = 'nam';
  const app = createWebApp({ world, dataDir: dir, profileOnly: false, publicOnly: true, trial: true, tikfinity: false });
  await new Promise(r => app.server.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + app.server.address().port;
  const client = () => {
    let cookie = '';
    return async (p, body) => {
      const res = await fetch(base + p, { method: body === undefined ? 'GET' : 'POST', redirect: 'manual', headers: { ...(cookie ? { cookie } : {}), ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) }, body: body === undefined ? undefined : JSON.stringify(body) });
      for (const c of res.headers.getSetCookie()) { const [kv] = c.split(';'); const k = kv.split('=')[0]; cookie = [...cookie.split('; ').filter(x => x && !x.startsWith(k + '=')), kv].join('; '); }
      const type = res.headers.get('content-type') || '';
      return { status: res.status, ...(type.includes('json') ? await res.json() : {}) };
    };
  };
  try {
    const boss = client(), guest = client();
    await boss('/api/register', { username: 'Tông chủ', password: 'matkhau123' });
    await guest('/api/register', { username: 'khach', password: 'matkhau123' });
    app.accounts.setAdmin('Tông chủ', true);
    // khách không vào được trang chọn người
    assert.equal((await guest('/api/quan-tri/view?id=7001')).status, 403);
    // quản trị chọn người rồi thao tác thay
    assert.equal((await boss('/api/quan-tri/view?id=7001')).status, 302);
    const s = await boss('/api/session');
    assert.equal(s.adminView.id, '7001'); assert.equal(s.adminView.acting, true); assert.equal(s.player.id, '7001');
    assert.equal((await boss('/api/act', { type: 'gender', gender: 'nu' })).ok, true);
    assert.equal(world.players['7001'].gender, 'nu');
    // bản thử khóa tu luyện với người thường, quản trị thì không bị khóa
    assert.notEqual((await boss('/api/act', { type: 'cultivate' })).trial, true);
    // thoát → về tài khoản của chính mình
    await boss('/api/quan-tri/view?id=');
    assert.equal((await boss('/api/session')).adminView, undefined);
  } finally { app.server.close(); }
});
