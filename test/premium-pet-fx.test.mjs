import {test} from 'node:test';import assert from 'node:assert/strict';import {createCanvas} from '@napi-rs/canvas';
import {PREMIUM_PETS} from '../public/spirit-pets.js';
import {drawPremiumPetFx,premiumBurst,PREMIUM_FX_CYCLE,PREMIUM_FX_BURST} from '../public/premium-pet-fx.js';

test('thú 300 coin bùng theo nhịp, phần lớn thời gian nghỉ, lệch nhịp theo người chơi',()=>{
 let on=0;for(let t=0;t<PREMIUM_FX_CYCLE;t+=50)on+=premiumBurst(t,7)>=0;
 assert.ok(on/(PREMIUM_FX_CYCLE/50)<.3,'bùng < 30% thời gian');
 assert.ok(PREMIUM_FX_BURST<PREMIUM_FX_CYCLE/3);
 assert.notEqual(premiumBurst(1000,1)>=0,premiumBurst(1000,60)>=0);
});
test('mỗi thú 300 coin có hiệu ứng riêng nhìn thấy được ở cả hai lớp, lúc bùng nhiều hơn lúc nghỉ',()=>{
 const ink=(pet,t,seed)=>{const cv=createCanvas(300,300),c=cv.getContext('2d');c.translate(150,190);
  drawPremiumPetFx(c,pet,120,t,seed,1,'back');drawPremiumPetFx(c,pet,120,t,seed,1,'front');
  const d=c.getImageData(0,0,300,300).data;let n=0;for(let i=3;i<d.length;i+=4)n+=d[i]/255;return {n,png:cv.toBuffer('image/png')};};
 const looks=new Set();
 for(const pet of PREMIUM_PETS){
  let rest=0;while(premiumBurst(rest,0)>=0)rest+=100;
  const calm=ink(pet,rest,0),burst=ink(pet,PREMIUM_FX_BURST*.4,0);
  assert.ok(calm.n>150,pet.id+' nền có hiệu ứng');
  assert.ok(burst.n>calm.n*1.25,pet.id+' lúc bùng rõ hơn');
  looks.add(burst.png.toString('base64'));
 }
 assert.equal(looks.size,PREMIUM_PETS.length);
});
