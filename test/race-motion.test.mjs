import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {raceFlightPose,drawRaceMotion} from '../public/race-motion.js';
import {raceTargets} from '../public/sword-race.js';
import {createWorld,ensurePlayer,startRace,action,tick} from '../engine.mjs';
const N=1800000000000;
test('boosted flight leans and lifts, while reduced motion is time-independent',()=>{
 const a={id:'a',boost:true,kick:.9},normal=raceFlightPose({id:'a'},1000),boost=raceFlightPose(a,1000);
 assert.ok(boost.lean>normal.lean);assert.ok(boost.lift<normal.lift);
 assert.deepEqual(raceFlightPose(a,0,false),raceFlightPose(a,9000,false));
});
test('wind, launch and finish effects change over time, restore canvas state and remain bounded',()=>{
 const scene={motion:true,height:1600,budget:{level:'light'},raceStatus:{active:true},targets:Array.from({length:8},(_,i)=>({id:'a'+i,x:80+i*100,y:600+i*80,scale:1.5,boost:true,gift:{coins:1000+i*1000},launchAge:700,finishAge:i===0?800:null}))};
 const render=t=>{const canvas=createCanvas(450,800),c=canvas.getContext('2d');c.scale(.5,.5);c.globalAlpha=.8;
  drawRaceMotion(scene,c,t,'back');drawRaceMotion(scene,c,t,'front');assert.equal(c.globalAlpha,.8);return canvas.toBuffer('image/png');};
 const a=render(1000),b=render(1400);assert.notDeepEqual(a,b);assert.ok(a.length>1000);
 scene.motion=false;assert.deepEqual(render(1000),render(1400));
});
test('race position smoothing follows elapsed time instead of render frame count',()=>{
 const p={id:'a'},r={id:'a',startedAt:N,speed:0,bonus:100},state={phase:'running',racers:[r]},make=()=>({motion:true,raceStatus:state,raceServerNow:N,raceReceivedAt:0,raceY:new Map([['a',1200]]),raceX:new Map([['a',450]]),raceFrameAt:0});
 const slow=make(),fast=make();let a,b;
 for(let t=1000/30;t<=1000+.01;t+=1000/30)a=raceTargets(slow,[p],1600,t)[0];
 for(let t=1000/60;t<=1000+.01;t+=1000/60)b=raceTargets(fast,[p],1600,t)[0];
 assert.ok(Math.abs(a.y-b.y)<.01);
});
test('large gifts exceed the old quota, settle once, and cannot boost an already finished racer',()=>{
 const w=createWorld('live');Object.assign(w.settings,{autoEvents:false,residents:false,blessingMinutes:0});w.nextBossAt=N+1e9;
 for(const id of ['a','b'])ensurePlayer(w,id,id,N);startRace(w,N);
 for(const id of ['a','b'])action(w,{type:'chat',userId:id,text:'bay'},N+1);tick(w,N+45000);
 const gift={type:'gift',userId:'a',coins:1000,eventId:'huge'};action(w,gift,N+46000);
 const r=w.race.racers.find(x=>x.id==='a');assert.equal(r.giftDist,30000);assert.equal(r.finishAt,N+46000);
 action(w,gift,N+46001);assert.equal(r.giftDist,30000);
 action(w,{...gift,eventId:'after-finish'},N+46002);assert.equal(r.giftDist,30000);
});
