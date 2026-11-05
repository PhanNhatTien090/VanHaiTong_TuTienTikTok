import {test} from 'node:test';import assert from 'node:assert/strict';import {createCanvas} from '@napi-rs/canvas';
import {Scene} from '../public/scene.js';import {createWorld,ensurePlayer,REALMS,requiredQi,requiredStones,readyToBreak,snapshot} from '../engine.mjs';
test('visible qi bar and dotpha cue match server eligibility in all 14 realms and resource boundaries',()=>{
 const w=createWorld('live'),p=ensurePlayer(w,'bar','Đạo hữu',1800000000000),c=createCanvas(900,800).getContext('2d'),s=Object.create(Scene.prototype);s.realmCount=REALMS.length;
 const fill=c.fillRect.bind(c),text=c.fillText.bind(c);let barColor,labels;c.fillRect=(x,y,width,h)=>{if(h===3.5)barColor=c.fillStyle;return fill(x,y,width,h);};c.fillText=(label,...args)=>{labels.push(label);return text(label,...args);};
 for(let realm=0;realm<REALMS.length;realm++)for(const [qiDelta,stoneDelta]of [[0,0],[-1,0],[0,-1],[100,100]]){
  p.realm=realm;p.qi=requiredQi(p)+qiDelta;p.stones=requiredStones(p)+stoneDelta;const expected=readyToBreak(p),view=snapshot(w,1800000000000).players.find(x=>x.id===p.id);s.targets=[{id:p.id,x:450,y:400,scale:1.5}];barColor=null;labels=[];s.drawQiBar(c,{player:view,x:400,y:440,w:100,h:30},1000);
  assert.equal(labels.includes('✦ gõ dotpha'),expected,REALMS[realm]+' qi='+qiDelta+' stone='+stoneDelta);assert.equal(barColor!=='#7fdcc6',expected,'gold readiness color '+REALMS[realm]);
 }
});
test('qi bar uses the realm count supplied by the scene, including its maximum boundary',()=>{
 const c=createCanvas(900,800).getContext('2d'),s=Object.create(Scene.prototype);let labels=[];c.fillText=label=>labels.push(label);s.targets=[{id:'p',x:450,y:400,scale:1.5}];const l={player:{id:'p',realm:8,qi:100,neededQi:100,stones:50,neededStones:50},x:400,y:440,w:100,h:30};
 s.realmCount=9;s.drawQiBar(c,l,1000);assert.equal(labels.length,0);s.realmCount=14;s.drawQiBar(c,l,1000);assert.deepEqual(labels,['✦ gõ dotpha']);
});
