export const LANTERN_PROMPTS=Object.freeze([
 {question:'Nếu được đi cùng đồng môn, chọn nơi nào?',a:'Biển mây',b:'Rừng trúc'},
 {question:'Lúc nghỉ tu, hai người thích làm gì?',a:'Ngắm sao',b:'Uống trà'},
 {question:'Muốn nuôi linh thú nào cùng nhau?',a:'Ngọc Thố',b:'Tiểu Long'},
 {question:'Nếu mở quán ở tiên giới, chọn gì?',a:'Quán mì',b:'Quán trà'}
]);
const open=(w,now)=>w.lanternFestival&&!w.lanternFestival.closedAt&&now<w.lanternFestival.endsAt;
export function controlLantern(w,op,now,c){
 if(op==='start'){if(open(w,now))return {ok:false,message:'Đêm Đèn Đồng Môn đang mở.'};const active=Object.values(w.players).filter(p=>!p.puppet&&!p.resident&&c.active(w,p,now)).length;
  w.lanternFestival={id:'lantern:'+now,startedAt:now,endsAt:now+300000,queue:[],joined:[],awarded:[],lanterns:[],goal:Math.max(2,Math.min(8,Math.ceil(active/4))),celebrated:false};c.emit(w,null,'ĐÊM ĐÈN ĐỒNG MÔN • gõ cungtu để ghép bạn • cùng tu luyện và chọn a/b để thắp đèn','social',now,{lanternStart:true});return {ok:true};}
 if(op==='stop'){if(w.lanternFestival){w.lanternFestival.endsAt=now;tickLantern(w,now,c);}return {ok:true};}return {ok:false,message:'Thao tác không hợp lệ.'};
}
export function lanternCommand(w,p,cmd,rest,now,c){
 if(cmd!=='cungtu'||!open(w,now))return null;const e=w.lanternFestival,s=w.companions;
 if(p.puppet||p.resident)return {ok:false,message:'Hoạt động dành cho người xem thật.'};
 if(rest==='huy'){e.queue=e.queue.filter(id=>id!==p.id);return null;}
 const pair=s?.pairs.find(x=>!x.finishedAt&&x.endsAt>now&&[x.a,x.b].includes(p.id));
 if(['a','b'].includes(rest)&&pair){if(pair.festivalId!==e.id)return {ok:false,message:'Đôi này không thuộc lượt thắp đèn hiện tại.'};pair.answers??={};if(!Object.hasOwn(pair.answers,p.id)){pair.answers[p.id]=rest;const prompt=LANTERN_PROMPTS[pair.promptIndex];c.emit(w,p,p.name+' chọn '+prompt[rest]+' • hỏi đồng môn xem họ chọn gì nhé','social',now,{lanternAnswer:true,pair:[pair.a,pair.b]});}return {ok:true};}
 if(rest)return null;
 if(pair){if(pair.festivalId===e.id){const prompt=LANTERN_PROMPTS[pair.promptIndex];c.emit(w,p,`${prompt.question} • cungtu a: ${prompt.a} · cungtu b: ${prompt.b} • mỗi người tuluyen 3 lần`,'status',now);}return {ok:true};}
 if(e.awarded.includes(p.id))return {ok:false,message:'Đã thắp đèn nhận quà đợt này • có thể tiếp tục trò chuyện cùng đồng môn.'};
 if(now-(p.lastTogetherRewardAt||0)<600000)return {ok:false,message:'Đang hồi thưởng cùng tu • thử lại sau.'};
 if(!e.queue.includes(p.id)){if(e.queue.length>=64)return {ok:false,message:'Hàng ghép đã đủ, thử lại sau.'};e.queue.push(p.id);if(!e.joined.includes(p.id))e.joined.push(p.id);c.emit(w,p,'Đã vào hàng tìm đồng môn • người cùng nhập hàng sẽ được ghép • cungtu huy để rời','social',now);}
 return {ok:true};
}
export function enrollLanternPair(w,pair,now){const e=w.lanternFestival;if(!open(w,now)||pair.startedAt<e.startedAt||e.awarded.includes(pair.a)||e.awarded.includes(pair.b))return;pair.festivalId=e.id;pair.promptIndex=e.lanterns.length%LANTERN_PROMPTS.length;pair.answers={};}
export function lanternPairReady(pair){return !pair.festivalId||(Object.hasOwn(pair.answers||{},pair.a)&&Object.hasOwn(pair.answers||{},pair.b));}
export function awardLantern(w,pair,now,c){const e=w.lanternFestival;if(!open(w,now)||pair.festivalId!==e.id||e.awarded.includes(pair.a)||e.awarded.includes(pair.b))return;
 e.awarded.push(pair.a,pair.b);const a=w.players[pair.a],b=w.players[pair.b];for(const p of [a,b]){p.companionPoints=(p.companionPoints||0)+2;p.lanternFriendships=(p.lanternFriendships||0)+1;p.lanternTitle='Bạn Đèn Đồng Môn';}
 const prompt=LANTERN_PROMPTS[pair.promptIndex];e.lanterns.push({id:pair.id,a:pair.a,b:pair.b,aName:a.name,bName:b.name,aChoice:prompt[pair.answers[pair.a]],bChoice:prompt[pair.answers[pair.b]],at:now});
 c.emit(w,a,`${a.name} và ${b.name} cùng thắp đèn • +2 điểm Đồng môn và danh hiệu Bạn Đèn Đồng Môn`,'social',now,{lanternLit:true,pair:[pair.a,pair.b],names:[a.name,b.name],lanternCount:e.lanterns.length});
 if(!e.celebrated&&e.lanterns.length>=e.goal){e.celebrated=true;c.emit(w,null,'VẠN ĐĂNG HỘI TỤ • '+e.goal+' đôi đã kết bạn • trời đêm rực sáng','social',now,{lanternBloom:true});}
}
export function tickLantern(w,now,c){const e=w.lanternFestival;if(!e||e.closedAt)return;
 if(now>=e.endsAt){e.closedAt=now;e.queue=[];for(const p of w.companions?.pairs||[])if(p.festivalId===e.id&&!p.finishedAt){p.finishedAt=now;p.expired=true;}c.emit(w,null,`Đêm Đèn Đồng Môn khép lại • ${e.lanterns.length} đôi thắp đèn • giữ danh hiệu đã nhận`,'social',now,{lanternEnd:true});return;}
 const busy=id=>w.companions?.pairs.some(p=>!p.finishedAt&&p.endsAt>now&&[p.a,p.b].includes(id));e.queue=e.queue.filter(id=>{const p=w.players[id];return p&&!p.puppet&&!p.resident&&c.active(w,p,now)&&!busy(id)&&!e.awarded.includes(id)&&now-(p.lastTogetherRewardAt||0)>=600000;});
 if(e.queue.length>=2&&(w.companions?.pairs.filter(p=>!p.finishedAt&&p.endsAt>now).length||0)<32){const [a,b]=e.queue.splice(0,2);c.createPair(w,w.players[a],w.players[b],now);}
}
export function lanternView(w,now){const e=w.lanternFestival;return e?{id:e.id,active:!!open(w,now),endsAt:e.endsAt,waiting:e.queue.length,count:e.lanterns.length,goal:e.goal,celebrated:e.celebrated,lanterns:e.lanterns.slice(-12)}:null;}
