// Lịch luyện — cơ sở dữ liệu riêng (file lich-luyen.sqlite cạnh dữ liệu web, KHÔNG dùng chung file web.sqlite:
// tách hẳn để lỗi ở game mới không bao giờ chạm tài khoản/hồ sơ LIVE).
// Migration đánh số, chạy tuần tự trong transaction; có migration mới thì SAO LƯU file trước. Không sửa migration đã chạy.
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export const MIGRATIONS = [
  { id: 1, name: 'init', sql: `
    CREATE TABLE ll_avatars (
      id TEXT PRIMARY KEY, account_id TEXT NOT NULL UNIQUE, live_player_id TEXT, name TEXT NOT NULL,
      path_id TEXT NOT NULL, step INTEGER NOT NULL DEFAULT 0, qi INTEGER NOT NULL DEFAULT 0, power INTEGER NOT NULL DEFAULT 0,
      season INTEGER NOT NULL DEFAULT 1, payload TEXT NOT NULL DEFAULT '{}', version INTEGER NOT NULL DEFAULT 1,
      created INTEGER NOT NULL, updated INTEGER NOT NULL);
    CREATE INDEX ll_avatars_power ON ll_avatars(season, power DESC);
    CREATE TABLE ll_balances (avatar_id TEXT NOT NULL, currency TEXT NOT NULL, amount INTEGER NOT NULL, PRIMARY KEY (avatar_id, currency));
    CREATE TABLE ll_ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT, avatar_id TEXT NOT NULL, currency TEXT NOT NULL, delta INTEGER NOT NULL,
      balance_after INTEGER NOT NULL, reason TEXT NOT NULL, ref TEXT, at INTEGER NOT NULL);
    CREATE INDEX ll_ledger_avatar ON ll_ledger(avatar_id, at);
    CREATE TABLE ll_battles (
      id TEXT PRIMARY KEY, avatar_id TEXT NOT NULL, stage_id TEXT NOT NULL, seed TEXT NOT NULL, content_version TEXT NOT NULL,
      setup TEXT NOT NULL, status TEXT NOT NULL, started INTEGER NOT NULL, finished INTEGER,
      inputs TEXT, result TEXT, mismatch INTEGER NOT NULL DEFAULT 0);
    CREATE INDEX ll_battles_avatar ON ll_battles(avatar_id, started);
  ` },
  { id: 2, name: 'inventory', sql: `
    CREATE TABLE ll_stacks (avatar_id TEXT NOT NULL, item_id TEXT NOT NULL, count INTEGER NOT NULL CHECK (count >= 0), PRIMARY KEY (avatar_id, item_id));
  ` },
];

export function openDb(file, { now = Date.now(), migrations = MIGRATIONS } = {}) {
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  const existed = fs.existsSync(file);
  const db = new DatabaseSync(file);
  db.exec('PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON;');
  db.exec('CREATE TABLE IF NOT EXISTS ll_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)');
  const current = Number(db.prepare("SELECT value FROM ll_meta WHERE key='schema'").get()?.value || 0);
  const pending = migrations.filter(m => m.id > current).sort((a, b) => a.id - b.id);
  if (pending.length && existed && current > 0) {
    db.exec('PRAGMA wal_checkpoint(TRUNCATE)');
    const dir = path.join(path.dirname(file), 'backups');
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    fs.copyFileSync(file, path.join(dir, `lich-luyen-v${current}-${new Date(now).toISOString().replace(/[:.]/g, '-')}.sqlite`));
  }
  for (const m of pending) {
    tx(db, () => { db.exec(m.sql); db.prepare("INSERT INTO ll_meta(key,value) VALUES('schema',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(String(m.id)); });
  }
  return db;
}

export function tx(db, fn) {
  db.exec('BEGIN IMMEDIATE');
  try { const r = fn(); db.exec('COMMIT'); return r; }
  catch (e) { db.exec('ROLLBACK'); throw e; }
}

export const schemaVersion = db => Number(db.prepare("SELECT value FROM ll_meta WHERE key='schema'").get()?.value || 0);
