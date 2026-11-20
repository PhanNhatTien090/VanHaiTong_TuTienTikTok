// 20/11/2026 — trang Sự kiện làm lại cho gọn (chủ game: "sắp xếp lại cho gọn, cho phép tôi tùy chỉnh mọi thứ").
// Bố cục: (1) ĐANG DIỄN RA — mọi sự kiện đang chạy, mỗi cái một nút Dừng; (2) TỰ ĐỘNG — giữ/hoãn, nhịp, chọn sự kiện được tự mở;
// (3) MỞ SỰ KIỆN — chia nhóm, chỉ nút mở; (4) bảng tuần / luật ở cuối, gập sẵn.
import {bondRuleText} from './bond-policy.js';
import {COURT_VISITORS} from './court-rewards.js';
import {SCENES} from './world-rotation.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clock=ms=>{const sec=Math.max(0,Math.ceil(ms/1000));return `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;};
const hhmm=t=>new Date(t).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Ho_Chi_Minh'});
const button=(label,action,{species,kind,disabled=false,hot=false,stop=false}={})=>`<button class="event-action${hot?' event-action-hot':''}${stop?' event-action-stop':''}" data-social="${action}"${species?` data-species="${species}"`:''}${kind!=null?` data-kind="${kind}"`:''}${disabled?' disabled':''}>${label}</button>`;
const group=(id,title,body,open=false)=>`<details class="event-group" data-panel="${id}"${open?' open':''}><summary>${title}</summary><div class="event-group-body">${body}</div></details>`;
// Khớp RANDOM_EVENTS + BIG_EVENTS trong engine.mjs (id → tên). Bỏ chọn = không TỰ mở; mở tay vẫn được.
export const AUTO_EVENTS=[
 ['boss','Yêu thú'],['visitor-hanlap','Tiên nhân Hàn Lập'],['visitor-vuonglam','Tiên nhân Vương Lâm'],['visitor-shende','Tiên nhân Thần Đế'],
 ['flower','Thiên Hoa Vũ'],['meteor','Tinh Hà Lưu Tinh'],['opportunity','Cơ duyên'],['arena','Lôi Đài'],['race','Đua phi kiếm'],['bond','Lễ kết duyên'],['bonk','Hội Gõ Đầu'],
 ['tower','Vân Hải Tháp'],['maze','Mê Cung'],['alchemy','Khai Lò'],['mount-realm','Tọa Kỹ Bí Cảnh'],['bao-kho','Thiên Công Bảo Khố'],['war','Chính Ma Đại Chiến']];
const VISITOR_NAMES={viemton:'Tần Mục Hỏa Thần',khuyniet:'Khuy Niết Lôi Tôn',tudo:'Tư Đồ Ma Tôn',hailam:'Long Duệ Hải Lam',hanlap:'Hàn Lập',vuonglam:'Vương Lâm',shende:'Thần Đế',doraemon:'Doraemon'};

