// Chuyển động nhân vật: ngự kiếm bay vào/ra sân khấu, bay đi làm việc theo lệnh, bong bóng chữ.
// Mọi thứ có ngân sách để vài trăm người cùng hoạt động vẫn không loạn:
//   tối đa MAX_TRIPS người bay làm việc cùng lúc, MAX_BUBBLES bong bóng, bay vào/ra do StageDirector giới hạn.
// Tọa độ cảnh rộng 900. Hệ điều hành bật giảm chuyển động → không bay, chỉ còn bong bóng.
const TAU=Math.PI*2;
export const MAX_TRIPS=5,MAX_BUBBLES=8,TRIP_MS=4200,BUBBLE_MS=3500,LEAVE_MS=1200;
function hash(s){let n=0;for(const ch of String(s))n=(Math.imul(n,31)+ch.charCodeAt(0))|0;return Math.abs(n);}
const ease=k=>k<.5?2*k*k:1-(-2*k+2)**2/2;

export function tripKind(e){
  const text=String(e.text||'');
  if(e.effect==='breakthrough')return 'sky';
  if(e.effect==='attack')return 'boss';
  if(/^Luyện thành|^Dùng /.test(text))return 'furnace';
  if(/^Lĩnh ngộ|^Rèn thành|^Trang bị/.test(text))return 'library';
  if(e.gift||['sword','lotus','dragon'].includes(e.effect))return 'swoop';
  return 'hover';
}
export function bubbleText(e){
  if(e.engagementAction==='follow')return 'Mình đã theo dõi!';
  if(e.engagementAction==='share')return 'Mời bạn cùng chơi!';
  if(e.togetherWaiting)return 'Ai cùng tu với mình?';
  if(e.togetherStart)return 'Chào đồng môn, cùng tu nhé!';
  if(e.togetherDone)return 'Cảm ơn đồng môn!';
  if(e.introSpark)return 'Mình biết tu luyện rồi!';
  if(e.gift)return 'Tặng '+e.gift+(e.count>1?' ×'+e.count:'');
  if(e.effect==='join')return 'Nhập môn!';
  if(e.missing==='stones')return 'Gõ hái để lấy linh thạch!'; // 08/11: đủ tu vi, thiếu linh thạch
  if(['status','hint','ready','title'].includes(e.effect))return null;
  const s=String(e.text||'').split('•')[0].trim();return s?Array.from(s).slice(0,24).join(''):null;
}

