import {profileDirectory,publicProfile} from './public-profiles.mjs';
// Lõi bản web Vân Hải Tông. Dùng chung cho:
//  - web/server.mjs : chạy thử trên bản sao dữ liệu (cổng riêng, không đụng LIVE);
//  - web/embed.mjs  : chạy CHUNG tiến trình với server LIVE, dùng chung thế giới LIVE (bật bằng VAN_HAI_WEB=1).
// Nguyên tắc: người chơi web thấy LIVE; người xem LIVE không thấy gì từ web (xem isolate.mjs).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { WebSocket } from 'ws';
import { snapshot, REALMS, normalize } from '../engine.mjs';
import { SPECIAL_SKINS } from '../public/patrons.js';
import { createAccountStore, parseLinkComment, normalizeUsername } from './accounts.mjs';
import { playerView, inventoryView, webRanking } from './game-view.mjs';
import { createDungeon, dungeonView, staminaView, BOSSES, towerView, towerRanking, ZONES } from './dungeon.mjs';
import { forgeView, enhance, petView, feedPet, choosePet, questView, claimQuest, bumpQuest, matsView } from './progress.mjs';
import { webAction, addPlayerQuietly } from './isolate.mjs';
import { jadeBalance, shopView, buy, takeExtraPills, retreatView, startRetreat, claimRetreat, mailView, claimMail, welcomeMail, giftView, claimGift } from './extras.mjs';
import { liveView } from './live-view.mjs';
import { createErrorLog } from './error-log.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(here, '..');

