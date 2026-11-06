import test from 'node:test';import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {createHash} from 'node:crypto';
import {ritualAppearance,drawRitualAppearance} from '../public/ritual-appearance.js';
import {drawRitual,mountRitualHud} from '../public/live-cinema.js';
import {breakthroughDuration} from '../public/breakthrough-fx.js';
test('early-realm variation is stable within each event, varies across people and repeat breakthroughs, and stays bounded',()=>{
 for(let realm=1;realm<=5;realm++){
  const palettes=new Set(),borders=new Set();for(let i=0;i<48;i++){const e={id:'event-'+i,user:'user-'+i,toRealm:realm},before=JSON.stringify(e),a=ritualAppearance(e);assert.deepEqual(a,ritualAppearance({...e}));assert.ok(Object.isFrozen(a));assert.equal(JSON.stringify(e),before);palettes.add(a.title);borders.add(a.border);assert.match(a.palette.main,/^#[a-f0-9]{6}$/);assert.ok(a.details>=3&&a.details<=6);}
  assert.ok(palettes.size>=4);assert.equal(borders.size,4);
 }
 const e={id:'a',user:'same',toRealm:3};assert.notEqual(ritualAppearance(e).key,ritualAppearance({...e,id:'b'}).key);
 assert.equal(ritualAppearance({toRealm:6}),null);assert.equal(ritualAppearance({toRealm:21}),null);assert.equal(ritualAppearance({text:'ĐỘT PHÁ HÓA THẦN'}).realm,5);
});
test('decor stays in the side lanes, respects reduced motion, and restores canvas state',()=>{
 const e={id:'a',user:'a',toRealm:4,start:0,duration:10000},a=ritualAppearance(e),canvas=createCanvas(900,1600),c=canvas.getContext('2d');
 const render=t=>{c.clearRect(0,0,900,1600);c.globalAlpha=.7;drawRitualAppearance({motion:false},c,e,t,1600,a);assert.equal(c.globalAlpha,.7);const center=c.getImageData(300,200,300,1100).data;assert.equal(center.some(v=>v!==0),false);return createHash('sha256').update(canvas.toBuffer('image/png')).digest('hex');};
 assert.deepEqual(render(3000),render(4000));
});
test('all five real ritual dispatches preserve timing, skin snapshots and renderer state while reporting variant colors',()=>{
 const oldDocument=globalThis.document;globalThis.document={createElement:()=>createCanvas(1,1)};try{
 for(let realm=1;realm<=5;realm++){
  const duration=breakthroughDuration({toRealm:realm}),e={id:'user-a:'+realm,user:'a',name:'A',effect:'breakthrough',toRealm:realm,fromRealm:realm-1,start:0,duration,visualFrom:{id:'a',realm:realm-1},visualTo:{id:'a',realm}},before=JSON.stringify(e),budget={level:'light'},seen=[];
  const scene={motion:false,budget,crowded:true,heavyCrowd:true,compact:true,players:[],drawPlayer(){},drawFlyingSword(){},onRitualFrame(ui){assert.equal(this,scene);seen.push(ui);}},callback=scene.onRitualFrame,c=createCanvas(450,800).getContext('2d');c.scale(.5,.5);
  const ui=drawRitual(scene,c,e,duration*.54,1600);assert.equal(ui.realm,realm);assert.equal(ui.k,.54);assert.equal(ui.appearanceKey,ritualAppearance(e).key);assert.equal(seen.at(-1).color,ritualAppearance(e).title);assert.equal(scene.onRitualFrame,callback);assert.equal(scene.budget,budget);assert.equal(scene.ritualAppearance,undefined);assert.equal(scene.crowded,true);assert.equal(JSON.stringify(e),before);
 }
 }finally{globalThis.document=oldDocument;}
});
test('HUD updates colors for another variant of the same named person and clears variant styling for higher realms',()=>{
 const old=globalThis.document,nodes={'.ritual-name':{},h2:{},'.ritual-sub':{}},values={},hud={dataset:{},style:{setProperty(k,v){values[k]=v;}},querySelector:k=>nodes[k]};globalThis.document={createElement:()=>hud};
 try{const scene={};mountRitualHud({appendChild(){}},scene);scene.onRitualFrame({name:'A',revealed:true,title:'Kim Đan',realm:3,color:'#aabbcc',accent:'#ffeedd',appearanceKey:'first'});assert.equal(hud.dataset.appearance,'first');scene.onRitualFrame({name:'A',revealed:true,title:'Kim Đan',realm:3,color:'#bbccdd',accent:'#ddccbb',appearanceKey:'second'});assert.equal(hud.dataset.appearance,'second');assert.equal(values['--ritual-color'],'#bbccdd');scene.onRitualFrame({name:'A',revealed:true,title:'Luyện Hư',realm:6,color:'#ffffff'});assert.equal(hud.dataset.appearance,undefined);}finally{globalThis.document=old;}
});
