// V3: shorten waiting beats independently; retain a shared authored action clock for visuals.
export const HX_BEATS=Object.freeze([[0,0],[1.8,3.05],[3.6,4.8],[4.6,5.8],[8,11.1],[9.1,12.45],[10.6,17],[13.8,20.8],[15,23.4],[15.6,24.05],[16.4,26.4],[17.5,27.6],[18.1,28.2],[18.55,28.65],[22.8,33],[26,36]].map(Object.freeze));
function clockMap(value,from,to){for(let i=1;i<HX_BEATS.length;i++){const a=HX_BEATS[i-1],b=HX_BEATS[i];if(value<=b[from])return a[to]+(b[to]-a[to])*hxClamp((value-a[from])/(b[from]-a[from]));}return HX_BEATS.at(-1)[to];}
export const hxActionTime=s=>clockMap(s,0,1);
export const hxRealTime=s=>clockMap(s,1,0);
export const HX_ACTION_TIMELINE=Object.freeze({duration:36000,strikeAt:.18,extractAt:3.05,forgeAt:3.05,carveAt:5,returnAt:9,mergeAt:11.1,giantAt:12.45,cleaveAt:17,absorbAt:23.4,swordEntryAt:24,shardsAt:24.05,shardsReturnAt:26.4,absorbComplete:27.6,impactAt:28.2,revealAt:28.65,settleAt:33});
export const HUYEN_TIEN_TIMELINE=Object.freeze(Object.fromEntries(Object.entries(HX_ACTION_TIMELINE).map(([key,value])=>[key,key==='duration'?26000:hxRealTime(value)])));
export const HX_SWORD_COUNT=36;
export function hxClamp(x){return Math.max(0,Math.min(1,x));}
export const hxEase=x=>{x=hxClamp(x);return x*x*(3-2*x);};
export const HX_STRIKES=Object.freeze([.18,1.02,2.65,6.4,7.5,8.6,11.12,13.2,14.72,16.05,17.13,18.24,19.35,21.08,22.05,23.05,24.05,25.12,26.22,28.2]);
export const hxPulse=(s,at,len=.55)=>s<at?0:Math.exp(-(s-at)*7/len)*hxEase((s-at)/.018);
export function huyenTienState(seconds,H=1600,motion=true){const s=Math.max(0,hxActionTime(seconds)),T=HX_ACTION_TIMELINE;return {seconds:s,actionSeconds:s,realSeconds:seconds,k:hxClamp(seconds/26),feet:H*.72,belly:H*.72-135,phase:s<1.3?'thunder-impact':s<3.05?'world-inversion':s<5?'sword-extraction':s<6?'guard-assembly':s<9.4?'guard-interception':s<11.1?'guard-channel':s<12.45?'sword-fusion':s<17?'giant-tempering':s<20.8?'heaven-cleave':s<23.4?'thunder-trial':s<24.05?'giant-entry':s<26.4?'recoil-shards':s<27.6?'shards-return':s<T.impactAt?'compression':s<T.revealAt?'impact':s<33?'reveal':'settle',revealed:s>=T.revealAt,impact:hxPulse(s,T.impactAt,2),motion};}
// Twelve anchored ribs, three blades per rib: all blades protect the cultivator before channeling into the keystone.
export function huyenGuardNode(i,s,H=1600,v={phase:0,flip:false}){const rib=i%12,layer=Math.floor(i/12),a=rib*TAU/12+(v.phase||0)*.15,rx=260+layer*30,ry=270+layer*32;return {x:450+Math.cos(a)*rx,y:H*.72-200+Math.sin(a)*ry};}
const TAU=Math.PI*2;
function orbit(i,s,H,v){const local=i%12,group=Math.floor(i/12),a=group*TAU/3+local*.058+(v.phase||0)*.6,th=a+(s-4.8)*(5.8+group*.65),radius=265+local*5+group*18,free={x:450+Math.cos(th)*radius,y:H*.48+Math.sin(th)*(135+group*35)},guard=huyenGuardNode(i,s,H,v),u=hxEase((s-5.35)/.65);return {x:free.x+(guard.x-free.x)*u,y:free.y+(guard.y-free.y)*u};}
export function huyenSwordPose(i,s,H=1600,v={phase:0,flip:false}){const a=i*Math.PI*2/HX_SWORD_COUNT+(v.phase||0)*.6,side=v.flip?-1:1,source={x:450+Math.cos(a)*330*side,y:H*.69+Math.sin(a)*110},body={x:450,y:H*.72-135},fusion={x:450,y:H*.31},extract=3.05+i*.035,mergeAt=11.1+(i%9)*.038+Math.floor(i/9)*.14;let p,alpha=1,size=i%12===0?210:135+(i%4)*8;
 const mix=(a,b,u)=>({x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u});
 if(s<extract)return {...source,alpha:0,size:0,angle:0,absorbed:false,merged:false};
 if(s<4.8){const u=hxEase((s-extract)/.17),end={x:source.x+Math.cos(a)*65*side,y:source.y-120};p=mix(source,end,u);const seek=hxEase((s-4.5)/.3);p=mix(p,orbit(i,4.8,H,v),seek);alpha=hxClamp((s-extract)/.035);}
 else if(s<mergeAt)p=orbit(i,s,H,v);
 else{const u=hxEase((s-mergeAt)/.3);p=mix(orbit(i,mergeAt,H,v),fusion,u);size=145*(1-u*.6);alpha=1-hxEase((u-.8)/.2);if(u>=1)return {...(s>=27.6?body:fusion),alpha:0,size:0,angle:Math.PI,absorbed:s>=27.6,merged:true};}
 const prev=s<4.8?source:orbit(i,s-.008,H,v),dx=p.x-prev.x,dy=p.y-prev.y;
 return {...p,alpha,size,angle:s>=6&&s<mergeAt?Math.atan2(p.y-(H*.72-200),p.x-450)+Math.PI/2:s>=mergeAt?Math.atan2(fusion.y-p.y,fusion.x-p.x)+Math.PI/2:Math.atan2(dy,dx)+Math.PI/2,absorbed:false,merged:false};}
export function huyenGiantPose(s,H=1600){let x=450,y=H*.31,angle=Math.PI,size=760,alpha=hxEase((s-11.55)/.75),entered=false;if(s<11.55)alpha=0;
 if(s>=12.45&&s<17){for(const [i,at]of [13.2,14.72,16.05].entries()){const hit=hxPulse(s,at,.8);y-=hit*48;angle+=hit*(i%2?1:-1)*.12;}}
 if(s>=17&&s<20.8){const cut=Math.min(2,Math.floor((s-17)/1.1)),age=s-(17+cut*1.1),u=hxEase(age/.19)*(1-hxEase((age-.42)/.25));angle=Math.PI+(cut%2?-1:1)*(u*1.25);x+=Math.sin(u*Math.PI)*100*(cut%2?-1:1);y+=u*80;}
 if(s>=23.4){const u=hxEase((s-23.4)/.6);x+=Math.sin(u*Math.PI)*90;y+=(H*.72-135-y)*u;size*=1-u*.94;alpha*=1-hxEase((u-.85)/.15);entered=u>=1;}
 return {x,y,size,angle,alpha,entered};}
