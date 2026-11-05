import http from 'node:http';
import {randomBytes,timingSafeEqual} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export function createOverlayRelay({origin='http://127.0.0.1:4317',token,onSnapshot=()=>{}}){
 let cached=null,updatedAt=0,closed=false,controller;
 const same=value=>typeof value==='string'&&Buffer.byteLength(value)===Buffer.byteLength(token)&&timingSafeEqual(Buffer.from(value),Buffer.from(token));
 async function feed(){while(!closed){controller=new AbortController();try{
  const r=await fetch(origin+'/api/events?world=live&view=overlay',{signal:controller.signal});if(!r.ok)throw Error('Source unavailable');
  let pending='';const decoder=new TextDecoder();for await(const chunk of r.body){pending+=decoder.decode(chunk,{stream:true});let end;while((end=pending.indexOf('\n\n'))>=0){const event=pending.slice(0,end);pending=pending.slice(end+2);const data=event.split('\n').filter(x=>x.startsWith('data: ')).map(x=>x.slice(6)).join('\n');if(data){const parsed=JSON.parse(data);cached=JSON.stringify(parsed);updatedAt=Date.now();onSnapshot(parsed);}}}
 }catch{}if(!closed)await new Promise(r=>setTimeout(r,1500));}}
 const source=feed();
 const server=http.createServer((req,res)=>{
  res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-store');
  const fail=(status,message)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:false,message}));};
  let url;try{url=new URL(req.url,'http://overlay.local');}catch{return fail(400,'Bad URL');}
  const cookie=req.headers.cookie?.split(';').map(x=>x.trim()).find(x=>x.startsWith('overlay_access='))?.slice(15);
  if(url.pathname==='/'&&same(url.searchParams.get('key'))){
   const target='/?overlay=1&world=live&sound=1&zoom=1.3&quality=light&transport=poll#tiktok.studio';
   res.writeHead(302,{'Set-Cookie':`overlay_access=${token}; HttpOnly; Secure; SameSite=Lax; Path=/`,'Location':target});return res.end();
  }
  if(!same(cookie))return fail(403,'Link truy cập không hợp lệ.');
  if(url.pathname==='/api/client-status'&&req.method==='POST'){res.writeHead(200,{'Content-Type':'application/json'});return res.end('{"ok":true}');}
  if(req.method!=='GET'&&req.method!=='HEAD')return fail(405,'Nguồn phát chỉ đọc.');
  if(url.pathname==='/api/state'){
   if(!cached||Date.now()-updatedAt>15000)return fail(503,'Đang kết nối server LIVE trên máy chủ.');
   res.writeHead(200,{'Content-Type':'application/json; charset=utf-8'});return res.end(req.method==='HEAD'?undefined:cached);
  }
  let pathname;try{pathname=decodeURIComponent(url.pathname);}catch{return fail(400,'Bad path');}
  if(pathname.includes('\\')||pathname.split('/').some(x=>x==='..'||x.startsWith('.')))return fail(404,'Not found');
  const speech=pathname==='/api/speech';
  const asset=pathname==='/'||pathname==='/index.html'||/^\/[\w-]+\.(js|css|ico)$/.test(pathname)||/^\/assets\/[\w./ -]+\.(png|webp|jpg|jpeg|svg|mp3|wav|ogg|woff2?)$/i.test(pathname);
  if(!speech&&!asset)return fail(404,'Not found');
  if(speech){url.searchParams.set('world','live');if(!url.searchParams.has('id')&&!url.searchParams.has('ids')&&!['joins','busy'].includes(url.searchParams.get('summary')))return fail(400,'Missing event');}
  const upstream=http.request(new URL(pathname+url.search,origin),{method:req.method,headers:{...(req.headers.range?{range:req.headers.range}:{}),...(req.headers['if-none-match']?{'if-none-match':req.headers['if-none-match']}:{})}},remote=>{
   res.statusCode=remote.statusCode;for(const [k,v]of Object.entries(remote.headers)){if(!['connection','transfer-encoding','set-cookie','referrer-policy'].includes(k)&&v!==undefined)res.setHeader(k,v);}
   res.setHeader('Referrer-Policy','no-referrer');remote.pipe(res);
  });
  upstream.setTimeout(speech?60000:30000,()=>upstream.destroy());upstream.on('error',()=>{if(!res.headersSent)fail(502,'Máy chủ gốc chưa trả lời.');else res.destroy();});res.on('close',()=>upstream.destroy());upstream.end();
 });
 return {server,close:async()=>{closed=true;controller?.abort();server.closeAllConnections();await new Promise(r=>server.close(r));await source;}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const root=path.dirname(path.dirname(fileURLToPath(import.meta.url))),keyFile=path.join(root,'data/overlay-relay-key.txt');
 if(!fs.existsSync(keyFile))fs.writeFileSync(keyFile,randomBytes(32).toString('hex'));
 const relay=createOverlayRelay({token:fs.readFileSync(keyFile,'utf8').trim()});
 relay.server.listen(4318,'127.0.0.1',()=>console.log('Read-only overlay relay ready on 127.0.0.1:4318'));
 for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>relay.close().then(()=>process.exit()));
}
