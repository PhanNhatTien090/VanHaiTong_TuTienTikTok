import {test} from 'node:test';import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,openBoss,action,power,CATALOG} from '../engine.mjs';
import {attackTechnique,COMBAT_RELICS,TECHNIQUES,drawCombatTechnique} from '../public/combat-techniques.js';
import {actionPose} from '../public/character-animation.js';import {presentationDuration} from '../public/presentation.js';
import {createCanvas,loadImage} from '@napi-rs/canvas';
const now=1800000000000;
test('equipped signature and new relics select distinct techniques before realm fallback',()=>{
 const p={realm:8,manuals:['lotus','sword'],artifacts:[]};
 assert.equal(attackTechnique({...p,equipped:'hanlap-bamboo-swords'}).id,'bamboo');assert.equal(attackTechnique({...p,equipped:'vuonglam-soul-banner'}).id,'soul');
 for(const a of COMBAT_RELICS)assert.equal(attackTechnique({...p,equipped:a.id}).id,a.technique);
 assert.equal(attackTechnique({realm:0,manuals:[],artifacts:[]}).id,'slash');assert.equal(attackTechnique(p).id,'celestial');
 assert.equal(attackTechnique({...p,artifacts:Array(100).fill('x')}).intensity,3);
});
test('danh carries technique and actual damage, retains cooldown, keeps stronger loot on boss victory',()=>{
 const w=createWorld('live'),p=ensurePlayer(w,'p','P',now);Object.assign(p,{realm:8,manuals:['sword'],artifacts:['hanlap-bamboo-swords'],equipped:'hanlap-bamboo-swords'});openBoss(w,now);w.boss.hp=10000;
 const hp=w.boss.hp;action(w,{type:'chat',text:'danh',userId:'p'},now+100);const e=w.events.findLast(e=>e.effect==='attack');assert.equal(e.technique.id,'bamboo');assert.equal(e.damage,power(p));assert.equal(hp-w.boss.hp,power(p));assert.equal(action(w,{type:'chat',text:'danh',userId:'p'},now+200).ok,false);
 w.boss.hp=1;action(w,{type:'chat',text:'danh',userId:'p'},now+4200);assert.equal(w.boss,null);assert.equal(p.equipped,'hanlap-bamboo-swords');
});
test('new relics are craftable through existing ren command and select their pose and duration',()=>{
 for(const a of COMBAT_RELICS){const w=createWorld('live'),p=ensurePlayer(w,'p','P',now);Object.assign(p,{realm:a.tier,stones:a.price,herbs:a.herbs});assert.ok(CATALOG.some(x=>x.id===a.id));assert.equal(action(w,{type:'chat',text:'ren '+a.name,userId:'p'},now+1).ok,true);assert.equal(p.equipped,a.id);assert.equal(p.stones,0);const technique=attackTechnique(p),e={effect:'attack',technique};assert.equal(actionPose(e),technique.pose);assert.equal(presentationDuration(e),technique.duration);}
});
test('all techniques render with real PNG atlases at phone resolution and bounded geometry',async()=>{
 const canvas=createCanvas(540,960),c=canvas.getContext('2d'),image=await loadImage('public/assets/combat-relics-v41.png'),signature=await loadImage('public/assets/visitor-signatures-v40.png');
 const crop=(img,cols,rows)=>Array.from({length:cols*rows},(_,i)=>{const out=createCanvas(192,192);out.getContext('2d').drawImage(img,i%cols*img.width/cols,Math.floor(i/cols)*img.height/rows,img.width/cols,img.height/rows,0,0,192,192);return out;});
 const relics=crop(image,2,2),signatures=crop(signature,2,1);let paths=0;const begin=c.beginPath.bind(c);c.beginPath=()=>{paths++;begin();};
 for(const [id,tr]of Object.entries(TECHNIQUES)){paths=0;drawCombatTechnique(c,{technique:{id,...tr,intensity:3},target:{x:450,yRatio:.37}},2000,.6,{x:350,y:700},1600,{light:true,relics,signatures});assert.ok(paths<45,id+' primitive budget');}
});
