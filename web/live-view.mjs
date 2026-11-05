// Tình hình LIVE cho người chơi web xem (một chiều: web thấy LIVE, LIVE không thấy web).
// Đầu vào là trạng thái kiểu snapshot của LIVE: lấy trực tiếp từ thế giới (chạy chung) hoặc từ /api/state (chạy thử).

const BOSS_SPECIES = {
  'thunder-tiger': 'thunder-tiger', 'storm-tiger': 'thunder-tiger',
  'jade-tortoise': 'jade-tortoise', 'astral-tortoise': 'jade-tortoise',
  'crimson-phoenix': 'crimson-phoenix', 'rebirth-phoenix': 'crimson-phoenix',
  'azure-dragon': 'azure-dragon', 'sky-kun': 'sky-kun', 'moon-fox': 'moon-fox',
};

export function liveView(state, now = Date.now()) {
  if (!state?.players) return { online: 0, players: [], feed: [], event: null, ranking: [], updatedAt: now };
  const active = state.players.filter(p => p.active && !p.resident && !p.puppet && !p.webOnly);
  const players = [...active].sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0)).slice(0, 8);
  const boss = state.boss && state.boss.endsAt > now && state.boss.hp > 0 ? state.boss : null;
  let event = null;
  if (boss) event = { id: boss.id, kind: 'boss', species: BOSS_SPECIES[boss.species] || 'thunder-tiger', name: boss.name, hp: boss.hp, maxHp: boss.maxHp, endsAt: boss.endsAt };
  else if (['registration', 'running'].includes(state.raceStatus?.phase)) event = { id: 'race', kind: 'race', name: 'Vân Hải Phi Kiếm', endsAt: state.raceStatus.endsAt || state.raceStatus.registrationEndsAt };
  else if (state.visitor && state.visitor.endsAt > now) event = { id: state.visitor.id, kind: 'visitor', name: 'Tiên nhân giáng lâm', endsAt: state.visitor.endsAt };
  else if (state.flowerEvent && state.flowerEvent.endsAt > now) event = { id: 'sky', kind: 'sky', name: 'Thiên tượng trên LIVE', endsAt: state.flowerEvent.endsAt };
  const feed = (state.feed || []).filter(e => e.user && !e.web).slice(0, 14).map(e => ({ id: e.id, at: e.at, name: e.name, text: e.text, effect: e.effect, user: e.user }));
  const ranking = [...active].sort((a, b) => b.realm - a.realm || b.totalQi - a.totalQi).slice(0, 20).map(p => ({ id: p.id, name: p.name, realm: p.realm, realmName: p.realmName, totalQi: p.totalQi }));
  return { online: active.length, players, feed, event, ranking, updatedAt: now };
}

// Chế độ chạy thử: đọc nhẹ từ server LIVE trên cùng máy, mỗi 10 giây, chỉ GET.
export function pollLive(url, onState, intervalMs = 10000) {
  let stopped = false;
  async function once() {
    if (stopped) return;
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (r.ok) onState(await r.json());
    } catch { /* LIVE chưa chạy: bỏ qua */ }
    if (!stopped) setTimeout(once, intervalMs).unref();
  }
  once();
  return () => { stopped = true; };
}
