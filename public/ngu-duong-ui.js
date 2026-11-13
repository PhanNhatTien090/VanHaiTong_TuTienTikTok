const compact = new Intl.NumberFormat('vi-VN',{notation:'compact',maximumFractionDigits:1});
const points = n => Number(n||0).toLocaleString('vi-VN');
const hallLabel = h => h.name.replace(/ Đường$/,'');
const emblem = h => `<i class="hall-emblem" style="--hall-color:${h.color}" aria-hidden="true">${h.mark}</i>`;

export function hallsRankHTML(state,esc,now){
  const {thienBang:top,halls}=state.halls;
  const pages=top.length>5?2:top.length?1:0, page=Math.floor(now/8000)%(pages+1);
  if(page===pages){
    const rows=[...halls].sort((a,b)=>b.points-a.points||a.index-b.index);
    return `<div class="qi-leaders hall-ranks"><b>NGŨ ĐƯỜNG · TUẦN</b><small>Hoạt động + Đường chiến · thưởng cuối tuần</small>${rows.map(h=>`<span>${emblem(h)}<em>${esc(hallLabel(h))}</em><strong>${points(h.points)}</strong>${h.champion?'<small>+5% tu vi tuần này</small>':''}</span>`).join('')}</div>`;
  }
  return `<div class="qi-leaders hall-ranks"><b>THIÊN BẢNG · ${page?'6–10':'1–5'}</b>${top.slice(page*5,page*5+5).map(p=>`<span><i>${p.rank}</i><em>${esc(p.name)}${p.active?'<u title="Đang ở LIVE"></u>':''}</em><strong>${compact.format(p.totalQi)}</strong><small>${p.master?'Tông Chủ · ':''}${esc(state.realms[p.realm])}</small></span>`).join('')}</div>`;
}

function hallRoster(h,esc){
  return `<li>${emblem(h)}<div><strong>${h.index+1}. ${esc(h.name)}</strong>
    <small>${esc(h.perk)}${h.champion?' · +5% tu vi tuần này':''}</small>
    <small>Trưởng Lão · ${esc(h.elder?.name||'Ghế trống')}</small>
    ${h.disciples.length?`<small>Chân Truyền · ${h.disciples.map(p=>esc(p.name)).join(' · ')}</small>`:''}
  </div><b>${points(h.points)}</b></li>`;
}

export function hallCardHTML(card,esc){
  const current=card.halls[card.selected];
  return `<div class="hall-card-title"><b>NGỌC GIẢN NGŨ ĐƯỜNG</b>${current?`<small>${esc(current.name)} · ${points(card.personal)} điểm tuần</small>`:''}</div>
    <ul class="hall-roster">${(current?[current]:card.halls).map(h=>hallRoster(h,esc)).join('')}</ul>
    <footer>đường chiến · vào đường 1–5 · thách đấu 1–5 · chân truyền + tên · bái sư</footer>`;
}

export function hallDuelHTML(view,esc,now){
  const m=view?.match;
  if(!m?.a||!m?.b)return '';
  const h=view.halls[m.index], left=Math.max(0,Math.ceil((m.endsAt-now)/1000));
  if(!left)return '';
  const a=m.attackQi*(1+m.offense*.01), b=m.defenseQi*(1+m.defense*.01);
  const share=Math.round(100*a/(a+b));
  return `<b>VÂN ĐÀI · ${esc(h.name)}</b>
  <div class="hall-combatants">
    <div><small>THÁCH ĐẤU</small><strong>${esc(m.a.name)}</strong><span>Trợ lực +${m.offense}%</span></div>
    <i>${left}s</i>
    <div><small>TRƯỞNG LÃO</small><strong>${esc(m.b.name)}</strong><span>${m.defenderPresent?'Hộ sư +'+m.defense+'%':'Vắng mặt · đấu bằng tu vi'}</span></div>
  </div>
  <div class="hall-balance"><i style="width:${share}%"></i></div>
  <small>Gõ <b>3</b> trợ lực · ${view.queued?view.queued+' đang chờ':'Kết quả chốt khi hết giờ'}</small>`;
}
