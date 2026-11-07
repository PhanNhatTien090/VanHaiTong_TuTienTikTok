import test from 'node:test';import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {observeViewerCount,liveAudienceCount,audienceTier} from '../public/crowd-policy.js';
import {RenderBudget} from '../public/performance.js';
import {drawRitual} from '../public/live-cinema.js';
import {drawWings} from '../public/boss-arena.js';
test('fresh TikFinity audience overrides retained active profiles, including zero; stale or malformed counts fall back',()=>{
 const state={players:Array.from({length:36},()=>({active:true})),connection:{}};
 assert.equal(observeViewerCount(state.connection,{event:'roomUser',data:{viewerCount:15}},1000),true);assert.equal(liveAudienceCount(state,1100),15);
 observeViewerCount(state.connection,{event:'roomUser',data:{viewerCount:0}},1200);assert.equal(liveAudienceCount(state,1300),0);assert.equal(liveAudienceCount(state,122000),36);
 assert.equal(observeViewerCount(state.connection,{event:'roomUser',data:{viewerCount:null}},1400),false);assert.equal(state.connection.viewerCount,0);
 assert.deepEqual([9,10,14,15,19,20,21].map(audienceTier),[0,10,10,15,15,20,21]);
});
test('audience rises and falls through 10, 15, 20 without lowering output sharpness',()=>{
 const b=new RenderBudget();for(const n of [9,10,15,20,25,20,15,10,9]){b.setAudience(n);assert.equal(b.config.width,1080);assert.ok(b.config.spriteScale>=2.5);assert.equal(b.audienceTier,audienceTier(n));}assert.equal(b.level,'balanced');
});
test('wings draw at the strongest crowd level',()=>{
 let drawn=0;const scene={heavyCrowd:true,crowded:true,compact:false,motion:false,arenaArt:{wings:{complete:true,naturalWidth:400,naturalHeight:200}}},c={save(){},restore(){},translate(){},scale(){},drawImage(){drawn++;}};drawWings(scene,c,{x:200,y:300,scale:1,player:{id:'a',giftCoins:1}},0);assert.equal(drawn,1);
});
test('breakthrough drawing always gets full detail and restores crowd state afterwards',()=>{
 const budget=new RenderBudget('light');budget.setAudience(40);const seen=[],scene={budget,crowded:true,heavyCrowd:true,reducePresence:true,compact:true,motion:false,players:[],drawPlayer(){seen.push([this.budget.level,this.crowded,this.heavyCrowd,this.compact]);},drawFlyingSword(){}};
 const e={effect:'breakthrough',user:'a',name:'A',start:0,duration:26000,toRealm:11,fromRealm:10,visualFrom:{id:'a',realm:10},visualTo:{id:'a',realm:11}};drawRitual(scene,createCanvas(900,1600).getContext('2d'),e,4000,1600);assert.ok(seen.length>0);assert.ok(seen.every(x=>x[0]==='high'&&x.slice(1).every(v=>v===false)));assert.equal(scene.budget,budget);assert.equal(scene.heavyCrowd,true);assert.equal(scene.crowded,true);
});
