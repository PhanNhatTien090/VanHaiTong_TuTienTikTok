import {spawn} from 'node:child_process';import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const data=path.resolve('output/pet-http-smoke-'+Date.now());fs.mkdirSync(data,{recursive:true});
const child=spawn(process.execPath,['server.mjs'],{cwd:process.cwd(),windowsHide:true,env:{...process.env,PORT:'0',VAN_HAI_DATA_DIR:data,VAN_HAI_TTS:'off',VAN_HAI_BRIDGE_AUTO:''},stdio:['ignore','pipe','pipe']});
try{
 const base=await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('smoke server timeout')),15000);child.stdout.on('data',b=>{const match=String(b).match(/http:\/\/127.0.0.1:(\d+)/);if(match){clearTimeout(timeout);resolve('http://127.0.0.1:'+match[1]);}});child.once('exit',code=>{clearTimeout(timeout);reject(Error('server exited '+code));});});
 const post=async(route,body)=>{const r=await fetch(base+route+'?world=demo',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});return r.json();};
 assert.equal((await post('/api/pet-event',{action:'start',minutes:15})).ok,true);
 assert.equal((await post('/api/lantern-event',{action:'start'})).ok,true);
 for(const id of ['lantern-smoke-a','lantern-smoke-b'])assert.equal((await post('/api/action',{type:'chat',userId:id,name:id,text:'cungtu'})).ok,true);
 assert.equal((await post('/api/action',{type:'like',userId:'pet-smoke',name:'Pet smoke',count:400})).ok,true);
 const overlay=await(await fetch(base+'/api/state?world=demo&view=overlay')).json();assert.equal(overlay.petEvent.active,true);assert.equal(overlay.players.find(p=>p.id==='pet-smoke').spiritPet,'ember-fox');
 assert.equal(overlay.lanternFestival.active,true);assert.ok(overlay.companionStatus);assert.equal((await post('/api/lantern-event',{action:'stop'})).ok,true);
 for(let i=0;i<2;i++)await post('/api/action',{type:'gift',userId:'combo-smoke',name:'Combo smoke',coins:30,giftName:'Rose',eventId:'smoke-'+i});
 const comboState=await(await fetch(base+'/api/state?world=demo')).json(),gifts=comboState.events.filter(e=>e.user==='combo-smoke'&&e.gift),ids=gifts.map(e=>e.id).join(',');assert.equal(gifts.length,2);assert.equal(comboState.players.find(p=>p.id==='combo-smoke').giftCoins,60);
 assert.equal((await fetch(base+'/api/speech?world=demo&ids='+encodeURIComponent(ids))).status,503,'validated combo reaches the intentionally disabled TTS, not missing event');
 for(const route of ['/spirit-pets-preview.html','/spirit-pet-ui.js','/spirit-pets.css','/assets/spirit-pets-v1/sun-phoenix.png'])assert.equal((await fetch(base+route)).status,200);
 await post('/api/pet-event',{action:'stop'});const state=await(await fetch(base+'/api/state?world=demo')).json();assert.equal(state.petEvent.active,false);assert.equal(state.players.find(p=>p.id==='pet-smoke').spiritPet,'ember-fox');
 console.log('PASS: isolated HTTP pets + lantern event controls, state, combo speech validation and unchanged reward accounting; no LIVE data touched.');
}finally{child.kill();}
