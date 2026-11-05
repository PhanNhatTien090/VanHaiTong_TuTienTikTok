// Các bảng chức năng mở từ công trình trên trang chủ: Luyện Khí Các, Linh Thú Cốc, Nhiệm vụ ngày.
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = n => Number(n || 0).toLocaleString('vi-VN');
const MAT_ICON = id => `/art/ui/mat-${id}.png`;
const MAT_NAME = { 'huyen-thiet': 'Huyền Thiết', 'tinh-kim': 'Tinh Kim', 'long-tuy': 'Long Tủy', 'linh-qua': 'Linh Quả' };

export function createPanels({ api, toast, refresh, startEventBattle, openRanking }) {
  const panel = document.querySelector('#gamePanel');
  const title = panel.querySelector('#gpTitle'), body = panel.querySelector('#gpBody');
  panel.querySelector('#gpClose').onclick = () => { panel.hidden = true; };
  let current = null;
  function open(name, heading) { current = name; title.textContent = heading; panel.hidden = false; panel.dataset.kind = name; }

  function matsStrip(mats, stones) {
    return `<div class="gp-mats">${stones !== undefined ? `<span><img src="/art/ui/icon-stone.png" alt="">${fmt(stones)}</span>` : ''}${mats.map(m => `<span title="${esc(m.desc)}"><img src="${m.icon}" alt="">${esc(m.name)} <b>${fmt(m.count)}</b></span>`).join('')}</div>`;
  }

  // ---------- Luyện Khí Các ----------
  async function forge() {
    const f = await api('/api/forge');
    if (!f.items) return toast(f.message || 'Không mở được Luyện Khí Các.', true);
    open('forge', 'Luyện Khí Các · Cường hóa pháp bảo');
    const have = Object.fromEntries(f.mats.map(m => [m.id, m.count]));
    body.innerHTML = `${matsStrip(f.mats.filter(m => m.id !== 'linh-qua'), f.stones)}
      <p class="gp-note">Cường hóa pháp bảo đang trang bị để tăng sức mạnh và máu trong bí cảnh. Luôn thành công, không mất đồ. Nguyên liệu rơi khi vượt ải.</p>
      <div class="gp-list">${f.items.map(it => {
        const c = it.cost, ok = c && f.stones >= c.stones && (have[c.mat] || 0) >= c.count;
        return `<article class="gp-row ${it.equipped ? 'on' : ''}">
          <div class="gp-main"><h3>${esc(it.name)} <em>+${it.level}</em>${it.equipped ? ' <small class="tag gold">Đang trang bị</small>' : ''}</h3>
            <div class="pips">${Array.from({ length: f.max }, (_, i) => `<i class="${i < it.level ? 'lit' : ''}"></i>`).join('')}</div>
            <small class="muted">${it.damage ? '+' + it.damage + ' sát thương gốc' : 'Pháp bảo hỗ trợ'}</small></div>
          ${c ? `<div class="gp-cost"><span><img src="/art/ui/icon-stone.png" alt="">${fmt(c.stones)}</span><span><img src="${MAT_ICON(c.mat)}" alt="">${c.count} ${MAT_NAME[c.mat]}</span>
            <button class="gp-go" data-enhance="${esc(it.id)}" ${ok ? '' : 'disabled'}>Cường hóa +${it.level + 1}</button></div>` : '<div class="gp-cost"><b class="gold-text">Tối đa</b></div>'}
        </article>`;
      }).join('') || '<p class="muted">Chưa có pháp bảo. Rèn ở Tàng Kinh Các hoặc nhận từ sự kiện LIVE.</p>'}</div>`;
  }

  // ---------- Linh Thú Cốc ----------
  async function pets() {
    const d = await api('/api/pets');
    if (!d.pets) return toast(d.message || 'Không mở được Linh Thú Cốc.', true);
    open('pets', 'Linh Thú Cốc');
    body.innerHTML = `<div class="gp-mats"><span><img src="${MAT_ICON('linh-qua')}" alt="">Linh Quả <b>${fmt(d.food)}</b></span></div>
      <p class="gp-note">Linh thú đồng hành sẽ theo bạn vào bí cảnh và lao vào cắn boss. Linh thú mở trên LIVE (thả tim/tặng quà trong sự kiện Linh Thú Cốc); trên web cho ăn để lên cấp.</p>
      <div class="gp-pets">${d.pets.map(p => `
        <article class="gp-pet ${p.owned ? '' : 'locked'} ${d.chosen === p.id ? 'on' : ''}" style="--c:${esc(p.color)}">
          <div class="pet-art" style="background-image:url(/assets/spirit-pets-v1/${esc(p.id)}.png)"></div>
          <h3>${esc(p.name)}</h3><small>${esc(p.rank)} · Cấp ${p.level}/${p.max}</small>
          <div class="muted">Trợ chiến ${p.power}% sức mạnh</div>
          ${p.owned ? `<div class="row">
              ${d.chosen === p.id ? '<button disabled>Đang đồng hành</button>' : `<button data-choose="${p.id}">Đồng hành</button>`}
              <button class="gp-go" data-feed="${p.id}" ${d.food >= p.feedCost && p.level < p.max ? '' : 'disabled'}>Cho ăn · ${p.feedCost}</button></div>`
            : `<div class="muted small">Mở trên LIVE: ${fmt(p.hearts)} tim${p.coins ? ` hoặc ${fmt(p.coins)} coin quà` : ''}</div>`}
        </article>`).join('')}</div>`;
  }

  // ---------- Nhiệm vụ ngày ----------
  async function quests() {
    const d = await api('/api/quests');
    if (!d.quests) return toast(d.message || 'Không mở được nhiệm vụ.', true);
    open('quests', 'Nhiệm vụ hôm nay');
    const rewardHtml = r => `<span><img src="/art/ui/icon-stone.png" alt="">${fmt(r.stones)}</span>${Object.entries(r.mats || {}).map(([k, v]) => `<span><img src="${MAT_ICON(k)}" alt="">${v}</span>`).join('')}`;
    body.innerHTML = `<p class="gp-note">Làm mới mỗi ngày theo giờ Việt Nam.</p><div class="gp-list">${d.quests.map(q => `
      <article class="gp-row ${q.claimed ? 'done' : ''}">
        <div class="gp-main"><h3>${esc(q.name)}</h3><div class="qbar"><i style="width:${q.progress / q.goal * 100}%"></i><span>${q.progress}/${q.goal}</span></div></div>
        <div class="gp-cost">${rewardHtml(q.reward)}<button class="gp-go" data-claim="${q.id}" ${q.done && !q.claimed ? '' : 'disabled'}>${q.claimed ? 'Đã nhận' : 'Nhận'}</button></div>
      </article>`).join('')}
      <article class="gp-row chest ${d.bonus.claimed ? 'done' : ''}">
        <div class="gp-main"><h3><img src="/art/ui/icon-gift.png" alt="" class="chest-ico"> Rương hoàn thành tất cả</h3></div>
        <div class="gp-cost">${rewardHtml(d.bonus.reward)}<button class="gp-go" data-claim="bonus" ${d.bonus.ready && !d.bonus.claimed ? '' : 'disabled'}>${d.bonus.claimed ? 'Đã nhận' : 'Mở rương'}</button></div>
      </article></div>`;
  }

  const rewardIcons = r => `${r.stamina ? `<span><img src="/art/ui/icon-stamina.png" alt="">+${r.stamina}</span>` : ''}${Object.entries(r.mats || {}).map(([k, v]) => `<span><img src="${MAT_ICON(k)}" alt="">${v}</span>`).join('')}`;

  // ---------- Cửa hàng (Tiên Ngọc) ----------
  async function shop() {
    const d = await api('/api/shop');
    if (!d.items) return toast(d.message || 'Không mở được cửa hàng.', true);
    open('shop', 'Cửa hàng Tiên Ngọc');
    body.innerHTML = `<div class="gp-mats"><span><img src="/art/ui/icon-jade.png" alt="">Tiên Ngọc <b>${fmt(d.jade)}</b></span>${d.extraPills ? `<span><img src="/art/battle/btn-pill.png" alt="">Đan mang theo <b>${d.extraPills}</b></span>` : ''}</div>
      <p class="gp-note">Tiên Ngọc tích lũy từ quà đã tặng trên LIVE (1 coin = 1 Tiên Ngọc, quà cũ cũng được tính). Cửa hàng chỉ bán đồ dùng trong bản web.</p>
      <div class="gp-shop">${d.items.map(x => `<article class="gp-item">
        <img src="${x.icon}" alt=""><h3>${esc(x.name)}</h3><p class="muted">${esc(x.desc)}</p>
        <small class="muted">Còn ${x.left}/${x.daily} lượt hôm nay</small>
        <button class="gp-go" data-buy="${x.id}" ${x.left > 0 && d.jade >= x.price ? '' : 'disabled'}><img src="/art/ui/icon-jade.png" alt="">${x.price}</button></article>`).join('')}</div>`;
  }

  // ---------- Thư ----------
  async function mail() {
    const d = await api('/api/mail');
    open('mail', 'Hòm thư');
    const any = d.mail?.some(m => !m.claimed);
    body.innerHTML = `${any ? '<div class="gp-mats"><button class="gp-go" data-mail="all">Nhận tất cả</button></div>' : ''}
      <div class="gp-list">${(d.mail || []).map(m => `<article class="gp-row ${m.claimed && m.read ? 'done' : ''}">
        <div class="gp-main"><h3>${esc(m.title)}</h3><p class="muted small">${esc(m.body)}</p><small class="muted">${new Date(m.at).toLocaleString('vi-VN')}</small></div>
        ${m.reward ? `<div class="gp-cost">${rewardIcons(m.reward)}<button class="gp-go" data-mail="${m.id}" ${m.claimed ? 'disabled' : ''}>${m.claimed ? 'Đã nhận' : 'Nhận'}</button></div>` : ''}
      </article>`).join('') || '<p class="gp-note">Chưa có thư.</p>'}</div>`;
    if (d.mail?.some(m => !m.read && !m.reward)) api('/api/mail/claim', { id: 'all' }).then(() => refresh());
  }

  // ---------- Quà mỗi ngày ----------
  async function gift() {
    const d = await api('/api/gift');
    open('gift', 'Quà đăng nhập 7 ngày');
    body.innerHTML = `<p class="gp-note">Vào web mỗi ngày để nhận quà. Bỏ một ngày thì chuỗi bắt đầu lại.</p>
      <div class="gp-days">${d.gifts.map((g, i) => {
        const done = i < (d.claimedToday ? d.today + 1 : d.today), today = i === d.today;
        return `<article class="gp-day ${done ? 'done' : ''} ${today && !d.claimedToday ? 'today' : ''}"><b>Ngày ${i + 1}</b><div class="gp-cost">${rewardIcons(g)}</div>${done ? '<span class="ok">✔</span>' : ''}</article>`;
      }).join('')}</div>
      <div class="gp-mats"><button class="gp-go big" data-gift ${d.claimedToday ? 'disabled' : ''}>${d.claimedToday ? 'Đã nhận hôm nay' : 'Nhận quà hôm nay'}</button></div>`;
  }

  // ---------- Đại Điện: Bế quan ----------
  async function hall() {
    const r = await api('/api/retreat');
    open('hall', 'Đại Điện · Bế quan');
    const h = Math.floor((r.elapsedMs || 0) / 3600000), m = Math.floor(((r.elapsedMs || 0) % 3600000) / 60000);
    body.innerHTML = `<div class="gp-retreat ${r.active ? 'on' : ''}">
        <div class="ring"><i style="--p:${r.active ? Math.min(1, r.elapsedMs / (r.maxHours * 3600000)) : 0}"></i><span>${r.active ? `${h}g ${m}p` : 'Sẵn sàng'}</span></div>
        <div><h3>${r.active ? (r.full ? 'Bế quan viên mãn' : 'Đang bế quan…') : 'Bế quan tu luyện'}</h3>
          <p class="muted">Tắt máy vẫn tích tu vi: khoảng <b>${fmt(r.ratePerHour)}</b> tu vi mỗi giờ, tối đa ${r.maxHours} giờ. Tính chung trần tu vi mỗi ngày của bản web.</p>
          ${r.active ? `<p>Đã tích: <b class="gold-text">${fmt(r.pending)}</b> tu vi</p><button class="gp-go big" data-retreat="claim">Xuất quan nhận tu vi</button>`
            : '<button class="gp-go big" data-retreat="start">Bắt đầu bế quan</button>'}</div>
      </div>
      <div class="gp-mats"><button data-open-rank>Phong Vân Bảng (xếp hạng)</button></div>`;
  }

  // ---------- Sự Kiện: nhìn LIVE một chiều ----------
  async function live() {
    const d = await api('/api/live');
    open('live', `Sự Kiện · Đang LIVE ${d.online || 0} đạo hữu`);
    const ev = d.event, left = ev ? Math.max(0, Math.ceil((ev.endsAt - Date.now()) / 1000)) : 0;
    const pos = ['0%', '50%', '100%'][ev?.cell ?? 0];
    const eventHtml = !ev ? '<div class="gp-event none"><b>LIVE chưa có sự kiện.</b><span class="muted">Khi LIVE mở boss, bạn được đánh bản riêng trên web và nhận nguyên liệu gấp đôi.</span></div>'
      : ev.kind === 'boss' ? `<div class="gp-event boss"><div class="dp-portrait" style="background-image:url(${ev.atlas});background-position:${pos} ${ev.atlas?.includes('celestial') ? '22%' : '40%'}"></div>
          <div><h3>${esc(ev.name)} đang giáng thế trên LIVE</h3><p class="muted">Còn ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')} · Bản web chỉnh theo sức mạnh của bạn · thưởng nguyên liệu ×2 · không tốn thể lực</p>
          ${ev.won ? '<button disabled>Đã hạ bản web</button>' : `<button class="gp-go" data-event="${esc(ev.id)}">Khiêu chiến bản web</button>`}</div></div>`
      : `<div class="gp-event"><b>LIVE đang có: ${esc(ev.name)}</b><span class="muted">Sự kiện này chỉ diễn ra trên LIVE.</span></div>`;
    body.innerHTML = `${eventHtml}
      <h3 class="gp-h">Đang chơi trên LIVE</h3>
      <div class="gp-chips">${(d.players || []).map(p => `<span><b>${esc(p.name)}</b> · ${esc(p.realmName)}</span>`).join('') || '<span class="muted">Chưa có ai.</span>'}</div>
      <h3 class="gp-h">Tin LIVE</h3>
      <ol class="gp-feed">${(d.feed || []).map(f => `<li><b>${esc(f.name)}</b> ${esc(f.text)}</li>`).join('') || '<li class="muted">Chưa có tin.</li>'}</ol>
      <p class="gp-note">Bạn xem được LIVE; người xem LIVE không thấy hoạt động của bạn trên web.</p>`;
  }

  body.addEventListener('click', async e => {
    const bu = e.target.closest('[data-buy]'), ml = e.target.closest('[data-mail]'), gf = e.target.closest('[data-gift]'), rt = e.target.closest('[data-retreat]'), rk = e.target.closest('[data-open-rank]');
    if (bu) { const r = await api('/api/shop/buy', { id: bu.dataset.buy }); if (!r.ok) return toast(r.message, true); toast(`Đã mua ${r.item}!`); refresh(); return shop(); }
    if (ml) { const r = await api('/api/mail/claim', { id: ml.dataset.mail }); if (!r.ok) return toast(r.message, true); if (r.claimed) toast('Đã nhận quà trong thư!'); refresh(); return mail(); }
    if (gf) { const r = await api('/api/gift/claim', {}); if (!r.ok) return toast(r.message, true); toast(`Nhận quà ngày ${r.day}!`); refresh(); return gift(); }
    if (rt) {
      const r = await api('/api/retreat/' + rt.dataset.retreat, {});
      if (!r.ok) return toast(r.message, true);
      toast(rt.dataset.retreat === 'claim' ? `Xuất quan: +${fmt(r.qi)} tu vi${r.capped ? ' (chạm trần hôm nay)' : ''}` : 'Đã bắt đầu bế quan.');
      refresh(); return hall();
    }
    if (rk) { panel.hidden = true; return openRanking?.(); }
    const evb = e.target.closest('[data-event]');
    if (evb) { panel.hidden = true; return startEventBattle?.(evb.dataset.event); }
    const en = e.target.closest('[data-enhance]'), fe = e.target.closest('[data-feed]'), ch = e.target.closest('[data-choose]'), cl = e.target.closest('[data-claim]');
    if (en) { const r = await api('/api/forge/enhance', { itemId: en.dataset.enhance }); if (!r.ok) return toast(r.message, true); toast(`Cường hóa thành công: +${r.level}!`); flash(en.closest('.gp-row')); refresh(); return forge(); }
    if (fe) { const r = await api('/api/pets/feed', { petId: fe.dataset.feed }); if (!r.ok) return toast(r.message, true); toast(`Linh thú lên cấp ${r.level}!`); refresh(); return pets(); }
    if (ch) { const r = await api('/api/pets/choose', { petId: ch.dataset.choose }); if (!r.ok) return toast(r.message, true); toast('Đã chọn linh thú đồng hành.'); return pets(); }
    if (cl) { const r = await api('/api/quests/claim', { id: cl.dataset.claim }); if (!r.ok) return toast(r.message, true); toast('Đã nhận thưởng nhiệm vụ!'); refresh(); return quests(); }
  });
  function flash(el) { el?.classList.remove('flash'); void el?.offsetWidth; el?.classList.add('flash'); }

  return { forge, pets, quests, live, shop, mail, gift, hall, get open() { return !panel.hidden && current; } };
}
