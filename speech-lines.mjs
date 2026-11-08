// v75: lời thoại LIVE — câu NGẮN, nhiều biến thể, phối 3 giọng:
//   tongsu   : tông sư (trầm, vang) — cảm ơn, ban thưởng, đột phá, nhắc lệnh
//   tiennu   : tiên nữ (trong, vang nhẹ) — hô vinh danh quà lớn, sự kiện trời (hoa/sao), tiên nhân giáng lâm
//   trongtai : trọng tài (nhanh, chắc) — đua phi kiếm, luận kiếm, yêu thú
// speechPlan(e) → [{voice,text}] (tối đa 2 đoạn, mỗi đoạn ≤ 200 ký tự để TTS không cắt mất đuôi).
import {REALMS} from './engine.mjs';
import {gameText} from './public/game-language.js';

const titleOf=g=>g==='nam'?'sư huynh':g==='nu'?'sư tỷ':'đạo hữu';
const cap=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s;
const D=['không','một','hai','ba','bốn','năm','sáu','bảy','tám','chín'];
export function viNumber(n){n=Math.max(0,Math.floor(Number(n)||0));if(n<10)return D[n];
  if(n<100){const t=Math.floor(n/10),u=n%10,s=t===1?'mười':D[t]+' mươi';return u===0?s:s+' '+(u===1&&t>1?'mốt':u===5?'lăm':u===4&&t>1?'tư':D[u]);}
  if(n<1000){const h=Math.floor(n/100),r=n%100,s=D[h]+' trăm';return r===0?s:s+(r<10?' linh '+D[r]:' '+viNumber(r));}
  if(n<1e6){const k=Math.floor(n/1000),r=n%1000,s=viNumber(k)+' nghìn';return r===0?s:s+(r<100?' không trăm'+(r<10?' linh '+D[r]:' '+viNumber(r)):' '+viNumber(r));}
  if(n<1e9){const k=Math.floor(n/1e6),r=n%1e6;return viNumber(k)+' triệu'+(r===0?'':r<1000?' không nghìn '+viNumber(r):' '+viNumber(r));}
  const k=Math.floor(n/1e9),r=n%1e9;return viNumber(k)+' tỷ'+(r===0?'':' '+viNumber(r));}
// số lớn đọc gọn cho câu ngắn: 13.013 → "mười ba nghìn"; 1.920 → "một nghìn chín trăm"
const roundSay=n=>{n=Math.floor(Number(n)||0);if(n>=1e6)return viNumber(Math.round(n/1e5)*1e5);if(n>=10000)return viNumber(Math.round(n/1000)*1000);if(n>=1000)return viNumber(Math.round(n/100)*100);return viNumber(n);};
const pickBy=(seed,list)=>{let h=0;for(const ch of String(seed))h=(Math.imul(h,31)+ch.charCodeAt(0))|0;return list[Math.abs(h)%list.length];};
const multWord=m=>m===1.5?'một rưỡi':viNumber(m);
// chữ "giả Latin" hay gặp trong tên TikTok (Hy Lạp, Cyrillic, IPA, small caps) → chữ Latin thường để TTS đọc được
const LOOKALIKE={'ι':'i','ı':'i','ɪ':'i','ռ':'n','ɴ':'n','ɦ':'h','ʜ':'h','α':'a','ᴀ':'a','а':'a','ε':'e','е':'e','ᴇ':'e','ο':'o','о':'o','ᴏ':'o','ρ':'p','р':'p','ᴘ':'p','τ':'t','ᴛ':'t','υ':'u','ᴜ':'u','κ':'k','ᴋ':'k','ν':'v','ᴠ':'v','ѕ':'s','ꜱ':'s','с':'c','ᴄ':'c','у':'y','ʏ':'y','х':'x','ʀ':'r','ʟ':'l','ᴍ':'m','м':'m','ᴅ':'d','ɢ':'g','ʙ':'b','в':'b','ғ':'f','ᴊ':'j','ᴢ':'z','ω':'w','ᴡ':'w','η':'n','λ':'l','ψ':'y','ɑ':'a','ɡ':'g','ɾ':'r','ʂ':'s','ƙ':'k','ɱ':'m','ȥ':'z'};
export function sayName(raw){
  const s=[...String(raw||'').normalize('NFKC')].map(ch=>LOOKALIKE[ch]||LOOKALIKE[ch.toLowerCase()]||ch).join('');
  const tokens=s.replace(/[^\p{L}\p{N}\s._-]/gu,' ').trim().split(/\s+/).filter(Boolean);
  const merged=tokens.reduce((out,t)=>{const prev=out.at(-1);if(prev&&[...t].length===1&&/^\p{L}+$/u.test(prev)&&[...out.lastRaw].length===1){out[out.length-1]=prev+t;}else out.push(t);out.lastRaw=t;return out;},Object.assign([],{lastRaw:''}));
  return merged.join(' ').slice(0,30);}
const cutWords=(s,n)=>{s=String(s||'').trim();if(s.length<=n)return s;const c=s.slice(0,n);return c.slice(0,Math.max(c.lastIndexOf(' '),Math.floor(n*.6))).trim();};
// Không đọc giá hay mốc coin, kể cả thông báo hệ thống được chuyển thẳng vào TTS.
export const withoutCoinSpeech=text=>String(text).split(/(?<=[.!?;…])\s*|[•\n]+/u).filter(part=>!/(?:\bcoins?\b|(?<!\p{L})xu(?!\p{L}))/iu.test(part)).join(' ').trim();
const say=(voice,text)=>({voice,text:cutWords((withoutCoinSpeech(text)||'Linh khí dâng trào!').replace(/%/g,' phần trăm').replace(/\b\d{1,9}\b/g,n=>viNumber(n)).replace(/\s+/g,' ').trim(),200)});
const titleCase=s=>String(s).toLowerCase().replace(/(^|\s)(\p{L})/gu,(m,a,b)=>a+b.toUpperCase());
const list2=a=>a.length<=1?a.join(''):a.slice(0,-1).join(', ')+' và '+a.at(-1);

