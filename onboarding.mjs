export function trackIntro(w,p,input,result,now){
 if(!result.ok||result.duplicate||result.pending||p.resident||p.puppet)return;
 if(p.intro&&p.realm>=1)finishIntro(w,p,now);
 if(!['join','cultivate','breakthrough'].includes(input.type))return;
 let started=false;
 if(!p.intro&&p.realm===0){p.intro={startedAt:now,activeStart:p.activeMs||0};w.introMetrics??={since:now,started:0,cultivated:0,advanced:0};w.introMetrics.started++;started=true;}
 if(!p.intro)return;
 if(started&&input.type==='join')return 'started';
 if(input.type==='cultivate'&&!p.intro.cultivatedAt){p.intro.cultivatedAt=now;w.introMetrics??={since:now,started:0,cultivated:0,advanced:0};w.introMetrics.cultivated++;return 'cultivated';}
 if(input.type==='breakthrough')finishIntro(w,p,now);
}
export function finishIntro(w,p,now){
 if(!p.intro||p.intro.advancedAt||p.realm<1)return;
 p.intro.advancedAt=now;w.introMetrics??={since:now,started:0,cultivated:0,advanced:0};w.introMetrics.advanced++;
}
