// v4 (4/11/2026) Luyện Khí — âm thanh tự tổng hợp (không dùng mẫu của bên thứ ba), dựng theo lớp:
// khánh mở màn → nền trầm + hơi thở dâng → nốt ngũ cung theo linh châu → hút ngược + khoảng lặng
// → NỔ (bass hạ sâu + tiếng nứt + cồng + lấp lánh) → hợp âm đọng lại. Mốc tính trên khung 8,8 s, nổ ở 6,16 s
// (khớp QI_IMPACT=.70 trong qi-impact.js). Bus riêng đi qua compressor rồi vào fxBus chung.
const cache=new WeakMap(),irCache=new WeakMap();
export const QI_IMPACT_AT=6.16;
function noiseBuffer(c){if(cache.has(c))return cache.get(c);const b=c.createBuffer(1,c.sampleRate*3,c.sampleRate),d=b.getChannelData(0);let seed=8237,low=0;for(let i=0;i<d.length;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;low=.75*low+.25*(seed/2147483648);d[i]=low*2;}cache.set(c,b);return b;}
// Vang phòng lớn: nhiễu suy giảm theo hàm mũ, hai kênh lệch nhau cho cảm giác rộng (không còn vang "kim loại" của sóng sin).
function hallIR(c){if(irCache.has(c))return irCache.get(c);const n=Math.ceil(c.sampleRate*2.4),b=c.createBuffer(2,n,c.sampleRate);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);let seed=ch?91:7;for(let i=0;i<n;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;d[i]=(seed/2147483648)*Math.exp(-i/n*5.5)*.5;}}irCache.set(c,b);return b;}
export function scheduleQiAudio(c,destination,elapsed=0,duration=8.8,strength=1,pitch=1){
 const now=c.currentTime,scale=duration/8.8,bus=c.createGain(),nodes=[],graph=[bus];let active=0,cleanupTimer,stopped=false;bus.gain.value=1.45*strength;
 const dispose=()=>{for(const node of graph)node.disconnect?.();};
 // Quay lại tab sau cú nổ: không phát lại cú nổ cũ.
 if(elapsed>(QI_IMPACT_AT+.3)*scale){dispose();return {stop(){},endAt:now};}
 if(c.createDynamicsCompressor){const ceiling=c.createDynamicsCompressor();ceiling.threshold.value=-8;ceiling.knee.value=6;ceiling.ratio.value=6;ceiling.attack.value=.003;ceiling.release.value=.2;bus.connect(ceiling);ceiling.connect(destination);graph.push(ceiling);}else bus.connect(destination);
 const release=delay=>{clearTimeout(cleanupTimer);cleanupTimer=setTimeout(dispose,delay);cleanupTimer.unref?.();};
 let reverb=null;if(c.createConvolver){reverb=c.createConvolver();reverb.buffer=hallIR(c);const wet=c.createGain();wet.gain.value=.22;reverb.connect(wet);wet.connect(bus);graph.push(reverb,wet);}
 const track=(source,parts)=>{active++;source.onended=()=>{source.disconnect?.();for(const p of parts)p?.disconnect?.();if(--active===0)release(stopped?0:900);};nodes.push(source);};
 // Một lớp âm: sóng hoặc nhiễu lọc, quét tần số from→to, đường bao attack/hold/decay.
 function voice(at,len,level,from,to,{noise=false,kind='sine',attack=.04,hold=.08,filter='lowpass',q=.7,wet=true,fixed=false}={}){
  if(!noise&&!fixed){from*=pitch;to*=pitch;}
  at*=scale;len*=scale;const trim=Math.max(0,elapsed-at);if(trim>=len||(at>=QI_IMPACT_AT*scale-.01&&trim>.08)||(!noise&&len<.5&&trim>.1))return;
  const start=now+Math.max(0,at-elapsed),remaining=len-trim,source=noise?c.createBufferSource():c.createOscillator(),g=c.createGain();
  if(noise){source.buffer=noiseBuffer(c);source.loop=true;}else source.type=kind;
  const f=noise?c.createBiquadFilter():null,p=f?f.frequency:source.frequency;if(f){f.type=filter;if(f.Q)f.Q.value=q;source.connect(f);f.connect(g);}else source.connect(g);
  p.setValueAtTime(from+(to-from)*trim/len,start);p.exponentialRampToValueAtTime(Math.max(25,to),start+remaining);
  const rise=Math.min(attack,remaining*.15),sustain=Math.max(rise,remaining*Math.min(.85,hold));
  g.gain.setValueAtTime(.0001,start);g.gain.linearRampToValueAtTime(level,start+rise);g.gain.linearRampToValueAtTime(level*.85,start+sustain);g.gain.exponentialRampToValueAtTime(.0001,start+remaining);g.connect(bus);if(reverb&&wet)g.connect(reverb);
  track(source,[g,f]);source.start(start);source.stop(start+remaining+.03);
 }
 // Âm dâng lên rồi cắt gọn đúng mốc (kiểu tiếng chũm chọe đảo ngược) — dẫn tai vào cú nổ.
 function swell(at,len,level,from,to,noise){
  at*=scale;len*=scale;if(elapsed>=at+len-.05)return;const end=now+at+len-elapsed;
  const start=now+Math.max(0,at-elapsed),source=noise?c.createBufferSource():c.createOscillator(),g=c.createGain(),f=noise?c.createBiquadFilter():null;
  if(noise){source.buffer=noiseBuffer(c);source.loop=true;f.type='bandpass';if(f.Q)f.Q.value=1.4;source.connect(f);f.connect(g);}else{source.type='sine';source.connect(g);}
  const p=f?f.frequency:source.frequency,u=Math.max(0,elapsed-at)/len;p.setValueAtTime(from*(to/from)**u,start);p.exponentialRampToValueAtTime(to,end);
  g.gain.setValueAtTime(.0001+level*u*u,start);g.gain.exponentialRampToValueAtTime(Math.max(.0002,level*.35),start+(end-start)*.7);g.gain.linearRampToValueAtTime(level,end-.01);g.gain.linearRampToValueAtTime(.0001,end+.02);
  g.connect(bus);if(reverb)g.connect(reverb);track(source,[g,f]);source.start(start);source.stop(end+.05);
 }
 // Khánh/cồng: các bồi âm không hòa âm, mỗi bồi âm tắt một tốc độ.
 const bowl=(at,f0,ratios,levels,lens,wet=true)=>ratios.forEach((r,i)=>voice(at,lens[i],levels[i]*strength,f0*r,f0*r*.997,{attack:.004,hold:.02,wet}));
 const pluck=(at,f,level=.05)=>{voice(at,1.1,level,f,f*.998,{attack:.004,hold:.04});voice(at,.6,level*.25,f*2,f*1.996,{attack:.004,hold:.03});};
 // 1) Khánh mở màn.
 bowl(.12,196,[1,2.71,5.15,8.43],[.085,.045,.022,.011],[4.6,3.2,2.0,1.2]);
 // 2) Nền trầm Rê + La, và hơi thở hút linh khí dâng dần (nhiễu lọc mở dần).
 voice(.3,5.9,.06,73.4,73.4,{kind:'triangle',attack:1.6,hold:.9});
 voice(.8,5.3,.035,110,110.4,{attack:1.4,hold:.9});
 voice(.9,5.2,.06,280,2600,{noise:true,attack:2.4,hold:.92});
 // 3) Nhịp linh châu: xuất thể, phân ba, vận chu thiên, hợp nhất (ngũ cung Rê).
 pluck(1.54,587.3);
 [659.3,740,880].forEach((f,i)=>pluck(2.52+i*.09,f,.045));
 [987.8,880,1174.7,987.8].forEach((f,i)=>pluck(3.3+i*.42,f,.022));
 [880,740,587.3].forEach((f,i)=>pluck(5.04+i*.11,f,.04));
 // 4) Hút ngược vào đan điền + âm dâng, cắt đúng mốc nổ; tiếng nền chìm xuống một nhịp ngay trước khi nổ.
 swell(4.75,QI_IMPACT_AT-4.75,.16,500,7000,true);
 swell(4.95,QI_IMPACT_AT-4.95,.05,220,880,false);
 if(elapsed<5.98*scale){const t0=now+(5.98*scale-elapsed),t1=now+(QI_IMPACT_AT*scale-elapsed);bus.gain.setValueAtTime(1.45*strength,t0);bus.gain.linearRampToValueAtTime(.45*strength,t1-.012);bus.gain.linearRampToValueAtTime(1.45*strength,t1);}
 // 5) NỔ: bass hạ sâu, thân trống, tiếng nứt, cồng, lấp lánh.
 const I=QI_IMPACT_AT;
 voice(I,1.7,.40,120,34,{attack:.004,hold:.12,wet:false,fixed:true});
 voice(I,.5,.22,190,55,{kind:'triangle',attack:.003,hold:.08});
 voice(I,.7,.30,4200,220,{noise:true,attack:.003,hold:.06});
 bowl(I+.01,146.8,[1,1.48,2.05,2.76,3.6],[.085,.055,.04,.028,.018],[3.4,2.9,2.4,2.0,1.6]);
 [1568,2093,2637,3136].forEach((f,i)=>voice(I+.05+i*.03,2.4-i*.25,.018,f,f*1.003,{attack:.06,hold:.25}));
 voice(I+.04,1.6,.06,9000,2500,{noise:true,filter:'highpass',attack:.02,hold:.15});
 // 6) Dư âm: hợp âm Rê trưởng đọng lại + chuỗi nốt đi lên.
 [146.8,185,220,293.7].forEach((f,i)=>voice(I+.15,2.6,.028-i*.003,f,f*1.001,{attack:.45,hold:.55}));
 [587.3,740,880,1174.7,1318.5].forEach((f,i)=>pluck(I+.4+i*.2,f,.04-i*.004));
 if(!active)dispose();
 return {stop(){if(stopped)return;stopped=true;const t=c.currentTime;bus.gain.cancelScheduledValues(t);bus.gain.setTargetAtTime(.0001,t,.012);for(const source of nodes)try{source.stop(t+.05);}catch{}release(80);},endAt:now+Math.max(0,duration-elapsed)+1.2};
}
