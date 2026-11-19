// 19/11/2026: người đang chơi bản web tặng quà trên LIVE → quà bị giữ tới khi nhân vật về LIVE (45 s–2 phút).
// Sự kiện skin chỉ 3 phút → về muộn thì trước đây MẤT tiến độ skin. Nay tính theo lúc quà đến + đúng sự kiện lúc đó.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,action,ingest,startVisitor} from '../engine.mjs';
import {createLiveTransfers} from '../web/cloud/live-transfers.mjs';
import {TINH_HA_VISITOR} from '../public/court-rewards.js';

const N=Date.UTC(2026,10,19,3,0,0);
const giftEvent=(id,coins,n=1)=>({event:'gift',data:{userId:id,nickname:'Công Tài',uniqueId:'congtai',diamondCount:coins,repeatCount:n,repeatEnd:true,giftType:1,giftName:'Vương miện',msgId:'m'+id+coins+n}});
function setup(){
 const w=createWorld('demo');w.mode='demo';
 assert.ok(action(w,{type:'join',userId:'u1',name:'Công Tài'},N-120000).ok); // vào LIVE >60 s trước → web được nhận nhân vật
 assert.ok(startVisitor(w,'tinh-ha',N+1000).ok!==false);assert.equal(w.visitor.kind,'tinh-ha');
 const lt=createLiveTransfers({world:w,save(){}});
 assert.equal(lt.apply({generation:1,id:'t1',playerId:'u1',kind:'acquire'},N+2000).ok,true);assert.equal(w.playTransfers.u1.phase,'web');
 return {w,lt};
}
test('quà 500 lúc đang ở web, về LIVE SAU khi sự kiện đóng → vẫn nhận skin + kiếm + biến hình',()=>{
 const {w,lt}=setup();const vid=w.visitor.id,ends=w.visitor.endsAt;
 const r=ingest(w,giftEvent('u1',500),N+5000);assert.equal(r.queuedGift,true);
 assert.equal(w.playTransfers.u1.gifts[0].vhQueued.visitorId,vid);
 // sự kiện hết, sau đó web mới trả nhân vật
 const later=ends+60000;w.visitor.closedAt=ends;
 const player=structuredClone(w.playTransfers.u1.player);
 assert.equal(lt.apply({generation:1,id:'t1',playerId:'u1',kind:'release',player},later).ok,true);
 const p=w.players.u1;
 assert.ok(p.rewardSkins.includes(TINH_HA_VISITOR.skin),'đã nhận skin');assert.equal(p.skinChoice,TINH_HA_VISITOR.skin);
 assert.ok(p.artifacts.includes(TINH_HA_VISITOR.artifact),'đã nhận Tinh Hà Kiếm');
 assert.ok(w.events.some(e=>e.user==='u1'&&e.effect==='transform'&&e.transform==='tinh-ha'),'có màn biến hình');
});
test('quà tặng lúc KHÔNG có sự kiện skin thì về sau không được tính vào skin',()=>{
 const {w,lt}=setup();w.visitor.closedAt=N+3000;w.visitor.endsAt=N+3000;
 ingest(w,giftEvent('u1',500),N+5000);assert.equal(w.playTransfers.u1.gifts[0].vhQueued.visitorId,null);
 const player=structuredClone(w.playTransfers.u1.player);lt.apply({generation:1,id:'t1',playerId:'u1',kind:'release',player},N+9000);
 assert.ok(!(w.players.u1.rewardSkins||[]).includes(TINH_HA_VISITOR.skin));
});
test('tặng thẳng trên LIVE (không qua web) vẫn như cũ: 500 = skin + kiếm + biến hình',()=>{
 const w=createWorld('demo');action(w,{type:'join',userId:'u2',name:'Đế giang'},N);startVisitor(w,'tinh-ha',N+1000);
 ingest(w,giftEvent('u2',500),N+5000);const p=w.players.u2;
 assert.ok(p.rewardSkins.includes(TINH_HA_VISITOR.skin));assert.ok(p.artifacts.includes(TINH_HA_VISITOR.artifact));
 assert.ok(w.events.some(e=>e.user==='u2'&&e.effect==='transform'&&e.transform==='tinh-ha'));
});
test('cộng dồn nhiều món trong sự kiện: 5 × 100 = đủ 500',()=>{
 const w=createWorld('demo');action(w,{type:'join',userId:'u3',name:'A'},N);startVisitor(w,'tinh-ha',N+1000);
 for(let i=0;i<5;i++){const e=giftEvent('u3',100);e.data.msgId='x'+i;ingest(w,e,N+5000+i*3000);}
 assert.ok(w.players.u3.rewardSkins.includes(TINH_HA_VISITOR.skin));
});
test('19/11: sở hữu skin sự kiện → tự mặc pháp bảo đi kèm (kể cả khi túi có món mạnh hơn); đổi skin khác thì về món mạnh nhất',async()=>{
 const {autoEquipBest,skinArtifactOf}=await import('../engine.mjs');
 const w=createWorld('demo');action(w,{type:'join',userId:'u4',name:'B'},N);const p=w.players.u4;
 p.artifacts.push('thien-kinh','tien-de-an');startVisitor(w,'tinh-ha',N+1000);
 ingest(w,giftEvent('u4',500),N+5000);
 assert.equal(skinArtifactOf(p),TINH_HA_VISITOR.artifact);assert.equal(p.equipped,TINH_HA_VISITOR.artifact);
 autoEquipBest(p);assert.equal(p.equipped,TINH_HA_VISITOR.artifact,'lần tự xếp đồ sau vẫn giữ');
 p.skinChoice=null;autoEquipBest(p);assert.notEqual(skinArtifactOf(p),TINH_HA_VISITOR.artifact);
 p.equipPin='thien-kinh';p.skinChoice=TINH_HA_VISITOR.skin;autoEquipBest(p);assert.equal(p.equipped,'thien-kinh','ghim tay quản trị ưu tiên');
});
