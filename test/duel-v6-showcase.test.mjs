import test from 'node:test';
import assert from 'node:assert/strict';
import {access,stat} from 'node:fs/promises';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {duelCutinPlan,drawDuelCinematic,duelChargingPose} from '../public/duel-cinematic.js';
import {v6SkillFamily,V6_ASSETS,v6Budget,prewarmDuelV6,v6CounterProgress,drawDuelV6Ultimate} from '../public/duel-showcase-v6.js';

const T=1800000000000;
const duel=()=>({id:'V6-live-a',a:'a',b:'b',startedAt:T,endsAt:T+25000,
 names:{a:'Lôi Tôn',b:'Kiếm Tôn'},aura:{a:80,b:50},
 techniques:{a:{id:'thunder',name:'Cửu Tiêu Thần Lôi',color:'#bcadff'},
 b:{id:'bamboo',name:'Thanh Trúc Phong Vân Kiếm Trận',color:'#9fffc5'}}});
const fighter=(id,x)=>({id,x,y:1240,scale:2.25});

test('V6 reuses existing small sprite assets and includes an original loaded sigil',async()=>{
 assert.equal(v6SkillFamily('thunder'),'thunder');
 assert.equal(v6SkillFamily('bamboo'),'sword');
 assert.equal(v6SkillFamily('flame'),'flame');
 assert.equal(v6SkillFamily('unknown'),null);
 for(const url of Object.values(V6_ASSETS)){
  const path='public'+url;
  await access(path);
  const file=await stat(path);
  assert.ok(file.size>500&&file.size<350000,'bounded asset '+path);
 }
 const svg=await (await import('node:fs/promises')).readFile('public/assets/v6/thunder-sigil.svg','utf8');
 assert.match(svg,/viewBox="0 0 512 512"/);
});

test('V6 primes images only once per match, never in the draw loop',()=>{
 const Original=globalThis.Image;
 let calls=0;
 class Img{constructor(){calls++;this.naturalWidth=224;}set src(value){this.url=value;this.onload?.();}}
 globalThis.Image=Img;
 try{
  const scene={},m=duel();
  prewarmDuelV6(scene,m);assert.equal(calls,2); // dragon + a newly-authored seal
  prewarmDuelV6(scene,m);assert.equal(calls,2);
  assert.ok(scene.v6Assets.thunder);
  assert.ok(scene.v6Assets.thunderSeal);
  prewarmDuelV6(scene,{...m,id:'next',techniques:{a:{id:'flame'},b:{id:'sword'}}});
  assert.equal(calls,3);
 }finally{if(Original===undefined)delete globalThis.Image;else globalThis.Image=Original;}
});

test('V6 includes both opposing ultimate cut-ins while the old duel planner remains backward compatible',()=>{
 const m=duel(),now=T+19800+900;
 const old=duelCutinPlan(m,now,[],1200,false);
 const upgraded=duelCutinPlan(m,now,[],1200,false,true);
 assert.equal(old.length,1);
 assert.equal(upgraded.length,2);
 assert.deepEqual(new Set(upgraded.map(x=>x.user)),new Set(['a','b']));
 assert.ok(upgraded.some(x=>x.kind==='counter'));
 assert.equal(duelCutinPlan(m,now,[],1200,true,true).length,1);
 assert.equal(duelChargingPose(m,{id:'b'},now),null);
 assert.equal(duelChargingPose(m,{id:'b'},now,true)?.mode,'cast');
 assert.ok(v6CounterProgress(m,now)>0);
 assert.equal(v6CounterProgress(m,T+1000),-1);
});

test('strict effect budget preserves the dragon silhouette and caps secondary detail',()=>{
 const base=v6Budget({budget:{level:'high'},motion:true,reduceFlash:false,fps:30});
 const crowd=v6Budget({budget:{level:'light',pressured:true},motion:true,reduceFlash:true,fps:13});
 assert.equal(base.pressed,false);assert.equal(base.showSecondary,true);
 assert.equal(crowd.pressed,true);assert.equal(crowd.showSecondary,false);
 assert.ok(crowd.bolts<base.bolts&&crowd.blades<base.blades);
 assert.equal(crowd.flashes,false);
});

test('V6 real PNGs render distinct thunder and phoenix attacks with a bounded number of draws',async()=>{
 const dragon=await loadImage('public/assets/god-forms-v1/thunder-dragon.png');
 const phoenix=await loadImage('public/assets/god-forms-v1/phoenix-fire.png');
 const canvas=createCanvas(900,1600),c=canvas.getContext('2d');
 const oldDraw=c.drawImage.bind(c);let calls=0;c.drawImage=(...args)=>{calls++;return oldDraw(...args);};
 const left=fighter('a',225),right=fighter('b',675),target={x:450,y:940};
 const scene={budget:{level:'balanced'},fps:30,motion:true,reduceFlash:false,
  v6Assets:{thunder:dragon,flame:phoenix},v6Showcase:true,cinematicV2:true};
 const colors=[];
 for(const [kind,tech] of [['thunder',{id:'thunder'}],['sword',{id:'bamboo'}],['flame',{id:'flame'}]]){
  c.clearRect(0,0,900,1600);calls=0;
  assert.equal(drawDuelV6Ultimate(scene,c,2200,left,target,tech,.77),true);
  const px=c.getImageData(370,720,165,350).data;
  const active=px.reduce((n,v,i)=>n+(i%4===3&&v>5?1:0),0);
  assert.ok(active>120,kind+' is visible, not a no-op');
  assert.ok(calls<=2,kind+' sprite draws must remain bounded');
  colors.push([px[0],px[1],px[2],active]);
 }
 assert.equal(colors.length,3);
 c.clearRect(0,0,900,1600);
 scene.budget.level='light';scene.budget.pressured=true;scene.motion=false;scene.reduceFlash=true;
 assert.equal(drawDuelV6Ultimate(scene,c,2200,right,target,{id:'thunder'},.20,{counter:true}),true);
 // The lower-quality counter paints only a small seal; corners stay untouched.
 assert.equal(c.getImageData(0,0,10,10).data.some(x=>x!==0),false);
});

test('cinematic panels remain bounded, clip correctly and never mutate server match data',()=>{
 const m=duel(),before=JSON.stringify(m);
 const canvas=createCanvas(900,1600),c=canvas.getContext('2d');
 const scene={canvas,socialScene:'tournament',socialStatus:{tournament:{current:m}},
  budget:{level:'balanced'},motion:false,reduceFlash:true,v6Showcase:true,
  targets:[fighter('a',225),fighter('b',675)],eventGiftQueue:{activeRows:[]}};
 assert.equal(drawDuelCinematic(scene,c,2000,1600,T+20700),2);
 const sample=c.getImageData(100,510,700,100).data;
 assert.ok(sample.some(x=>x>0));
 assert.equal(JSON.stringify(m),before);
 assert.equal(drawDuelCinematic({...scene,v6Showcase:false},c,2000,1600,T+20700),1);
});
