const ZERO=Object.freeze({x:0,y:0});
const STRENGTH={off:0,low:.38,medium:.68,high:1};
const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));

export function impactProgress(progress,impact,span){
  const age=progress-impact;
  return age>=0&&age<span?age/span:-1;
}

export function feedbackBudget(scene){
  return scene.budget?.pressured||scene.budget?.level==='light'||scene.heavyCrowd;
}

export function cameraShakeStrength(scene){
  if(scene.motion===false||!scene.cameraEnabled)return 0;
  return STRENGTH[scene.shakeLevel??'low']??STRENGTH.low;
}

export function giftCameraImpulse(scene,event,t){
  const strength=cameraShakeStrength(scene);
  if(!event||!strength||event.value<500)return ZERO;
  const phase=impactProgress((t-event.start)/event.profile.duration,.3,.12);
  if(phase<0)return ZERO;
  const cap=feedbackBudget(scene)?6:12;
  const amplitude=Math.min(cap,4+Math.log2(event.value/500)*2)*strength*(1-phase)**2;
  return {x:amplitude*Math.sin(phase*15+1.57)*(event.mode==='duel'?-1:1),y:-amplitude*.55*Math.cos(phase*19)};
}

export function boundedCameraJolt(base,jolt,H,allowPadding=false){
  const cap=12;
  const dx=clamp(jolt.x||0,-cap,cap),dy=clamp(jolt.y||0,-cap,cap);
  if(!dx&&!dy)return base;
  const padding=allowPadding?Math.max(Math.abs(dx)/420,Math.abs(dy)/(H*.46)):0;
  const scale=base.s+padding;
  return {s:scale,x:clamp(base.x-450*padding+dx,900*(1-scale),0),
    y:clamp(base.y-H*.5*padding+dy,H*(1-scale),0)};
}

// Keep both visual passes on one wall-clock timeline and consume cues once.
export function takeFeedbackCue(event,key,progress,at,expires=1){
  if(event[key]||progress<at)return false;
  event[key]=true;
  return progress<=expires;
}

// Reserve full-screen light for a single authored beat. Local rings, trails and
// character layers render independently of the accessibility setting.
export function drawScreenPulse(c,H,reduced,color,alpha,blend='lighter'){
  if(reduced||alpha<=.01)return;
  c.save();
  c.globalCompositeOperation=blend;
  c.globalAlpha=clamp(alpha,0,1);
  c.fillStyle=color;
  c.fillRect(0,0,900,H);
  c.restore();
}
