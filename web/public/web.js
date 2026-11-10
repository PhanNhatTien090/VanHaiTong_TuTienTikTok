// Vân Hải Tông — giao diện web. Mọi thao tác gọi server; server dùng đúng engine của LIVE.
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
import { createProfileBrowser } from '/profile-browser.js';
const profileBrowser=createProfileBrowser({api,toast,getMe:()=>me});
const accountPosts=new Set(['/api/check','/api/register','/api/login','/api/logout','/api/link/start','/api/character']);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = n => Number(n || 0).toLocaleString('vi-VN');
const pct = (a, b) => Math.max(0, Math.min(100, b ? (a / b) * 100 : 0));

let session = null;      // {user, player, pendingLink, devTools}
let me = null;           // {player, inventory, boss}
let scene = null;
let lastEventAt = Date.now();
let pollTimer = null;

// ---------- Gọi server ----------
async function api(path, body) {
  if(body!==undefined && session?.readOnly && !accountPosts.has(path))return {ok:false,status:403,readOnly:true,message:'Tạm khóa phát triển nhân vật trên web.'};
  const opts = body === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
  let res;
  try { res = await fetch(path, { cache: 'no-store', credentials: 'same-origin', ...opts }); }
  catch { return { ok: false, status: 0, message: 'Mất kết nối máy chủ, thử lại sau giây lát.' }; }
  let data = {};
  try { data = await res.json(); } catch {}
  if (!res.ok && data.ok === undefined) data.ok = false;
  data.status = res.status;
  if(data.code==='PLAY_SESSION_CONFLICT'&&session?.user){
    clearInterval(pollTimer);updateStream?.close();
    show('#authView');$('#authError').textContent=data.message;
  }
  return data;
}

function toast(text, bad = false) {
  const t = $('#toast');
  t.textContent = text;
  t.className = 'toast show' + (bad ? ' bad' : '');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { t.className = 'toast' + (bad ? ' bad' : ''); }, 2600);
}

function show(id) {
  for (const v of ['#authView', '#startView', '#linkView', '#gameView']) $(v).hidden = v !== id;
  if (id !== '#gameView') $('#profileSheet').hidden = true;
}

// ---------- Điều hướng theo phiên ----------
async function boot() {
  session = await api('/api/session');
  route();
  if(session.code==='PLAY_SESSION_CONFLICT')$('#authError').textContent=session.message;
}
function route() {
  clearInterval(pollTimer);
  if (session.adminView && !document.querySelector('#adminBar')) {
    const bar = document.createElement('div'); bar.id = 'adminBar';
    bar.innerHTML = `QUẢN TRỊ · đang xem hồ sơ <b>${esc(session.adminView.name)}</b> (chỉ xem) <a href="/admin.html">Đổi người</a> <a href="/admin/view?id=">Thoát</a>`;
    document.body.appendChild(bar);
  }
  if (session.admin && !session.adminView && !document.querySelector('#adminBar')) {
    const bar = document.createElement('div'); bar.id = 'adminBar';
    bar.innerHTML = `TÔNG CHỦ · quản trị <a href="/admin.html">Hồ sơ người chơi</a> <a href="/lich-luyen.html">Lịch luyện</a>`;
    document.body.appendChild(bar);
  }
  if (!session.user) return show('#authView');
  if (!session.player) {
    if (session.pendingLink) return openLink(session.pendingLink);
    return show('#startView');
  }
  show('#gameView');
  startGame();
}

