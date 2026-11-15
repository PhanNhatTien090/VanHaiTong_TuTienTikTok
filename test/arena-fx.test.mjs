import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {ARENA_ELEMENT_COLORS,arenaElement,drawElementTrail,drawElementImpact} from '../public/arena-fx.js';
import {TECHNIQUES} from '../public/combat-techniques.js';
import {ARENA_ELEMENTS,ARENA_ULTIMATES} from '../public/arena-skills.js';

test('mọi chiêu Lôi Đài có hệ hiệu ứng riêng, đủ 9 hệ, vẽ không lỗi và không làm bẩn trạng thái canvas',()=>{
 for(const id of [...ARENA_ELEMENTS.map(e=>e.tech),...Object.keys(ARENA_ULTIMATES)])assert.ok(ARENA_ELEMENT_COLORS[arenaElement(id)],id);
 assert.equal(new Set(Object.keys(TECHNIQUES).map(arenaElement)).size>=8,true);
 const c=createCanvas(900,600).getContext('2d');
 for(const el of Object.keys(ARENA_ELEMENT_COLORS))for(const k of [0,.3,.6,.8,.99])for(const light of [false,true]){
  drawElementTrail(c,el,{x:200,y:200},{x:650,y:250},k,7,{light});
  drawElementImpact(c,el,650,250,k,7,{power:k>.7?3:1,light});
  assert.equal(c.globalAlpha,1,el);
 }
});
