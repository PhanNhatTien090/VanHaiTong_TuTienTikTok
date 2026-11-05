import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {daiThuaState,swordPoint,sliceRitualSwords,drawDaiThuaAwakening} from '../public/dai-thua-awakening.js';
import {chanTienState,drawChanTienAwakening} from '../public/chan-tien-awakening.js';
import {breakthroughDuration} from '../public/breakthrough-fx.js';
test('Dai Thua sword flights converge continuously into the body before outfit reveal',()=>{
 const at=t=>daiThuaState(t/22.8);
 assert.equal(breakthroughDuration({toRealm:7}),22800);assert.equal(at(19.29).revealed,false);assert.equal(at(19.31).revealed,true);
 for(let i=0;i<72;i++){const p=swordPoint(at(17.8),i,72);assert.ok(Math.abs(p.x-450)<8);assert.ok(Math.abs(p.y-(1600*.69-150))<1e-8);}
 for(const t of [2,5.5,8.8,11.8,15,17.8])for(let i=0;i<24;i++){const a=swordPoint(at(t-1e-5),i,24),b=swordPoint(at(t+1e-5),i,24);assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<.1);}
});
test('Chan Tien has nine sequential steps and a pearl that reaches the lifted actor',()=>{
 const at=t=>chanTienState(t/31.6);
 assert.equal(breakthroughDuration({toRealm:8}),31600);assert.equal(at(11).steps.reduce((a,b)=>a+b),0);assert.deepEqual(at(21.5).steps,Array(9).fill(1));
 assert.ok(Math.abs(at(27.2).pearlY-(at(27.2).feet-145))<1e-8);assert.equal(at(27.59).revealed,false);assert.equal(at(27.61).revealed,true);
 assert.equal(chanTienState(.6,1600,false).motion,false);assert.equal(at(31.6).fade,0);
});
test('both rituals preserve the event and draw the old and new outfits at the correct milestones',async()=>{
 const previous=globalThis.document;globalThis.document={createElement:()=>createCanvas(1,1)};
 try{
 const art=sliceRitualSwords(await loadImage('public/assets/events-v1/prestige-swords-v1.png'),createCanvas);
 for(const [realm,duration,draw,times,expected]of [[7,22800,drawDaiThuaAwakening,[1,7,14,19.29,19.31,22],[6,7]],[8,31600,drawChanTienAwakening,[1,9,23,27.59,27.61,31],[7,8]]]){
  const p={id:'a',realm:realm-1},e={id:'x',user:'a',name:'A',start:0,duration,visualFrom:p,visualTo:{...p,realm}},before=JSON.stringify(e),seen=[],c=createCanvas(900,1600).getContext('2d'),scene={players:[p],budget:{level:'light'},motion:false,cameraEnabled:true,ritualSwords:art,drawPlayer:(c,p)=>seen.push(p.realm)};
  for(const t of times){const ui=draw(scene,c,e,t*1000,1600);assert.equal(ui.realm,realm);assert.equal(ui.shake,0);assert.equal(c.globalCompositeOperation,'source-over');}
  assert.deepEqual([...new Set(seen)],expected);assert.equal(JSON.stringify(e),before);assert.ok(scene.hoaThanActor.frames.size<=2);
 }
 }finally{globalThis.document=previous;}
});