export class Mover{
  constructor(){this.pos=new Map();this.info=new Map();this.trips=new Map();this.bubbles=new Map();this.last=0;}
  activeTrips(t){let n=0;for(const [id,tr]of this.trips){if(t-tr.t0>TRIP_MS)this.trips.delete(id);else if(tr.kind!=='hover')n++;}return n;}
  onEvent(e,t,motion=true){
    if(!e.user)return;
    const text=bubbleText(e);
    if(text){this.bubbles.set(e.user,{text,t0:t,pri:e.gift||e.effect==='breakthrough'?2:1});
      if(this.bubbles.size>MAX_BUBBLES){let drop=null;for(const [id,b]of this.bubbles)if(id!==e.user&&(!drop||b.pri<drop[1].pri||(b.pri===drop[1].pri&&b.t0<drop[1].t0)))drop=[id,b];if(drop)this.bubbles.delete(drop[0]);}}
    if(!motion)return;
    let kind=tripKind(e);if(kind!=='hover'&&!this.trips.has(e.user)&&this.activeTrips(t)>=MAX_TRIPS)kind='hover';
    this.trips.set(e.user,{kind,t0:t,seed:hash(e.id||e.user)});
  }
  dest(trip,a,H,floor){
    switch(trip.kind){
      case 'sky':return {x:a.x,y:a.y-260};
      case 'boss':return {x:455+((trip.seed%5)-2)*45,y:H*.38+70};
      case 'furnace':return {x:190,y:floor-215};
      case 'library':return {x:710,y:floor-215};
      case 'swoop':return {x:Math.max(140,Math.min(760,a.x+((trip.seed%2)?1:-1)*(110+trip.seed%60))),y:a.y-150};
      default:return {x:a.x,y:a.y-40};
    }
  }
  /** Đổi x,y của từng target thành vị trí đang hiển thị (bay vào từ trời, lướt khi đổi chỗ, bay đi làm việc). */
  place(targets,t,H,floor,motion=true){
    const dt=Math.min(100,Math.max(0,t-(this.last||t)));this.last=t;const k=1-Math.exp(-dt/480);
    for(const a of targets){
      this.info.set(a.id,{player:a.player,scale:a.scale});
      const base={x:a.x,y:a.y};let goal=base,tripLift=0,onTrip=false;const trip=motion&&this.trips.get(a.id);
      if(trip){const age=t-trip.t0;if(age<=TRIP_MS){const d=this.dest(trip,a,H,floor),f=age<1200?ease(age/1200):age<3000?1:ease(1-(age-3000)/1200);goal={x:base.x+(d.x-base.x)*f,y:base.y+(d.y-base.y)*f};tripLift=14*Math.min(1,f*3);onTrip=true;}}
      let cur=this.pos.get(a.id);
      if(!cur){cur=motion?{x:goal.x,y:goal.y-520}:{x:goal.x,y:goal.y};this.pos.set(a.id,cur);}   // người mới: bay từ trời xuống
      if(!motion||onTrip){cur.x=goal.x;cur.y=goal.y;}else{cur.x+=(goal.x-cur.x)*k;cur.y+=(goal.y-cur.y)*k;}
      if(!onTrip&&Number.isFinite(a.groundMaxY))cur.y=Math.min(cur.y,a.groundMaxY);
      const honored=motion&&(a.player?.realm>=5||a.player?.giftCoins>=1000||a.player?.honor?.role==='guardian');
      a.lift=(motion?Math.min(28,Math.hypot(goal.x-cur.x,goal.y-cur.y)*.3):0)+tripLift+(honored?12+Math.sin(t*.0018+hash(a.id))*3:0);
      a.x=cur.x;a.y=cur.y-a.lift;a.baseY=base.y;
    }
  }
  /** Người vừa rời sân bay lên mây rồi biến mất. */
  drawLeaving(c,scene,left,t){
    for(const l of left){const age=t-l.t,pos=this.pos.get(l.id),info=this.info.get(l.id);if(!pos||!info||age>LEAVE_MS)continue;
      const f=ease(Math.min(1,age/LEAVE_MS)),a={id:l.id,x:pos.x,y:pos.y-30-f*420,scale:info.scale,lift:20,baseY:pos.y};
      c.save();c.globalAlpha=1-f;this.under(c,a,t);scene.drawPlayer(c,info.player,a.x,a.y,t);c.restore();}
    if(this.pos.size>120){const keep=new Set([...left.map(l=>l.id),...this.info.keys()].slice(-120));for(const id of this.pos.keys())if(!keep.has(id)){this.pos.delete(id);this.info.delete(id);}}
  }
  /** Phi kiếm dưới chân + bóng trên mặt đất khi đang bay. */
  under(c,a,t){if(!(a.lift>3))return;const s=(a.scale||1.4)/1.4;c.save();
    c.fillStyle='rgba(8,20,30,.28)';c.beginPath();c.ellipse(a.x,(a.baseY??a.y)+14*s,20*s,5,0,0,TAU);c.fill();
    c.translate(a.x,a.y+16*s);c.shadowColor='#bfe9ff';c.shadowBlur=12;const g=c.createLinearGradient(-36*s,0,40*s,0);g.addColorStop(0,'#9fd6ef00');g.addColorStop(.2,'#d8f3ff');g.addColorStop(1,'#ffffff');
    c.fillStyle=g;c.beginPath();c.moveTo(-34*s,-2);c.lineTo(30*s,-2);c.lineTo(40*s,0);c.lineTo(30*s,2);c.lineTo(-34*s,2);c.closePath();c.fill();
    c.shadowBlur=0;c.strokeStyle='#e2c27e';c.lineWidth=3;c.beginPath();c.moveTo(-30*s,-5);c.lineTo(-30*s,5);c.stroke();
    for(let i=0;i<6;i++){c.fillStyle=`rgba(200,235,255,${.4-i*.06})`;c.beginPath();c.arc(-40*s-i*9,Math.sin(t*.02+i)*2,2.4-i*.3,0,TAU);c.fill();}
    c.restore();}
  /** Bong bóng chữ trên đầu người vừa tương tác. */
  drawBubbles(c,targets,t){
    const at=new Map(targets.map(a=>[a.id,a]));
    for(const [id,b]of this.bubbles){const a=at.get(id),age=t-b.t0;if(age>BUBBLE_MS){this.bubbles.delete(id);continue;}if(!a)continue;
      const alpha=Math.min(1,age/200,(BUBBLE_MS-age)/400),y=a.y-(a.scale||1.4)*62-48-Math.min(1,age/300)*8;
      c.save();c.globalAlpha=alpha;c.font='700 16px Segoe UI';const w=c.measureText(b.text).width+22;
      c.fillStyle='#fffaf0f0';c.strokeStyle='#d9b870';c.lineWidth=1.5;c.beginPath();c.roundRect(a.x-w/2,y-15,w,30,15);c.fill();c.stroke();
      c.beginPath();c.moveTo(a.x-6,y+14);c.lineTo(a.x,y+23);c.lineTo(a.x+6,y+14);c.closePath();c.fill();
      c.fillStyle='#2b2010';c.textAlign='center';c.textBaseline='middle';c.fillText(b.text,a.x,y+1);c.restore();}
  }
}
