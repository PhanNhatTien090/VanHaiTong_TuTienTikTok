// Lịch Luyện — màn chơi thử Giai đoạn 0. Chạy CÙNG bộ mô phỏng với server (/ll/core), chỉ thêm phần vẽ và nhập liệu.
// Vòng lặp: 30 nhịp/giây cố định → mỗi nhịp đọc nút → tick() → ghi đầu vào. Vẽ theo khung hình, không ảnh hưởng mô phỏng.
import { loadContent, t } from '/ll/content/index.js';
import { createBattle, tick, battleResult } from '/ll/core/sim/battle.mjs';
import { encodeInputs, TICK_RATE, BTN } from '/ll/core/sim/inputs.mjs';
import { quantizeStick, POS } from '/ll/core/fixed.mjs';

const content = loadContent();
const $ = id => document.getElementById(id);
const PATH_COLOR = { 'path.kiem-tu': '#6fd3ff', 'path.the-tu': '#ffae4a', 'path.phap-tu': '#ff6b8a' };
const show = id => { for (const s of document.querySelectorAll('.screen')) s.classList.toggle('on', s.id === id); };
const fmt = n => Number(n).toLocaleString('vi-VN');

async function api(path, body) {
  const res = await fetch('/api/ll/' + path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), credentials: 'same-origin' } : { credentials: 'same-origin' });
  const data = await res.json().catch(() => ({ ok: false, message: 'Máy chủ không phản hồi.' }));
  return { status: res.status, ...data };
}
function message(text) { $('messageText').textContent = text; show('message'); }

let state = null;
async function refresh() {
  const r = await api('state');
  if (r.status === 401) return message('Hãy đăng nhập ở trang chính Vân Hải Tông rồi quay lại.');
  if (!r.ok) return message(r.message || 'Lịch luyện chưa mở.');
  if (r.contentVersion !== content.version) { location.reload(); return; } // client cũ → tải lại cho khớp server
  state = r;
  if (!r.avatar) return renderCreate();
  renderHome();
}

// ── Tạo phân thân: chọn đạo lộ có hoạt cảnh xem trước (không đánh thử) ──
let chosen = null;
function renderCreate() {
  const box = $('paths'); box.innerHTML = '';
  for (const p of state.paths) {
    const el = document.createElement('div'); el.className = 'card path';
    el.innerHTML = `<canvas width="360" height="200"></canvas><b style="font-size:17px">${p.name}</b><div class="muted">${p.desc}</div><div style="font-size:13px;margin-top:6px">Võ kỹ: ${p.kit.attack.name}<br>Tuyệt kỹ: ${p.kit.special.name}<br>Thân pháp: ${p.kit.dash.name}</div><div class="muted">Nhánh: ${p.branches.join(' · ')}</div>`;
    el.onclick = () => { chosen = p.id; for (const x of box.children) x.classList.toggle('sel', x === el); $('createBtn').disabled = false; };
    box.append(el);
    previewLoop(el.querySelector('canvas'), p.id);
  }
  show('create');
}
// Xem trước: bot tự đánh ải mẫu bằng đúng bộ mô phỏng (chỉ để xem, không lưu gì).
function previewLoop(canvas, pathId) {
  const ctx = canvas.getContext('2d');
  let battle = null, frame = 0;
  const reset = () => { battle = createBattle(content, { seed: 'preview-' + pathId + (frame++), stageId: content.stages[0].id, player: { pathId, stats: { hp: 99999, mp: 400, atk: 40, def: 10, spd: 220, crit: 150, critDmg: 1600 } } }); };
  reset();
  let acc = 0, last = performance.now();
  (function loop(now) {
    if (!canvas.isConnected) return;
    acc += Math.min(100, now - last); last = now;
    while (acc >= 1000 / TICK_RATE) { acc -= 1000 / TICK_RATE; tick(content, battle, previewInput(battle)); if (battle.over || battle.tick > 360) reset(); }
    draw(ctx, canvas.width, canvas.height, battle, PATH_COLOR[pathId], true);
    requestAnimationFrame(loop);
  })(last);
}
function previewInput(b) {
  const p = b.player, foe = b.entities.find(e => e.alive && e.team === 'enemy');
  if (!foe) return { dir: -1, buttons: 0 };
  const dx = foe.x - p.x, dy = foe.y - p.y, d = Math.hypot(dx, dy) / POS;
  const ph = b.tick % 90;
  return { dir: d > 160 ? quantizeStick(dx / d / POS, dy / d / POS, 0) : -1, buttons: BTN.ATTACK | (ph === 30 ? BTN.SPECIAL : 0) | (ph === 70 ? BTN.DASH : 0) };
}
$('createBtn').onclick = async () => {
  $('createBtn').disabled = true;
  const r = await api('avatar', { pathId: chosen, name: $('avatarName').value });
  if (!r.ok) { $('createMsg').textContent = r.message; $('createBtn').disabled = false; return; }
  refresh();
};

