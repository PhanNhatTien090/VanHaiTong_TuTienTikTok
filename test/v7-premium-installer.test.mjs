import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {deflateRawSync} from 'node:zlib';
import {PREMIUM_FILES,installV7Premium,readPremiumPack} from '../scripts/install-v7-premium.mjs';
import {V7_PREMIUM_ENABLED, V7_PREMIUM_FILES} from '../public/v7-premium-config.js';
import {prewarmV7Premium,premiumArtKeys,premiumGiftArtKey,drawPremiumArt} from '../public/v7-premium-art.js';
import {createCanvas} from '@napi-rs/canvas';

function fakeWebp(tag){
 const b=Buffer.alloc(1150,tag);b.write('RIFF',0,'ascii');b.writeUInt32LE(b.length-8,4);
 b.write('WEBP',8,'ascii');return b;
}
function zipPack(blobs){
 let position=0;
 const local=[],central=[];
 for(const [index,[name,bytes]]of [...blobs].entries()){
  const filename=Buffer.from('van_hai_tong_v7_asset_pack/alpha_webp/'+name);
  const body=deflateRawSync(bytes),l=Buffer.alloc(30),c=Buffer.alloc(46);
  l.writeUInt32LE(0x04034b50,0);l.writeUInt16LE(20,4);l.writeUInt16LE(8,8);
  l.writeUInt32LE(body.length,18);l.writeUInt32LE(bytes.length,22);l.writeUInt16LE(filename.length,26);
  c.writeUInt32LE(0x02014b50,0);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt16LE(8,10);
  c.writeUInt32LE(body.length,20);c.writeUInt32LE(bytes.length,24);c.writeUInt16LE(filename.length,28);
  c.writeUInt32LE(position,42);
  local.push(l,filename,body);central.push(c,filename);
  position+=l.length+filename.length+body.length;
 }
 const middle=Buffer.concat(central);
 const end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);
 end.writeUInt16LE(blobs.size,8);end.writeUInt16LE(blobs.size,10);
 end.writeUInt32LE(middle.length,12);end.writeUInt32LE(position,16);
 return Buffer.concat([...local,middle,end]);
}

test('premium art is opt-in and only prewarms the skills actually competing',()=>{
 assert.equal(V7_PREMIUM_ENABLED,false);
 assert.equal(V7_PREMIUM_FILES.length,0);
 const match={id:'a',a:'A',b:'B',techniques:{A:{id:'thunder'},B:{id:'flame'}}};
 assert.deepEqual(new Set(premiumArtKeys(match)),new Set(['thunderDragon','thunderImpact','phoenix','phoenixImpact','shatter']));
 assert.equal(prewarmV7Premium({},match),false);
});

test('gift premium atlas selection is strictly tier-scoped and bounded',()=>{
 assert.deepEqual([100,500,700,1000,1500,2000,5000].map(premiumGiftArtKey),
  [null,'phoenix','thunderAtlas','formationAtlas',null,'goldenAtlas','goldenAtlas']);
});
test('installer validates a local extracted folder and its own generated switch without touching the real repo',async()=>{
 const tmp=await mkdtemp(join(tmpdir(),'v7-install-'));
 try{
  const input=join(tmp,'pack'),output=join(tmp,'target');
  await mkdir(join(input,'alpha_webp'),{recursive:true});
  for(const [i,name]of PREMIUM_FILES.entries())await writeFile(join(input,'alpha_webp',name),fakeWebp(i+18));
  const installed=await installV7Premium(input,{root:output});
  assert.equal(installed.files,10);
  const config=await readFile(join(output,'public','v7-premium-config.js'),'utf8');
  assert.match(config,/V7_PREMIUM_ENABLED=true/);
  const manifest=JSON.parse(await readFile(join(output,'public','assets','v7-premium','manifest.json'),'utf8'));
  assert.equal(manifest.files.length,10);
  assert.equal(manifest.files[0].sha256.length,64);
  const again=await readFile(join(output,'public','assets','v7-premium','thunder-dragon.webp'));
  assert.equal(again.toString('ascii',0,4),'RIFF');
 }finally{await rm(tmp,{recursive:true,force:true});}
});

test('installer safely reads compact ZIP uploads with central-directory deflate entries',async()=>{
 const tmp=await mkdtemp(join(tmpdir(),'v7-zip-'));
 try{
  const blobs=new Map(PREMIUM_FILES.map((file,i)=>[file,fakeWebp(i+20)]));
  const name=join(tmp,'asset-pack.zip');await writeFile(name,zipPack(blobs));
  const decoded=await readPremiumPack(name);
  assert.equal(decoded.size,10);
  for(const key of PREMIUM_FILES)assert.deepEqual(decoded.get(key),blobs.get(key));
  const dest=await installV7Premium(name,{root:join(tmp,'webgame')});
  assert.equal(dest.files,10);
 }finally{await rm(tmp,{recursive:true,force:true});}
});

test('malformed ZIP and mislabeled images are rejected before any output files are written',async()=>{
 const tmp=await mkdtemp(join(tmpdir(),'v7-fail-'));
 try{
  const fake=join(tmp,'bad.zip');await writeFile(fake,Buffer.from('not a ZIP file'));
  await assert.rejects(readPremiumPack(fake),/ZIP/);
  const src=join(tmp,'badpack');await mkdir(join(src,'alpha_webp'),{recursive:true});
  for(const name of PREMIUM_FILES)await writeFile(join(src,'alpha_webp',name),fakeWebp(10));
  await writeFile(join(src,'alpha_webp','screen-shatter.webp'),Buffer.alloc(1800));
  await assert.rejects(installV7Premium(src,{root:join(tmp,'target')}),/Not a WebP/);
 }finally{await rm(tmp,{recursive:true,force:true});}
});

test('premium art draws through a single bounded image call, no separate scheduler',()=>{
 const canvas=createCanvas(320,320),c=canvas.getContext('2d');
 let calls=0;const native=c.drawImage.bind(c);
 c.drawImage=(...args)=>{calls++;native(...args);};
 assert.equal(drawPremiumArt(c,null,140,140,200,200),false);
 assert.equal(calls,0);
 const sprite=createCanvas(32,32);
 const p=sprite.getContext('2d');p.fillStyle='#d5aaff';p.fillRect(0,0,32,32);
 sprite.naturalWidth=sprite.width;
 assert.equal(drawPremiumArt(c,sprite,140,140,140,140,.9),true);
 assert.equal(calls,1);
 const rgba=c.getImageData(140,140,1,1).data;assert.ok(rgba[3]>0);
});
