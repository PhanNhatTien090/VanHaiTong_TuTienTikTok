
import {makeSurface} from './performance.js';
import {feedbackBudget} from './cinematic-feedback.js';

const TAU=Math.PI*2;
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>1-(1-clamp(x))**3;
const stamps=new Map();
export const PALETTES={
  void:['#a98cff','#6deee8','#f4eaff'],
  gold:['#ffc05f','#ff7452','#fff4c8'],
  dawn:['#eac473','#80dbff','#fff7dd'],
  dusk:['#b872e6','#b64168','#f8dfff'],
  jade:['#65d9b8','#83d6ff','#d9fff0']
};
export const VFX_LIMITS={
  light:{particles:6,rings:1,glows:1},
  balanced:{particles:12,rings:2,glows:1},
  high:{particles:20,rings:2,glows:1}
};

// During a solo presentation, background audience records are not being rasterized.
// Honour measured pressure and an explicit Performance setting before giving focused
// events a small, bounded budget. Never grant High merely because the scene is solo.
export function cinematicQuality(scene,{focused=false}={}){
  if(scene.budget?.pressured||scene.budget?.mode==='light')return 'light';
  const active=Math.max(scene.visibleActors||0,scene.actorLoad?.activePlayers||0,scene.targets?.length||0);
  // addEffect runs before the first solo frame, so visibleActors still describes
  // the previous plaza. Trust focused only when the caller has a solo presentation.
  if(focused)return scene.budget?.mode==='high'?'high':'balanced';
  if(feedbackBudget(scene)||active>=20)return 'light';
  return scene.budget?.level==='high'?'high':'balanced';
}

export function cinematicSeed(id){
  let seed=2166136261;
  for(const char of String(id))seed=Math.imul(seed^char.charCodeAt(0),16777619);
  return (seed>>>0)/4294967296;
}

function texture(theme,kind){
  const key=theme+':'+kind;
  if(stamps.has(key))return stamps.get(key);
  const [color,accent,core]=PALETTES[theme];
  const surface=makeSurface(192,192);
  if(!surface)return null;
  const paint=c=>{
    const halo=c.createRadialGradient(96,96,0,96,96,94);
    halo.addColorStop(0,core);
    halo.addColorStop(.22,color);
    halo.addColorStop(.58,accent+'42');
    halo.addColorStop(1,accent+'00');
    if(kind==='glow'){c.fillStyle=halo;c.fillRect(0,0,192,192);return;}
    c.translate(96,96);
    if(kind==='trail'){
      const gradient=c.createLinearGradient(-94,0,92,0);
      gradient.addColorStop(0,color+'00');
      gradient.addColorStop(.7,accent+'88');
      gradient.addColorStop(1,core);
      c.fillStyle=gradient;
      c.beginPath();c.moveTo(-94,0);c.quadraticCurveTo(62,-29,92,0);
      c.quadraticCurveTo(62,29,-94,0);c.fill();
      return;
    }
    const sides=theme==='dusk'?6:0;
    for(const [radius,width,ink] of [[85,7,color+'35'],[85,2,core],[75,1,accent],[58,1,color+'ae']]){
      c.beginPath();
      if(sides){
        for(let i=0;i<=sides;i++){const a=TAU*i/sides;c.lineTo(radius*Math.cos(a),radius*Math.sin(a));}
      }else c.arc(0,0,radius,0,TAU);
      c.lineWidth=width;c.strokeStyle=ink;c.stroke();
    }
    for(let i=0;i<12;i++){
      c.rotate(TAU/12);c.fillStyle=i%3?accent:core;
      c.beginPath();c.moveTo(64,0);c.lineTo(70,-3);c.lineTo(75,0);c.lineTo(70,3);c.fill();
    }
  };
  paint(surface.getContext('2d'));
  stamps.set(key,surface);
  return surface;
}

