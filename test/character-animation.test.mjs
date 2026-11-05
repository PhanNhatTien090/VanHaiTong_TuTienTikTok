import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CharacterAnimator,actionPose,deformPoint,keyframes} from '../public/character-animation.js';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {Scene} from '../public/scene.js';
import {SKINS,spriteCell} from '../public/cosmetics.js';

test('distinct animation actions follow game semantics including common effect aliases',()=>{
  for(const [event,expected]of [
    [{effect:'join'},'salute'],[{effect:'attack'},'slash'],[{effect:'breakthrough'},'ascend'],
    [{effect:'sword',text:'Lĩnh ngộ Thanh Tâm Quyết'},'read'],
    [{effect:'petal',text:'Luyện thành Tụ Khí Đan'},'alchemy'],
    [{effect:'lotus',gift:'Hoa hồng'},'cast'],[{effect:'skin'},'celebrate'],
    [{effect:'qi',text:'Hái linh thảo'},'gather'],[{effect:'qi'},'meditate']
  ])assert.equal(actionPose(event),expected);
});

test('one finite action per identity, duplicates do not restart, ordinary spam cannot cut a breakthrough',()=>{
  const a=new CharacterAnimator(),e={id:'break',user:'p',effect:'breakthrough'};
  a.trigger(e,100);a.trigger(e,600);assert.equal(a.actions.get('p').start,100);
  a.trigger({id:'qi',user:'p',effect:'qi'},800);assert.equal(a.actions.get('p').mode,'ascend');
  const p={id:'p'},peak=a.pose(p,2300);assert.ok(peak.stand>.9);assert.ok(peak.lift<-10);
  assert.equal(a.pose(p,6000).stand,0);
  for(let i=0;i<300;i++)a.trigger({id:String(i),user:String(i),effect:'attack'},1000);
  assert.ok(a.actions.size<=160);
});

test('pose sampling is deterministic, smooth at action boundaries and respects reduced motion',()=>{
  const a=new CharacterAnimator(),p={id:'actor'};a.trigger({id:'s',user:p.id,effect:'sword'},100);
  assert.deepEqual(a.pose(p,1500),a.pose(p,1500));
  assert.notEqual(a.pose(p,1500).right,a.pose(p,1800).right);
  assert.equal(a.pose(p,100).stand,0);assert.ok(a.pose(p,3899).stand<.001);
  assert.deepEqual(a.pose(p,1500,false),a.pose(p,1800,false));
});

test('five illustrated skins render every action at multiple animation phases without changing player data',async()=>{
  globalThis.document??={body:{classList:{contains:()=>true}}};
  const s=Object.create(Scene.prototype);Object.assign(s,{standingArt:await loadImage(new URL('../public/assets/cultivators-standing-v14.png',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1')),characterArt:await loadImage(new URL('../public/assets/cultivators-v3.png',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1')),motion:true,animator:new CharacterAnimator(),targets:[]});
  const c=createCanvas(300,300),ctx=c.getContext('2d');ctx.translate(150,200);ctx.scale(2,2);
  for(let level=0;level<5;level++)for(const effect of ['join','qi','attack','sword','lotus','dragon','breakthrough','skin']){
    const p={id:'actor',giftCoins:SKINS[level].min,gender:level%2?'nu':'nam'},before=JSON.stringify(p);
    s.animator.trigger({id:effect+level,user:p.id,effect},10000*level);
    for(const phase of [0,100,1000,2300,3900,6000])s.drawSprite(ctx,p,SKINS[level],10000*level+phase);
    assert.equal(JSON.stringify(p),before);assert.ok(spriteCell(level,p.gender)<5);
  }
  assert.ok(c.toBuffer('image/png').length>1000);
});


test('new gestures map follow, likes, medicine and forging independently',()=>{
  for(const [event,mode]of [[{effect:'petal',text:'Kết duyên tiên môn'},'wave'],[{effect:'petal',text:'Tụ linh từ lượt thích'},'heart'],[{effect:'lotus',text:'Dùng Tụ Khí Đan'},'cast'],[{effect:'sword',text:'Rèn thành Thanh Ngọc Kiếm'},'forge'],[{effect:'dragon',kind:'dragon'},'dragon'],[{effect:'lotus',kind:'lotus'},'lotus']])assert.equal(actionPose(event),mode);
});

test('connected mesh shares exact edge vertices and poses remain finite at extreme sleeves',()=>{
  const animator=new CharacterAnimator();
  for(const effect of ['join','sword','attack','breakthrough','dragon','lotus']){
    animator.trigger({id:effect,user:effect,effect},0);
    for(let t=0;t<5400;t+=113){const pose=animator.pose({id:effect},t);for(let j=0;j<=12;j++)for(let i=0;i<=6;i++){
      const x=-39+i*13,y=-84+j*112/12,a=deformPoint(x,y,pose),b=deformPoint(x,y,pose);
      assert.deepEqual(a,b);assert.ok(Number.isFinite(a.x)&&Number.isFinite(a.y));assert.ok(Math.abs(a.x)<100&&Math.abs(a.y)<130);
    }}
  }
  const keys=[[0,0],[.2,-1],[.3,1],[1,0]];assert.equal(keyframes(.2,keys),-1);assert.equal(keyframes(.3,keys),1);assert.equal(keyframes(1,keys),0);
});
