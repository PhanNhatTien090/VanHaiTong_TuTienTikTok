import {test} from 'node:test';
import assert from 'node:assert/strict';
globalThis.document??={body:{classList:{contains:()=>true,toggle(){}}}};
const {robeCell}=await import('../public/immortal-art.js');
const {appearanceFor}=await import('../public/realm-outfits.js');
const {Scene}=await import('../public/scene.js');
const {createWorld,action}=await import('../engine.mjs');
const P=(o)=>({id:'x',realm:0,giftCoins:0,gender:'nam',rewardSkins:[],...o});
test('novice is compact, early realms retain old outfits and advanced realms each use their own new atlas cell',async()=>{
 const {outfitArt}=await import('../public/immortal-art.js');const A=o=>outfitArt(P(o));assert.equal(A({realm:0}).sheet,'novice');for(let realm=1;realm<=5;realm++)assert.notEqual(A({realm}).sheet,'divine');const ids=new Set();for(let realm=6;realm<14;realm++){const a=A({realm});assert.equal(a.sheet,'divine');ids.add(a.group+':'+a.cell);assert.deepEqual(A({realm,giftCoins:100000}),a);}assert.equal(ids.size,8);
});
test('a chosen special skin always wins over the v39 robe sheet; female Bạch Kim wears the male Bạch Kim art',()=>{
  const scene=Object.create(Scene.prototype);
  const patron=P({rewardSkins:['azure-patron'],skinChoice:'azure-patron'}),phoenixF=P({gender:'nu',rewardSkins:['crimson-phoenix'],skinChoice:'crimson-phoenix'}),ivoryF=P({gender:'nu',rewardSkins:['ivory-celestial'],skinChoice:'ivory-celestial',realm:6});
  assert.ok(scene.specialArtFor(patron));assert.ok(scene.specialArtFor(phoenixF));
  assert.ok(scene.specialArtFor(ivoryF),'nữ chọn Bạch Kim → mặc bản nam Bạch Kim');assert.equal(robeCell(ivoryF),'divine:1:2','Luyện Hư sư tỷ → bộ riêng của cảnh giới');
  assert.equal(scene.specialArtFor(P({rewardSkins:['azure-patron']})),null,'owned but not chosen → realm robe');
});
test('skin macdinh takes off a special skin; skin <name> puts it back',()=>{
  const w=createWorld('live');let now=1e7;action(w,{type:'chat',userId:'a',name:'A',text:'nhapmon nu'},now);const p=w.players.a;
  p.rewardSkins=['crimson-phoenix'];p.skinChoice='crimson-phoenix';
  assert.equal(action(w,{type:'chat',userId:'a',name:'A',text:'skin macdinh'},now+=1000).ok,true);assert.equal(p.skinChoice,null);
  assert.equal(action(w,{type:'chat',userId:'a',name:'A',text:'skin Xich Phuong Chien Y'},now+=11000).ok,true);assert.equal(p.skinChoice,'crimson-phoenix');
  assert.equal(action(w,{type:'chat',userId:'a',name:'A',text:'skin Bach Kim Tien De'},now+=11000).ok,false,'not owned');
});
