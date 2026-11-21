// 21/11/2026 tối (chủ game: "thêm hiệu ứng âm thanh lúc nổ thần khí GIỚI HẠN") — nhạc riêng màn GIỚI HẠN 11 s, tự tổng hợp WebAudio,
// bám đúng mốc LIM trong bao-kho.js: 3 cú GIẬT điềm báo (trống trầm + nứt) → sao băng vút + 3 tiếng CỒNG mở trận →
// gió dâng + tim đập thình thịch nhanh dần → lặng 0,15 s → 5 cú BÙNG (trầm + nổ + méo), cú cuối kèm sấm vang dài →
// hợp âm sáng + chuông lăng kính đi lên + lấp lánh → vút bay về sân. Cao độ/thời điểm lấp lánh theo mã lượt → không lần nào y hệt.
import {LIM} from './bao-limited-timing.js';
import {warmWave} from './warm-wave.js';

const buffers=new WeakMap();
function noise(c){if(buffers.has(c))return buffers.get(c);const b=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=b.getChannelData(0);let s=90127;for(let i=0;i<d.length;i++){s=(Math.imul(s,1664525)+1013904223)|0;d[i]=s/2147483648;}buffers.set(c,b);return b;}
function rng(seed){let a=(Number(seed)>>>0)||1;return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function shaper(c,amount=14){const n=1024,curve=new Float32Array(n);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;curve[i]=(1+amount)*x/(1+amount*Math.abs(x));}const w=c.createWaveShaper();w.curve=curve;w.oversample='2x';return w;}

/** Kịch bản (thuần, test được): danh sách nốt {at,len,level,from,to,kind,pan}. */
export function limitedScore(seed=1){
 const r=rng(seed),sc=[],add=(at,len,level,from,to=from,kind='sine',pan=0)=>sc.push({at,len,level,from,to,kind,pan});
 const kick=(at,f=1,len=.6)=>{add(at,len,.42*f,130,32,'sine');add(at,.12,.16*f,2600,300,'crack');};
 const gong=(at,hz,f=1)=>{[[1,1],[2.76,.4],[5.4,.18],[8.9,.07]].forEach(([k,g],i)=>add(at,3.2-i*.5,.11*f*g,hz*k,hz*k*.985,'sine',(i%2?.2:-.2)));add(at,.5,.12*f,hz*.5,hz*.48,'sine');add(at,.08,.08*f,3200,900,'crack');};
 const bell=(at,hz,f=1,pan=0)=>{[[1,1],[2.71,.3],[4.1,.14]].forEach(([k,g])=>add(at,1.8,.06*f*g,hz*k,hz*k,'sine',pan));};
 // nền: rền trầm suốt phần tụ
 add(0,6.2,.07,48,44,'sine');add(0,5,.05,180,900,'wind');
 // 1. điềm báo: 3 cú giật
 LIM.omen.forEach((at,i)=>{kick(at,1.1+i*.15,.7);add(at,.35,.1,1800,200,'crack',(i-1)*.4);});
 // 2. sao băng vút + 3 cồng mở trận
 for(let i=0;i<8;i++){const at=1.1+i*.2+r()*.1;add(at,.4,.07,600+r()*900,3600+r()*1400,'wind',(r()-.5)*1.4);}
 LIM.tiers.forEach((at,i)=>gong(at,[98,87.3,73.4][i]*(1+(r()-.5)*.04),1+i*.25));
 for(let i=0;i<4;i++){const at=1.35+i*.42+r()*.08;add(at,.22,.09,5200,900,'crack',(r()-.5));}
 // 3. bóng đen: gió dâng + răng cưa trượt lên + tim đập
 add(LIM.shadow,LIM.booms[0]-LIM.shadow-.1,.16,160,4800,'rise');add(LIM.shadow,LIM.booms[0]-LIM.shadow-.1,.045,55,220,'brass');
 LIM.hearts.forEach((at,i)=>{add(at,.32,.5+i*.08,62,38,'sine');add(at+.17-i*.02,.26,.32+i*.06,56,36,'sine');});
 // 4. BÙNG ×5 — dồn, cú cuối lớn nhất + sấm dài
 LIM.booms.forEach((at,i)=>{const f=1.05+i*.2+(i===4?.5:0);kick(at,f,i===4?1.6:.75);add(at,i===4?2.8:.9,.16*f,i===4?2400:1600,90,'thunder',(i%2?.3:-.3)*(i<4?1:0));add(at,.18,.1*f,4200,600,'crack');});
 add(LIM.booms[4],3.4,.14,40,24,'sine');
 // 5. hiện thân: hợp âm Rê trưởng sáng + chuông lăng kính đi lên + lấp lánh
 const R=LIM.reveal+.05,base=293.7*(1+(r()-.5)*.03);[1,1.26,1.5,2].forEach((k,i)=>add(R,3.8,.03/(1+i*.3),base*k,base*k,'choir',(i%2?.25:-.25)));add(R,3.4,.022,base/2,base/2,'brass');
 [1,1.125,1.26,1.5,1.68,2,2.25,2.52].forEach((k,i)=>bell(R+.12+i*.12,base*2*k,.9,(i/7-.5)*.9));
 for(let i=0;i<26;i++)add(R+.3+r()*3.2,.12,.03+r()*.02,3000+r()*3500,2500+r()*3000,'sine',(r()-.5)*1.6);
 // nhịp vỗ nhẹ theo vòng sáng 1,1 s
 for(let k=1;k<3;k++)kick(R+k*1.1,.35,.35);
 // 6. bay về sân
 add(LIM.fly,.8,.09,500,5200,'wind');bell(LIM.fly+.75,1174.7,.7);
 return sc.sort((a,b)=>a.at-b.at);
}

