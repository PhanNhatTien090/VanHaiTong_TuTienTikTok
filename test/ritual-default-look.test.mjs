import test from 'node:test';
import assert from 'node:assert/strict';
import {applyDefaultRitualLook,defaultRitualLook} from '../public/live-cinema.js';
import {specialSkinFor} from '../public/patrons.js';

test('breakthrough draws the default realm outfit, not the chosen event skin', () => {
  const p={id:'a',name:'A',realm:25,skinChoice:'tudo-ma-ton',skinChoiceSource:'manual',rewardSkins:['tudo-ma-ton','vuonglam-avatar'],divineRoles:['x']};
  const e={id:'e',user:'a',effect:'breakthrough',start:5,duration:52000,fromRealm:24,toRealm:25,visualFrom:{...p,realm:24},visualTo:{...p}};
  const before=JSON.stringify(e),v=applyDefaultRitualLook({players:[p]},e);
  for(const x of [v.visualFrom,v.visualTo]){assert.equal(x.skinChoice,null);assert.equal(x.divineRoleHidden,true);assert.equal(specialSkinFor(x),null);}
  assert.equal(v.visualFrom.realm,24);assert.equal(v.visualTo.realm,25);
  assert.equal(JSON.stringify(e),before,'event untouched');assert.equal(p.skinChoice,'tudo-ma-ton','player data untouched');
  e.start=99;assert.equal(v.start,99,'live timing still visible');
});

test('missing snapshots fall back to the live player and the view is stable per event', () => {
  const p={id:'b',name:'B',realm:10,skinChoice:'vuonglam-avatar',rewardSkins:['vuonglam-avatar']};
  const e={id:'e2',user:'b',effect:'breakthrough',fromRealm:9,toRealm:10};
  const a=applyDefaultRitualLook({players:[p]},e),b=applyDefaultRitualLook({players:[p]},e);
  assert.equal(a,b);assert.equal(a.visualFrom.realm,9);assert.equal(defaultRitualLook(null),null);
});
