import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {nguyenAnhState,nguyenAnhStreamPoint,nguyenAnhBudget} from '../public/nguyen-anh-awakening.js';
import {NGUYEN_ANH_ASSETS,sliceNguyenAnhArt} from '../public/nguyen-anh-art.js';
import {drawRitual} from '../public/live-cinema.js';
import {breakthroughDuration} from '../public/breakthrough-fx.js';
import {presentationDuration} from '../public/presentation.js';
import {scheduleNguyenAnhAudio,nguyenAnhMusicDuck} from '../public/nguyen-anh-audio.js';
import {CultivationAudio,MUSIC_GAIN} from '../public/audio.js';
const at=(t,H=1600,motion=true)=>nguyenAnhState(t/14.4,H,motion);

test('lotus opens in three layers, the spirit manifests and enters before the release',()=>{
 assert.deepEqual(at(1.19).blooms,[0,0,0]);assert.deepEqual(at(4.3).blooms,[1,1,1]);
 assert.equal(at(5.79).manifest,0);assert.equal(at(6.9).manifest,1);
 assert.equal(at(8.8).enter,0);assert.ok(Math.abs(at(10.4).enter-1)<1e-9);
 assert.ok(Math.abs(at(10.4).soul.y-at(10.4).belly)<1e-8);assert.equal(at(10.4).soul.alpha,0);
 assert.equal(at(10.749).burst,0);assert.equal(at(10.949).revealed,false);assert.equal(at(10.95).revealed,true);
 for(const t of [1.2,2.2,3.2,5.8,8.8,10.4,10.75,10.95]){const a=at(t-1e-6),b=at(t+1e-6);assert.ok(Math.hypot(a.soul.x-b.soul.x,a.soul.y-b.soul.y)<.002);assert.ok(Math.abs(a.soul.size-b.soul.size)<.002);}
});
test('effect density steps up and Light retains all petals, the spirit and five waves',()=>{
 const full=nguyenAnhBudget(false),light=nguyenAnhBudget(true);
 assert.equal(full.petals,36);assert.equal(full.streams,24);assert.ok(full.motes>=3*46);assert.equal(full.waves,5);
 assert.equal(light.petals,full.petals);assert.equal(light.waves,full.waves);assert.ok(light.streams<full.streams);assert.ok(light.motes<full.motes);
 assert.equal(at(11,1600,false).clock,0);assert.ok(at(11,1600,false).burst<=.28);
});
test('every qi stream reaches the moving spirit across viewport heights and motion modes',()=>{
 for(const H of [1200,1600,2000])for(const motion of [true,false])for(const t of [4.8,9.6,10.4]){
  const s=at(t,H,motion);for(let i=0;i<24;i++){const p=nguyenAnhStreamPoint(s,i,1);assert.ok(Math.abs(p.x-s.soul.x)<1e-7);assert.ok(Math.abs(p.y-(s.soul.y+45*(1-s.enter)))<1e-7);}assert.deepEqual(at(t,H,motion),s);
 }
});
test('existing PNG atlas tiles are actually drawn; only name/realm appear and rewards stay intact',async()=>{
 const art={};for(const spec of NGUYEN_ANH_ASSETS)Object.assign(art,sliceNguyenAnhArt(await loadImage('public'+spec.url),spec.tiles,createCanvas));
 assert.deepEqual(Object.keys(art).sort(),['burst','groundWave','halo','lotus']);
 for(const im of Object.values(art)){const c=im.getContext('2d');assert.equal(c.getImageData(0,0,1,1).data[3],0);assert.ok(c.getImageData(0,0,im.width,im.height).data.some((v,i)=>i%4===3&&v>0));}
 const c=createCanvas(900,1600).getContext('2d'),texts=[],seen=[],used=new Set(),draw=c.drawImage.bind(c);c.fillText=text=>texts.push(text);c.drawImage=(im,...args)=>{used.add(im);draw(im,...args);};
 const e={effect:'breakthrough',user:'a',name:'Mộc Miên',start:0,duration:14400,fromRealm:3,toRealm:4,visualFrom:{id:'a',realm:3},visualTo:{id:'a',realm:4},reward:{qi:77}},before=JSON.stringify(e),scene={motion:false,budget:{level:'light'},nguyenAnhArt:art,drawPlayer:(ctx,p)=>seen.push(p.realm)};
 for(const t of [.3,3.4,6.9,9.6,10.75,10.949,10.951,13.5])drawRitual(scene,c,e,t*1000,1600);
 assert.deepEqual(seen,[3,3,3,3,3,3,4,4]);assert.deepEqual([...new Set(texts)],['Mộc Miên','NGUYÊN ANH']);for(const im of Object.values(art))assert.ok(used.has(im));
 assert.equal(JSON.stringify(e),before);assert.equal(scene.compact,undefined);assert.equal(scene.ritualDrawing,undefined);assert.equal(c.globalCompositeOperation,'source-over');
 assert.equal(breakthroughDuration(e),14400);assert.equal(presentationDuration(e),14400);let prev=0;for(let r=1;r<=18;r++){const d=breakthroughDuration({toRealm:r});if(r===9)assert.equal(d,26000);else assert.ok(d>prev);prev=d;}
});
class Param {value=0;setValueAtTime(v){assert.ok(Number.isFinite(v));}linearRampToValueAtTime(v){assert.ok(Number.isFinite(v));}exponentialRampToValueAtTime(v){assert.ok(v>0&&Number.isFinite(v));}cancelScheduledValues(){}setTargetAtTime(){}}
class Context {
 currentTime=10;sampleRate=8000;state='running';nodes=[];sources=[];
 node(source=false){const n={gain:new Param(),frequency:new Param(),Q:new Param(),pan:new Param(),connect(){},disconnect(){this.disconnected=true;},start(at){this.at=at;},stop(at){this.stopAt=at;}};for(const k of ['threshold','knee','ratio','attack','release'])n[k]=new Param();this.nodes.push(n);if(source)this.sources.push(n);return n;}
 createGain(){return this.node();}createConvolver(){return this.node();}createBiquadFilter(){return this.node();}createStereoPanner(){return this.node();}createDynamicsCompressor(){return this.node();}createOscillator(){return this.node(true);}createBufferSource(){return this.node(true);}
 createBuffer(ch,n){const d=Array.from({length:ch},()=>new Float32Array(n));return {getChannelData:i=>d[i]};}
}
test('audio follows bloom/release milestones and skips stale impacts after resuming a tab',()=>{
 const c=new Context(),cue=scheduleNguyenAnhAudio(c,{});assert.ok(c.sources.some(s=>Math.abs(s.at-20.75)<1e-8));assert.ok(c.sources.some(s=>Math.abs(s.at-11.2)<1e-8));cue.stop();assert.ok(c.sources.every(s=>s.stopAt<=10.05));
 const late=new Context();scheduleNguyenAnhAudio(late,{},11.2,14.4,1,'burst');assert.equal(late.sources.length,0);
 const stem=new Context();scheduleNguyenAnhAudio(stem,{},0,14.4,1,'waves');assert.equal(stem.sources.length,10);assert.ok(stem.sources.every(s=>s.at>=20.75&&s.at<21.4));
 assert.equal(nguyenAnhMusicDuck(10800),.13);assert.equal(nguyenAnhMusicDuck(14400),1);
});
test('dedicated spirit audio starts once and interruption preserves narration duck',async()=>{
 const a=new CultivationAudio();a.enabled=true;a.ctx=new Context();a.master=a.ctx.createGain();a.ambBus=a.ctx.createGain();a.fxBus=a.ctx.createGain();a.music={volume:0};
 const event={toRealm:4,duration:14400};a.ritual(event,0);const count=a.ctx.sources.length;a.ritual(event,10800);assert.equal(a.ctx.sources.length,count);assert.equal(a.qiSession.duck,.13);
 a.duck(true);a.ritual(null);assert.equal(a.music.volume,a.volume*a.ambient*MUSIC_GAIN*.28);await new Promise(r=>setTimeout(r,100));assert.ok(a.ctx.nodes.some(n=>n.disconnected));a.enabled=false;a.ritual(event);assert.equal(a.qiSession,null);
});
