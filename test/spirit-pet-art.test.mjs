import {test} from 'node:test';import assert from 'node:assert/strict';import {createCanvas,loadImage} from '@napi-rs/canvas';
import {SPIRIT_PETS} from '../public/spirit-pets.js';import {slicePetFrames,drawPet} from '../public/spirit-pet-art.js';
test('five real transparent PNGs animate with bounded 160px cached frames and reduced motion',async()=>{
 const scene={petArt:new Map(),motion:true,budget:{level:'light'},petArrivals:new Map([['a',0]])};
 for(const pet of SPIRIT_PETS){const im=await loadImage('public/assets/spirit-pets-v1/'+pet.id+'.png'),frames=slicePetFrames(im,pet.id,createCanvas);assert.equal(frames.length,3);scene.petArt.set(pet.id,frames);
  for(const frame of frames){assert.equal(frame.width,160);const bytes=frame.getContext('2d').getImageData(0,0,160,160).data;let clear=0,solid=0;for(let i=3;i<bytes.length;i+=4){clear+=bytes[i]===0;solid+=bytes[i]>200;}assert.ok(clear>1000&&solid>500);}
  const target={player:{id:'a',spiritPet:pet.id},x:70,y:100,scale:2},before=JSON.stringify(target),canvas=createCanvas(240,220),c=canvas.getContext('2d');
  const render=t=>{c.clearRect(0,0,240,220);drawPet(scene,c,target,t);return canvas.toBuffer('image/png');};assert.notDeepEqual(render(1200),render(1700));scene.motion=false;scene.petArrivals.clear();assert.deepEqual(render(1000),render(4000));scene.motion=true;assert.equal(JSON.stringify(target),before);
 }
 assert.equal([...scene.petArt.values()].flat().reduce((n,f)=>n+f.width*f.height*4,0),1536000,'all five companions use 1.47 MiB bitmap cache');
});
