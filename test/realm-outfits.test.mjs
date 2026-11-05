import {test} from 'node:test';
import assert from 'node:assert/strict';
import {appearanceFor,drawRealmClothes,drawRealmAscension,realmQiProfile} from '../public/realm-outfits.js';
import {createCanvas} from '@napi-rs/canvas';

test('every realm has a distinct free costume detail without changing game or gift progress',()=>{
  const names=new Set(),trims=new Set();let previous=0;
  for(let realm=0;realm<9;realm++){const p={realm,giftCoins:0,qi:40},before=JSON.stringify(p),s=appearanceFor(p);names.add(s.name);trims.add(s.realmTrim);assert.ok(s.level>=previous);previous=s.level;assert.equal(JSON.stringify(p),before);}
  assert.equal(names.size,9);assert.equal(trims.size,9);
  assert.notEqual(appearanceFor({realm:0}).name,appearanceFor({realm:1}).name);
});
test('realm changes never downgrade a premium outfit; costume renders standing and seated',()=>{
  assert.equal(appearanceFor({realm:1,giftCoins:10000}).level,4);
  const canvas=createCanvas(200,250),c=canvas.getContext('2d');c.translate(100,150);c.scale(2,2);
  for(let realm=0;realm<9;realm++)for(const standing of [true,false])drawRealmClothes(c,{realm,giftCoins:0},{stand:1,lean:.05,lift:-2},standing);
  assert.equal(c.getImageData(0,0,200,250).data.some(v=>v!==0),false,'no extra clothing or armour is drawn');
  for(let realm=1;realm<9;realm++)drawRealmAscension(c,{realm},{stand:0,lift:0},2000,true,'light');
  assert.ok(canvas.toBuffer('image/png').length>1000);
  assert.ok(realmQiProfile({realm:8}).radius>realmQiProfile({realm:3}).radius);
});
