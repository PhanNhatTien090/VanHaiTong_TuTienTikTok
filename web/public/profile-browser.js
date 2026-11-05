// Reuse the original game panel; this is not a replacement landing page.
export function createProfileBrowser({api,toast,getMe}) {
  const panel=document.querySelector('#gamePanel'),body=panel.querySelector('#gpBody'),title=panel.querySelector('#gpTitle');
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=n=>Number(n||0).toLocaleString('vi-VN');
  let generation=0,frame=0,page=1,q='',sort='qi',timer;
  function open(heading,kind){generation++;cancelAnimationFrame(frame);panel.hidden=false;panel.dataset.kind=kind;title.textContent=heading;return generation;}
  async function loadList(){
    const token=generation,result=await api(`/api/profiles?q=${encodeURIComponent(q)}&sort=${sort}&page=${page}`);
    if(token!==generation || panel.dataset.kind!=='profiles')return;
    const list=body.querySelector('[data-directory-results]');if(!list)return;
    list.innerHTML=(result.profiles||[]).map(p=>`<button class="char-card" data-public-profile="${esc(p.id)}"><div><b>${esc(p.name)}</b><small>${esc(p.realmName)} · ${fmt(p.totalQi)} tu vi · ${fmt(p.power)} sức mạnh</small></div></button>`).join('')||'<p class="muted">Không tìm thấy đạo hữu.</p>';
    body.querySelector('[data-directory-page]').textContent=`${result.total||0} đạo hữu · Trang ${result.page||1}/${result.pages||1}`;
    body.querySelector('[data-directory-prev]').disabled=page<=1;body.querySelector('[data-directory-next]').disabled=page>=(result.pages||1);
  }
  function directory(){
    open('Đạo hữu · Hồ sơ và đạo lữ','profiles');
    body.innerHTML=`<div class="profile-search"><input data-directory-query aria-label="Tìm đạo hữu" placeholder="Tên hoặc mã đạo hữu" value="${esc(q)}"><select data-directory-sort aria-label="Sắp xếp"><option value="qi">Top tu vi</option><option value="power">Top sức mạnh</option><option value="gifts">Top cống hiến</option></select></div><div class="gp-mats">${getMe()?.player?.fromTikTok?`<button data-public-profile="${esc(getMe().player.id)}">Hồ sơ và đạo lữ của tôi</button>`:''}<small data-directory-page></small></div><div class="char-pick" data-directory-results></div><div class="gp-mats"><button data-directory-prev>Trang trước</button><button data-directory-next>Trang sau</button></div>`;
    body.querySelector('[data-directory-sort]').value=sort;
    body.querySelector('[data-directory-query]').oninput=e=>{q=e.target.value;page=1;clearTimeout(timer);timer=setTimeout(loadList,300);};
    body.querySelector('[data-directory-sort]').onchange=e=>{sort=e.target.value;page=1;loadList();};
    body.querySelector('[data-directory-prev]').onclick=()=>{page=Math.max(1,page-1);loadList();};
    body.querySelector('[data-directory-next]').onclick=()=>{page++;loadList();};
    loadList();
  }
  async function profile(id){
    const token=open('Hồ sơ đạo hữu','public-profile');body.innerHTML='<p class="muted">Đang mở hồ sơ…</p>';
    const result=await api('/api/profile?id='+encodeURIComponent(id));
    if(token!==generation)return;
    const p=result.profile;if(!p){body.innerHTML='<p class="muted">Không tìm thấy hồ sơ công khai.</p>';return;}
    title.textContent=p.name;
    const items=(label,values)=>`<h3 class="gp-h">${label}</h3><div class="gp-chips">${values.map(x=>`<span>${esc(x.name||x)}</span>`).join('')||'<span class="muted">Chưa có.</span>'}</div>`;
    body.innerHTML=`<div class="public-profile-head"><canvas data-profile-canvas width="360" height="420" aria-label="${esc(p.name)}"></canvas><div><h3>${esc(p.realmName)}</h3><p>${fmt(p.totalQi)} tổng tu vi</p><p>${fmt(p.power)} sức mạnh</p><p>${fmt(p.stones)} linh thạch · ${fmt(p.herbs)} linh thảo</p><p class="muted">Mã đạo hữu: ${esc(p.code||'—')}</p></div></div><div class="gp-mats"><button data-directory-open>Danh bạ đạo hữu</button></div><h3 class="gp-h">Đạo lữ</h3>${p.partner?`<button class="char-card" data-public-profile="${esc(p.partner.id)}"><div><b>${esc(p.partner.name)}</b><small>${esc(p.partner.realmName)} · ${fmt(p.partner.days)} ngày bên nhau</small></div></button>`:'<p class="muted">Chưa có đạo lữ.</p>'}${items('Pháp bảo',p.artifacts||[])}${items('Công pháp',p.manuals||[])}${items('Trang phục',p.skins||[])}${items('Phi kiếm',p.swordSkins||[])}${items('Linh thú',p.pet?[p.pet]:[])}`;
    try{
      const [context,{LiveActor}]=await Promise.all([api('/api/scene'),import('/live-actor.js')]);if(token!==generation)return;
      const actor={...p.appearance,...p,equipped:p.appearance?.equipped,artifacts:(p.artifacts||[]).map(x=>x.id),manuals:(p.manuals||[]).map(x=>x.id),active:true};
      const renderer=new LiveActor({...context,players:[actor]},{resolution:2,playerId:id}),canvas=body.querySelector('[data-profile-canvas]'),ctx=canvas.getContext('2d');
      const draw=t=>{if(token!==generation||panel.hidden||panel.dataset.kind!=='public-profile')return;renderer.render(t);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(renderer.canvas,0,0,canvas.width,canvas.height);frame=requestAnimationFrame(draw);};frame=requestAnimationFrame(draw);
    }catch{body.querySelector('[data-profile-canvas]')?.remove();}
  }
  document.addEventListener('click',e=>{const p=e.target.closest('[data-public-profile]');if(p){e.preventDefault();profile(p.dataset.publicProfile);}else if(e.target.closest('[data-directory-open]'))directory();});
  return {directory,profile};
}
