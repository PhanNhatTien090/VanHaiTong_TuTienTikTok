import test from 'node:test';import assert from 'node:assert/strict';import {createCanvas,loadImage} from '@napi-rs/canvas';
import {createWorld,ensurePlayer,startVisitor,action,tick} from '../engine.mjs';
import {TUDO_SKIN,TUDO_BLADE,sliceTudoSkin,trimBlade,drawTudoBody,drawTudoAdornment,tudoBladePose,tudoWorn} from '../public/tudo-ma-ton.js';
import {VISITORS} from '../public/visitor-event.js';import {SPECIAL_SKINS} from '../public/patrons.js';import {speechPlan} from '../speech-lines.mjs';
const N=1800000000000;
test('Tư Đồ Ma Tôn: 5 phút, cơ duyên miễn phí, 200 coin skin, 300 coin Huyết Sát Ma Đao, không trùng quà',()=>{
 const w=createWorld('live');w.settings.autoEvents=false;w.settings.residents=false;w.nextBossAt=N+1e9;
 const p=ensurePlayer(w,'a','An',N);assert.equal(startVisitor(w,'tudo',N).ok,true);assert.equal(w.visitor.endsAt-N,300000);
 assert.equal(VISITORS.tudo.how,'Gõ cơ duyên để nhận quà, có thể sở hữu skin');
 assert.equal(action(w,{type:'chat',userId:'a',text:'cơ duyên'},N+1000).ok,true);assert.ok(w.visitor.players.a.awarded);
 const gift=(coins,eventId,now)=>action(w,{type:'gift',userId:'a',name:'An',gift:'Rose',coins,count:1,eventId},now);
 gift(199,'g1',N+2000);assert.ok(!(p.rewardSkins||[]).includes(TUDO_SKIN));gift(1,'g2',N+3000);assert.ok(p.rewardSkins.includes(TUDO_SKIN));assert.equal(tudoWorn(p),true);
 gift(1,'g2',N+3100);assert.equal(w.visitor.giftProgress.a.coins,200);
 assert.ok(!p.artifacts.includes(TUDO_BLADE));gift(100,'g3',N+4000);assert.equal(p.artifacts.filter(x=>x===TUDO_BLADE).length,1);
 const restored=JSON.parse(JSON.stringify(w));tick(restored,N+300001);assert.ok(restored.players.a.rewardSkins.includes(TUDO_SKIN));
 assert.ok(SPECIAL_SKINS.some(s=>s.id===TUDO_SKIN&&s.name==='Tư Đồ Ma Tôn'));
 const line=speechPlan({visitorStart:true,visitorKind:'tudo'}).map(x=>x.text).join(' ');assert.match(line,/Tư Đồ Ma Tôn/);assert.match(line,/có thể sở hữu skin/);assert.doesNotMatch(line,/coin|\d/);
});
test('ảnh 4 ô có alpha thật, đao cắt sát, hiệu ứng vẽ được ở mọi lớp và không đổi dữ liệu người chơi',async()=>{
 const frames=sliceTudoSkin(await loadImage('public/assets/tudo-ma-ton-v1/skin.png'),createCanvas);assert.equal(frames.length,4);
 for(const f of frames){assert.ok(f);const bytes=f.getContext('2d').getImageData(0,0,384,512).data;let transparent=0,solid=0;for(let i=3;i<bytes.length;i+=4){if(bytes[i]===0)transparent++;if(bytes[i]>220)solid++;}assert.ok(transparent>30000,'transparent '+transparent);assert.ok(solid>10000,'solid '+solid);}
 const blade=trimBlade(await loadImage('public/assets/tudo-ma-ton-v1/sabre.png'),createCanvas);assert.ok(blade&&blade.height>blade.width*2);
 const c=createCanvas(540,960).getContext('2d'),scene={motion:true,budget:{level:'light'},tudoSkinArt:frames,tudoBladeArt:blade,surfaceFactory:(w,h)=>createCanvas(w,h)};
 const p={id:'a',gender:'nu',skinChoice:TUDO_SKIN,rewardSkins:[TUDO_SKIN]},before=JSON.stringify(p),target={id:'a',player:p,x:450,y:800,scale:3};
 for(const t of [0,1000,3000,7340])for(const stand of [0,1]){assert.equal(drawTudoBody(scene,c,p,{stand},t),true);for(const layer of ['back','front'])drawTudoAdornment(scene,c,{...target,pose:{stand}},t,layer);assert.equal(c.globalAlpha,1);assert.equal(c.globalCompositeOperation,'source-over');}
 assert.equal(JSON.stringify(p),before);
 // chỉ trang bị đao (không mặc skin) vẫn vẽ đao, không vẽ thân Ma Tôn
 const q={id:'b',equipped:TUDO_BLADE};assert.equal(drawTudoBody(scene,c,q,{stand:1},0),false);drawTudoAdornment(scene,c,{id:'b',player:q,x:200,y:800,scale:2},0,'back');
 // đao có nhịp vung, giảm chuyển động thì đứng yên
 const flashes=[];for(let t=0;t<16000;t+=40)flashes.push(tudoBladePose(t,123).flash);assert.ok(Math.max(...flashes)>.9);assert.deepEqual(tudoBladePose(0,123,false),tudoBladePose(9000,123,false));
});
