// Lịch luyện — gom và KIỂM TRA toàn bộ nội dung. Sai một chỗ là ném lỗi: server không chạy, test đỏ.
// Chạy được cả trình duyệt lẫn Node (không import node:*).
import realms, { REALM_CURVE } from './realms.js';
import paths from './paths.js';
import roots from './roots.js';
import skills from './skills.js';
import monsters from './monsters.js';
import stages from './stages.js';
import vi from './text/vi.js';

const ID = /^[a-z]+(\.[a-z0-9]+(-[a-z0-9]+)*)+$/;
const STAGE_KINDS = new Set(['pham-nhan', 'tang', 'ky']);

// JSON ổn định (khóa sắp xếp) → băm FNV-1a 64-bit (BigInt) → contentVersion. Giống nhau ở mọi môi trường.
export function stableJson(value) {
  if (Array.isArray(value)) return '[' + value.map(stableJson).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + stableJson(value[k])).join(',') + '}';
  return JSON.stringify(value);
}
export function fnv64(text) {
  let h = 0xcbf29ce484222325n; const P = 0x100000001b3n, M = (1n << 64n) - 1n;
  for (const ch of String(text)) { const c = ch.codePointAt(0); h ^= BigInt(c); h = (h * P) & M; }
  return h.toString(16).padStart(16, '0');
}

function deepFreeze(x) { if (x && typeof x === 'object' && !Object.isFrozen(x)) { Object.freeze(x); for (const v of Object.values(x)) deepFreeze(v); } return x; }

export function validateContent(c, text = vi) {
  const errors = [];
  const err = (where, msg) => errors.push(where + ': ' + msg);
  const seen = new Set();
  const checkId = (where, id) => { if (typeof id !== 'string' || !ID.test(id)) err(where, `ID không hợp lệ "${id}"`); else if (seen.has(id)) err(where, `ID trùng "${id}"`); else seen.add(id); };
  const checkText = (where, key) => { if (!Object.hasOwn(text, key)) err(where, `thiếu chữ cho khóa "${key}"`); };
  const nonNegInt = (where, name, v) => { if (!Number.isSafeInteger(v) || v < 0) err(where, `${name} phải là số nguyên ≥ 0 (đang là ${v})`); };

  // Cảnh giới
  if (!c.realms.length) err('realms', 'rỗng');
  c.realms.forEach((r, i) => {
    const w = `realm[${i}] ${r.id}`;
    checkId(w, r.id); checkText(w, r.nameKey);
    if (!STAGE_KINDS.has(r.stages)) err(w, `stages lạ "${r.stages}"`);
    if (i === 0 && r.stages !== 'pham-nhan') err(w, 'cảnh giới đầu phải là pham-nhan');
    if (i > 0 && r.stages === 'pham-nhan') err(w, 'chỉ cảnh giới đầu được là pham-nhan');
    if (r.openSeason !== null && (!Number.isSafeInteger(r.openSeason) || r.openSeason < 1)) err(w, 'openSeason phải ≥ 1 hoặc null');
    if (i > 0) {
      const prev = c.realms[i - 1].openSeason;
      if (r.openSeason !== null && (prev === null || r.openSeason < prev)) err(w, 'openSeason không được sớm hơn cảnh giới trước');
      if (!Array.isArray(r.qualities) || !r.qualities.length) err(w, 'cần ít nhất một phẩm đột phá');
    }
    let last = null;
    for (const [qi, q] of (r.qualities || []).entries()) {
      const qw = `${w} quality[${qi}]`;
      checkText(qw, q.nameKey);
      for (const k of ['materials', 'points', 'fatePicks']) nonNegInt(qw, k, q[k]);
      if (last && (q.materials < last.materials || q.points < last.points || q.fatePicks < last.fatePicks)) err(qw, 'phẩm cao hơn không được cần ít hơn hoặc thưởng ít hơn phẩm trước');
      last = q;
    }
    if (r.trial !== null) checkText(w, r.trial);
    if (r.curve !== undefined) for (const k of ['stageGrowth', 'realmJump']) { const v = r.curve[k]; if (!Number.isSafeInteger(v) || v <= 100) err(w, `curve.${k} phải là số nguyên > 100`); }
  });
  for (const k of ['firstQi', 'stageGrowth', 'realmJump']) nonNegInt('REALM_CURVE', k, c.curve[k]);
  if (c.curve.stageGrowth <= 100 || c.curve.realmJump <= 100) err('REALM_CURVE', 'hệ số tăng phải > 100 (đường cong phải đi lên)');

  // Đạo lộ
  c.paths.forEach((p, i) => {
    const w = `path[${i}] ${p.id}`;
    checkId(w, p.id); checkText(w, p.nameKey); checkText(w, p.descKey);
    nonNegInt(w, 'range', p.range);
    for (const k of ['hp', 'atk', 'def', 'spd', 'crit', 'critDmg']) { const v = p.statMult?.[k]; if (!Number.isSafeInteger(v) || v < 500 || v > 2000) err(w, `statMult.${k} phải trong 500..2000`); }
    if (!Array.isArray(p.branches) || p.branches.length < 1) err(w, 'cần ít nhất một nhánh');
    for (const b of p.branches || []) { checkId(w, b.id); checkText(w, b.nameKey); }
  });

  // Linh căn
  const rootIds = new Set(c.roots.map(x => x.id));
  c.roots.forEach((x, i) => { const w = `root[${i}] ${x.id}`; checkId(w, x.id); checkText(w, x.nameKey); if (!rootIds.has(x.counter)) err(w, `counter tham chiếu hỏng "${x.counter}"`); if (x.counter === x.id) err(w, 'không tự khắc mình'); });

  // Chiêu
  const skillById = new Map((c.skills || []).map(s => [s.id, s]));
  (c.skills || []).forEach((s, i) => {
    const w = `skill[${i}] ${s.id}`;
    checkId(w, s.id); checkText(w, s.nameKey);
    if (!SLOTS.has(s.slot)) err(w, `slot lạ "${s.slot}"`);
    nonNegInt(w, 'cd', s.cd); nonNegInt(w, 'mp', s.mp);
    const a = s.action || {}, spec = ACTIONS[a.type];
    if (!spec) err(w, `loại đòn lạ "${a.type}"`);
    else for (const k of spec.required) nonNegInt(w, `action.${k}`, a[k]);
    if (a.type === 'dash' && s.slot !== 'dash') err(w, 'đòn dash chỉ dùng cho ô dash');
    if (a.explode) nonNegInt(w, 'action.explode.radius', a.explode.radius);
    if (a.type !== 'dash' && !(s.effects || []).length) err(w, 'chiêu đánh cần ít nhất một hiệu ứng');
    for (const e of s.effects || []) {
      const es = EFFECTS[e.type];
      if (!es) { err(w, `hiệu ứng lạ "${e.type}"`); continue; }
      for (const k of es) nonNegInt(w, `${e.type}.${k}`, e[k]);
    }
  });
  const needSkill = (w, id, slot) => { const s = skillById.get(id); if (!s) err(w, `chiêu không tồn tại "${id}"`); else if (slot && s.slot !== slot) err(w, `chiêu "${id}" không thuộc ô ${slot}`); };
  for (const p of c.paths) for (const slot of ['attack', 'special', 'dash']) needSkill(`path ${p.id} kit`, p.kit?.[slot], slot);

  // Quái
  const monsterIds = new Set();
  (c.monsters || []).forEach((m, i) => {
    const w = `monster[${i}] ${m.id}`;
    checkId(w, m.id); checkText(w, m.nameKey); monsterIds.add(m.id);
    if (!AIS.has(m.ai)) err(w, `AI lạ "${m.ai}"`);
    for (const k of ['radius', 'speed', 'attackRange']) nonNegInt(w, k, m[k]);
    for (const k of ['hp', 'atk', 'def', 'crit', 'critDmg']) nonNegInt(w, 'stats.' + k, m.stats?.[k]);
    if (!m.skills?.length) err(w, 'cần ít nhất một chiêu');
    for (const id of m.skills || []) needSkill(w, id);
  });

  // Ải
  (c.stages || []).forEach((st, i) => {
    const w = `stage[${i}] ${st.id}`;
    checkId(w, st.id); checkText(w, st.nameKey); checkText(w, st.map);
    nonNegInt(w, 'level', st.level); nonNegInt(w, 'timeLimit', st.timeLimit);
    const [aw, ah] = st.arena || []; nonNegInt(w, 'arena.w', aw); nonNegInt(w, 'arena.h', ah);
    const inside = (p, what) => { if (!Array.isArray(p) || !(p[0] >= 0 && p[0] <= aw && p[1] >= 0 && p[1] <= ah)) err(w, `${what} nằm ngoài sân`); };
    inside(st.playerStart, 'playerStart');
    if (!st.waves?.length) err(w, 'cần ít nhất một đợt quái');
    st.waves?.forEach((wv, j) => {
      if (!['start', 'clear'].includes(wv.when)) err(w, `wave[${j}].when lạ`);
      if (j === 0 && wv.when !== 'start') err(w, 'đợt đầu phải là start');
      for (const sp of wv.spawn || []) { if (!monsterIds.has(sp.monster)) err(w, `quái không tồn tại "${sp.monster}"`); nonNegInt(w, 'count', sp.count); inside(sp.at, 'điểm xuất quái'); }
    });
  });

  if (errors.length) throw Error('Nội dung Lịch luyện sai:\n- ' + errors.join('\n- '));
}