function giftLines(e,who,Who,t,seed){
 if(e.raceGift&&e.raceBoost)return [say('tongsu',pickBy(seed,[`${Who} bứt tốc! Phi kiếm lao vọt ${viNumber(e.raceBoost)} trượng!`,`${Who} tăng tốc! Phi kiếm vọt lên ${viNumber(e.raceBoost)} trượng!`,`Bứt tốc! ${Who} lao lên ${viNumber(e.raceBoost)} trượng!`]))]; // 07/11: đang đua chỉ đọc bứt tốc
 const r=e.reward||{},qi=roundSay(r.qi),items=(r.itemNames||[]).slice(0,2),itemTxt=items.length?list2(items):'';
 const rewards=[itemTxt,Number(r.qi)>0?qi+' tu vi':''].filter(Boolean).join(' và ');
 const buff=e.buff?.mult?' Phúc duyên gấp '+multWord(e.buff.mult)+(e.firstGift?' suốt hai mươi phút.':' trong mười phút.'):'';
 const race=e.raceBoost?' Phi kiếm lao vọt '+viNumber(e.raceBoost)+' trượng!':'';
 // 08/11 tối (chủ game): KHÔNG cảm ơn / 'đa tạ tâm ý' — chỉ nói điều vừa xảy ra (tu vi, skin, luật sự kiện).
 const skins=(r.skinNames||[]).length,rule=e.eventRule,ruleLine={'lò luyện đan':`${Who} thêm linh dược vào lò!`,'cơ duyên':`${Who} tích lũy cơ duyên!`,'mưa hoa':`${Who} được cộng điểm mưa hoa!`,'sao băng':`${Who} được cộng điểm sao băng!`,'tiên nhân truyền đạo':`${Who} tích lũy cho skin sự kiện!`,'đua phi kiếm':`${Who} cộng điểm quà đua!`}[rule];
 const master=(skins?'Chúc mừng '+who+' nhận '+rewards+'!':rewards?Who+' nhận '+rewards+'!':ruleLine||Who+' tặng quà!')+buff+race;
 // 08/11: quà giữa Chính Ma Đại Chiến — hô to quà lật kèo / đại chiêu, rồi mới cảm ơn.
 if(e.warGift){const S=e.warGift==='chinh'?'Chính Đạo':'Ma Đạo',value=(Number(e.coins)||0)*(Number(e.count)||1);
  const hype=e.warFlip?pickBy(seed,[`${Who} tặng quà lớn, lật kèo rồi! ${S} vượt lên!`,`Lật kèo! ${Who} một quà đảo chiều chiến trận!`,`${Who} ra tay, ${S} lật ngược thế cờ!`])
   :value>=99?pickBy(seed,[`${Who} tung tuyệt kỹ! ${S} đẩy phăng chiến tuyến!`,`Đại chiêu của ${who}! ${S} càn quét!`,`${Who} ra đòn chí mạng cho ${S}!`])
   :Number(e.warTruong)>0?pickBy(seed,[`${Who} phản công! ${S} đẩy lùi ${viNumber(e.warTruong)} trượng!`,`${Who} tung chiêu! ${S} ép tới ${viNumber(e.warTruong)} trượng!`,`${S} đẩy mạnh ${viNumber(e.warTruong)} trượng nhờ ${who}!`])
   :value>=10?pickBy(seed,[`${Who} phản công! ${S} đẩy mạnh!`,`${Who} tung chiêu! ${S} ép tới!`,`${Who} ra đòn, ${S} đẩy mạnh chiến tuyến!`])
   :pickBy(seed,[`${Who} phản công! ${S} đẩy mạnh!`,`${Who} đẩy mạnh cho ${S}!`,`${Who} tung chiêu, ${S} tiến lên!`]);
  // 08/11 tối: trong đại chiến chỉ hô chiến — không 'đa tạ tâm ý', không đọc phần thưởng (chủ game yêu cầu).
  return [say('trongtai',hype)];}
 // 08/11 tối: quà ≥500 lúc không sự kiện — thưởng ngay nửa tu vi + skin ngẫu nhiên.
 if(e.jackpot)return [say('tiennu',pickBy(seed,[`Đại lễ! ${Who} được thưởng ngay một nửa tu vi!`,`${Who} tặng đại lễ, tu vi tăng thêm một nửa!`])),say('tongsu',master)];
 if(e.firstGift)return [say('tiennu','Chào mừng Tân Hộ Pháp '+who+'!'),say('tongsu',master)];
 return (Number(e.coins)||0)*(Number(e.count)||1)>=99?[say('tiennu','Vinh danh '+who+'!'),say('tongsu',master)]:[say('tongsu',master)];
}

