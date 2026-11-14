// 4/11/2026: lớp âm cú nổ dùng chung cho các cảnh giới đã có âm thanh riêng (Kim Đan, Nguyên Anh, Hóa Thần…).
// Chồng lên cue gốc, không thay nó: âm dâng cắt đúng mốc nổ → bass hạ sâu + cồng + lấp lánh + gió cao → hợp âm đọng.
// Tự tổng hợp, không dùng mẫu bên thứ ba. pitch đổi theo mã sự kiện (qiVariant) để không lần nào giống hệt.
const noiseCache=new WeakMap();
function noise(c){if(noiseCache.has(c))return noiseCache.get(c);const b=c.createBuffer(1,c.sampleRate*3,c.sampleRate),d=b.getChannelData(0);let seed=5119,low=0;for(let i=0;i<d.length;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;low=.7*low+.3*(seed/2147483648);d[i]=low*1.8;}noiseCache.set(c,b);return b;}
// root: tần số gốc của cồng/hợp âm (mỗi cảnh giới một màu âm). at/duration tính bằng giây trên khung gốc của cue.
export function scheduleImpactLayers(c,destination,{elapsed=0,at,duration,scale=1,pitch=1,root=130.8,level=1}={}){
 const now=c.currentTime,nodes=[],graph=[];let active=0,stopped=false,timer;
 const none={stop(){},endAt:now};
 if(!Number.isFinite(at)||elapsed>(at+.3)*scale)return none;
 const bus=c.createGain();bus.gain.value=level;graph.push(bus);
 bus.connect(destination);
 const dispose=()=>graph.forEach(n=>n.disconnect?.());const release=ms=>{clearTimeout(timer);timer=setTimeout(dispose,ms);timer.unref?.();};
 const track=(o,parts)=>{active++;o.onended=()=>{parts.forEach(n=>n?.disconnect?.());if(--active===0)release(stopped?0:900);};nodes.push(o);};
 function voice(t0,len,lv,from,to,{isNoise=false,kind='sine',attack=.01,hold=.1,filter='lowpass',fixed=false}={}){
  t0*=scale;len*=scale;const trim=Math.max(0,elapsed-t0);if(trim>.08)return;
  if(!isNoise&&!fixed){from*=pitch;to*=pitch;}
  const start=now+Math.max(0,t0-elapsed),o=isNoise?c.createBufferSource():c.createOscillator(),g=c.createGain(),f=isNoise?c.createBiquadFilter():null;
  if(isNoise){o.buffer=noise(c);o.loop=true;f.type=filter;o.connect(f);f.connect(g);}else{o.type=kind;o.connect(g);}
  const p=f?f.frequency:o.frequency;p.setValueAtTime(from,start);p.exponentialRampToValueAtTime(Math.max(25,to),start+len);
  const rise=Math.min(attack,len*.15);g.gain.setValueAtTime(.0001,start);g.gain.linearRampToValueAtTime(lv,start+rise);g.gain.linearRampToValueAtTime(lv*.85,start+Math.max(rise,len*hold));g.gain.exponentialRampToValueAtTime(.0001,start+len);
  g.connect(bus);track(o,[o,g,f]);o.start(start);o.stop(start+len+.03);
 }
 function swell(t0,len,lv,from,to,isNoise){
  t0*=scale;len*=scale;if(elapsed>=t0+len-.05)return;const end=now+t0+len-elapsed,start=now+Math.max(0,t0-elapsed),o=isNoise?c.createBufferSource():c.createOscillator(),g=c.createGain(),f=isNoise?c.createBiquadFilter():null;
  if(isNoise){o.buffer=noise(c);o.loop=true;f.type='bandpass';if(f.Q)f.Q.value=1.3;o.connect(f);f.connect(g);}else{o.type='sine';o.connect(g);from*=pitch;to*=pitch;}
  const p=f?f.frequency:o.frequency,u=Math.max(0,elapsed-t0)/len;p.setValueAtTime(from*(to/from)**u,start);p.exponentialRampToValueAtTime(to,end);
  g.gain.setValueAtTime(.0001+lv*u*u,start);g.gain.exponentialRampToValueAtTime(Math.max(.0002,lv*.35),start+(end-start)*.7);g.gain.linearRampToValueAtTime(lv,end-.01);g.gain.linearRampToValueAtTime(.0001,end+.02);
  g.connect(bus);track(o,[o,g,f]);o.start(start);o.stop(end+.05);
 }
 swell(at-1.35,1.35,.12,500,6500,true);
 swell(at-1.1,1.1,.04,root*1.89,root*7.55,false);
 voice(at,.52,.24,112,42,{attack:.004,hold:.12,fixed:true});
 [1,1.48,2.05,2.76].forEach((r,i)=>voice(at+.012,3.2-i*.4,[.06,.042,.03,.02][i],root*r,root*r*.997,{attack:.004,hold:.02}));
 [12,16,20.17,24].forEach((r,i)=>voice(at+.06+i*.03,2.3-i*.25,.014,root*r,root*r*1.003,{attack:.06,hold:.25}));
 voice(at+.04,.62,.043,5400,2100,{isNoise:true,filter:'highpass',attack:.02,hold:.15});
 [1.122,1.414,1.682,2.245].forEach((r,i)=>voice(at+.2,2.2,.022-i*.003,root*r,root*r*1.001,{attack:.4,hold:.55}));
 if(!active){dispose();return none;}
 return {stop(){if(stopped)return;stopped=true;const t=c.currentTime;bus.gain.cancelScheduledValues(t);bus.gain.setTargetAtTime(.0001,t,.012);for(const o of nodes)try{o.stop(t+.05);}catch{}release(80);},endAt:now+Math.max(0,duration*scale-elapsed)+1};
}
