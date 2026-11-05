export const QUALITY={
  light:{seats:32,width:900,fps:24,poseFps:8,mesh:2,spriteScale:2,atmosphereFps:4,effects:2},
  balanced:{seats:48,width:1080,fps:30,poseFps:10,mesh:3,spriteScale:2.5,atmosphereFps:6,effects:4},
  high:{seats:60,width:1440,fps:30,poseFps:18,mesh:6,spriteScale:3,atmosphereFps:12,effects:8}
};
export class RenderBudget{
  constructor(mode='auto'){this.set(mode);this.mean=0;this.samples=0;this.changedAt=0;}
  set(mode){this.mode=['light','balanced','high'].includes(mode)?mode:'auto';this.level=this.mode==='auto'?'balanced':this.mode;this.config=QUALITY[this.level];}
  sample(ms,t,fps=30){if(!Number.isFinite(ms))return false;this.mean=this.samples?this.mean*.94+ms*.06:ms;this.samples++;
    if(this.mode!=='auto'||this.samples<45||t-this.changedAt<10000)return false;
    if(this.level==='balanced'&&(this.mean>25||fps>0&&fps<18)){this.level='light';this.config=QUALITY.light;this.changedAt=t;return true;}
    if(this.level==='light'&&this.mean<11&&fps>=22&&t-this.changedAt>30000){this.level='balanced';this.config=QUALITY.balanced;this.changedAt=t;return true;}return false;
  }
}
export function makeSurface(w,h){
  if(typeof OffscreenCanvas!=='undefined')return new OffscreenCanvas(w,h);
  if(typeof document!=='undefined'&&typeof document.createElement==='function'){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
  return null;
}
// One raster frame per actor, never an unbounded animation-frame history.
export class CharacterFrames{
  constructor(factory=makeSurface){this.frames=new Map();this.factory=factory;this.maxBytes=32*1024*1024;this.bytes=0;}
  draw(c,id,key,paint,scale=2){
    let f=this.frames.get(id);if(f&&f.scale<scale){this.bytes-=f.canvas.width*f.canvas.height*4;this.frames.delete(id);f=null;}
    if(!f){const canvas=this.factory(Math.round(120*scale),Math.round(150*scale));if(!canvas)return false;f={canvas,key:null,scale};this.frames.set(id,f);this.bytes+=canvas.width*canvas.height*4;while(this.frames.size>1&&(this.frames.size>64||this.bytes>this.maxBytes)){const key=this.frames.keys().next().value,old=this.frames.get(key);this.bytes-=old.canvas.width*old.canvas.height*4;this.frames.delete(key);}}
    // Refresh LRU on a hit; shrinking camera zoom reuses the larger raster.
    this.frames.delete(id);this.frames.set(id,f);
    if(f.key!==key){const x=f.canvas.getContext('2d');x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,f.canvas.width,f.canvas.height);x.setTransform(f.scale,0,0,f.scale,60*f.scale,115*f.scale);paint(x);f.key=key;}
    c.drawImage(f.canvas,-60,-115,120,150);return true;
  }
  clear(){this.frames.clear();this.bytes=0;}
}

export function actorSample(t,fps,id,motion=true){
  if(!motion)return {tick:0,at:0};
  let hash=0;for(const ch of String(id))hash=(Math.imul(hash,31)+ch.charCodeAt(0))|0;
  hash^=hash>>>16;hash=Math.imul(hash,0x7feb352d);hash^=hash>>>15;hash=Math.imul(hash,0x846ca68b);hash^=hash>>>16;
  const period=1000/fps,phase=(Math.abs(hash)%997)/997*period;
  const tick=Math.floor((t+phase)/period);
  return {tick,at:Math.max(0,tick*period-phase)};
}
export class BitmapCache{
  constructor(limit=64,factory=makeSurface){this.limit=limit;this.factory=factory;this.items=new Map();}
  get(key,width,height,paint){
    const found=this.items.get(key);if(found){this.items.delete(key);this.items.set(key,found);return found;}
    const canvas=this.factory(width,height);if(!canvas)return null;
    paint(canvas.getContext('2d'));this.items.set(key,canvas);
    while(this.items.size>this.limit)this.items.delete(this.items.keys().next().value);
    return canvas;
  }
}

// Retain fractional frame time, so a 30fps cap does not accidentally fall to 20fps on a 60Hz display.
export class FrameClock{
  constructor(){this.last=null;}
  ready(t,fps){const interval=1000/fps;if(this.last===null){this.last=t;return true;}const elapsed=t-this.last;if(elapsed+.1<interval)return false;this.last+=Math.max(1,Math.floor((elapsed+.1)/interval))*interval;return true;}
}
export function inView(target,camera,height){const s=camera?.s||1,x=target.x*s+(camera?.x||0),y=target.y*s+(camera?.y||0),r=(target.scale||1.4)*s;return x+65*r>=0&&x-65*r<=900&&y+45*r>=0&&y-120*r<=height;}

// Backing pixels follow the selected output size, not the editor pane's CSS size.
export function renderDimensions(rect,config,preview=false,maxWidth=Infinity){if(!(rect.width>0&&rect.height>0))return null;const width=preview?720:Math.min(maxWidth,config?.width||1080);return {width,height:Math.max(1,Math.round(width*rect.height/rect.width))};}
