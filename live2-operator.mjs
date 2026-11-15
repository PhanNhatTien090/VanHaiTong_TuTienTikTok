// Host-only feature flag controls for the original local LIVE management screen.
// Requires explicit confirmation and an atomic snapshot before any LIVE mutation.
import fs from 'node:fs';
import path from 'node:path';
const KEYS=Object.freeze(['live2Enabled','live2GuildWarEnabled','live2BossTrialsEnabled']);
export const live2Flags=w=>Object.fromEntries(KEYS.map(key=>[key,w?.settings?.[key]===true]));
export function backupLive2State(w,dataDir,now=Date.now()){
 if(!w||w.mode!=='live'||!dataDir)throw Error('Chỉ sao lưu LIVE với thư mục dữ liệu hợp lệ.');
 const dir=path.join(dataDir,'backups');fs.mkdirSync(dir,{recursive:true});
 const stamp=new Date(now).toISOString().replace(/[-:]/g,'').replace(/[.Z]/g,'-');
 let dest=path.join(dir,'live2-prechange-'+stamp+'.json'),n=1;
 while(fs.existsSync(dest))dest=path.join(dir,'live2-prechange-'+stamp+'-'+(n++)+'.json');
 const tmp=dest+'.tmp';
 try{
  fs.writeFileSync(tmp,JSON.stringify(w),'utf8');
  fs.renameSync(tmp,dest);
 }catch(e){try{fs.rmSync(tmp,{force:true});}catch{}throw e;}
 return path.basename(dest);
}
export function applyLive2Settings(w,payload,backup,nowMs=Date.now()){
 if(w?.mode!=='live')return {ok:false,message:'Chỉ chỉnh LIVE 2.0 trong chế độ LIVE.'};
 if(!payload||KEYS.some(key=>typeof payload[key]!=='boolean'))return {ok:false,message:'Thiếu cấu hình bật/tắt hợp lệ.'};
 const now=live2Flags(w),next=Object.fromEntries(KEYS.map(k=>[k,payload[k]]));
 if((next.live2GuildWarEnabled||next.live2BossTrialsEnabled)&&!next.live2Enabled)
  return {ok:false,message:'Phải bật LIVE 2.0 trước khi bật Hội Chiến hoặc Boss thử thách.'};
 const changed=KEYS.some(key=>next[key]!==now[key]);
 if((!now.live2Enabled&&next.live2Enabled||!now.live2BossTrialsEnabled&&next.live2BossTrialsEnabled)
   &&w.boss?.hp>0&&w.boss.endsAt>nowMs)
  return {ok:false,message:'Chờ Boss đang diễn ra kết thúc trước khi bật cơ chế mới.'};
 if(!now.live2Enabled&&next.live2Enabled&&w.tower?.cur?.id&&w.tower.endsAt>nowMs)
  return {ok:false,message:'Chờ lượt vượt Tháp đang diễn ra kết thúc trước khi bật LIVE 2.0.'};
 if(!changed)return {ok:true,unchanged:true,flags:now,message:'Cấu hình không đổi.'};
 if(payload.confirm!=='XAC NHAN LIVE2')
  return {ok:false,message:'Cần xác nhận thao tác LIVE 2.0 tại trang điều hành.'};
 if(typeof backup!=='function')
  return {ok:false,message:'Không có chức năng sao lưu nên chưa thể thay đổi luật LIVE.'};
 let file;
 try{file=backup(w);}
 catch(err){return {ok:false,message:'Sao lưu không thành công: '+(err?.code||'lỗi ghi dữ liệu')+'. Không thay đổi luật LIVE.'};}
 if(!file)return {ok:false,message:'Sao lưu không trả về đường dẫn. Luật LIVE giữ nguyên.'};
 w.settings??={};
 Object.assign(w.settings,next);
 return {ok:true,flags:next,backup:file,message:'Đã lưu cấu hình LIVE 2.0 và sao lưu tiến trình.'};
}
