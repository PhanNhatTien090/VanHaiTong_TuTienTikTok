export const REPEAT_MS=30*60000;
export const isArrivalWelcome=e=>!!(e?.autoArrival&&!e.resident&&!e.simulated);
// Show and focus immediately; prepare the spoken greeting in parallel. One arrival never enters two effect queues.
export class ArrivalWelcomes{
 constructor({voice,show,now=()=>Date.now(),schedule=(fn,ms)=>setTimeout(fn,ms)}){this.voice=voice;this.show=show;this.now=now;this.schedule=schedule;this.pending=new Map();this.shown=new Set();}
 add(e){
  if(!isArrivalWelcome(e)||this.pending.has(e.id)||this.shown.has(e.id))return;
  // 08/11: cùng một người ra vào liên tục (TikTok gửi lại khi tải lại LIVE) chỉ được chào 1 lần / 30 phút.
  const user=e.user||e.id,last=(this.byUser??=new Map()).get(user);if(last!==undefined&&this.now()-last<REPEAT_MS)return;this.byUser.set(user,this.now());if(this.byUser.size>800)this.byUser.delete(this.byUser.keys().next().value);
  if(this.pending.size>=12)this.pending.delete(this.pending.keys().next().value);
  this.pending.set(e.id,{e,at:this.now()});
  this.reveal(e,4500);
  if(this.voice.enabled&&this.voice.audio.enabled)this.voice.add(e);
 }
 reveal(e,duration){
  const row=this.pending.get(e.id);if(!row||this.shown.has(e.id))return;
  this.pending.delete(e.id);this.shown.add(e.id);if(this.shown.size>128)this.shown.delete(this.shown.values().next().value);
  if(this.now()-row.at>15000)return;
  this.show(e,Math.min(5500,Math.max(3200,duration)));
 }
 spoken(e,duration){if(!isArrivalWelcome(e))return false;this.reveal(e,duration);return true;}
}
