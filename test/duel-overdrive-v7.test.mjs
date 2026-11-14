import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {SHATTER_URL,prewarmOverdrive,overdriveBudget,overdriveMoment,drawOverdriveV7} from '../public/cinematic-overdrive-v7.js';
import {V7_VARIANTS,v7SkillSpec,prewarmVariantArt,drawV7Variant} from '../public/ultimate-variants-v7.js';
import {V7_GIFT_SPELLS,giftV7Spell,drawGiftOverdriveV7} from '../public/gift-overdrive-v7.js';
import {duelCutinPlan} from '../public/duel-cinematic.js';
import {CINEMATIC_SOUND,prepareCinematicAudio} from '../public/cinematic-sfx.js';

const T=1800000000000,H=1600;
const m=()=>({id:'v7-test',a:'a',b:'b',startedAt:T,endsAt:T+25000,
 aura:{a:90,b:40},names:{a:'Đạo hữu A',b:'Đạo hữu B'},
 techniques:{a:{id:'soul',name:'Hồn Phiên',color:'#c6a0ff'},b:{id:'bell',name:'Kim Chung',color:'#ffd36a'}}});
const scene=()=>({budget:{level:'balanced',crowded:false},fps:30,motion:true,reduceFlash:false,
 cinematicV2:true,v7Overdrive:true,socialScene:'tournament',
 socialStatus:{tournament:{current:m()}},canvas:{width:900,height:H},height:H,
 eventGiftQueue:{activeRows:[]}});
const gift=(value)=>({id:'g'+value,user:'a',mode:'duel',name:'Donate',value,
 start:100,profile:{duration:3500},wardEffect:{kind:'shield-break',amount:1000,target:'b'}});
const alphaCount=(c,x=100,y=400,w=700,h=550)=>{
 const d=c.getImageData(x,y,w,h).data;let count=0;
 for(let i=3;i<d.length;i+=4)if(d[i]>5)count++;return count;
};

test('all original shatter and 7 spell seals are truly transparent SVG assets under a strict size budget',async()=>{
 const files=[SHATTER_URL,...[...new Set(Object.values(V7_VARIANTS))].map(id=>'/assets/v7/'+({
 void:'void-rift.svg',stars:'seven-stars.svg',soul:'soul-phantom.svg',
 lotus:'holy-lotus.svg',bell:'celestial-bell.svg',meteor:'meteor-judgment.svg',
 blossom:'blossom-sword.svg'})[id])];
 assert.equal(files.length,8);
 for(const url of files){
  const p='public'+url,text=await readFile(p,'utf8'),f=await stat(p);
  assert.match(text,/^<svg/);assert.match(text,/viewBox=/);
  assert.ok(!/<image\s/.test(text),'vector must not embed opaque bitmap');
  assert.ok(f.size<9000,'small asset: '+url);
 }
});

test('six complete premium gift spells selected from ACTUAL coin ranges, with distinct identities',()=>{
 const points=[100,500,700,1000,1500,2000];
 assert.equal(V7_GIFT_SPELLS.length,6);
 const names=points.map(value=>giftV7Spell(value)?.name);
 assert.equal(new Set(names).size,6);
 assert.equal(giftV7Spell(50),null);
 assert.equal(giftV7Spell(10000).key,'judgment');
});

test('real duel cut-ins reflect distinct ultimate IDs; legacy V6 skills still resolve',()=>{
 const match=m(),list=duelCutinPlan(match,T+20600,[],500,false,true);
 assert.equal(list.length,2);
 assert.equal(list.find(x=>x.kind==='cast').title,'Vạn Hồn U Minh');
 assert.equal(list.find(x=>x.kind==='counter').title,'Kim Chung Bất Diệt');
});

test('shatter beats: genuine hit once, tracked gift beats override low-tier duel, no fake health',()=>{
 const s=scene();
 assert.equal(overdriveMoment(s,3000,T+500),null);
 s.duelImpact={at:T+500,ultimate:true,x:450,y:800};
 assert.equal(overdriveMoment(s,3000,T+580)?.kind,'duel');
 assert.equal(overdriveMoment(s,3000,T+1300),null);
 s.eventGiftQueue.activeRows=[gift(5000)];
 const now=100+3500*.3+90;
 assert.equal(overdriveMoment(s,now,T+580)?.kind,'gift');
 s.v7Overdrive=false;
 assert.equal(overdriveMoment(s,now,T+580),null);
});

test('load protection: no repeated network retry after missing shatter; new match still loads spell seals only once',()=>{
 const Original=globalThis.Image;let starts=0;const instances=[];
 class FakeImage{
  constructor(){instances.push(this);this.naturalWidth=512;}
  set src(x){this.path=x;starts++;this.onload?.();}
 }
 globalThis.Image=FakeImage;
 try{
  const s=scene();prewarmOverdrive(s);prewarmOverdrive(s);assert.equal(starts,1);
  const match=m();prewarmVariantArt(s,match);prewarmVariantArt(s,match);
  assert.equal(starts,3,'two variants + one shatter image');
  const first=Object.keys(s.v7VariantArt).length;
  assert.equal(first,2);
  const noOp=prewarmOverdrive(s);assert.equal(noOp,undefined);assert.equal(starts,3);
 }finally{if(Original===undefined)delete globalThis.Image;else globalThis.Image=Original;}
});

