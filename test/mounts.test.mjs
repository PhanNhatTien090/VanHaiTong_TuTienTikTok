import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,tick} from '../engine.mjs';
import {MOUNTS,ORBS,ODDS,PITY,rollMount,awardMount,grantOrbs,mountBonus,revealMount,tickMounts,mountCommand,mountGiftBoost} from '../mounts.mjs';
import {mountStat,STAT_CAP,MAX_STARS} from '../public/mounts.js';

const NOW=Date.parse('2026-11-16T20:00:00+07:00');
const seeded=seed=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};
const ctx=()=>{const out=[];return {out,emit:(w,p,text,effect,now,extra)=>out.push({text,effect,...extra}),active:()=>true,audit:()=>{}};};

test('18 tọa kỹ (16/11 thêm 8): 8 Thường, 6 VIP, 4 Thần; id không trùng',()=>{
 assert.equal(MOUNTS.length,18);
 assert.deepEqual(['common','vip','divine'].map(t=>MOUNTS.filter(m=>m.tier===t).length),[8,6,4]);
 assert.equal(new Set(MOUNTS.map(m=>m.id)).size,18);
});

test('quay 1 triệu lần (không bảo hiểm): tỉ lệ từng bậc đúng bảng',()=>{
 const rng=seeded(42);
 for(const kind of ['common','vip']){
  const n=1_000_000,count={common:0,vip:0,divine:0};
  for(let i=0;i<n;i++)count[rollMount(kind,{vip:0,divine:0},rng).tier]++;
  assert.ok(Math.abs(count.divine/n-ODDS[kind].divine)<.003,kind+' divine '+count.divine/n);
  assert.ok(Math.abs(count.vip/n-ODDS[kind].vip)<.003,kind+' vip '+count.vip/n);
 }
 {const r=seeded(11);for(let i=0;i<200000;i++)assert.notEqual(rollMount('vip',{vip:0,divine:0},r).tier,'common','18/11: châu tím không bao giờ ra thường');}
 // Châu xanh: Thần 0,05% — trong 1 triệu lần phải quanh 500.
 const r=seeded(7);let d=0;for(let i=0;i<1_000_000;i++)if(rollMount('common',{vip:0,divine:0},r).tier==='divine')d++;
 assert.ok(d>380&&d<620,'divine '+d);
});

test('châu vàng luôn ra Thần và không đụng bộ đếm',()=>{
 const rng=seeded(1);
 for(let i=0;i<200;i++){const r=rollMount('divine',{vip:7,divine:55},rng);assert.equal(r.tier,'divine');assert.deepEqual(r.pity,{vip:7,divine:55});}
});

test('bảo hiểm: 20 châu xanh chưa ra VIP → châu thứ 20 ra ít nhất VIP; 200 lượt → Thần',()=>{
 const never=()=>.999999; // luôn rơi vào Thường nếu không có bảo hiểm
 let pity={vip:0,divine:0},tiers=[];
 for(let i=0;i<PITY.vip;i++){const r=rollMount('common',pity,never);pity=r.pity;tiers.push(r.tier);}
 assert.deepEqual(tiers.slice(0,19),Array(19).fill('common'));assert.equal(tiers[19],'vip');
 pity={vip:0,divine:PITY.divine-1};assert.equal(rollMount('common',pity,never).tier,'divine');
 pity={vip:0,divine:PITY.divine-PITY.vipOrbWeight};assert.equal(rollMount('vip',pity,never).tier,'divine');
 assert.deepEqual(rollMount('common',{vip:0,divine:PITY.divine-1},never).pity,{vip:0,divine:0});
});

test('ra trùng lên sao, đủ 5 sao hoàn nửa giá; tự cưỡi con bậc cao hơn',()=>{
 const p={stones:0};
 awardMount(p,'phieu-diep','common',NOW);assert.equal(p.mount,'phieu-diep');
 for(let s=2;s<=MAX_STARS;s++)assert.equal(awardMount(p,'phieu-diep','common',NOW).stars,s);
 const r=awardMount(p,'phieu-diep','common',NOW);assert.equal(r.refund,ORBS.common.cost/2);assert.equal(p.stones,ORBS.common.cost/2);
 awardMount(p,'con-bang','divine',NOW);assert.equal(p.mount,'con-bang');
 awardMount(p,'thanh-lan-xa','common',NOW);assert.equal(p.mount,'con-bang');
});

