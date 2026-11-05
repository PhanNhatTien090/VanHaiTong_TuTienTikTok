import fs from 'node:fs';
import path from 'node:path';
export const normalizeHost=value=>String(value||'').trim().replace(/^https?:\/\/(?:www\.)?tiktok\.com\/@/i,'').replace(/^@/,'').split(/[/?#]/)[0].toLowerCase();
export function createSectMaster(dataDir){
 const file=path.join(dataDir,'sect-master.json');let config={username:'',enabled:true},presence=null;
 try{const saved=JSON.parse(fs.readFileSync(file,'utf8'));config={username:normalizeHost(saved.username),enabled:saved.enabled!==false};}catch{}
 function configure(input){const username=normalizeHost(input.username);if(username&&!/^[a-z0-9._]{2,40}$/.test(username))throw Error('Tên TikTok không hợp lệ. Nhập @username, không nhập tên hiển thị.');config={username,enabled:input.enabled!==false};presence=null;fs.mkdirSync(dataDir,{recursive:true});fs.writeFileSync(file+'.tmp',JSON.stringify(config));fs.renameSync(file+'.tmp',file);return {...config};}
 function observe(event,now=Date.now()){
  if(!config.enabled||!config.username||event?.event!=='chat')return false;
  const d=event.data||{},u=d.user||d,handles=[u.uniqueId,d.uniqueId,u.displayId,d.displayId].map(normalizeHost);
  if(!handles.includes(config.username))return false;
  const text=String(d.comment||'').normalize('NFC').replace(/[\u0000-\u001f\u007f]/g,' ').trim();if(!text)return false;
  presence={userId:String(u.userId||u.id||d.userId||d.id||config.username),username:config.username,name:String(u.nickname||d.nickname||config.username).normalize('NFC').slice(0,50),text:Array.from(text).slice(0,100).join(''),at:now,until:now+22000};return true;
 }
 return {configure,observe,view(now=Date.now()){return {enabled:config.enabled,username:config.username,...presence,active:!!presence&&config.enabled&&now<presence.until};}};
}
