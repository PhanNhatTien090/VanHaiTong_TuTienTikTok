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
 {src:'/assets/bgm-bond-cherry.mp3',name:'Cherry Blossom · Kết duyên'}
]);
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
export function musicForState(s,now=s?.serverNow||Date.now()){
 const music=s?.settings?.music,base=musicIndex(music,now);
 if(music?.followContext===false)return {index:base,mood:'manual'};
 const live=e=>e&&!e.closedAt&&(!e.endsAt||now<e.endsAt),social=s?.socialStatus;
 let mood='',key='',pool=[];
 if(s?.hallWar?.active){mood='battle';key=s.hallWar.id;pool=[9,10,8];}
 else if(s?.sectWar?.active){mood='battle';key=s.sectWar.id;pool=[10,9,8];}
 else if(s?.socialScene==='tournament'||['registration','running'].includes(social?.tournament?.phase)){mood='duel';key=social?.tournament?.id||'tournament';pool=[9,10,8];}
 else if(s?.raceStatus?.active){mood='race';key=s.raceStatus.id;pool=[8,9];}
 else if(s?.boss?.hp>0&&live(s.boss)){mood='battle';key=s.boss.id||s.boss.startedAt;pool=[9,10];}
 else if(s?.tower?.active){mood='battle';key=s.tower.id;pool=[8,10];}
 else if(s?.socialScene==='bond'||social?.ceremony||social?.festival?.active||s?.lanternFestival?.active){mood='bond';key=social?.ceremony?.id||social?.festival?.id||'bond';pool=[12,2,6];}
 else if(s?.alchemy?.active){mood='alchemy';key=s.alchemy.id;pool=[1,5,11];}
 else if(s?.maze?.active){mood='mystic';key=s.maze.id;pool=[11,5];}
 else if(s?.petEvent?.active){mood='pets';key=s.petEvent.id;pool=[2,6,12];}
 else if(music?.mode!=='fixed'){
  const map=s?.environment||{};key=map.id||'world';
  if(map.ambience==='underwater'){mood='underwater';pool=[4,5,6];}
  else if(map.ambience==='cosmos'||/abyss|hell|demon/.test(key)){mood='mystic';pool=[11,5,4];}
  else if(/moon|jade|garden/.test(key)){mood='peaceful';pool=[6,12,2];}
  else{mood='cultivation';pool=[0,1,2,3,4,5,6,7];}
 }
 if(!pool.length)return {index:base,mood:'manual'};
 // Event identity fixes its song for the whole event; minor games never restart music.
 const ambient=['peaceful','underwater','cultivation'].includes(mood),step=ambient?Math.floor(now/MUSIC_ROTATE_MS):0;
 return {index:pool[(hash(key)+step)%pool.length],mood};
}