test('renders all seven new classes from the exact runtime renderer without per-frame image loads',async()=>{
 const arts={},colors=[];
 const names={void:'void-rift.svg',soul:'soul-phantom.svg',stars:'seven-stars.svg',
  lotus:'holy-lotus.svg',bell:'celestial-bell.svg',meteor:'meteor-judgment.svg',blossom:'blossom-sword.svg'};
 for(const [id,path] of Object.entries(names))arts[id]=await loadImage('public/assets/v7/'+path);
 const s=scene();s.v7VariantArt=arts;
 const canvas=createCanvas(900,H),c=canvas.getContext('2d');
 const actor={id:'a',x:225,y:1250},target={x:450,y:880};
 for(const [i,id] of ['dora-door','soul','sevenstars','lotus','bell','meteor','petal'].entries()){
  c.clearRect(0,0,900,H);
  assert.equal(drawV7Variant(s,c,2000,actor,target,{id},.79),true);
  const visible=alphaCount(c,140,540,640,640);
  assert.ok(visible>85,id+' must paint real visible pixels: '+visible);
  colors.push(v7SkillSpec(id).id);
 }
 assert.equal(new Set(colors).size,7);
 c.clearRect(0,0,900,H);
 s.budget.pressured=true;s.reduceFlash=true;s.motion=false;
 assert.equal(drawV7Variant(s,c,2000,actor,target,{id:'soul'},.35,{counter:true}),true);
 assert.equal(drawV7Variant(s,c,2000,actor,target,{id:'unknown'},.45),false);
});

test('screen rupture paints real SVG and a low-cost fallback; reduced flash never fills the screen white',async()=>{
 const svg=await loadImage('public/assets/v7/screen-shatter.svg');
 const canvas=createCanvas(900,H),c=canvas.getContext('2d'),s=scene();
 s.duelImpact={at:T+100,ultimate:true,x:450,y:900};
 s.v7ShatterArt=svg;s.canvas=canvas;
 assert.equal(drawOverdriveV7(s,c,900,H,T+220),true);
 assert.ok(alphaCount(c,20,180,860,1100)>1500);
 c.clearRect(0,0,900,H);
 s.budget.pressured=true;s.reduceFlash=true;
 assert.equal(drawOverdriveV7(s,c,900,H,T+220),true);
 assert.ok(alphaCount(c,20,180,860,1100)>100);
 assert.equal(c.getImageData(0,0,20,20).data.some(v=>v!==0),false);
 c.clearRect(0,0,900,H);
 assert.equal(drawOverdriveV7({...s,v7Overdrive:false},c,900,H,T+220),false);
});

test('all six gift spells render without changing authoritative shield receipts',()=>{
 const canvas=createCanvas(900,H),c=canvas.getContext('2d'),s=scene();
 const a={x:225,y:1250},b={x:675,y:1250};
 for(const value of [100,500,700,1000,1500,2000]){
  const e=gift(value),orig=JSON.stringify(e);
  c.clearRect(0,0,900,H);
  assert.equal(drawGiftOverdriveV7(s,c,e,800,a,b,H),true);
  assert.ok(alphaCount(c,120,630,700,550)>40,'gift visible '+value);
  assert.equal(JSON.stringify(e),orig,'no gameplay mutation');
 }
});

test('elemental audio is pre-synthesizable and budget-aware, no sample-file request per strike',()=>{
 const presets=['void-blade','starlight','blossom','holy-bell','meteor','fracture'];
 for(const id of presets){
  const v=CINEMATIC_SOUND[id];
  assert.ok(v?.root>0&&v.tail>0&&v.tail<2);
  assert.ok(v.sub<=.3&&v.crack<=.36,'headroom '+id);
 }
 assert.equal(overdriveBudget(scene()).cracks,18);
 const s=scene();s.budget.crowded=true;
 assert.ok(overdriveBudget(s).cracks<18);
});

test('new audio sample banks are bounded and non-silent before Web Audio mixes them',()=>{
 const context={createBuffer(channels,length,rate){
  const data=new Float32Array(length);
  return {getChannelData:()=>data,length,sampleRate:rate};
 }};
 const all=prepareCinematicAudio(context);
 assert.equal(all.size,Object.keys(CINEMATIC_SOUND).length);
 for(const [preset,blocks]of all){
  assert.equal(blocks.length,5);
  let maxPeak=0,energy=0;
  for(const block of blocks){
   const d=block.getChannelData(0);
   for(let i=0;i<d.length;i++){
    assert.ok(Number.isFinite(d[i]),'invalid audio sample '+preset);
    maxPeak=Math.max(maxPeak,Math.abs(d[i]));
    energy+=d[i]*d[i];
   }
  }
  assert.ok(maxPeak<.8,preset+' must have mix headroom, peak='+maxPeak);
  assert.ok(energy>.002,preset+' must not be silent');
 }
});
