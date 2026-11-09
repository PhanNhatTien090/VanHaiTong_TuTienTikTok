import {test} from 'node:test';import assert from 'node:assert/strict';
import {TM,THIEN_MA_DURATION,TM_GLYPHS,TM_HALO,TM_STARS,TM_BLADES,TM_TURNS,thienMaState,thienMaHits,drawThienMaAwakening} from '../public/thien-ma-awakening.js';
import {DT,DIET_THE_DURATION,DT_TEARS,DT_PILLARS,DT_SLASHES,DT_PLATES,DT_FRAGS,DT_SWEEPS,dietTheState,dietTheHits,drawDietTheAwakening} from '../public/diet-the-awakening.js';
import {THIEN_MA_SCORE,thienMaMusicDuck} from '../public/thien-ma-audio.js';
import {DIET_THE_SCORE,dietTheMusicDuck} from '../public/diet-the-audio.js';
import {drawMaThanAwakening} from '../public/ma-than-awakening.js';
import {ascensionProfile} from '../public/ascension-art.js';
const ordered=(obj,keys)=>{for(let i=1;i<keys.length;i++)assert.ok(obj[keys[i]]>obj[keys[i-1]],keys[i]+' sau '+keys[i-1]);};
test('Thiên Ma Thánh Đế: dài hơn Ma Thần 2 s, nhịp đúng thứ tự, nổ trước rồi mới đổi skin, nổ là cú mạnh nhất',()=>{
 assert.equal(ascensionProfile(23).duration,THIEN_MA_DURATION);assert.equal(THIEN_MA_DURATION-ascensionProfile(22).duration,2000);
 ordered(TM,['rift','riftOpen','glyphs','locked','eyes','gaze','gazeEnd','halo','haloSpin','stars','devoured','blink','open','beam','mark','blades','crowned','invert','collapse','absorbed','dark','impact','reveal','fade']);
 assert.ok(TM_GLYPHS.at(-1)<TM.locked&&TM_HALO.at(-1)<TM.haloSpin&&TM_STARS.at(-1)<TM.devoured&&TM_BLADES.at(-1)<TM.crowned&&TM_TURNS.at(-1)<TM.collapse);
 assert.ok(TM.reveal>TM.impact&&TM.reveal-TM.impact<.5);
 assert.equal(thienMaState(TM.impact/TM.duration-.001).revealed,false);assert.equal(thienMaState(TM.reveal/TM.duration+.001).revealed,true);
 const hits=thienMaHits();assert.equal(Math.max(...hits.map(h=>h[1])),hits.find(h=>h[0]===TM.impact)[1]);
 const gaps=hits.map(h=>h[0]).sort((a,b)=>a-b).slice(1).map((t,i,a)=>t-(i?a[i-1]:hits.map(h=>h[0]).sort((x,y)=>x-y)[0]));assert.ok(Math.max(...gaps)<=2.2,'dồn dập: không có khoảng lặng quá 2,2 s');
});
test('Diệt Thế Chí Tôn: dài hơn Thiên Ma 2 s, nhịp đúng thứ tự, nổ trước rồi mới đổi skin, nổ là cú mạnh nhất',()=>{
 assert.equal(ascensionProfile(24).duration,DIET_THE_DURATION);assert.equal(DIET_THE_DURATION-THIEN_MA_DURATION,2000);
 ordered(DT,['dot','hole','lens','planets','swallowed','fire','crack','sword','wings','spread','crown','ignite','descend','absorbed','erase','dark','impact','reveal','fade']);
 assert.ok(DT_TEARS.at(-1)<DT.swallowed&&DT_PILLARS[0]>DT.fire&&DT_SLASHES[0]>DT.sword&&DT_PLATES.at(-1)<DT.spread&&DT_FRAGS.at(-1)<DT.ignite&&DT_SWEEPS.at(-1)<DT.dark);
 assert.equal(dietTheState(DT.impact/DT.duration-.001).revealed,false);assert.equal(dietTheState(DT.reveal/DT.duration+.001).revealed,true);
 const hits=dietTheHits();assert.equal(Math.max(...hits.map(h=>h[1])),hits.find(h=>h[0]===DT.impact)[1]);
 const ts=hits.map(h=>h[0]).sort((a,b)=>a-b);assert.ok(Math.max(...ts.slice(1).map((t,i)=>t-ts[i]))<=2.2,'dồn dập');
});
test('âm 23/24: cue nằm trong cảnh, cue ngắn transient, có cú nổ đúng mốc, nhạc nền nhường chỗ tới sau nổ',()=>{
 for(const [S,M,dur,tags,duck] of [[THIEN_MA_SCORE,TM,48,['rift-tear','gear-clank','blade-hit','invert-slide','heart-lub'],thienMaMusicDuck],[DIET_THE_SCORE,DT,50,['planet-break','slash','plate-lock','erase-sweep','heart-lub'],dietTheMusicDuck]]){
  assert.ok(S.length>300);for(const cue of S){assert.ok(cue.at>=0&&cue.at+cue.len<=dur+.5,cue.tag+' @'+cue.at);assert.ok(cue.level>0&&cue.level<.5,cue.tag);}
  for(const tag of tags)assert.ok(S.some(c=>c.tag===tag&&c.transient),tag);
  assert.ok(S.some(c=>c.tag==='release-crack'&&Math.abs(c.at-M.impact)<.01));
  assert.equal(duck(10000),.08);assert.equal(duck(dur*1000),1);}
});
test('Ma Thần, Thiên Ma, Diệt Thế trả khung HUD (realm, revealed) để scene phát nhạc riêng và hiện chữ',()=>{
 const noop=()=>{},ctx=new Proxy({},{get:(o,k)=>k in o?o[k]:(k==='createLinearGradient'||k==='createRadialGradient'?()=>({addColorStop:noop}):noop),set:(o,k,v)=>(o[k]=v,true)});
 const scene={motion:true,budget:{level:'full'},drawPlayer:noop};
 for(const [draw,realm,dur,reveal] of [[drawMaThanAwakening,22,46000,40.3],[drawThienMaAwakening,23,48000,TM.reveal],[drawDietTheAwakening,24,50000,DT.reveal]]){
  const e={id:'x'+realm,user:'u',name:'A',start:0,duration:dur,toRealm:realm,fromRealm:realm-1};
  for(const sec of [1,reveal-.2,reveal+.5]){const ui=draw(scene,ctx,e,sec*1000,1600);assert.equal(ui?.realm,realm);assert.equal(ui.revealed,sec>reveal);}}
});
