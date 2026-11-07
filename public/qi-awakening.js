import {drawRitualTint} from './ritual-appearance.js';
import {drawAscensionStageBackdrop} from './ascension-stage.js';
import {qiEnergyState,drawQiGround,drawQiStreams,drawQiBurst} from './qi-energy.js';
import {makeSurface} from './performance.js';
import {luyenKhiState,drawLkFloor,drawLkSky,drawLkFormation,drawLkVortex,drawLkGroundQi,drawLkMeridians,drawLkConverge,drawLkScatter,drawLkWheel} from './luyen-khi-formation.js';
import {setFxPalette,qiVariant,QI_IMPACT,qiStoryK,qiCamera,drawQiEnvironment,drawQiVignette,drawQiInflow,drawQiCompression,drawQiImpact,drawQiAura,drawQiMotes} from './qi-impact.js';
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10);},mix=(a,b,u)=>a+(b-a)*u;
export const QI_BEATS=Object.freeze([
 {at:0,id:'condense',label:'Ngưng tụ linh khí',detail:'Một linh khí châu hình thành tại đan điền'},
 {at:.22,id:'emerge',label:'Linh châu xuất thể',detail:'Linh khí châu rời đan điền, nâng lên trước người'},
 {at:.36,id:'divide',label:'Nhất khí hóa tam lưu',detail:'Linh châu phân thành ba luồng khí'},
 {at:.47,id:'orbit',label:'Vận khí quanh thân',detail:'Ba luồng khí cùng vận chuyển một chu thiên'},
 {at:.72,id:'reunite',label:'Tam khí quy nguyên',detail:'Ba luồng khí hợp nhất, trở về đan điền'},
 {at:.88,id:'complete',label:'Luyện Khí thành công',detail:'Linh khí ổn định trong người'}
]);
export function qiAwakeningState(k,H=1600,motion=true){
 k=clamp(k);const beat=[...QI_BEATS].reverse().find(b=>k>=b.at),feet=H*.64,origin={x:450,y:feet-30},hover={x:450,y:feet-360},center={x:450,y:feet-110},parts=[];
 let core={x:origin.x,y:origin.y,r:mix(3,27,smooth(k/.22)),alpha:smooth(k/.11),z:1};
 if(k>=.22&&k<.36){const u=smooth((k-.22)/.14);core={...core,y:mix(origin.y,hover.y,u),r:mix(27,35,u)};}
 if(k>=.36){const split=smooth((k-.36)/.11),turn=smooth((k-.47)/.25)*TAU*1.35,merge=smooth((k-.72)/.105),enter=smooth((k-.825)/.055),r=19;
  for(let i=0;i<3;i++){const a=-Math.PI/2+i*TAU/3+(motion?turn:0),rx=185,ry=180;
   const ox=center.x+Math.cos(a)*rx,oy=center.y+Math.sin(a)*ry;
   let x=mix(hover.x,ox,split),y=mix(hover.y,oy,split);x=mix(x,hover.x,merge);y=mix(y,hover.y,merge);y=mix(y,origin.y,enter);
   parts.push({id:i,x,y,z:Math.cos(a),r:mix(r,13,merge),alpha:k<.87?1:1-smooth((k-.87)/.015)});
  }
  core={x:450,y:mix(hover.y,origin.y,enter),r:mix(35,25,enter),alpha:1-split,z:1};
  if(k>=.825)core.alpha=smooth((k-.825)/.04)*(1-smooth((k-.88)/.035));
 }
 const pulse=k>=.88&&k<.96?Math.sin(clamp((k-.88)/.08)*Math.PI):0;
 return {k,beat,feet,origin,hover,center,core,parts,revealed:k>=.88,pulse,settle:smooth((k-.88)/.08),lift:motion?Math.sin(smooth((k-.20)/.64)*Math.PI)*8:0};
}
function makePearl(scene){if(scene.qiPearl)return scene.qiPearl;const f=makeSurface(160,160);if(!f)return null;const c=f.getContext('2d'),g=c.createRadialGradient(66,57,3,80,80,76);g.addColorStop(0,'#ffffff');g.addColorStop(.17,'#e6fff2');g.addColorStop(.35,'#9ff8d5');g.addColorStop(.52,'#2eaf92');g.addColorStop(.64,'#164f5d');g.addColorStop(.69,'#a1ffe5');g.addColorStop(.74,'#73edce50');g.addColorStop(1,'#73edce00');c.fillStyle=g;c.fillRect(0,0,160,160);c.strokeStyle='#d7fff7bc';c.lineWidth=1.8;for(let i=0;i<3;i++){c.save();c.translate(80,80);c.rotate(i*1.05);c.beginPath();c.ellipse(0,0,45,17,0,0,TAU);c.stroke();c.restore();}c.fillStyle='#fffbe4';c.beginPath();c.arc(65,59,7,0,TAU);c.fill();scene.qiPearl=f;return f;}
function pearl(c,im,p){if(!im||p.alpha<=0)return;c.save();c.globalAlpha*=p.alpha;c.drawImage(im,p.x-p.r*1.45,p.y-p.r*1.45,p.r*2.9,p.r*2.9);c.restore();}
function trail(c,k,H,i,motion){if(!motion||k<.37||k>.88)return;c.save();c.lineWidth=2.4;c.lineCap='round';for(let j=0;j<9;j++){const a=qiAwakeningState(Math.max(.36,k-(j+1)*.0027),H,motion).parts[i],b=qiAwakeningState(Math.max(.36,k-j*.0027),H,motion).parts[i];if(!a||!b)continue;c.globalAlpha=(1-j/9)*.45*a.alpha;c.strokeStyle=['#88f4cd','#c3fff4','#b2e1ff'][i];c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}c.restore();}
// v4 (4/11/2026): k = thời gian hiển thị; sk = thời gian mạch truyện linh châu (cũ). Nổ ở k=.70 thay vì .88
// để dư âm ~2,6 s đủ cho người xem LIVE đọc được tên cảnh giới.
export function drawQiAwakening(scene,c,e,t,H){
 setFxPalette(null);const v=qiVariant(e),k=clamp((t-e.start)/e.duration),sk=qiStoryK(k),motion=scene.motion!==false,s=qiAwakeningState(sk,H,motion),im=makePearl(scene),x=450,color=scene.ritualAppearance?.palette.main2||'#9deed1';
 c.save();
 drawAscensionStageBackdrop(scene,c,H,{clock:t-e.start,ritual:true,color:scene.ritualAppearance?.palette.main2||'#9deed1',feet:s.feet}); // 4/11: thiên đài cả trên LIVE
 drawQiEnvironment(scene,c,k,H,s.origin,true);
 const lk=luyenKhiState(k);drawLkSky(scene,c,lk,H,v);drawRitualTint(scene,c,H); // v5: núi mực + biển mây lấp nửa trên
 const halo=c.createRadialGradient(x,s.center.y,10,x,s.center.y,340);halo.addColorStop(0,'#3f8e7d22');halo.addColorStop(1,'#3f8e7d00');c.fillStyle=halo;c.fillRect(80,s.center.y-340,740,680);
 // Camera đẩy vào quanh thân người tu luyện.
 const zoom=1+(qiCamera(k,motion&&scene.cameraEnabled!==false)-1)*v.zoom,fy=s.feet-150+v.dy;c.save();c.translate(x,fy);c.scale(zoom,zoom);c.translate(-x,-fy);if(v.flip){c.translate(900,0);c.scale(-1,1);}
 c.fillStyle='#00000045';c.beginPath();c.ellipse(x,s.feet+32,150,25,0,0,TAU);c.fill();
 const energy=qiEnergyState(sk,motion),jolt=motion&&scene.cameraEnabled!==false?energy.burst*7:0;c.translate(Math.sin(k*1700)*jolt,Math.cos(k*1400)*jolt*.6);
 drawQiGround(scene,c,sk,s);
 drawLkFloor(scene,c,lk,s,H);      // v5: mặt nước gợn sóng dưới trận
 drawLkFormation(scene,c,lk,s,v);  // v5: trận đồ Bát Quái
 drawLkVortex(scene,c,lk,s,H,v);    // v5: phễu mây + khí rót bách hội
 drawLkGroundQi(scene,c,lk,s,v);    // v5: khí đất từ tám quẻ
 drawQiInflow(scene,c,k,s.origin,v.phase);
 drawQiStreams(scene,c,sk,s,'back');
 for(const p of s.parts.filter(p=>p.z<0)){trail(c,sk,H,p.id,motion);pearl(c,im,p);}
 drawQiAura(scene,c,k,s.origin,s.feet);
 drawLkWheel(scene,c,lk,s,v);       // v5: pháp luân sau lưng khi hiện thân
 const live=scene.playerIndex?.get(e.user)||scene.players?.find(p=>p.id===e.user),to=e.visualTo||live,from=e.visualFrom||(to?{...to,realm:e.fromRealm??0}:null),actor=s.revealed?to:from;
 if(actor){scene.targets=[{id:e.user,player:actor,x,y:s.feet,scale:4.2}];const wasCompact=scene.compact,wasRitual=scene.ritualDrawing;scene.compact=true;scene.ritualDrawing=true;c.save();c.translate(0,-s.lift);try{// Tint through the actor's alpha: energy lights the body, not a rectangle.
 const surface=scene.qiActorSurface??=makeSurface(600,760);
 if(surface){const a=surface.getContext('2d');a.setTransform(1,0,0,1,0,0);a.clearRect(0,0,600,760);a.save();a.translate(300-x,530-s.feet);scene.drawPlayer(a,actor,x,s.feet,t-e.start);a.restore();c.drawImage(surface,x-300,s.feet-530);
  // v4: viền sáng linh khí thay cho phủ trắng đặc (trước đây nhân vật thành khối trắng lúc nổ).
  const strength=Math.min(.45,energy.charge*.22+energy.burst*.28+(k>=QI_IMPACT?(1-clamp((k-QI_IMPACT)/.2))*.12:0));
  if(strength>0){a.save();a.globalCompositeOperation='source-in';const g=a.createLinearGradient(0,530,0,240);g.addColorStop(0,'#91ffd0');g.addColorStop(.55,'#e4fff3');g.addColorStop(1,'#b2faff');a.fillStyle=g;a.fillRect(0,0,600,760);a.globalCompositeOperation='destination-in';a.drawImage(surface,0,0);a.drawImage(surface,0,0);a.restore();c.save();c.globalCompositeOperation='screen';c.globalAlpha=strength;c.drawImage(surface,x-300,s.feet-530);c.restore();}
 }else scene.drawPlayer(c,actor,x,s.feet,t-e.start);}finally{scene.compact=wasCompact;scene.ritualDrawing=wasRitual;c.restore();}}
 drawLkMeridians(scene,c,lk,s,s.lift); // v5: kinh mạch + tiểu chu thiên
 for(const p of s.parts.filter(p=>p.z>=0)){trail(c,sk,H,p.id,motion);pearl(c,im,p);}
 drawQiStreams(scene,c,sk,s,'front');
 pearl(c,im,s.core);
 drawLkConverge(scene,c,lk,s);
 drawQiCompression(c,k,s.origin);
 drawQiBurst(c,sk,s,motion);
 if(s.pulse>0){const g=c.createRadialGradient(x,s.origin.y,0,x,s.origin.y,55+s.pulse*70);g.addColorStop(0,'#f5fff4');g.addColorStop(.15,'#baffdcbd');g.addColorStop(1,'#87f6c900');c.save();c.globalAlpha=s.pulse*.7;c.fillStyle=g;c.fillRect(x-210,s.origin.y-210,420,420);c.restore();}
 if(s.settle>0){c.save();c.globalAlpha=s.settle*.65;c.strokeStyle=color;c.lineWidth=1.5;c.beginPath();c.ellipse(x,s.feet+27,110,22,0,0,TAU);c.stroke();pearl(c,im,{x,y:s.origin.y,r:8,alpha:s.settle*.7});c.restore();}
 drawQiImpact(scene,c,k,H,s.origin,s.feet);
 drawLkScatter(scene,c,lk,s);
 c.restore();
 drawQiMotes(scene,c,k,H);
 drawQiVignette(c,k,H);
 const ui={k,realm:1,phase:s.revealed?'reveal':s.beat.id,revealed:s.revealed,color,title:'Luyện Khí',subtitle:'Khí Hải Sơ Khai',name:String(e.name||'Đạo hữu').normalize('NFC'),label:'',detail:'',shake:jolt};
 if(scene.onRitualFrame)scene.onRitualFrame(ui);else{c.textAlign='center';c.fillStyle='#e7f1e8';c.font='600 25px Arial';c.fillText(ui.name,450,H*.19,700);if(s.revealed){c.font='700 40px Arial';c.fillStyle=color;c.fillText('LUYỆN KHÍ',450,H*.24,750);}}
 c.restore();return ui;
}
