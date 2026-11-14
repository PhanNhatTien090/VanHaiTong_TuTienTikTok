// Đạo diễn sân khấu: quyết định AI được ngồi trên quảng trường khi số người hoạt động vượt số ghế.
// Nguyên tắc: người vừa bình luận phải thấy mình trong 1–2 giây; cảnh không thay người liên tục.
export const SEATS=16;          // Giới hạn mặc định cho chế độ Nhẹ; không vẽ hàng trăm người.
export const MIN_STAY=20000;    // ngồi ít nhất 20 giây rồi mới có thể bị thay
export const SWAPS_PER_SEC=2;   // tối đa 2 lượt thay người mỗi giây
const RECENT=30000,WAIT_MAX=10000,RESIDENT_LIMIT=15; // 08/11: từ 15 người thật thì 3 NPC rời sân (trước 24) cho đỡ tải

import {VIP_TIERS,vipTier,isNewbie} from './vip.js';
// Nhân vật do người điều hành tạo: thường trú (resident) và tu sĩ giả (puppet).
export const isFake=(p,id=p?.id)=>!!p&&(!!p.resident||!!p.puppet||String(id||'').startsWith('resident:'));
export class StageDirector{
  constructor(seats=SEATS){this.seats=seats;this.order=[];this.seatedAt=new Map();this.lastAct=new Map();this.introAt=new Map();this.giftAt=new Map();this.waiting=new Map();this.tokens=SWAPS_PER_SEC;this.tokenAt=0;this.left=[];}
  /** Ghi nhận một sự kiện thật của người xem (kể cả khi họ chưa có ghế). */
  note(e,t){if(!e.user)return;if(e.newcomerWelcome||e.introSpark){this.introAt.set(e.user,t);if(this.introAt.size>128)this.introAt.delete(this.introAt.keys().next().value);}this.lastAct.set(e.user,t);if(e.gift)this.giftAt.set(e.user,t);if(!this.order.includes(e.user))this.waiting.set(e.user,t);
    if(this.lastAct.size>2000){for(const [id,at]of this.lastAct)if(t-at>RECENT*4)this.lastAct.delete(id);}}
  score(p,t){const a=this.lastAct.get(p.id),g=this.giftAt.get(p.id);let s=0;if(this.introAt.has(p.id)&&t-this.introAt.get(p.id)<15000)s+=1200;
    if(a!=null&&t-a<RECENT)s+=1000-(t-a)/60;if(g!=null&&t-g<60000)s+=500+Math.min(400,(p.giftCoins||0)/25);
    // v86: VIP và người mới được ưu tiên chỗ trên quảng trường
    return s+(p.realm||0)*8+Math.min(50,(p.giftCoins||0)/200)+(VIP_TIERS[vipTier(p.giftCoins)]?.seat||0)+(isNewbie(p)?200:0)-(isFake(p)?5000:0);} // nhân vật thường trú / tu sĩ giả xếp cuối
  /** players: người thật đang hoạt động; residents: nhân vật thường trú; required: id bắt buộc có mặt (đang có hiệu ứng / đang chọn). */
  update(players,residents,t,required=new Set()){
    const byId=new Map(players.map(p=>[p.id,p]));
    const scores=new Map();
    const score=player=>{
      if(!scores.has(player.id))scores.set(player.id,this.score(player,t));
      return scores.get(player.id);
    };
    const useResidents=players.length<RESIDENT_LIMIT;
    for(const r of residents)if(useResidents)byId.set(r.id,r);
    // Rời sân: người không còn hoạt động, hoặc thường trú khi đã đông.
    const now=[];for(const id of this.order){if(byId.has(id))now.push(id);else{this.left.push({id,t});this.seatedAt.delete(id);}}
    this.order=now;
    if(this.order.length>this.seats){const keep=[...this.order].sort((a,b)=>(required.has(b)-required.has(a))||score(byId.get(b))-score(byId.get(a))).slice(0,this.seats);const ids=new Set(keep);for(const id of this.order)if(!ids.has(id))this.seatedAt.delete(id);this.order=this.order.filter(id=>ids.has(id));}
    this.tokens=Math.min(SWAPS_PER_SEC,this.tokens+Math.max(0,t-this.tokenAt)*SWAPS_PER_SEC/1000);this.tokenAt=t;
    for(const [id,at]of this.waiting)if(t-at>WAIT_MAX||this.order.includes(id)||!byId.has(id))this.waiting.delete(id);
    const seated=new Set(this.order);
    let needsCandidates=this.order.length<this.seats||this.waiting.size>0;
    if(!needsCandidates)for(const id of required)if(byId.has(id)&&!seated.has(id)){needsCandidates=true;break;}
    const want=needsCandidates?[...byId.values()].filter(p=>!seated.has(p.id)).sort((a,b)=>(required.has(b.id)-required.has(a.id))||(score(b)-score(a))):[];
    for(const p of want){
      if(this.order.length<this.seats){this.seat(p.id,t);continue;}
      const urgent=required.has(p.id)||this.waiting.has(p.id);if(!urgent)break;
      if(this.tokens<1&&!required.has(p.id))break;
      // Thay người im lâu nhất đã ngồi đủ MIN_STAY (thường trú bị thay trước).
      let victim=-1,worst=Infinity;
      this.order.forEach((id,i)=>{if(required.has(id))return;const q=byId.get(id);const stay=t-(this.seatedAt.get(id)||0);const intro=this.introAt.has(p.id)&&t-this.introAt.get(p.id)<15000;if(stay<(intro?4000:MIN_STAY)&&!q?.resident&&!required.has(p.id))return;const s=q?.resident?-1e9:score(q);if(s<worst){worst=s;victim=i;}});
      if(victim<0)break;
      this.left.push({id:this.order[victim],t});this.seatedAt.delete(this.order[victim]);this.order[victim]=p.id;this.seatedAt.set(p.id,t);this.waiting.delete(p.id);this.tokens--;
    }
    this.frontNewbies(byId);
    this.left=this.left.filter(l=>t-l.t<1500);
    return this.order.map(id=>byId.get(id));
  }
  // Người mới (🌱) luôn ngồi GIỮA HÀNG TRÊN CÙNG (đầu danh sách); NPC/tu sĩ giả ở các ghế cuối.
  // Chỉ đổi chỗ trong sân khấu, không đẩy ai ra ngoài. Người vào sau cùng ngồi chính giữa.
  frontNewbies(byId){
    const ids=this.order,n=ids.length;if(n<2)return;
    // Nhân vật thường trú (Tý Tèo, Người Không Buồn Cười, Hai Thùy) và tu sĩ giả luôn xếp DƯỚI CHÓT: sau tất cả người thật (các ghế cuối cùng).
    const fakes=ids.filter(id=>isFake(byId.get(id),id)),reals=ids.filter(id=>!isFake(byId.get(id),id));
    fakes.sort((a,b)=>String(a).localeCompare(String(b))); // thứ tự cố định → ngồi yên một chỗ
    if(fakes.length){ids.splice(0,n,...reals,...fakes);}
    // 4/11/2026: người mới ngồi HÀNG TRÊN CÙNG (giữa), không còn bị đổi xuống hàng cuối lẫn với NPC. NPC luôn ở các ghế cuối.
    const cols=n>24?8:n>6?6:4,start=0,len=Math.min(cols,reals.length),mid=(len-1)/2;
    const front=Array.from({length:len},(_,k)=>start+k).sort((a,b)=>Math.abs(a-mid)-Math.abs(b-mid)||a-b);
    const newbies=ids.filter(id=>isNewbie(byId.get(id))).sort((a,b)=>(byId.get(b).joinedAt||0)-(byId.get(a).joinedAt||0)).slice(0,front.length);
    newbies.forEach((id,k)=>{const from=ids.indexOf(id),to=front[k];if(from!==to)[ids[from],ids[to]]=[ids[to],ids[from]];});
  }
  seat(id,t){this.order.push(id);this.seatedAt.set(id,t);this.waiting.delete(id);}
  /** Đổi chỗ một cặp khi cảnh vắng, cho cảnh luôn có chuyển động nhẹ. */
  calmSwap(rng=Math.random){const idx=this.order.map((id,k)=>k).filter(k=>!String(this.order[k]).startsWith('resident:'));if(idx.length<2)return null; // chỉ đổi chỗ người thật; nhân vật thường trú ngồi yên
    const a=Math.floor(rng()*idx.length),b=(a+1+Math.floor(rng()*(idx.length-1)))%idx.length,i=idx[a],j=idx[b];[this.order[i],this.order[j]]=[this.order[j],this.order[i]];return [this.order[i],this.order[j]];}
  realOnStage(){return this.order.filter(id=>!String(id).startsWith('resident:')).length;}
}
