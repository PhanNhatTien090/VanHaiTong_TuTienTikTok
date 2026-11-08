// Âm thanh Chính Ma Đại Chiến (tự tổng hợp, phát một lần theo sự kiện). Chính Đạo: chuông/kèn sáng; Ma Đạo: trầm, nghịch tai.
const banks=new WeakMap();
function noise(c){if(banks.has(c))return banks.get(c);const b=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=b.getChannelData(0);let s=9137;for(let i=0;i<d.length;i++){s=(Math.imul(s,1664525)+1013904223)|0;d[i]=s/2147483648;}banks.set(c,b);return b;}
function tone(c,out,at,len,f0,f1,vol,type='sine',pan=0){const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f0,at);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),at+len);g.gain.setValueAtTime(.0001,at);g.gain.linearRampToValueAtTime(vol,at+Math.min(.02,len*.2));g.gain.exponentialRampToValueAtTime(.0001,at+len);let n=g;if(pan&&c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=pan;g.connect(p);n=p;}o.connect(g);n.connect(out);o.start(at);o.stop(at+len+.05);}
function hiss(c,out,at,len,f0,f1,vol,pan=0,q=.8){const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=noise(c);s.loop=true;f.type='bandpass';f.Q.value=q;f.frequency.setValueAtTime(f0,at);f.frequency.exponentialRampToValueAtTime(Math.max(40,f1),at+len);g.gain.setValueAtTime(.0001,at);g.gain.linearRampToValueAtTime(vol,at+Math.min(.015,len*.2));g.gain.exponentialRampToValueAtTime(.0001,at+len);let n=g;if(pan&&c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=pan;g.connect(p);n=p;}s.connect(f);f.connect(g);n.connect(out);s.start(at);s.stop(at+len+.05);}
const PAN={chinh:-.55,ma:.55};
// kind: drum | clash | strike | gift | rescue | omen | start | win | lose
export function playWarSound(c,out,kind,side='chinh',strength=1){
 const t=c.currentTime+.01,p=PAN[side]||0,k=Math.max(.4,Math.min(2,strength));
 if(kind==='drum'){tone(c,out,t,.45,110,38,.32,'sine',p*.3);hiss(c,out,t,.08,1800,300,.08,p*.3);tone(c,out,t+.22,.35,95,36,.22,'sine',-p*.3);}
 else if(kind==='clash'){hiss(c,out,t,.12,5200,1400,.09,0,1.2);tone(c,out,t,.25,1760*(.9+Math.random()*.2),1500,.04,'triangle');tone(c,out,t,.3,70,40,.12);}
 else if(kind==='strike'){hiss(c,out,t,.22,600,3200,.14,p);tone(c,out,t+.18,.3,side==='chinh'?1318:220,side==='chinh'?1200:110,.07,side==='chinh'?'triangle':'sawtooth',p);hiss(c,out,t+.18,.1,4000,900,.1,p);}
 else if(kind==='gift'){
  if(side==='chinh'){for(let i=0;i<10;i++){const at=t+i*.06;hiss(c,out,at,.18,900,3800,.08*k,-.6+i*.12);tone(c,out,at+.12,.5,880*2**(i%5/12),860,.05*k,'triangle',-.4+i*.08);}tone(c,out,t,1.4,220,220,.12*k,'sawtooth');tone(c,out,t,1.4,330,330,.08*k,'sawtooth');tone(c,out,t+.6,.9,80,30,.35*k);}
  else{hiss(c,out,t,.9,180,1400,.16*k,p,.6);tone(c,out,t,1.2,73,36,.38*k,'sine',p);tone(c,out,t,1.1,110,103,.1*k,'sawtooth',p);tone(c,out,t,1.1,116,109,.1*k,'sawtooth',p);hiss(c,out,t+.55,.6,1200,120,.2*k,p,.5);tone(c,out,t+.55,.8,60,25,.4*k,'sine',p);}}
 else if(kind==='rescue'){if(side==='chinh'){[440,554,659,880].forEach((f,i)=>tone(c,out,t+i*.08,1.6,f,f,.07,'sawtooth',-.3));[880,1318,1760].forEach((f,i)=>tone(c,out,t+.3+i*.1,1.8,f,f*.998,.05,'sine'));}else{[110,116,155,164].forEach((f,i)=>tone(c,out,t+i*.06,1.8,f,f*.97,.09,'sawtooth',.3));hiss(c,out,t,1.6,200,2400,.14,.3,.5);}tone(c,out,t,1.5,65,28,.4);}
 else if(kind==='omen'){hiss(c,out,t,.15,5000,600,.14);hiss(c,out,t+.1,1.6,400,60,.14,0,.5);tone(c,out,t,1.6,60,30,.3);}
 else if(kind==='start'){[0,.35,.7].forEach(d=>{tone(c,out,t+d,.5,110,38,.4);hiss(c,out,t+d,.09,1800,300,.1);});[220,277,330].forEach((f,i)=>tone(c,out,t+1.05,1.6,f,f,.07,'sawtooth',(i-1)*.4));}
 else if(kind==='win'){const base=side==='ma'?[146.8,174.6,220]:[261.6,329.6,392];base.forEach((f,i)=>{tone(c,out,t+i*.12,2.2,f,f,.07,'sawtooth',(i-1)*.3);tone(c,out,t+i*.12,2.2,f*2,f*2,.04,'triangle');});tone(c,out,t,1.4,90,30,.4);[0,.25,.5].forEach(d=>hiss(c,out,t+d,.08,1800,300,.1));}
}
