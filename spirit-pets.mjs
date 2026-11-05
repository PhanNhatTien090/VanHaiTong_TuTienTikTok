import {SPIRIT_PETS,petById,unlockedPets} from './public/spirit-pets.js';
const active=(e,now)=>e&&!e.closedAt&&now>=e.startedAt&&now<e.endsAt;
export function startPetEvent(w,now,minutes=15){
 if(active(w.petEvent,now))return {ok:false,message:'Linh Thú Cốc đang mở.'};
 const duration=Number(minutes);if(!Number.isFinite(duration)||duration<1||duration>60)return {ok:false,message:'Chọn 1–60 phút.'};
 w.petEvent={id:'pets:'+now,startedAt:now,endsAt:now+Math.round(duration*60000)};return {ok:true};
}
export function stopPetEvent(w,now){if(!active(w.petEvent,now))return false;w.petEvent.endsAt=now;w.petEvent.closedAt=now;return true;}
export function petEventView(w,now){const e=w.petEvent;return e?{...e,active:!!active(e,now),practice:false,rules:SPIRIT_PETS}:null;}
export function petActivity(w,p,input,now,emit){
 const e=w.petEvent;if(!active(e,now)||p.resident||p.puppet||input.simulated)return;
 if(!['gift','like'].includes(input.type))return;
 const count=input.type==='like'?input.count:input.coins*(input.count||1);if(!Number.isSafeInteger(count)||count<1)return;
 if(p.petProgress?.eventId!==e.id)p.petProgress={eventId:e.id,hearts:0,coins:0};
 const progress=p.petProgress,key=input.type==='like'?'hearts':'coins';progress[key]=(progress[key]||0)+count;
 p.spiritPets??=[];const fresh=unlockedPets(progress.hearts,progress.coins).filter(x=>!p.spiritPets.includes(x.id));
 if(!fresh.length)return;
 for(const pet of fresh)p.spiritPets.push(pet.id);
 const best=fresh.at(-1),current=SPIRIT_PETS.findIndex(x=>x.id===p.spiritPet);
 if(SPIRIT_PETS.indexOf(best)>current)p.spiritPet=best.id;
 emit(w,p,'KẾT BẠN LINH THÚ • '+fresh.map(x=>x.name).join(' · '),'pet',now,{petAward:true,petId:best.id,petNames:fresh.map(x=>x.name)});
}
export function petCommand(w,p,cmd,rest,now,emit){
 if(!['thu','linhthu','batthu'].includes(cmd))return null;
 if(now-(p.petCommandAt||0)<5000)return {ok:false,message:'Đợi 5 giây trước khi xem lại linh thú.'};
 p.petCommandAt=now;
 if(rest==='an'||rest==='tat'){p.spiritPet=null;emit(w,p,'Linh thú nghỉ ngơi • gõ thu 1–5 để gọi lại','status',now);return {ok:true};}
 if(rest){const pet=SPIRIT_PETS[Number(rest)-1]||petById(rest);if(!pet||!p.spiritPets?.includes(pet.id))return {ok:false,message:'Chưa sở hữu linh thú này.'};p.spiritPet=pet.id;emit(w,p,'Đồng hành cùng '+pet.name,'pet',now,{petId:pet.id});return {ok:true};}
 const owned=(p.spiritPets||[]).map(id=>petById(id)?.name).filter(Boolean),matching=p.petProgress?.eventId===w.petEvent?.id,v=matching?p.petProgress:{hearts:0,coins:0},open=active(w.petEvent,now);
 const label=open?'Linh Thú Cốc':matching?'Linh Thú Cốc đã khép · tiến độ đợt vừa rồi':'Linh Thú Cốc chưa mở';
 const missing=open&&!v.hearts?' • Chưa nhận dữ liệu tym cá nhân từ TikFinity trong đợt này':'';
 emit(w,p,`${label} • ${v.hearts} tim nhận được · ${v.coins} coin${missing}`+' • '+(owned.join(', ')||'100 tim nhận Ngọc Thố')+' • gọi: thu 1–5','status',now,{petStatus:true,receivedHearts:v.hearts,receivedCoins:v.coins,missingLikeData:!!missing,lastLikeAt:p.likeReceipt?.at||null});return {ok:true};
}
