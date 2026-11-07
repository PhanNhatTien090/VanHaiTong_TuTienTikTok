import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { createWorld } from '../../engine.mjs';
import { digest, projectPlayer, validateBatch } from './protocol.mjs';

export function openCloudStore(dataDir) {
  fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 });
  const lock = path.join(dataDir, 'cloud.lock'), owner = crypto.randomUUID();
  // A JSON-backed in-memory account cache must never have a second writer.
  try { fs.writeFileSync(lock, JSON.stringify({ pid: process.pid, owner }), { flag: 'wx', mode: 0o600 }); }
  catch (e) {
    if (e.code !== 'EEXIST') throw e;
    const previous = JSON.parse(fs.readFileSync(lock, 'utf8'));
    let running = true; try { process.kill(previous.pid, 0); } catch (error) { if (error.code === 'ESRCH') running = false; }
    if (running) throw Error('Cloud store is already in use; do not run multiple replicas');
    fs.unlinkSync(lock);
    fs.writeFileSync(lock, JSON.stringify({ pid: process.pid, owner }), { flag: 'wx', mode: 0o600 });
  }
  let db;
  try {
    db = new DatabaseSync(path.join(dataDir, 'web.sqlite'));
    db.exec(`PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS players (id TEXT PRIMARY KEY, source TEXT NOT NULL, payload TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS batches (id TEXT PRIMARY KEY, agent TEXT NOT NULL, seq INTEGER NOT NULL, hash TEXT NOT NULL, created INTEGER NOT NULL);`);
  } catch (e) { if (JSON.parse(fs.readFileSync(lock, 'utf8')).owner === owner) fs.unlinkSync(lock); throw e; }
  const get = key => { const row = db.prepare('SELECT value FROM meta WHERE key=?').get(key); return row ? JSON.parse(row.value) : null; };
  let linkEvent = null;
  const put = (key, value) => db.prepare('INSERT INTO meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(key, JSON.stringify(value));
  function tx(fn) { db.exec('BEGIN IMMEDIATE'); try { const result = fn(); db.exec('COMMIT'); return result; } catch (e) { db.exec('ROLLBACK'); throw e; } }
  function loadWorld() {
    const world = Object.assign(createWorld('live'), get('world') || {});
    world.players = Object.fromEntries(db.prepare('SELECT id,payload FROM players').all().map(row => [row.id, JSON.parse(row.payload)]));
    return world;
  }
  function saveLocal(world, accounts) {
    tx(() => {
      if (accounts) put('accounts', accounts);
      if (accounts && linkEvent) put('link:'+linkEvent.eventId,{ok:true,playerId:String(linkEvent.userId)});
      const liveIds = new Set(db.prepare("SELECT id FROM players WHERE source='live'").all().map(row => row.id));
      const upsert = db.prepare("INSERT INTO players(id,source,payload) VALUES(?,'local',?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload WHERE players.source='local'");
      for (const p of Object.values(world.players)) if (!liveIds.has(p.id)) upsert.run(p.id, JSON.stringify(p));
    });
  }
  function apply(batch, now = Date.now()) {
    validateBatch(batch);
    const hash = digest(batch), previous = db.prepare('SELECT hash FROM batches WHERE id=?').get(batch.id);
    if (previous) { if (previous.hash !== hash) throw Error('Sync ID reused with different content'); return { duplicate: true, ...get('sync') }; }
    const state = get('sync');
    if (state && state.agentId !== batch.agentId) throw Error('A different agent is already paired');
    if (batch.seq !== (state?.seq || 0) + 1) throw Error('Sync sequence gap; retain the agent checkpoint and pending batch');
    if (!state && !batch.full) throw Error('First sync must be a full snapshot');
    return tx(() => {
      const upsert = db.prepare("INSERT INTO players(id,source,payload) VALUES(?,'live',?) ON CONFLICT(id) DO UPDATE SET source='live',payload=excluded.payload");
      for (const player of batch.players) { const p = projectPlayer(player); upsert.run(p.id, JSON.stringify(p)); }
      if (batch.full) {
        const ids = new Set(batch.players.map(p => p.id));
        for (const row of db.prepare("SELECT id FROM players WHERE source='live'").all()) if (!ids.has(row.id)) db.prepare('DELETE FROM players WHERE id=?').run(row.id);
      }
      for (const id of batch.deleted) db.prepare("DELETE FROM players WHERE id=? AND source='live'").run(id);
      const changed = batch.players.length>0 || batch.deleted.length>0 || digest(get('world'))!==digest(batch.meta);
      put('world', batch.meta);
      const next = { agentId: batch.agentId, seq: batch.seq, receivedAt: now, sourceAt: batch.sourceAt, profiles: db.prepare("SELECT count(*) AS n FROM players WHERE source='live'").get().n, changed };
      put('sync', next);
      db.prepare('INSERT INTO batches VALUES(?,?,?,?,?)').run(batch.id,batch.agentId,batch.seq,hash,now);
      db.prepare('DELETE FROM batches WHERE seq < ?').run(Math.max(0,batch.seq-1000));
      return next;
    });
  }
  function importAccounts(data, world) {
    if (get('accounts')) throw Error('Account import is one-time only; existing cloud accounts were preserved');
    if (!data?.users || !data.sessions || !data.links || !Number.isSafeInteger(data.nextId)) throw Error('Invalid account export');
    const ids = new Set(), accountIds = new Set();
    for (const [name, user] of Object.entries(data.users)) {
      if (user.username !== name || !/^[a-f0-9]{32}$/.test(user.salt) || !/^[a-f0-9]{128}$/.test(user.hash)) throw Error('Invalid account record');
      if (typeof user.id!=='string' || accountIds.has(user.id)) throw Error('Invalid or duplicate account ID');
      accountIds.add(user.id);
      if (user.playerId && (typeof user.playerId !== 'string' || ids.has(user.playerId))) throw Error('Invalid or duplicate player ownership');
      if (user.playerId) ids.add(user.playerId);
    }
    saveLocal(world, data);
  }
  function backup() {
    const dir = path.join(dataDir,'backups'); fs.mkdirSync(dir,{recursive:true,mode:0o700});
    const file = path.join(dir,'web-'+new Date().toISOString().replace(/[:.]/g,'-')+'-'+crypto.randomBytes(3).toString('hex')+'.sqlite');
    db.prepare('VACUUM INTO ?').run(file);
    for (const old of fs.readdirSync(dir).filter(f=>/^web-.*\.sqlite$/.test(f)).sort().slice(0,-48)) fs.unlinkSync(path.join(dir,old));
    return file;
  }
  return { db, get, put, loadWorld, saveLocal, apply, importAccounts, backup,
    withLinkEvent(event, fn) { linkEvent=event;try{return fn();}finally{linkEvent=null;} },
    close() { db.close(); if (fs.existsSync(lock) && JSON.parse(fs.readFileSync(lock,'utf8')).owner===owner) fs.unlinkSync(lock); }
  };
}
