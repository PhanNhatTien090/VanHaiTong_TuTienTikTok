import {test} from 'node:test';import assert from 'node:assert/strict';import {createCanvas} from '@napi-rs/canvas';
import {breakthroughTitleLayout,drawBreakthroughFx,REALM_NAMES} from '../public/breakthrough-fx.js';
test('breakthrough title uses the attained realm, enlarges high realms, pops then fades within the effect',()=>{
 let previous=0;for(let realm=1;realm<REALM_NAMES.length;realm++){const e={toRealm:realm,text:'Đột phá Luyện Khí'},p={x:450,y:1050},a=breakthroughTitleLayout(e,.53,p,1600,1.35);assert.equal(a.text,REALM_NAMES[realm].toLocaleUpperCase('vi'));assert.ok(a.fontSize>previous);previous=a.fontSize;assert.ok(a.maxWidth<=760/1.35);assert.equal(breakthroughTitleLayout(e,0,p,1600),null);assert.equal(breakthroughTitleLayout(e,1,p,1600),null);assert.equal(breakthroughTitleLayout(e,.53,p,1600,1.35,false).scale,1);assert.notEqual(breakthroughTitleLayout(e,.46,p,1600).scale,a.scale);}
});
test('large Kim Tien label is drawn in the foreground after effects, without modifying the reward event',()=>{
 const canvas=createCanvas(900,1600),c=canvas.getContext('2d'),text=c.fillText.bind(c),seen=[],e={toRealm:10,name:'Đạo hữu',reward:{qi:123}},before=JSON.stringify(e);c.fillText=(label,...args)=>{seen.push({label,font:c.font});return text(label,...args);};
 drawBreakthroughFx(c,e,5000,.53,{x:450,y:1050},1600,{layer:'back',light:true});assert.equal(seen.some(x=>x.label==='KIM TIÊN'),false);
 drawBreakthroughFx(c,e,5000,.53,{x:450,y:1050},1600,{layer:'front',light:true});assert.equal(seen.filter(x=>x.label==='KIM TIÊN').length,1);assert.match(seen.find(x=>x.label==='KIM TIÊN').font,/100px/);assert.equal(JSON.stringify(e),before);
});
