// Cosmetic receipts only: game rewards, race distance and tournament scores are owned by their existing rules.
export function recordEventGiftFx(w,p,event,now){
 const value=Number(event.coins)*Math.max(1,Number(event.count)||1);if(!Number.isFinite(value)||value<=0)return;
 const race=w.race,match=w.tournament?.current;
 const mode=race?.phase==='running'&&race.racers?.some(r=>r.id===p.id)?'race':w.tournament?.phase==='running'&&match&&now<match.endsAt?'duel':null;if(!mode)return;
 const owner=mode==='race'?race:match,entry={id:event.id,user:p.id,name:p.name,value,comboKey:event.comboKey,gift:event.gift,comboFinal:event.comboFinal,count:event.count||1,at:now,mode,boost:event.raceBoost||0,fighter:mode==='duel'?[match.a,match.b].includes(p.id):true};
 owner.giftFx??=[];owner.giftFx=owner.giftFx.filter(x=>now-x.at<15000);owner.giftFx.push(entry);if(owner.giftFx.length>16)owner.giftFx.splice(0,owner.giftFx.length-16);
 event.eventGiftFx=mode;return entry;
}
