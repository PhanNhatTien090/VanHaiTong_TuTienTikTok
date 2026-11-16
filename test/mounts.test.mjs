import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,tick} from '../engine.mjs';
import {MOUNTS,ORBS,ODDS,PITY,rollMount,awardMount,grantOrbs,mountBonus,revealMount,tickMounts,mountCommand} from '../mounts.mjs';
import {mountStat,STAT_CAP,MAX_STARS} from '../public/mounts.js';

const NOW=Date.parse('2026-11-16T20:00:00+07:00');
const seeded=seed=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};
const ctx=()=>{const out=[];return {out,emit:(w,p,text,effect,now,extra)=>out.push({text,effect,...extra}),active:()=>true,audit:()=>{}};};

test('10 tọa kỵ: 5 Thường, 3 VIP, 2 Thần; id không trùng',()=>{
 assert.equal(MOUNTS.length,10);
 assert.deepEqual(['common','vip','divine'].map(t=>MOUNTS.filter(m=>m.tier===t).length),[5,3,2]);
 assert.equal(new Set(MOUNTS.map(m=>m.id)).size,10);
});

test('quay 1 triệu lần (không bảo hiểm): tỉ lệ từng bậc đúng bảng',()=>{
 const rng=seeded(42);
 for(const kind of ['common','vip']){
  const n=1_000_000,count={common:0,vip:0,divine:0};
  for(let i=0;i<n;i++)count[rollMount(kind,{vip:0,divine:0},rng).tier]++;
  assert.ok(Math.abs(count.divine/n-ODDS[kind].divine)<.003,kind+' divine '+count.divine/n);
  assert.ok(Math.abs(count.vip/n-ODDS[kind].vip)<.003,kind+' vip '+count.vip/n);
 }
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
