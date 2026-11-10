const SYSTEM_EVENTS=new Set(['visitor','boss','race','tournament','social','bond','flower','opportunity','blessing']);
export function isEventAnnouncement(e){if(!e||e.resident||e.summary)return false;return !!(e.bonkStart||e.bonkEnd||e.teasePair||e.mazeStart||e.mazeRun||e.mazeFinishRank||e.mazeEnd||e.alchemyStart||e.alchemyTribStart||e.alchemyExplode||e.alchemyEnd||e.warStart||e.warBattle||e.warOmen||e.warRescue||e.warEnd||e.warTurn||e.warFinal||e.warGeneral||e.raceGiftRank||e.lanternStart||e.lanternEnd||e.lanternBloom||e.petStart||e.petEnd||e.petAward||e.visitorStart||e.visitorEnd||e.flowerStart||e.flowerEnd||e.opportunityStart||e.opportunityEnd||e.duelStart||e.tournamentChampion||e.bondCeremony||e.envelopeStart||e.envelopeEnd||e.quizStart||e.quizEnd||e.ceremony||!e.user&&SYSTEM_EVENTS.has(e.effect)||e.effect==='race'&&String(e.text).startsWith('VÂN HẢI KIẾM VƯƠNG'));}
export class EventAnnouncementHistory{
 constructor(limit=64,ttl=120000){this.limit=limit;this.ttl=ttl;this.rows=new Map();}
 remember(events,now=Date.now()){for(const e of events||[])if((isEventAnnouncement(e)||e.engagementAction||e.autoArrival||e.gift&&e.coins>0)&&e.id&&now-e.at<this.ttl)this.rows.set(e.id,e);for(const [id,e]of this.rows)if(now-e.at>=this.ttl)this.rows.delete(id);while(this.rows.size>this.limit)this.rows.delete(this.rows.keys().next().value);}
 recent(now=Date.now()){this.remember([],now);return [...this.rows.values()];}
 get(id,now=Date.now()){this.remember([],now);return this.rows.get(id);}
}
