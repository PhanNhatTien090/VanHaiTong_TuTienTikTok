import {test} from 'node:test';
import assert from 'node:assert/strict';
globalThis.document??={body:{classList:{contains:()=>true,toggle(){}}}};
const {Scene}=await import('../public/scene.js');
// Canvas giả: đếm số lệnh vẽ thực sự (fill/stroke/drawImage/fillRect/fillText).
function fakeCanvas(){const counter={draws:0,full:0};const grad={addColorStop(){}};
  const ctx=new Proxy({},{get(_,k){if(k==='__count')return counter.draws;if(k==='__full')return counter.full;if(k==='canvas')return {width:900,height:1600};
    if(['createLinearGradient','createRadialGradient','createPattern'].includes(k))return ()=>grad;
    if(['fill','stroke','drawImage','fillRect','fillText','strokeText','strokeRect'].includes(k))return (...args)=>{counter.draws++;if(k==='fillRect'&&args[2]===900&&args[3]===1600)counter.full++;};
    if(k==='measureText')return ()=>({width:10});if(k==='getTransform')return ()=>({a:1,b:0,c:0,d:1,e:0,f:0});
    return typeof k==='string'&&/^[a-z]/.test(k)&&!['globalAlpha','fillStyle','strokeStyle','lineWidth','font','globalCompositeOperation','shadowBlur','shadowColor','lineCap','lineJoin','textAlign','textBaseline','filter'].includes(k)?()=>{}:undefined;},set(){return true;}});
  return ctx;}
function layers(e){
  const scene=Object.create(Scene.prototype);Object.assign(scene,{width:900,height:1600,motion:true,effects:[],targets:[{id:'u',x:450,y:900,scale:1.4}],budget:{level:'balanced'}});
  const ev={user:'u',name:'U',start:0,duration:4000,...e},out={};
  for(const layer of ['back','front']){const c=fakeCanvas();scene.drawEffect(c,ev,1200,layer);out[layer]=c.__count;out[layer+'Full']=c.__full;}
  return out;
}
test('small effects are always drawn in FRONT of characters, never pushed behind',()=>{
  for(const effect of ['qi','petal','join','sword','lotus']){const l=layers({effect,text:'x'});
    assert.ok(l.front>0,effect+' must draw in front');assert.equal(l.back,0,effect+' must not draw behind');}
  const heart=layers({effect:'petal',text:'Tụ linh từ lượt thích'});assert.ok(heart.front>0);
});
test('small gift stays local in front without a full-screen stage',()=>{
  const l=layers({effect:'petal',gift:'Hoa hồng',kind:'rose',coins:1,count:1});
  assert.equal(l.backFull+l.frontFull,0,'no full-screen stage for a 1-coin gift');assert.ok(l.front>0,'local acknowledgment remains visible');
});
test('breakthroughs and event rewards keep their formations behind characters',()=>{
  for(const e of [{effect:'breakthrough',text:'ĐỘT PHÁ KIM ĐAN'},{effect:'flower',flowerRank:1,eventKind:'flower',score:10}]){
    const l=layers(e);assert.ok(l.back>0,JSON.stringify(e).slice(0,40)+' behind');assert.equal(l.front,0,'not over characters');}
});

test('cinematic gift formations remain behind; sword travel and brief impact accents render in front',()=>{for(const coins of [500,700,1000,1500,2000]){const l=layers({effect:'dragon',gift:'Quà',coins,count:1});assert.ok(l.back>0);assert.ok(l.front>0&&l.front<100);}});

test('mid-value gifts draw their stage behind, with petals and swords in front',()=>{for(const coins of [30,100,199,300]){const l=layers({effect:'lotus',gift:'Quà',coins,count:1});assert.ok(l.back>0);assert.ok(l.front>0);}});
