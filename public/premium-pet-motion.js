// Anatomical animation baked into a shared atlas, so LIVE only draws one sprite per pet.
export const PREMIUM_PET_ATLAS={size:192,columns:8,frames:48,version:'living-v1'};
export const PREMIUM_PET_PERIODS={
 'bach-nguyet-ho':2400,'ngoc-chau-long':2800,'xich-ha-phuong':1800,
 'tu-nguyet-lan':2400,'hac-tinh-ho':2000
};
const smooth=(a,b,v)=>{const k=Math.max(0,Math.min(1,(v-a)/(b-a)));return k*k*(3-2*k);};
const bell=(x,y,cx,cy,rx,ry)=>Math.exp(-(((x-cx)/rx)**2+((y-cy)/ry)**2));
// Forward displacement in normalized sprite space. All joints blend smoothly into the body.
export function premiumPetWarp(id,x,y,phase){
 const s=Math.sin,co=Math.cos,p=phase*Math.PI*2,breath=s(p*2);
 let dx=(x-.53)*.012*breath,dy=(y-.56)*.012*breath;
 if(id==='bach-nguyet-ho'){
  const tails=1-smooth(.43,.72,x),wave=p+5*y+3*x;
  dx+=tails*.055*s(wave);dy+=tails*.072*co(wave+.6);
  const head=bell(x,y,.78,.38,.17,.22),paws=smooth(.62,.87,y)*smooth(.38,.7,x);
  dy+=head*.018*s(p)+paws*.03*s(p+8*x);dx+=paws*.017*co(p+8*x);
 }else if(id==='ngoc-chau-long'){
  const body=smooth(.1,.28,y)*(1-smooth(.82,.98,y));
  dx+=body*.047*s(p+6.5*y);dy+=body*.033*co(p+5*x);
  const mane=(1-smooth(.3,.65,x))*(1-smooth(.63,.9,y));
  dx+=mane*.025*s(p*2+11*y);dy+=mane*.027*co(p+7*x);
 }else if(id==='xich-ha-phuong'){
  const upper=1-smooth(.45,.68,y),left=(1-smooth(.35,.58,x))*upper,right=smooth(.6,.83,x)*upper;
  const flap=s(p),angle=left*.42*flap-right*.34*flap;
  dx+=-(y-.46)*angle;dy+=(x-.53)*angle;
  const tail=smooth(.52,.88,y)*(1-smooth(.53,.85,x));
  dx+=tail*.065*s(p+6*y);dy+=tail*.032*co(p+5*x);
 }else if(id==='tu-nguyet-lan'){
  const mane=bell(x,y,.33,.42,.3,.32),tail=(1-smooth(.28,.57,x))*smooth(.35,.7,y);
  dx+=mane*.019*s(p*2+9*y)+tail*.038*s(p+5*y);
  dy+=mane*.022*co(p+7*x)+tail*.055*co(p+4*x);
  const legs=smooth(.65,.88,y),stride=p+10*x;
  dx+=legs*.025*s(stride);dy-=legs*.04*Math.max(0,s(stride));
  dy+=bell(x,y,.75,.35,.18,.22)*.018*s(p);
 }else if(id==='hac-tinh-ho'){
  const tail=(1-smooth(.27,.47,x))*(1-smooth(.48,.7,y));
  dx+=tail*.055*s(p+7*y);dy+=tail*.042*co(p+6*y);
  const paws=smooth(.57,.87,y),stride=p+8*x;
  dx+=paws*.035*s(stride);dy-=paws*.045*Math.max(0,s(stride));
  dy+=bell(x,y,.76,.43,.15,.19)*.019*Math.max(0,s(p*2));
 }
 return {dx,dy};
}
export function petArtFrame(frames,t,seed=0,motion=true){
 if(!frames?.length)return null;
 if(frames.period)return frames[motion===false?0:Math.floor(((t+seed*97)%frames.period)/frames.period*frames.length)];
 const i=motion===false?0:[0,1,0,2][Math.floor((t+seed*97)/230)%4];
 return frames[i];
}

export function premiumPetPose(id,t,seed=0,motion=true){
 const period=PREMIUM_PET_PERIODS[id];if(!period)return null;
 if(motion===false)return {bob:0,sway:0,tilt:0};
 const p=(t+seed*97)/period*Math.PI*2,flying=id==='ngoc-chau-long'||id==='xich-ha-phuong';
 return {bob:Math.sin(p)*(flying?6:2.4),sway:Math.sin(p*.5)*(flying?5:2),tilt:Math.sin(p)*(flying?.045:.018)};
}
