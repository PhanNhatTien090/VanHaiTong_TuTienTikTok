import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {createWorld} from '../../engine.mjs';import {createWebApp} from '../app.mjs';import {ZONES} from '../dungeon.mjs';
// Bản thử: chỉ đánh ải đầu tiên, không nhận thưởng; mọi chức năng tăng sức mạnh bị khóa.
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'vh-trial-')),world=createWorld('live');
const app=createWebApp({world,dataDir:dir,tikfinity:false,devTools:false,profileOnly:false,trial:true});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+app.server.address().port;test.after(()=>{app.server.close();fs.rmSync(dir,{recursive:true,force:true});});
function client(){let cookie='';return async(p,body)=>{const r=await fetch(base+p,{method:body===undefined?'GET':'POST',headers:{...(cookie?{cookie}:{}),...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body)});if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return {...await r.json(),status:r.status};};}

test('trial web locks cultivation/retreat/qi stages, keeps gear/skins/shop open, first stage gives no rewards',async()=>{
  const api=client();
  assert.equal((await api('/api/register',{username:'thuthach',password:'123456'})).ok,true);
  assert.equal((await api('/api/character',{name:'Thử Nghiệm',gender:'nam'})).ok,true);
  assert.equal((await api('/api/site-status')).trial,true);
  for(const [route,body] of [['/api/act',{type:'cultivate'}],['/api/act',{type:'breakthrough'}],['/api/retreat/start',{hours:1}],['/api/retreat/claim',{}],['/api/tower/start',{}],['/api/dungeon/sweep',{zone:ZONES[0].id,stage:1}],['/api/event/start',{}],['/api/dungeon/start',{zone:ZONES[0].id,stage:2}],['/api/dungeon/start',{zone:ZONES[1].id,stage:1}]]){
    const r=await api(route,body);assert.equal(r.status,403,route);assert.equal(r.trial,true,route);
  }
  // Chủ game chốt 10/11/2026: chỉ khóa tu luyện/bế quan; trang bị, skin, pháp bảo, cường hóa, linh thú, cửa hàng, thư, quà vẫn mở.
  for(const [route,body] of [['/api/act',{type:'gender',gender:'nu'}],['/api/act',{type:'equip',itemId:'x'}],['/api/forge/enhance',{slot:'weapon'}],['/api/pets/feed',{}],['/api/shop/buy',{id:'x'}],['/api/quests/claim',{id:'x'}],['/api/mail/claim',{}],['/api/gift/claim',{}]])
    assert.notEqual((await api(route,body)).trial,true,route);
  const me=Object.values(world.players).find(p=>p.webOnly),before={qi:me.qi,totalQi:me.totalQi,stones:me.stones,herbs:me.herbs,mats:JSON.stringify(me.mats||{})};
  const s=await api('/api/dungeon/start',{zone:ZONES[0].id,stage:1});assert.equal(s.ok,true);
  await new Promise(r=>setTimeout(r,4100));
  const f=await api('/api/dungeon/finish',{battleId:s.battleId,victory:true,hpLeft:1,pillsUsed:0});assert.equal(f.ok,true);assert.equal(f.victory,true);
  assert.deepEqual({qi:f.reward.qi,stones:f.reward.stones,herbs:f.reward.herbs},{qi:0,stones:0,herbs:0});
  assert.deepEqual({qi:me.qi,totalQi:me.totalQi,stones:me.stones,herbs:me.herbs,mats:JSON.stringify(me.mats||{})},before);
  assert.equal((await api('/api/dungeon/start',{zone:ZONES[0].id,stage:2})).status,403);
  assert.equal((await api('/api/logout',{})).ok,true);
});
