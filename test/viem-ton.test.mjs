import test from 'node:test';import assert from 'node:assert/strict';import {createCanvas,loadImage} from '@napi-rs/canvas';
import {createWorld,ensurePlayer,action,VIEM_SKIN_ID,VIEM_LUYENCONG_QI} from '../engine.mjs';
import {VIEM_SKIN,VIEM_BLADES,drawViemBody,drawViemAdornment,viemBurst,viemBladePose,fitFrame,viemWorn} from '../public/viem-ton.js';
const N=1800000000000;
test('luyencong: chỉ người mặc Phần Thiên Viêm Tôn; ×1,5 so với tuluyen; chung hồi 10 s',()=>{
 assert.equal(VIEM_SKIN_ID,VIEM_SKIN);assert.equal(VIEM_LUYENCONG_QI,9);
 const w=createWorld('live');w.settings.autoEvents=false;w.settings.residents=false;w.nextBossAt=N+1e9;
 const a=ensurePlayer(w,'a','An',N),b=ensurePlayer(w,'b','Bình',N);
 a.rewardSkins=[VIEM_SKIN];a.skinChoice=VIEM_SKIN;assert.equal(viemWorn(a),true);
 const r0=action(w,{type:'chat',userId:'b',text:'luyencong'},N+1000);assert.equal(r0.ok,false);assert.match(r0.message||r0.error||'',/Phần Thiên Viêm Tôn/);
 const qa=a.qi;assert.equal(action(w,{type:'chat',userId:'a',text:'luyện công'},N+1000).ok,true);const da=a.qi-qa;
 assert.equal(action(w,{type:'chat',userId:'a',text:'luyencong'},N+5000).ok,false,'chung hồi');
 assert.equal(action(w,{type:'chat',userId:'a',text:'tuluyen'},N+6000).ok,false,'chung hồi với tuluyen');
 const qb=b.qi;assert.equal(action(w,{type:'chat',userId:'b',text:'tuluyen'},N+1000).ok,true);const db=b.qi-qb;
 assert.ok(db>0&&da>db,`luyencong ${da} > tuluyen ${db}`);
});
test('ảnh thật có alpha; hiệu ứng + song đao vẽ được mọi lớp/tư thế, không rò trạng thái canvas',async()=>{
 const stand=fitFrame(await loadImage('public/assets/viem-ton-v1/stand.png'),createCanvas),seat=await loadImage('public/assets/viem-ton-v1/seat.png');assert.ok(stand&&seat.width>seat.height);
 const c=createCanvas(540,960).getContext('2d'),scene={motion:true,budget:{level:'light'},viemSkinArt:[stand,stand,seat,seat],surfaceFactory:(w,h)=>createCanvas(w,h)};
 const p={id:'a',gender:'nam',skinChoice:VIEM_SKIN,rewardSkins:[VIEM_SKIN],equipped:VIEM_BLADES},before=JSON.stringify(p),target={id:'a',player:p,x:450,y:800,scale:3};
 for(const t of [0,1000,5000,8000,9500])for(const stand of [0,1]){assert.equal(drawViemBody(scene,c,p,{stand},t),true);for(const layer of ['back','front'])drawViemAdornment(scene,c,{...target,pose:{stand}},t,layer);assert.equal(c.globalAlpha,1);assert.equal(c.globalCompositeOperation,'source-over');}
 assert.equal(JSON.stringify(p),before);
 const q={id:'b',equipped:VIEM_BLADES};assert.equal(drawViemBody(scene,c,q,{stand:1},0),false);drawViemAdornment(scene,c,{id:'b',player:q,x:200,y:800,scale:2},0,'front');
 const bursts=[],flies=[];for(let t=0;t<25000;t+=20){bursts.push(viemBurst(t,77).burst);flies.push(viemBladePose(t,77).fly);}assert.ok(Math.max(...bursts)>.9);assert.ok(Math.max(...flies)>.9);
 assert.equal(viemBurst(5000,77,false).burst,0);assert.equal(viemBladePose(5000,77,false).fly,0);
});
