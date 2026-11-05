import {encounterPhase} from './boss-encounters.js';
const CLAN={slash:'blade',sword:'blade',bamboo:'blade',flowersword:'blade',stararrow:'blade',thunder:'thunder',flame:'fire',dragon:'dragon',bell:'bell',soul:'dark',vortex:'wind',frost:'ice',petal:'magic',lotus:'magic',celestial:'thunder',meteor:'thunder'};
export const combatVoice=technique=>CLAN[technique]||'magic';
// One frame-clock observer. Entering mid-attack is silent; subsequent phase changes cue the visible action.
export function tickBattleSound(scene,b,now){
 if(!b){scene.battleSound=null;return;}
 const p=encounterPhase(b,now),phase=p?.id||'legacy';
 let s=scene.battleSound;
 if(!s||s.id!==b.id){scene.battleSound={id:b.id,phase,hp:b.hp,at:now,hitAt:now,legacyAt:now};return;}
 if(phase!==s.phase){
  if(now-s.at<1500){
   if(phase==='charge')scene.onCombatSound?.('boss-charge',b.species);
   if(phase==='strike')scene.onCombatSound?.('boss-strike',b.species);
   if(phase==='shield')scene.onCombatSound?.('boss-shield',b.species);
  }
  s.phase=phase;
 }
 if(phase==='legacy'&&now-s.legacyAt>5000){scene.onCombatSound?.('boss-strike',b.species);s.legacyAt=now;}
 if(b.hp<s.hp&&now-s.hitAt>=350){scene.onCombatSound?.('hit',b.species);s.hitAt=now;}
 s.hp=b.hp;s.at=now;
}
const noiseCache=new WeakMap();
function noiseBuffer(c){if(noiseCache.has(c))return noiseCache.get(c);const b=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=b.getChannelData(0);let seed=7123,low=0;for(let i=0;i<d.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const n=seed/2147483648-1;low=.78*low+.22*n;d[i]=low*.6+n*.15;}noiseCache.set(c,b);return b;}
export function scheduleBattleSound(c,bus,kind,variant='magic',gainScale=1){
 const at=c.currentTime+.005,nodes=[];
 const envelope=(node,duration,level,attack=.008)=>{const g=c.createGain();g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(Math.max(.0002,level*gainScale),at+attack);g.gain.exponentialRampToValueAtTime(.0001,at+duration);node.connect(g);g.connect(bus);return g;};
 const tone=(f,end,duration,level,wave='sine')=>{const o=c.createOscillator();o.type=wave;o.frequency.setValueAtTime(f,at);o.frequency.exponentialRampToValueAtTime(end,at+duration);envelope(o,duration,level);o.start(at);o.stop(at+duration+.02);nodes.push(o);};
 const gust=(duration,level,frequency,end,type='lowpass',attack=.015)=>{const o=c.createBufferSource(),f=c.createBiquadFilter();o.buffer=noiseBuffer(c);f.type=type;f.frequency.setValueAtTime(frequency,at);f.frequency.exponentialRampToValueAtTime(end,at+duration);if(f.Q)f.Q.value=.65;o.connect(f);envelope(f,duration,level,attack);o.start(at);o.stop(at+duration+.02);nodes.push(o);};
 if(kind==='cast'){
  if(variant==='blade'){gust(.24,.14,3400,550,'bandpass');tone(330,150,.15,.025,'triangle');}
  else if(variant==='thunder'){gust(.55,.17,2100,130);tone(85,42,.55,.10);}
  else if(variant==='fire'){gust(.65,.16,600,1700,'lowpass',.05);tone(140,72,.45,.045);}
  else if(variant==='dragon'){gust(.8,.14,350,950,'bandpass',.09);tone(110,58,.65,.065,'triangle');}
  else if(variant==='bell'){tone(196,190,.9,.07);tone(503,480,.65,.025);}
  else if(variant==='ice'){gust(.25,.08,3800,1300,'bandpass');tone(880,660,.28,.025);tone(1320,990,.25,.012);}
  else if(variant==='dark'){gust(.55,.12,650,110,'bandpass');tone(90,45,.6,.055);}
  else {gust(.36,.10,1400,400,'bandpass');tone(392,590,.3,.025,'triangle');}
 }else if(kind==='boss-charge'){
  gust(.95,.13,150,700,'bandpass',.16);tone(46,98,.9,.075,'triangle');
 }else if(kind==='boss-strike'){
  const heavy=variant==='abyss-dragon';gust(heavy?1.15:.7,heavy?.22:.16,heavy?900:1400,110,'lowpass',.035);
  tone(heavy?76:105,heavy?28:40,heavy?1.15:.6,heavy?.13:.09,'triangle');tone(heavy?111:155,50,.55,.035);
 }else if(kind==='boss-shield'){
  tone(250,180,.6,.045);gust(.3,.07,1600,480,'bandpass');
 }else if(kind==='hit'){
  gust(.17,.10,900,140);tone(125,65,.18,.055);
 }
 return {nodes,stop(){for(const node of nodes)try{node.stop(c.currentTime+.025);}catch{}}};
}
