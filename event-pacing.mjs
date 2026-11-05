import {stageConflict} from './stage-lock.mjs';
export function automaticEventsPaused(w,now){
 const hunt=w.settings?.huntBeforeCompetition&&w.settings?.scheduledCompetitions&&w.competitionSchedule?.huntStartedAt&&w.competitionSchedule?.huntForAt===w.competitionSchedule?.nextAt&&now<w.competitionSchedule.nextAt;
 if(!w.settings?.eventSpacing)return !!hunt;
 const pacing=w.eventPacing??={lastOccupiedAt:now};
 // 4/11: câu đố/lì xì là sự kiện nhỏ chạy dày 1–2 phút — không tính là 'đang bận' để không chặn sự kiện lớn.
 const active=stageConflict(w,now)||
  (w.lastCeremonyAt||0)+12000>now||(w.lastBlessingAt||0)+22000>now;
 if(active){pacing.lastOccupiedAt=now;pacing.wasOccupied=true;}
 else if(pacing.wasOccupied){pacing.lastOccupiedAt=now;pacing.wasOccupied=false;}
 return !!active||!!hunt||now<pacing.lastOccupiedAt+60000; // 4/11: nghỉ 1 phút giữa các sự kiện (trước 3, ban đầu 8)
}
export function configureEventSpacing(w,enabled,now){
 w.settings??={};w.settings.eventSpacing=enabled;if(!enabled)return;
 Object.assign(w.settings,{autoEventMinutes:35,bossInterval:1800,ceremonyMinutes:60,blessingMinutes:45,quizMinutes:25,envelopeMinutes:30});
 w.eventPacing={lastOccupiedAt:now};w.nextAutoEventAt=now+35*60000;w.nextBossAt=now+12*60000;
 w.nextQuizAt=now+25*60000;w.nextEnvelopeAt=now+30*60000;w.lastCeremonyAt=now;w.lastBlessingAt=now;
 if(w.competitionSchedule)w.competitionSchedule.nextAt=Math.max(w.competitionSchedule.nextAt,now+20*60000);
}
