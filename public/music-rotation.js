// 09/11: danh sách nhạc nền + luật đổi bài. Server lưu settings.music, overlay tự tính bài đang phát từ đó.
// music = {mode:'auto'|'fixed', index, at}. auto: bắt đầu từ bài index lúc `at`, mỗi 30 phút sang bài kế. fixed: giữ một bài.
// Chưa cài gì → auto theo giờ (mọi máy cùng ra một bài). Nguồn + giấy phép: public/assets/AUDIO.md.
export const MUSIC_ROTATE_MS=30*60000;
export const BGM_LIST=Object.freeze([
 {src:'/assets/bgm-tu-tien-1.mp3',name:'Vân Hải (theme C)'},
 {src:'/assets/bgm-tu-tien-2.mp3',name:'Imperial China Cinematic'},
 {src:'/assets/bgm-tu-tien-3.mp3',name:'All The Tea In China'},
 {src:'/assets/bgm-tu-tien-4.mp3',name:'Ishikari Lore'},
 {src:'/assets/bgm-tu-tien-5.mp3',name:'Dream Culture'},
 {src:'/assets/bgm-tu-tien-6.mp3',name:'Eastern Thought'},
 {src:'/assets/bgm-tu-tien-7.mp3',name:'Lotus'},
 {src:'/assets/bgm-tu-tien-8.mp3',name:'Teller of the Tales'},
 {src:'/assets/bgm-tu-tien-9.mp3',name:'Mountain Emperor'},
 {src:'/assets/bgm-tu-tien-10.mp3',name:'Five Armies'},
 {src:'/assets/bgm-battle-crusade.mp3',name:'Crusade · Chiến trận'},
 {src:'/assets/bgm-mystic-dragon.mp3',name:'Dragon and Toast · Huyền cảnh'},
 {src:'/assets/bgm-bond-cherry.mp3',name:'Cherry Blossom · Kết duyên'},
 // 15/11: nhạc theo sự kiện (Kevin MacLeod, CC BY 4.0 — public/assets/AUDIO.md). Thêm ở cuối để giữ số thứ tự bài cũ.
 {src:'/assets/bgm-duel-heroic-age.mp3',name:'Heroic Age · Tỷ thí'},
 {src:'/assets/bgm-duel-titans.mp3',name:'Strength of the Titans · Tỷ thí'},
 {src:'/assets/bgm-duel-clash-defiant.mp3',name:'Clash Defiant · Tỷ thí'},
 {src:'/assets/bgm-duel-achilles.mp3',name:'Achilles · Tỷ thí'},
 {src:'/assets/bgm-battle-volatile.mp3',name:'Volatile Reaction · Đánh quái'},
 {src:'/assets/bgm-battle-prelude-action.mp3',name:'Prelude and Action · Đánh quái'},
 {src:'/assets/bgm-battle-exhilarate.mp3',name:'Exhilarate · Đánh quái'},
 {src:'/assets/bgm-battle-undaunted.mp3',name:'Undaunted · Đánh quái'},
 {src:'/assets/bgm-war-unholy-knight.mp3',name:'Unholy Knight · Chính Ma'},
 {src:'/assets/bgm-war-darkling.mp3',name:'Darkling · Chính Ma'},
 {src:'/assets/bgm-war-impact-prelude.mp3',name:'Impact Prelude · Chính Ma'},
 {src:'/assets/bgm-war-rites.mp3',name:'Rites · Chính Ma'},
 {src:'/assets/bgm-bond-healing.mp3',name:'Healing · Kết duyên'},
 {src:'/assets/bgm-bond-dreamer.mp3',name:'Dreamer · Kết duyên'},
 {src:'/assets/bgm-bond-fairytale-waltz.mp3',name:'Fairytale Waltz · Kết duyên'}
]);
// Kho nhạc theo không khí (chỉ số trong BGM_LIST). Trong một sự kiện cứ EVENT_ROTATE_MS đổi sang bài khác cùng kho.
export const EVENT_ROTATE_MS=3*60000;
export const MOOD_POOLS=Object.freeze({
 duel:[13,14,15,16,9,8],          // tỷ thí: hùng tráng, bùng nổ
 battle:[17,18,19,20,10],         // đánh quái/tháp: chiến đấu
 war:[21,22,23,24],               // Chính Ma đại chiến: đối đầu, u tối
 hall:[21,24,15,9],               // Ngũ Đường giao lưu: đối đầu giữa các đường
 race:[19,17,13,8],               // đua phi kiếm: dồn dập
 bond:[25,26,27,12],              // kết duyên/lễ hội: tình cảm
 alchemy:[1,5,11],mystic:[11,5,4],pets:[2,6,12]
});
export function musicIndex(music,now=Date.now(),n=BGM_LIST.length){
 if(!music||typeof music!=='object')return Math.floor(now/MUSIC_ROTATE_MS)%n;
 const i=((Math.trunc(Number(music.index))||0)%n+n)%n;if(music.mode==='fixed')return i;
 return (i+Math.floor(Math.max(0,now-(Number(music.at)||0))/MUSIC_ROTATE_MS))%n;
}
export function musicChangesAt(music,now=Date.now()){
 if(music?.mode==='fixed')return null;const at=music&&typeof music==='object'?Number(music.at)||0:0;
 return at+(Math.floor(Math.max(0,now-at)/MUSIC_ROTATE_MS)+1)*MUSIC_ROTATE_MS;
}
// Lệnh từ trang quản lý: 'auto' (tự đổi, tiếp từ bài đang phát), số thứ tự (giữ cố định bài đó), 'next' (bài kế, giữ chế độ hiện tại).
export function applyMusicCommand(current,cmd,now=Date.now(),n=BGM_LIST.length){
 const cur=musicIndex(current,now,n);
 if(cmd==='auto')return {mode:'auto',index:cur,at:now,followContext:true};
 if(cmd==='next')return {mode:current?.mode==='fixed'?'fixed':'auto',index:(cur+1)%n,at:now,followContext:false};
 const i=Number(cmd);if(!Number.isInteger(i)||i<0||i>=n)return null;
 return {mode:'fixed',index:i,at:now,followContext:false};
}

