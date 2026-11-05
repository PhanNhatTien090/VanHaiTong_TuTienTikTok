import {test} from 'node:test';import assert from 'node:assert/strict';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {godFormFor,godAuraRadius,drawGodBody,drawGodAuras,drawGodPresence,sliceGodAuraAtlas} from '../public/god-forms.js';
import {divineSelection,sliceDivineAtlas} from '../public/divine-wardrobe.js';
import {sliceSpiritAtlas} from '../public/gift-spirit-beasts.js';
test('only five post-emperor realms use deity bodies; explicit purchased costume choices remain intact',()=>{
 for(let realm=0;realm<14;realm++)assert.equal(godFormFor({realm}),null);
 for(let realm=14;realm<=18;realm++){assert.equal(godFormFor({realm}).rank,realm-14);assert.equal(divineSelection({realm,divineRoles:['elder']}).group,6);}
 assert.equal(godFormFor({realm:18,resident:true}),null);
 const p={realm:14,rewardSkins:['vuonglam-avatar'],skinChoice:'vuonglam-avatar',skinChoiceSource:'manual'};
 assert.equal(godFormFor(p),null);assert.equal(godFormFor({...p,skinChoiceSource:'craft'}).rank,0);
});
test('ten distinct transparent deity sprites animate without altering player ownership or stats',async()=>{
 const art=sliceDivineAtlas(await loadImage('public/assets/god-forms-v1/deities.png'),6,createCanvas,192);
 assert.equal(art.frames.length,10);assert.equal(new Set(art.frames.map(f=>f.toBuffer('image/png').toString('base64'))).size,10);
 for(const f of art.frames)assert.equal(f.getContext('2d').getImageData(0,0,1,1).data[3],0);
 const p={realm:18,gender:'nu',qi:9,rewardSkins:[]},original=JSON.stringify(p),scene={motion:true,budget:{level:'light'},divineArt:new Map([[6,art]])};
 const render=t=>{const c=createCanvas(320,380).getContext('2d');c.translate(160,250);c.scale(2,2);assert.equal(drawGodBody(scene,c,p,{lift:0,lean:0},t),true);return c.canvas.toBuffer('image/png');};
 assert.notDeepEqual(render(1000),render(1800));scene.motion=false;assert.deepEqual(render(1000),render(1800));assert.equal(JSON.stringify(p),original);
});
test('dragons stay within nearby lanes, are capped in crowds, and move continuously',async()=>{
 const dragon=sliceSpiritAtlas(await loadImage('public/assets/gift-beasts-v1/dragon.png'),3,createCanvas,128);
 const scene={motion:true,budget:{level:'light'},spiritBeasts:{dragon},targets:Array.from({length:8},(_,i)=>({id:'a'+i,x:100+i*100,y:300,scale:1.6,player:{realm:14+i%5}}))};
 assert.ok(godAuraRadius(scene,scene.targets[0])*1.6*1.5<50);
 const render=t=>{const c=createCanvas(1000,600).getContext('2d');drawGodAuras(scene,c,t,'back');drawGodAuras(scene,c,t,'front');return c.canvas.toBuffer('image/png');};
 assert.notDeepEqual(render(1000),render(3000));scene.motion=false;assert.deepEqual(render(1000),render(3000));
});

test('every god always has a distinct ongoing presence without PNG dragons, including manual visitor skins',()=>{
 const scene={motion:true,budget:{level:'light'},targets:[]},signatures=new Set();
 for(let realm=14;realm<=18;realm++){
  const p={realm,skinChoice:'vuonglam-avatar',skinChoiceSource:'manual',rewardSkins:['vuonglam-avatar']},a={id:'a',x:160,y:250,scale:1.5,player:p};scene.targets=[a];
  const render=t=>{const c=createCanvas(320,380).getContext('2d');assert.equal(drawGodPresence(scene,c,a,t),true);return c.canvas.toBuffer('image/png');};
  const one=render(1000),two=render(1700);assert.notDeepEqual(one,two);signatures.add(one.toString('base64'));
 }
 assert.equal(signatures.size,5);assert.equal(godFormFor({}),null);
 const a={id:'a',x:100,y:200,scale:1.5,player:{realm:14}},b={...a,id:'b',y:450};scene.targets=[a,b];
 assert.ok(godAuraRadius(scene,a)>18,'another row in the same column must not erase the aura');
});

test('five new PNG auras have transparent padding, distinct artwork and animated rendering',async()=>{
 const atlas=await loadImage('public/assets/god-forms-v1/presence-auras-v1.png'),frames=sliceGodAuraAtlas(atlas,createCanvas,160);
 assert.equal(frames.length,5);assert.equal(new Set(frames.map(f=>f.toBuffer('image/png').toString('base64'))).size,5);
 for(const f of frames){assert.equal(f.width,160);assert.equal(f.height,320);assert.equal(f.getContext('2d').getImageData(0,0,1,1).data[3],0);}
 const a={id:'a',x:160,y:250,scale:1.5,player:{realm:18}},scene={motion:true,budget:{level:'light'},targets:[a],godAuraArt:frames};
 const render=t=>{const c=createCanvas(320,400).getContext('2d');drawGodPresence(scene,c,a,t);return c.canvas.toBuffer('image/png');};
 assert.notDeepEqual(render(1000),render(1700));scene.motion=false;assert.deepEqual(render(1000),render(1700));
 assert.equal(frames.reduce((n,f)=>n+f.width*f.height*4,0),1024000);
});
