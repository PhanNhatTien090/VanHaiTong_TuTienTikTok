import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {impactChoreography,sliceImpactArt,drawAscensionImpact} from '../public/ascension-impact.js';
import {sliceSpectacle} from '../public/breakthrough-spectacle.js';

test('phoenix shrinks into the actor while dragon/palm grow toward the screen and finish before the return',()=>{
 const a=impactChoreography(10,.52),b=impactChoreography(10,.69);assert.ok(b.phoenixSize<a.phoenixSize);assert.ok(b.absorb>a.absorb);assert.equal(a.phoenix,true);
 assert.ok(impactChoreography(6,.70).dragonSize>impactChoreography(6,.58).dragonSize*5);assert.equal(impactChoreography(5,.70).dragon,false);
 assert.equal(impactChoreography(13,.70).palm,false);assert.equal(impactChoreography(14,.70).palm,true);assert.ok(impactChoreography(18,.70).palmSize>impactChoreography(18,.63).palmSize*3);
 assert.equal(impactChoreography(18,.665).flightAlpha,0,'supreme dragon clears before the palm reaches the lens');assert.ok(impactChoreography(18,.60).flightAlpha>0);
 assert.equal(impactChoreography(18,.99).flightAlpha,0);assert.equal(impactChoreography(18,.99).crackAlpha,0);
 assert.equal(impactChoreography(18,.71,false).flightAlpha,0);assert.equal(impactChoreography(18,.73,false).crackAlpha,0);
});
test('new dragon/palm PNGs preserve alpha and deterministic effects stay bounded with reduced motion',async()=>{
 const im=await loadImage('public/assets/breakthrough-v3/dragon-palm-impact.png'),art=sliceImpactArt(im,createCanvas),beasts=sliceSpectacle(await loadImage('public/assets/breakthrough-v3/celestial-spectacle.png'),createCanvas);
 assert.equal(art.length,2);for(const f of art)assert.equal(f.getContext('2d').getImageData(0,0,1,1).data[3],0);
 const canvas=createCanvas(900,1600),c=canvas.getContext('2d'),scene={motion:true,budget:{level:'light'},ascensionImpactArt:art,breakthroughSpectacle:beasts};
 let draws=0;const original=c.drawImage.bind(c);c.drawImage=(...args)=>{draws++;return original(...args);};
 for(const realm of [1,5,6,10,13,14,18])for(const k of [.1,.5,.6,.69,.71,.75,.9,.99]){draws=0;const s={k,realm,color:'#ffe6a0'},before=JSON.stringify(s);for(const layer of ['back','front'])drawAscensionImpact(scene,c,s,6000,1600,layer);assert.ok(draws<=6);assert.equal(JSON.stringify(s),before);}
 c.clearRect(0,0,900,1600);drawAscensionImpact(scene,c,{k:.74,realm:18,color:'#ffe6a0'},6000,1600,'front');const a=canvas.toBuffer('image/png');c.clearRect(0,0,900,1600);drawAscensionImpact(scene,c,{k:.74,realm:18,color:'#ffe6a0'},6000,1600,'front');assert.deepEqual(canvas.toBuffer('image/png'),a);
 scene.motion=false;draws=0;drawAscensionImpact(scene,c,{k:.71,realm:18,color:'#ffe6a0'},6000,1600,'front');assert.equal(draws,0);
});
