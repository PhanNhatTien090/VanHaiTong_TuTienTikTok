import {drawOrnateSeal,drawCelestialImpact} from './cinematic-vfx.js';
import {ascensionImpactRatio} from './audio.js';
import {portraitCanvas} from './linh-bai.js';
// Guardian Tribulation — chỉ vẽ hộ pháp THẬT đã gõ "giup" trước khi đột phá (server: companions.finishGuard, tối đa 3).
// V4 (15/11): nhịp theo đúng mốc nổ của từng cảnh giới (ascensionImpactRatio — cùng mốc với âm thanh):
//   hộ pháp hiện + truyền linh lực → kết giới dựng lên ngay trước mốc nổ → mốc nổ: kết giới đỡ thiên lôi (sáng + rung vòng) → tan.
// Tên lấy từ event.guardNames (server gửi kèm), không có thì tra người đang hiện; chân dung nếu người đó có trên sân.
const TAU=Math.PI*2,clamp=n=>Math.max(0,Math.min(1,n));
export const GUARD_MIN_REALM=6;
export const GUARD_REWARD_TEXT='Mỗi hộ pháp +10 linh thạch · +1 điểm Đồng môn';
export function guardianTribulationState(event,phase){
 const helpers=Array.isArray(event?.guardHelpers)?event.guardHelpers.slice(0,3):[];
 const realm=Number(event?.toRealm||event?.realm||0);
 const active=realm>=GUARD_MIN_REALM&&helpers.length>0;
 const impact=Math.max(.3,Math.min(.92,ascensionImpactRatio(realm)||.7));
 const fade=Math.min(impact+.1,.9),energy=clamp((phase-(impact-.42))/.16)*(1-clamp((phase-fade)/.08)); // luôn tan hẳn trước khi màn đột phá kết thúc
 const shield=clamp((phase-(impact-.2))/.14)*(1-clamp((phase-(impact+.06))/.1));
 const hit=phase>=impact&&phase<impact+.05?1-(phase-impact)/.05:0;
 return {active,helpers,impact,energy:active?energy:0,shield:active?shield:0,hit:active?hit:0};
}
export function guardName(scene,event,i){
 const own=Array.isArray(event?.guardNames)?event.guardNames[i]:null;
 return String(own||scene.playerIndex?.get(event?.guardHelpers?.[i])?.name||'Hộ pháp').slice(0,16);
}
export function drawGuardianTribulation(scene,c,event,phase,H){
 const g=guardianTribulationState(event,phase);if(!g.active||g.energy<.005)return;
 const reduced=scene.motion===false,light=scene.budget?.pressured||scene.budget?.level==='light',clock=reduced?0:phase*TAU;
 // V4: đặt dưới khung HUD (tên + cảnh giới ở ~20–30% chiều cao) để không đè chữ.
 const py=H*.42,titleY=H*.345,targetY=H*.58,cx=450,cy=targetY-112;
 c.save();c.globalAlpha*=g.energy;
 const positions=g.helpers.length===1?[450]:g.helpers.length===2?[295,605]:[205,450,695];
 for(let i=0;i<g.helpers.length;i++){
  const x=positions[i],y=py+(i%2)*18,glow=.42+g.shield*.38+g.hit*.2;
  c.save();c.translate(x,y);
  const player=scene.playerIndex?.get(g.helpers[i]),art=player&&!light&&typeof document!=='undefined'?portraitCanvas(scene,player):null;
  if(art){c.globalAlpha=g.energy*.92;c.drawImage(art,-27,-40,54,62);}
  c.strokeStyle=i%2?'#c7beff':'#9feae2';c.lineWidth=light?2:3;c.globalAlpha=g.energy*glow;
  for(let j=0;j<(light?1:2);j++){c.beginPath();c.ellipse(0,0,35+j*13,35+j*13,clock*(j?-.25:.15)+i,0,TAU);c.stroke();}
  if(!art){c.beginPath();for(let n=0;n<=6;n++){const a=n*TAU/6+clock*.05,r=20+g.shield*6;n?c.lineTo(Math.cos(a)*r,Math.sin(a)*r):c.moveTo(Math.cos(a)*r,Math.sin(a)*r);}c.stroke();}
  c.restore();
  // Luồng linh lực từ hộ pháp vào người độ kiếp; sáng nhất khi kết giới đỡ đòn.
  c.globalAlpha=g.energy*(.22+.25*g.shield+.35*g.hit);
  c.strokeStyle='#bdece6';c.lineWidth=(light?1.5:2.5)+g.hit*2;c.beginPath();c.moveTo(x,py+32);c.quadraticCurveTo((x+cx)/2,py+90,cx,cy);c.stroke();
  c.globalAlpha=g.energy;c.font='800 16px Segoe UI,Arial';c.fillStyle='#f6e7bd';c.textAlign='center';c.lineWidth=4;c.strokeStyle='#07121d';
  const name=guardName(scene,event,i);c.strokeText(name,x,py-52,152);c.fillText(name,x,py-52,152);
 }
 if(g.shield>.01&&!light)drawOrnateSeal(c,cx,cy,145,clock*.035,g.shield*.58);
 // Một va chạm cục bộ đúng mốc nổ của cảnh giới; không flash toàn màn hình.
 if(!light)drawCelestialImpact(c,cx,cy,(phase-g.impact)*Math.max(1,event.duration||20000),155,.46);
 if(g.shield>.01){
  const pulse=g.hit*(reduced?0:1);
  c.globalAlpha=g.energy*Math.min(1,g.shield*.6+g.hit*.4);c.strokeStyle=g.hit?'#fff3c4':'#ffda96';c.lineWidth=(light?2:3)+g.hit*3;
  c.beginPath();c.ellipse(cx,cy,95+g.shield*80+pulse*26,32+g.shield*50+pulse*12,0,0,TAU);c.stroke();
  if(g.hit&&!scene.reduceFlash){c.globalAlpha=g.energy*g.hit*.5;c.lineWidth=2;c.beginPath();c.ellipse(cx,cy,140+(1-g.hit)*120,60+(1-g.hit)*50,0,0,TAU);c.stroke();}
 }
 c.globalAlpha=g.energy*.9;c.textAlign='center';c.lineWidth=5;c.strokeStyle='#07121d';
 c.font='800 24px "Segoe UI",Arial,sans-serif';c.strokeText('ĐỒNG MÔN HỘ KIẾP · '+g.helpers.length+' HỘ PHÁP',450,titleY,690);c.fillStyle='#fff0b8';c.fillText('ĐỒNG MÔN HỘ KIẾP · '+g.helpers.length+' HỘ PHÁP',450,titleY,690);
 c.font='700 16px Segoe UI,Arial';c.strokeText(GUARD_REWARD_TEXT,450,titleY+28,690);c.fillStyle='#e6f6ff';c.fillText(GUARD_REWARD_TEXT,450,titleY+28,690);
 c.restore();
}
