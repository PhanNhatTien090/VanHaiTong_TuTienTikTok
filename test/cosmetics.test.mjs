import {test} from 'node:test';
import assert from 'node:assert/strict';
import {skinFor,nextSkin,SKINS,layoutPlayers,layoutLabels} from '../public/cosmetics.js';
import {createWorld,ensurePlayer,action,power} from '../engine.mjs';
test('cosmetic tiers change exactly at advertised gift thresholds',()=>{
  for(let i=1;i<SKINS.length;i++){assert.equal(skinFor(SKINS[i].min-1).id,SKINS[i-1].id);assert.equal(skinFor(SKINS[i].min).id,SKINS[i].id);}
  assert.equal(skinFor(NaN).id,'jade');assert.equal(skinFor(-1).id,'jade');assert.equal(nextSkin(100).id,'violet');assert.equal(nextSkin(10000),null);
});
test('cosmetic unlock survives save and does not alter combat stats',()=>{const w=createWorld();const p=ensurePlayer(w,'a','Đạo hữu');const leader=ensurePlayer(w,'existing-leader','Hộ pháp');leader.giftCoins=10000;w.totalGifts=10000;const before=power(p);p.giftCoins=500;assert.equal(skinFor(p.giftCoins).id,'violet');assert.equal(power(p),before);const restored=JSON.parse(JSON.stringify(w));assert.equal(skinFor(restored.players.a.giftCoins).id,'violet');assert.equal(power(restored.players.a),before);});
test('1–32 labels fit the stage and do not overlap each other or next-row faces',()=>{for(let count=1;count<=32;count++){const players=Array.from({length:count},(_,i)=>({id:String(i),name:'Nguyễn Đạo Hữu Tên Rất Dài '+i}));const targets=layoutPlayers(players,1600,864);const labels=layoutLabels(targets,s=>s.length*7);for(let i=0;i<labels.length;i++){const a=labels[i];assert.ok(a.x>=0&&a.x+a.w<=900);for(let j=i+1;j<labels.length;j++){const b=labels[j];assert.ok(!(a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y),`overlapping labels ${count}:${i}/${j}`);}for(const t of targets){if(t.id===a.id)continue;const face={x:t.x-9*t.scale,y:t.y-55*t.scale,w:18*t.scale,h:24*t.scale};assert.ok(!(a.x<face.x+face.w&&a.x+a.w>face.x&&a.y<face.y+face.h&&a.y+a.h>face.y),`label covers face ${count}:${i}/${t.id}`);}}}});