export function createWebApp({ world, dataDir, markDirty = () => {}, liveState = () => null, devTools = false, trustProxy = false, secureCookie = false, tikfinity = true, profileOnly = process.env.WEB_PROFILE_ONLY !== '0', trial = process.env.WEB_CLOUD_TRIAL === '1', accountStore = null, publicOnly = false, handleInternal = null, updates = null, playSessions = null, siteStatus = () => ({}), onChange = () => {}, limits = {}, errorLog = null }) {
  fs.mkdirSync(dataDir, { recursive: true });
  const accounts = accountStore || createAccountStore(path.join(dataDir, 'accounts.json'));
  const dungeon = createDungeon();
  const errors = errorLog || createErrorLog(dataDir);

  // snapshot() duyệt cả nghìn hồ sơ → dựng lại tối đa 3 giây một lần.
  let snapCache = null;
  const snap = (now = Date.now()) => {
    if (!snapCache || now - snapCache.at > 3000) snapCache = { at: now, value: snapshot(profileOnly?structuredClone(world):world, now) };
    return snapCache.value;
  };
  let liveCache = null;
  const live = (now = Date.now()) => {
    if (!liveCache || now - liveCache.at > 3000) liveCache = { at: now, value: liveView(liveState?.() || snap(now), now) };
    return liveCache.value;
  };
  const invalidate = () => { snapCache = null; liveCache = null; directoryCache.clear(); };
  const changed = () => { invalidate(); markDirty(); onChange(); };
  const directoryCache = new Map();

  // ---------- HTTP ----------
  function send(req, res, status, headers, body) {
    const gz = body.length > 1024 && /\bgzip\b/.test(req.headers['accept-encoding'] || '') && /json|javascript|css|html|svg/.test(headers['Content-Type'] || '');
    if (gz) { body = zlib.gzipSync(body); headers['Content-Encoding'] = 'gzip'; headers['Vary'] = 'Accept-Encoding'; }
    res.writeHead(status, { ...headers, 'Content-Length': body.length });
    res.end(body);
  }
  const json = (req, res, data, status = 200, headers = {}) => {
    if(req.playing){req.playing=false;invalidate();markDirty();}
    return send(req, res, status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers }, Buffer.from(JSON.stringify(data)));
  };
  const bodies=new WeakMap();
  async function readBody(req) {
    if(bodies.has(req))return bodies.get(req);
    const pending=parseBody(req);bodies.set(req,pending);return pending;
  }
  async function parseBody(req) {
    let text = '';
    for await (const part of req) { text += part; if (text.length > 8192) throw Error('Yêu cầu quá lớn.'); }
    return JSON.parse(text || '{}');
  }
  function cookies(req) {
    const out = {};
    for (const part of String(req.headers.cookie || '').split(';')) {
      const i = part.indexOf('=');
      if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
    }
    return out;
  }
  // Có HTTPS (qua Cloudflare/nginx) thì cookie chỉ đi qua HTTPS.
  const sessionCookie = (req, token, maxAgeSec) => `vh_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSec}${secureCookie || (trustProxy && req.headers['x-forwarded-proto'] === 'https') ? '; Secure' : ''}`;
  // Sau tunnel/proxy, địa chỉ kết nối là 127.0.0.1 → phải đọc IP thật từ header, và KHÔNG coi là "trên máy".
  const forwarded = req => req.headers['cf-connecting-ip'] || String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const clientIp = req => (trustProxy && forwarded(req)) || req.socket.remoteAddress;
  const isLocal = req => !forwarded(req) && ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress);

  const buckets = new Map();
  function limited(key, max, windowMs, now = Date.now()) {
    const b = buckets.get(key);
    if (!b || now - b.start > windowMs) { buckets.set(key, { start: now, n: 1 }); return false; }
    return ++b.n > max;
  }
  setInterval(() => { const now = Date.now(); for (const [k, b] of buckets) if (now - b.start > 120000) buckets.delete(k); }, 60000).unref();

  // ---------- Người chơi ----------
  const playerOf = user => (user?.playerId && Object.hasOwn(world.players, user.playerId) ? world.players[user.playerId] : null);
  function sessionPayload(user, now = Date.now()) {
    if (!user) return { user: null, devTools:profileOnly?false:devTools, readOnly:profileOnly };
    const p = playerOf(user);
    return { user: { username: user.username, linkedTikTok: !!p && !p.webOnly }, player: p ? playerView(world, p, now) : null, pendingLink: accounts.pendingLink(user, now), devTools:profileOnly?false:devTools, readOnly:profileOnly };
  }
  // Dữ liệu cho bộ vẽ nhân vật của LIVE: chỉ nhân vật của mình (+ người LIVE khi cần vẽ quảng trường).
  function sceneState(p, now = Date.now(), withLive = false) {
    const s = snap(now);
    const me = s.players.find(x => x.id === p.id);
    const others = withLive ? live(now).players.filter(x => x.id !== p.id) : [];
    return {
      ...s, players: [...(me ? [{ ...me, active: true }] : []), ...others.map(x => ({ ...x, active: true }))],
      feed: [], events: [], adminLog: undefined, socialStage: [], raceStage: [], raceStatus: null,
      socialStatus: s.socialStatus ? { ...s.socialStatus, tournament: null, ceremony: null } : null,
    };
  }

  const DIRECT = new Set(['cultivate', 'gather', 'checkin', 'learn', 'craft', 'brew', 'use', 'equip', 'breakthrough']);
  function skinCommand(id) {
    if (id === 'default') return 'skin macdinh';
    const s = SPECIAL_SKINS.find(x => x.id === id);
    return s ? 'skin ' + (s.aliases?.[0] || normalize(s.name)) : null;
  }
  function perform(p, body, now = Date.now()) {
    if(profileOnly)return {ok:false,message:'Tạm khóa phát triển nhân vật trên web.'};
    const type = String(body.type || '');
    let input;
    if (DIRECT.has(type)) input = { type, itemId: body.itemId ? String(body.itemId).slice(0, 60) : undefined };
    else if (type === 'skin') { const text = skinCommand(String(body.itemId || '')); if (!text) return { ok: false, message: 'Bộ áo không hợp lệ.' }; input = { type: 'chat', text }; }
    else if (type === 'gender') { const g = { nam: 'nam', nu: 'nu', an: 'an' }[body.gender]; if (!g) return { ok: false, message: 'Chọn nam, nữ hoặc ẩn.' }; input = { type: 'chat', text: 'gioitinh ' + g }; }
    else return { ok: false, message: 'Thao tác không hợp lệ.' };
    if (['learn', 'craft', 'brew', 'use', 'equip'].includes(type) && !input.itemId) return { ok: false, message: 'Chọn vật phẩm.' };
    const { result, events } = webAction(world, p, input, now);
    if (result.ok && type === 'cultivate') bumpQuest(p, 'cultivate', 1, now);
    changed();
    return { ...result, events };
  }

  // Liên kết: người chơi gõ "lienket MÃ" trong LIVE → ghép tài khoản web với ID TikTok đó.
  function completeLink(code, tiktok, now = Date.now()) {
    if (publicOnly) {
      const candidate = accounts.peekLink(code, now), id = String(tiktok.userId || '');
      if(playSessions&&candidate?.playerId&&candidate.playerId!==id&&!world.players[candidate.playerId]?.webOnly)return {ok:false,message:'Tài khoản đã liên kết nhân vật. Không đổi nhân vật trong phiên chơi.'};
      if (!candidate || !id || id.length > 128) return { ok: false, message: 'Mã không đúng hoặc đã hết hạn.' };
      const owner = accounts.userForPlayer(id);
      if (owner && owner !== candidate) return { ok: false, message: 'Nhân vật đã liên kết với tài khoản khác. Cần chủ game đối chiếu.' };
    }
    const user = accounts.consumeLink(code, now);
    if (!user) return { ok: false, message: 'Mã không đúng hoặc đã hết hạn.' };
    const userId = String(tiktok.userId);
    addPlayerQuietly(world, { userId, name: tiktok.name }, now);
    const previousOwner = accounts.userForPlayer(userId);
    if (previousOwner && previousOwner !== user) accounts.setPlayer(previousOwner, null);
    if (user.playerId && user.playerId !== userId) user.previousPlayerId = user.playerId; // giữ nhân vật web cũ, không xóa
    accounts.setPlayer(user, userId);
    user.linkedAt = now;
    accounts.save(); changed();
    console.log(`[web] Liên kết: ${user.username} ↔ ${tiktok.name || userId}`);
    return { ok: true, playerId: userId };
  }

  // Nghe bình luận "lienket" từ TikFinity (chỉ đọc, kết nối riêng, không ảnh hưởng LIVE).
  function connectBridge() {
    if (!tikfinity) return;
    const ws = new WebSocket(process.env.VAN_HAI_TIKFINITY_URL || 'ws://127.0.0.1:21213/');
    ws.on('message', raw => {
      try {
        const ev = JSON.parse(raw.toString());
        if (ev.event !== 'chat') return;
        const d = ev.data || {}, u = d.user || d;
        const code = parseLinkComment(d.comment), userId = u.userId || u.id || d.userId || d.uniqueId;
        if (code && userId) completeLink(code, { userId, name: u.nickname || u.uniqueId || d.nickname });
      } catch { /* bỏ qua gói lạ */ }
    });
    ws.on('error', () => {});
    ws.on('close', () => setTimeout(connectBridge, 10000).unref());
  }

  // ---------- File tĩnh (có 304 + gzip cho file chữ) ----------
  const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ico': 'image/x-icon', '.json': 'application/json' };
  const webPublic = path.join(here, 'public'), gamePublic = path.join(projectRoot, 'public');
  const LIBS = { '/lib/pixi.mjs': path.join(projectRoot, 'node_modules', 'pixi.js', 'dist', 'pixi.min.mjs') };
  const textCache = new Map();
  function serveFile(req, res, file, ext, cache) {
    const st = fs.statSync(file), mtime = st.mtime.toUTCString();
    if (req.headers['if-modified-since'] === mtime) { res.writeHead(304); res.end(); return; }
    const headers = { 'Content-Type': MIME[ext], 'Cache-Control': cache, 'Last-Modified': mtime };
    if (/^text|javascript|json|svg/.test(MIME[ext])) {
      const key = file + '|' + st.mtimeMs;
      let buf = textCache.get(key);
      if (!buf) { buf = fs.readFileSync(file); textCache.set(key, buf); if (textCache.size > 200) textCache.delete(textCache.keys().next().value); }
      return send(req, res, 200, headers, buf);
    }
    res.writeHead(200, { ...headers, 'Content-Length': st.size });
    fs.createReadStream(file).pipe(res);
  }
  function serveStatic(req, res, pathname) {
    if (LIBS[pathname]) return serveFile(req, res, LIBS[pathname], '.js', 'public, max-age=604800');
    let rel;
    try { rel = decodeURIComponent(pathname); } catch { rel = '/'; }
    if (rel === '/' || rel === '') rel = '/index.html';
    const ext = path.extname(rel).toLowerCase();
    // Giao diện web trước; mượn ảnh/âm thanh/code vẽ của LIVE (không mượn trang .html quản trị của LIVE).
    const roots = ext === '.html' ? [webPublic] : [webPublic, gamePublic];
    for (const root of roots) {
      const file = path.normalize(path.join(root, rel));
      if (!file.startsWith(root + path.sep) || !MIME[ext]) continue;
      if (fs.existsSync(file) && fs.statSync(file).isFile()) {
        const img = /\.(png|webp|jpg|mp3|wav)$/.test(ext);
        return serveFile(req, res, file, ext, img ? 'public, max-age=86400' : 'no-cache');
      }
    }
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Không tìm thấy');
  }

  // ---------- Định tuyến ----------
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://local');
    const ip = clientIp(req), now = Date.now();
    try {
      if (url.pathname.startsWith('/internal/')) {
        if (!handleInternal) return json(req, res, { ok: false }, 403);
        return await handleInternal(req, res, url);
      }
      if (url.pathname === '/healthz' && req.method === 'GET') return json(req, res, { ok: true, ...siteStatus() });
      if (publicOnly && (url.pathname.startsWith('/admin') || url.pathname.startsWith('/dev'))) return json(req, res, { ok: false, message: 'Không có quyền.' }, 403);
      if (!url.pathname.startsWith('/api/') && !url.pathname.startsWith('/dev/') && !url.pathname.startsWith('/admin/')) return serveStatic(req, res, url.pathname);
      if (req.method === 'POST' && !String(req.headers['content-type'] || '').startsWith('application/json')) return json(req, res, { ok: false, message: 'Yêu cầu không hợp lệ.' }, 400);
      if (limited('ip:' + ip, limits.requestsPerIp || 240, 60000, now)) return json(req, res, { ok: false, message: 'Quá nhiều yêu cầu, thử lại sau.' }, 429);
      if(playSessions&&req.method==='POST')req.playBody=await readBody(req);
      const token = cookies(req).vh_session, user = accounts.userForSession(token, now), route = req.method + ' ' + url.pathname;

      if(route==='GET /api/site-status')return json(req,res,{ok:true,mode:profileOnly?'profiles':'game',readOnly:profileOnly,trial:!profileOnly&&trial,loginRequired:true,updatedAt:now,...siteStatus()});
      // Lỗi phía trình duyệt người chơi (script hỏng, ảnh/âm thanh lỗi...). Giới hạn tần suất, cắt ngắn, không lưu IP.
      if(route==='POST /api/client-error'){
        if(limited('cerr:'+ip,20,60000,now))return json(req,res,{ok:false},429);
        const b=await readBody(req)||{};
        errors.record('client',{page:b.page,message:b.message,source:b.source,line:Number(b.line)||undefined,col:Number(b.col)||undefined,stack:b.stack,ua:b.ua,user:user?.username});
        return json(req,res,{ok:true});
      }
      if(route==='GET /api/updates') {
        if (!user) return json(req,res,{ok:false},401);
        if (!updates) return json(req,res,{ok:false},404);
        return updates.subscribe(req,res,user);
      }
      if(route==='GET /api/profiles') {
        const key=url.search, hit=directoryCache.get(key);
        let result=hit&&now-hit.at<10000?hit.value:null;
        if(!result){result=profileDirectory(world,{q:String(url.searchParams.get('q')||'').slice(0,80),sort:url.searchParams.get('sort'),page:url.searchParams.get('page')});directoryCache.set(key,{at:now,value:result});if(directoryCache.size>100)directoryCache.delete(directoryCache.keys().next().value);}
        return json(req,res,{...result,readOnly:profileOnly,updatedAt:now});
      }
      if(route==='GET /api/profile'){const p=publicProfile(world,String(url.searchParams.get('id')||''));return json(req,res,p?{profile:p,readOnly:profileOnly,updatedAt:now}:{ok:false,message:'Không tìm thấy hồ sơ.'},p?200:404);}
      // Keep the original authentication and TikTok-linking flow; only gameplay is paused.
      const accountRoutes=new Set(['POST /api/check','POST /api/register','POST /api/login','POST /api/logout','POST /api/link/start','POST /api/character']);
      if(profileOnly&&req.method!=='GET'&&!accountRoutes.has(route))return json(req,res,{ok:false,readOnly:true,message:'Tạm khóa tu luyện, bế quan và nhận thưởng trên web.'},403);
      // Bản thử (WEB_CLOUD_TRIAL=1): khóa mọi thứ tăng sức mạnh; chỉ cho đánh ải đầu tiên, đánh xong không nhận thưởng.
      if(trial&&req.method==='POST'&&!accountRoutes.has(route)&&route!=='POST /api/play/heartbeat'&&route!=='POST /api/dungeon/finish'){
        const b=await readBody(req)||{};
        if(!(route==='POST /api/dungeon/start'&&String(b.zone||'')===ZONES[0].id&&Number(b.stage)===1))return json(req,res,{ok:false,trial:true,message:'Bản web đang thử nghiệm: tạm khóa tu luyện, bế quan, nâng cấp và nhận thưởng. Hiện chỉ mở đánh thử ải đầu tiên.'},403);
      }

      // ----- Quản trị: CHỈ trên máy này (qua tunnel/proxy luôn bị chặn). Xem hồ sơ bất kỳ người chơi, chỉ đọc. -----
      const viewId = !publicOnly && isLocal(req) ? cookies(req).vh_view : null;
      const viewP = viewId && Object.hasOwn(world.players, viewId) ? world.players[viewId] : null;
      if (url.pathname.startsWith('/admin/')) {
        if (!isLocal(req)) return json(req, res, { ok: false, message: 'Không có quyền.' }, 403);
        if (route === 'GET /admin/players') {
          // Tìm "lỏng": bỏ dấu, chữ kiểu (𝑷𝒓𝒊𝒏𝒄𝒆), chữ đặc biệt (Ł→l, đ→d…), bỏ ký tự trang trí; tìm cả theo ID TikTok.
          const fold = t => String(t ?? '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
            .replace(/[łŀ]/g, 'l').replace(/đ/g, 'd').replace(/ø/g, 'o').replace(/æ/g, 'ae').replace(/ß/g, 'ss').replace(/[^\p{L}\p{N}]+/gu, '');
          const q = fold(url.searchParams.get('q') || ''), raw = String(url.searchParams.get('q') || '').trim();
          const list = Object.values(world.players).filter(p => !p.resident && !p.puppet && (!q || fold(p.name).includes(q) || p.id === raw))
            .sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0)).slice(0, q ? 200 : 100)
            .map(p => ({ id: p.id, name: p.name, realmName: REALMS[p.realm], totalQi: p.totalQi || 0, giftCoins: p.giftCoins || 0, lastActive: p.lastActive || 0, web: !!accounts.userForPlayer(p.id), webOnly: !!p.webOnly }));
          return json(req, res, list);
        }
        if (route === 'GET /admin/view') {
          const id = String(url.searchParams.get('id') || '');
          const ok = id && Object.hasOwn(world.players, id);
          res.writeHead(302, { Location: ok ? '/' : '/admin.html', 'Set-Cookie': `vh_view=${ok ? encodeURIComponent(id) : ''}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${ok ? 86400 : 0}` });
          return res.end();
        }
        return json(req, res, { ok: false, message: 'Không có.' }, 404);
      }
      if (route === 'GET /api/session' && viewP) return json(req, res, { user: { username: 'Quản trị · xem ' + viewP.name, linkedTikTok: !viewP.webOnly }, player: playerView(world, viewP, now), pendingLink: null, devTools: false, adminView: { id: viewP.id, name: viewP.name } });
      if(playSessions&&user&&playerOf(user)&&!['POST /api/logout','POST /api/login','POST /api/register','POST /api/check','POST /api/link/start'].includes(route)){
        const access=await playSessions.enter(user,token);
        if(!access.ok){errors.record('play-session',{route,user:user.username,message:access.code||access.message});return json(req,res,access,409);}
        if(!playSessions.allowed(user,token))return json(req,res,{ok:false,code:'PLAY_SESSION_CONFLICT',message:'Phiên chơi đang bàn giao. Thử lại sau.'},409);
        req.playing=true;
      }
      if(route==='POST /api/play/heartbeat')return json(req,res,{ok:!!user},user?200:401);
      if (route === 'GET /api/session') return json(req, res, sessionPayload(user, now));
      if (route === 'POST /api/check') {
        if (limited('check:' + ip, 30, 60000, now)) return json(req, res, { ok: false, message: 'Thử lại sau một phút.' }, 429);
        const b = await readBody(req), key = normalizeUsername(b.name);
        if (key.length < 2) return json(req, res, { ok: false, message: 'Tên cần ít nhất 2 chữ hoặc số.' }, 400);
        if (accounts.exists(key)) return json(req, res, { ok: true, account: true });
        // Nhân vật LIVE trùng tên (so không dấu). Chỉ hiện thông tin công khai trên LIVE; muốn lấy về vẫn phải xác nhận bằng "lienket".
        const characters = Object.values(world.players)
          .filter(p => !p.resident && !p.puppet && !p.webOnly && normalizeUsername(p.name) === key)
          .sort((a, b) => b.totalQi - a.totalQi).slice(0, 3)
          .map(p => ({ id: p.id, name: p.name, realmName: REALMS[p.realm], totalQi: p.totalQi || 0, avatar: /^https:\/\/[^"'<>\s]+$/.test(p.avatar || '') ? p.avatar : null, lastSeen: p.lastActive || 0, taken: !!accounts.userForPlayer(p.id) }));
        return json(req, res, { ok: true, account: false, characters });
      }
      if (route === 'POST /api/register' || route === 'POST /api/login') {
        if (limited('auth:' + ip, limits.authPerIp || 10, 60000, now)) return json(req, res, { ok: false, message: 'Thử lại sau một phút.' }, 429);
        const b = await readBody(req);
        const username = normalizeUsername(b.username);
        if (publicOnly && (buckets.get('auth-fail:' + username)?.n || 0) >= 8 && now - buckets.get('auth-fail:' + username).start < 60000) return json(req,res,{ok:false,message:'Thử lại sau một phút.'},429);
        const r = route === 'POST /api/register' ? await accounts.registerAsync(b.username, b.password, now) : await accounts.loginAsync(b.username, b.password);
        if (!r.ok && publicOnly) limited('auth-fail:' + username,8,60000,now);
        if (!r.ok) return json(req, res, r, 400);
        const t = accounts.createSession(r.user, now);
        if(playSessions){
          const access=await playSessions.enter(r.user,t);
          if(!access.ok){accounts.endSession(t);accounts.save();return json(req,res,access,409);}
        }
        accounts.save();
        return json(req, res, { ok: true, ...sessionPayload(r.user, now) }, 200, { 'Set-Cookie': sessionCookie(req, t, 30 * 24 * 3600) });
      }
      if (route === 'POST /api/logout') { playSessions?.logout(user,token); accounts.endSession(token); accounts.save(); return json(req, res, { ok: true }, 200, { 'Set-Cookie': sessionCookie(req, '', 0) }); }
      if (route === 'GET /api/live') {
        const l = live(now), b = l.event?.kind === 'boss' ? BOSSES[l.event.species] : null, me = playerOf(user);
        const event = l.event ? { ...l.event, atlas: b?.atlas, cell: b?.cell, won: !!me?.web?.eventsWon?.[l.event.id] } : null;
        return json(req, res, { online: l.online, feed: l.feed, event, players: l.players.map(p => ({ id: p.id, name: p.name, realmName: p.realmName })), updatedAt: l.updatedAt });
      }
      if (route === 'GET /api/ranking') {
        const s = snap(now);
        const sect = s.players.filter(p => !p.resident && !p.puppet && !p.webOnly).sort((a, b) => b.realm - a.realm || b.totalQi - a.totalQi).slice(0, 20).map(p => ({ id: p.id, name: p.name, realmName: p.realmName, realm: p.realm, totalQi: p.totalQi }));
        return json(req, res, { web: webRanking(world, accounts.users()), live: live(now).ranking, sect, tower: towerRanking(Object.values(world.players)) });
      }

      // ----- Công cụ thử: chỉ khi bật VÀ truy cập trực tiếp trên máy (không qua tunnel/proxy) -----
      if (url.pathname.startsWith('/dev/')) {
        if (!devTools || !isLocal(req)) return json(req, res, { ok: false, message: 'Không có quyền.' }, 403);
        if (route === 'GET /dev/players') {
          const q = normalize(url.searchParams.get('q') || '');
          const list = Object.values(world.players).filter(p => !p.resident && !p.puppet && !p.webOnly && (!q || normalize(p.name).includes(q)))
            .sort((a, b) => b.realm - a.realm || b.totalQi - a.totalQi).slice(0, 12)
            .map(p => ({ id: p.id, name: p.name, realmName: REALMS[p.realm], giftCoins: p.giftCoins || 0, artifacts: p.artifacts.length }));
          return json(req, res, list);
        }
        if (route === 'POST /dev/link') {
          const b = await readBody(req);
          const p = Object.hasOwn(world.players, String(b.userId)) ? world.players[String(b.userId)] : null;
          if (!p) return json(req, res, { ok: false, message: 'Không có nhân vật này.' }, 400);
          const r = completeLink(b.code, { userId: p.id, name: p.name }, now);
          return json(req, res, r, r.ok ? 200 : 400);
        }
        return json(req, res, { ok: false, message: 'Không có.' }, 404);
      }

      // ----- Cần đăng nhập (hoặc đang ở chế độ xem của quản trị) -----
      if (viewP && req.method !== 'GET') return json(req, res, { ok: false, message: 'Đang ở chế độ xem hồ sơ (quản trị): không thao tác thay người chơi.' }, 403);
      if (!user && !viewP) return json(req, res, { ok: false, message: 'Cần đăng nhập.' }, 401);
      if (viewP) {
        const p = profileOnly?structuredClone(viewP):viewP;
        switch (route) {
          case 'GET /api/me': return json(req, res, { player: playerView(world, p, now), inventory: inventoryView(world, p), stamina: staminaView(p, now), mats: matsView(p), quests: questView(p, now), jade: jadeBalance(p), mailUnread: 0, giftReady: false, retreat: retreatView(p, now), liveEvent: live(now).event, eventWon: !!p.web?.eventsWon?.[live(now).event?.id], serverNow: now });
          case 'GET /api/scene': return json(req, res, sceneState(p, now, url.searchParams.get('live') === '1'));
          case 'GET /api/dungeon': return json(req, res, { ...dungeonView(p, now), tower: towerView(p, now) });
          case 'GET /api/forge': return json(req, res, forgeView(p));
          case 'GET /api/pets': return json(req, res, petView(p));
          case 'GET /api/quests': return json(req, res, questView(p, now));
          case 'GET /api/shop': return json(req, res, shopView(p, now));
          case 'GET /api/retreat': return json(req, res, retreatView(p, now));
          case 'GET /api/mail': return json(req, res, mailView(p));
          case 'GET /api/gift': return json(req, res, giftView(p, now));
        }
        return json(req, res, { ok: false, message: 'Không có.' }, 404);
      }
      if (req.method === 'POST' && limited('act:' + user.username, 20, 5000, now)) return json(req, res, { ok: false, message: 'Thao tác quá nhanh.' }, 429);
      if (route === 'POST /api/link/start') { const link=accounts.startLink(user,now);accounts.save();return json(req,res,{ok:true,...link}); }
      if (route === 'POST /api/character') {
        if (playerOf(user)) return json(req, res, { ok: false, message: 'Tài khoản đã có nhân vật.' }, 400);
        const b = await readBody(req);
        const name = String(b.name || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 24);
        if (name.length < 2) return json(req, res, { ok: false, message: 'Đạo hiệu cần ít nhất 2 ký tự.' }, 400);
        const id = 'web-' + user.id;
        addPlayerQuietly(world, { userId: id, name, gender: { nam: 'nam', nu: 'nu' }[b.gender], webOnly: true }, now);
        accounts.setPlayer(user, id); accounts.save(); changed();
        return json(req, res, { ok: true, ...sessionPayload(user, now) });
      }
      const owner = playerOf(user);
      const p = owner&&(profileOnly?structuredClone(owner):owner);
      if (!p) return json(req, res, { ok: false, message: 'Chưa có nhân vật.' }, 400);
      if(!profileOnly)p.lastWebAt = now;
      if (!profileOnly&&!p.web?.welcomed) { (p.web ??= {}).welcomed = now; welcomeMail(p, now); changed(); }

      const body = req.method === 'POST' ? (playSessions ? req.playBody : await readBody(req)) : null;
      if(playSessions&&!playSessions.allowed(user,token))return json(req,res,{ok:false,code:'PLAY_SESSION_CONFLICT',message:'Phiên chơi đã kết thúc hoặc đang bàn giao. Đăng nhập lại để tiếp tục.'},409);
      const reply = (r, extra = {}) => json(req, res, { ...r, ...extra }, r.ok === false ? 400 : 200);
      switch (route) {
        case 'GET /api/me': return json(req, res, { player: playerView(world, p, now), inventory: inventoryView(world, p), stamina: staminaView(p, now), mats: matsView(p), quests: questView(p, now), jade: jadeBalance(p), mailUnread: mailView(p).unread, giftReady: !giftView(p, now).claimedToday, retreat: retreatView(p, now), liveEvent: live(now).event, eventWon: !!p.web?.eventsWon?.[live(now).event?.id], serverNow: now });
        case 'GET /api/scene': return json(req, res, sceneState(p, now, url.searchParams.get('live') === '1'));
        case 'GET /api/dungeon': return json(req, res, { ...dungeonView(p, now), tower: towerView(p, now) });
        case 'POST /api/tower/start': return reply(dungeon.startTower(world, p, now), { extraPills: p.web?.extraPills || 0 });
        case 'GET /api/forge': return json(req, res, forgeView(p));
        case 'POST /api/forge/enhance': { const r = enhance(p, String(body.itemId || '')); changed(); return reply(r, { forge: forgeView(p) }); }
        case 'GET /api/pets': return json(req, res, petView(p));
        case 'POST /api/pets/feed': { const r = feedPet(p, String(body.petId || '')); changed(); return reply(r, { pets: petView(p) }); }
        case 'POST /api/pets/choose': { const r = choosePet(p, String(body.petId || '')); changed(); return reply(r, { pets: petView(p) }); }
        case 'GET /api/quests': return json(req, res, questView(p, now));
        case 'POST /api/quests/claim': { const r = claimQuest(p, String(body.id || ''), now); changed(); return reply(r, { quests: questView(p, now) }); }
        case 'POST /api/dungeon/start': return reply(dungeon.start(world, p, String(body.zone || ''), Number(body.stage), now), { extraPills: p.web?.extraPills || 0 });
        case 'POST /api/event/start': {
          const ev = live(now).event;
          if (!ev || ev.id !== String(body.eventId || '')) return reply({ ok: false, message: 'Sự kiện LIVE đã kết thúc.' });
          return reply(dungeon.startEvent(world, p, ev, now), { extraPills: p.web?.extraPills || 0 });
        }
        case 'POST /api/dungeon/finish': { const r = dungeon.finish(world, p, body, now, { noReward: trial }); if (r.ok !== false) takeExtraPills(p, Math.trunc(Number(body.pillsUsed) || 0) - 3); changed(); return reply(r, { dungeon: dungeonView(p, now), player: playerView(world, p, now) }); }
        case 'POST /api/dungeon/sweep': { const r = dungeon.sweep(world, p, String(body.zone || ''), Number(body.stage), now); changed(); return reply(r, { dungeon: dungeonView(p, now), player: playerView(world, p, now) }); }
        // ----- Cửa hàng (Tiên Ngọc), Bế quan, Thư, Quà mỗi ngày -----
        case 'GET /api/shop': return json(req, res, shopView(p, now));
        case 'POST /api/shop/buy': { const r = buy(p, String(body.id || ''), now); changed(); return reply(r, { shop: shopView(p, now) }); }
        case 'GET /api/retreat': return json(req, res, retreatView(p, now));
        case 'POST /api/retreat/start': { const r = startRetreat(p, now); changed(); return reply(r, { retreat: retreatView(p, now) }); }
        case 'POST /api/retreat/claim': { const r = claimRetreat(world, p, now); changed(); return reply(r, { retreat: retreatView(p, now), player: playerView(world, p, now) }); }
        case 'GET /api/mail': return json(req, res, mailView(p));
        case 'POST /api/mail/claim': { const r = claimMail(p, String(body.id || ''), now); changed(); return reply(r, mailView(p)); }
        case 'GET /api/gift': return json(req, res, giftView(p, now));
        case 'POST /api/gift/claim': { const r = claimGift(p, now); changed(); return reply(r, { gift: giftView(p, now) }); }
        case 'POST /api/act': { const r = perform(p, body, now); return reply(r, { player: playerView(world, p, now), inventory: inventoryView(world, p) }); }
      }
      return json(req, res, { ok: false, message: 'Không có.' }, 404);
    } catch (e) {
      console.error('[web]', e);
      errors.record('server', { route: req.method + ' ' + url.pathname, message: e?.message || String(e), stack: e?.stack });
      if (!res.headersSent) json(req, res, { ok: false, message: 'Lỗi máy chủ.' }, 500);
    }
  });

  setInterval(() => accounts.cleanup(), 60000).unref();
  return { server, accounts, dungeon, completeLink, perform, connectBridge, invalidate, save: () => accounts.save(true) };
}
