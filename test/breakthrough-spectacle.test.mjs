import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {breakthroughPower,sliceSpectacle,drawBreakthroughSpectacle} from '../public/breakthrough-spectacle.js';
import {breakthroughDuration} from '../public/breakthrough-fx.js';

test('authored early rituals and later realms retain authored duration and increasing visual budgets',()=>{
 let last=null,lastDuration=0;
 for(let r=1;r<=18;r++){const duration=breakthroughDuration({toRealm:r}),p=breakthroughPower(r);if(r!==9)assert.ok(duration>lastDuration);if(r===1)assert.equal(duration,8800);else if(r===2)assert.equal(duration,10800);else if(r===3)assert.equal(duration,11800);else if(r===4)assert.equal(duration,14400);else if(r===5)assert.equal(duration,17600);else if(r===6)assert.equal(duration,20800);else if(r===7)assert.equal(duration,22800);else if(r===8)assert.equal(duration,31600);else if(r===9)assert.equal(duration,26000);else if(r!==10)assert.ok(duration-lastDuration>=200&&duration-lastDuration<=500);if(last){assert.ok(p.radius>last.radius);assert.ok(p.rays>last.rays);assert.ok(p.streams>last.streams);assert.ok(p.shake>last.shake);assert.ok(p.tier>=last.tier);assert.ok(p.shockwaves>=last.shockwaves);}last=p;lastDuration=duration;}
 assert.equal(breakthroughPower(5).dragon,false);assert.equal(breakthroughPower(6).dragon,true);assert.equal(breakthroughPower(10).phoenix,true);assert.equal(breakthroughPower(14).cosmos,true);
});
test('six real alpha sprites animate through every realm with bounded work',async()=>{
 const im=await loadImage('public/assets/breakthrough-v3/celestial-spectacle.png'),art=sliceSpectacle(im,createCanvas),c=createCanvas(900,1600).getContext('2d');assert.equal(art.length,6);
 const hashes=new Set();for(const tile of art){assert.equal(tile.getContext('2d').getImageData(0,0,1,1).data[3],0);hashes.add(tile.toBuffer('image/png').toString('base64'));}assert.equal(hashes.size,6);
 const scene={motion:true,budget:{level:'light'},breakthroughSpectacle:art};let draws=0;const original=c.drawImage.bind(c);c.drawImage=(...args)=>{draws++;return original(...args);};
 for(let realm=1;realm<=18;realm++)for(const k of [.1,.4,.6,.71,.8,.95]){draws=0;for(const layer of ['back','front'])drawBreakthroughSpectacle(scene,c,{k,realm,color:'#ffe09a'},k*10000,1600,layer);assert.ok(draws<=12,'PNG draw budget stays bounded');}
 c.clearRect(0,0,900,1600);drawBreakthroughSpectacle(scene,c,{k:.6,realm:18,color:'#ffe09a'},5000,1600);const a=c.canvas.toBuffer('image/png');c.clearRect(0,0,900,1600);drawBreakthroughSpectacle(scene,c,{k:.6,realm:18,color:'#ffe09a'},6000,1600);assert.notDeepEqual(c.canvas.toBuffer('image/png'),a);
});