// One original, pre-rasterized void gate (384x384): kept outside the frame loop.
// Dense edge marks are painted just once; animation only transforms two half images.
let voidGate=null;
function gateTexture(){
  if(voidGate)return voidGate;
  const surface=makeSurface(384,384);
  if(!surface)return null;
  const c=surface.getContext('2d'),cx=192,cy=192;
  c.save();
  const hollow=c.createRadialGradient(cx,cy,26,cx,cy,174);
  hollow.addColorStop(0,'#030518fa');
  hollow.addColorStop(.57,'#08102bdc');
  hollow.addColorStop(.78,'#30205c9a');
  hollow.addColorStop(1,'#30205c00');
  c.fillStyle=hollow;c.beginPath();c.ellipse(cx,cy,139,178,0,0,TAU);c.fill();
  for(const side of [-1,1]){
    for(let layer=0;layer<3;layer++){
      const xx=cx+side*(107+layer*9),top=18+layer*10;
      c.strokeStyle=layer===0?'#e9ffff':layer===1?'#83e9ecb8':'#b7a1ff7a';
      c.lineWidth=layer===0?3.5:layer===1?5:10;
      c.beginPath();c.moveTo(cx+side*23,top);
      c.bezierCurveTo(xx+side*38,cy*.40,xx-side*36,cy*1.54,cx+side*24,384-top);
      c.stroke();
    }
    for(let i=0;i<10;i++){
      const y=43+i*30,reach=(i%3+1)*9,outer=cx+side*(97+Math.sin(i*2.8)*20);
      c.beginPath();c.moveTo(outer,y-11);c.lineTo(outer+side*reach,y);
      c.lineTo(outer-side*5,y+12);
      c.strokeStyle=i%3===0?'#ecf7ffd9':'#91ececa5';
      c.lineWidth=i%3===0?2.5:1.4;c.stroke();
    }
  }
  for(let i=0;i<28;i++){
    const x=36+(i*117)%312,y=25+(i*79)%334;
    c.fillStyle=i%4?'#c7e8ff9c':'#fff2d8d0';
    c.fillRect(x,y,i%7===0?2:1,i%7===0?2:1);
  }
  c.restore();voidGate=surface;return surface;
}
export function prepareCinematicArt(){
  for(const theme of Object.keys(PALETTES))for(const kind of ['glow','seal','trail'])texture(theme,kind);
  gateTexture();
}
// Testable deterministic storyboard: the rift forms before impact, splits at
// impact and fades. No particle creation or image decoding on the hit frame.
export function voidGateFrame(gather,age){
  const opening=ease(gather);
  const split=age<0?0:ease(age/550);
  const opacity=age<0?opening*.78:(1-ease((age-180)/1050))*.86;
  return {opening,split,opacity:clamp(opacity)};
}
export function drawVoidGate(c,x,y,gather,age,{motion=true,quality='balanced'}={}){
  const image=gateTexture(),state=voidGateFrame(gather,age);
  if(!image||state.opacity<=.005)return;
  const w=motion?375:345,h=quality==='light'?475:550;
  const width=w*(.19+.81*state.opening);
  const shift=motion?state.split*64:0,top=y-h*.5;
  c.save();c.globalAlpha*=state.opacity;
  c.drawImage(image,0,0,192,384,x-width*.5-shift,top,width*.5,h);
  c.drawImage(image,192,0,192,384,x+shift,top,width*.5,h);
  c.restore();
}

function stamp(c,image,x,y,w,h,rotation,alpha){
  if(!image||alpha<=.005)return;
  c.save();c.globalAlpha*=alpha;c.translate(x,y);
  if(rotation)c.rotate(rotation);
  c.drawImage(image,-w/2,-h/2,w,h);c.restore();
}

