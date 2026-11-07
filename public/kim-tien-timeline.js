export const KIM_TIEN_TIMELINE=Object.freeze({duration:28000,wakeAt:.12,petalsAt:1.25,closeAt:4.2,trialAt:6.8,meltAt:10.2,fractureAt:13.5,recastAt:15.3,sealAt:16.4,entryAt:18.4,absorbComplete:19.6,impactAt:20.2,revealAt:20.65,rebirthAt:21,returnAt:25.4});
export const KIM_TRIALS=Object.freeze([7.05,8.16,9.33]);
export const ktClamp=x=>Math.max(0,Math.min(1,x));
export function ktEase(x){x=ktClamp(x);return x*x*(3-2*x);}
export const ktPulse=(s,t,span=.65)=>s<t?0:ktEase((s-t)/.018)*Math.exp(-(s-t)*6/span);
export function kimTienState(seconds,H=1600,motion=true){const T=KIM_TIEN_TIMELINE,s=ktClamp(seconds/28)*28;return {seconds:s,k:s/28,feet:H*.76,belly:H*.76-145,motion,revealed:s>=T.revealAt,impact:ktPulse(s,T.impactAt,1.8),phase:s<1.25?'gold-veins':s<4.2?'lotus-rising':s<6.8?'furnace-lock':s<10.2?'heaven-fire':s<13.5?'molten-meridians':s<15.3?'furnace-fracture':s<16.4?'lotus-recast':s<18.4?'heart-forging':s<19.6?'heart-entry':s<20.2?'compression':s<20.65?'furnace-burst':s<25.4?'immortal-bloom':'golden-dawn'};}
const TAU=Math.PI*2;
export function kimPetalPose(i,s,H=1600,v={phase:0,flip:false}){const a=i*TAU/8+(v.phase||0)*.12,feet=H*.76,spawn=1.25+i*.105,rise=ktEase((s-spawn)/.3),close=ktEase((s-4.2-i*.07)/.27),back=ktEase((s-15.3-i*.045)/.32),shatter=ktEase((s-13.5-i*.025)/.22)*(1-back),born=ktEase((s-21-i*.09)/.33),after=s>=20.2,age=Math.max(0,s-20.2),fade=1-ktEase((s-26.5)/1.5);let x=450+Math.cos(a)*(260-close*80),y=feet-40+Math.sin(a)*82-close*220,angle=(a+Math.PI/2)*(1-close)+Math.cos(a)*.23*close,alpha=rise,width=145+rise*45,height=350+close*140;
 const hit=KIM_TRIALS.reduce((n,t)=>n+ktPulse(s,t+i*.009,.6),0);x+=Math.cos(a)*(shatter*155-hit*18);y+=Math.sin(a)*shatter*90+Math.sin(s*31+i)*hit*5;angle+=shatter*(i%2?1:-1)*.7;
 if(s>=16.4){const u=ktEase((s-16.4)/.7);x+=(450-x)*u;y+=(H*.46-y)*u;width*=1-u*.82;height*=1-u*.82;alpha*=1-ktEase((s-18.35)/.25);}
 if(after){x=450+Math.cos(a)*(270*born+age*3);y=feet-12+Math.sin(a)*82*born-(1-born)*240;angle=(a+Math.PI/2)*born;width=170*born;height=350*born;alpha=born*fade;}
 return {x,y,angle,width,height,alpha,front:Math.sin(a)>.1,a,heat:ktEase((s-6.8)/3),crack:ktEase((s-8)/2),shattered:shatter};}
export function kimHeartPose(s,H=1600){const formed=ktEase((s-16.4)/.6),u=ktEase((s-18.4)/1.2),start={x:450,y:H*.46},end={x:450,y:H*.76-145};return {x:start.x+Math.sin(u*Math.PI)*70,y:start.y+(end.y-start.y)*u,size:(64+formed*22)*(1-u*.8),alpha:s>=19.6?0:formed*(1-ktEase((s-19.55)/.05)),entered:s>=19.6};}