// Mọi sự kiện đang chạy → [tên, thời gian còn (ms|null), nút dừng]
export function runningEvents(state){
 const now=state.serverNow||Date.now(),s=state.socialStatus||{},race=state.raceStatus,out=[];
 const add=(name,endsAt,stopHtml)=>out.push({name,left:endsAt>now?endsAt-now:null,stop:stopHtml});
 if(state.boss?.endsAt>now)add('Yêu thú · '+(state.boss.name||''),state.boss.endsAt,button('Dừng','stop-current',{kind:'boss',stop:true}));
 if(state.visitor?.endsAt>now&&!state.visitor.closedAt)add('Tiên nhân · '+(state.visitor.name||VISITOR_NAMES[state.visitor.kind]||''),state.visitor.endsAt,button('Dừng','stop-current',{kind:'visitor',stop:true}));
 if(state.flowerEvent?.endsAt>now)add(state.flowerEvent.kind==='meteor'?'Tinh Hà Lưu Tinh':'Thiên Hoa Vũ',state.flowerEvent.endsAt,button('Dừng','stop-current',{kind:'flowerEvent',stop:true}));
 if(state.opportunity?.endsAt>now)add('Cơ duyên',state.opportunity.endsAt,button('Dừng','stop-current',{kind:'opportunity',stop:true}));
 if(['registration','running'].includes(state.doKiep?.phase))add('Bách Nhân Độ Kiếp'+(state.doKiep.phase==='running'?' · đạo lôi '+state.doKiep.wave+'/'+state.doKiep.waves+' · còn trụ '+state.doKiep.alive+'/'+state.doKiep.total:' · ghi danh'),state.doKiep.regEndsAt,button('Dừng','stop-dokiep',{stop:true}));
 const maze=state.maze?.phase;if(['queued','registration','running'].includes(maze))add('Mê Cung'+(maze==='queued'?' (chờ)':maze==='registration'?' · ghi danh':''),state.maze.endsAt||state.maze.registrationEndsAt,button('Hủy Mê Cung','stop-maze',{stop:true}));
 if(['queued','opening','brewing','tribulation'].includes(state.alchemy?.phase))add('Khai Lò Luyện Đan',state.alchemy.endsAt,button('Dừng','stop-alchemy',{stop:true}));
 if(state.baoKho?.phase==='open')add('Thiên Công Bảo Khố',state.baoKho.endsAt,button('Dừng','stop-bao-kho',{stop:true}));
 if(state.mountRealm?.active)add('Tọa Kỹ Bí Cảnh',state.mountRealm.endsAt,button('Dừng','stop-mount-realm',{stop:true}));
 if(state.hallWar?.active)add('Ngũ Đường Giao Lưu',state.hallWar.endsAt,button('Dừng','stop-hall-war',{stop:true}));
 if(state.tower?.active)add('Vân Hải Tháp',state.tower.endsAt,button('Đóng','stop-tower',{stop:true}));
 if(state.bonkFest?.active)add('Hội Gõ Đầu',state.bonkFest.endsAt,button('Dừng','stop-bonk',{stop:true}));
 if(['registration','running','queued'].includes(s.sectWar?.phase))add('Chính Ma Đại Chiến',s.sectWar.endsAt,button('Dừng','stop-war',{stop:true}));
 if(race?.active||race?.repeat||['queued','registration','running'].includes(race?.phase))add('Đua phi kiếm',race.endsAt||race.registrationEndsAt,button('Dừng','stop-race',{stop:true}));
 if(state.arena?.phase==='open')add('Lôi Đài',state.arena.endsAt,button('Dừng','arena-stop',{stop:true}));
 if(['registration','running'].includes(s.tournament?.phase))add('Luận Kiếm',s.tournament.registrationEndsAt,button('Dừng','stop-tournament',{stop:true}));
 if(state.petEvent?.active)add('Linh Thú Cốc',state.petEvent.endsAt,button('Dừng','pet-stop',{stop:true}));
 if(state.lanternFestival?.active)add('Đêm Đèn Đồng Môn',state.lanternFestival.endsAt,button('Dừng','stop-lantern',{stop:true}));
 if(s.festival?.active)add('Lễ kết duyên',s.festival.endsAt,button('Dừng','stop-bond-festival',{stop:true}));
 const mini=state.engagement?.mini;if(mini&&mini.phase!=='finished')add('Trò vui · '+(mini.name||''),mini.endsAt,button('Dừng','mini-game',{kind:'stop-mini',stop:true}));
 return out;
}

