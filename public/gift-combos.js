const arrays=['items','itemNames','skinNames'];
export function mergeGiftPresentation(a,b){
 const reward={...a.reward};for(const key of ['qi','stones','herbs'])reward[key]=(a.reward?.[key]||0)+(b.reward?.[key]||0);for(const key of arrays)reward[key]=[...new Set([...(a.reward?.[key]||[]),...(b.reward?.[key]||[])])];
 const ids=[...new Set([...(a.sourceIds||[a.id]),...(b.sourceIds||[b.id])])];
 return {...a,...b,id:ids[0],sourceIds:ids,count:(a.count||1)+(b.count||1),reward,combo:true,comboFinal:!!b.comboFinal,firstGift:!!(a.firstGift||b.firstGift),buff:(b.buff?.mult||0)>(a.buff?.mult||0)?b.buff:a.buff||b.buff,raceBoost:(a.raceBoost||0)+(b.raceBoost||0),visitorProgress:b.visitorProgress||a.visitorProgress,text:`${b.gift||a.gift} ×${(a.count||1)+(b.count||1)} • +${reward.qi} tu vi • cảm ơn đạo hữu`};
}
export function comboKey(e){if(!e?.gift||!e.user)return null;return [e.user,e.comboKey||'',e.gift,e.coins,e.simulated?'fake':'real'].join('|');}
export class GiftComboBuffer{
 constructor({quiet=1500,maxWait=20000,limit=64}={}){this.quiet=quiet;this.maxWait=maxWait;this.limit=limit;this.rows=new Map();this.seen=new Set();}
 push(e,now){const key=comboKey(e);if(!key)return false;if(this.seen.has(e.id))return true;this.seen.add(e.id);while(this.seen.size>512)this.seen.delete(this.seen.values().next().value);
 const row=this.rows.get(key);if(row){row.event=mergeGiftPresentation(row.event,e);row.last=now;}else this.rows.set(key,{event:{...e,sourceIds:[e.id]},first:now,last:now});return true;}
 drain(now,force=false){const out=[];for(const [key,row]of this.rows){if(force||row.event.comboFinal||row.event.sourceIds.length>=64||now-row.last>=this.quiet||now-row.first>=this.maxWait||this.rows.size>this.limit){out.push(row.event);this.rows.delete(key);}}return out;}
}
export function comboIntensity(e){const n=Math.max(1,Number(e.count)||1);return Math.min(1.8,1+Math.log2(n)*.16);}
export function drawComboBurst(c,e,t,k,p,H,light=true,motion=true){if(!e.gift||!(e.count>1)||k<0||k>1)return;const n=Math.min(light?12:22,6+Math.ceil(Math.log2(e.count)*3)),power=comboIntensity(e),phase=motion?k:.45,fade=Math.min(1,phase*7,(1-phase)*5),cy=Math.max(H*.2,p.y-110);c.save();c.globalAlpha=fade;c.strokeStyle='#ffe3a1';c.fillStyle='#ffe9bd';
 for(let i=0;i<3;i++){const u=(phase*1.5-i*.15);if(u<0||u>1)continue;c.globalAlpha=fade*(1-u);c.lineWidth=2.5;c.beginPath();c.ellipse(p.x,cy,25+u*115*power,10+u*50*power,0,0,Math.PI*2);c.stroke();}
 for(let i=0;i<n;i++){const a=i*2.399+(motion?t*.0005:0),r=(25+phase*100)*power;c.globalAlpha=fade*(1-phase*.6);c.beginPath();c.ellipse(p.x+Math.cos(a)*r,cy+Math.sin(a)*r*.5-phase*45,2,5,a,0,Math.PI*2);c.fill();}
 c.globalAlpha=fade;c.textAlign='center';c.font='700 '+Math.round(28+power*10)+'px Segoe UI';c.lineWidth=5;c.strokeStyle='#172434';const label='COMBO ×'+e.count;c.strokeText(label,p.x,cy-85);c.fillStyle='#ffdfa0';c.fillText(label,p.x,cy-85);c.restore();}
