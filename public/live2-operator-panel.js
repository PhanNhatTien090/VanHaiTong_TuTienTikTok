// LIVE 2.0 controls live inside the existing local management Settings tab only.
// No new web game, no background timers, no direct writes to localStorage or player saves.
const KEYS=['live2Enabled','live2GuildWarEnabled','live2BossTrialsEnabled'];
let root=null,boxes={},button=null,note=null,stateCache=null,postFn=null,dirty=false,busy=false;
function sync(){
 if(!root||!stateCache)return;
 const live=stateCache.mode==='live';
 if(!dirty)for(const k of KEYS)boxes[k].checked=stateCache.settings?.[k]===true;
 if(!boxes.live2Enabled.checked){
  if(dirty){boxes.live2GuildWarEnabled.checked=false;boxes.live2BossTrialsEnabled.checked=false;}
 }
 for(const k of KEYS)boxes[k].disabled=busy||!live||(k!=='live2Enabled'&&!boxes.live2Enabled.checked);
 button.disabled=busy||!live;
 if(!live)note.textContent='Đang ở DEMO: tính năng mới được dùng thử tự động. Chọn thế giới LIVE để thiết lập.';
 else if(!dirty&&!busy&&!note.dataset.saved)note.textContent='LIVE mặc định tắt. Sao lưu trước mọi thay đổi và thử FPS trước khi bật.';
}
export function renderLive2OperatorPanel(state,post){
 if(typeof document==='undefined'||!state||typeof post!=='function')return;
 const view=document.querySelector('#settingsView');if(!view)return;
 stateCache=state;postFn=post;
 if(!root){
  root=document.createElement('div');root.id='live2OperatorPanel';root.className='settings-card';
  root.style.cssText='display:block;margin:12px 0;padding:14px 18px;border:1px solid #be9d6c';
  const h=document.createElement('h3');h.textContent='✦ VÂN HẢI TÔNG LIVE 2.0';root.appendChild(h);
  const p=document.createElement('p');p.textContent='Bật có chọn lọc các hệ thống mới. Dữ liệu nhân vật được sao lưu vào data/backups trước khi thay đổi.';root.appendChild(p);
  const items=[
   ['live2Enabled','Đạo Thống · Pháp Bảo · Đan Dược · Bang Hội · Sư Đồ · Đạo Lữ'],
   ['live2GuildWarEnabled','Hội Chiến dùng sân khấu LIVE chung'],
   ['live2BossTrialsEnabled','Thử thách Boss ba pha (đổi cơ chế sát thương)']
  ];
  for(const [key,label] of items){
   const row=document.createElement('label');row.style.cssText='display:block;margin:10px 0;font-weight:600';
   const input=document.createElement('input');input.type='checkbox';input.id='live2-flag-'+key;boxes[key]=input;
   input.addEventListener('change',()=>{dirty=true;note.dataset.saved='';sync();});
   row.appendChild(input);row.appendChild(document.createTextNode(' '+label));root.appendChild(row);
  }
  note=document.createElement('p');note.className='muted';note.setAttribute('role','status');root.appendChild(note);
  button=document.createElement('button');button.className='gold-button';button.type='button';
  button.textContent='Sao lưu và áp dụng LIVE 2.0';root.appendChild(button);
  button.addEventListener('click',async()=>{
   if(busy||stateCache?.mode!=='live')return;
   const flags=Object.fromEntries(KEYS.map(k=>[k,boxes[k].checked]));
   const prompt=flags.live2Enabled?'Bật LIVE 2.0? Sao lưu toàn bộ dữ liệu LIVE trước khi áp dụng.':'Tắt LIVE 2.0? Không xóa Đạo Ngộ, vật phẩm hoặc quan hệ. Sao lưu trước khi tắt.';
   if(!window.confirm(prompt))return;
   busy=true;sync();
   try{
    const answer=await postFn('/api/live2-settings',{...flags,confirm:'XAC NHAN LIVE2'});
    if(answer.ok){
     dirty=false;
     if(answer.flags&&stateCache?.settings)Object.assign(stateCache.settings,answer.flags);
     note.textContent=answer.unchanged?'Thiết lập không đổi.':'Đã lưu và sao lưu '+answer.backup;
     note.dataset.saved='1';
    }else{
     note.textContent=answer.message||'Không thể lưu cấu hình.';
     note.dataset.saved='1';
    }
   }finally{busy=false;sync();}
  });
  const intro=view.querySelector('.section-intro');
  if(intro)view.insertBefore(root,intro.nextSibling);else view.appendChild(root);
 }
 sync();
}
