// Presentation safeguards, not a claim of TikTok approval or gift verification.
export const isNPC=p=>!!(p?.puppet||p?.resident||p?.actorKind==='npc');
export const liveRulesActive=s=>s?.liveIntegrityVersion===1&&s.mode==='live'&&s.settings?.engagementRewards!==true;
export const displayActorName=p=>{const name=String(p?.name||'Đạo hữu');return isNPC(p)?name.replace(/^NPC\s*·\s*/,'').replace(/\s*·\s*NPC$/,''):name;};
export const actorLabel=p=>(isNPC(p)?'NPC · ':'')+(p?.name||'Đạo hữu');
export function eventAllowedOnLive(e,players=[]){
  if(e?.simulated||e?.autoRose)return false;
  const p=Array.isArray(players)?players.find(p=>p.id===e?.user):players?.[e?.user];
  return !((e?.gift||e?.engagementAction)&&(isNPC(p)||e?.actorKind==='npc'));
}
export function streamState(s,mode=s.mode){
  if(mode!=='live')return s;
  const players=s.players||[],byId=new Map(players.map(p=>[p.id,p]));
  const prepare=e=>{const p=byId.get(e.user);return isNPC(p)||e.actorKind==='npc'?{...e,actorKind:'npc',name:displayActorName(p||{name:e.name,actorKind:'npc'})}:e;};
  return {...s,events:(s.events||[]).filter(e=>eventAllowedOnLive(e,players)).map(prepare),
    feed:(s.feed||[]).filter(e=>eventAllowedOnLive(e,players)).map(prepare)};
}
export function participantCounts(players=[]){
  const active=players.filter(p=>p.active);
  return {players:active.filter(p=>!isNPC(p)).length,npcs:active.filter(isNPC).length};
}