// ── Trang phân thân ──
function renderHome() {
  const a = state.avatar;
  $('homeTitle').textContent = a.name + ' · ' + a.pathName;
  $('homeInfo').innerHTML = `<b>${a.label}</b> · tu vi ${fmt(a.qi)}/${fmt(a.qiNeed)}${a.gate && a.qi >= a.qiNeed ? ' · <span style="color:var(--gold)">đủ tu vi đột phá</span>' : ''}<br><span class="muted">Linh thạch ${fmt(a.balances['linh-thach'] || 0)} · Lực chiến ${fmt(a.power)}</span>`;
  $('qiBar').style.width = Math.min(100, a.qi * 100 / a.qiNeed) + '%';
  const s = a.stats;
  $('homeStats').innerHTML = [['Khí huyết', s.hp], ['Linh lực', s.mp], ['Công', s.atk], ['Thủ', s.def], ['Tốc', s.spd], ['Bạo kích', (s.crit / 10) + '%']].map(([k, v]) => `<div><span class="muted">${k}</span><br><b>${typeof v === 'number' ? fmt(v) : v}</b></div>`).join('');
  renderFates(a);
  renderBreakthrough(a);
  renderStages(a);
  renderInventory(a);
  show('home');
}
const stars = n => '★'.repeat(n) + '☆'.repeat(3 - n);
const RARITY = ['', '#b9b9b9', '#6fd36f', '#5aa9ff', '#c77dff', '#ffb347'];
function renderFates(a) {
  const owned = $('fateList');
  owned.innerHTML = a.fates.length ? a.fates.map(f => `<span class="fate" style="border-color:${RARITY[f.rarity]}" title="${f.effects.join(' · ')}"><b style="color:${RARITY[f.rarity]}">${f.name}</b> <span class="muted">${f.effects.join(' · ')}</span></span>`).join('') : '<span class="muted">Đột phá đại cảnh để nhận mệnh cách.</span>';
  if (a.qiGain) owned.insertAdjacentHTML('beforeend', `<div class="muted" style="margin-top:6px">Tu vi nhận thêm: +${a.qiGain / 10}%</div>`);
  const box = $('fatePick'), p = a.pendingFates;
  if (!p) { box.classList.remove('on'); return; }
  box.classList.add('on');
  box.querySelector('.title').textContent = `Viết lại vận mệnh · ${p.realmName}${p.left > 1 ? ` · còn ${p.left} lượt` : ''}`;
  const cards = box.querySelector('.cards'); cards.innerHTML = '';
  for (const f of p.offer) {
    const el = document.createElement('button'); el.className = 'fateCard'; el.style.borderColor = RARITY[f.rarity];
    el.innerHTML = `<div class="r" style="color:${RARITY[f.rarity]}">${'◆'.repeat(f.rarity)}</div><b style="color:${RARITY[f.rarity]}">${f.name}</b><div>${f.effects.join('<br>')}</div>`;
    el.onclick = async () => { for (const b of cards.children) b.disabled = true; const r = await api('fate', { fateId: f.id }); if (!r.ok) { say(r.message); for (const b of cards.children) b.disabled = false; return; } state.avatar = r.avatar; renderHome(); };
    cards.append(el);
  }
}
function renderBreakthrough(a) {
  const box = $('breakBox'), p = a.breakthrough;
  if (!p || p.gate !== 'breakthrough') { box.style.display = 'none'; return; }
  box.style.display = '';
  if (p.locked) { box.innerHTML = `<b>Đột phá ${p.realmName}</b><div class="muted">Cảnh giới này chưa mở trong mùa.</div>`; return; }
  const need = p.requires.map(x => `<span style="color:${x.count >= x.need ? 'var(--ok)' : 'var(--hp)'}">${x.name} ${x.count}/${x.need}</span>`).join(' · ');
  const boosts = p.boosts.map(x => `<span style="color:${x.count > 0 ? 'var(--ok)' : 'var(--muted)'}">${x.name}${x.count > 0 ? ' ✓' : ''}</span>`).join(' · ');
  const q = p.quality ? `<b style="color:var(--gold)">${p.realmName} ${p.quality.name}</b> · +${p.quality.points} điểm · ${p.quality.fatePicks} lượt mệnh cách` : '';
  const ladder = p.qualities.map(x => `${x.name}: ${x.materials} loại → +${x.points}`).join(' · ');
  box.innerHTML = `<b>Đột phá ${p.realmName}</b><div style="margin:6px 0">${p.qiReady ? '<span style="color:var(--ok)">Tu vi đã Viên Mãn</span>' : '<span class="muted">Cần tu vi Viên Mãn</span>'} · Bắt buộc: ${need}</div><div class="muted" style="font-size:13px">Nâng phẩm (mỗi loại có là +1 bậc): ${boosts}<br>${ladder}</div><div style="margin-top:6px">${q}</div>${p.trial ? `<div style="margin-top:6px">Thử thách: <b>${p.trial}</b> · sống sót 48 giây dưới 9 đạo thiên lôi. Thất bại mất 10% tu vi, giữ vật phẩm.${p.trialFails ? ` <span class="muted">(đã thất bại ${p.trialFails} lần)</span>` : ''}</div>` : ''}`;
  if (p.trialStage) { const go = document.createElement('button'); go.textContent = 'Độ ' + p.trial; go.disabled = !p.trialReady; go.style.marginTop = '8px'; go.onclick = () => startBattle(p.trialStage); box.append(go); return; }
  const bt = document.createElement('button'); bt.textContent = 'Đột phá'; bt.disabled = !p.canBreak; bt.style.marginTop = '8px';
  bt.onclick = async () => { bt.disabled = true; const r = await api('breakthrough', {}); if (!r.ok) { say(r.message); bt.disabled = false; return; } state.avatar = r.avatar; say(`Đột phá thành công: ${r.realmName} ${r.qualityName} · +${r.points} điểm thuộc tính`); renderHome(); };
  box.append(bt);
}
function renderStages(a) {
  const list = $('stageList'); list.innerHTML = '';
  $('sweepInfo').textContent = `Lượt quét hôm nay: ${a.stages.sweepsLeft}`;
  let lastMap = null;
  for (const st of a.stages.list) {
    if (st.mapId !== lastMap) { lastMap = st.mapId; const h = document.createElement('div'); h.className = 'mapHead'; h.textContent = st.map + (st.needRealm ? ' · cần ' + st.needRealm : ''); list.append(h); }
    const row = document.createElement('div'); row.className = 'stage' + (st.unlocked ? '' : ' locked');
    row.innerHTML = `<div><b>${st.level}. ${st.name}</b> <span style="color:var(--gold)">${stars(st.stars)}</span><div class="muted" style="font-size:12px">+${st.rewards.qi} tu vi · +${st.rewards.linhThach} linh thạch · rơi: ${st.drops.map(d => `<span style="color:${RARITY[d.rarity]}">${d.name}</span>`).join(', ')}</div></div><div class="acts"></div>`;
    const acts = row.querySelector('.acts');
    if (st.unlocked) { const go = document.createElement('button'); go.textContent = 'Vào ải'; go.onclick = () => startBattle(st.id); acts.append(go); }
    else { const lk = document.createElement('span'); lk.className = 'muted'; lk.textContent = '🔒'; acts.append(lk); }
    if (st.sweepable && a.stages.sweepsLeft > 0) { const sw = document.createElement('button'); sw.textContent = 'Quét'; sw.className = 'ghost'; sw.onclick = async () => { sw.disabled = true; const r = await api('battle/sweep', { stageId: st.id }); if (!r.ok) { say(r.message); sw.disabled = false; return; } state.avatar = r.avatar; showReward('Quét ' + st.name, r.reward); renderHome(); }; acts.append(sw); }
    list.append(row);
  }
}
function renderInventory(a) {
  const box = $('invList');
  box.innerHTML = a.inventory.length ? a.inventory.map(it => `<div class="item" title="${it.desc}"><span style="color:${RARITY[it.rarity]}">${it.name}</span><b>×${it.count}</b></div>`).join('') : '<span class="muted">Túi trống. Vượt ải để nhặt đồ.</span>';
}
// Thông báo nổi thay cho alert() (alert chặn trang, xấu trên điện thoại).
function say(msg) { const el = $('toast'); el.textContent = msg; el.classList.add('on'); clearTimeout(showReward.t); showReward.t = setTimeout(() => el.classList.remove('on'), 3500); }
function showReward(title, rw) {
  const drops = (rw.drops || []).map(d => `<span style="color:${RARITY[d.rarity]}">${d.name} ×${d.count}</span>`).join(', ');
  $('toast').innerHTML = `<b>${title}</b><br>+${fmt(rw.qi)} tu vi · +${fmt(rw.linhThach)} linh thạch${drops ? '<br>' + drops : ''}`;
  $('toast').classList.add('on'); clearTimeout(showReward.t); showReward.t = setTimeout(() => $('toast').classList.remove('on'), 3500);
}

