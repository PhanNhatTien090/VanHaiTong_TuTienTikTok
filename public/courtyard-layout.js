import {SCENES} from './world-rotation.js';
import {layoutPlayers} from './cosmetics.js';
// Use exactly the same cover crop for artwork and its seating coordinates.
export function artworkCrop(iw,ih,H){
 const target=900/H,ratio=iw/ih;let sx=0,sy=0,sw=iw,sh=ih;
 if(target>ratio){sh=iw/target;sy=(ih-sh)*.52;}else{sw=ih*target;sx=(iw-sw)/2;}
 return {sx,sy,sw,sh};
}
export function projectedGround(environment,H,art){
 const cfg=SCENES.find(e=>e.id===environment?.id),area=environment?.ground||cfg?.ground;
 if(!area)return null;
 const iw=art?.naturalWidth||art?.width||900,ih=art?.naturalHeight||art?.height||1600,{sx,sy,sw,sh}=artworkCrop(iw,ih,H);
 return {cx:(area.cx*iw-sx)/sw*900,cy:(area.cy*ih-sy)/sh*H,rx:area.rx*iw/sw*900,ry:area.ry*ih/sh*H};
}
export function constrainGroundTargets(targets,g){
 if(!g)return targets;
 for(const a of targets){
  const foot=40*a.scale,padding=8,reach=Math.max(20,g.rx-35*a.scale);
  a.x=Math.max(g.cx-reach,Math.min(g.cx+reach,a.x));
  const edge=g.ry*Math.sqrt(Math.max(0,1-((a.x-g.cx)/g.rx)**2));
  a.groundMinY=g.cy-edge+8-foot;a.groundMaxY=g.cy+edge-padding-foot;
  a.y=Math.max(a.groundMinY,Math.min(a.groundMaxY,a.y));
 }
 return targets;
}
export function courtyardTargets(players,H,floorY,environment,art){
 const g=projectedGround(environment,H,art);if(!g)return layoutPlayers(players,H,floorY);
 const targets=layoutPlayers(players,H,g.cy);if(!targets.length)return targets;
 const foot=40*targets[0].scale;
 const top=g.cy-g.ry+45,bottom=g.cy+g.ry-foot-12,center=(top+bottom)/2;
 const span=Math.max(...targets.map(a=>a.y))-Math.min(...targets.map(a=>a.y)),fit=span>0?Math.min(1,Math.max(0,bottom-top)/span):1;
 for(const a of targets)a.y=center+(a.y-g.cy)*fit;
 return constrainGroundTargets(targets,g);
}
