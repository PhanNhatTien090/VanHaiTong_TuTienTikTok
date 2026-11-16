import test from 'node:test';
import assert from 'node:assert/strict';
import {towerHTML} from '../public/tower.js';
import {drawScreenPulse} from '../public/cinematic-feedback.js';
import {plannedActorCount} from '../public/crowd-policy.js';

test('the maze counts visible character bodies separately from finished runners',()=>{
 const runners=Array.from({length:80},(_,i)=>({f:i<23?0:100}));
 assert.equal(plannedActorCount({maze:{active:true,runners}},80),23);
 assert.equal(plannedActorCount({maze:{active:true,runners}},8),8);
 assert.equal(plannedActorCount({maze:{active:true,runners:Array(80).fill({f:0})}},80),40);
});

test('reduced flash skips the full-screen pass and leaves Canvas state alone',()=>{
 let draws=0;
 const c={save(){},restore(){},fillRect(...rect){assert.deepEqual(rect,[0,0,900,1600]);draws++;}};
 drawScreenPulse(c,1600,true,'#fff',.5);
 assert.equal(draws,0);
 assert.equal(c.globalAlpha,undefined);
 drawScreenPulse(c,1600,false,'#fff',1.5,'screen');
 assert.equal(draws,1);
 assert.equal(c.globalAlpha,1);
 assert.equal(c.globalCompositeOperation,'screen');
});

test('16/11: Vân Hải Tháp 4 đài — khung HTML có đủ 4 đài, máu thủ vệ, bảng quà trợ lực; đài trống mời gõ 6',()=>{
 const lane={lane:0,id:'p',name:'P',floor:5,next:5,hp:80,me:90,maxHp:2030,endsAt:26000,helpers:0,guardian:{name:'Hộ vệ',art:0,hue:0},buff:{name:'KIẾM VŨ TRỢ TRẬN',tier:'g10',mult:1.4,until:9000}};
 const html=towerHTML({id:'t1',active:true,endsAt:40000,lanes:[lane,null,null,null],queue:[],queued:0},1000,String,{giftArt:{}});
 assert.equal((html.match(/class="tw2-lane/g)||[]).length,4);
 assert.match(html,/ĐÀI 1 · TẦNG 5/);assert.match(html,/KIẾM VŨ TRỢ TRẬN ×1,4/);assert.match(html,/QUÀ TRỢ LỰC/);assert.match(html,/Đài trống/);
 assert.doesNotMatch(html,/coin/i);
});
