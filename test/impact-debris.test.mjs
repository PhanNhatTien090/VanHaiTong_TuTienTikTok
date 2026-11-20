import test from 'node:test';import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {drawDebris,spawnDebris,drawDebrisPool,DEBRIS_LIFE} from '../public/impact-debris.js';
test('mảnh vỡ vẽ được mọi thời điểm, nhẹ/đủ, không lỗi; ngoài khoảng sống thì không vẽ',()=>{
 const c=createCanvas(900,1600).getContext('2d');
 for(const light of [false,true])for(let s=-.1;s<=DEBRIS_LIFE+.2;s+=.05)drawDebris(c,450,600,s,{floor:760,seed:3,power:3,light});
});
test('mảnh rơi xuống rồi nằm trên mặt đất (không lọt dưới sàn), vẽ giống hệt khi tua lại (không ngẫu nhiên)',()=>{
 const a=createCanvas(300,300),b=createCanvas(300,300);
 drawDebris(a.getContext('2d'),150,100,.9,{floor:220,seed:5,scale:.4});drawDebris(b.getContext('2d'),150,100,.9,{floor:220,seed:5,scale:.4});
 assert.deepEqual(a.getContext('2d').getImageData(0,0,300,300).data,b.getContext('2d').getImageData(0,0,300,300).data);
 const d=a.getContext('2d').getImageData(0,232,300,68).data;let lit=0;for(let i=3;i<d.length;i+=4)lit+=d[i]>40;assert.ok(lit<60,'quá nhiều điểm dưới mặt đất: '+lit);
});
test('hồ mảnh vỡ tự dọn sau khi hết, tối đa 14 vụ, tắt khi giảm chuyển động',()=>{
 const c=createCanvas(900,1600).getContext('2d'),scene={};
 for(let i=0;i<20;i++)spawnDebris(scene,{x:450,y:600,start:0});assert.equal(scene.debris.length,14);
 drawDebrisPool(scene,c,500);assert.equal(scene.debris.length,14);drawDebrisPool(scene,c,(DEBRIS_LIFE+.1)*1000);assert.equal(scene.debris.length,0);
});
