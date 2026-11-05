import test from 'node:test';import assert from 'node:assert/strict';import http from 'node:http';
import {createOverlayRelay} from '../scripts/overlay-relay.mjs';
test('public overlay relay requires its link, serves overlay snapshots, blocks admin writes and private routes',async()=>{
 let resolveFeed;const fed=new Promise(r=>resolveFeed=r);const requests=[];
 const origin=http.createServer((req,res)=>{requests.push(req.url);if(req.url.startsWith('/api/events')){res.writeHead(200,{'Content-Type':'text/event-stream'});res.write('data: '+JSON.stringify({players:[{name:'Test'}],events:[]})+'\n\n');}else{res.end('asset');}});
 await new Promise(r=>origin.listen(0,'127.0.0.1',r));
 const relay=createOverlayRelay({origin:'http://127.0.0.1:'+origin.address().port,token:'test-access-token',onSnapshot:resolveFeed});await new Promise(r=>relay.server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+relay.server.address().port,headers={cookie:'overlay_access=test-access-token'};
 try{await fed;assert.equal((await fetch(base+'/api/state')).status,403);
 const entry=await fetch(base+'/?key=test-access-token',{redirect:'manual'});assert.equal(entry.status,302);assert.match(entry.headers.get('set-cookie'),/HttpOnly; Secure; SameSite=Lax/);assert.match(entry.headers.get('location'),/transport=poll/);
 const state=await fetch(base+'/api/state?world=demo',{headers});assert.equal((await state.json()).players[0].name,'Test');
 for(const p of ['/api/player','/api/export','/api/bridge-samples','/manual.html','/data/live.json','/assets/../server.mjs'])assert.equal((await fetch(base+p,{headers})).status,404);
 assert.equal((await fetch(base+'/api/player',{method:'POST',headers,body:'{}'})).status,405);
 assert.equal((await fetch(base+'/app.js',{headers})).status,200);
 assert.equal((await fetch(base+'/api/client-status',{method:'POST',headers,body:'{}'})).status,200);
 assert.equal(requests.filter(x=>x.startsWith('/api/events')).length,1);
 assert.equal(requests.some(x=>x.includes('/api/player')),false);
 }finally{await relay.close();origin.closeAllConnections();await new Promise(r=>origin.close(r));}
});
