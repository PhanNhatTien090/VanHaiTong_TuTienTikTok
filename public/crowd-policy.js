export function validViewerCount(value){if(value===null||value===undefined||value==='')return null;const n=Number(value);return Number.isInteger(n)&&n>=0&&n<=1000000?n:null;}
export function observeViewerCount(connection,event,now=Date.now()){
 if(event?.event!=='roomUser')return false;const count=validViewerCount(event.data?.viewerCount);if(count===null)return false;connection.viewerCount=count;connection.viewerCountAt=now;return true;
}
export function liveAudienceCount(state,now=Date.now()){
 const c=state.connection,count=validViewerCount(c?.viewerCount);
 if(state.mode!=='demo'&&count!==null&&Number.isFinite(c?.viewerCountAt)&&now-c.viewerCountAt>=0&&now-c.viewerCountAt<120000)return count;
 return (state.players||[]).filter(p=>p.active&&!p.resident&&!p.puppet).length;
}
export const audienceTier=count=>count>20?21:count>=20?20:count>=15?15:count>=10?10:0;

// Active profiles can outnumber viewers. Count candidates for the actual rendering path.
export const MAZE_SPRITE_CAP=40;
export function plannedActorCount(state,eligible,residents=0){
 if(state.hallWar?.active)return Math.min(15,state.hallWar.members?.length||0);
 if(state.maze?.active)return Math.min(MAZE_SPRITE_CAP,eligible,(state.maze.runners||[]).reduce((n,r)=>n+Number(!r.f),0));
 if(state.raceStatus?.active)return Math.min(12,(state.raceStage?.length||0)+(state.raceStatus.racers?.length||0),eligible);
 const eventActors=state.warStage?.length||state.alchemyStage?.length||state.socialStage?.length;
 if(eventActors)return eventActors;
 return Math.min(50,eligible+(eligible<15?residents:0));
}
export function keepCrowdFlag(count,previous,threshold){
 return count>=threshold||(previous&&count>threshold-4)||false;
}
