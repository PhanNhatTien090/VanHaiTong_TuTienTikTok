import {liveRulesActive} from './live-integrity.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number(n||0).toLocaleString('vi-VN');
const bar=(n,target)=>`<i style="width:${Math.max(0,Math.min(100,n/Math.max(1,target)*100)).toFixed(1)}%"></i>`;
export function heartHUD(state){
 if(liveRulesActive(state))return {context:'voluntary',html:'<strong>TU LUYỆN CÙNG ĐỒNG MÔN</strong><span>Gõ tu luyện · hái · đánh để chơi</span><small>Tim, theo dõi và chia sẻ là tự nguyện</small>'};
 const now=state.serverNow,g=state.likeGoal||{count:0,target:1000};
 let title='❤ TỤ LINH TOÀN TÔNG',detail=`${fmt(g.count)}/${fmt(g.target)} tim · đủ mốc thưởng ×2`,progress=bar(g.count,g.target),extra='',context='global';
 const b=state.boss,r=state.raceStatus,e=state.flowerEvent,f=state.socialStatus?.festival;
 if(b&&b.hp>0&&now<b.endsAt){
   const h=b.hearts||{count:0,target:Math.min(500,Math.max(100,Math.ceil(state.players.filter(p=>p.active&&!p.resident&&!p.puppet).length*20/50)*50)),strikes:0,limit:6};
   context='boss';title='❤ KIẾM TRẬN TIM · '+h.strikes+'/'+h.limit;
   detail=h.strikes<h.limit?`Còn ${fmt(Math.max(0,h.target-h.count))} tim → −5% yêu lực`:'Đủ 6 trận · gõ danh kết liễu';
   progress=bar(h.strikes>=h.limit?h.target:h.count,h.target);extra='Người góp tim được nhận thưởng khi hạ boss';
 }else if(r?.phase==='running'){
   context='race';title='❤ NGỰ PHONG';
   detail='Mỗi 50 tim → +18 trượng · đến khi về đích';
   const top=[...(r.racers||[])].filter(p=>p.hearts>0).sort((a,b)=>b.hearts-a.hearts).slice(0,2);
   extra=top.map(p=>esc(Array.from(p.name||'Đạo hữu').slice(0,10).join(''))+' '+fmt(p.hearts)+' ❤').join(' · ');
 }else if(e&&!e.closedAt&&now>=e.startedAt&&now<e.endsAt){
   context='flower';title='❤ HOA TÂM · 50 / 150 / 300';
   const target=e.heartTarget||300,total=e.heartTotal||0;
   detail=e.heartBloom?'Hoa đã nở · thả tim nhận mốc riêng':`Còn ${fmt(Math.max(0,target-total))} tim → hoa nở, nhận thưởng`;
   progress=bar(total,target);
   const top=Object.entries(e.heartScores||{}).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,3);
   extra='TOP TIM RIÊNG · '+(top.length?top.map(([id,n],i)=>`${i+1}. ${esc(Array.from(state.players.find(p=>p.id===id)?.name||'Đạo hữu').slice(0,8).join(''))} ${fmt(n)}❤`).join(' · '):'50 tim là bắt đầu nhận thưởng');
 }else if(f?.active){
   context='festival';title='❤ CHÚC PHÚC · '+Math.min(3,Math.floor(f.blessings/(f.goal/3)))+'/3 ĐÈN';
   detail=f.blessings>=f.goal?'Đủ 3 đèn · các cặp nhận quà':`Còn ${fmt(f.goal-f.blessings)} tim → đủ 3 đèn, mở quà`;
   progress=bar(f.blessings,f.goal);extra='Mỗi tim đều góp vào đèn chúc phúc';
 }
 const build=state.engagement?.sectBuild;
 const sect=context==='global'&&build?`<small class="sect-line">🏯 Tông môn cấp ${fmt(build.level)} · ${fmt(build.coins)}${build.next?'/'+fmt(build.next)+' coin':' coin'}</small>`:'';
 const globalLine=context==='global'?`Đã góp ${fmt(g.count)}/${fmt(g.target)} tim`:`Toàn tông: ${fmt(g.count)}/${fmt(g.target)} ❤ → ban phúc`;
 return {context,html:`<strong>${title}</strong><span>${detail}</span>${progress}${extra?`<small>${extra}</small>`:''}<small class="heart-global">${globalLine}</small>${sect}`};
}
