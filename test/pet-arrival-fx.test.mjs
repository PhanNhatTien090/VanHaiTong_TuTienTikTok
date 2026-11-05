import {test} from 'node:test';import assert from 'node:assert/strict';import {createCanvas,loadImage} from '@napi-rs/canvas';
import {petArrivalProfile,petArrivalPath,drawPetArrival,drawPetArrivalTitle} from '../public/pet-arrival-fx.js';import {slicePetFrames} from '../public/spirit-pet-art.js';
import {presentationDuration,presentationPriority,PresentationQueue} from '../public/presentation.js';
test('VIP awards have their own queued presentation duration and cannot coalesce into ordinary activity',()=>{
 const low={id:'low',petAward:true,petId:'ember-fox',effect:'pet',user:'a'},phx={...low,id:'phx',petId:'sun-phoenix'},dragon={...low,id:'dragon',petId:'astral-dragon'};
 assert.equal(presentationDuration(phx),6000);assert.equal(presentationDuration(dragon),7500);assert.ok(presentationPriority(dragon)>presentationPriority(low));assert.equal(petArrivalProfile({effect:'pet'}),null);
 const q=new PresentationQueue(6);q.push(low,1);q.push(phx,2);q.push(dragon,3);assert.equal(q.items.length,3);assert.equal(q.take(4).id,'phx');
 const target={x:450,y:700,scale:1.4},end=petArrivalPath(1,target,true);assert.equal(end.x,492);assert.ok(Math.abs(end.y-688.8)<.001);assert.notDeepEqual(petArrivalPath(.2,target),petArrivalPath(.5,target));
});
test('phoenix and dragon award renders real animated sprites and a screen-space name without mutating target',async()=>{
 for(const petId of ['sun-phoenix','astral-dragon']){
  const frames=slicePetFrames(await loadImage('public/assets/spirit-pets-v1/'+petId+'.png'),petId,createCanvas),scene={motion:true,budget:{level:'light'},petArt:new Map([[petId,frames]])},event={petAward:true,petId,name:'Đạo hữu thử',start:0,duration:petArrivalProfile({petAward:true,petId}).duration},target={x:450,y:700,scale:1.4},before=JSON.stringify(target),canvas=createCanvas(900,1400),c=canvas.getContext('2d');
  const render=k=>{c.clearRect(0,0,900,1400);drawPetArrival(scene,c,event,k*event.duration,target,1400,'back');drawPetArrival(scene,c,event,k*event.duration,target,1400,'front');drawPetArrivalTitle(c,event,k*event.duration,1400);return canvas.toBuffer('image/png');};
  assert.notDeepEqual(render(.3),render(.6));assert.equal(JSON.stringify(target),before);assert.ok(render(.45).length>5000);
 }
});