function autoPanel(state){
 const now=state.serverNow||Date.now(),st=state.settings||{},hold=state.autoHoldUntil>now,off=new Set(st.randomExclude||[]);
 const auto=st.autoEvents!==false,big=st.bigEvents!==false;
 const next=[auto&&state.nextAutoEventAt>now&&['ngẫu nhiên',state.nextAutoEventAt],big&&state.nextBigEventAt>now&&['sự kiện lớn',state.nextBigEventAt],state.nextBossAt>now&&!off.has('boss')&&['yêu thú',state.nextBossAt]].filter(Boolean).sort((a,b)=>a[1]-b[1]);
 const line=hold?`<b class="auto-hold">⏸ Đang giữ sự kiện tự động tới ${hhmm(state.autoHoldUntil)} (còn ${clock(state.autoHoldUntil-now)})</b>`:(!auto&&!big?'<b class="auto-off">Tự động đang TẮT — chỉ mở tay</b>':`<b>▶ Tự động đang chạy</b>`);
 const nextTxt=next.length?'<span>Kế tiếp: '+next.slice(0,3).map(([n,t])=>`${n} ~${hhmm(t)}`).join(' · ')+'</span>':'';
 const num=(key,label,val,min,max,hint)=>`<label class="auto-num">${label}<input type="number" data-setting="${key}" min="${min}" max="${max}" value="${val}"><small>${hint}</small></label>`;
 const chk=(key,label,on)=>`<label class="auto-chk"><input type="checkbox" data-setting="${key}"${on?' checked':''}> ${label}</label>`;
 return `<section class="auto-panel"><div class="auto-head"><div>${line}${nextTxt}</div><div class="auto-btns">${hold?button('▶ Cho chạy lại ngay','auto-release',{hot:true}):''}${button('⏸ Hoãn 15 phút','auto-hold',{kind:15})}${button('⏸ Hoãn 30 phút','auto-hold',{kind:30})}${button('⏸ Hoãn 60 phút','auto-hold',{kind:60})}</div></div>
<div class="auto-row">${chk('autoEvents','Tự mở sự kiện ngẫu nhiên',auto)}${chk('bigEvents','Tự mở sự kiện lớn (Tháp, Mê Cung, Bí Cảnh…)',big)}${chk('quiz','Câu đố',st.quiz!==false)}${chk('envelope','Lì xì',st.envelope!==false)}</div>
<div class="auto-row">${num('liveWarmupMinutes','Mới mở LIVE chờ',st.liveWarmupMinutes??10,0,60,'phút rồi mới tự mở')}${num('autoEventMinutes','Ngẫu nhiên mỗi',st.autoEventMinutes??15,5,120,'phút')}${num('bigEventMinutes','Sự kiện lớn mỗi',st.bigEventMinutes??25,15,120,'phút')}</div>
<details class="auto-list"><summary>Chọn sự kiện được TỰ mở (${AUTO_EVENTS.length-AUTO_EVENTS.filter(([id])=>off.has(id)).length}/${AUTO_EVENTS.length})</summary><div>${AUTO_EVENTS.map(([id,name])=>`<label class="auto-chk"><input type="checkbox" data-auto-id="${id}"${off.has(id)?'':' checked'}> ${esc(name)}</label>`).join('')}<small>Bỏ chọn = không tự mở. Mở tay ở dưới vẫn được.</small></div></details></section>`;
}