const SLOTS = new Set(['attack', 'special', 'dash', 'ultimate']);
const ACTIONS = {
  projectile: { required: ['speed', 'range', 'radius'] },
  melee: { required: ['offset', 'radius'] },
  nova: { required: ['radius'] },
  zone: { required: ['offset', 'radius', 'duration', 'period'] },
  dash: { required: ['ticks', 'speed', 'invuln'] },
};
const EFFECTS = { damage: ['mult'], knockback: ['distance'], stun: ['ticks'], burn: ['ticks', 'period', 'mult'], heal: ['mult'] };
const AIS = new Set(['chase', 'kite']);

export function loadContent(raw = { realms, paths, roots, curve: REALM_CURVE, skills, monsters, stages }, text = vi) {
  const c = structuredClone({ realms: raw.realms, paths: raw.paths, roots: raw.roots, curve: raw.curve, skills: raw.skills || [], monsters: raw.monsters || [], stages: raw.stages || [] });
  validateContent(c, text);
  const version = fnv64(stableJson(c));
  const byId = new Map();
  for (const list of [c.realms, c.paths, c.roots, c.skills, c.monsters, c.stages]) for (const x of list) byId.set(x.id, x);
  return deepFreeze({ ...c, version, byId, text });
}

// Lấy chữ theo khóa, thay {tham_số}. Thiếu khóa thì trả lại khóa (dễ thấy lỗi trên giao diện).
export function t(content, key, params) {
  let s = Object.hasOwn(content.text, key) ? content.text[key] : key;
  if (params) for (const [k, v] of Object.entries(params)) s = s.replaceAll('{' + k + '}', String(v));
  return s;
}
