import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {SCENES,environmentAt} from '../public/world-rotation.js';
import {floatingTargets,sliceFishAtlas,drawWorldAmbience} from '../public/world-ambience.js';
import {QUALITY} from '../public/performance.js';
test('manual maps stay fixed; automatic maps cover four distinct environments',()=>{
 assert.equal(new Set(SCENES.map(s=>environmentAt(0,123456789,s.id).id)).size,SCENES.length);assert.ok(SCENES.length>=8,'4 map mới + 4 cảnh tông môn');
 for(const s of SCENES){assert.equal(environmentAt(0,0,s.id).id,environmentAt(0,999999999,s.id).id);assert.equal(environmentAt(0,0,s.id).changesAt,null);}
 assert.equal(environmentAt(0,0,'invalid').mode,'auto');
});
test('floating formation uses the quality capacity, fits zoom, respects reduced motion and leaves profiles untouched',()=>{
 const players=Array.from({length:500},(_,i)=>({id:String(i)})),original=JSON.stringify(players),s={motion:true,zoom:1.3};
 const a=floatingTargets(s,players,1600,1000),b=floatingTargets(s,players,1600,4000);assert.equal(a.length,QUALITY.light.seats);assert.notDeepEqual(a,b);
 for(const p of a)assert.ok(Math.abs(p.x-450)+45*p.scale<=450*.96/1.3+.1);
 for(const config of Object.values(QUALITY)){const group=floatingTargets({...s,budget:{config}},players,1600,1000);assert.equal(group.length,config.seats);assert.equal(new Set(group.map(p=>p.id)).size,config.seats);for(const p of group)assert.ok(Math.abs(p.x-450)+45*p.scale<=450*.96/1.3+.1);}
 s.motion=false;assert.deepEqual(floatingTargets(s,players,1600,1000),floatingTargets(s,players,1600,9000));assert.equal(JSON.stringify(players),original);
});
test('six transparent sea sprites and all four ambience layers animate without changing game data',async()=>{
 const sprites=sliceFishAtlas(await loadImage('public/assets/worlds-v2/fish-atlas.png'),createCanvas);assert.equal(sprites.length,6);
 for(const f of sprites){const d=f.getContext('2d').getImageData(0,0,128,128).data;let clear=0,solid=0;for(let i=3;i<d.length;i+=4){if(d[i]===0)clear++;if(d[i]>200)solid++;}assert.ok(clear>1000&&solid>100);}
 for(const environment of SCENES){const canvas=createCanvas(450,800),c=canvas.getContext('2d'),s={environment,height:1600,motion:true,budget:{level:'light'},fishSprites:sprites,worldLife:{environment:true}};
 const render=t=>{c.setTransform(.5,0,0,.5,0,0);c.clearRect(0,0,900,1600);for(const layer of ['back','front','screen'])drawWorldAmbience(s,c,t,layer);return canvas.toBuffer('image/png');};
 assert.notDeepEqual(render(1000),render(6000),environment.id);s.motion=false;assert.deepEqual(render(1000),render(6000));s.worldLife.environment=false;render(1000);assert.equal(c.getImageData(225,400,1,1).data[3],0);
 }
});
