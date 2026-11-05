import {test} from 'node:test';import assert from 'node:assert/strict';import {createCanvas} from '@napi-rs/canvas';import {companionPlaces,drawCompanionLinks} from '../public/companion-fx.js';
test('two participants move near each other and animated links respect stage cap and race exclusion',()=>{
 const targets=[{id:'a',x:100,y:650},{id:'b',x:800,y:650}],s={targets,motion:true,budget:{level:'light'},companionStatus:{pairs:[{a:'a',b:'b',actions:{a:2,b:1}}]}};
 companionPlaces(s,targets,1000);assert.equal(targets[1].x-targets[0].x,110);const c=createCanvas(900,1000),ctx=c.getContext('2d');drawCompanionLinks(s,ctx,1000);const one=c.toBuffer('image/png');ctx.clearRect(0,0,900,1000);drawCompanionLinks(s,ctx,3000);assert.notDeepEqual(one,c.toBuffer('image/png'));const copy=JSON.stringify(targets);companionPlaces(s,targets,4000,false);assert.equal(JSON.stringify(targets),copy);
});
