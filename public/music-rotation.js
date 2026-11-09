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
 {src:'/assets/bgm-tu-tien-8.mp3',name:'Teller of the Tales'}
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
 if(cmd==='auto')return {mode:'auto',index:cur,at:now};
 if(cmd==='next')return {mode:current?.mode==='fixed'?'fixed':'auto',index:(cur+1)%n,at:now};
 const i=Number(cmd);if(!Number.isInteger(i)||i<0||i>=n)return null;
 return {mode:'fixed',index:i,at:now};
}
