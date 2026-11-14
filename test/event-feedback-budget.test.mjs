import test from 'node:test';
import assert from 'node:assert/strict';
import {renderTower} from '../public/tower.js';
import {drawScreenPulse} from '../public/cinematic-feedback.js';
import {plannedActorCount} from '../public/crowd-policy.js';

test('the maze counts visible character bodies separately from finished runners',()=>{
 const runners=Array.from({length:80},(_,i)=>({f:i<23?0:100}));
 assert.equal(plannedActorCount({maze:{active:true,runners}},80),23);
 assert.equal(plannedActorCount({maze:{active:true,runners}},8),8);
 assert.equal(plannedActorCount({maze:{active:true,runners:Array(80).fill({f:0})}},80),40);
});

test('reduced flash skips the full-screen pass and leaves Canvas state alone',()=>{
 let draws=0;
 const c={save(){},restore(){},fillRect(...rect){assert.deepEqual(rect,[0,0,900,1600]);draws++;}};
 drawScreenPulse(c,1600,true,'#fff',.5);
 assert.equal(draws,0);
 assert.equal(c.globalAlpha,undefined);
 drawScreenPulse(c,1600,false,'#fff',1.5,'screen');
 assert.equal(draws,1);
 assert.equal(c.globalAlpha,1);
 assert.equal(c.globalCompositeOperation,'screen');
});

test('tower damage and countdown patch existing nodes, and milestone audio is one-shot',()=>{
 const old=globalThis.document,noop=()=>{};
 const nodes=new Map(['.tw-hp span','.tw-hp i','.tw-time span','.tw-time i','.tw-clock','.tw-guard'].map(key=>[key,{style:{},appendChild:noop}]));
 const classList={add:noop,remove:noop};
 let replaces=0;
 const el={hidden:true,classList,set innerHTML(value){replaces++;},querySelector:key=>nodes.get(key),replaceChildren:noop};
 const previous=globalThis.setTimeout;
 globalThis.document={body:{classList},createElement:()=>({remove:noop})};
 globalThis.setTimeout=()=>0;
 try{
  const tones=[],scene={motion:false,reduceFlash:true,onTowerSound:kind=>tones.push(kind)};
  const tower={id:'t1',active:true,endsAt:40000,cur:{id:'p',name:'P',floor:5,next:5,hp:100,endsAt:26000,guardian:{name:'Hộ vệ',art:0,hue:0}}};
  renderTower(el,{tower},scene,String,1000);
  renderTower(el,{tower:{...tower,cur:{...tower.cur,hp:83}}},scene,String,2200);
  assert.equal(replaces,1);
  assert.equal(nodes.get('.tw-hp span').textContent,'Thủ vệ 83%');
  assert.equal(nodes.get('.tw-time span').textContent,'24s');
  const clear={...tower,last:{seq:1,name:'P',floor:5,qi:100,won:true,mile:true,at:2300}};
  renderTower(el,{tower:clear},scene,String,2400);
  renderTower(el,{tower:clear},scene,String,2500);
  assert.deepEqual(tones,['milestone']);
  renderTower(el,{tower:{...clear,id:'t2',last:{...clear.last,at:2700}}},scene,String,2750);
  assert.deepEqual(tones,['milestone','milestone']);
 }finally{globalThis.document=old;globalThis.setTimeout=previous;}
});
