// Chính Ma Đại Chiến (07/11/2026) — hai phe kéo co chiến tuyến 0..100 (50 giữa; 100 = Chính Đạo thắng, 0 = Ma Đạo thắng).
// Thiết kế cho LIVE vài chục người, Ma Đạo thường đông hơn: Chính khí ×1,15, bù quân số cho phe ít người (tối đa ×1,8),
// mỗi phe một lần "cứu nguy" khi bị dồn sát thua (Chính sớm hơn), sau đó phản kích ×1,6 trong 20 s.
// Quà (sửa 07/11 khuya — Ma tặng nhiều bông vẫn thua): quà đẩy ĐỦ theo coin, không còn phụ thuộc lượng tim của phe;
// quà không nhân bù quân số/Chính khí (chỉ thiên tượng + phản kích). Trần chống "1 quà to kết thúc trận": mỗi phe 36 đơn vị quà / 30 s.
// 1 coin = 3 đơn vị (= 30 tim). Bù quân số giảm còn tối đa ×1,2, Chính khí ×1,05.
import {stageConflict} from './stage-lock.mjs';
// 08/11: đẩy mạnh hơn (unit .5 → .85) + lò xo kéo chiến tuyến về giữa 3,5%/giây → giằng co qua lại rõ, trận vẫn đủ 2 phút.
export const WAR=Object.freeze({registerMs:30000,battleMs:120000,podiumMs:20000,pullBack:.035,
 unit:.85,heartsPerUnit:10,heartCapUnits:4,heartWindowMs:5000,strikeUnits:1.5,strikeCooldownMs:8000,giftUnitsPerCoin:3,giftWindowMs:30000,giftCapUnits:36,
 chinhBonus:1.05,maxSizeBonus:1.2,rescue:{chinh:20,ma:15},rescuePush:15,rescueBoostMs:20000,rescueBoost:1.6,
 omenEveryMs:40000,omenMs:15000,winGap:2,reward:{win:300,lose:90,draw:150,stones:30,top:[400,250,150]},titleMs:24*3600000});
export const SIDES=Object.freeze({chinh:{name:'Chính Đạo',general:'Chính Đạo Minh Chủ',rescue:'Hạo Nhiên Chính Khí'},ma:{name:'Ma Đạo',general:'Ma Đạo Tôn Chủ',rescue:'Ma Hồn Bất Diệt'}});
export const OMENS=Object.freeze({'golden-sun':{name:'Kim Dương',text:'KIM DƯƠNG CHIẾU RỌI • Chính Đạo mạnh lên',chinh:1.3,ma:1,weight:35},'blood-moon':{name:'Huyết Nguyệt',text:'HUYẾT NGUYỆT TREO CAO • Ma Đạo mạnh lên',chinh:1,ma:1.3,weight:25},chaos:{name:'Hỗn Chiến',text:'HỖN CHIẾN • cả hai phe lực đẩy gấp đôi',chinh:2,ma:2,weight:25},mist:{name:'Sương Mù',text:'SƯƠNG MÙ PHỦ CHIẾN TRƯỜNG • không thấy chiến tuyến',chinh:1,ma:1,weight:15}});
const CHINH=['chinh','chinhdao','cd','chinhphai'],MA=['ma','madao','md','maphai'];
const other=s=>s==='chinh'?'ma':'chinh';
const real=p=>p&&!p.resident&&!p.puppet;
export const warActive=w=>['queued','registration','running'].includes(w.sectWar?.phase);
export const warVisible=(w,now)=>['registration','running'].includes(w.sectWar?.phase)||w.sectWar?.podiumUntil>now;
const announce=(w,p,text,now,c,extra={})=>c.emit(w,p,text,'war',now,{sectWar:true,...extra});
function fx(e,now,row){e.fx??=[];e.fx.push({id:e.id+':'+(e.fxSeq=(e.fxSeq||0)+1),at:now,...row});if(e.fx.length>16)e.fx.splice(0,e.fx.length-16);}
function register(w,now,c){
 w.sectWar={id:'war-'+now,phase:'registration',registrationEndsAt:now+WAR.registerMs,line:50,members:{},rescued:{chinh:false,ma:false},boostUntil:{chinh:0,ma:0},gifts:[],fx:[],omen:null,repeat:false};
 announce(w,null,'CHÍNH MA ĐẠI CHIẾN • gõ chinh vào Chính Đạo • gõ ma vào Ma Đạo • thả tim để đẩy chiến tuyến',now,c,{warStart:true});
}
export function startWar(w,now,c){if(warActive(w))return {ok:false,message:'Đại chiến đang diễn ra.'};
 if(stageConflict(w,now)){w.sectWar={id:'war-q'+now,phase:'queued'};announce(w,null,'Chính Ma Đại Chiến đã xếp lịch • tự mở sau hoạt động hiện tại',now,c);return {ok:true,queued:true};}
 register(w,now,c);return {ok:true};}
