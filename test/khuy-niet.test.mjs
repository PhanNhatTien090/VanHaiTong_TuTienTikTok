import test from 'node:test';import assert from 'node:assert/strict';import {createCanvas,loadImage} from '@napi-rs/canvas';
import {createWorld,ensurePlayer,startVisitor,action,tick} from '../engine.mjs';
import {KHUY_SKIN,KHUY_DRAGON,drawKhuyBody,drawKhuyAdornment,khuyStrike,khuyDragonPose,khuyWorn} from '../public/khuy-niet.js';
import {sliceTudoSkin,trimBlade} from '../public/tudo-ma-ton.js';import {drawTransform} from '../public/transform-fx.js';
import {VISITORS} from '../public/visitor-event.js';import {SPECIAL_SKINS} from '../public/patrons.js';import {speechPlan} from '../speech-lines.mjs';
const N=1800000000000;
test('Khuy Niết Lôi Tôn: 5 phút, cơ duyên miễn phí, 300 coin skin, 500 coin Tử Lôi Long, không trùng quà',()=>{
 const w=createWorld('live');w.settings.autoEvents=false;w.settings.residents=false;w.nextBossAt=N+1e9;
 const p=ensurePlayer(w,'a','An',N);assert.equal(startVisitor(w,'khuyniet',N).ok,true);assert.equal(w.visitor.endsAt-N,300000);
 assert.equal(VISITORS.khuyniet.how,'Gõ cơ duyên để nhận quà, có thể sở hữu skin');
 assert.equal(action(w,{type:'chat',userId:'a',text:'cơ duyên'},N+1000).ok,true);assert.ok(w.visitor.players.a.awarded);
 const gift=(coins,eventId,now)=>action(w,{type:'gift',userId:'a',name:'An',gift:'Rose',coins,count:1,eventId},now);
 gift(299,'g1',N+2000);assert.ok(!(p.rewardSkins||[]).includes(KHUY_SKIN));gift(1,'g2',N+3000);assert.ok(p.rewardSkins.includes(KHUY_SKIN));assert.equal(khuyWorn(p),true);
 gift(1,'g2',N+3100);assert.equal(w.visitor.giftProgress.a.coins,300);
 assert.ok(!(p.artifacts||[]).includes(KHUY_DRAGON));gift(199,'g3',N+4000);assert.ok(!p.artifacts.includes(KHUY_DRAGON));gift(1,'g4',N+5000);assert.equal(p.artifacts.filter(x=>x===KHUY_DRAGON).length,1);
 const restored=JSON.parse(JSON.stringify(w));tick(restored,N+300001);assert.ok(restored.players.a.rewardSkins.includes(KHUY_SKIN));
 assert.ok(SPECIAL_SKINS.some(s=>s.id===KHUY_SKIN&&s.name==='Khuy Niết Lôi Tôn'));
 const line=speechPlan({visitorStart:true,visitorKind:'khuyniet'}).map(x=>x.text).join(' ');assert.match(line,/Khuy Niết Lôi Tôn/);assert.match(line,/có thể sở hữu skin/);assert.doesNotMatch(line,/coin|\d/);
});
test('ảnh 4 ô có alpha thật, rồng cắt sát, hiệu ứng vẽ được ở mọi lớp, màn giáng thế không rò trạng thái canvas',async()=>{
 const frames=sliceTudoSkin(await loadImage('public/assets/khuy-niet-v1/skin.png'),createCanvas);assert.equal(frames.length,4);
 for(const f of frames){assert.ok(f);const bytes=f.getContext('2d').getImageData(0,0,384,512).data;let transparent=0,solid=0;for(let i=3;i<bytes.length;i+=4){if(bytes[i]===0)transparent++;if(bytes[i]>220)solid++;}assert.ok(transparent>30000,'transparent '+transparent);assert.ok(solid>10000,'solid '+solid);}
 const dragon=trimBlade(await loadImage('public/assets/khuy-niet-v1/dragon.png'),createCanvas);assert.ok(dragon&&dragon.width>200);
 const c=createCanvas(540,960).getContext('2d'),scene={motion:true,budget:{level:'light'},khuySkinArt:frames,khuyDragonArt:dragon,surfaceFactory:(w,h)=>createCanvas(w,h)};
 const p={id:'a',gender:'nu',skinChoice:KHUY_SKIN,rewardSkins:[KHUY_SKIN],equipped:KHUY_DRAGON},before=JSON.stringify(p),target={id:'a',player:p,x:450,y:800,scale:3};
 for(const t of [0,1000,3000,7340,9100])for(const stand of [0,1]){assert.equal(drawKhuyBody(scene,c,p,{stand},t),true);for(const layer of ['back','front'])drawKhuyAdornment(scene,c,{...target,pose:{stand}},t,layer);assert.equal(c.globalAlpha,1);assert.equal(c.globalCompositeOperation,'source-over');}
 assert.equal(JSON.stringify(p),before);
 const q={id:'b',equipped:KHUY_DRAGON};assert.equal(drawKhuyBody(scene,c,q,{stand:1},0),false);drawKhuyAdornment(scene,c,{id:'b',player:q,x:200,y:800,scale:2},0,'back');
 const strikes=[],roars=[];for(let t=0;t<20000;t+=20){strikes.push(khuyStrike(t,77).flash);roars.push(khuyDragonPose(t,77).roar);}assert.ok(Math.max(...strikes)>.9);assert.ok(Math.max(...roars)>.9);
 assert.equal(khuyStrike(5000,77,false).flash,0);assert.deepEqual(khuyDragonPose(0,77,false),khuyDragonPose(9000,77,false));
 for(const k of [.05,.3,.46,.6,.9])for(const layer of ['back','front']){drawTransform(c,{transform:'khuyniet'},1000,k,{x:450,y:900,scale:1.6},1600,layer);assert.equal(c.globalAlpha,1);assert.equal(c.globalCompositeOperation,'source-over');}
});