const hash=s=>{let h=2166136261;for(const ch of String(s))h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0;};
export function eventMood(s,now=s?.serverNow||Date.now()){
 const live=e=>e&&!e.closedAt&&(!e.endsAt||now<e.endsAt),social=s?.socialStatus;
 if(s?.hallWar?.active)return ['hall',s.hallWar.id];
 if(s?.sectWar?.active)return ['war',s.sectWar.id];
 if(s?.socialScene==='arena')return ['duel',s?.arena?.id||'arena']; // 15/11: Vân Hải Lôi Đài
 if(s?.socialScene==='tournament'||['registration','running'].includes(social?.tournament?.phase))return ['duel',social?.tournament?.id||'tournament'];
 if(s?.raceStatus?.active)return ['race',s.raceStatus.id];
 if(s?.boss?.hp>0&&live(s.boss))return ['battle',s.boss.id||s.boss.startedAt];
 if(s?.tower?.active)return ['battle',s.tower.id];
 if(s?.socialScene==='bond'||social?.ceremony||social?.festival?.active||s?.lanternFestival?.active)return ['bond',social?.ceremony?.id||social?.festival?.id||'bond'];
 if(s?.alchemy?.active)return ['alchemy',s.alchemy.id];
 if(s?.maze?.active)return ['mystic',s.maze.id];
 if(s?.petEvent?.active)return ['pets',s.petEvent.id];
 return null;
}
export function musicForState(s,now=s?.serverNow||Date.now()){
 const music=s?.settings?.music,base=musicIndex(music,now);
 // 15/11 (chủ game): sự kiện luôn đổi sang nhạc đúng ngữ cảnh, kể cả khi trang quản lý đang giữ một bài cố định.
 const ev=eventMood(s,now);
 if(ev){const [mood,key]=ev,pool=MOOD_POOLS[mood],step=Math.floor(now/EVENT_ROTATE_MS);return {index:pool[(hash(key)+step)%pool.length],mood};}
 if(music?.followContext===false)return {index:base,mood:'manual'};
 let mood='',key='',pool=[];
 if(music?.mode!=='fixed'){
  const map=s?.environment||{};key=map.id||'world';
  if(map.ambience==='underwater'){mood='underwater';pool=[4,5,6];}
  else if(map.ambience==='cosmos'||/abyss|hell|demon/.test(key)){mood='mystic';pool=[11,5,4];}
  else if(/moon|jade|garden/.test(key)){mood='peaceful';pool=[6,12,2];}
  else{mood='cultivation';pool=[0,1,2,3,4,5,6,7];}
 }
 if(!pool.length)return {index:base,mood:'manual'};
 return {index:pool[(hash(key)+Math.floor(now/MUSIC_ROTATE_MS))%pool.length],mood};
}