export function stopWar(w,now,c){const e=w.sectWar;if(!e||!warActive(w))return {ok:false,message:'Không có đại chiến đang mở.'};e.phase='cancelled';e.podiumUntil=0;announce(w,null,'Đại chiến tạm dừng • chưa trao thưởng',now,c);return {ok:true};}
export const warCount=(e,side)=>Object.values(e?.members||{}).filter(m=>m.side===side).length;
// Hệ số lực đẩy của một phe tại thời điểm now.
export function warMultiplier(e,side,now,gift=false){
 const own=Math.max(1,warCount(e,side)),opp=warCount(e,other(side)),size=Math.min(WAR.maxSizeBonus,Math.max(1,opp/own));
 const omen=e.omen&&now<e.omen.until?OMENS[e.omen.kind]?.[side]||1:1,boost=e.boostUntil?.[side]>now?WAR.rescueBoost:1;
 return gift?omen*boost:(side==='chinh'?WAR.chinhBonus:1)*size*omen*boost;
}
function join(w,e,p,side,now,c,auto=false){
 if(!real(p))return null;if(e.members[p.id])return e.members[p.id];
 const m=e.members[p.id]={side,name:p.name,at:now,score:0,hearts:0,heartWindow:0,heartUnits:0,lastStrike:0};
 p.interactions=(p.interactions||0)+1;w.totalInteractions=(w.totalInteractions||0)+1;
 announce(w,p,(auto?'Tự gia nhập ':'Gia nhập ')+SIDES[side].name+' • thả tim để đẩy chiến tuyến',now,c,{warJoin:side});return m;
}
// Đẩy chiến tuyến; trả về số điểm chiến tuyến thực sự dịch chuyển.
function push(w,e,side,units,now,c,gift=false){
 if(e.phase!=='running'||units<=0)return 0;const delta=units*WAR.unit*warMultiplier(e,side,now,gift),before=e.line;
 e.line=Math.max(0,Math.min(100,e.line+(side==='chinh'?delta:-delta)));
 return Math.abs(e.line-before);
}
// Cứu nguy: phe bị dồn sát thua được trời giúp một lần mỗi trận.
function checkRescue(w,e,now,c){
 if(e.phase!=='running')return;
 for(const side of ['chinh','ma']){if(e.rescued[side])continue;const danger=side==='chinh'?e.line<=WAR.rescue.chinh:e.line>=100-WAR.rescue.ma;if(!danger)continue;
  e.rescued[side]=true;e.line=Math.max(0,Math.min(100,e.line+(side==='chinh'?WAR.rescuePush:-WAR.rescuePush)));e.boostUntil[side]=now+WAR.rescueBoostMs;
  fx(e,now,{kind:'rescue',side});announce(w,null,SIDES[side].rescue.toUpperCase()+' • '+SIDES[side].name+' phản kích',now,c,{warRescue:side});}
}
function finishIfDone(w,e,now,c){
 if(e.phase!=='running')return;const timeUp=now>=e.endsAt;if(!(e.line>=100||e.line<=0||timeUp))return;
 const winner=e.line>=100||timeUp&&e.line>50+WAR.winGap?'chinh':e.line<=0||timeUp&&e.line<50-WAR.winGap?'ma':null;
 e.phase='finished';e.finishedAt=now;e.podiumUntil=now+WAR.podiumMs;e.result={winner,line:e.line,early:!timeUp};award(w,e,now,c);
 const lead=winner?warTop(e,winner,1)[0]:null;announce(w,null,winner?SIDES[winner].name.toUpperCase()+' ĐẠI THẮNG • cả phe nhận tu vi':'BẤT PHÂN THẮNG BẠI • hai phe cùng nhận thưởng',now,c,{warEnd:winner||'draw',warLead:lead?.name||null});
 w.nextBossAt=now+(w.settings?.bossInterval??240)*1000;
}
export function warTop(e,side,n=5){return Object.entries(e?.members||{}).filter(([,m])=>m.side===side&&m.score>0).sort((a,b)=>b[1].score-a[1].score||a[1].at-b[1].at).slice(0,n).map(([id,m])=>({id,name:m.name,score:Math.round(m.score)}));}
function award(w,e,now,c){
 if(e.awarded)return;e.awarded=true;const winner=e.result?.winner;e.rewards=[];
 for(const [id,m] of Object.entries(e.members)){const p=w.players[id];if(!real(p)||m.score<=0)continue;const base=!winner?WAR.reward.draw:m.side===winner?WAR.reward.win:WAR.reward.lose;const qi=c.gain(w,p,base,WAR.reward.stones,0,now);e.rewards.push({id,qi});}
 // 07/11/2026: bảng vinh danh — lưu phần thưởng thật từng phe + top 3 để hiện lúc kết thúc.
 const got=Object.fromEntries(e.rewards.map(r=>[r.id,r.qi]));e.result.honor={side:{chinh:{qi:!winner?WAR.reward.draw:winner==='chinh'?WAR.reward.win:WAR.reward.lose,stones:WAR.reward.stones},ma:{qi:!winner?WAR.reward.draw:winner==='ma'?WAR.reward.win:WAR.reward.lose,stones:WAR.reward.stones}},top:{chinh:[],ma:[]}};
 for(const side of ['chinh','ma'])warTop(e,side,3).forEach((t,i)=>{const p=w.players[t.id];if(!real(p))return;const extra=c.gain(w,p,WAR.reward.top[i],0,0,now);e.result.honor.top[side].push({id:t.id,name:t.name,score:t.score,qi:(got[t.id]||0)+(extra||0),title:i===0?SIDES[side].general:null});if(i===0){p.warTitle={name:SIDES[side].general,side,until:now+WAR.titleMs};announce(w,p,SIDES[side].general.toUpperCase()+' • tướng đứng đầu '+SIDES[side].name,now,c,{warGeneral:side});}});
}
export function tickWar(w,now,c){
 const e=w.sectWar;if(!e)return;
 if(e.phase==='queued'){if(!stageConflict(w,now))register(w,now,c);return;}
 if(e.phase==='registration'&&now>=e.registrationEndsAt){
  if(Object.keys(e.members).length<2){e.phase='finished';e.podiumUntil=0;e.result={winner:null,line:50,empty:true};announce(w,null,'Chưa đủ người ra trận • hẹn lượt đại chiến sau',now,c);return;}
  e.phase='running';e.startedAt=now;e.endsAt=now+WAR.battleMs;e.nextOmenAt=now+WAR.omenEveryMs-10000;
  announce(w,null,'KHAI CHIẾN • thả tim đẩy chiến tuyến • gõ chien để xuất chiêu',now,c,{warBattle:true});}
 if(e.phase==='running'){
  if(now>=e.nextOmenAt&&now<e.endsAt-10000){const kinds=Object.entries(OMENS),total=kinds.reduce((a,[,o])=>a+o.weight,0);let r=Math.random()*total,kind=kinds[0][0];for(const [k,o] of kinds){r-=o.weight;if(r<=0){kind=k;break;}}
   e.omen={kind,until:now+WAR.omenMs};e.nextOmenAt=now+WAR.omenEveryMs;fx(e,now,{kind:'omen',omen:kind});announce(w,null,OMENS[kind].text,now,c,{warOmen:kind});}
  if(e.phase==='running'){const dt=Math.min(3,Math.max(0,(now-(e.pullAt||now))/1000));e.pullAt=now;e.line+=(50-e.line)*(1-(1-WAR.pullBack)**dt);}
  checkRescue(w,e,now,c);finishIfDone(w,e,now,c);}
}
// Lệnh chat. Trả về undefined nếu không phải lệnh của đại chiến.
export function warCommand(w,p,cmd,now,c){
 const e=w.sectWar;if(!e||!['registration','running'].includes(e.phase))return;
 const side=CHINH.includes(cmd)?'chinh':MA.includes(cmd)?'ma':null;
 if(side){if(!real(p))return {ok:false,message:'NPC không ra trận.'};const m=e.members[p.id];if(m)return m.side===side?{ok:true,duplicate:true}:{ok:false,message:'Đã ở '+SIDES[m.side].name+' • không đổi phe giữa trận.'};join(w,e,p,side,now,c);return {ok:true};}
 if(cmd==='chien'||cmd==='danh'&&e.phase==='running'){const m=e.members[p.id];if(!m)return {ok:false,message:'Gõ chinh hoặc ma để chọn phe trước.'};if(e.phase!=='running')return {ok:false,message:'Chưa khai chiến.'};
  if(now-m.lastStrike<WAR.strikeCooldownMs)return {ok:false,message:'Xuất chiêu hồi sau 8 giây.'};m.lastStrike=now;warNoteFree(e,m.side,WAR.strikeUnits,now);const moved=push(w,e,m.side,WAR.strikeUnits,now,c);m.score+=WAR.strikeUnits;m.lastActAt=now;
  fx(e,now,{kind:'strike',side:m.side,user:p.id});checkRescue(w,e,now,c);finishIfDone(w,e,now,c);return {ok:true,moved};}
}
// Tim: người chưa chọn phe tự vào phe ít người (hòa → Chính Đạo). Giới hạn mỗi người theo cửa sổ 5 s.
export function warHearts(w,p,count,now,c){
 const e=w.sectWar;if(!e||e.phase!=='running'||!real(p)||count<=0)return 0;
 let m=e.members[p.id];if(!m){const side=warCount(e,'ma')>warCount(e,'chinh')?'chinh':warCount(e,'chinh')>warCount(e,'ma')?'ma':'chinh';m=join(w,e,p,side,now,c,true);if(!m)return 0;}
 if(now-m.heartWindow>=WAR.heartWindowMs){m.heartWindow=now;m.heartUnits=0;}
 m.hearts+=count;const units=Math.min(WAR.heartCapUnits-m.heartUnits,Math.floor(m.hearts/WAR.heartsPerUnit));if(units<=0)return 0;
 m.hearts-=units*WAR.heartsPerUnit;m.heartUnits+=units;m.score+=units;m.lastActAt=now;warNoteFree(e,m.side,units,now);const moved=push(w,e,m.side,units,now,c);checkRescue(w,e,now,c);finishIfDone(w,e,now,c);return moved;
}
// Quà: luôn tung đại chiêu + tính điểm; đẩy đủ theo coin, trần 36 đơn vị (~12 coin) / phe / 30 s.
export function warGift(w,p,coins,now,c,event={}){
 const e=w.sectWar;if(!e||e.phase!=='running'||!real(p)||!(coins>0))return null;
 let m=e.members[p.id];if(!m){const side=warCount(e,'ma')>warCount(e,'chinh')?'chinh':'ma';m=join(w,e,p,side,now,c,true);if(!m)return null;}
 const units=coins*WAR.giftUnitsPerCoin;e.gifts=(e.gifts||[]).filter(g=>now-g.at<WAR.giftWindowMs);
 warNoteFree(e,m.side,0,now);const giftUnits=e.gifts.filter(g=>g.side===m.side).reduce((a,g)=>a+g.pushed,0);
 const allowance=WAR.giftCapUnits-giftUnits,pushed=Math.max(0,Math.min(units,allowance));
 e.gifts.push({at:now,side:m.side,pushed});m.score+=units;m.giftCoins=(m.giftCoins||0)+coins;m.lastActAt=now;m.lastGiftAt=now;
 const moved=push(w,e,m.side,pushed,now,c,true);fx(e,now,{kind:'gift',side:m.side,user:p.id,name:p.name,value:coins,capped:pushed<units});
 checkRescue(w,e,now,c);finishIfDone(w,e,now,c);return {moved,pushed,units,side:m.side};
}
// Ghi nhận lực đẩy không-quà theo cửa sổ trượt 30 s để tính hạn mức quà.
export function warNoteFree(e,side,units,now){e.freeLog=(e.freeLog||[]).filter(x=>now-x.at<WAR.giftWindowMs);if(units>0)e.freeLog.push({at:now,side,units});if(e.freeLog.length>400)e.freeLog.splice(0,e.freeLog.length-400);e.freeUnits={chinh:0,ma:0};for(const x of e.freeLog)e.freeUnits[x.side]+=x.units;}
// Ai được vẽ đầy đủ trên sân: mỗi phe tối đa 6 (tướng, người vừa tặng quà/xuất chiêu, điểm cao, luân phiên).
export function warStageIds(w,now){
 const e=w.sectWar;if(!e||!warVisible(w,now))return [];const out=[];
 for(const side of ['chinh','ma']){const rows=Object.entries(e.members).filter(([,m])=>m.side===side),pick=[],add=id=>{if(id&&!pick.includes(id)&&w.players[id]&&pick.length<6)pick.push(id);};
  warTop(e,side,1).forEach(t=>add(t.id));rows.filter(([,m])=>now-(m.lastGiftAt||0)<6000).forEach(([id])=>add(id));rows.filter(([,m])=>now-(m.lastStrike||0)<4000).forEach(([id])=>add(id));warTop(e,side,3).forEach(t=>add(t.id));
  const start=rows.length?Math.floor(now/5000)*3%rows.length:0;for(let i=0;i<rows.length&&pick.length<6;i++)add(rows[(start+i)%rows.length][0]);out.push(...pick);}
 return out;
}
export function warView(w,now){
 const e=w.sectWar;if(!e||e.phase==='cancelled')return null;
 const roster=side=>Object.entries(e.members||{}).filter(([,m])=>m.side===side).sort((a,b)=>b[1].score-a[1].score).slice(0,40).map(([id,m])=>({id,name:m.name,score:Math.round(m.score)}));
 return {id:e.id,phase:e.phase,active:warVisible(w,now),line:Math.round((e.line??50)*10)/10,registrationEndsAt:e.registrationEndsAt,startedAt:e.startedAt,endsAt:e.endsAt,podiumUntil:e.podiumUntil,finishedAt:e.finishedAt,
  counts:{chinh:warCount(e,'chinh'),ma:warCount(e,'ma')},top:{chinh:warTop(e,'chinh'),ma:warTop(e,'ma')},roster:{chinh:roster('chinh'),ma:roster('ma')},
  mult:{chinh:Math.round(warMultiplier(e,'chinh',now)*100)/100,ma:Math.round(warMultiplier(e,'ma',now)*100)/100},
  omen:e.omen&&now<e.omen.until?e.omen:null,rescued:e.rescued,boostUntil:e.boostUntil,fx:(e.fx||[]).filter(x=>now-x.at<15000),result:e.result||null};
}
