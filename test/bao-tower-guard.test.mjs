// 18/11 tối: Tháp — Đỉnh hồi máu người leo, Chung khiên chặn đòn thủ vệ (một nửa mức Lôi Đài), sát thương kèm 85%; KHÔNG cộng chỉ số Công
// (mô phỏng: Kiếm GIỚI HẠN ★5 + Công leo vô hạn vì thần thông chém % máu).
import test from 'node:test';import assert from 'node:assert/strict';
import {createWorld,action,tick,startTower} from '../engine.mjs';
const N=Date.UTC(2026,10,11,6);
function climb(items,floor,realm=8){const w=createWorld('demo');Object.assign(w.settings,{residents:false,autoEvents:false,blessingMinutes:0,ceremony:false,quiz:false,envelope:false});w.nextBossAt=N+1e12;
 action(w,{type:'chat',userId:'a',name:'A',text:'nhapmon'},N);const a=w.players.a;a.realm=realm;a.towerFloor=floor-1;if(items)a.bao={p4:0,p5:0,items,lim:null};
 startTower(w,N+10);action(w,{type:'chat',userId:'a',name:'A',text:'6'},N+100);tick(w,N+200);
 const before=a.towerFloor;let t=N+300,lane=null;for(let i=0;i<50;i++){t+=1000;action(w,{type:'chat',userId:'a',name:'A',text:'3'},t);tick(w,t);lane=w.tower.lanes.find(l=>l?.id==='a')||lane;if(!w.tower.lanes.some(l=>l?.id==='a'))break;}
 return {won:a.towerFloor>before,lane};}
const best=items=>{let f=1;while(f<60&&climb(items,f).won)f++;return f-1;};
test('Tháp: thần khí có giới hạn tầng (không leo vô hạn), dòng thủ không yếu hơn dòng đánh',()=>{
 const none=best(null),kiem=best({'L12-huyet-hai-dao':5}),dinh=best({'L05-huyen-hoa-dinh':5}),chung=best({'L02-hon-don-chung':5});
 for(const v of [kiem,dinh,chung])assert.ok(v>none&&v<none+20,`có trần: none ${none}, kiếm ${kiem}, đỉnh ${dinh}, chung ${chung}`);
 assert.ok(best({'L05-huyen-hoa-dinh':1})>=best({'L12-huyet-hai-dao':1})-1,'Đỉnh GIỚI HẠN ★1 không tụt so với Kiếm');
});
test('Tháp: Chung lên khiên chặn đòn thủ vệ',()=>{
 const {lane}=climb({'s5-chung':1},12);assert.ok(lane&&lane.shield!==undefined,'có khiên');
});
