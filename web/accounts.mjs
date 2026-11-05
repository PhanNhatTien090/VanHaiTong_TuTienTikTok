// Tài khoản web: đăng ký/đăng nhập, phiên (cookie) và mã liên kết với nhân vật TikTok.
// Lưu ở một file JSON riêng, tách khỏi dữ liệu thế giới game.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const SESSION_MS = 30 * 24 * 3600 * 1000;
export const LINK_CODE_MS = 10 * 60 * 1000;
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // bỏ O/0/I/1 cho khỏi nhầm khi gõ trong chat

// Tên đăng nhập = tên người chơi tự gõ (có dấu, có dấu cách đều được). Khóa lưu là bản không dấu:
// "Nam nguyễn !" → "nam_nguyen".
export function normalizeUsername(s) {
  return String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase()
    .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 30);
}
export function validUsername(s) {
  return /^[a-z0-9_]{2,30}$/.test(s);
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return { salt, hash };
}
function checkPassword(password, salt, hash) {
  const test = crypto.scryptSync(String(password), salt, 64);
  const want = Buffer.from(hash, 'hex');
  return test.length === want.length && crypto.timingSafeEqual(test, want);
}
function newCode() {
  let s = '';
  for (const b of crypto.randomBytes(6)) s += CODE_ALPHABET[b % CODE_ALPHABET.length];
  return s;
}

export function createAccountStore(file) {
  let data = { users: {}, sessions: {}, links: {}, nextId: 1 };
  if (file && fs.existsSync(file)) data = { ...data, ...JSON.parse(fs.readFileSync(file, 'utf8')) };
  let dirty = false;

  function save(force = false) {
    if (!file || (!dirty && !force)) return;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data));
    fs.renameSync(tmp, file);
    dirty = false;
  }
  const touch = () => { dirty = true; };

  function register(usernameRaw, password, now = Date.now()) {
    const username = normalizeUsername(usernameRaw);
    if (!validUsername(username)) return { ok: false, message: 'Tên cần ít nhất 2 chữ hoặc số.' };
    if (String(password ?? '').length < 6) return { ok: false, message: 'Mật khẩu cần ít nhất 6 ký tự.' };
    if (data.users[username]) return { ok: false, message: 'Tên đăng nhập đã có người dùng.' };
    const { salt, hash } = hashPassword(password);
    const user = { id: 'u' + data.nextId++, username, displayName: String(usernameRaw).trim().slice(0, 30), salt, hash, playerId: null, createdAt: now };
    data.users[username] = user;
    touch();
    return { ok: true, user };
  }

  function exists(usernameRaw) { return !!data.users[normalizeUsername(usernameRaw)]; }
  function login(usernameRaw, password) {
    const user = data.users[normalizeUsername(usernameRaw)];
    if (!user || !checkPassword(password, user.salt, user.hash)) return { ok: false, message: 'Sai tên đăng nhập hoặc mật khẩu.' };
    return { ok: true, user };
  }

  function createSession(user, now = Date.now()) {
    const token = crypto.randomBytes(32).toString('hex');
    data.sessions[token] = { username: user.username, expiresAt: now + SESSION_MS };
    touch();
    return token;
  }
  function userForSession(token, now = Date.now()) {
    const s = token && Object.hasOwn(data.sessions, token) ? data.sessions[token] : null;
    if (!s) return null;
    if (s.expiresAt <= now) { delete data.sessions[token]; touch(); return null; }
    return data.users[s.username] || null;
  }
  function endSession(token) {
    if (token && Object.hasOwn(data.sessions, token)) { delete data.sessions[token]; touch(); }
  }

  function setPlayer(user, playerId) {
    user.playerId = playerId;
    touch();
  }
  function userForPlayer(playerId) {
    return Object.values(data.users).find(u => u.playerId === playerId) || null;
  }

  // Mã liên kết: web phát mã → người chơi gõ "lienket MÃ" trong bình luận LIVE → ghép tài khoản với ID TikTok.
  function startLink(user, now = Date.now()) {
    for (const [code, l] of Object.entries(data.links)) if (l.username === user.username || l.expiresAt <= now) delete data.links[code];
    let code;
    do code = newCode(); while (data.links[code]);
    data.links[code] = { username: user.username, expiresAt: now + LINK_CODE_MS };
    touch();
    return { code, expiresAt: now + LINK_CODE_MS };
  }
  function pendingLink(user, now = Date.now()) {
    const hit = Object.entries(data.links).find(([, l]) => l.username === user.username && l.expiresAt > now);
    return hit ? { code: hit[0], expiresAt: hit[1].expiresAt } : null;
  }
  // Trả về user nếu mã hợp lệ; mã chỉ dùng được một lần.
  function consumeLink(codeRaw, now = Date.now()) {
    const code = String(codeRaw ?? '').trim().toUpperCase();
    const l = Object.hasOwn(data.links, code) ? data.links[code] : null;
    if (!l) return null;
    delete data.links[code];
    touch();
    if (l.expiresAt <= now) return null;
    return data.users[l.username] || null;
  }

  function cleanup(now = Date.now()) {
    for (const [t, s] of Object.entries(data.sessions)) if (s.expiresAt <= now) { delete data.sessions[t]; touch(); }
    for (const [c, l] of Object.entries(data.links)) if (l.expiresAt <= now) { delete data.links[c]; touch(); }
  }

  return {
    register, login, exists, createSession, userForSession, endSession, setPlayer, userForPlayer,
    startLink, pendingLink, consumeLink, cleanup, save,
    users: () => Object.values(data.users),
  };
}

// Tách "lienket ABC123" (có dấu, viết hoa, có dấu cách lạ đều được) ra mã.
export function parseLinkComment(text) {
  const t = String(text ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').trim();
  const m = /^!?\s*lien\s*ket\s*[:#-]?\s*([A-Za-z0-9]{6})\b/i.exec(t);
  return m ? m[1].toUpperCase() : null;
}