/** Phát kịch bản từ giây `elapsed` (vào giữa chừng thì bỏ nốt đã qua). Trả hàm dừng. */
export function scheduleBaoLimitedAudio(c,destination,seed=1,elapsed=0,strength=1){
 if(!c||!destination)return ()=>{};
 const now=c.currentTime+.03,sources=[],nodes=[],bus=c.createGain();bus.gain.value=.95*strength;
 const comp=c.createDynamicsCompressor?.();if(comp){comp.threshold.value=-14;comp.ratio.value=4;comp.attack.value=.004;comp.release.value=.25;bus.connect(comp);comp.connect(destination);nodes.push(comp);}else bus.connect(destination);nodes.push(bus);
 const boomShape=shaper(c,10),boomBus=c.createGain();boomBus.gain.value=.8;boomShape.connect(boomBus);boomBus.connect(bus);nodes.push(boomShape,boomBus);
 // lặng ngắn ngay trước cú bùng đầu
 const q0=now+LIM.booms[0]-.16-elapsed;if(q0>now){bus.gain.setValueAtTime(.95*strength,q0);bus.gain.linearRampToValueAtTime(.12*strength,q0+.1);bus.gain.setValueAtTime(.95*strength,q0+.16);}
 for(const cue of limitedScore(seed)){
  const trim=Math.max(0,elapsed-cue.at),remain=cue.len-trim;if(remain<=.02||trim>.08&&cue.len<.5)continue;
  const start=now+Math.max(0,cue.at-elapsed),noisy=['wind','thunder','crack','rise'].includes(cue.kind),src=noisy?c.createBufferSource():c.createOscillator(),g=c.createGain();let param;
  if(noisy){src.buffer=noise(c);src.loop=true;const f=c.createBiquadFilter();f.type=cue.kind==='thunder'?'lowpass':'bandpass';f.Q.value=cue.kind==='crack'?.8:cue.kind==='rise'?1.2:.7;src.connect(f);f.connect(g);nodes.push(f);param=f.frequency;}
  else{if(cue.kind==='choir'&&c.createPeriodicWave)src.setPeriodicWave(warmWave(c));else src.type=cue.kind==='brass'?'sawtooth':cue.kind;
   if(cue.kind==='brass'||cue.kind==='choir'){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=cue.kind==='brass'?900:1400;src.connect(f);f.connect(g);nodes.push(f);}else src.connect(g);param=src.frequency;}
  const from=cue.from+(cue.to-cue.from)*trim/cue.len;param.setValueAtTime(Math.max(20,from),start);param.exponentialRampToValueAtTime(Math.max(20,cue.to),start+remain);
  const attack=cue.kind==='rise'?remain*.85:cue.kind==='choir'?.5:cue.kind==='brass'?.3:cue.kind==='wind'?.12:.004;
  g.gain.setValueAtTime(.0001,start);g.gain.linearRampToValueAtTime(cue.level,start+Math.min(attack,remain*.8));g.gain.exponentialRampToValueAtTime(.0001,start+remain);
  const out=(cue.kind==='sine'&&cue.from<160)||cue.kind==='thunder'?boomShape:bus;
  if(cue.pan&&c.createStereoPanner){const pn=c.createStereoPanner();pn.pan.value=Math.max(-1,Math.min(1,cue.pan));g.connect(pn);pn.connect(out);nodes.push(pn);}else g.connect(out);
  src.start(start);src.stop(start+remain+.03);sources.push(src);nodes.push(src,g);
 }
 const cleanup=()=>nodes.forEach(n=>{try{n.disconnect();}catch{}}),timer=setTimeout(cleanup,Math.max(0,(LIM.end-elapsed+3.5)*1000));timer.unref?.();
 return ()=>{clearTimeout(timer);for(const s of sources){try{s.stop();}catch{}}cleanup();};
}
