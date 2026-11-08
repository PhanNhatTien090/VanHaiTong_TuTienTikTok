// Âm thanh Chính Ma Đại Chiến (tự tổng hợp, phát một lần theo sự kiện). Chính Đạo: chuông/kèn sáng; Ma Đạo: trầm, nghịch tai.
const banks=new WeakMap();
function noise(c){if(banks.has(c))return banks.get(c);const b=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=b.getChannelData(0);let s=9137;for(let i=0;i<d.length;i++){s=(Math.imul(s,1664525)+1013904223)|0;d[i]=s/2147483648;}banks.set(c,b);return b;}
function tone(c,out,at,len,f0,f1,vol,type='sine',pan=0){const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f0,at);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),at+len);g.gain.setValueAtTime(.0001,at);g.gain.linearRampToValueAtTime(vol,at+Math.min(.02,len*.2));g.gain.exponentialRampToValueAtTime(.0001,at+len);let n=g;if(pan&&c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=pan;g.connect(p);n=p;}o.connect(g);n.connect(out);o.start(at);o.stop(at+len+.05);}
function hiss(c,out,at,len,f0,f1,vol,pan=0,q=.8){const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=noise(c);s.loop=true;f.type='bandpass';f.Q.value=q;f.frequency.setValueAtTime(f0,at);f.frequency.exponentialRampToValueAtTime(Math.max(40,f1),at+len);g.gain.setValueAtTime(.0001,at);g.gain.linearRampToValueAtTime(vol,at+Math.min(.015,len*.2));g.gain.exponentialRampToValueAtTime(.0001,at+len);let n=g;if(pan&&c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=pan;g.connect(p);n=p;}s.connect(f);f.connect(g);n.connect(out);s.start(at);s.stop(at+len+.05);}
const PAN={chinh:-.55,ma:.55};
// kind: drum | clash | strike | gift | rescue | omen | start | win | lose | flip | turn | tick | final | push (08/11)
export function playWarSound(c,out,kind,side='chinh',strength=1){
 const t=c.currentTime+.01,p=PAN[side]||0,k=Math.max(.4,Math.min(2,strength));
 if(kind==='drum'){tone(c,out,t,.45,110,38,.32,'sine',p*.3);hiss(c,out,t,.08,1800,300,.08,p*.3);tone(c,out,t+.22,.35,95,36,.22,'sine',-p*.3);}
 else if(kind==='clash'){hiss(c,out,t,.12,5200,1400,.09,0,1.2);tone(c,out,t,.25,1760*(.9+Math.random()*.2),1500,.04,'triangle');tone(c,out,t,.3,70,40,.12);}
 else if(kind==='strike'){hiss(c,out,t,.22,600,3200,.14,p);tone(c,out,t+.18,.3,side==='chinh'?1318:220,side==='chinh'?1200:110,.07,side==='chinh'?'triangle':'sawtooth',p);hiss(c,out,t+.18,.1,4000,900,.1,p);}
 else if(kind==='gift'){
  if(side==='chinh'){for(let i=0;i<10;i++){const at=t+i*.06;hiss(c,out,at,.18,900,3800,.08*k,-.6+i*.12);tone(c,out,at+.12,.5,880*2**(i%5/12),860,.05*k,'triangle',-.4+i*.08);}tone(c,out,t,1.4,220,220,.12*k,'sawtooth');tone(c,out,t,1.4,330,330,.08*k,'sawtooth');tone(c,out,t+.6,.9,80,30,.35*k);}
  else{hiss(c,out,t,.9,180,1400,.16*k,p,.6);tone(c,out,t,1.2,73,36,.38*k,'sine',p);tone(c,out,t,1.1,110,103,.1*k,'sawtooth',p);tone(c,out,t,1.1,116,109,.1*k,'sawtooth',p);hiss(c,out,t+.55,.6,1200,120,.2*k,p,.5);tone(c,out,t+.55,.8,60,25,.4*k,'sine',p);}}
 if(kind==='gift'&&k>1.1){tone(c,out,t+.45,1.2,75,26,.5*Math.min(1.4,k-.3),'sine');hiss(c,out,t+.45,.5,2600,160,.22,0,.6);if(k>1.5){hiss(c,out,t,.45,250,5000,.14,0,.7);[0,.18].forEach(d=>tone(c,out,t+.9+d,1.4,55,22,.45,'sine'));[523.3,659.3,784].forEach((fr,i)=>tone(c,out,t+.95+i*.04,1.6,fr*(side==='ma'?.5:1),fr*(side==='ma'?.5:1),.05,'sawtooth',(i-1)*.4));}}
 else if(kind==='rescue'){if(side==='chinh'){[440,554,659,880].forEach((f,i)=>tone(c,out,t+i*.08,1.6,f,f,.07,'sawtooth',-.3));[880,1318,1760].forEach((f,i)=>tone(c,out,t+.3+i*.1,1.8,f,f*.998,.05,'sine'));}else{[110,116,155,164].forEach((f,i)=>tone(c,out,t+i*.06,1.8,f,f*.97,.09,'sawtooth',.3));hiss(c,out,t,1.6,200,2400,.14,.3,.5);}tone(c,out,t,1.5,65,28,.4);}
 else if(kind==='omen'){hiss(c,out,t,.15,5000,600,.14);hiss(c,out,t+.1,1.6,400,60,.14,0,.5);tone(c,out,t,1.6,60,30,.3);}
 else if(kind==='start'){[0,.35,.7].forEach(d=>{tone(c,out,t+d,.5,110,38,.4);hiss(c,out,t+d,.09,1800,300,.1);});[220,277,330].forEach((f,i)=>tone(c,out,t+1.05,1.6,f,f,.07,'sawtooth',(i-1)*.4));}
 else if(kind==='flip'){ // 08/11 LẬT KÈO: tiếng hút lên → hai cú nổ → hợp âm của phe thắng thế
  hiss(c,out,t,.7,300,6000,.16,0,.7);tone(c,out,t,.7,90,520,.08,'sawtooth');
  [.7,.86].forEach((d,i)=>{tone(c,out,t+d,.9,90-i*20,28,.55,'sine');hiss(c,out,t+d,.35,3000,200,.24,i?p:-p,.6);});
  (side==='ma'?[146.8,174.6,220,293.7]:[261.6,329.6,392,523.3]).forEach((fr,i)=>{tone(c,out,t+.75+i*.05,1.8,fr,fr,.07,'sawtooth',(i-1.5)*.3);tone(c,out,t+.75+i*.05,1.8,fr*2,fr*2,.035,'triangle');});}
 else if(kind==='turn'){hiss(c,out,t,.4,500,4200,.12,p,.8);tone(c,out,t+.3,.6,side==='chinh'?660:165,side==='chinh'?990:110,.09,side==='chinh'?'triangle':'sawtooth',p);tone(c,out,t+.3,.5,85,32,.35,'sine',p);}
 else if(kind==='tick'){const hi=k>=1.5;tone(c,out,t,.09,hi?1800:1300,hi?1700:1250,hi?.2:.13,'square');tone(c,out,t,.06,hi?3600:2600,hi?3400:2500,.05,'sine');if(hi){tone(c,out,t,.45,110,40,.45,'sine');hiss(c,out,t,.12,2000,300,.12);}}
 else if(kind==='final'){[0,.04].forEach(d=>tone(c,out,t+d,3.2,98,92,.16*k,'sine'));tone(c,out,t,3,196,190,.07*k,'triangle');tone(c,out,t,2.6,294,290,.05*k,'sine');hiss(c,out,t,1.2,800,120,.12*k,0,.5);tone(c,out,t,.8,70,30,.4*k);}
 else if(kind==='cast'){ // 08/11 tối: tung chiêu — tiếng vút lao tới (0,45 s) rồi cú nổ đẩy; quà càng to càng dày, càng trầm
  hiss(c,out,t,.45,side==='chinh'?500:250,side==='chinh'?5200:2600,.1+.08*k,-p,.7);tone(c,out,t,.45,side==='chinh'?330:110,side==='chinh'?1320:330,.04*k,side==='chinh'?'triangle':'sawtooth',-p);
  tone(c,out,t+.45,.6+.3*k,90,26,.32*Math.min(1.6,k),'sine',p*.4);hiss(c,out,t+.45,.25+.15*k,3800,180,.16*Math.min(1.6,k),p*.4,.6);
  if(k>1.2)[.62,.8].forEach((d,i)=>tone(c,out,t+d,.7,70-i*12,24,.3*(k-.9),'sine',(i?1:-1)*.3));}
 else if(kind==='push'){hiss(c,out,t,.28,side==='chinh'?700:400,side==='chinh'?3600:1800,.13*k,p,.9);tone(c,out,t+.05,.3,70,34,.22*k,'sine',p);}
 else if(kind==='win'){const base=side==='ma'?[146.8,174.6,220]:[261.6,329.6,392];base.forEach((f,i)=>{tone(c,out,t+i*.12,2.2,f,f,.07,'sawtooth',(i-1)*.3);tone(c,out,t+i*.12,2.2,f*2,f*2,.04,'triangle');});tone(c,out,t,1.4,90,30,.4);[0,.25,.5].forEach(d=>hiss(c,out,t+d,.08,1800,300,.1));}
}