test('chỉ số: chỉ con đang cưỡi, tăng theo sao, không vượt giới hạn',()=>{
 assert.equal(mountStat('phieu-diep',1,'stones'),8);
 assert.equal(mountStat('con-bang',5,'stones'),STAT_CAP.stones);
 assert.ok(mountStat('cuu-thien-thanh-long',5,'qi')<=STAT_CAP.qi);
 const p={mounts:{'phieu-diep':{stars:1}},mount:null};
 assert.equal(mountBonus(p,'stones'),0);p.mount='phieu-diep';assert.equal(mountBonus(p,'stones'),.08);
 assert.equal(mountBonus(p,'qi'),0);
});

test('truyền công: trừ linh thạch + châu, thiếu tiền thì không mất châu; 1 châu một lúc; đủ giờ mới hiện thân',()=>{
 const w=createWorld('live'),p=ensurePlayer(w,'u1','U1',NOW),c=ctx();
 Object.assign(p,{stones:299});grantOrbs(w,p,'common',2,NOW,c.emit);
 assert.equal(mountCommand(w,p,'truyencong','',NOW,c).ok,false);assert.equal(p.mountOrbs.common,2);assert.equal(p.stones,299);
 p.stones=1000;
 assert.equal(mountCommand(w,p,'truyencong','',NOW+6000,c).ok,true);
 assert.equal(p.stones,700);assert.equal(p.mountOrbs.common,1);assert.equal(p.mountChannel.endsAt,NOW+6000+ORBS.common.ms);
 assert.equal(mountCommand(w,p,'truyencong','',NOW+12000,c).ok,false);
 assert.equal(revealMount(w,p,NOW+60000,c),null);
 const got=revealMount(w,p,NOW+6000+ORBS.common.ms,c,seeded(3));
 assert.ok(got&&p.mounts[got.id]);assert.equal(p.mountChannel,null);
 assert.ok(c.out.some(e=>e.mountReveal));
});

test('"truyen cong vip" có dấu cách cũng nhận; châu tím 1 giờ 800 linh thạch',()=>{
 const w=createWorld('live'),p=ensurePlayer(w,'u2','U2',NOW),c=ctx();p.stones=900;grantOrbs(w,p,'vip',1,NOW,c.emit);
 assert.equal(mountCommand(w,p,'truyen','cong vip',NOW,c).ok,true);
 assert.equal(p.stones,100);assert.equal(p.mountChannel.endsAt-NOW,60*60000);
});

test('tick: người vắng mặt thì giữ châu, có mặt lại mới hiện thân',()=>{
 const w=createWorld('live'),p=ensurePlayer(w,'u3','U3',NOW),c=ctx();p.stones=5000;grantOrbs(w,p,'divine',1,NOW,c.emit);
 mountCommand(w,p,'truyencong','than',NOW,c);
 const end=p.mountChannel.endsAt;
 tickMounts(w,end+1000,{...c,active:()=>false});assert.ok(p.mountChannel);
 tickMounts(w,end+5000,c);assert.equal(p.mountChannel,null);
 assert.equal(Object.values(p.mounts).length,1);assert.equal(MOUNTS.find(m=>p.mounts[m.id]).tier,'divine');
});

test('engine: lệnh chat linhchau/toaky chạy qua action; chữ trên LIVE không có ngẫu nhiên/tỷ lệ/%',()=>{
 const w=createWorld('live');Object.assign(w.settings,{autoEvents:false,residents:false});
 action(w,{type:'chat',userId:'u9',name:'U9',text:'linhchau'},NOW);
 const p=w.players.u9;grantOrbs(w,p,'common',1,NOW,(...a)=>{});p.stones=500;
 action(w,{type:'chat',userId:'u9',name:'U9',text:'truyencong'},NOW+10000);
 assert.ok(p.mountChannel,'đã bắt đầu truyền công');
 const end=p.mountChannel.endsAt;
 tick(w,end+3000);assert.ok(p.mountChannel,'vắng mặt 30 phút → chưa hiện thân');
 action(w,{type:'chat',userId:'u9',name:'U9',text:'linhchau'},end+10000);
 tick(w,end+13000);assert.equal(p.mountChannel,null);
 const texts=w.feed.filter(e=>e.user==='u9').map(e=>e.text).join(' | ');
 assert.match(texts,/hiện thân|lên \d sao/);
 assert.doesNotMatch(texts,/ngẫu nhiên|tỷ lệ|tỉ lệ|%|thả tim/i);
});

