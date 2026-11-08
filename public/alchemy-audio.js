// Âm thanh Khai Lò Cửu Chuyển (08/11/2026) — tự tổng hợp: sôi lục bục, còi báo sắp nổ, dội nước, thả dược, tiên hỏa, nổ lò, lôi kiếp, đan thành.
const banks=new WeakMap();
function noise(c){if(banks.has(c))return banks.get(c);const b=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=b.getChannelData(0);let s=4271;for(let i=0;i<d.length;i++){s=(Math.imul(s,1664525)+1013904223)|0;d[i]=s/2147483648;}banks.set(c,b);return b;}
function tone(c,out,at,len,f0,f1,vol,type='sine',pan=0){const o=c.createOscillator(),g=c.createGain(),p=c.createStereoPanner?c.createStereoPanner():null;o.type=type;o.frequency.setValueAtTime(f0,at);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),at+len);g.gain.setValueAtTime(.0001,at);g.gain.linearRampToValueAtTime(vol,at+Math.min(.02,len*.2));g.gain.exponentialRampToValueAtTime(.0001,at+len);o.connect(g);if(p){p.pan.value=pan;g.connect(p);p.connect(out);}else g.connect(out);o.start(at);o.stop(at+len+.05);}
function hiss(c,out,at,len,f0,f1,vol,type='bandpass',q=.8){const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=noise(c);s.loop=true;f.type=type;f.Q.value=q;f.frequency.setValueAtTime(f0,at);f.frequency.exponentialRampToValueAtTime(Math.max(40,f1),at+len);g.gain.setValueAtTime(.0001,at);g.gain.linearRampToValueAtTime(vol,at+Math.min(.03,len*.2));g.gain.exponentialRampToValueAtTime(.0001,at+len);s.connect(f);f.connect(g);g.connect(out);s.start(at,Math.random());s.stop(at+len+.05);}
// kind: bubble | alarm | rose | herb | fire | explode | strike | shield | round | quiz | done | crack | start | rat
export function playAlchemySound(c,out,kind,strength=1){
 const t=c.currentTime+.01,k=Math.max(.4,Math.min(2,strength));
 if(kind==='bubble'){for(let i=0;i<3;i++){const at=t+i*.09+Math.random()*.05,f=180+Math.random()*260;tone(c,out,at,.09,f,f*2.2,.05*k,'sine',(Math.random()-.5)*.8);}}
 else if(kind==='alarm'){tone(c,out,t,.16,1320,1320,.07,'square');tone(c,out,t+.2,.16,990,990,.07,'square');}
 else if(kind==='rose'){hiss(c,out,t,.5,6000,900,.2*k,'highpass',.5);hiss(c,out,t+.12,1.2,2400,300,.16*k,'bandpass',.4);tone(c,out,t,.4,1200,300,.04,'sine');}
 else if(kind==='herb'){[784,988,1175,1568].forEach((f,i)=>tone(c,out,t+i*.07,.9,f,f,.05*k,'triangle',-.4+i*.25));hiss(c,out,t+.25,.6,900,300,.07,'bandpass',.6);}
 else if(kind==='fire'){hiss(c,out,t,1.8,300,2200,.22*k,'lowpass',.7);tone(c,out,t,1.6,55,90,.3*k,'sawtooth');[220,330,440].forEach((f,i)=>tone(c,out,t+.4+i*.1,1.6,f,f,.05,'sawtooth',(i-1)*.4));}
 else if(kind==='explode'){tone(c,out,t,2.2,90,22,.7,'sine');hiss(c,out,t,2.4,1800,60,.5,'lowpass',.5);hiss(c,out,t,.25,7000,2000,.3,'highpass',.4);for(let i=0;i<8;i++)tone(c,out,t+.3+i*.12,.2,400+Math.random()*900,200,.04,'square',(Math.random()-.5));}
 else if(kind==='strike'){hiss(c,out,t,.2,8000,2500,.3,'highpass',.4);tone(c,out,t,1.2,70,28,.45,'sine');hiss(c,out,t+.1,1.4,700,80,.22,'lowpass',.5);}
 else if(kind==='shield'){[523,659,784].forEach((f,i)=>tone(c,out,t+i*.05,.7,f,f*1.01,.05,'sine'));}
 else if(kind==='round'){tone(c,out,t,2.6,110,104,.22,'sine');tone(c,out,t,2.6,277,270,.06,'sine');tone(c,out,t,1.8,415,410,.03,'triangle');}
 else if(kind==='quiz'){tone(c,out,t,.25,660,660,.06,'triangle');tone(c,out,t+.14,.35,880,880,.06,'triangle');}
 else if(kind==='crack'){hiss(c,out,t,.35,3000,500,.2,'bandpass',1.5);tone(c,out,t,.6,160,60,.15,'sawtooth');}
 else if(kind==='start'){tone(c,out,t,.6,98,40,.4);hiss(c,out,t,.9,200,1600,.14,'lowpass',.7);[196,247,294].forEach((f,i)=>tone(c,out,t+.5+i*.12,1.6,f,f,.06,'sawtooth',(i-1)*.4));}
 else if(kind==='rat'){for(let i=0;i<4;i++)tone(c,out,t+i*.08,.06,2600+i*300,3400,.04,'square',.5);}
 else if(kind==='done'){[261.6,329.6,392,523.2].forEach((f,i)=>{tone(c,out,t+i*.11,2.4,f,f,.07,'sawtooth',(i-1.5)*.3);tone(c,out,t+i*.11,2.4,f*2,f*2,.035,'triangle');});tone(c,out,t,1.4,90,30,.4);[1568,2093,2637].forEach((f,i)=>tone(c,out,t+.6+i*.09,1.6,f,f,.03,'sine'));}
}
