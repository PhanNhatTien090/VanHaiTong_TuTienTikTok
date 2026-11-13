// Eight individually drawn anatomical poses, with no mesh deformation or image warping.
export const PREMIUM_PET_ATLAS={size:192,columns:4,frames:8,version:'drawn-v2'};
export const PREMIUM_PET_PERIODS={'bach-nguyet-ho':880,'ngoc-chau-long':1440,'xich-ha-phuong':960,'tu-nguyet-lan':960,'hac-tinh-ho':800};
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