// ── Nhập liệu ──
const held = { 1: false, 2: false, 4: false }, keys = new Set();
let stick = null; // {id, ox, oy, x, y}
addEventListener('keydown', e => { keys.add(e.code); if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault(); });
addEventListener('keyup', e => keys.delete(e.code));
for (const el of document.querySelectorAll('.btn')) {
  const bit = Number(el.dataset.btn);
  el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); held[bit] = true; el.classList.add('down'); el.setPointerCapture(e.pointerId); });
  const up = () => { held[bit] = false; el.classList.remove('down'); };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
}
const battleEl = $('battle');
battleEl.addEventListener('pointerdown', e => { if (e.clientX < innerWidth * 0.55 && !stick) { stick = { id: e.pointerId, ox: e.clientX, oy: e.clientY, x: e.clientX, y: e.clientY }; $('hint').style.display = 'none'; } });
battleEl.addEventListener('pointermove', e => { if (stick && e.pointerId === stick.id) { stick.x = e.clientX; stick.y = e.clientY; } });
const endStick = e => { if (stick && e.pointerId === stick.id) stick = null; };
battleEl.addEventListener('pointerup', endStick); battleEl.addEventListener('pointercancel', endStick);

function readInput() {
  let x = 0, y = 0;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) x--; if (keys.has('KeyD') || keys.has('ArrowRight')) x++;
  if (keys.has('KeyW') || keys.has('ArrowUp')) y--; if (keys.has('KeyS') || keys.has('ArrowDown')) y++;
  if (stick) { const dx = stick.x - stick.ox, dy = stick.y - stick.oy, len = Math.hypot(dx, dy); if (len > 12) { x = dx / Math.max(len, 50); y = dy / Math.max(len, 50); } }
  let buttons = 0;
  if (held[1] || keys.has('KeyJ')) buttons |= BTN.ATTACK;
  if (held[2] || keys.has('KeyK')) buttons |= BTN.SPECIAL;
  if (held[4] || keys.has('Space') || keys.has('KeyL')) buttons |= BTN.DASH;
  return { dir: quantizeStick(x, y), buttons };
}

