import {hallStandingOrder} from './ngu-duong-ui.js';

const date = new Intl.DateTimeFormat('vi-VN',{dateStyle:'short',timeStyle:'short',timeZone:'Asia/Ho_Chi_Minh'});
const number = new Intl.NumberFormat('vi-VN');
const fmt = n=>number.format(n||0);
const tbody = (rows,render,columns)=>rows.length?rows.map(render).join(''):`<tr><td colspan="${columns}">Chưa có dữ liệu.</td></tr>`;
const roles={member:'Đệ tử',disciple:'Chân Truyền',elder:'Trưởng Lão',remove:'Gỡ khỏi Đường'};

export function mountHallAdmin(root,post,esc,mode){
 root.innerHTML=`<section class="hall-admin-panel">
  <div class="hall-admin-heading"><div><h2>Danh sách Đường</h2><p data-hall-count></p></div><button class="gold-button" data-hall-add type="button" disabled>Thêm Đường</button></div>
  <p data-hall-note class="muted" hidden></p>
  <div class="hall-admin-scroll"><table><thead><tr><th>Đường</th><th>Trưởng Lão / Chân Truyền</th><th>Thành viên</th><th>Quản lý</th></tr></thead><tbody data-hall-list></tbody></table></div>
 </section>
 <section class="hall-admin-panel" data-roster hidden>
  <div class="hall-admin-heading"><div><h2 data-roster-title></h2><p data-roster-count></p></div><button class="soft-button" data-roster-close type="button">Đóng danh sách</button></div>
  <form data-roster-search class="hall-admin-search">
   <label>Tìm để thêm hoặc chuyển đệ tử <input name="q" type="search" maxlength="80" placeholder="Tên, mã hoặc tài khoản TikTok"></label>
   <button class="soft-button" type="submit">Tìm</button><button class="text-button" type="button" data-roster-reset>Danh sách Đường</button>
  </form>
  <p role="status" data-roster-note></p>
  <div class="hall-admin-scroll"><table><thead><tr><th>Đạo hữu</th><th>Đường hiện tại</th><th>Điểm tuần</th><th>Chức danh</th></tr></thead><tbody data-roster-rows></tbody></table></div>
  <div class="editor-actions"><button class="soft-button" data-roster-page="-1" type="button" disabled>Trang trước</button><span data-roster-position></span><button class="soft-button" data-roster-page="1" type="button" disabled>Trang sau</button></div>
 </section>
 <section class="hall-admin-panel">
  <div class="hall-admin-heading"><div><h2>Xếp hạng tuần</h2><p data-hall-period></p></div><label>Tuần <select data-hall-week><option value="current">Tuần hiện tại</option></select></label></div>
  <div class="hall-admin-scroll"><table><thead><tr><th>Hạng</th><th>Đường</th><th>Điểm tuần</th><th>Điểm Đường chiến</th></tr></thead><tbody data-hall-rank></tbody></table></div>
  <p data-hall-rewards class="muted"></p>
 </section>
 <dialog class="hall-admin-dialog"><form>
  <h2></h2><label>Tên Đường <input name="name" maxlength="48" required autocomplete="off"></label>
  <label>Màu nhận diện <input name="color" type="color" value="#95e5d2"></label>
  <p data-hall-delete-note hidden></p><p role="status" data-hall-result></p>
  <div class="editor-actions"><button class="soft-button" type="button" data-hall-cancel>Hủy</button><button class="gold-button" type="submit">Lưu</button></div>
 </form></dialog>`;
 const get=selector=>root.querySelector(selector),dialog=get('dialog'),form=dialog.querySelector('form'),submit=form.querySelector('button[type=submit]'),result=get('[data-hall-result]'),weekSelect=get('[data-hall-week]');
 const roster=get('[data-roster]'),search=get('[data-roster-search]'),rosterRows=get('[data-roster-rows]'),rosterNote=get('[data-roster-note]');
 let view,lock,editing,sending=false,rosterIndex=null,rosterQuery='',rosterData,requestId=0,memberSaving=false;
 const setHTML=(el,html)=>{if(el._hallHTML!==html){el.innerHTML=html;el._hallHTML=html;}};
 const renderRank=()=>{
  const week=view?.weekly,record=week?.history.find(row=>String(row.week)===weekSelect.value);
  const rows=record?.standings??[...(view?.halls||[])].sort(hallStandingOrder);
  setHTML(get('[data-hall-rank]'),tbody(rows,(h,i)=>`<tr><td>${i+1}</td><th scope="row">${esc(h.name)}${h.champion?' <small>Vô địch tuần trước</small>':''}</th><td>${fmt(h.points)}</td><td>${fmt(h.battlePoints)}</td></tr>`,4));
  get('[data-hall-period]').textContent=record?`${date.format(record.startedAt)} – ${date.format(record.endsAt)}`:week?`Chốt lúc ${date.format(week.endsAt)} (giờ Việt Nam)`:'';
  get('[data-hall-rewards]').textContent=record?`${fmt(record.rewarded)} đạo hữu đã nhận thưởng.`:'Điểm tuần gồm hoạt động của thành viên và điểm thưởng Đường chiến.';
 };
 const renderRoster=()=>{
  const rows=rosterData?.rows||[],hall=rosterData?.hall,disabled=lock||rosterData?.locked||memberSaving;
  if(hall)get('[data-roster-title]').textContent='Đệ tử · '+hall.name;
  get('[data-roster-count]').textContent=rosterData?`${fmt(rosterData.total)} ${rosterQuery?'kết quả':'thành viên'}`:'';
  get('[data-roster-position]').textContent=rosterData?`${rosterData.page} / ${rosterData.pages}`:'';
  for(const button of roster.querySelectorAll('[data-roster-page]'))button.disabled=!rosterData||memberSaving||(Number(button.dataset.rosterPage)<0?rosterData.page<=1:rosterData.page>=rosterData.pages);
  setHTML(rosterRows,tbody(rows,p=>{
   const same=p.index===rosterIndex;
   return `<tr><th scope="row">${esc(p.name)}<small>${p.code?'#'+esc(p.code):''}</small></th><td>${esc(p.hallName||'Chưa vào Đường')}</td><td>${fmt(p.points)}</td><td>
    <form data-member-id="${esc(p.id)}" class="hall-admin-actions"><select name="role" aria-label="Chức danh của ${esc(p.name)}" ${disabled?'disabled':''}>${Object.entries(roles).filter(([role])=>same||role!=='remove').map(([role,label])=>`<option value="${role}"${(same?p.role:'member')===role?' selected':''}>${label}</option>`).join('')}</select><button class="soft-button" type="submit" ${disabled?'disabled':''}>${same?'Lưu':p.index==null?'Thêm':'Chuyển'}</button></form></td></tr>`;
  },4));
 };
 const loadRoster=async(page=1)=>{
  const id=++requestId,params=new URLSearchParams({world:mode,index:rosterIndex,q:rosterQuery,page});
  rosterNote.textContent='Đang tải danh sách…';
  rosterData=null;renderRoster();
  try{
   const response=await fetch('/api/hall-members?'+params,{cache:'no-store'});
   const data=await response.json();
   if(id!==requestId)return;
   if(!data.ok)throw Error(data.message||'Chưa đọc được danh sách.');
   rosterData=data;
   rosterNote.textContent=data.locked?'Đợi công bố kết quả trận đấu để sửa thành viên.':'';
   renderRoster();
  }catch(error){if(id===requestId){rosterData=null;renderRoster();rosterNote.textContent=error.message;}}
 };
 const closeRoster=()=>{requestId++;rosterIndex=null;rosterData=null;roster.hidden=true;};
 search.addEventListener('submit',e=>{e.preventDefault();rosterQuery=search.elements.q.value.trim();loadRoster();});
 rosterRows.addEventListener('submit',async e=>{
  e.preventDefault();
  const memberForm=e.target,p=rosterData?.rows.find(row=>row.id===memberForm.dataset.memberId);
  if(!p||lock||memberSaving)return;
  const role=memberForm.elements.role.value,destination=rosterData.hall,previous=rosterData.page;
  const confirmText=role==='remove'?`Gỡ ${p.name} khỏi ${destination.name}?`
   :p.index!=null&&p.index!==destination.index?`Chuyển ${p.name} từ ${p.hallName} sang ${destination.name}?`
   :role==='elder'&&destination.elder&&destination.elder!==p.id?`Bổ nhiệm ${p.name} làm Trưởng Lão? Trưởng Lão hiện tại sẽ trở về vai trò Đệ tử.`:'';
  if(confirmText&&!window.confirm(confirmText))return;
  memberSaving=true;
  memberForm.querySelector('button').disabled=true;
  try{
   const response=await post('/api/hall-members',{index:destination.index,id:p.id,role});
   if(rosterIndex!==destination.index)return;
   memberSaving=false;
   if(response.ok){await loadRoster(previous);if(rosterIndex===destination.index&&rosterData)rosterNote.textContent=response.message;}
   else{rosterNote.textContent=response.message||'Chưa lưu được chức danh.';renderRoster();}
  }finally{memberSaving=false;if(memberForm.isConnected)memberForm.querySelector('button').disabled=!!lock;}
 });
 weekSelect.addEventListener('change',renderRank);
 root.addEventListener('click',e=>{
  const button=e.target.closest('button');
  if(!button)return;
  if(button.hasAttribute('data-hall-cancel')){if(!sending)dialog.close();return;}
  if(button.hasAttribute('data-roster-close')){closeRoster();return;}
  if(button.hasAttribute('data-roster-reset')){search.reset();rosterQuery='';loadRoster();return;}
  if(button.hasAttribute('data-roster-page')){loadRoster(rosterData.page+Number(button.dataset.rosterPage));return;}
  if(button.hasAttribute('data-roster-open')){
   rosterIndex=Number(button.dataset.index);rosterQuery='';rosterData=null;search.reset();roster.hidden=false;renderRoster();
   get('[data-roster-title]').textContent='Đệ tử · '+view.halls.find(h=>h.index===rosterIndex).name;
   loadRoster();roster.scrollIntoView({block:'nearest'});return;
  }
  const action=button.hasAttribute('data-hall-add')?'add':button.dataset.hallAction;
  if(!action||lock)return;
  const hall=view.halls.find(h=>h.index===Number(button.dataset.index));
  if(action!=='add'&&!hall)return;
  editing={action,index:hall?.index};
  const deleting=action==='delete',note=get('[data-hall-delete-note]');
  dialog.querySelector('h2').textContent=deleting?'Xóa '+hall.name:action==='edit'?'Sửa '+hall.name:'Thêm Đường';
  for(const input of form.querySelectorAll('input')){input.disabled=deleting;input.closest('label').hidden=deleting;}
  form.elements.name.value=hall?.name||'';
  form.elements.color.value=hall?.color||'#95e5d2';
  note.hidden=!deleting;
  note.textContent=deleting?`${fmt(hall.memberCount)} thành viên sẽ rời Đường. Đường bị gỡ khỏi bảng tuần hiện tại. Kết quả các tuần đã chốt và quà đã ghi nhận vẫn được lưu.`:'';
  result.textContent='';
  submit.textContent=deleting?'Xóa Đường':'Lưu Đường';
  dialog.showModal();
 });
 dialog.addEventListener('cancel',e=>{if(sending)e.preventDefault();});
 form.addEventListener('submit',async e=>{
  e.preventDefault();
  if(sending||!editing)return;
  sending=true;submit.disabled=true;result.textContent='Đang lưu…';
  try{
   const response=await post('/api/halls',{...editing,...Object.fromEntries(new FormData(form))});
   if(response.ok)dialog.close();
   else result.textContent=response.message||'Chưa lưu được thay đổi.';
  }finally{sending=false;submit.disabled=false;}
 });
 return (state)=>{
  view=state?.halls;
  const previousLock=!!lock;
  lock=!view?.limit||state?.halls?.match||['registration','running'].includes(state?.hallWar?.phase);
  const rows=view?.halls||[],note=get('[data-hall-note]');
  get('[data-hall-count]').textContent=view?.limit?`${rows.length} / ${view.limit} Đường đang mở`:`${rows.length} Đường đang mở`;
  get('[data-hall-add]').disabled=!!lock||rows.length>=view?.limit;
  note.hidden=!lock;
  note.textContent=!state?'Đang tải danh sách Đường…':!view?.limit?'Máy chủ cần nạp bản mới để lưu thay đổi.':'Đợi công bố kết quả trận đấu để chỉnh danh sách.';
  setHTML(get('[data-hall-list]'),tbody(rows,h=>`<tr><th scope="row"><strong><i class="hall-admin-swatch" style="background:${esc(h.color)}"></i>${h.index+1}. ${esc(h.name)}</strong><small>${esc(h.perk||'')}</small></th><td>${esc(h.elder?.name||'Ghế trống')}<small>${h.disciples.map(p=>esc(p.name)).join(' · ')}</small></td><td><button class="soft-button" data-roster-open data-index="${h.index}" type="button" ${view?.limit?'':'disabled'}>Đệ tử · ${h.memberCount==null?'—':fmt(h.memberCount)}</button></td><td><div class="hall-admin-actions"><button class="soft-button" data-hall-action="edit" data-index="${h.index}" type="button" ${lock?'disabled':''}>Sửa</button><button class="text-button hall-admin-delete" data-hall-action="delete" data-index="${h.index}" type="button" ${lock?'disabled':''}>Xóa</button></div></td></tr>`,4));
  if(rosterIndex!=null){
   const selected=rows.find(h=>h.index===rosterIndex);
   if(!selected)closeRoster();
   else{
    get('[data-roster-title]').textContent='Đệ tử · '+selected.name;
    if(previousLock!==!!lock)loadRoster(rosterData?.page||1);
   }
  }
  const chosen=weekSelect.value,history=view?.weekly?.history||[];
  setHTML(weekSelect,'<option value="current">Tuần hiện tại</option>'+history.map(row=>`<option value="${row.week}">Tuần kết thúc ${date.format(row.endsAt)}</option>`).join(''));
  weekSelect.value=history.some(row=>String(row.week)===chosen)?chosen:'current';
  renderRank();
 };
}
