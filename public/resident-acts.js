// Hoạt động tự động của tu tiên giả thường trú: tung chiêu, lĩnh ngộ, đột phá, luận kiếm, đánh yêu thú…
// Chỉ là trình diễn trên cảnh: không ghi vào thế giới, không đổi kinh tế/bảng xếp hạng/ký sự.
// Giọng đọc đọc sẵn: `node scripts/make-idle-voice.mjs` (tạo cả idle lẫn file ở đây).
import {RESIDENTS,residentCycle} from './residents.js';

// Tên dùng cho TTS khi chính tả hiển thị làm VieNeu đọc lệch.
const SPOKEN={'Tý Tèo':'Tí Tèo'};
const spoken=name=>SPOKEN[name]||name;

// kind → hiệu ứng cảnh, chữ trên màn hình, câu đọc. {n} = tên.
export const ACTS=Object.freeze({
  sword:    {effect:'sword',        weight:5, caption:'Ngự kiếm phi thiên',            say:'{n} ngự kiếm phi thiên, kiếm khí ngút trời!'},
  lotus:    {effect:'lotus',        weight:4, caption:'Thi triển Liên Hoa Kiếm Trận',  say:'{n} thi triển Liên Hoa Kiếm Trận!'},
  dragon:   {effect:'dragon',       weight:2, caption:'Triệu hồi Thanh Long giáng thế',say:'{n} triệu hồi Thanh Long giáng thế!'},
  learn:    {effect:'sword',        weight:3, caption:'Lĩnh ngộ bí pháp',              say:'{n} vừa lĩnh ngộ một bí pháp mới.'},
  pill:     {effect:'petal',        weight:0, caption:'Luyện thành Tụ Khí Đan',        say:'{n} vừa luyện thành Tụ Khí Đan.'},
  qi:       {effect:'qi',           weight:6, caption:'Vận công tu luyện',             say:'{n} đang vận công, linh khí hội tụ.'},
  duel:     {effect:'sword',        weight:3, caption:'Luận kiếm cùng đồng môn',       say:'{n} đang luận kiếm cùng đồng môn.'},
  breakthrough:{effect:'breakthrough',weight:1.5,caption:'Đột phá cảnh giới',         say:'Chúc mừng {n} đột phá thành công! Đạo hạnh thăng tiến.'},
  attack:   {effect:'attack',       weight:0,  caption:'Xuất chiêu đánh Huyền Giao',   say:'{n} xuất chiêu đánh Huyền Giao!'},
});
export const BOOKS=['Thanh Tâm Quyết','Vân Hải Kiếm Kinh','Thái Hư Bộ','Cửu Chuyển Huyền Công','Lôi Âm Chưởng','Bích Lạc Tâm Pháp'];

export const RESIDENT_VOICES=Object.freeze(RESIDENTS.flatMap(r=>Object.entries(ACTS).map(([kind,a])=>({
  resident:r.id,kind,text:a.say.replaceAll('{n}',spoken(r.name)),file:`/assets/resident/${r.id.split(':')[1]}-${kind}.mp3`}))));

/** Chọn hành động kế tiếp. rng cho test. realms: danh sách cảnh giới; boss: đang có yêu thú. */
// cycle: dùng chu kỳ tên/cảnh giới NPC (residents.js) — khi đó đột phá do lịch chu kỳ đảm nhận, không bốc ngẫu nhiên.
export function nextAct(progress,{realms=[],boss=false,rng=Math.random,cycle=null}={}){
  const r=RESIDENTS[Math.floor(rng()*RESIDENTS.length)%RESIDENTS.length];
  const p=progress[r.id]??={realm:1,count:0};p.count++;
  let kind;
  if(boss&&rng()<.65)kind='attack';
  else{
    const pool=Object.entries(ACTS).filter(([k,a])=>a.weight>0&&!(k==='breakthrough'&&(cycle||p.realm>=realms.length-1||p.count<4)));
    let x=rng()*pool.reduce((n,[,a])=>n+a.weight,0);kind=pool.find(([,a])=>(x-=a.weight)<0)?.[0]||'qi';
  }
  const a=ACTS[kind];let caption=a.caption;
  if(kind==='breakthrough'){p.realm++;p.count=0;caption=`Đột phá ${realms[p.realm]||'cảnh giới mới'}`;}
  if(kind==='learn')caption=`Lĩnh ngộ ${BOOKS[Math.floor(rng()*BOOKS.length)%BOOKS.length]}`;
  const voice=RESIDENT_VOICES.find(v=>v.resident===r.id&&v.kind===kind);
  const slot=cycle?.slots.find(s=>s.id===r.id),name=slot?.name||r.name,ownVoice=!cycle||cycle.original; // đổi tên thì không dùng giọng thu sẵn tên cũ
  return {id:`resident-${Date.now()}-${Math.floor(rng()*1e6)}`,at:Date.now(),user:r.id,name,text:caption,effect:a.effect,kind,resident:true,file:ownVoice?voice?.file:undefined,say:ownVoice?voice?.text:undefined};
}
