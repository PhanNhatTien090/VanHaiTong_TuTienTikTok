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