// ── Trận ──
let run = null;
async function startBattle(stageId) {
  const r = await api('battle/start', { stageId });
  if (!r.ok) return say(r.message);
  const battle = createBattle(content, r.setup);
  run = { id: r.battleId, battle, frames: [], acc: 0, last: performance.now(), hp: new Map(), floats: [] };
  $('result').classList.remove('on'); $('hint').style.display = '';
  show('battle'); resize();
  requestAnimationFrame(loop);
}
function loop(now) {
  if (!run) return;
  const b = run.battle;
  run.acc += Math.min(250, now - run.last); run.last = now;
  while (run.acc >= 1000 / TICK_RATE && !b.over) {
    run.acc -= 1000 / TICK_RATE;
    const f = readInput(); run.frames.push(f); tick(content, b, f);
  }
  trackDamage(b);
  const cv = $('cv'); draw(cv.getContext('2d'), cv.width, cv.height, b, PATH_COLOR[b.player && state.avatar.pathId], false, run.floats);
  hud(b);
  if (b.over && !run.sent) { run.sent = true; finish(); }
  requestAnimationFrame(loop);
}
async function finish() {
  const b = run.battle, local = battleResult(b);
  $('resultTitle').textContent = local.victory ? 'Vượt ải!' : local.timeout ? 'Hết giờ' : 'Thất bại';
  $('resultStars').textContent = ''; $('resultText').textContent = 'Đang xác nhận với tông môn…'; $('result').classList.add('on');
  const r = await api('battle/finish', { battleId: run.id, inputs: encodeInputs(run.frames), hash: local.hash });
  if (!r.ok) { $('resultText').textContent = r.message || 'Không xác nhận được trận.'; return; }
  if (r.trial) {
    state.avatar = r.avatar;
    $('resultTitle').textContent = r.trial.passed ? 'Độ kiếp thành công!' : 'Độ kiếp thất bại';
    $('resultStars').textContent = r.trial.passed ? '⚡' : '';
    $('resultText').innerHTML = r.trial.passed ? `<b style="color:var(--gold)">${r.trial.realmName} ${r.trial.qualityName}</b><br>+${r.trial.points} điểm thuộc tính · ${r.trial.fatePicks} lượt mệnh cách<br>${r.avatar.label}` : `Mất ${fmt(r.trial.lostQi)} tu vi. Vật phẩm vẫn còn — tu luyện lại rồi độ kiếp lần nữa.`;
    return;
  }
  const rw = r.reward || {};
  $('resultStars').textContent = '★'.repeat(rw.stars || 0) + '☆'.repeat(3 - (rw.stars || 0));
  const drops = (rw.drops || []).map(d => `<span style="color:${RARITY[d.rarity]}">${d.name} ×${d.count}</span>`).join(', ');
  $('resultText').innerHTML = rw.stars ? `+${fmt(rw.qi)} tu vi · +${fmt(rw.linhThach)} linh thạch${drops ? '<br>Nhặt được: ' + drops : ''}${rw.firstClear ? '<br><span style="color:var(--gold)">Lần đầu vượt ải</span>' : ''}${rw.advanced ? `<br>Lên ${rw.advanced} tiểu cảnh → <b>${r.avatar.label}</b>` : ''}${rw.ready ? '<br><b style="color:var(--gold)">Đủ tu vi đột phá</b>' : ''}` : 'Không nhận thưởng. Luyện thêm rồi thử lại.';
  state.avatar = r.avatar;
}
$('resultBtn').onclick = () => { run = null; renderHome(); };

