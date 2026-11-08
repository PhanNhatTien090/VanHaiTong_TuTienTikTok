// 07/11/2026 — Tăng lực âm thanh đột phá từ Luyện Hư (6) trở lên theo yêu cầu chủ game: "thêm âm thanh, tăng mạnh độ lớn".
// 1) createRitualBoostBus: khuếch đại + nén (compressor) + giới hạn → to hơn rõ rệt mà không vỡ tiếng.
// 2) scheduleRitualBoostLayer: lớp phụ dùng chung — trống trận dồn nhanh dần tới lúc nổ, gió cuộn trước nổ,
//    cú nổ trầm + chiêng xoảng, hợp âm kèn khi hiện thân. Mức tăng theo cảnh giới (cao hơn → mạnh hơn).
export const BOOST_IMPACT=Object.freeze({6:[17.25,98,20.8],7:[19,87.31,22.8],8:[27.35,82.41,31.6],9:[18.1,77.78,26],10:[20.2,73.42,28],11:[26,65.41,30],12:[28,61.74,32],13:[30,55,34]});
export function boostLevel(realm){return realm>=6?Math.min(1.5,1+(realm-6)*.07):0;}
export function createRitualBoostBus(ctx,dest,realm){
 const k=boostLevel(realm);if(!k||!ctx?.createDynamicsCompressor)return null;
 // 08/11: cắt trầm sâu (93–99% năng lượng dưới 250 Hz làm loa điện thoại/AAC của TikTok rè), bù dải giữa cho rõ, chắc.
 const input=ctx.createGain(),hp=ctx.createBiquadFilter(),shelf=ctx.createBiquadFilter(),mid=ctx.createBiquadFilter(),out=ctx.createGain();
 input.gain.value=1.8*k;hp.type='highpass';hp.frequency.value=65;hp.Q.value=.6;
 shelf.type='lowshelf';shelf.frequency.value=160;shelf.gain.value=-6;mid.type='peaking';mid.frequency.value=1400;mid.Q.value=.7;mid.gain.value=3;out.gain.value=1.35;
 input.connect(hp);hp.connect(shelf);shelf.connect(mid);mid.connect(out);out.connect(dest);
 return {input,stop(){try{for(const n of [input,hp,shelf,mid,out])n.disconnect();}catch{}}};
}
let noiseBuf=null;
function noise(ctx){if(noiseBuf&&noiseBuf.sampleRate===ctx.sampleRate)return noiseBuf;const b=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),d=b.getChannelData(0);let s=1234567;for(let i=0;i<d.length;i++){s=(Math.imul(s,1103515245)+12345)|0;d[i]=s/2147483648;}return noiseBuf=b;}
export function scheduleRitualBoostLayer(ctx,out,{realm,elapsed=0,duration}){
 const spec=BOOST_IMPACT[realm];if(!spec||!ctx)return null;const k=boostLevel(realm),[hitAt,root,nominal]=spec,impact=hitAt*(duration/nominal),now=ctx.currentTime,nodes=[];
 const bus=ctx.createGain();bus.gain.value=.9*k;bus.connect(out);
 const when=at=>now+(at-elapsed);
 const kick=(at,lvl,f0=120,f1=38,len=.5)=>{if(at<elapsed)return;const t=when(at),o=ctx.createOscillator(),g=ctx.createGain();o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+len*.8);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(lvl,t+.006);g.gain.exponentialRampToValueAtTime(.0008,t+len);o.connect(g);g.connect(bus);o.start(t);o.stop(t+len+.05);nodes.push(o);};
 const hiss=(at,len,lvl,type,f0,f1,q=1,attack=.004)=>{if(at+len<elapsed)return;const t=Math.max(now,when(at)),src=ctx.createBufferSource(),flt=ctx.createBiquadFilter(),g=ctx.createGain();src.buffer=noise(ctx);src.loop=true;flt.type=type;flt.Q.value=q;flt.frequency.setValueAtTime(f0,t);flt.frequency.exponentialRampToValueAtTime(f1,t+len);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(lvl,t+attack);g.gain.exponentialRampToValueAtTime(.0008,t+len);src.connect(flt);flt.connect(g);g.connect(bus);src.start(t);src.stop(t+len+.05);nodes.push(src);};
 const tone=(at,len,lvl,hz,type='sawtooth',cut=1800)=>{if(at+len<elapsed)return;const t=Math.max(now,when(at)),o=ctx.createOscillator(),flt=ctx.createBiquadFilter(),g=ctx.createGain();o.type=type;o.frequency.value=hz;flt.type='lowpass';flt.frequency.setValueAtTime(cut*.4,t);flt.frequency.linearRampToValueAtTime(cut,t+.25);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(lvl,t+.12);g.gain.setValueAtTime(lvl,t+len*.6);g.gain.exponentialRampToValueAtTime(.0008,t+len);o.connect(flt);flt.connect(g);g.connect(bus);o.start(t);o.stop(t+len+.05);nodes.push(o);};
 // trống trận: thưa → dày dần, mạnh dần tới lúc nổ (nhịp nhanh gấp đôi 3 s cuối)
 for(let at=.5;at<impact-.25;){const u=at/impact;kick(at,.28+u*.32);if(Math.floor(at*2)%4===0)hiss(at,.08,.12+u*.1,'bandpass',2200,1400,1.4);at+=impact-at<3?.18:.36-u*.1;}
 // gió cuộn + trống lăn 2 s trước nổ
 hiss(impact-2.2,2.2,.32,'bandpass',260,4200,1.1,2);for(let i=0;i<14;i++)kick(impact-1.4+i*.1,.2+i*.02,90,50,.18);
 // cú nổ: trầm sâu + xoảng chiêng + vang
 kick(impact,1,95,24,2.2);kick(impact+.02,.7,180,40,.6);hiss(impact,2.8,.5,'highpass',5200,1800,.7);hiss(impact,1.4,.35,'lowpass',900,120,.8);
 kick(impact+.45,.45,70,28,1.4);
 // hợp âm kèn khi hiện thân
 const rev=impact+.4;for(const [m,l] of [[1,.09],[1.25,.07],[1.5,.07],[2,.05]])tone(rev,2.6,l,root*2*m);tone(rev,2.6,.06,root,'triangle',600);
 const endAt=when(Math.min(duration,impact+3.4));
 return {endAt,stop(){for(const n of nodes){try{n.stop();}catch{}}try{bus.disconnect();}catch{}}};
}
