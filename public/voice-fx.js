// 19/11/2026 (chủ game: "tăng độ lớn và trong của giọng đọc, nhạc đang lấn giọng"): thẻ <audio> đã ở volume 1 → không to thêm được.
// Cho giọng đi qua WebAudio: cắt ù trầm (dưới 120 Hz, nơi nhạc nền dày nhất) → nhấn 3 kHz cho rõ phụ âm → sáng nhẹ 7 kHz →
// nén để câu đều tiếng → khuếch đại ~1,4× (đo 19/11: RMS ~2× bản gốc, đỉnh <1) → chặn trần −3 dB (không vỡ tiếng). Chỉ dùng khi AudioContext đang chạy;
// nếu không thì giọng phát thẳng như cũ (tránh câm khi trình duyệt chặn tự phát).
export const VOICE_FX=Object.freeze({hp:120,presenceHz:3000,presenceDb:4.5,airHz:7000,airDb:2.5,threshold:-22,ratio:3.5,makeup:1.4,ceiling:-3});
export function routeVoice(ctx,clip){
 if(!ctx||ctx.state!=='running'||!ctx.createMediaElementSource||!clip)return null;
 try{
  const S=VOICE_FX,src=ctx.createMediaElementSource(clip),nodes=[src];let last=src;
  const add=n=>{last.connect(n);nodes.push(n);last=n;return n;};
  const hp=add(ctx.createBiquadFilter());hp.type='highpass';hp.frequency.value=S.hp;hp.Q.value=.707;
  const pr=add(ctx.createBiquadFilter());pr.type='peaking';pr.frequency.value=S.presenceHz;pr.Q.value=.9;pr.gain.value=S.presenceDb;
  const air=add(ctx.createBiquadFilter());air.type='highshelf';air.frequency.value=S.airHz;air.gain.value=S.airDb;
  const k=add(ctx.createDynamicsCompressor());k.threshold.value=S.threshold;k.knee.value=8;k.ratio.value=S.ratio;k.attack.value=.004;k.release.value=.18;
  const g=add(ctx.createGain());g.gain.value=S.makeup;
  const lim=add(ctx.createDynamicsCompressor());lim.threshold.value=S.ceiling;lim.knee.value=0;lim.ratio.value=20;lim.attack.value=.001;lim.release.value=.08;
  lim.connect(ctx.destination);
  return ()=>{for(const n of nodes)try{n.disconnect();}catch{}};
 }catch{return null;}
}