export function drawSeal(c,theme,x,y,r,phase,alpha){
  stamp(c,texture(theme,'seal'),x,y,r*2,r*.68,0,alpha);
  stamp(c,texture(theme,'seal'),x,y,r*1.52,r*.52,phase,alpha*.42);
}
export function drawAura(c,theme,x,y,r,alpha){
  stamp(c,texture(theme,'glow'),x,y,r*1.5,r*2.4,0,alpha);
}
export function drawTrail(c,theme,x,y,angle,length,alpha){
  stamp(c,texture(theme,'trail'),x,y,length,length*.55,angle,alpha);
}
export function drawEnergyOrb(c,theme,x,y,progress,age,seed,quality,motion){
  if(progress<=0)return;
  const p=clamp(progress);
  const compression=motion?1-.45*clamp((age+110)/110):1;
  const r=(24+64*ease(p))*compression;
  const [,accent,core]=PALETTES[theme];
  c.save();
  stamp(c,texture(theme,'glow'),x,y,r*2.4,r*2.4,0,.72*p);
  stamp(c,texture(theme,'seal'),x,y,r*1.8,r*1.4,motion?age*.0013:0,.7*p);
  stamp(c,texture(theme,'seal'),x,y,r*1.5,r*.95,motion?-age*.0017:0,.5*p);
  c.fillStyle=core;c.globalAlpha*=p;
  c.beginPath();c.arc(x,y,r*.15,0,TAU);c.fill();
  if(motion){
    const n=Math.min(8,VFX_LIMITS[quality].particles);
    c.fillStyle=accent;
    for(let i=0;i<n;i++){
      const u=((age*(.0008+p*.001)+i/n)%1+1)%1;
      const a=seed*TAU+i*2.399+u*2;
      const distance=r*(1.8-u*1.55);
      c.fillRect(x+Math.cos(a)*distance,y+Math.sin(a)*distance*.8,3,3);
    }
  }
  c.restore();
}

export function drawShockwave(c,theme,x,y,age,{quality='balanced',radius=315,seed=0,motion=true,flash=false,aspect=.52}={}){
  if(age<0||age>=500)return;
  const p=age/500,fade=(1-p)**1.4;
  const {particles,rings}=VFX_LIMITS[quality];
  const [,accent,core]=PALETTES[theme];
  c.save();
  if(flash)stamp(c,texture(theme,'glow'),x,y,radius*1.25,radius,0,fade*.32);
  const safeRadius=Math.min(radius,Math.max(48,Math.min(x,900-x)-9));
  for(let i=0;i<(motion?rings:1);i++){
    const u=clamp((age-i*55)/445);
    if(age<i*55)continue;
    const r=safeRadius*(motion?.10+.90*ease(u):.68);
    c.globalAlpha=fade*(i?.54:.96);
    c.strokeStyle=i?accent:core;c.lineWidth=(1-u)*6+2;
    c.beginPath();c.ellipse(x,y,r,r*aspect,0,0,TAU);c.stroke();
  }
  if(motion){
    c.fillStyle=accent;c.globalAlpha=fade*.76;
    for(let i=0;i<particles;i++){
      const a=i*2.399+seed*TAU,dx=Math.cos(a),dy=Math.sin(a)*aspect;
      const r=safeRadius*ease(p)*(.46+.48*(i%7)/6);
      const px=x+dx*r,py=y+dy*r;
      if(i<6)drawTrail(c,theme,px,py,Math.atan2(dy,dx),36+64*(1-p),fade);
      else c.fillRect(px,py,2+(i%3),2);
    }
  }
  c.restore();
}

export function drawLightning(c,theme,x,y,age,seed,quality,motion){
  if(age<0||age>=240)return;
  const alpha=(1-age/240)**2;
  c.save();c.globalAlpha*=alpha;c.lineJoin='round';
  c.beginPath();c.moveTo(x-48,y-220);
  for(let i=1;i<=7;i++){
    const u=i/7,offset=Math.sin(seed*41+i*12.73)*28*Math.sin(Math.PI*u);
    c.lineTo(x-48*(1-u)+offset,y-220*(1-u));
  }
  c.strokeStyle=PALETTES[theme][0];c.lineWidth=8;c.stroke();
  c.strokeStyle=PALETTES[theme][2];c.lineWidth=2.5;c.stroke();
  if(motion&&quality!=='light'){
    c.globalAlpha*=.65;c.beginPath();c.moveTo(x-25,y-130);
    c.lineTo(x+21,y-108);c.lineTo(x+35,y-75);c.stroke();
  }
  c.restore();
}

export function drawDissolve(c,theme,x,y,age,seed,quality){
  const p=age/1400;
  if(p<0||p>=1)return;
  c.save();c.globalAlpha*=(1-p)*.7;c.fillStyle=PALETTES[theme][1];
  const count=VFX_LIMITS[quality].particles;
  for(let i=0;i<count;i++){
    const a=seed*TAU+i*2.399;
    const r=58+ease(p)*(65+i%5*16);
    c.fillRect(x+Math.cos(a)*r,y+Math.sin(a)*r*.57-p*85,2+i%3,2);
  }
  c.restore();
}
