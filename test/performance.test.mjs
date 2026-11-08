import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {CharacterFrames,RenderBudget,QUALITY,FrameClock,inView,actorSample,BitmapCache,renderDimensions} from '../public/performance.js';

test('output stays full HD even inside a narrow Studio pane; editor preview remains bounded',()=>{
 assert.deepEqual(renderDimensions({width:635,height:635*16/9},QUALITY.balanced),{width:1080,height:1920});
 assert.deepEqual(renderDimensions({width:360,height:640},QUALITY.balanced,true),{width:720,height:1280});
 assert.deepEqual(renderDimensions({width:1080,height:1920},QUALITY.light),{width:1080,height:1920});
 assert.equal(renderDimensions({width:0,height:0},QUALITY.high),null);
});

test('automatic budget lowers resolution on sustained slow rendering and waits before recovery',()=>{
  const b=new RenderBudget();for(let i=0;i<60;i++)b.sample(35,12000+i*34,10);
  assert.equal(b.level,'light');assert.equal(b.config.width,QUALITY.light.width);
  for(let i=0;i<100;i++)b.sample(4,16000+i*34,24);
  assert.equal(b.level,'light');
  for(let i=0;i<60;i++)b.sample(4,50000+i*34,24);
  assert.equal(b.level,'balanced');
  // 08/11: đặt cứng 'high' mà FPS thật <15 (LIVE Studio + GPU tích hợp) thì vẫn hạ một bậc, giữ 1080 px.
  b.set('high');for(let i=0;i<100;i++)b.sample(99,100000+i*100,4);assert.equal(b.level,'balanced');assert.equal(b.config.width,1080);
  const keep=new RenderBudget('high');for(let i=0;i<100;i++)keep.sample(3,200000+i*100,30);assert.equal(keep.level,'high');
  assert.ok(QUALITY.light.width===QUALITY.balanced.width&&QUALITY.light.mesh<QUALITY.balanced.mesh&&QUALITY.balanced.width<QUALITY.high.width);
});

test('GPU-starved low FPS also triggers auto mode even when CPU draw timings look small',()=>{
  const b=new RenderBudget();for(let i=0;i<60;i++)b.sample(12,12000+i*100,6);assert.equal(b.level,'light');
});

test('actor frames reuse rasterized poses, invalidate on action/skin and stay bounded',()=>{
  const frames=new CharacterFrames(createCanvas),canvas=createCanvas(200,200),c=canvas.getContext('2d');let paints=0;
  const paint=x=>{paints++;x.fillStyle='#fff';x.fillRect(-5,-5,10,10);};
  for(let i=0;i<10;i++)frames.draw(c,'actor','tick1:jade',paint);
  assert.equal(paints,1);
  frames.draw(c,'actor','tick1:moon:new-action',paint);assert.equal(paints,2);
  for(let i=0;i<100;i++)frames.draw(c,String(i),'tick',paint);
  assert.equal(frames.frames.size,64);frames.clear();assert.equal(frames.frames.size,0);
});

test('offline/non-browser rendering falls back without a canvas allocator',()=>{
  const f=new CharacterFrames(()=>null);assert.equal(f.draw({},'actor','tick',()=>assert.fail()),false);
});

test('low quality actor buffers use a quarter of the pixels and rebuild correctly after a quality change',()=>{
 const frames=new CharacterFrames(createCanvas),c=createCanvas(200,200).getContext('2d');let paints=0;
 const paint=()=>paints++;
 frames.draw(c,'a','same',paint,1);assert.equal(frames.frames.get('a').canvas.width,120);
 frames.draw(c,'a','same',paint,1);assert.equal(paints,1);
 frames.draw(c,'a','same',paint,2);assert.equal(paints,2);assert.equal(frames.frames.get('a').canvas.width,240);
});
test('actor updates are staggered across frames with monotonic time; reduced motion reuses a single pose',()=>{
 const due=Array.from({length:12},()=>0);
 for(let i=0;i<24;i++)for(let f=1;f<=12;f++)if(actorSample(f*1000/60,6,'actor-'+i).tick!==actorSample((f-1)*1000/60,6,'actor-'+i).tick)due[f-1]++;
 assert.ok(Math.max(...due)<24);assert.ok(due.filter(n=>n>0).length>=4);
 for(let t=0;t<1000;t+=16){const a=actorSample(t,6,'a'),b=actorSample(t+16,6,'a');assert.ok(a.at<=t&&b.at>=a.at);}
 assert.deepEqual(actorSample(100,6,'a',false),actorSample(9999,6,'a',false));
});
test('nameplate cache avoids repeat text rasterization, invalidates content and evicts least-recently-used entries',()=>{
 const cache=new BitmapCache(2,createCanvas);let paints=0;const paint=()=>paints++;
 const a=cache.get('a:old',30,20,paint);assert.equal(cache.get('a:old',30,20,paint),a);assert.equal(paints,1);
 cache.get('b',30,20,paint);cache.get('a:old',30,20,paint);cache.get('a:new',30,20,paint);
 assert.equal(cache.items.has('b'),false);assert.equal(cache.items.size,2);assert.equal(paints,3);
});


test('30fps scheduler retains fractional time and does not collapse to 20fps on 60Hz',()=>{
 const clock=new FrameClock();let rendered=0;for(let i=0;i<600;i++)if(clock.ready(i*1000/60,30))rendered++;
 assert.ok(rendered>=295&&rendered<=302,`rendered ${rendered} in ten seconds`);
 assert.equal(inView({x:1000,y:500,scale:1},{s:1,x:0,y:0},1600),false);
 assert.equal(inView({x:450,y:900,scale:1},{s:1,x:0,y:0},1600),true);
});


test('zooming back out reuses sharp actor raster and repaint keeps its native transform',()=>{let allocations=0,transform;const frames=new CharacterFrames((w,h)=>{allocations++;return createCanvas(w,h);}),c=createCanvas(200,200).getContext('2d');frames.draw(c,'a','pose1',()=>{},4);const original=frames.frames.get('a').canvas;frames.draw(c,'a','pose2',x=>{transform=x.getTransform().a;},2);assert.equal(allocations,1);assert.equal(frames.frames.get('a').canvas,original);assert.equal(transform,4);});
test('large zoom rasters obey a byte ceiling and evict least recently used',()=>{const f=new CharacterFrames(createCanvas),c=createCanvas(100,100).getContext('2d');for(let i=0;i<40;i++)f.draw(c,'p'+i,'k',()=>{},8);assert.ok(f.bytes<=32*1024*1024);assert.ok(f.frames.size<10);assert.equal(f.frames.has('p39'),true);assert.equal(f.frames.has('p0'),false);f.clear();assert.equal(f.bytes,0);});
test('LIVE output ceiling preserves Full HD and high detail without a 1440p backing buffer',()=>{assert.deepEqual(renderDimensions({width:900,height:1600},QUALITY.high,false,1080),{width:1080,height:1920});});