// ---------- Đăng nhập: một màn. Nhập tên trước → máy tự biết đã có tài khoản / có nhân vật LIVE hay chưa ----------
const auth = { name: '', mode: 'login', characters: [], pick: null };
function authStep(step) { $('#nameStep').hidden = step !== 'name'; $('#passStep').hidden = step !== 'pass'; $('#authError').textContent = ''; }
async function checkName() {
  const name = $('#authForm').username.value.trim();
  if (name.length < 2) { $('#authError').textContent = 'Nhập tên của bạn (ít nhất 2 chữ).'; return; }
  $('#nameNext').disabled = true;
  const r = await api('/api/check', { name });
  $('#nameNext').disabled = false;
  if (!r.ok) { $('#authError').textContent = r.message || 'Không kiểm tra được, thử lại.'; return; }
  auth.name = name; auth.characters = r.characters || [];
  auth.mode = r.account ? 'login' : 'register';
  auth.pick = auth.characters.find(c => !c.taken)?.id || null;
  $('#whoName').textContent = name;
  renderWho();
  authStep('pass');
  const pw = $('#authForm').password;
  pw.value = ''; pw.autocomplete = r.account ? 'current-password' : 'new-password'; pw.focus();
}
function renderWho() {
  const box = $('#whoInfo');
  if (auth.mode === 'login') {
    box.innerHTML = '<div class="info-box back">Tên này <b>đã có tài khoản</b>. Nhập mật khẩu để vào game.<br><small>Không phải bạn mà chỉ trùng tên? Bấm <b>Đổi tên</b> và thêm chữ/số cho khác (vd: “Nam nguyễn 2”). Nhân vật TikTok vẫn nhận đúng nhờ bước gõ lienket.</small></div>';
    $('#passLabel').textContent = 'Mật khẩu'; $('#authSubmit').textContent = 'Đăng nhập';
    return;
  }
  $('#passLabel').textContent = 'Đặt mật khẩu mới (ít nhất 6 ký tự)';
  const free = auth.characters.filter(c => !c.taken);
  if (free.length) {
    const ago = t => { if (!t) return ''; const m = Math.round((Date.now() - t) / 60000); return m < 60 ? `${m} phút trước` : m < 1440 ? `${Math.round(m / 60)} giờ trước` : `${Math.round(m / 1440)} ngày trước`; };
    box.innerHTML = `<div class="info-box found">${free.length > 1 ? `Có <b>${free.length} người</b> trên LIVE trùng tên này. Chọn nhân vật của bạn (xem ảnh, cảnh giới, lần chơi gần nhất):` : 'Bạn <b>đã có nhân vật trên LIVE</b>:'}</div>
      <div class="char-pick">${free.map(c => `<button type="button" class="char-card ${c.id === auth.pick ? 'on' : ''}" data-pick="${esc(c.id)}">
        ${c.avatar ? `<img class="char-ava" src="${esc(c.avatar)}" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}
        <span><b>${esc(c.name)}</b><small>${esc(c.realmName)} · ${fmt(c.totalQi)} tu vi${c.lastSeen ? ' · chơi ' + ago(c.lastSeen) : ''}</small></span><i class="tick"></i></button>`).join('')}
        <button type="button" class="char-card ${auth.pick === null ? 'on' : ''}" data-pick=""><span><b>Không phải tôi</b><small>Tạo nhân vật mới tên “${esc(auth.name)}”</small></span><i class="tick"></i></button>
      </div>
      <div class="info-box back">${auth.pick ? 'Đặt mật khẩu → bước sau gõ <b>1 bình luận trong LIVE</b> để xác nhận. Lỡ chọn nhầm cũng không sao: game nhận đúng nhân vật của <b>tài khoản TikTok đã gõ bình luận</b>.' : 'Sẽ tạo nhân vật mới, bắt đầu từ Phàm Nhân.'}</div>`;
    $('#authSubmit').textContent = auth.pick ? 'Tạo tài khoản & nhận nhân vật' : 'Tạo tài khoản & nhân vật mới';
  } else {
    const taken = auth.characters.find(c => c.taken);
    box.innerHTML = (taken
      ? `<div class="info-box back">Nhân vật LIVE <b>${esc(taken.name)}</b> (${esc(taken.realmName)} · ${fmt(taken.totalQi)} tu vi) <b>đã được liên kết</b> với một tài khoản web khác. Nếu là bạn, hãy đăng nhập bằng tên đã đăng ký trước đó. Hoặc tạo nhân vật mới bên dưới.</div>`
      : `<div class="info-box none"><b>Chưa có nhân vật</b> tên này trên LIVE. Đặt mật khẩu để tạo nhân vật mới “${esc(auth.name)}” và vào game ngay.</div>`)
      + `
<div class="seg" role="radiogroup" aria-label="Xưng hô"><label><input type="radio" name="gender" value="nam" checked><span>Sư huynh</span></label><label><input type="radio" name="gender" value="nu"><span>Sư tỷ</span></label></div>`;
    $('#authSubmit').textContent = 'Tạo tài khoản & bắt đầu';
  }
}
$('#nameNext').onclick = checkName;
$('#authForm').username.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); checkName(); } });
$('#changeName').onclick = () => { authStep('name'); $('#authForm').username.focus(); };
$('#whoInfo').onclick = e => { const b = e.target.closest('[data-pick]'); if (!b) return; auth.pick = b.dataset.pick || null; renderWho(); };
$('#authForm').onsubmit = async e => {
  e.preventDefault();
  if ($('#passStep').hidden) return checkName(); // đang ở bước nhập tên
  const f = e.target, password = f.password.value;
  if (password.length < 6) { $('#authError').textContent = 'Mật khẩu cần ít nhất 6 ký tự.'; return; }
  $('#authSubmit').disabled = true;
  const r = await api('/api/' + auth.mode, { username: auth.name, password });
  if (!r.ok) { $('#authSubmit').disabled = false; $('#authError').textContent = r.message || 'Không thành công.'; return; }
  session = r;
  if (auth.mode === 'register' && !session.player) {
    if (auth.pick) {
      const l = await api('/api/link/start', {});
      $('#authSubmit').disabled = false;
      if (l.ok) return openLink(l);
    } else {
      const c = await api('/api/character', { name: auth.name, gender: f.querySelector('[name=gender]:checked')?.value || 'nam' });
      if (c.ok) session = c;
    }
  }
  $('#authSubmit').disabled = false;
  route();
};
for (const b of $$('[data-logout]')) b.onclick = async () => { await api('/api/logout', {}); location.reload(); };

// ---------- Chưa có nhân vật ----------
$('#chooseNew').onclick = () => { $('#newForm').hidden = false; $('#newForm').name.focus(); };
$('#chooseLink').onclick = async () => {
  const r = await api('/api/link/start', {});
  if (!r.ok) return toast(r.message, true);
  openLink(r);
};
$('#newForm').onsubmit = async e => {
  e.preventDefault();
  const f = e.target;
  const r = await api('/api/character', { name: f.name.value, gender: f.gender.value });
  if (!r.ok) { $('#newError').textContent = r.message; return; }
  session = r;
  route();
};

// ---------- Liên kết TikTok ----------
let linkInfo = null;
function openLink(info) {
  linkInfo = info;
  show('#linkView');
  $('#linkCode').textContent = info.code;
  $('#devBox').hidden = !session.devTools;
  const startPlayer = session.player?.id;
  clearInterval(pollTimer);
  pollTimer = setInterval(async () => {
    const left = Math.max(0, linkInfo.expiresAt - Date.now());
    $('#linkTimer').textContent = Math.floor(left / 60000) + ':' + String(Math.floor(left / 1000) % 60).padStart(2, '0');
    if (Date.now() % 3000 < 1000) {
      const s = await api('/api/session');
      if (s.player && s.player.id !== startPlayer) {
        session = s;
        toast('Đã nhận lại nhân vật ' + s.player.name + '!');
        route();
      }
    }
  }, 1000);
  if (session.devTools) devSearch();
}
$('#showPass').onchange = e => { $('#authForm').password.type = e.target.checked ? 'text' : 'password'; };
// Lần đầu mở web: mặc định tab Đăng ký cho người mới.
$('#copyCode').onclick = async () => {
  const text = 'lienket ' + $('#linkCode').textContent;
  try { await navigator.clipboard.writeText(text); toast('Đã sao chép: ' + text); } catch { toast('Hãy gõ: ' + text); }
};
$('#newCode').onclick = async () => { const r = await api('/api/link/start', {}); if (r.ok) openLink(r); };
$('#linkBack').onclick = () => { clearInterval(pollTimer); session.player ? (show('#gameView'), startGame()) : show('#startView'); };
$('#menuLinkBtn').onclick = async () => {
  if (!confirm('Liên kết xong, tài khoản sẽ chơi bằng nhân vật TikTok của bạn. Nhân vật web hiện tại được cất giữ, không bị xóa. Tiếp tục?')) return;
  $('#menu').close(); const r = await api('/api/link/start', {}); if (r.ok) openLink(r); };

let devTimer;
$('#devSearch').oninput = () => { clearTimeout(devTimer); devTimer = setTimeout(devSearch, 250); };
async function devSearch() {
  const list = await api('/dev/players?q=' + encodeURIComponent($('#devSearch').value));
  if (!Array.isArray(list)) return;
  $('#devList').innerHTML = list.map(p => `<li><button data-dev="${esc(p.id)}"><b>${esc(p.name)}</b> · ${esc(p.realmName)} · ${p.artifacts} pháp bảo · ${fmt(p.giftCoins)} coin quà</button></li>`).join('');
}
$('#devList').onclick = async e => {
  const b = e.target.closest('[data-dev]');
  if (!b || !linkInfo) return;
  const r = await api('/dev/link', { code: linkInfo.code, userId: b.dataset.dev });
  if (!r.ok) return toast(r.message, true);
  session = await api('/api/session');
  toast('Đã liên kết (giả lập).');
  route();
};

// ---------- Game ----------
let gameStarted = false, hub = null, updateStream=null, streamAt=0, refreshPromise=null;
async function startGame() {
  if (!gameStarted) {
    gameStarted = true;
    initHub();
  }
  await refresh();
  clearInterval(pollTimer);
  const status=await api('/api/site-status');
  updateStream?.close();updateStream=null;
  if(status.stream && typeof EventSource!=='undefined'){
    updateStream=new EventSource('/api/updates');
    let scheduled;
    updateStream.addEventListener('change',()=>{streamAt=Date.now();clearTimeout(scheduled);scheduled=setTimeout(()=>{refresh();refreshPlaza();refreshLiveFeed();refreshScene();},350);});
  }
  pollTimer = setInterval(()=>{if(!document.hidden && (!updateStream || Date.now()-streamAt>30000)){refresh();refreshPlaza();refreshLiveFeed();}},15000);
  document.body.classList.toggle('profile-only',!!session.readOnly);
  if(!$('#webStatus')){const status=document.createElement('div');status.id='webStatus';status.className='web-status';$('#gameView').appendChild(status);}
  $('#webStatus').textContent=session.readOnly?'Đang mở chế độ xem hồ sơ':'Đang chơi web · LIVE tạm khóa nhân vật. Đăng xuất để trở lại LIVE.';
}

// Trang chủ tông môn (PixiJS). Bấm công trình → mở đúng khu.
async function initHub() {
  try {
    const { createHub } = await import('/hub.js');
    hub = await createHub($('#hubCanvas'), { onBuilding: openBuilding });
    $('#hubLoading').classList.add('done');
    setTimeout(() => $('#hubLoading').remove(), 600);
    let seen = false; try { seen = localStorage.getItem('vh-pan-hint') === '1'; } catch {}
    if (!seen && innerWidth < innerHeight) {
      $('#panHint').hidden = false;
      const hide = () => { $('#panHint').hidden = true; try { localStorage.setItem('vh-pan-hint', '1'); } catch {} };
      setTimeout(hide, 5000); $('#hubCanvas').addEventListener('pointerdown', hide, { once: true });
    }
    startPlaza();
    setTimeout(startGuide, 1200);
  } catch (e) {
    console.error('Không dựng được trang chủ', e);
    $('#hubLoading')?.remove();
    toast('Trình duyệt không hỗ trợ WebGL, không vẽ được tông môn.', true);
  }
}
document.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (!b) return; sound.play?.('click'); openBuilding({ id: b.dataset.go }); });
function openBuilding(b) {
  switch (b.id) {
    case 'alchemy': case 'library': return openSheet('library');
    case 'forge': return panels.forge();
    case 'hall': return panels.hall();
    case 'events': return showEvents();
    case 'dungeon': return session?.readOnly?toast('Bí cảnh đang tạm khóa.'):openDungeon();
    case 'beasts': return panels.pets();
  }
}
// ---------- Quảng trường: nhân vật của mình + người đang chơi trên LIVE (một chiều) ----------
const PLAZA_SPOTS = [[836, 700], [722, 688], [950, 688], [640, 712], [1032, 712], [770, 726], [902, 726], [560, 690], [1112, 690]];
// Điện thoại dọc: màn hẹp chỉ thấy giữa quảng trường → 5 người, 2 hàng so le để bảng tên không đè nhau.
const PHONE_SPOTS = [[836, 728], [736, 648], [936, 648]]; // màn dọc chỉ thấy ~420 đơn vị ngang giữa quảng trường
const plazaSpots = () => (innerWidth < 600 ? PHONE_SPOTS : PLAZA_SPOTS);
const plaza = { shared: null, actors: new Map(), frame: 0, seen: new Set(), ticker: [], tickAt: 0 };
async function refreshPlaza() {
  if (!hub || !me?.player || $('#gameView').hidden) return;
  const st = await api('/api/scene?live=1');
  if (!st.players?.length) return;
  const { LiveActor } = await import('/live-actor.js');
  const spots = plazaSpots(), list = st.players.slice(0, spots.length), ids = list.map(p => p.id);
  if (!plaza.shared) { plaza.shared = new LiveActor(st, { resolution: 2.5, playerId: ids[0] }); plaza.actors.set(ids[0], plaza.shared); }
  else plaza.shared.scene.update(st, me.player.id);
  for (const [id] of plaza.actors) if (!ids.includes(id) && plaza.actors.get(id) !== plaza.shared) { hub.removeActor(id); plaza.actors.delete(id); }
  list.forEach((p, i) => {
    let a = plaza.actors.get(p.id);
    if (!a) { a = new LiveActor(st, { resolution: 2.5, shared: plaza.shared, playerId: p.id }); plaza.actors.set(p.id, a); }
    else a.setState(st, { update: false });
    const key = i + '|' + p.name + '|' + p.realm;
    if (a.placed !== key) {
      a.placed = key;
      const [x, y] = spots[i], mine = p.id === me.player.id;
      const shortName = innerWidth < 600 && [...p.name].length > 12 ? [...p.name].slice(0, 11).join('') + '…' : p.name;
      hub.addActor(p.id, a.texture, { x, y, unitPx: mine ? 1.3 : 1.05, res: a.res, anchor: a.anchor, name: shortName, live: !mine,
        onTap: () => mine ? openSheet('home') : profileBrowser.profile(p.id) });
    }
  });
}
async function refreshLiveFeed() {
  if ($('#gameView').hidden) return;
  const d = await api('/api/live');
  if (!d.feed) return;
  for (const f of [...d.feed].reverse()) {
    if (plaza.seen.has(f.id)) continue;
    plaza.seen.add(f.id);
    plaza.actors.get(f.user)?.replay(f); // người chơi LIVE vừa làm gì → nhân vật trên quảng trường làm theo
    plaza.ticker.unshift(f);
  }
  plaza.ticker = plaza.ticker.slice(0, 12);
  if (plaza.seen.size > 400) plaza.seen = new Set([...plaza.seen].slice(-200));
  $('#liveTicker').hidden = !plaza.ticker.length && !d.online;
  $('#liveOnline').textContent = d.online || 0;
}
function startPlaza() {
  refreshPlaza(); refreshLiveFeed();
  setInterval(()=>{if(!document.hidden && !updateStream)refreshPlaza();},30000);
  setInterval(()=>{if(!document.hidden && !updateStream)refreshLiveFeed();},30000);
  // Vẽ lần lượt: mỗi khung hình chỉ vẽ lại 1/3 số nhân vật để nhẹ máy.
  hub.onFrame(() => {
    const list = [...plaza.actors.values()];
    plaza.frame++;
    list.forEach((a, i) => { if ((plaza.frame + i) % 3 === 0) a.render(); });
    if (performance.now() - plaza.tickAt > 4500 && plaza.ticker.length) {
      plaza.tickAt = performance.now();
      const f = plaza.ticker[(plaza.tickIdx = ((plaza.tickIdx ?? -1) + 1) % plaza.ticker.length)];
      const el = $('#liveText'); el.classList.remove('in'); void el.offsetWidth;
      el.innerHTML = `<b>${esc(f.name)}</b> ${esc(f.text)}`; el.classList.add('in');
    }
  });
}
$('#liveTicker').onclick = () => panels.live();

// ---------- Hướng dẫn tân thủ (lần đầu vào) ----------
const GUIDE = [
  { title: 'Chào mừng đến Vân Hải Tông', text: 'Đây là tông môn của đạo hữu. Nhân vật ở giữa sân là đạo hữu; những người có chấm đỏ đang chơi trên LIVE.', building: null },
  { title: 'Bí Cảnh', text: 'Bấm Bí Cảnh để đánh boss bằng joystick và chiêu thức. Thắng được nguyên liệu, linh thạch và tu vi.', building: 'dungeon' },
  { title: 'Luyện Khí Các', text: 'Dùng nguyên liệu rơi từ bí cảnh để cường hóa pháp bảo, tăng sức mạnh khi đánh.', building: 'forge' },
  { title: 'Sự Kiện', text: 'Xem LIVE đang có gì. Khi LIVE mở boss, đạo hữu được đánh bản riêng trên web, thưởng gấp đôi.', building: 'events' },
  { title: 'Hòm thư có quà', text: 'Mở Thư (bên phải) để nhận quà nhập môn, rồi vào Bí Cảnh thử sức nhé!', building: null },
];
function startGuide() {
  if(session?.readOnly)return;
  if (session?.adminView) return;
  let done = false; try { done = localStorage.getItem('vh-guide') === 'done'; } catch {}
  if (done || !hub) return;
  let step = 0;
  $('#guide img').src = '/art/ui/avatar-' + (me?.player?.gender === 'nu' ? 'nu' : 'nam') + '.png';
  const show = () => {
    const g = GUIDE[step];
    $('#guideTitle').textContent = g.title; $('#guideText').textContent = g.text;
    $('#guideNext').textContent = step === GUIDE.length - 1 ? 'Bắt đầu' : 'Tiếp';
    hub.highlight(g.building); if (g.building) hub.focus(g.building);
    $('#guide').hidden = false;
  };
  const end = () => { $('#guide').hidden = true; hub.highlight(null); try { localStorage.setItem('vh-guide', 'done'); } catch {} };
  $('#guideNext').onclick = () => { if (++step >= GUIDE.length) { end(); panels.mail(); } else show(); };
  $('#guideSkip').onclick = end;
  show();
}

// ---------- Âm thanh (dùng lại bộ âm thanh LIVE) ----------
import { sound, music } from '/sound.js';
function updateSoundLabel() { const b = $('#soundBtn'); if (b) b.textContent = sound.on ? 'Âm thanh: Bật' : 'Âm thanh: Tắt'; }
$('#soundBtn').onclick = async () => { await sound.toggle(); updateSoundLabel(); };
updateSoundLabel();
$('#goDungeon').onclick = () => { closeSheet(); openDungeon(); };

// ---------- Bảng chức năng ----------
import { createPanels } from '/panels.js';
const panels = createPanels({ api, toast, refresh: () => refresh(), startEventBattle: id => startEventBattle(id), openRanking: () => openSheet('ranking') });
$('#questBtn').onclick = () => panels.quests();
$('#shopBtn').onclick = () => panels.shop();
$('#mailBtn').onclick = () => panels.mail();
$('#giftBtn').onclick = () => panels.gift();

// ---------- Bí cảnh ----------
const BOSS_POS = ['0% 40%', '50% 40%', '100% 40%'];
async function openDungeon(zoneId = openDungeon.zone) {
  const d = await api('/api/dungeon');
  if (!d.zones) return toast(d.message || 'Không mở được bí cảnh.', true);
  const z = d.zones.find(x => x.id === zoneId) || d.zones[0];
  const towerTab = zoneId === 'tower';
  $('#dpZones').innerHTML = d.zones.map(x => `<button class="${!towerTab && x.id === z.id ? 'active' : ''}" data-zone="${x.id}" ${x.locked ? 'title="Cần ' + x.minRealmName + ' và vượt hết vùng trước"' : ''}>${x.locked ? '🔒 ' : ''}${x.name}</button>`).join('')
    + `<button class="tower ${towerTab ? 'active' : ''}" data-zone="tower">🗼 Tháp Trấn Yêu</button>`;
  $('#dpStamina').textContent = `${d.stamina.stamina}/${d.stamina.max}`;
  if (towerTab) {
    const t = d.tower, pos = ['0%', '50%', '100%'][t.boss.cell];
    $('#dpZone').textContent = 'Tháp Trấn Yêu';
    $('#dpDaily').textContent = `Lượt hôm nay ${t.left}/${t.daily} · không tốn thể lực`;
    $('#dpStages').innerHTML = `<article class="dp-stage tower-card">
      <div class="dp-portrait" style="background-image:url(${t.boss.atlas});background-position:${pos} ${t.boss.atlas.includes('celestial') ? '22%' : '40%'}"></div>
      <div class="dp-info">
        <h3>Tầng ${t.next} · ${t.boss.name}</h3>
        <div class="meta">Cao nhất đã qua: <b>Tầng ${t.best}</b> · Sức mạnh khuyến nghị ${fmt(t.recPower)} · của bạn ${fmt(t.power)}</div>
        <div class="drops">${Object.keys(t.drops || {}).map(k => `<img src="/art/ui/mat-${k}.png" alt="">`).join('')}${t.next % 5 === 0 ? '<span class="tag gold">Tầng mốc: thưởng lớn</span>' : ''}</div>
        <div class="row"><button class="dp-fight" data-tower ${t.left ? '' : 'disabled'}>${t.left ? 'Leo tầng ' + t.next : 'Hết lượt hôm nay'}</button></div>
        <p class="meta">Mỗi tầng một boss LIVE, mạnh dần. Thua cũng tốn lượt. Xếp hạng tầng cao nhất ở Phong Vân Bảng.</p>
      </div></article>`;
    $('#dungeonPanel').hidden = false; openDungeon.zone = 'tower'; return;
  }
  if (z.locked) {
    $('#dpZone').textContent = 'Bí Cảnh · ' + z.name;
    $('#dpStages').innerHTML = `<p class="gp-note">Vùng này mở khi đạt <b>${z.minRealmName}</b> và vượt hết ải của vùng trước.</p>`;
    $('#dungeonPanel').hidden = false; openDungeon.zone = z.id; return;
  }
  $('#dpZone').textContent = 'Bí Cảnh · ' + z.name;
  $('#dpStamina').textContent = `${d.stamina.stamina}/${d.stamina.max}`;
  $('#dpDaily').textContent = `Tu vi bí cảnh hôm nay ${fmt(d.dailyQi)} / ${fmt(d.dailyQiCap)}`;
  $('#dpStages').innerHTML = z.stages.map((st, i) => `
    <article class="dp-stage ${st.unlocked ? '' : 'locked'}">
      <div class="dp-portrait" style="background-image:url(${st.atlas});background-position:${BOSS_POS[st.cell] || '0 0'}${st.atlas.includes('celestial') ? ';background-position-y:22%' : ''}"></div>
      <div class="dp-info">
        <h3>Ải ${st.stage} · ${st.name}</h3>
        <div class="drops">${Object.keys(st.drops || {}).map(k => `<img src="/art/ui/mat-${k}.png" alt="" title="Rơi ${k}">`).join('')}</div>
        <div class="stars">${'★'.repeat(st.stars)}${'☆'.repeat(3 - st.stars)}</div>
        <div class="meta">Sức mạnh khuyến nghị ${fmt(st.recPower)} · của bạn ${fmt(d.stats.power)} · ${st.cost} thể lực</div>
        <div class="row">
          <button class="dp-fight" data-fight="${st.stage}" ${st.unlocked ? '' : 'disabled'}>${st.unlocked ? 'Khiêu chiến' : 'Chưa mở'}</button>
          ${st.stars >= 3 ? `<button data-sweep="${st.stage}">Quét</button>` : ''}
        </div>
      </div>
    </article>`).join('');
  $('#dungeonPanel').hidden = false;
  openDungeon.zone = z.id;
}
$('#dungeonClose').onclick = () => { $('#dungeonPanel').hidden = true; };
$('#dpZones').onclick = e => { const b = e.target.closest('[data-zone]'); if (b) openDungeon(b.dataset.zone); };
async function startTower() {
  const r = await api('/api/tower/start', {});
  if (!r.ok) return toast(r.message, true);
  launchBattle(r, () => { hub?.resume(); openDungeon('tower'); }, () => startTower());
}
$('#dpStages').onclick = async e => {
  if (e.target.closest('[data-tower]')) return startTower();
  const f = e.target.closest('[data-fight]'), sw = e.target.closest('[data-sweep]');
  if (f) startBattle(openDungeon.zone, Number(f.dataset.fight));
  if (sw) {
    const r = await api('/api/dungeon/sweep', { zone: openDungeon.zone, stage: Number(sw.dataset.sweep) });
    if (!r.ok) return toast(r.message, true);
    toast(`Quét ải: +${fmt(r.reward.qi)} tu vi, +${fmt(r.reward.stones)} linh thạch, +${r.reward.herbs} linh thảo`);
    refresh(); openDungeon();
  }
};
async function startBattle(zone, stage) {
  const r = await api('/api/dungeon/start', { zone, stage });
  if (!r.ok) return toast(r.message, true);
  launchBattle(r, () => { hub?.resume(); openDungeon(); }, () => startBattle(zone, stage));
}
async function launchBattle(r, onBack, onAgain) {
  const sceneState = await api('/api/scene');
  $('#dungeonPanel').hidden = true; $('#gamePanel').hidden = true;
  hub?.pause(); music.battle();
  const { runBattle } = await import('/battle.js');
  runBattle($('#battleHost'), {
    info: r.info, stats: r.stats, sceneState, extraPills: r.extraPills || 0,
    onFinish: async ({ victory, hpLeft, pillsUsed }) => { const res = await api('/api/dungeon/finish', { battleId: r.battleId, victory, hpLeft, pillsUsed }); refresh(); return res; },
    onExit: choice => { music.hub(); if (choice === 'again' && onAgain) onAgain(); else onBack(); },
  });
}

// Sự Kiện: xem tình hình LIVE (một chiều) + đánh bản web của boss LIVE đang mở.
function showEvents() { panels.live(); }
async function startEventBattle(eventId) {
  const r = await api('/api/event/start', { eventId });
  if (!r.ok) return toast(r.message, true);
  launchBattle(r, () => { hub?.resume(); });
}
function openSheet(tab = 'home') {
  $('#profileSheet').hidden = false;
  $('#gameView').classList.add('sheet-open');
  hub?.pause();
  $(`[data-tab="${tab}"]`)?.click();
  if (!scene) initScene(); else refreshScene();
}
function closeSheet() {
  $('#profileSheet').hidden = true;
  $('#gameView').classList.remove('sheet-open');
  hub?.resume();
}
$('#sheetClose').onclick = closeSheet;
$('#avatarBtn').onclick = () => openSheet('home');
for (const b of $$('[data-open]')) b.onclick = () => openSheet(b.dataset.open);
for (const b of $$('[data-soon]')) b.onclick = () => toast(b.dataset.soon + ' sắp mở.');
$('#settingsBtn').onclick = () => $('#menu').showModal();
$('#eventBanner').onclick = () => { const ev = me?.liveEvent; if (ev?.kind === 'boss' && !me.eventWon) startEventBattle(ev.id); else showEvents(); };
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#profileSheet').hidden) closeSheet(); });

async function initScene() {
  try {
    const { Scene } = await import('/scene.js');
    scene = new Scene($('#stageCanvas'), () => {});
    scene.residents = false;
    scene.zoom = 1.7;
    scene.showNames = true;
    await refreshScene();
    setInterval(()=>{if(!document.hidden && !updateStream)refreshScene();},15000);
  } catch (e) {
    console.error('Không dựng được cảnh', e);
    $('#stageCanvas').replaceWith(Object.assign(document.createElement('div'), { className: 'muted small', style: 'padding:20px', textContent: 'Không tải được hình nhân vật.' }));
  }
}
async function refreshScene() {
  if (!scene || $('#profileSheet').hidden) return;
  const s = await api('/api/scene');
  if (!s.players) return;
  const id = s.players[0]?.id || null;
  scene.update(s, id);
  if (id) scene.focus(id, 6000, 1.5); // giữ máy quay trên nhân vật của mình
}

async function refresh() {
  if(refreshPromise)return refreshPromise;
  refreshPromise=(async()=>{
  const r = await api('/api/me?since=' + lastEventAt);
  if (r.status === 401) return location.reload();
  if (!r.player) return;
  me = r;

  render();
  if($('#webStatus')){const s=await api('/api/site-status');$('#webStatus').textContent=!s.readOnly?'Đang chơi web · LIVE tạm khóa nhân vật. Đăng xuất để trở lại LIVE.':s.cloud?(s.liveConnected?'Đang xem hồ sơ · LIVE đang kết nối':`Đang xem hồ sơ · ${s.lastSyncAt?'Cập nhật '+new Date(s.lastSyncAt).toLocaleTimeString('vi-VN'):'Đang chờ dữ liệu LIVE'}`):'Đang mở chế độ xem hồ sơ';}
  })();
  try{return await refreshPromise;}finally{refreshPromise=null;}
}

function playEvents(events) {
  for (const e of events) {
    lastEventAt = Math.max(lastEventAt, e.at);
    if (scene) {
      try { scene.noteEvent(e); scene.addEffect(e); if (e.user) scene.focus(e.user, 3500); } catch {}
    }
    addLog(e.text, e.user === me?.player?.id);
  }
}
function addLog(text, mine = true) {
  const li = document.createElement('li');
  li.textContent = text;
  li.className = mine ? 'mine' : '';
  $('#log').prepend(li);
  while ($('#log').children.length > 12) $('#log').lastChild.remove();
}

// Gửi thao tác. Kết quả trả về luôn kèm trạng thái mới để cập nhật ngay.
async function act(type, extra = {}) {
  const r = await api('/api/act', { type, ...extra });
  if (r.player) { me = { ...me, player: r.player, inventory: r.inventory }; render(); }
  if (!r.ok) { toast(r.message || 'Không thực hiện được.', true); return r; }
  if (r.events?.length) { playEvents(r.events); toast(r.events.at(-1).text); sound.sfx(type === 'breakthrough' ? 'breakthrough' : type === 'craft' ? 'sword' : type === 'learn' ? 'lotus' : 'qi'); }
  if (type === 'breakthrough' || type === 'skin' || type === 'equip' || type === 'craft') refreshScene();
  return r;
}

for (const b of $$('[data-act]')) b.onclick = () => act(b.dataset.act);

// ---------- Vẽ giao diện ----------
function render() {
  me.receivedAt = Date.now();
  const p = me.player, inv = me.inventory;
  $('#pName').textContent = p.name;
  $('#pRealm').textContent = p.realmName + (p.fromTikTok ? ' · TikTok' : '');
  $('#pVip').hidden = !p.vip;
  if (p.vip) $('#pVip').textContent = p.vip.name;
  $('#pStones').textContent = fmt(p.stones);
  $('#pHerbs').textContent = fmt(p.herbs);
  $('#pPower').textContent = fmt(p.power);

  $('#qiText').textContent = `${fmt(p.qi)} / ${fmt(p.neededQi)}`;
  $('#stoneText').textContent = `${fmt(p.stones)} / ${fmt(p.neededStones)}`;
  $('#qiBar').style.width = pct(p.qi, p.neededQi) + '%';
  $('#stoneBar').style.width = pct(p.stones, p.neededStones) + '%';
  $('#qiBar').parentElement.classList.toggle('ready', p.ready);
  $('#stoneBar').parentElement.classList.toggle('ready', p.ready);

  const bb = $('#breakBtn');
  bb.classList.toggle('ready', p.ready);
  $('#breakInfo').textContent = p.maxRealm ? 'Đã đạt cảnh giới cao nhất'
    : !p.finalRealmEligible ? 'Tiên Đế cần tổng quà từ 100 coin'
    : p.ready ? `Đủ điều kiện lên ${p.nextRealmName}!`
    : `Lên ${p.nextRealmName}: còn ${fmt(Math.max(0, p.neededQi - p.qi))} tu vi, ${fmt(Math.max(0, p.neededStones - p.stones))} linh thạch`;

  const buff = $('#buffChip');
  buff.hidden = !p.buff;
  if (p.buff) buff.textContent = `Phúc duyên ×${String(p.buff.mult).replace('.', ',')} · ${Math.ceil((p.buff.until - Date.now()) / 60000)} phút`;

  $('[data-act="checkin"]').disabled = p.checkedInToday;
  $('[data-act="checkin"] small').textContent = p.checkedInToday ? 'Đã điểm danh hôm nay' : '+25 tu vi, +20 thạch, +3 thảo';

  renderPills(inv.pills);
  renderArtifacts(inv.artifacts);
  renderLibrary(inv);
  renderWardrobe(inv.skins);
  updateMenu();
  renderHud(p);
}

// Thanh trên cùng của trang chủ.
function renderHud(p) {
  $('#avatarImg').src = '/art/ui/avatar-' + (p.gender === 'nu' ? 'nu' : 'nam') + '.png';
  $('#hudName').textContent = p.name;
  $('#hudRealm').textContent = p.realmName;
  $('#hudVip').hidden = !p.vip;
  if (p.vip) $('#hudVip').textContent = p.vip.name;
  $('#hudStones').textContent = fmt(p.stones);
  if (me.stamina) $("#hudStamina").textContent = innerWidth < 600 ? String(me.stamina.stamina) : `${me.stamina.stamina}/${me.stamina.max}`;
  $('#hudJade').textContent = fmt(me.jade || 0);
  $('#mailDot').hidden = !me.mailUnread;
  $('#giftDot').hidden = !me.giftReady;
  if (me.quests) $('#questDot').hidden = !me.quests.quests.some(q => q.done && !q.claimed) && !(me.quests.bonus.ready && !me.quests.bonus.claimed);
  $('#hudHerbs').textContent = fmt(p.herbs);
  $('#hudPower').textContent = fmt(p.power);
  $('#hudQi').style.width = pct(p.qi, p.neededQi) + '%';
  $('#hudQi').parentElement.classList.toggle('ready', p.ready);
  // Dải sự kiện: lấy từ LIVE (một chiều). Boss LIVE → có bản web để khiêu chiến.
  const ev = me.liveEvent;
  $('#eventBanner').hidden = !ev;
  if (ev) {
    const left = Math.max(0, Math.ceil((ev.endsAt - Date.now()) / 1000));
    $('#eventBanner').textContent = ev.kind === 'boss'
      ? (me.eventWon ? `✔ Đã hạ ${ev.name} bản web` : `⚔ LIVE: ${ev.name} giáng thế · Khiêu chiến bản web · ${left}s`)
      : `● LIVE đang có: ${ev.name}`;
    $('#eventBanner').classList.toggle('calm', ev.kind !== 'boss' || me.eventWon);
  }
}

// Thanh hồi chiêu: tính từ thời điểm nhận dữ liệu, chạy mượt bằng requestAnimationFrame.
const CD_TOTAL = { cultivate: 10000, gather: 30000 };
function cooldownLoop() {
  if (me?.player) {
    const age = Date.now() - (me.receivedAt || Date.now());
    for (const [key, total] of Object.entries(CD_TOTAL)) {
      const left = Math.max(0, (me.player.cooldowns[key] || 0) - age);
      const btn = $(`[data-act="${key}"]`);
      btn.querySelector('.cd').style.width = (left / total) * 100 + '%';
      if (key !== 'attack') btn.disabled = !!session?.readOnly || left > 0;
    }
  }
  requestAnimationFrame(cooldownLoop);
}
requestAnimationFrame(cooldownLoop);

function renderPills(pills) {
  const owned = pills.filter(x => x.count > 0);
  $('#pillQuick').innerHTML = owned.map(x => `<button data-use="${esc(x.id)}">Dùng ${esc(x.name)} (${x.count})</button>`).join('');
}
$('#pillQuick').onclick = e => { const b = e.target.closest('[data-use]'); if (b) act('use', { itemId: b.dataset.use }); };

function statTags(x) {
  const t = [];
  if (x.damage) t.push(`<span class="tag good">+${x.damage} sát thương</span>`);
  if (x.bonus) t.push(`<span class="tag good">+${Math.round(x.bonus * 100)}% tu vi</span>`);
  if (x.qi) t.push(`<span class="tag good">+${fmt(x.qi)} tu vi</span>`);
  return t.join('');
}
function costTags(x) {
  if (x.exclusive) return `<span class="tag gold">${esc(x.source)}</span>`;
  return `<span class="tag">${fmt(x.price)} linh thạch</span>${x.herbs ? `<span class="tag">${fmt(x.herbs)} linh thảo</span>` : ''}<span class="tag">${esc(x.realmName)}</span>`;
}

let artifactFilter = 'all';
$('#artifactFilter').onclick = e => {
  const b = e.target.closest('[data-f]');
  if (!b) return;
  artifactFilter = b.dataset.f;
  for (const x of $$('#artifactFilter button')) x.classList.toggle('active', x === b);
  renderArtifacts(me.inventory.artifacts);
};
function renderArtifacts(list) {
  const shown = list.filter(x => artifactFilter === 'all' || (artifactFilter === 'owned' && x.owned) || (artifactFilter === 'craft' && !x.exclusive) || (artifactFilter === 'special' && x.exclusive))
    .sort((a, b) => b.equipped - a.equipped || b.owned - a.owned || a.exclusive - b.exclusive || a.tier - b.tier);
  $('#artifactList').innerHTML = shown.map(x => {
    let btn = '';
    if (x.equipped) btn = '<button disabled>Đang trang bị</button>';
    else if (x.owned) btn = `<button data-equip="${esc(x.id)}">Trang bị</button>`;
    else if (!x.exclusive) btn = `<button data-craft="${esc(x.id)}" ${x.locked || !x.affordable ? 'disabled' : ''}>${x.locked ? 'Cần ' + esc(x.realmName) : 'Rèn'}</button>`;
    return `<article class="item ${x.owned ? 'owned' : ''} ${x.equipped ? 'equipped' : ''} ${!x.owned && x.locked ? 'locked' : ''}">
      <h3>${esc(x.name)}</h3><p>${esc(x.description)}</p>
      <div class="meta">${statTags(x)}</div>
      ${x.owned ? '' : `<div class="meta">${costTags(x)}</div>`}
      ${btn}</article>`;
  }).join('') || '<p class="muted">Chưa có pháp bảo nào ở mục này.</p>';
}
$('#artifactList').onclick = e => {
  const eq = e.target.closest('[data-equip]'), cr = e.target.closest('[data-craft]');
  if (eq) act('equip', { itemId: eq.dataset.equip });
  if (cr) act('craft', { itemId: cr.dataset.craft });
};

function renderLibrary(inv) {
  $('#manualList').innerHTML = inv.manuals.map(x => `<article class="item ${x.owned ? 'owned' : ''} ${!x.owned && x.locked ? 'locked' : ''}">
    <h3>${esc(x.name)}</h3><p>${esc(x.description)}</p><div class="meta">${statTags(x)}</div>
    ${x.owned ? '<button disabled>Đã lĩnh ngộ</button>' : `<div class="meta">${costTags(x)}</div><button data-learn="${esc(x.id)}" ${x.locked || !x.affordable ? 'disabled' : ''}>${x.locked ? 'Cần ' + esc(x.realmName) : 'Lĩnh ngộ'}</button>`}
  </article>`).join('');
  $('#pillList').innerHTML = inv.pills.map(x => `<article class="item ${!x.affordable || x.locked ? '' : 'owned'}">
    <h3>${esc(x.name)} ${x.count ? `<small class="muted">· có ${x.count}</small>` : ''}</h3><p>${esc(x.description)}</p>
    <div class="meta">${costTags(x)}</div>
    <button data-brew="${esc(x.id)}" ${x.locked || !x.affordable ? 'disabled' : ''}>${x.locked ? 'Cần ' + esc(x.realmName) : 'Luyện đan'}</button>
    ${x.count ? `<button data-use="${esc(x.id)}">Dùng</button>` : ''}
  </article>`).join('');
}
$('#manualList').onclick = e => { const b = e.target.closest('[data-learn]'); if (b) act('learn', { itemId: b.dataset.learn }); };
$('#pillList').onclick = e => {
  const br = e.target.closest('[data-brew]'), us = e.target.closest('[data-use]');
  if (br) act('brew', { itemId: br.dataset.brew });
  if (us) act('use', { itemId: us.dataset.use });
};

function renderWardrobe(s) {
  const cards = [`<article class="item ${!s.current ? 'equipped' : ''}"><div class="swatch" style="background:linear-gradient(135deg,#6aaf9f,#e0cf9c)"></div><h3>Áo cảnh giới</h3><p>Áo đổi theo cảnh giới tu luyện.</p>${!s.current ? '<button disabled>Đang mặc</button>' : '<button data-skin="default">Mặc</button>'}</article>`];
  for (const k of s.special) {
    cards.push(`<article class="item ${k.owned ? 'owned' : 'locked'} ${s.current === k.id ? 'equipped' : ''}">
      <div class="swatch" style="background:linear-gradient(135deg,${esc(k.robe)},${esc(k.color)})"></div>
      <h3>${esc(k.name)}</h3><p>${esc(k.vfx)}</p>
      ${s.current === k.id ? '<button disabled>Đang mặc</button>' : k.owned ? `<button data-skin="${esc(k.id)}">Mặc</button>` : '<button disabled>Chưa sở hữu</button>'}
    </article>`);
  }
  $('#skinList').innerHTML = cards.join('');
  $('#tierList').innerHTML = s.giftTiers.map(t => `<div class="${t.unlocked ? 'on' : ''}"><span>${esc(t.name)} · <small class="muted">${esc(t.vfx)}</small></span><b>${t.min ? fmt(t.min) + ' coin' : 'Mặc định'}</b></div>`).join('');
}
$('#skinList').onclick = e => { const b = e.target.closest('[data-skin]'); if (b) act('skin', { itemId: b.dataset.skin }); };

// ---------- Xếp hạng ----------
let rankMode = 'web';
$('#rankFilter').onclick = e => {
  const b = e.target.closest('[data-r]');
  if (!b) return;
  rankMode = b.dataset.r;
  for (const x of $$('#rankFilter button')) x.classList.toggle('active', x === b);
  loadRanking();
};
async function loadRanking() {
  const r = await api('/api/ranking');
  const rows = r[rankMode] || [];
  $('#rankList').innerHTML = rows.map(x => `<li class="${x.id === me?.player?.id ? 'me' : ''}"><button ${String(x.id).startsWith('web-')?'disabled':`data-public-profile="${esc(x.id)}"`}><span>${esc(x.name)}</span><small>${esc(x.realmName)} · ${x.floor ? 'Tầng ' + x.floor : fmt(x.totalQi) + ' tu vi'}</small></button></li>`).join('') || '<p class="muted">Chưa có ai.</p>';
}

// ---------- Tab & menu ----------
for (const b of $$('[data-tab]')) b.onclick = () => {
  for (const x of $$('[data-tab]')) x.classList.toggle('active', x === b);
  for (const p of $$('[data-panel]')) p.classList.toggle('active', p.dataset.panel === b.dataset.tab);
  if (b.dataset.tab === 'ranking') loadRanking();
};
$('#menuBtn').onclick = () => $('#menu').showModal();
function updateMenu() {
  $('#menuUser').textContent = 'Tài khoản: ' + session.user.username;
  const linked = me.player.fromTikTok;
  $('#menuLink').textContent = linked ? 'Đã liên kết với nhân vật TikTok.' : 'Nhân vật web. Liên kết TikTok để quà tặng trên LIVE cộng vào nhân vật này.';
  $('#menuLinkBtn').hidden = linked;
}

$('#profilesBtn').onclick=()=>profileBrowser.directory();
$('#myRelations').onclick=()=>me?.player?.fromTikTok?profileBrowser.profile(me.player.id):profileBrowser.directory();
const lockButtons=()=>{if(!session?.readOnly)return;for(const button of $$('[data-act],[data-use],[data-equip],[data-craft],[data-learn],[data-brew],[data-skin],[data-buy],[data-mail],[data-gift],[data-retreat],[data-enhance],[data-feed],[data-choose],[data-claim],[data-event],#goDungeon')){button.disabled=true;button.title='Tạm khóa phát triển nhân vật trên web';}};
new MutationObserver(lockButtons).observe($('#profileSheet'),{childList:true,subtree:true});
new MutationObserver(lockButtons).observe($('#gpBody'),{childList:true,subtree:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden && me?.player){refresh();refreshPlaza();refreshLiveFeed();}});
boot();

// Closing/hiding the tab lets the exclusive play session time out safely.
setInterval(()=>{if(session?.user&&!session.readOnly&&!document.hidden)api('/api/play/heartbeat',{});},30000);