export function eventDashboardHTML(state){
 const now=state.serverNow||Date.now(),s=state.socialStatus||{},race=state.raceStatus;
 const running=runningEvents(state);
 const busy=!!state.mainStage||running.some(r=>!/Trò vui|Tình Lâu|Linh Thú Cốc/.test(r.name));
 const status=`<div class="event-status"><div class="event-status-main"><small>ĐANG DIỄN RA</small>${running.length?running.map(r=>`<div class="run-row"><strong>${esc(r.name)}</strong>${r.left!=null?`<em>${clock(r.left)}</em>`:''}${r.stop}</div>`).join(''):`<strong>${esc(state.mainStage||'Sân đang trống')}</strong>`}</div><p>${busy?'Đang có sự kiện — dừng ở đây nếu muốn mở cái khác.':'Chọn một hoạt động bên dưới để bắt đầu.'}</p></div>`;
 // ── Mở sự kiện ──
 const alcOn=['queued','opening','brewing','tribulation'].includes(state.alchemy?.phase),mazeOn=['queued','registration','running'].includes(state.maze?.phase);
 const bigs=button('⚡ Bách Nhân Độ Kiếp · mới','start-dokiep',{disabled:busy,hot:true})+button('✦ Thiên Công Bảo Khố','start-bao-kho',{disabled:busy,hot:true})+button('🐉 Tọa Kỹ Bí Cảnh','start-mount-realm',{disabled:busy,hot:true})+button('✦ Ngũ Đường Giao Lưu','start-hall-war',{disabled:busy,hot:true})+button('🔥 Khai Lò Luyện Đan','start-alchemy',{disabled:busy||alcOn,hot:true})+button('🌀 Mê Cung','start-maze',{disabled:busy||mazeOn,hot:true})+button('🏯 Vân Hải Tháp','start-tower',{disabled:busy||state.tower?.active,hot:true})+button('⚔ Lôi Đài 8 phút','arena-start',{disabled:busy||state.arena?.phase==='open',hot:true})+button('⚔ Chính Ma Đại Chiến','start-war',{disabled:busy})+button('🗡 Đua phi kiếm','start-race',{disabled:busy})+button('🔨 Hội Gõ Đầu 3 phút','start-bonk',{disabled:state.bonkFest?.active});
 const card=(img,name,price,action,kind,disabled,preview)=>`<article class="ev-card">${img?`<img src="${img}" alt="" loading="lazy">`:''}<div><b>${esc(name)}</b><small>${esc(price)}</small>${button('Mở',action,{kind,disabled})}${preview?`<a href="${preview}" target="_blank" rel="noopener">xem</a>`:''}</div></article>`;
 const knownRelics=new Set((state.catalog||[]).map(item=>item.id));
 const skins=COURT_VISITORS.map(v=>card(v.artwork?.standing||'/assets/thien-khuyet/'+v.kind+'-standing.webp',v.name,v.skinCoins&&v.skinCoins===v.artifactCoins?v.skinCoins+' coin · skin + '+v.relic:(v.skinCoins||300)+' / '+(v.artifactCoins||500)+' coin',  'visitor',v.kind,busy||!knownRelics.has(v.artifact))).join('')
  +card('/assets/khuy-niet-v1/card.png','Khuy Niết Lôi Tôn','300 / 500 coin','visitor','khuyniet',busy,'/khuy-preview.html')
  +card('/assets/viem-ton-v1/card.png','Tần Mục Hỏa Thần','300 / 500 coin','visitor','viemton',busy,'/viem-preview.html')
  +card('/assets/tudo-ma-ton-v1/card.png','Tư Đồ Ma Tôn','200 / 300 coin','visitor','tudo',busy,'/tudo-preview.html')
  +card('','Long Duệ Hải Lam','100 / 300 coin','sea-event',null,busy,'/sea-skin-preview.html')
  +[['hanlap','Hàn Lập'],['vuonglam','Vương Lâm'],['shende','Thần Đế'],['doraemon','Doraemon']].map(([id,name])=>card('',name,'tiên nhân thường','visitor',id,busy)).join('');
 const bosses=button('🐉 Hắc Uyên Ma Long','boss',{species:'abyss-dragon',disabled:busy,hot:true})+[['storm-tiger','Lôi Hổ'],['astral-tortoise','Huyền Vũ'],['rebirth-phoenix','Phượng Hoàng'],['azure-dragon','Thương Long'],['sky-kun','Cự Côn'],['moon-fox','Cửu Vĩ Hồ']].map(([species,label])=>button(label,'boss',{species,disabled:busy})).join('')+button('Yêu thú ngẫu nhiên','boss',{disabled:busy});
 const mini=state.engagement?.mini,smallBusy=!!(mini||state.engagement?.quiz||state.engagement?.envelope);
 const small=button('Thiên Hoa Vũ · 2 phút','flower',{kind:'flower',disabled:busy})+button('Lưu Tinh · 2 phút','flower',{kind:'meteor',disabled:busy})+button('Cơ duyên · 5 phút','opportunity',{disabled:busy})+button('Linh Thú Cốc','pet-start',{disabled:state.petEvent?.active})+button('Thiên Đạo Ban Phúc','blessing')+button('Oẳn tù tì','mini-game',{kind:'rps',disabled:smallBusy})+button('Ba túi linh lộc','mini-game',{kind:'lucky',disabled:smallBusy})+button('Bắt sao','mini-game',{kind:'star',disabled:smallBusy});
 const teaseList=(state.players||[]).filter(p=>!p.resident&&!p.puppet&&p.active).sort((a,b)=>String(a.name).localeCompare(String(b.name))).slice(0,300).map(p=>`<option value="${esc(p.name+' #'+(p.socialCode||''))}"></option>`).join('');
 const social=button('Đêm Đèn Đồng Môn','start-lantern',{disabled:busy||state.lanternFestival?.active})+button('Lễ kết duyên','start-bond-festival',{disabled:busy||s.festival?.active})+`<div class="tease-box"><b>💘 Chọc ghẹo</b><input id="teaseA" list="teasePlayers" placeholder="Người 1 (tên / mã)" autocomplete="off"><span>❤</span><input id="teaseB" list="teasePlayers" placeholder="Người 2" autocomplete="off">${button('Thả tim','tease-pair',{hot:true})}<datalist id="teasePlayers">${teaseList}</datalist></div><label class="event-check"><input id="bondEnabled" type="checkbox"${s.bondEnabled?' checked':''}> Cho phép gửi lời mời kết duyên</label><p>${esc(bondRuleText())}</p>`;
 const scene=state.settings?.sceneMode||'auto',maps=button('Tự đổi mỗi 5 phút','world-scene',{kind:'auto',hot:scene==='auto'})+SCENES.map(m=>button(esc(m.name),'world-scene',{kind:m.id,hot:scene===m.id})).join('');
 // ── Bảng tuần / lịch sử / luật (cuối trang, gập) ──
 const week=state.halls?.weekly,weekly=week?'<p>Chốt tuần: hết Chủ Nhật, 00:00 Thứ Hai (giờ VN). Người đóng góp ≥1 điểm ở Đường top 3 nhận quà.</p><table><thead><tr><th>Đường</th><th>Điểm tuần</th><th>Đường chiến</th></tr></thead><tbody>'+[...(state.halls?.halls||[])].sort((a,b)=>b.points-a.points||(b.battlePoints||0)-(a.battlePoints||0)||a.index-b.index).map(h=>'<tr><td>'+esc(h.name)+'</td><td>'+h.points+'</td><td>'+(h.battlePoints||0)+'</td></tr>').join('')+'</tbody></table>'+week.history.slice(0,4).map(e=>'<details><summary>Tuần '+new Date(e.endsAt-1).toLocaleDateString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'})+' · '+e.rewarded+' người nhận quà</summary><ol>'+e.standings.map(h=>'<li>'+esc(h.name)+' · '+h.points+' điểm · '+h.contributors.length+' người</li>').join('')+'</ol></details>').join(''):'';
 const recentHall=(state.hallWar?.history||[]).map(e=>'<details><summary>Đường chiến '+new Date(e.at).toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'})+' · '+(e.rewardCount||0)+' người nhận quà</summary><ol>'+e.results.map(t=>'<li>'+esc(t.name)+' · '+t.score+' công · '+t.kills+' lượt</li>').join('')+'</ol></details>').join('');
 const rules='<p><b>Ma Long:</b> cả tông môn nhận 500 tu vi, 200 linh thạch, 15 linh thảo/người khi hạ được.</p><p><b>Hải Lam:</b> gõ cơ duyên nhận miễn phí; 100 coin mở skin, 300 coin thêm Long Tâm.</p><p><b>Đua:</b> gõ bay; top 3 về đích + top 3 quà rút phi kiếm. <b>Kết duyên:</b> ketduyen tên → dongy.</p>';
 return status+autoPanel(state)+`<div class="event-grid">${group('big','Sự kiện lớn',bigs,true)}${group('bosses','Yêu thú',bosses,true)}</div>`
  +group('skins','Skin · Tiên nhân giáng thế','<div class="ev-cards">'+skins+'</div>',true)
  +`<div class="event-grid">${group('small','Sự kiện nhỏ · trò vui',small,true)}${group('social','Đồng môn · kết duyên',social)}</div>`
  +group('maps','Cảnh nền',maps)
  +`<div class="event-grid">${weekly?group('weekly','Ngũ Đường · bảng tuần',weekly):''}${recentHall?group('hallhist','Đường chiến gần đây',recentHall):''}${group('help','Luật & phần thưởng',rules)}</div>`;
}