function hud(b) {
  const p = b.player;
  $('hpBar').style.width = (p.hp * 100 / p.maxHp) + '%';
  $('mpBar').style.width = (p.maxMp ? p.mp * 100 / p.maxMp : 0) + '%';
  const left = Math.max(0, Math.ceil((b.maxTicks - b.tick) / TICK_RATE));
  if (b.kind === 'trial') { const s = Math.max(0, Math.ceil((b.surviveTicks - b.tick) / TICK_RATE)); $('hudText').textContent = `Độ kiếp · còn ${s} giây`; }
  else $('hudText').textContent = `Đợt ${b.wave + 1} · ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
  const cd = { 1: 'attack', 2: 'special', 4: 'dash' };
  for (const el of document.querySelectorAll('.btn')) {
    const slot = cd[el.dataset.btn], skill = content.byId.get(p.skills[slot]), left = p.cds[slot] || 0;
    el.querySelector('.cd').style.setProperty('--p', (skill && left ? left * 100 / skill.cd : 0) + '%');
  }
}
function trackDamage(b) {
  for (const e of b.entities) {
    const prev = run.hp.get(e.id);
    if (prev !== undefined && e.hp < prev) run.floats.push({ x: e.x, y: e.y, v: prev - e.hp, t: 0, foe: e.team === 'enemy' });
    run.hp.set(e.id, e.hp);
  }
  for (const f of run.floats) f.t++;
  run.floats = run.floats.filter(f => f.t < 40);
}
function resize() { const cv = $('cv'), dpr = Math.min(2, devicePixelRatio || 1); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; }
addEventListener('resize', () => { if (run) resize(); });

// ── Vẽ (chỉ đọc trạng thái mô phỏng) ──
function draw(ctx, W, H, b, color, mini, floats = []) {
  const aw = b.w / POS, ah = b.h / POS;
  let sc = Math.min(W / aw, H / ah), ox = (W - aw * sc) / 2, oy = (H - ah * sc) / 2;
  if (mini) { // xem trước: phóng to theo nhân vật
    sc *= 2.4; const px0 = b.player.x / POS * sc, py0 = b.player.y / POS * sc;
    ox = Math.min(0, Math.max(W - aw * sc, W / 2 - px0)); oy = Math.min(0, Math.max(H - ah * sc, H / 2 - py0));
  }
  const X = v => ox + v / POS * sc, Y = v => oy + v / POS * sc, R = v => v / POS * sc;
  ctx.fillStyle = '#05070b'; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, Math.max(W, H) / 1.2);
  g.addColorStop(0, '#1d2a22'); g.addColorStop(1, '#0c120f');
  ctx.fillStyle = g; ctx.fillRect(ox, oy, aw * sc, ah * sc);
  ctx.strokeStyle = 'rgba(232,196,106,.25)'; ctx.lineWidth = 2; ctx.strokeRect(ox, oy, aw * sc, ah * sc);
  for (const z of b.hazards || []) { // vòng báo trước: càng sắp giáng càng đậm, vòng trong co lại
    const k = 1 - z.left / z.total;
    ctx.fillStyle = `rgba(150,170,255,${0.08 + 0.25 * k})`; ctx.strokeStyle = `rgba(190,205,255,${0.4 + 0.5 * k})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(X(z.x), Y(z.y), R(z.r), 0, 7); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(X(z.x), Y(z.y), Math.max(1, R(z.r) * (1 - k)), 0, 7); ctx.stroke();
  }
  for (const e of b.events) if (e.type === 'strike' && b.tick - e.t < 8) { // tia sét giáng: đường gấp khúc từ trên trời xuống + chớp sáng
    const a = 1 - (b.tick - e.t) / 8, x = X(e.x), y = Y(e.y);
    ctx.strokeStyle = `rgba(230,236,255,${a})`; ctx.lineWidth = 3; ctx.shadowColor = '#9fb4ff'; ctx.shadowBlur = 18;
    ctx.beginPath(); ctx.moveTo(x + ((e.x / 7) % 30) - 15, oy); for (let i = 1; i <= 6; i++) ctx.lineTo(x + (((e.x + i * 97) % 40) - 20) * (1 - i / 6), oy + (y - oy) * i / 6); ctx.stroke();
    ctx.fillStyle = `rgba(200,215,255,${0.35 * a})`; ctx.beginPath(); ctx.arc(x, y, R(e.r), 0, 7); ctx.fill(); ctx.shadowBlur = 0;
  }
  for (const z of b.zones) { ctx.fillStyle = 'rgba(255,120,60,.18)'; ctx.strokeStyle = 'rgba(255,150,80,.6)'; ctx.beginPath(); ctx.arc(X(z.x), Y(z.y), R(z.r), 0, 7); ctx.fill(); ctx.stroke(); }
  for (const e of b.entities) {
    if (!e.alive) continue;
    const isP = e.team === 'player', col = isP ? color : e.boss ? '#c9a24a' : e.ai === 'kite' ? '#7bd86b' : '#b58c6a';
    ctx.globalAlpha = e.invuln > 0 && isP ? .55 : 1;
    ctx.shadowColor = col; ctx.shadowBlur = isP ? 14 : e.boss ? 18 : 0;
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(e.x), Y(e.y), R(e.r), 0, 7); ctx.fill();
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    if (isP) { // viền trắng + vạch hướng nhìn: tách nhân vật khỏi kiếm khí cùng màu
      const [fx, fy] = [Math.cos(e.face * Math.PI / 32), Math.sin(e.face * Math.PI / 32)];
      ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(1.5, R(e.r) * .18); ctx.beginPath(); ctx.arc(X(e.x), Y(e.y), R(e.r), 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(e.x) + fx * R(e.r) * .4, Y(e.y) + fy * R(e.r) * .4); ctx.lineTo(X(e.x) + fx * R(e.r) * 1.6, Y(e.y) + fy * R(e.r) * 1.6); ctx.stroke();
    }
    if (e.stun > 0) { ctx.strokeStyle = '#fff59a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(e.x), Y(e.y), R(e.r) + 4, 0, 7); ctx.stroke(); }
    if (!isP || !mini) { const w = R(e.r) * 2.2; ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(X(e.x) - w / 2, Y(e.y) - R(e.r) - 10, w, 4); ctx.fillStyle = isP ? '#e05a5a' : '#f0d27a'; ctx.fillRect(X(e.x) - w / 2, Y(e.y) - R(e.r) - 10, w * e.hp / e.maxHp, 4); }
  }
  for (const s of b.shots) { // vệt bay theo hướng: đầu sáng, đuôi mờ
    const col = s.team === 'player' ? color : '#8fe36b', dx = Math.cos(s.dir * Math.PI / 32), dy = Math.sin(s.dir * Math.PI / 32), len = Math.max(8, R(s.r) * 3.2);
    const hx = X(s.x), hy = Y(s.y), tg = ctx.createLinearGradient(hx - dx * len, hy - dy * len, hx, hy);
    tg.addColorStop(0, 'rgba(255,255,255,0)'); tg.addColorStop(1, col);
    ctx.strokeStyle = tg; ctx.lineCap = 'round'; ctx.lineWidth = Math.max(2, R(s.r) * .9); ctx.shadowColor = col; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.moveTo(hx - dx * len, hy - dy * len); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(hx, hy, Math.max(1.5, R(s.r) * .35), 0, 7); ctx.fill(); ctx.shadowBlur = 0;
  }
  if (!mini) {
    ctx.font = `bold ${Math.max(12, 14 * sc)}px system-ui`; ctx.textAlign = 'center';
    for (const f of floats) { ctx.globalAlpha = 1 - f.t / 40; ctx.fillStyle = f.foe ? '#ffe28a' : '#ff6b6b'; ctx.fillText(String(f.v), X(f.x), Y(f.y) - 18 - f.t * 0.8); }
    ctx.globalAlpha = 1;
    if (stick) { ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 3; const dpr = W / innerWidth; ctx.beginPath(); ctx.arc(stick.ox * dpr, stick.oy * dpr, 50 * dpr, 0, 7); ctx.stroke(); ctx.fillStyle = 'rgba(232,196,106,.5)'; ctx.beginPath(); ctx.arc(stick.x * dpr, stick.y * dpr, 22 * dpr, 0, 7); ctx.fill(); }
  }
}

refresh();
