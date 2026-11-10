// Single source of truth for activities that occupy the main stage.
// Sky rewards present three winners sequentially, so keep the stage for 30s.
export const SKY_SETTLEMENT_MS=30000;
export const skyStageUntil=(w,now)=>w.flowerEvent?Math.max(w.flowerEvent.endsAt,w.flowerEvent.closedAt||now)+SKY_SETTLEMENT_MS:0;
export function stageConflict(w,now,{allowBond=false}={}){
 if(skyStageUntil(w,now)>now)return now<w.flowerEvent.endsAt?'sao băng / mưa hoa':'trao thưởng sao băng / mưa hoa';
 if(w.boss?.hp>0&&w.boss.endsAt>now)return 'yêu thú';
 if(!w.visitor?.closedAt&&w.visitor?.endsAt>now)return 'tiên nhân';
 if(!w.opportunity?.closedAt&&w.opportunity?.endsAt>now)return 'cơ duyên';
 if(!allowBond&&!w.bondFestival?.closedAt&&w.bondFestival?.endsAt>now)return 'lễ hội kết duyên';
 if(['registration','running'].includes(w.race?.phase)||w.race?.podiumUntil>now)return 'đua phi kiếm';
 if(['registration','running'].includes(w.sectWar?.phase)||w.sectWar?.podiumUntil>now)return 'chính ma đại chiến';
 if(['opening','brewing','tribulation'].includes(w.alchemy?.phase)||w.alchemy?.podiumUntil>now)return 'lò luyện đan';
 if(['registration','running'].includes(w.maze?.phase)||w.maze?.podiumUntil>now)return 'bí cảnh mê cung';
 if(w.bonkFest&&!w.bonkFest.closedAt&&now<w.bonkFest.endsAt)return 'hội gõ đầu';
 if(['registration','running'].includes(w.tournament?.phase)||w.tournament?.podiumUntil>now)return 'tỷ thí';
 if(w.social?.activeCeremony?.endsAt>now)return 'lễ kết duyên';
 return null;
}
