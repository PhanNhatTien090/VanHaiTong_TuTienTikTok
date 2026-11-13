// Single source of truth for activities that occupy the main stage.
// Sky rewards present three winners sequentially, so keep the stage for 30s.
export const SKY_SETTLEMENT_MS=30000;
export const skyStageUntil=(w,now)=>w.flowerEvent?Math.max(w.flowerEvent.endsAt,w.flowerEvent.closedAt||now)+SKY_SETTLEMENT_MS:0;
export function stageConflict(w,now,{allowBond=false,allowHall=false,allowPet=false}={}){
 if(['registration','running'].includes(w.hallWar?.phase)||w.hallWar?.podiumUntil>now)return 'Ngũ Đường Tranh Phong';
 if(!allowHall&&w.nguDuong?.match?.endsAt>now)return 'Vân Đài thách đấu';
 if(skyStageUntil(w,now)>now)return now<w.flowerEvent.endsAt?'sao băng / mưa hoa':'trao thưởng sao băng / mưa hoa';
 if(w.boss?.hp>0&&w.boss.endsAt>now)return 'yêu thú';
 if(!w.visitor?.closedAt&&w.visitor?.endsAt>now)return 'tiên nhân';
 if(!w.opportunity?.closedAt&&w.opportunity?.endsAt>now)return 'cơ duyên';
 if(!allowBond&&!w.bondFestival?.closedAt&&w.bondFestival?.endsAt>now)return 'lễ hội kết duyên';
 if(['registration','running'].includes(w.race?.phase)||w.race?.podiumUntil>now)return 'đua phi kiếm';
 if(['registration','running'].includes(w.sectWar?.phase)||w.sectWar?.podiumUntil>now)return 'chính ma đại chiến';
 if(['opening','brewing','tribulation'].includes(w.alchemy?.phase)||w.alchemy?.podiumUntil>now)return 'lò luyện đan';
 if(['registration','running'].includes(w.maze?.phase)||w.maze?.podiumUntil>now)return 'bí cảnh mê cung';
 if(!allowPet&&w.petEvent&&!w.petEvent.closedAt&&w.petEvent.endsAt>now)return 'Linh Thú Cốc';
 if(w.tower?.endsAt>now&&!w.tower.closedAt)return 'Vân Hải Tháp';
 if(w.honorStageUntil>now)return 'đại điển vinh danh';
 if(['registration','running'].includes(w.tournament?.phase)||w.tournament?.podiumUntil>now)return 'tỷ thí';
 if(w.social?.activeCeremony?.endsAt>now)return 'lễ kết duyên';
 if(!w.lanternFestival?.closedAt&&w.lanternFestival?.endsAt>now)return 'Đêm Đèn Đồng Môn';
 return null;
}
