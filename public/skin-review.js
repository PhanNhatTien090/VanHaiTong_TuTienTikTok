import {SPECIAL_SKINS} from './patrons.js';
import {DIVINE_REALMS,DIVINE_ROLES} from './divine-wardrobe.js';
import {VISITOR_GIFT_REWARDS} from './visitor-rewards.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function skinReviewCatalog(realms=[]){
 const relics=new Map(Object.values(VISITOR_GIFT_REWARDS).map(r=>[r.skin,r.artifact]));
 return [...SPECIAL_SKINS.map(s=>({key:'special:'+s.id,name:s.name,group:'Skin sự kiện',skin:s.id,realm:0,relic:relics.get(s.id)||(s.id==='azure-patron'?'patron-sword':null)})),
 ...DIVINE_REALMS.map(d=>({key:'realm:'+d.realm,name:(realms[d.realm]||d.name),group:'Skin cảnh giới',realm:d.realm})),
 ...DIVINE_ROLES.map(d=>({key:'role:'+d.id,name:d.name,group:'Skin vinh danh',role:d.id,realm:6}))];
}
export function reviewActor(spec,{gender='nam',gear=false}={}){
 return {id:'skin-review-local',name:spec.name,gender,realm:spec.realm||0,giftCoins:0,qi:0,totalQi:0,stones:0,herbs:0,active:true,
 skinChoice:spec.skin||null,skinChoiceSource:spec.skin?'manual':null,rewardSkins:spec.skin?[spec.skin]:[],divineRoles:spec.role?[spec.role]:[],divineRoleChoice:spec.role||null,divineRoleHidden:!spec.role,
 equipped:gear?spec.relic||null:null,artifacts:gear&&spec.relic?[spec.relic]:[],skinGear:gear&&spec.relic?[spec.relic]:[],signatureArtifactOwned:!!(gear&&spec.relic),manuals:[]};
}
export function mountSkinReview(root,{Scene,realmNames=[]}){
 const catalog=skinReviewCatalog(realmNames);let selected=catalog.find(s=>s.skin==='nguyet-lien-tien-co')||catalog[0],gender='nam',stand=1,gear=false,active=false,raf=0,last=0,actor;
 root.innerHTML='<div class="skin-review-toolbar"><label>Skin<select id="reviewSkin"></select></label><label>Nhân vật<select id="reviewGender"><option value="nam">Nam</option><option value="nu">Nữ</option></select></label><div class="review-pose" role="group" aria-label="Tư thế"><button type="button" data-review-pose="1" aria-pressed="true">Đứng</button><button type="button" data-review-pose="0" aria-pressed="false">Ngồi</button></div><label class="review-gear"><input id="reviewGear" type="checkbox"> Kèm pháp bảo</label></div><figure class="skin-review-stage"><canvas id="skinReviewCanvas" aria-label="Xem thử skin và hiệu ứng"></canvas><figcaption id="reviewSkinName"></figcaption></figure>';
 const picker=root.querySelector('#reviewSkin');for(const group of [...new Set(catalog.map(s=>s.group))])picker.insertAdjacentHTML('beforeend','<optgroup label="'+esc(group)+'">'+catalog.filter(s=>s.group===group).map(s=>'<option value="'+esc(s.key)+'">'+esc(s.name)+'</option>').join('')+'</optgroup>');
 picker.value=selected.key;const canvas=root.querySelector('canvas'),renderer=new Scene(canvas,()=>{},{autoFrame:false});renderer.renderPreview=true;renderer.setQuality('balanced');renderer.motion=true;
 function update(){actor=reviewActor(selected,{gender,gear});root.querySelector('#reviewSkinName').textContent=selected.skin==='vuonglam-avatar'?(gender==='nu'?'Lý Mộ Uyển':'Vương Lâm'):selected.name;root.querySelector('#reviewGear').disabled=!selected.relic;renderer.characterFrames.clear();renderer.drawSkinReview(actor,performance.now(),stand);}
 function frame(t){if(!active)return;raf=requestAnimationFrame(frame);if(document.hidden||!canvas.clientWidth||t-last<1000/24)return;last=t;renderer.drawSkinReview(actor,t,stand);}
 picker.onchange=()=>{selected=catalog.find(s=>s.key===picker.value)||catalog[0];update();};root.querySelector('#reviewGender').onchange=e=>{gender=e.target.value;update();};root.querySelector('#reviewGear').onchange=e=>{gear=e.target.checked;update();};
 for(const b of root.querySelectorAll('[data-review-pose]'))b.onclick=()=>{stand=Number(b.dataset.reviewPose);for(const x of root.querySelectorAll('[data-review-pose]'))x.setAttribute('aria-pressed',String(x===b));update();};
 update();return {setActive(next){if(active===next)return;active=next;cancelAnimationFrame(raf);if(active){last=0;renderer.resize();raf=requestAnimationFrame(frame);}},get active(){return active;},catalog};
}