export function speechPlan(e){
  if(e.effect==='summary')return [say('tongsu',e.kind==='joins'?`Chào mừng ${viNumber(e.count)} vị đạo hữu mới! Thả tim để bắt đầu vận công.`:`Tông môn náo nhiệt! ${viNumber(e.count)} lượt tu luyện liên tiếp.`)];
  const raw=sayName(e.name),t=titleOf(e.gender),who=raw?`${t} ${raw}`:'đạo hữu',Who=cap(who);
  const text=gameText(e.text||''),head=text.split('•')[0].trim(),what=head.toLowerCase(),seed=e.id||text+raw;
  if(e.sectMasterAward)return [say('tongsu',`Tông môn tôn phong ${who} làm Tông chủ! Toàn bộ pháp bảo, bí pháp và trang phục đã khai mở!`)];
  if(e.engagementAction==='follow')return [say('tongsu',Who+' vừa theo dõi tông môn. Chào mừng đồng môn!')];
  if(e.engagementAction==='share')return [say('tongsu','Cảm ơn '+who+' vừa chia sẻ buổi LIVE!')];
  const sys=!e.user;
  if(e.visitorStart&&e.visitorKind==='hailam')return [say('tiennu','Long Duệ Hải Lam giáng thế!'),say('tongsu','Gõ cơ duyên để nhận quà, có thể sở hữu skin!')];
  if(e.visitorStart&&e.visitorKind==='tudo')return [say('tiennu','Tư Đồ Ma Tôn giáng thế!'),say('tongsu','Gõ cơ duyên để nhận quà, có thể sở hữu skin!')];
  if(e.visitorStart&&e.visitorKind==='khuyniet')return [say('tiennu','Khuy Niết Lôi Tôn giáng thế, thiên lôi nổ vang!'),say('tongsu','Gõ cơ duyên để nhận quà, có thể sở hữu skin!')];
  if(e.visitorStart&&e.visitorKind==='doraemon')return [say('tiennu','Doraemon đã tới tông môn!'),say('tongsu','Gõ cơ duyên để nhận quà, có thể sở hữu skin!')];
  if(e.visitorStart){const name=({hanlap:'Hàn Lập',vuonglam:'Vương Lâm',shende:'Thần Đế'})[e.visitorKind]||titleCase(head.replace(/BAN CƠ DUYÊN|TRUYỀN ĐẠO|GIÁNG LÂM/g,''));return [say('tiennu',name+' giáng lâm Vân Hải Tông!'),say('tongsu','Gõ cơ duyên để nhận quà, có thể sở hữu skin!')];}
  if(e.lanternStart||e.lanternEnd||e.lanternLit||e.lanternBloom)return [say('tiennu',text.replace(/•/g,'. '))];
  if(e.togetherInvite||e.togetherStart||e.togetherDone||e.guardJoin||e.guardSuccess)return [say('tongsu',text.replace(/•/g,'. '))];
  if(e.petStart)return [say('tiennu','Linh Thú Cốc đã mở!'),say('tongsu','Thả một trăm tim kết bạn Ngọc Thố. Gõ thú để xem tiến độ, linh thú sẽ đồng hành cùng đạo hữu.')];
  if(e.petEnd)return [say('tiennu','Linh Thú Cốc đã khép lại. Các linh thú đã kết bạn vẫn đồng hành cùng đạo hữu.')];
  if(e.petAward)return [say('tiennu',Who+' kết bạn thành công với '+(e.petNames||[]).join(', ')+'.')];
  // ----- quà -----
  if(e.gift&&(e.reward||text.includes('cảm ơn đạo hữu')))return giftLines(e,who,Who,t,seed);
  // ----- người chơi -----
  if(e.vipReturn){const n=['','Bạc','Vàng','Kim Cương'][e.vipReturn];return [say('tiennu',`Hộ Pháp ${n} ${raw||''} đã trở lại tông môn!`),say('tongsu','Cả tông môn hoan nghênh, phúc khí tràn đầy!')];} // v86
  if(e.autoArrival)return [say('tongsu',e.returning?`Mừng ${who} trở lại!`:`Chào mừng ${who} đến Vân Hải Tông! Thả tim để vận công nhé!`)]; // 08/11: câu ngắn → tạo giọng nhanh, bớt trễ
  if(e.effect==='join')return [say('tongsu',pickBy(seed,[`Chào mừng ${who} gia nhập Vân Hải Tông! Thả tim để thử vận công nhé!`,`${Who} gia nhập Vân Hải Tông! Bước đầu chỉ cần thả tim!`,`Hoan nghênh ${who} gia nhập Vân Hải Tông! Thả tim, nhân vật của bạn sẽ vận công.`]))];
  // v87: hồng bao · câu đố · chuỗi điểm danh · nhiệm vụ ngày · tông môn kiến tạo
  if(e.envelopeStart)return [say('tiennu',pickBy(seed,['Hồng bao rơi! Gõ nhận trong hai mươi giây!','Trời mưa hồng bao! Gõ nhận ngay, chậm là hết!']))];
  if(e.envelopeLucky)return [say('tongsu',`${Who} trúng ${e.envelopeLucky} trong hồng bao!`)];
  if(e.envelopeEnd){const n=Number(e.count)||0;return [say('tiennu',n?`Hồng bao khép lại, ${viNumber(n)} đạo hữu nhận lộc!`:'Hồng bao khép lại. Lần sau nhớ gõ nhận nhé!')];}
  if(e.quizStart){if(!e.options)return [say('tiennu',`Câu đố mẹo! ${e.q}`),say('tongsu','Gõ đáp án vào khung chat, xem đạo hữu nào nhanh trí nhất!')];const o=e.options;return [say('tiennu',`Câu đố ${e.riddle?'mẹo':'tu tiên'}! ${e.q}`),say('tongsu',`A, ${o[0]}. B, ${o[1]}. C, ${o[2]}. Gõ a, b hoặc c!`)];}
  if(e.quizEnd){const n=Number(e.count)||0,top=(e.top||[]).map(x=>sayName(x)).filter(Boolean);return [say('tongsu',`${!e.letter?'Đáp án là '+String(e.answer||'').replace(/[()]/g,''):'Đáp án '+e.letter+', '+e.answer}! ${n?cap(viNumber(n))+' đạo hữu trả lời đúng'+(top.length?', nhanh nhất là '+list2(top):'')+'.':'Chưa ai trả lời đúng, lần sau cố lên!'}`)];}
  if(e.streak)return [say('tongsu',`${Who} điểm danh ${viNumber(e.streak)} ngày liên tiếp! Thưởng ${e.streakReward}.`)];
  if(e.tasksDone)return [say('tiennu',`${Who} hoàn thành nhiệm vụ ngày!`),say('tongsu','Mở rương thưởng, phúc duyên gấp ba!')];
  if(e.tasks)return [say('tongsu',`${Who}, ${text.replace(/•/g,',').toLowerCase()}.`)];
  if(e.sectLevel)return [say('tiennu',`Tông môn lên cấp ${viNumber(e.sectLevel)}!`),say('tongsu',`Ban phúc ${viNumber(e.count)} đồng môn${e.founder?', '+sayName(e.founder)+' là Khởi Tạo Trưởng Lão':''}!`)];
  // v86: giữ chân — tân thủ lệnh, Hộ Pháp trở lại, thăng VIP, mục tiêu tim
  if(e.starter)return [say('tiennu','Tân thủ lệnh!'),say('tongsu',pickBy(seed,[`${Who} đột phá Luyện Khí! Tân đệ tử tiến bộ thần tốc!`,`Chúc mừng ${who} bước vào Luyện Khí! Cứ tu luyện là mạnh lên!`]))];
  if(e.vipUp){const n=['','Bạc','Vàng','Kim Cương'][e.vipUp],pct=['','mười','hai mươi','ba mươi'][e.vipUp];return [say('tiennu',`${Who} thăng VIP ${n}!`),say('tongsu',`Từ nay tu luyện thêm ${pct} phần trăm, luôn có chỗ trên quảng trường!`)];}
  if(e.likeGoal)return [say('tiennu',`Cả tông môn đạt ${viNumber(e.likeGoal)} tim!`),say('tongsu',`Thiên đạo ban phúc ${viNumber(e.count)} đồng môn, phúc duyên gấp hai!`)];
  if(e.heartStrike)return [say('tongsu',`Kiếm trận tim xuất kích! Gây ${viNumber(e.damage)} công lực. Tiếp tục thả tim tiếp sức đồng môn!`)];
  if(e.heartMilestone)return [say('tiennu',`${Who} đạt ${viNumber(e.heartMilestone)} tim, nhận tu vi và linh thạch!`)];
  if(e.heartRank)return [say('tongsu',`${Who} là hộ pháp tim hạng ${viNumber(e.heartRank)}, với ${viNumber(e.heartCount)} tim!`)];
  if(e.heartBloom)return [say('tiennu','Hoa tâm khai nở! Tất cả đạo hữu đã góp tim nhận tu vi, linh thạch và linh thảo!')];
  if(e.heartRace)return [say('tongsu',`${Who} ngự phong bứt tốc! Cứ năm mươi tim thêm một lượt trợ lực!`)];
  // v84: đại điển vinh danh top 3 quà
  if(e.ceremony){const L=e.ceremony,n=x=>sayName(x.name)||'đạo hữu';return [say('tiennu',pickBy(seed,['Đại điển vinh danh! Tông môn tôn phong hộ pháp!','Chuông vàng ngân vang! Đại điển vinh danh bắt đầu!'])),say('tongsu',[L[0]&&`Thái Thượng Hộ Pháp ${n(L[0])}`,L[1]&&`Tả Hộ Pháp ${n(L[1])}`,L[2]&&`Hữu Hộ Pháp ${n(L[2])}`].filter(Boolean).join(', ')+'. Tông môn khắc ghi đại ân!')];}
  // 07/11/2026: THIÊN ĐẠO giáng lôi — đọc như thiên kiếp ngẫu nhiên giáng xuống tông môn.
  if(e.heavenStrike)return [say('tiennu',pickBy(seed,['Thiên kiếp giáng xuống tông môn!','Trời đất biến sắc! Thiên kiếp giáng xuống tông môn!','Lôi vân cuồn cuộn! Thiên kiếp giáng xuống tông môn!','Cửu thiên lôi kiếp giáng xuống tông môn!'])),say('tongsu',pickBy(seed+'t',[`Thiên lôi đánh trúng ${who}! Tu vi tổn thất hai mươi phần trăm, kinh mạch tê liệt năm phút!`,`Lôi phạt trúng vào ${who}! Mất hai mươi phần trăm tu vi, năm phút không thể tu luyện!`,`Thiên đạo chọn trúng ${who}! Hai mươi phần trăm tu vi tan biến, choáng váng năm phút!`,`Ầm! Thiên lôi giáng thẳng xuống ${who}! Tu vi hao tổn hai mươi phần trăm, năm phút không vận công được!`]))];
  // 08/11: Tông chủ (người điều hành) ban thưởng — giọng luôn nói rõ Tông chủ để ý ai, ban cho ai, ban gì, nhận được gì.
  if(e.adminGift){const r=e.reward||{},m=e.buff?.mult,custom=e.adminGift==='custom',gift=custom?'phần thưởng riêng':(e.comboName||'phần thưởng');
    const got=[Number(r.qi)>0&&roundSay(r.qi)+' tu vi',Number(r.stones)>0&&viNumber(r.stones)+' linh thạch',Number(r.herbs)>0&&viNumber(r.herbs)+' linh thảo',m&&'phúc duyên gấp '+multWord(m)+' trong '+viNumber(e.buff.minutes||10)+' phút'].filter(Boolean);
    const head=pickBy(seed,[`Tông chủ ban ${gift} cho ${who}!`,`Tông chủ để ý đến ${who}, ban ${gift}!`,`Tông chủ để mắt tới ${who}, ban tặng ${gift}!`]);
    const tail=e.adminGift==='breakthrough'?`${Who} đã đủ tu vi, gõ đột phá ngay!`:got.length?`${Who} nhận ${list2(got)}!`:`${Who} hãy tạ ơn Tông chủ!`;
    return [say('tiennu',head),say('tongsu',tail)];}
  // v79: hướng dẫn người mới từng bước
  if(e.guide==='checkin')return [say('tongsu',pickBy(seed,[`${Who}, gõ điểm danh để nhận linh thạch khởi đầu nhé!`,`${Who} ơi, bước một: gõ điểm danh nhận quà mỗi ngày!`]))];
  if(e.guide==='cultivate')return [say('tongsu',pickBy(seed,[`Tốt lắm ${who}! Giờ thả tim để tăng tu vi.`,`${Who}, chỉ cần thả tim để thử vận công nhé!`]))];
  if(e.guide==='gather')return [say('tongsu',pickBy(seed,[`${Who}, gõ hái để hái linh thảo. Thả tim cũng được cộng tu vi!`,`Bước ba nè ${who}: gõ hái nhận linh thạch, thả tim để tu vi tăng thêm!`]))];
  if(e.effect==='hint'){const cmd=cutWords(gameText(e.say||''),40),why=cutWords(gameText(e.why||'').split('.')[0],60);return [say('tongsu',`${Who}, hãy gõ ${cmd}. ${why}.`)];}
  if(e.effect==='blessing'){const n=Number(e.count);return [say('tiennu',`Thiên đạo ban phúc! ${n>0?cap(viNumber(n))+' vị đồng môn':'Đồng môn'} được đột phá cảnh giới!`)];}
  if(e.effect==='ready')return [say('tongsu',`${Who} đã đủ tu vi lên ${head.replace('Đủ tu vi đột phá','').trim()}! Gõ đột phá ngay.`)];
  if(e.effect==='status'){
    const mm=text.match(/Tu vi (\d+)\/(\d+) • Linh thạch (\d+)\/(\d+) • ([^•]+)/);
    if(!mm)return [say('tongsu',`${Who}, ${head.toLowerCase()}.`)];
    const [,qi,needQi,st,needSt]=mm.slice(0,5).map(Number),realm=mm[5].trim();
    if(qi>=needQi&&st>=needSt&&text.includes('đạo cơ đang lắng đọng'))return [say('tongsu',`${Who}, ${realm}, đạo cơ đang lắng đọng. Tiếp tục tu luyện, thiên kiếp sẽ sớm tới!`)];
    if(qi>=needQi&&st>=needSt)return [say('tongsu',`${Who}, ${realm}, đã đủ điều kiện. Gõ đột phá ngay!`)];
    const lack=[qi<needQi&&`${roundSay(needQi-qi)} tu vi`,st<needSt&&`${viNumber(needSt-st)} linh thạch`].filter(Boolean).join(' và ');
    const how=st<needSt&&qi>=needQi?'Gõ hái hoặc điểm danh để có linh thạch.':st<needSt?'Tu luyện để tăng tu vi, gõ hái để có linh thạch.':'Thả tim để vận công, trò chuyện cùng đồng môn để luận đạo.';
    if(e.missing==='stones')return [say('tongsu',`${Who} thiếu linh thạch, gõ hái để lấy linh thạch!`)]; // 08/11: chủ game muốn ngắn gọn
    return [say('tongsu',`${Who}, cảnh giới ${realm}. Còn thiếu ${lack}. ${how}`)];
  }
  if(text.startsWith('Kích hoạt '))return [say('tongsu',`${Who} kích hoạt ${cutWords(head.replace('Kích hoạt ',''),30)} trong trò chơi, tu vi tăng vọt!`)];
  if(text.startsWith('Chế tạo thành'))return [say('tongsu',`${Who} vừa chế tạo ${cutWords(head.replace('Chế tạo thành ',''),30)} trong trò chơi.`)];
  if(text.startsWith('Rèn thành'))return [say('tongsu',`${Who} rèn thành ${cutWords(head.replace('Rèn thành ',''),30)}! Pháp bảo tự trang bị.`)];
  if(e.effect==='title')return [say('tongsu',`Lão phu ghi nhận. Từ nay đồng môn gọi là ${who}.`)];
  if(e.loyaltyAward)return [say('tongsu',`Tri ân ${who} bền bỉ cùng tông môn! Ban ${list2((e.itemNames||[]).slice(0,2))||'phần thưởng'}.`)];
  if(e.patronAward)return [say('tiennu',`Vinh danh Đại Hộ Pháp ${raw||''}!`),say('tongsu',`Ban bộ Thương Long Hộ Pháp, Hộ Pháp Thiên Kiếm và Trấn Tông Long Ấn!`)];
  if(e.effect==='skin')return [say('tongsu',`${Who} khoác lên ${cutWords(text,40)}.`)];
  if(e.effect==='breakthrough'){const to=titleCase(head.replace(/^đột phá\s*/i,''));return [say('tongsu',pickBy(seed,[`Chúc mừng ${who} đột phá ${to}! Đạo hạnh thăng tiến!`,`Thiên môn khai mở! ${Who} bước vào ${to}!`,`${Who} đột phá ${to}, linh khí chấn động!`]))];}
  if(e.transform)return [say('tiennu',`${Who} nhận truyền thừa ${e.skinName||'tiên nhân'}!`),say('tongsu',`${e.transform==='hanlap'?'Trúc kiếm cuồng phong':e.transform==='shende'?'Đế khí bùng nổ':e.skinName==='Lý Mộ Uyển'?'Thanh quang tỏa sáng':'Tử khí cuộn trào'}, biến hình thành ${e.skinName||'tiên nhân'}!`)];
  // ----- sự kiện trời -----
  if(e.flowerStart&&e.eventKind==='meteor')return [say('tiennu',`Tinh Hà Lưu Tinh giáng thế ${viNumber(e.minutes)} phút! Thả tim nhận thưởng mốc năm mươi, một trăm năm mươi và ba trăm tim! Có bảng hộ pháp tim riêng. Bình luận vẫn bắt sao, quà vẫn nhận điểm!`)];
  if(e.flowerStart)return [say('tiennu',`Thiên Hoa Vũ giáng thế ${viNumber(e.minutes)} phút! Thả tim làm hoa nở! Đạt năm mươi, một trăm năm mươi và ba trăm tim nhận quà riêng, top tim còn có thưởng!`)];
  if(e.flowerRank){const ev=e.eventKind==='meteor'?'Tinh Hà Lưu Tinh':'Thiên Hoa Vũ',rank=['','nhất','nhì','ba'][e.flowerRank];return [say('tiennu',`${ev}, hạng ${rank} thuộc về ${who} với ${roundSay(e.score)} điểm!`),say('tongsu',`Ban ${list2((e.itemNames||[]).slice(0,1))||'pháp bảo'} cùng ${roundSay(e.reward?.qi)} tu vi!`)];}
  if(e.flowerEnd){const ev=e.eventKind==='meteor'?'Tinh Hà Lưu Tinh':'Thiên Hoa Vũ',n=Number(e.count)||0;return [say('tiennu',n?`${ev} kết thúc. ${cap(viNumber(n))} vị đồng môn tham gia. Đa tạ chư vị!`:`${ev} kết thúc. Lần sau chư vị nhớ tham gia nhé!`)];}
  if(e.opportunityStart)return [say('tiennu','Thiên Đạo Cơ Duyên mở năm phút!'),say('tongsu','Từ Hóa Thần, mỗi ngày tối đa một lần đột phá đại cảnh. Tiến độ dư được giữ qua lần mở sau. Gõ cơ duyên để sử dụng.')];
  if(e.opportunityEnd)return [say('tiennu','Thiên Đạo Cơ Duyên đã khép lại. Tiến độ chưa dùng vẫn được giữ cho lần sau. Đa tạ chư vị!')];
  if(e.opportunityAward)return [say('tiennu',`Chúc mừng ${who} đón cơ duyên!`),say('tongsu',`Đột phá ${viNumber(e.tiers)} cảnh giới, đạt ${REALMS[e.toRealm]||'cảnh giới mới'}!`)];
  // ----- yêu thú -----
  if(e.bossChampion){const prize=(text.match(/nhận ([^•]+)/)||[])[1]?.trim();return [say('trongtai',`${Who} dẫn đầu với ${roundSay(e.damage)} công lực!`),say('tongsu',`Ban ${prize?cutWords(prize,40):'bảo vật yêu thú'} cùng tu vi và tài nguyên!`)];}
  if(e.effect==='victory')return [say('trongtai',pickBy(seed,['Yêu thú đã bị phong ấn! Chư vị đồng môn uy vũ!','Thắng lợi! Bí cảnh hoàn tất, mọi người tham chiến đều có thưởng!']))];
  if(e.effect==='boss'){const name=e.bossName||(head.match(/^(.+?) giáng/)||[])[1]||(text.startsWith('Bí cảnh mở')?'Huyền Giao':null);const prize=(text.match(/nhận ([^•]+?) khi/)||[])[1];
    if(name&&!/trở về|rời/.test(text))return [say('trongtai',`${name} giáng thế! Thả tim nạp kiếm trận, gõ đánh để hàng yêu${prize?`, top công lực nhận ${cutWords(prize,30)}`:''}!`)];
    return [say('trongtai',`${name||'Yêu thú'} đã rút lui. Chư vị tiếp tục tu luyện.`)];}
  if(e.effect==='attack')return [say('trongtai',e.technique?.name?`${Who} thi triển ${e.technique.name}!`:`${Who} xuất chiêu!`)];
  // ----- đua phi kiếm -----
  if(e.effect==='race'&&e.raceFinishRank){const rank=['','nhất','nhì','ba'][e.raceFinishRank];return [say('tiennu',`${Who} về đích hạng ${rank}!`),say('tongsu',`Trao vật cưỡi ${e.mountName}${e.raceSwordSkin?' và kiếm '+e.itemNames[0]:''} vĩnh viễn!`)];}
  if(e.effect==='race'&&e.raceGiftRank){const rank=['','nhất','nhì','ba','tư','năm'][e.raceGiftRank]||e.raceGiftRank;return [say('tiennu',`Quà đua hạng ${rank} thuộc về ${who}!`),say('tongsu',`${e.raceMount&&e.mountName?'Trao vật cưỡi '+e.mountName+(e.raceSwordSkin?', skin phi kiếm '+e.itemNames[0]:'')+' vĩnh viễn, cùng ':e.raceSwordSkin?'Trao skin phi kiếm '+e.itemNames[0]+' vĩnh viễn, cùng ':'Ban '}${roundSay(e.reward?.qi)} tu vi!`)];}
  // ----- Khai Lò Cửu Chuyển (08/11): chỉ đọc 4 mốc, câu ngắn; còn lại để hình tự nói -----
  if(e.effect==='alchemy'){
    const g=['','nhất phẩm','nhị phẩm','tam phẩm','tứ phẩm','ngũ phẩm','lục phẩm','thất phẩm','bát phẩm','cửu phẩm'];
    if(e.alchemyStart)return [say('tongsu',pickBy(seed,['Khai lò luyện đan! Thả tim giữ lửa trong vùng vàng. Nóng quá thì tặng hoa hồng dập lửa!','Đan lô khai hỏa! Lửa vừa đủ thì đan thành, quá tay là nổ lò!','Luyện đan nào! Giữ lửa vùng vàng, sắp nổ thì hoa hồng cứu lò!']))];
    if(e.alchemyTribStart)return [say('tiennu',pickBy(seed,['Đan kiếp giáng! Thả tim giữ đan!','Thiên lôi thử đan! Thả tim giữ kết giới!']))];
    if(e.alchemyExplode){const n=sayName(e.alchemyCulprit);return [say('tongsu',n?pickBy(seed,[`Bùm! Nổ lò rồi! ${n} quạt tay quá!`,`Nổ lò! ${n} thổi lửa mạnh quá rồi!`]):'Bùm! Nổ lò rồi! Lần sau nhẹ tay nhé!')];}
    if(e.alchemyEnd){const n=sayName(e.alchemyMaster);return [say('tongsu',`Đan thành, ${g[e.alchemyEnd]||'đan dược'}!`+(n?` Đan sư ${n}!`:''))];}
    return [];
  }
  if(e.effect==='war'){
    if(e.warStart)return [say('trongtai','Chính Ma Đại Chiến mở tuyển quân! Gõ chính để vào Chính Đạo, gõ ma để vào Ma Đạo!')];
    if(e.warBattle)return [say('tongsu','Khai chiến! Thả tim đẩy chiến tuyến, gõ chiến để xuất chiêu!')];
    if(e.warOmen)return [say('tiennu',text.replace(/•/g,'. '))];
    // 08/11: lời đọc vui, nhiều biến thể (không lặp y hệt).
    if(e.warRescue)return [say('tongsu',pickBy(seed,e.warRescue==='chinh'?['Hạo Nhiên Chính Khí! Chính Đạo phản công rồi!','Chính Đạo chưa chịu thua đâu! Phản kích!','Trời giúp Chính Đạo! Đẩy ngược lại nào!']:['Ma Hồn Bất Diệt! Ma Đạo vùng lên rồi!','Ma Đạo hồi sinh! Phản kích!','Ma khí cuồn cuộn! Ma Đạo đẩy ngược lại rồi!']))];
    if(e.warTurn){const S=e.warTurn==='chinh'?'Chính Đạo':'Ma Đạo',O=e.warTurn==='chinh'?'Ma Đạo':'Chính Đạo';return [say('trongtai',pickBy(seed,[`${S} phản công rồi!`,`${S} lật kèo! Vượt lên dẫn trước!`,`Ồ! ${S} đè ngược lại rồi!`,`${S} vùng lên! Chiến tuyến đổi chiều!`])),say('tongsu',pickBy(seed+'o',[`${O} đâu, thả tim mau!`,`${O} ơi, đừng để thua!`,`${O} còn kịp lật lại đó!`]))];}
    if(e.warFinal===30)return [say('trongtai',pickBy(seed,['Ba mươi giây cuối! Dồn hết sức nào!','Còn ba mươi giây! Thả tim, tặng quà, quyết thắng!','Ba mươi giây cuối cùng! Ai sẽ thắng đây!']))];
    if(e.warFinal===10)return [say('trongtai',pickBy(seed,['Mười giây cuối! Quyết chiến!','Còn mười giây! Dốc toàn lực!','Mười giây! Tất cả xông lên!']))];
    if(e.warEnd){if(e.warEnd==='draw')return [say('trongtai',pickBy(seed,['Bất phân thắng bại! Hai phe cùng nhận thưởng!','Hòa rồi! Hai phe ngang tài ngang sức!']))];
      const S=e.warEnd==='chinh'?'Chính Đạo':'Ma Đạo',O=e.warEnd==='chinh'?'Ma Đạo':'Chính Đạo';
      return [say('trongtai',pickBy(seed,[`${S} đại thắng!`,`${S} thắng rồi! ${O} về luyện thêm nhé!`,`Chiến thắng thuộc về ${S}!`,`${S} đè bẹp ${O}!`])),...(e.warLead?[say('tongsu',`Vinh danh ${sayName(e.warLead)||'đạo hữu'} dẫn đầu phe thắng! Cả phe nhận tu vi và linh thạch, phe thua cũng được ban thưởng an ủi!`)]:[])];}
    if(e.warGeneral)return [say('tongsu',`${Who} là ${e.warGeneral==='chinh'?'Chính Đạo Minh Chủ':'Ma Đạo Tôn Chủ'}!`)];
    if(e.warJoin)return [];
  }
  if(e.effect==='race'){
    if(/^VÂN HẢI PHI KIẾM/.test(text))return [say('trongtai','Vân Hải Phi Kiếm mở tuyển! Gõ bay để lên đường đua, còn bốn mươi lăm giây! Top ba hộ pháp nhận skin phi kiếm vĩnh viễn, top năm nhận tu vi!')];
    if(/^Phi kiếm xuất phát/.test(text))return [say('trongtai','Phi kiếm xuất phát! Gõ đánh để bứt tốc, linh lực giúp phi kiếm lao vọt lên! Top ba hộ pháp nhận skin phi kiếm, top năm nhận tu vi!')];
    if(/^VÂN HẢI KIẾM VƯƠNG/.test(text))return [say('trongtai',`${Who} về đích đầu tiên!`),say('tongsu','Đoạt danh hiệu Vân Hải Kiếm Vương!')];
    if(/^Đã ghi danh/.test(text))return [say('trongtai',`${Who} lên đường đua!`)];
    if(/^Bứt tốc/.test(text))return [say('trongtai',`${Who} bứt tốc!`)];
    if(/khép lại/.test(text))return [say('trongtai','Đường đua đã khép lại. Hẹn chư vị lượt sau!')];
    if(/^Chờ thêm/.test(text))return [say('trongtai','Chưa đủ người đua. Gõ bay để ghi danh lượt sau!')];
  }
  // ----- luận kiếm -----
  if(e.effect==='tournament'||e.effect==='social'){
    if(/mở tuyển/.test(text))return [say('trongtai','Phong Vân Luận Kiếm mở tuyển! Gõ tỷ thí để ghi danh, ai ghi danh cũng được so tài.')];
    if(/^Luận Kiếm bắt đầu/.test(text)){const n=(text.match(/(\d+) đấu thủ/)||[])[1];return [say('trongtai',`Luận Kiếm bắt đầu${n?` với ${viNumber(n)} đấu thủ`:''}! Ba ván cuối sẽ lên đài.`)];}
    const qr=text.match(/^Luận Kiếm vòng (\d+) • (\d+) đấu thủ/);if(qr)return [say('trongtai',`Vòng ${viNumber(qr[1])}, ${viNumber(qr[2])} đấu thủ so tài nhanh!`)];
    const mt=text.match(/^Luận Kiếm: (.+?) · (.+?) so tài •/);if(mt)return [say('trongtai',`${sayName(mt[1])||'Đấu thủ'} và ${sayName(mt[2])||'đấu thủ'} lên đài so tài! Gõ kiếm để tiếp linh lực.`)];
    if(/^KIẾM KHÔI/.test(text))return [say('tiennu',`Vinh danh Kiếm Khôi Tông Môn!`),say('tongsu',`${Who} đứng đầu Phong Vân Luận Kiếm!`)];
    if(/^Thắng ván luận kiếm/.test(text))return [say('trongtai',`${Who} thắng ván luận kiếm!`)];
    if(/^Đã đăng ký tỷ thí/.test(text))return [say('trongtai',`${Who} ghi danh luận kiếm.`)];
    if(/^Luận Kiếm • \+1 huy chương/.test(text))return [say('trongtai',`${Who} nhận một huy chương Luận Kiếm.`)];
  }
  // ----- tiên nhân -----
  if(e.effect==='visitor'){
    const vm=text.match(/^(.+?) BAN CƠ DUYÊN/);if(vm)return [say('tiennu',`${titleCase(vm[1])} giáng lâm Vân Hải Tông!`),say('tongsu','Gõ cơ duyên nhận pháp bảo miễn phí. Truyền thừa sự kiện đang mở!')];
    const gm=text.match(/^(.+?) ban (.+)$/);if(gm&&!sys)return [say('tongsu',`${Who} được ${gm[1]} ban ${cutWords(gm[2],30)}!`)];
    const lm=text.match(/^(.+?) đã rời tiên môn/);if(lm)return [say('tiennu',`${lm[1]} đã rời tiên môn. Hẹn gặp lại chư vị!`)];
  }
  // ----- tương tác thường -----
  if(text.includes('cảm ơn đạo hữu'))return [say('tongsu',`${Who} tặng quà! Linh khí dâng trào!`)];
  if(text.startsWith('Kết duyên'))return [say('tongsu',`Đa tạ ${who} đã theo dõi Vân Hải Tông! Kết duyên tiên môn!`)];
  if(text.startsWith('Tụ linh'))return [say('tongsu',`${Who} thả tim, linh khí tăng lên.`)];
  if(text.startsWith('Luận đạo'))return [say('tongsu',`${Who} vừa luận đạo cùng đồng môn.`)];
  if(text.startsWith('Vận Thanh'))return [say('tongsu',`${Who} đang vận công tu luyện.`)];
  if(text.startsWith('Trang bị '))return [say('tongsu',`${Who} trang bị ${cutWords(head.replace('Trang bị ',''),30)}.`)];
  // không có người: đọc chính thông báo (bỏ dấu •), không ghép "đạo hữu … vừa …"
  if(sys)return [say('tongsu',text.split('•').map(s=>s.trim()).filter(Boolean).slice(0,2).join('. ')+'.')];
  return [say('tongsu',`${Who} ${/^(đã|đang|vừa|được|nhận)\b/.test(what)?what:'vừa '+what}.`)];
}
export const announcement=e=>speechPlan(e).map(s=>s.text).join(' ');