test('tặng quà lúc truyền công: mỗi coin rút 20 giây, không âm; không truyền công thì không làm gì',()=>{
 const w=createWorld('live'),p=ensurePlayer(w,'u5','U5',NOW),c=ctx();p.stones=1000;grantOrbs(w,p,'common',1,NOW,c.emit);
 mountCommand(w,p,'truyencong','',NOW,c);const end=p.mountChannel.endsAt;
 assert.equal(mountGiftBoost(w,p,10,NOW+1000,c.emit),200000);assert.equal(p.mountChannel.endsAt,end-200000);
 mountGiftBoost(w,p,5000,NOW+2000,c.emit);assert.equal(p.mountChannel.endsAt,NOW+2000);
 const q=ensurePlayer(w,'u6','U6',NOW);assert.equal(mountGiftBoost(w,q,99,NOW,c.emit),0);
});

test('engine: quà thật lúc không có sự kiện rút ngắn truyền công',()=>{
 const w=createWorld('live');Object.assign(w.settings,{autoEvents:false,residents:false});
 action(w,{type:'chat',userId:'g1',name:'G1',text:'linhchau'},NOW);
 const p=w.players.g1;grantOrbs(w,p,'common',1,NOW,()=>{});p.stones=500;
 action(w,{type:'chat',userId:'g1',name:'G1',text:'truyencong'},NOW+10000);
 const end=p.mountChannel.endsAt;
 action(w,{type:'gift',userId:'g1',name:'G1',coins:1,count:5,giftName:'Rose',eventId:'gx1'},NOW+20000);
 assert.equal(p.mountChannel.endsAt,end-5*20000);
});

test('18/11: châu xanh ra VIP 10%; nở VIP/Thần từ châu xanh → cờ lucky + "THIÊN ĐẠO CHIẾU CỐ" + giọng tông sư',async()=>{
 const {speechPlan}=await import('../speech-lines.mjs');
 assert.equal(ODDS.common.vip,.10);
 const run=(kind,r)=>{const out=[];const p={id:'x',name:'X',mountChannel:{kind,startedAt:0,endsAt:1},mountPity:{vip:0,divine:0}};revealMount({players:{x:p}},p,2,{emit:(w,pl,text,type,at,extra)=>out.push({text,...extra})},()=>r);return out[0];};
 const lucky=run('common',.05);assert.equal(lucky.mountReveal.tier,'vip');assert.equal(lucky.mountReveal.lucky,true);assert.match(lucky.text,/^THIÊN ĐẠO CHIẾU CỐ/);
 const v=speechPlan({type:'mount',user:'x',name:'X',...lucky},{players:[{id:'x',name:'X'}]});assert.match(v[0].text,/Thiên đạo chiếu cố/);assert.equal(v[0].voice,'tongsu');
 const plain=run('common',.9);assert.equal(plain.mountReveal.tier,'common');assert.equal(plain.mountReveal.lucky,undefined);
 const fromVip=run('vip',.5);assert.equal(fromVip.mountReveal.lucky,undefined,'châu tím ra VIP là bình thường');
});

// 18/11 (chủ game: gõ linhchau / toaky không thấy bảng): lệnh gửi kèm BẢNG XEM "Tọa kỹ" có số để gõ toaky số.
test('linhchau / toaky gửi kèm bảng Tọa kỹ (số, sao, đang cưỡi, châu)', async()=>{
 const {inventoryDeckHTML,cardKind}=await import('../public/inventory-multi.js');
 const p={id:'u1',name:'Tông chủ',mounts:{'hoa-ky-lan':{stars:1},'thanh-lan-xa':{stars:2}},mount:'hoa-ky-lan',mountOrbs:{common:8,vip:0,divine:0}};
 for(const cmd of ['linhchau','toaky']){
  const out=[];const ctx={emit:(w,pl,text,effect,now,extra)=>out.push(extra)};
  assert.equal(mountCommand({},{...p,mountCmdAt:0},cmd,'',NOW,ctx).ok,true);
  const card=out[0]?.card;assert.equal(cardKind(card),'mounts');
  assert.deepEqual(card.owned.items.map(i=>[i.no,i.id,i.on]),[[MOUNTS.findIndex(m=>m.id==='hoa-ky-lan')+1,'hoa-ky-lan',true],[MOUNTS.findIndex(m=>m.id==='thanh-lan-xa')+1,'thanh-lan-xa',false]]);
  const html=inventoryDeckHTML({name:p.name,card},s=>String(s));
  assert.match(html,/8 châu xanh/);assert.match(html,/cưỡi/);assert.match(html,/toa-ky-v1\/hoa-ky-lan\.webp/);
 }
});

