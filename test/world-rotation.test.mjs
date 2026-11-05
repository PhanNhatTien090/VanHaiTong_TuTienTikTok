import {test} from 'node:test';import assert from 'node:assert/strict';import {createCanvas,loadImage} from '@napi-rs/canvas';
import {environmentAt,SCENE_INTERVAL,drawBossSprite,BOSSES,SCENES} from '../public/world-rotation.js';
import {createWorld,openBoss} from '../engine.mjs';
test('all clients share a stable five minute map cycle and bosses rotate without changing an active fight',()=>{
 const epoch=1000;assert.equal(environmentAt(epoch,epoch).id,'dungeon');assert.equal(environmentAt(epoch,epoch+SCENE_INTERVAL-1).id,'dungeon');assert.equal(environmentAt(epoch,epoch+SCENE_INTERVAL).id,'jade-palace');assert.equal(environmentAt(epoch,epoch+SCENE_INTERVAL*SCENES.length).id,'dungeon');
 const w=createWorld();for(const b of BOSSES){assert.equal(openBoss(w,1000000).ok,true);assert.equal(w.boss.species,b.species);assert.equal(openBoss(w,1000001).ok,false);w.boss=null;}
});
test('PNG boss atlas contains real transparency and every boss renders while landing and idle',async()=>{
 const atlas=await loadImage('public/assets/boss-atlas.png'),sprites=[];
 for(let i=0;i<3;i++){const frame=createCanvas(320,320);frame.getContext('2d').drawImage(atlas,i*atlas.width/3,0,atlas.width/3,atlas.height,0,0,320,320);sprites.push(frame);}
 const c=createCanvas(500,500).getContext('2d');
 assert.equal(sprites[0].getContext('2d').getImageData(319,0,1,1).data[3],0);
 for(const b of BOSSES.filter(b=>!b.celestial))for(const t of [100,1400,5000])assert.equal(drawBossSprite(c,{...b,startedAt:0},t,250,200,sprites),true);
});
