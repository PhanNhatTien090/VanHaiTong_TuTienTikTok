// v5 (05/11/2026) nhạc điện ảnh theo hình Bát Quái Dẫn Khí. v4 (4/11/2026) Luyện Khí — âm thanh tự tổng hợp (không dùng mẫu của bên thứ ba), dựng theo lớp:
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
 if(c.createDynamicsCompressor){const ceiling=c.createDynamicsCompressor();ceiling.threshold.value=-8;ceiling.knee.value=6;ceiling.ratio.value=1;ceiling.attack.value=.003;ceiling.release.value=.2;bus.connect(ceiling);ceiling.connect(destination);graph.push(ceiling);}else bus.connect(destination);
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
 // v5 (05/11/2026) — nhạc nền điện ảnh khớp hình "Bát Quái Dẫn Khí" (mốc giây trên khung 8,8 s, nổ 6,16 s).
 // Lớp dùng thêm: trống lớn (taiko tổng hợp), nhịp tim, dàn dây (sawtooth lệch nhẹ qua lọc thấp), gió xoáy, chuông quẻ.
 const drum=(at,level=.3,f0=140,f1=42,len=.9)=>{voice(at,len,level,f0,f1,{attack:.003,hold:.05,wet:true,fixed:true});voice(at,.18,level*.55,2600,300,{noise:true,attack:.002,hold:.04});};
 const strings=(at,len,notes,level,attack=.9)=>notes.forEach((f,i)=>{for(const d of [.997,1.004])voice(at,len,level/(i+1.4),f*d,f*d,{kind:'sawtooth',attack,hold:.75,wet:true});});
 const lowpassBed=(at,len,level,from,to)=>voice(at,len,level,from,to,{noise:true,attack:len*.35,hold:.7,filter:'lowpass',q:.5});
 const D=146.8,PENTA=[293.7,329.6,370,440,493.9,587.3,659.3,740];
 // 0–1,2 s KHAI TRẬN: cồng trầm mở màn + nét bút quét (nhiễu băng hẹp quét lên) + tám quẻ sáng từng tiếng chuông.
 bowl(.04,98,[1,2.4,3.9,6.2],[.11,.05,.025,.012],[5.2,3.6,2.4,1.4]);
 drum(.04,.32,120,38,1.4);
 voice(.10,1.15,.045,300,3200,{noise:true,filter:'bandpass',q:2.2,attack:.25,hold:.5});
 PENTA.forEach((f,i)=>pluck(.26+i*.106,f,.034));
 // Nền: hai nốt trầm Rê–La + dàn dây Rê thứ âm thầm suốt phần tích tụ.
 voice(.2,6.0,.055,73.4,73.4,{kind:'triangle',attack:1.2,hold:.92});
 strings(.6,5.6,[D,174.6,220],.016,1.8);
 // 0,7–2,1 s PHỄU MÂY: gió xoáy (hai lớp nhiễu lọc quét lên–xuống lệch pha) — cảm giác xoáy trên đầu.
 voice(.7,2.6,.032,400,1400,{noise:true,filter:'bandpass',q:3,attack:.6,hold:.6});
 voice(1.1,2.4,.026,1600,600,{noise:true,filter:'bandpass',q:3,attack:.6,hold:.6});
 lowpassBed(.9,5.0,.05,220,900);
 // 1,1–5,8 s DÒNG KHÍ RÓT: lớp "không khí" cao lấp lánh + chuông nhỏ rơi xuống theo dòng khí.
 voice(1.1,4.8,.02,7000,7000,{noise:true,filter:'bandpass',q:.8,attack:1.2,hold:.85});
 [1174.7,987.8,880,1318.5,1174.7].forEach((f,i)=>pluck(1.6+i*.55,f,.018));
 // 3,0–4,9 s KHAI KINH MẠCH: nhịp tim trống trầm nhanh dần + tiếng gảy (đàn cổ) theo từng nhánh kinh mạch.
 [3.0,3.62,4.15,4.6,4.98,5.3,5.56,5.78,5.96].forEach((t,i)=>{drum(t,.12+i*.012,95,40,.5);if(i%2===0)drum(t+.16,.07,90,40,.35);});
 [D*2,220*2,D*2*1.5,293.7*2,370*2].forEach((f,i)=>{voice(3.05+i*.33,1.3,.04,f,f*.985,{kind:'triangle',attack:.003,hold:.05});voice(3.05+i*.33,.5,.012,f*3,f*2.97,{attack:.003,hold:.03});});
 // 3,5–6,0 s TIỂU CHU THIÊN: chuông vàng nhỏ theo điểm sáng chạy vòng, lên cao dần.
 [1318.5,1480,1760,1975.5,2349.3,2637].forEach((f,i)=>voice(3.6+i*.4,.9,.014,f,f*1.002,{attack:.005,hold:.04}));
 strings(4.2,1.96,[220,293.7,349.2],.02,.8);
 // 5,3–6,16 s NGƯNG KHÍ: âm dâng (nhiễu + sine) cắt đúng mốc nổ, tiếng hút ngược, nền chìm một nhịp trước nổ.
 swell(4.9,QI_IMPACT_AT-4.9,.17,500,7500,true);
 swell(5.1,QI_IMPACT_AT-5.1,.06,110,880,false);
 swell(5.6,QI_IMPACT_AT-5.6,.05,1800,180,true);
 if(elapsed<5.98*scale){const t0=now+(5.98*scale-elapsed),t1=now+(QI_IMPACT_AT*scale-elapsed);bus.gain.setValueAtTime(1.45*strength,t0);bus.gain.linearRampToValueAtTime(.38*strength,t1-.012);bus.gain.linearRampToValueAtTime(1.45*strength,t1);}
 // 6,16 s PHÁ: bass hạ sâu + trống lớn hai lớp + tiếng nứt + cồng lớn + chũm chọe; dư chấn trống 0,22 s sau (sóng mực).
 const I=QI_IMPACT_AT;
 voice(I,2.0,.34,110,30,{attack:.004,hold:.12,wet:false,fixed:true});
 drum(I,.34,160,36,1.6);drum(I+.22,.2,130,40,1.0);drum(I+.48,.1,120,42,.8);
 voice(I,.8,.24,4600,200,{noise:true,attack:.003,hold:.06});
 bowl(I+.01,D,[1,1.48,2.05,2.76,3.6,4.9],[.09,.06,.042,.03,.02,.012],[4.2,3.4,2.8,2.2,1.8,1.3]);
 voice(I+.03,2.2,.07,9000,2600,{noise:true,filter:'highpass',attack:.015,hold:.2});
 // Tám quẻ văng ra: chuỗi chuông đi xuống nhanh.
 PENTA.slice().reverse().forEach((f,i)=>pluck(I+.08+i*.045,f*2,.02));
 // 6,3–8,8 s HIỆN THÂN: dàn dây Rê trưởng add9 nở ra, đàn cổ rải hợp âm, kèn trầm (triangle) giữ nền — dư âm điện ảnh.
 strings(I+.12,2.9,[D,185,220,329.6],.03,.35);
 voice(I+.1,2.8,.05,73.4,73.4,{kind:'triangle',attack:.3,hold:.7});
 [587.3,740,880,1174.7,1318.5,1760].forEach((f,i)=>pluck(I+.45+i*.17,f,.04-i*.004));
 [1568,2093,2637,3136].forEach((f,i)=>voice(I+.3+i*.06,2.4-i*.25,.016,f,f*1.003,{attack:.08,hold:.3}));
 if(!active)dispose();
 return {stop(){if(stopped)return;stopped=true;const t=c.currentTime;bus.gain.cancelScheduledValues(t);bus.gain.setTargetAtTime(.0001,t,.012);for(const source of nodes)try{source.stop(t+.05);}catch{}release(80);},endAt:now+Math.max(0,duration-elapsed)+1.2};
}