// 18/11 (chủ game: "lệnh xem nào không hiện bảng thì làm, gộp được thì gộp"): mọi lệnh xem đều có bảng.
test('mọi lệnh xem đều kèm bảng: tuvi+nhiệm vụ · skin+cánh · thần khí+bản mệnh · chiêu+bí pháp · linhchau+toaky',async()=>{
 const {cardKind,inventoryDeckHTML}=await import('../public/inventory-multi.js');
 const w=createWorld('live');Object.assign(w.settings,{autoEvents:false,residents:false,heartGate:false});
 action(w,{type:'chat',userId:'u1',name:'U1',text:'xin chào'},NOW);
 const p=w.players.u1;p.giftCoins=600;p.bao={items:{'s4-kiem':2,'s5-kiem':1},p4:2,p5:10};
 const want={tuvi:'tuvi',nhiemvu:'tuvi',skin:'skins',canh:'wings' /* 21/11: bảng cánh riêng */,thankhi:'bao',banmenh:'bao',chieu:'kit',biphap:'kit',linhchau:'mounts',toaky:'mounts'};
 let t=NOW+60000;
 for(const [cmd,kind] of Object.entries(want)){t+=20000;const n=w.events.length;action(w,{type:'chat',userId:'u1',name:'U1',text:cmd},t);
  const ev=w.events.slice(n).find(e=>e.user==='u1'&&e.card);assert.ok(ev,cmd+' phải có bảng');assert.equal(cardKind(ev.card),kind,cmd);
  assert.ok(inventoryDeckHTML(ev,s=>String(s)).length>100,cmd);}
});
test('21/11: bảng cánh — ảnh từng cánh đã mở, cánh đang đeo, cánh kế tiếp; không ghi coin',async()=>{
 const {inventoryDeckHTML}=await import('../public/inventory-multi.js');const {wingCard}=await import('../inventory.mjs');
 const c=wingCard({giftCoins:10676,wingChoice:null});
 assert.equal(c.owned.items.length,12);assert.equal(c.next.name,'Thiên Đạo Thần Hoàn');assert.ok(c.owned.items.every(x=>/^\/assets\/[a-z0-9/_-]+\.webp$/.test(x.art)));
 const html=inventoryDeckHTML({name:'hoàng',user:'h',card:c},s=>String(s));
 assert.match(html,/Cánh kế tiếp/);assert.match(html,/wing-thumbs\/w1\.webp/);assert.match(html,/wing-thumbs\/w12\.webp/);assert.doesNotMatch(html,/coin|\d\.\d{3}/i);
 assert.equal(wingCard({giftCoins:0}).owned.items.length,0);
});
test('21/11: gõ cánh khi đang giữ Linh Châu tím → không bật thẻ nhắc châu đè lên bảng cánh',()=>{
 const w=createWorld('live');Object.assign(w.settings,{autoEvents:false,residents:false,heartGate:false});
 action(w,{type:'chat',userId:'u1',name:'U1',text:'xin chào'},NOW);const p=w.players.u1;p.giftCoins=600;p.mountOrbs={vip:1};delete p.cooldowns?.['orb-remind'];w.orbRemindAt=0;
 const n=w.events.length;action(w,{type:'chat',userId:'u1',name:'U1',text:'cánh'},NOW+30*60000);
 const evs=w.events.slice(n).filter(e=>e.user==='u1');assert.ok(evs.some(e=>e.card?.kind==='wings'));assert.ok(!evs.some(e=>e.orbCard),'không có thẻ Linh Châu');
});
test('21/11: mỗi cánh đều có ảnh nhỏ cho bảng cánh',async()=>{
 const fs=await import('node:fs');const {WING_TIERS,wingArt}=await import('../public/boss-arena.js');
 for(const t of WING_TIERS)assert.ok(fs.existsSync('public'+wingArt(t)),t.name+' thiếu ảnh '+wingArt(t));
});
