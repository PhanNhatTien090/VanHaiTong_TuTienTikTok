import test from 'node:test';import assert from 'node:assert/strict';import {createCanvas,loadImage} from '@napi-rs/canvas';
import {createWorld,ensurePlayer,startVisitor,action,tick} from '../engine.mjs';
import {SEA_SKIN,sliceSeaSkin,drawSeaBody,drawSeaAdornment,seaDragonPosition,seaWorn} from '../public/sea-dragon-heir.js';
import {sliceSpiritAtlas} from '../public/gift-spirit-beasts.js';
const N=1800000000000;
test('Hải Lam is a five-minute event: free claim, exact fixed gift thresholds, duplicate protection and permanent choice',()=>{
 const w=createWorld('live');w.settings.autoEvents=false;w.settings.residents=false;w.nextBossAt=N+1e9;
 const p=ensurePlayer(w,'a','An',N);assert.equal(startVisitor(w,'hailam',N).ok,true);assert.equal(w.visitor.endsAt-N,300000);
 assert.equal(action(w,{type:'chat',userId:'a',text:'cơ duyên'},N+1000).ok,true);assert.ok(w.visitor.players.a.awarded);
 const gift=(coins,eventId,now)=>action(w,{type:'gift',userId:'a',name:'An',gift:'Rose',coins,count:1,eventId},now);
 gift(99,'g1',N+2000);assert.ok(!p.rewardSkins.includes(SEA_SKIN));gift(1,'g2',N+3000);assert.ok(p.rewardSkins.includes(SEA_SKIN));assert.equal(seaWorn(p),true);
 gift(1,'g2',N+3100);assert.equal(w.visitor.giftProgress.a.coins,100);
 gift(200,'g3',N+4000);assert.ok(p.artifacts.includes('sea-dragon-heart'));assert.equal(p.artifacts.filter(x=>x==='sea-dragon-heart').length,1);
 const restored=JSON.parse(JSON.stringify(w));tick(restored,N+300001);assert.ok(restored.players.a.rewardSkins.includes(SEA_SKIN));
});
test('owned skin respects manual outfit choice, excludes simulated NPCs and ends without accepting late gifts',()=>{
 const w=createWorld('live');const p=ensurePlayer(w,'a','An',N);p.skinChoice='ivory-celestial';p.skinChoiceSource='manual';startVisitor(w,'hailam',N);
 action(w,{type:'gift',userId:'a',gift:'Rose',coins:100,count:1,eventId:'g'},N+1000);assert.ok(p.rewardSkins.includes(SEA_SKIN));assert.equal(p.skinChoice,SEA_SKIN,'mua skin sự kiện thì mặc ngay');
 const b=ensurePlayer(w,'b','B',N);action(w,{type:'gift',userId:'b',gift:'Rose',coins:100,count:1,eventId:'late'},N+300001);assert.ok(!(b.rewardSkins||[]).includes(SEA_SKIN));
});
test('four real alpha sprites, cloth motion, glints and the miniature orbit render without player mutation',async()=>{
 const old=globalThis.document;globalThis.document={createElement:()=>createCanvas(1,1)};
 try{
 const frames=sliceSeaSkin(await loadImage('public/assets/sea-dragon-heir-v1/skin-v2.png'),createCanvas);assert.equal(frames.length,4);
 for(const f of frames){const bytes=f.getContext('2d').getImageData(0,0,384,512).data;let transparent=0,solid=0;for(let i=3;i<bytes.length;i+=4){if(bytes[i]===0)transparent++;if(bytes[i]>220)solid++;}assert.ok(transparent>40000);assert.ok(solid>10000);}
 const dragon=sliceSpiritAtlas(await loadImage('public/assets/gift-beasts-v1/dragon.png'),3,createCanvas),c=createCanvas(540,960).getContext('2d'),scene={motion:true,budget:{level:'light'},seaSkinArt:frames,spiritBeasts:{dragon}};
 const p={id:'a',gender:'nu',skinChoice:SEA_SKIN,rewardSkins:[SEA_SKIN]},before=JSON.stringify(p),target={id:'a',player:p,x:450,y:1000,scale:4};
 for(const t of [0,1000,3000,5500])for(const stand of [0,1]){assert.equal(drawSeaBody(scene,c,p,{stand},t),true);for(const layer of ['back','front'])drawSeaAdornment(scene,c,target,t,layer);assert.equal(c.globalAlpha,1);}
 assert.notDeepEqual(seaDragonPosition(0),seaDragonPosition(1000));assert.deepEqual(seaDragonPosition(0,0,false),seaDragonPosition(5000,0,false));assert.equal(JSON.stringify(p),before);
 }finally{globalThis.document=old;}
});
