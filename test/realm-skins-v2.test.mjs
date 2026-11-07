import test from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {REALM_SKIN_IMAGES} from '../public/realm-skins-v2-data.js';
import {drawRealmSkinV2,realmSkinV2For} from '../public/realm-skins-v2.js';

test('separate realm sprites preserve portrait and seated aspect ratios without replacing a selected reward skin',()=>{
 const p={id:'a',realm:0,gender:'nam'},assets=REALM_SKIN_IMAGES[0],scene={motion:false,realmSkinV2Art:new Map()},c=createCanvas(200,200).getContext('2d');
 const portrait=createCanvas(240,700),seated=createCanvas(600,650),draws=[];
 scene.realmSkinV2Art.set(assets['male-standing'].url,{image:portrait});scene.realmSkinV2Art.set(assets['male-seated'].url,{image:seated});
 c.drawImage=(...args)=>draws.push(args);c.globalAlpha=.6;
 assert.equal(drawRealmSkinV2(scene,c,p,{stand:1},0),true);let d=draws.pop();assert.equal(d[0],portrait);assert.ok(Math.abs(d[3]/d[4]-240/700)<1e-8);assert.equal(c.globalAlpha,.6);
 assert.equal(drawRealmSkinV2(scene,c,p,{stand:0},0),true);d=draws.pop();assert.equal(d[0],seated);assert.ok(Math.abs(d[3]/d[4]-600/650)<1e-8);
 assert.equal(realmSkinV2For({...p,skinChoice:'hanlap-avatar',rewardSkins:['hanlap-avatar']}),null);
});

test('missing or still-loading individual sprites retain the existing renderer',()=>{
 const c=createCanvas(100,100).getContext('2d');
 assert.equal(drawRealmSkinV2({},c,{realm:6},{stand:1},0),false);
 assert.equal(drawRealmSkinV2({},c,{realm:0,gender:'nu'},{stand:1},0),false);
});
