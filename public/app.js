import {sourceVisualPreferences} from './visual-preferences.js';
import {cinematicQuality,VFX_LIMITS} from './cinematic-vfx.js';
import {renderMiniEvent} from './mini-event-ui.js?v=polish-20261114';
import {eventDonationContext,majorEventActive} from './event-donations.js';
import {ManagementState} from './management-state.js';
import {startLiveDiag,liveDiagSnapshot,RenderMetrics} from './live-diag.js';
import {mountAscensionStage,isAscensionEvent,prepareAscensionStage} from './ascension-stage.js';
import {rulesSummaryHTML} from './rules-summary.js';
import {streamState,participantCounts,liveRulesActive} from './live-integrity.js';
import {smallGift,shouldFocusEvent,mountRitualHud} from './live-cinema.js';
import {isNewbie} from './vip.js';
import {ArrivalWelcomes,isArrivalWelcome} from './arrival-welcome.js';
import {renderSimpleGuide} from './simple-guide.js?v=hall-war-20261114';
import {GiftComboBuffer} from './gift-combos.js';
import {renderCompanionHUD} from './companion-fx.js';
import {mountPetUI,renderPetUI} from './spirit-pet-ui.js';
import {ALL_PETS,petById} from './spirit-pets.js';
import {isEventAnnouncement} from './event-announcements.js';
import {breakthroughRealm,REALM_NAMES} from './breakthrough-fx.js';
import {divineSelection} from './divine-wardrobe.js';
import {mountEventTab,renderSocialUI} from './social-ui.js?v=tournament-registration';
import {VISITOR_GIFT_REWARDS} from './visitor-rewards.js';
import {VISITORS} from './visitor-event.js';
import {HonorUI} from './honor-ui.js';
import {PresentationQueue,presentationDuration,presentationPriority} from './presentation.js';
import {strikeProfile,HEAVEN_STRIKE_MS} from './heaven-strike.js';
import {scheduleHeavenStrikeAudio} from './heaven-strike-audio.js';
import {luxuryTier} from './luxury-fx.js';
import {highGiftName} from './high-gift-fx.js';
import {railHTML} from './command-rail.js';
import {divinePreview} from './skin-guide.js';
let skinReviewRequest=null;
function renderSkinReview(){if(overlay||!state)return;skinReviewRequest??=import('./skin-review.js?v=20261114').then(m=>m.mountSkinReview(document.querySelector('#skinReview'),{Scene,realmNames:state.realms}));skinReviewRequest.then(view=>view.setActive(currentTab==='skins'));}
// v42: bảng lệnh / trang bị dọc bên phải, đổi trang mỗi 12 giây.
let railPage=0;function renderRail(){if(state)renderSimpleGuide(state,esc,railPage);const el=document.querySelector('#commandRail');if(!el||!state)return;const html=railHTML(state,railPage,esc);if(el._last!==html){el.innerHTML=html;el._last=html;}}
setInterval(()=>{railPage++;renderRail();},12000);
import {safeAvatar} from './honors.js';
import {topPatron,SPECIAL_SKINS} from './patrons.js';
import {appearanceFor} from './realm-outfits.js';
import {Scene,portrait,symbols} from './scene.js?v=hall-war-drawn-pets-20261114';
import {VoiceQueue,raceOpeningVoice} from './voice.js';
import {IDLE_LINES,SCENE_ARRIVAL,CHECKIN_REMINDER} from './idle-lines.js';
import {nextAct,RESIDENT_VOICES} from './resident-acts.js';
import {residentCycle,setResidentRealm} from './residents.js';
import {CultivationAudio} from './audio.js?v=context-music-20261114';
import {initPuppetUI} from './puppet-ui.js';
import {showCeremony} from './ceremony.js';
import {mountGearGuide,renderGearGuide} from './gear-guide.js?v=event-guidance-20261113';
import {renderStageQueue} from './stage-queue.js';
import {hallsRankHTML,hallCardHTML,hallDuelHTML} from './ngu-duong-ui.js?v=hall-war-20261114';
import {showLinhBai} from './linh-bai.js';
import {InventoryDeck} from './inventory-multi.js';
import {realmWithStage} from './realm-stage.js';
import {showBaoHy} from './bao-hy.js';
import {renderTower} from './tower.js';
import {giftTokenHTML} from './gift-icons.js';
import {giftRules,giftRuleHTML} from './gift-rule-card.js?v=hall-war-20261114';
import {SCENES as MAP_SCENES} from './world-rotation.js';
import {SKINS,skinFor,nextSkin,spriteCell,visualGender} from './cosmetics.js';
const cultivationAudio=new CultivationAudio();
import {BGM_LIST,musicIndex,musicForState,musicChangesAt} from './music-rotation.js?v=context-music-20261114';
const $=s=>document.querySelector(s), esc=s=>String(s??'').normalize('NFC').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>new Intl.NumberFormat('vi-VN').format(n||0);
// All scene previews use the same HUD flow as the broadcast.
{
  const root=$('.scene-shell');
  // 08/11: TOP QUÀ là bảng riêng ở góc trên phải, phía trên widget mục tiêu quà của LIVE Studio (CSS trong moon-jade-theme.css).
  if(root&&!root.querySelector('#giftRanks')){const g=document.createElement('div');g.id='giftRanks';g.className='live-ranks compact-ranks gift-ranks';g.hidden=true;root.appendChild(g);}
  for(const [id,selectors] of [
    ['phoneHudLeft',['#liveRanks','#bossHud','#opportunityHud','#visitorHud','#socialHud']],
    ['phoneHudRight',['#giftBoard','#flowerHud','#commandRail']]
  ]){
    const rail=document.createElement('div');rail.id=id;rail.className='phone-hud-rail';
    for(const selector of selectors){const panel=root.querySelector(selector);if(panel)rail.appendChild(panel);}
    root.appendChild(rail);
  }
  const eventDock=document.createElement('aside');eventDock.id='eventInfoDock';
  eventDock.setAttribute('aria-label','Thông tin và cách tham gia sự kiện');
  for(const id of ['bossHud','opportunityHud','socialHud','flowerHud']){const panel=root.querySelector('#'+id);if(panel)eventDock.appendChild(panel);}
  const visitorInfo=document.createElement('section');visitorInfo.id='visitorEventInfo';visitorInfo.hidden=true;eventDock.appendChild(visitorInfo);
  root.querySelector('#phoneHudRight').insertBefore(eventDock,root.querySelector('#commandRail'));
  const dock=document.createElement('div');dock.className='scene-guide-dock';
  for(const selector of ['#honorBanner']){const panel=root.querySelector(selector);if(panel)dock.appendChild(panel);}
  root.appendChild(dock);
  mountGearGuide(root.querySelector('#phoneHudLeft'));
  const stageQueue=document.createElement('div');stageQueue.id='stageQueue';stageQueue.className='stage-queue';stageQueue.hidden=true;root.appendChild(stageQueue); // 11/11: Vân Đài · chờ lượt
  const linhBai=document.createElement('div');linhBai.id='linhBai';linhBai.className='linh-bai';linhBai.hidden=true;root.appendChild(linhBai); // 11/11: Linh Bài đạo hữu
  const inventoryDeckPanel=document.createElement('div');inventoryDeckPanel.id='inventoryDeck';inventoryDeckPanel.className='inventory-deck';inventoryDeckPanel.hidden=true;inventoryDeckPanel.setAttribute('aria-label','Hành trang của các đạo hữu');root.appendChild(inventoryDeckPanel);
  for(const [id,kind] of [['hallDuel','hall-duel'],['hallCard','hall-card']]){
    const panel=document.createElement('div');panel.id=id;panel.className='hall-panel '+kind;panel.hidden=true;root.appendChild(panel);
  }
  const baoHy=document.createElement('div');baoHy.id='baoHy';baoHy.className='bao-hy';baoHy.hidden=true;root.appendChild(baoHy); // 11/11: Ngọc Giản Báo Hỷ
  const towerEl=document.createElement('div');towerEl.id='towerStage';towerEl.className='tower-stage';towerEl.hidden=true;root.appendChild(towerEl); // 11/11: Vân Hải Tháp
  const disclosure=document.createElement('div');disclosure.className='live-disclosure';disclosure.textContent='TRÒ CHƠI TU TIÊN';root.appendChild(disclosure);
  const commands=root.querySelector('#basicCommands');if(commands){commands.classList.add('corner-command-guide');root.appendChild(commands);}
  // Bảng lệnh chung ở vị trí cũ; góc dưới phải dành riêng cho Ngũ Đường.
  {const right=root.querySelector('#phoneHudRight');if(right){
    if(commands){commands.classList.add('rail-guide');right.appendChild(commands);}
    right.insertBefore(dock,right.firstChild);dock.classList.add('rail-dock');
    const guideDock=document.createElement('aside');guideDock.id='lowerRightGuide';
    guideDock.setAttribute('aria-label','Hướng dẫn lệnh Ngũ Đường');
    guideDock.innerHTML='<b>NGŨ ĐƯỜNG</b><p class="hall-guide-names">1 Truyền Công · 2 Tàng Bảo<br>3 Đan Đỉnh · 4 Tuần Sơn<br>5 Linh Dược</p><ol><li><code>đường</code><span>xem các Đường, điểm tuần</span></li><li><code>vào đường 1–5</code><span>chọn số Đường muốn gia nhập</span></li><li><code>thách đấu 1–5</code><span>Thiên Bảng tranh ghế Trưởng Lão</span></li><li><code>trợ lực</code><span>hỗ trợ trận Vân Đài đang diễn ra</span></li><li><code>đường chiến</code><span>vào trận, trợ lực cho Đường</span></li><li><code>chân truyền + tên</code><span>Trưởng Lão mời đệ tử</span></li><li><code>bái sư</code><span>nhận lời mời Chân Truyền</span></li></ol>';
    root.appendChild(guideDock);
  }}
}

const params=new URLSearchParams(location.search),mode=params.get('world')==='live'?'live':'demo',overlay=params.get('overlay')==='1';
if(overlay)document.body.classList.add('overlay');else{document.body.classList.add('management-only');document.title='Vân Hải Tông · Quản lý LIVE';const panel=$('#audioPanel');panel.hidden=false;$('#managementDisplaySettings').append(panel);}
$('#worldSelect').value=mode;
let state=null,selected=null,online=false,initialized=false,seen=new Set(),auto=null,sound=false,lastProfile='',lastFeed='',lastCards='',toastTimer,spotTimer,queue=[],busy=false,currentTab='scene';
const honorUI=new HonorUI($('#honorBanner'));
setInterval(()=>honorUI.tick(busy),1000);
const scene=overlay?new Scene($('#sceneCanvas'),id=>selectPlayer(id)):new ManagementState($('#sceneCanvas'));if(overlay)prepareAscensionStage(scene);
const inventoryDeck=overlay?new InventoryDeck($('#inventoryDeck'),scene,esc):null; // 4/11: nạp sẵn ảnh thiên đài
const ascensionStage=overlay&&params.get('stage')==='ascension';scene.showcase=ascensionStage;document.body.classList.toggle('ascension-stage',ascensionStage);const ascensionLobby=ascensionStage?mountAscensionStage($('.scene-shell'),scene):null;
const qualitySelect=$('#qualityMode');
const shakeSelect=$('#shakeMode'),motionToggle=$('#reduceMotion'),flashToggle=$('#reduceFlash');
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
function applyVisualPreferences(){
const visualKeys={quality:'quality',shake:'camera-shake',motion:'reduce-motion',flash:'reduce-flash'};
let sharedVisual=null,visualSaving=0,visualWrites=Promise.resolve();
function localVisual(){
  const values={};
  for(const [key,storage] of Object.entries(visualKeys)){
    const value=localStorage.getItem('vanhai-'+storage);
    values[key]=key==='motion'||key==='flash'?value==='1':value;
  }
  return values;
}
  const preferences=sourceVisualPreferences(overlay?params:new URLSearchParams(),localVisual(),sharedVisual);
  if(scene.budget.mode!==preferences.quality)scene.setQuality(preferences.quality);
  scene.shakeLevel=preferences.shake;
  scene.motion=!motionPreference.matches&&!preferences.motion;
  scene.reduceFlash=!scene.motion||preferences.flash;
  qualitySelect.value=preferences.quality;
  shakeSelect.value=preferences.shake;
  motionToggle.checked=preferences.motion;
  flashToggle.checked=preferences.flash;
  document.body.classList.toggle('reduced-flash',scene.reduceFlash);
}
for(const [key,element] of Object.entries({quality:qualitySelect,shake:shakeSelect,motion:motionToggle,flash:flashToggle})){
  element.onchange=()=>{
    const value=element.type==='checkbox'?element.checked:element.value;
    localStorage.setItem('vanhai-'+visualKeys[key],typeof value==='boolean'?String(+value):value);
    const next={...(sharedVisual||localVisual()),[key]:value};
    if(!overlay){
      sharedVisual=next;
      visualSaving++;
      visualWrites=visualWrites.then(async()=>{
        const result=await fetch('/api/source-visual?world='+mode,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(next)});
        if(!result.ok)throw Error('Lưu thiết lập cảnh thất bại');
      }).catch(()=>toast('Không đồng bộ được thiết lập nguồn Link.')).finally(()=>visualSaving--);
    }
    applyVisualPreferences();
  };
}
motionPreference.addEventListener('change',applyVisualPreferences);
scene.renderPreview=!overlay;applyVisualPreferences();

let voiceCaptionTimer;
scene.onWarSound=(kind,side,strength)=>cultivationAudio.war(kind,side,strength);scene.onAlchemySound=(kind,strength)=>cultivationAudio.alchemy(kind,strength);scene.onSpectacleImpact=()=>cultivationAudio.play('impact',true);
scene.onCinematicSound=(...args)=>cultivationAudio.cinematicCue(...args);
scene.onCinematicCancel=id=>cultivationAudio.cinematic?.cancel(id);
scene.onFeedbackSound=(kind,level)=>cultivationAudio.feedback(kind,level);
scene.onCombatSound=(kind,variant)=>cultivationAudio.combat(kind,variant);scene.onBonkSound=(kind,o)=>cultivationAudio.bonk(kind,o); /* 10/11: Hội Gõ Đầu */
scene.onGiftSound=kind=>cultivationAudio.play(kind,true);
scene.onMazePortalSound=()=>cultivationAudio.play('maze-portal',true);
scene.onTowerSound=kind=>cultivationAudio.play('tower-'+kind,true);
scene.onEventGiftSound=(kind,context)=>cultivationAudio.eventGift(kind,context);
if(overlay)mountRitualHud($('.scene-shell'),scene);
scene.onRitualAudio=(event,elapsed)=>cultivationAudio.ritual(event,elapsed);
scene.onRitualSound=kind=>cultivationAudio.play(kind.startsWith('qi-')?kind:kind==='gather'?'qi':kind==='reveal'?'victory':kind==='surge'?'ascension-charge':kind==='echo'?'ascension-echo':kind==='rush'?'ascension-rush':kind==='screen-impact'?'ascension-screen-impact':'impact');
let voicePlayers={src:null,map:new Map()};const voicePlayer=id=>{if(voicePlayers.src!==state?.players)voicePlayers={src:state?.players,map:new Map((state?.players||[]).map(p=>[p.id,p]))};return voicePlayers.map.get(id)||null;}; // 08/11: giảm giọng đọc theo người chơi
const narrator=new VoiceQueue({world:mode,audio:cultivationAudio,player:voicePlayer,onStatus:text=>$('#audioStatus').textContent=text,onStart:(e,duration)=>{
  if(arrivalWelcomes.spoken(e,duration))return;
  if(shouldFocusEvent(e)&&!eventDonationContext(scene))scene.focus(e.user,duration+900);
  const caption=$('#voiceCaption');caption.textContent=e.name+' · '+e.text.split('•')[0];caption.hidden=false;
  clearTimeout(voiceCaptionTimer);voiceCaptionTimer=setTimeout(()=>caption.hidden=true,duration+300);
}});
const welcomeBanner=document.createElement('aside');welcomeBanner.className='arrival-welcome';welcomeBanner.hidden=true;welcomeBanner.setAttribute('aria-live','polite');$('.scene-shell').appendChild(welcomeBanner);
let welcomeBannerTimer;
const arrivalWelcomes=new ArrivalWelcomes({voice:narrator,show:(e,duration)=>{
 if(state)scene.update(state,selected);
 scene.noteEvent(e);scene.addEffect(e);scene.welcomeFocus={id:e.user,until:performance.now()+duration};tone('join');
 // A short greeting, not another fixed instruction table. Names are escaped.
 welcomeBanner.innerHTML='<small>'+ (e.returning?'MỪNG ĐỒNG MÔN TRỞ LẠI':'HOAN NGHÊNH GIA NHẬP TÔNG MÔN')+'</small><strong>'+esc(e.name||'Đạo hữu')+'</strong><span>Nhân vật của bạn đã vào sân · gõ <b>tu luyện</b> để thử</span>';
 welcomeBanner.hidden=false;clearTimeout(welcomeBannerTimer);welcomeBannerTimer=setTimeout(()=>welcomeBanner.hidden=true,duration);
}});
const overlayUrl=()=>`${location.origin}/?overlay=1&world=${mode}&sound=1&zoom=1&quality=auto&v=46#tiktok.studio`;
// Read the browser source's reported viewport, rather than assuming project resolution.
if(!overlay){
 const showSourceLayout=async()=>{const el=$('#sourceLayoutStatus');if(!el)return;try{
  const r=await fetch('/api/client-status',{cache:'no-store'});if(!r.ok)return;
  const sources=(await r.json()).filter(s=>s.overlay&&s.world===mode&&s.view).sort((a,b)=>Number(/TTElectron|TikTok/i.test(b.ua||''))-Number(/TTElectron|TikTok/i.test(a.ua||''))||b.at-a.at),source=sources[0];
  if(!source){el.textContent='Chưa có nguồn Link báo kích thước. Mở nguồn rồi xem lại tại đây.';return;}
  const {w,h,dpr}=source.view,layout=source.renderLayout;
  el.textContent='Trang nguồn báo '+w+' × '+h+' · DPR '+dpr+(layout?' · vùng game '+Math.round(layout.css.width)+' × '+Math.round(layout.css.height)+' · canvas '+layout.backing.width+' × '+layout.backing.height:' · làm mới nguồn để đo vùng game')+(Math.abs(w/h-9/16)>.005?' · Trang nguồn hiện chưa đúng tỷ lệ 9:16.':layout?.fillsViewport?' · Đã phủ đầy khung.':'');
 }catch{el.textContent='Chưa đọc được kích thước nguồn Link.';}};
  const v=source.visualStatus;
  if(v)el.textContent+=' · Yêu cầu '+v.requested+' / đang dùng '+v.applied+' · VFX '+v.vfx.particles+' hạt / '+v.vfx.rings+' vòng / '+v.vfx.glows+' glow · rung '+v.shake+' · giảm chuyển động '+(v.reduceMotion?'bật':'tắt')+' · giảm chớp '+(v.reduceFlash?'bật':'tắt')+' · '+(source.fps||'—')+' FPS'+(v.reason?' · '+v.reason:'');
 showSourceLayout();setInterval(showSourceLayout,10000);
}
$('#overlayUrl').textContent=overlayUrl();$('#exportLink').href=`/api/export?world=${mode}`;
const titles={puppets:['TU SĨ GIẢ','Tu sĩ giả','Tạo nhân vật và kích hoạt hành động bằng tay.'],skins:['SKIN','Xem skin',''],events:['SỰ KIỆN','Sự kiện tông môn','Mở hoạt động, theo dõi tỷ thí và quản lý lễ kết duyên.'],scene:['NGƯỜI TRÊN LIVE','Đạo hữu đang tu luyện','Quản lý người đang hoạt động, hồ sơ và trang bị từng đạo hữu.'],rules:['LỆNH & QUÀ','Lệnh và điều kiện nhận quà','Lệnh bình luận, mốc quà, skin và giá vật phẩm.'],settings:['THIẾT LẬP','Thiết lập','Kết nối TikFinity, link cảnh, sự kiện và sao lưu.']};
// Thế giới LIVE: ẩn bộ mô phỏng cho gọn (chỉ dùng ở thế giới thử nghiệm).
if(mode!=='demo')document.querySelector('.simulator').hidden=true;
$('#peopleSearch').addEventListener('input',()=>renderRank());$('#peopleFilter').addEventListener('change',()=>renderRank());
function tab(name){currentTab=name;document.body.classList.toggle('skin-review-open',!overlay&&name==='skins');document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===name+'View'));document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));const a=titles[name];$('#pageCrumb').textContent=a[0];$('#pageTitle').textContent=a[1];$('#pageSubtitle').textContent=a[2];if(name==='scene'){scene.resize();renderRank();}if(name==='skins')renderSkinReview();else skinReviewRequest?.then(view=>view.setActive(false));if(name==='puppets')puppetUI?.refresh();}
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{tab(b.dataset.tab);history.replaceState(null,'','#'+b.dataset.tab);}));
mountEventTab(post);
if(titles[location.hash.slice(1)])tab(location.hash.slice(1));
window.addEventListener('hashchange',()=>{const name=location.hash.slice(1);if(titles[name])tab(name);});
$('#worldSelect').addEventListener('change',e=>{params.set('world',e.target.value);location.search=params.toString();});
$('#overlayButton').onclick=()=>window.open(overlayUrl(),'_blank','noopener');
$('#copyOverlay').onclick=async()=>{try{await navigator.clipboard.writeText(overlayUrl());toast('Đã sao chép link cảnh OBS.');}catch{toast(overlayUrl());}};
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3600);}
async function post(path,data={}){if(!online){toast('Máy chủ chưa kết nối.');return {ok:false};}try{const r=await fetch(`${path}?world=${mode}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const v=await r.json();if(!v.ok)toast(v.message||'Chưa thực hiện được.');return v;}catch{toast('Mất kết nối máy chủ. Thử lại khi kết nối phục hồi.');return {ok:false};}}
const player=()=>state?.players.find(p=>p.id===selected);
function selectPlayer(id){selected=id;scene.focusId=id;scene.focusUntil=performance.now()+5000;lastProfile='';const p=player();if(p)$('#simName').value=p.name;render();}
// v33: khung chỉnh sửa từng người (cột phải). Chỉ dựng lại khi đổi người / sau khi lưu, để không xóa chữ đang gõ.
let editorFor=null;
function renderEditor(force=false){
  const el=$('#playerEditor');if(!el||overlay||!state)return;const p=player();
  if(!force&&editorFor===(p?.id??null))return;editorFor=p?.id??null;
  if(!p){el.innerHTML='';return;}
  const name=id=>state.catalog.find(x=>x.id===id)?.name||id;
  const owned=[...p.manuals,...p.artifacts];
  const giveable=state.catalog.filter(i=>i.type==='pill'||!owned.includes(i.id));
  const num=(id,label,v)=>`<label>${label}<input id="${id}" type="number" min="0" step="1" value="${Number(v)||0}"></label>`;
  el.innerHTML=`<details class="editor" open><summary>✎ Chỉnh sửa ${esc(p.name)}</summary><form id="editForm">
  <label class="wide">Tên hiển thị<input id="edName" maxlength="32" value="${esc(p.name)}"></label>
  <label>Xưng hô<select id="edGender"><option value="">Đạo hữu</option><option value="nam" ${p.gender==='nam'?'selected':''}>Sư huynh (nam)</option><option value="nu" ${p.gender==='nu'?'selected':''}>Sư tỷ (nữ)</option></select></label>
  <label>Cảnh giới<select id="edRealm">${state.realms.map((r,i)=>`<option value="${i}" ${i===p.realm?'selected':''}>${esc(r)}</option>`).join('')}</select></label>
  ${num('edQi','Tu vi hiện tại',p.qi)}${num('edStones','Linh thạch',p.stones)}${num('edHerbs','Linh thảo',p.herbs)}${num('edCoins','Coin quà (skin)',p.giftCoins)}
  <label class="wide">Đang trang bị<select id="edEquip"><option value="">— Không —</option>${p.artifacts.map(id=>`<option value="${esc(id)}" ${id===p.equipped?'selected':''}>${esc(name(id))}</option>`).join('')}</select></label>
  <label class="wide">Skin đang mặc<select id="edSkin"><option value="">Áo theo cảnh giới (mặc định)</option>${SPECIAL_SKINS.map(s=>`<option value="${esc(s.id)}" ${s.id===p.skinChoice?'selected':''}>${esc(s.name)}${p.rewardSkins?.includes(s.id)?'':' · cấp mới'}</option>`).join('')}</select></label>
  <label class="wide">Linh thú đồng hành<select id="edPet"><option value="">— Không dẫn linh thú —</option>${ALL_PETS.map(x=>`<option value="${esc(x.id)}" ${x.id===p.spiritPet?'selected':''}>${esc(x.name)} · ${esc(x.rank)}${p.spiritPets?.includes(x.id)?'':' · cấp mới'}</option>`).join('')}</select></label>
  <label class="wide check"><input id="edHonorWardrobe" type="checkbox" ${!p.divineRoleHidden?'checked':''}> Khi mặc áo tự động: dùng thần trang nếu đang giữ danh hiệu</label>
  <label class="wide check"><input id="edAnnounce" type="checkbox" checked> Hiện hiệu ứng + giọng đọc khi nâng cảnh giới</label>
  <div class="editor-actions wide"><button type="submit" class="gold-button">Lưu thay đổi</button><button type="button" id="edReset" class="soft-button">Hoàn tác</button><button type="button" id="edCooldown" class="soft-button">Xóa thời gian hồi</button></div>
  </form>
  <div class="editor-items"><b>Linh thú sở hữu</b>${(p.spiritPets||[]).length?p.spiritPets.map(id=>`<span>${esc(petById(id)?.name||id)}${id===p.spiritPet?' ✓':''} <button data-unpet="${esc(id)}" title="Gỡ linh thú">✕</button></span>`).join(''):'<small>Chưa có linh thú.</small>'}<b>Skin sở hữu</b>${(p.rewardSkins||[]).length?p.rewardSkins.map(id=>`<span>${esc(SPECIAL_SKINS.find(s=>s.id===id)?.name||id)}${id===p.skinChoice?' ✓':''} <button data-unskin="${esc(id)}" title="Gỡ skin">✕</button></span>`).join(''):'<small>Chưa có skin đặc biệt.</small>'}<b>Đồ đang có</b>${owned.length?owned.map(id=>`<span>${esc(name(id))} <button data-remove="${esc(id)}" title="Gỡ">✕</button></span>`).join(''):'<small>Chưa có bí pháp / pháp bảo.</small>'}${Object.entries(p.pills||{}).filter(([,n])=>n>0).map(([id,n])=>`<span>${esc(name(id))} ×${n}</span>`).join('')}
  <div class="editor-give"><select id="edGive">${giveable.map(i=>`<option value="${esc(i.id)}">${esc(i.name)} · ${{manual:'bí pháp',artifact:'pháp bảo',pill:'đan'}[i.type]||i.type}</option>`).join('')}</select><button type="button" id="edGiveBtn" class="soft-button">＋ Trao</button></div></div>
  <small class="muted">Chỉnh tay ghi vào dữ liệu ${mode==='live'?'LIVE':'thử'} ngay lập tức và được lưu nhật ký.</small></details>`;
  // 08/11: chỉ gửi ô thực sự đổi (kèm số lúc mở form) — trước đây gửi cả form làm lùi tu vi người chơi kiếm được trong lúc đang sửa.
  const base={name:p.name,gender:p.gender||null,realm:p.realm,qi:p.qi,stones:p.stones,herbs:p.herbs,giftCoins:p.giftCoins,equipped:p.equipped||null,skinChoice:p.skinChoice||null,spiritPet:p.spiritPet||null,divineRoleHidden:!!p.divineRoleHidden};
  const send=async(patch,msg)=>{const changed=Object.fromEntries(Object.entries(patch).filter(([k,v])=>!(k in base)||v!==base[k]));const r=await post('/api/player',{id:p.id,patch:changed,base,announce:$('#edAnnounce')?.checked});if(r.ok){toast(r.changes?.length?msg+': '+r.changes.join(', '):'Không có gì thay đổi.');await refresh();renderEditor(true);}};
  $('#editForm').onsubmit=e=>{e.preventDefault();send({name:$('#edName').value,gender:$('#edGender').value||null,realm:Number($('#edRealm').value),qi:Number($('#edQi').value),stones:Number($('#edStones').value),herbs:Number($('#edHerbs').value),giftCoins:Number($('#edCoins').value),equipped:$('#edEquip').value||null,skinChoice:$('#edSkin').value||null,spiritPet:$('#edPet').value||null,divineRoleHidden:!$('#edHonorWardrobe').checked},'Đã lưu');};
  $('#edReset').onclick=()=>renderEditor(true);
  $('#edCooldown').onclick=()=>send({resetCooldowns:true},'Đã xóa thời gian hồi');
  $('#edGiveBtn').onclick=()=>send({addItems:[$('#edGive').value]},'Đã trao');
  el.querySelectorAll('[data-unpet]').forEach(b=>b.onclick=()=>{if(confirm('Gỡ linh thú khỏi '+p.name+'?'))send({removePets:[b.dataset.unpet]},'Đã gỡ linh thú');});
  el.querySelectorAll('[data-unskin]').forEach(b=>b.onclick=()=>{if(confirm('Gỡ skin khỏi '+p.name+'?'))send({removeSkins:[b.dataset.unskin]},'Đã gỡ skin');});
  el.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{if(confirm('Gỡ '+name(b.dataset.remove)+' khỏi '+p.name+'?'))send({removeItems:[b.dataset.remove]},'Đã gỡ');});
}
async function act(type,extra={}){if(mode!=='demo'){toast('Dùng lệnh bình luận thật trong thế giới LIVE. Chuyển sang thử nghiệm để thao tác ở đây.');return;}const p=player();
  // Gõ "nhapmon nam/nu" khi chưa chọn ai → tạo nhân vật mới theo tên ở ô Đạo hữu (giống bình luận thật).
  if(!p&&type==='chat'&&/^!?nh[aậ]ps*m[oô]n/i.test(extra.text||'')){const name=$('#simName').value.trim()||'Đạo hữu mới',id='custom:'+name.toLocaleLowerCase('vi');const r=await post('/api/action',{type,userId:id,name,...extra});if(r.ok){selected=id;lastProfile='';await refresh();toast('Đã nhập môn: '+name);}return r;}
  if(!p){toast('Gõ nhập môn nam hoặc nhập môn nữ, hoặc bấm Nhập môn trước.');return;}return post('/api/action',{type,userId:p.id,name:p.name,...extra});}
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b||b.disabled)return;act(b.dataset.action,{...(b.dataset.item?{itemId:b.dataset.item}:{}),...(b.dataset.action==='like'?{count:50}:{})});});
$('#joinButton').onclick=async()=>{const name=$('#simName').value.trim();if(!name){toast('Nhập tên đạo hữu trước.');return;}const id='custom:'+name.toLocaleLowerCase('vi');const r=await post('/api/action',{type:'join',userId:id,name,gender:$('#simGender').value||undefined});if(r.ok){selected=id;lastProfile='';await refresh();toast('Đã nhập môn. Hãy thử tu luyện hoặc hái linh thảo.');}};
$('#chatButton').onclick=()=>{const text=$('#chatInput').value.trim();if(!text)return;act('chat',{text});$('#chatInput').value='';};
$('#chatInput').addEventListener('keydown',e=>{if(e.key==='Enter')$('#chatButton').click();});
$('#simName').addEventListener('keydown',e=>{if(e.key==='Enter')$('#joinButton').click();});
$('#bossButton').onclick=()=>post('/api/boss');
// Người dẫn kích hoạt Thiên Đạo Ban Phúc (dùng được cả ở thế giới LIVE).
async function bless(){const r=await post('/api/blessing',{count:3});if(r.ok){toast('Thiên đạo ban phúc: '+r.players.join(', '));refresh();}}
$('#blessButton').onclick=bless;if($('#blessButtonSettings'))$('#blessButtonSettings').onclick=bless;
$('#nextPlayer').onclick=()=>{if(!state?.players.length)return;const idx=state.players.findIndex(p=>p.id===selected);selectPlayer(state.players[(idx+1)%state.players.length].id);};
$('#bridgeButton').onclick=async()=>{const r=await post('/api/bridge',{enabled:!state.connection.enabled});if(r.ok)toast(r.connection.enabled?'Đang kết nối TikFinity Desktop…':'Đã ngắt kết nối TikFinity.');};
$('#giftForm').onsubmit=async e=>{e.preventDefault();const gifts=state.gifts.map((g,i)=>({...g,...Object.fromEntries(['min','qi','stones','herbs'].map(k=>[k,Number($(`#gift-${i}-${k}`).value)]))}));const r=await post('/api/gifts',{gifts});if(r.ok)toast('Đã lưu mốc quà và phần tu vi cho thế giới này.');};
$('#demoAuto').onclick=()=>{if(auto){clearInterval(auto);auto=null;$('#demoAuto').textContent='▷ Mô phỏng tự động';$('#demoAuto').setAttribute('aria-pressed','false');return;}auto=setInterval(()=>{if(!state||!online||mode!=='demo')return;const p=state.players[Math.floor(Math.random()*state.players.length)];if(!p)return;const types=['cultivate','gather','like','attack'];post('/api/action',{type:types[Math.floor(Math.random()*types.length)],userId:p.id,name:p.name,count:30});},4500);$('#demoAuto').textContent='Ⅱ Dừng mô phỏng';$('#demoAuto').setAttribute('aria-pressed','true');};
const audioValues={volume:45,ambient:60,sfx:85};
// One-time louder mix requested during LIVE; preserve deliberately muted channels.
if(localStorage.getItem('vanhai-audio-mix-version')!=='20261113-clear'){
 for(const [key,value] of Object.entries(audioValues)){const old=localStorage.getItem('vanhai-audio-'+key);if(old===null||Number(old)>0)localStorage.setItem('vanhai-audio-'+key,String(Math.max(Number(old)||0,value)));}
 localStorage.setItem('vanhai-audio-mix-version','20261113-clear');
}
for(const [key,id]of [['volume','masterVolume'],['ambient','ambientVolume'],['sfx','sfxVolume']]){const stored=Number(localStorage.getItem('vanhai-audio-'+key));const value=localStorage.getItem('vanhai-audio-'+key)!==null&&Number.isFinite(stored)?Math.max(0,Math.min(100,stored)):audioValues[key];$('#'+id).value=value;cultivationAudio.set(key,value/100);$('#'+id).oninput=e=>{cultivationAudio.set(key,Number(e.target.value)/100);if(key==='volume')narrator.setVolume(narrator.volume);localStorage.setItem('vanhai-audio-'+key,e.target.value);};}
function showAudioUnlock(){if(document.getElementById('audioUnlock'))return;const b=document.createElement('button');b.id='audioUnlock';b.textContent='Bật âm thanh';b.style.cssText='position:fixed;bottom:16px;left:16px;z-index:10000;padding:10px 16px;background:#153b49;color:white;border:1px solid #d9c78b;border-radius:8px;cursor:pointer';b.onclick=()=>enableAudio(true).catch(err=>{b.textContent='Bật âm thanh · thử lại';$('#audioStatus').textContent=err.message;});document.body.appendChild(b);}
async function enableAudio(on){
  if(!on)narrator.stop();
  await cultivationAudio.enable(on);sound=cultivationAudio.enabled;if(sound)document.getElementById('audioUnlock')?.remove();
  localStorage.setItem('vanhai-audio-enabled',String(sound));
  $('#soundButton').setAttribute('aria-pressed',String(sound));$('#soundButton').title=sound?'Tắt âm thanh':'Bật âm thanh';
  $('#soundButton').innerHTML=`♫ <span>${sound?'Âm thanh bật':'Bật âm thanh'}</span>`;
  $('#audioStatus').textContent=sound?'Nhạc nền + hiệu ứng đã bật':'Âm thanh đang tắt';
}
let userMuted=false;
$('#soundButton').onclick=async()=>{userMuted=cultivationAudio.enabled;try{await enableAudio(!cultivationAudio.enabled);if(sound)cultivationAudio.play('join');}catch(err){$('#audioStatus').textContent=err.message;toast('Bấm ▶ Thử âm trên nguồn để cho phép phát.');}};
$('#audioTest').onclick=async()=>{try{await enableAudio(true);cultivationAudio.play('breakthrough');await narrator.sample();}catch(err){$('#audioStatus').textContent=err.message;toast('Nguồn chưa phát được âm thanh: '+err.message);}};
narrator.enabled=params.has('voice')?params.get('voice')!=='0':localStorage.getItem('vanhai-voice-enabled')!=='false';$('#voiceToggle').checked=narrator.enabled;
$('#voiceToggle').onchange=e=>{narrator.enabled=e.target.checked;if(!narrator.enabled)narrator.stop();localStorage.setItem('vanhai-voice-enabled',String(narrator.enabled));};
$('#voiceVolume').value=localStorage.getItem('vanhai-voice-volume')??100;narrator.setVolume(Number($('#voiceVolume').value)/100);
$('#voiceVolume').oninput=e=>{narrator.setVolume(Number(e.target.value)/100);localStorage.setItem('vanhai-voice-volume',e.target.value);};
scene.cameraEnabled=localStorage.getItem('vanhai-camera')!=='false';$('#cameraToggle').checked=scene.cameraEnabled;
$('#cameraToggle').onchange=e=>{scene.cameraEnabled=e.target.checked;localStorage.setItem('vanhai-camera',String(e.target.checked));};
// Thu phóng cho màn hình điện thoại: ?zoom=1.4 trên link nguồn được ưu tiên, sau đó là thanh trượt (lưu theo trình duyệt).
function setZoom(v){v=Math.max(1,Math.min(1.7,Number(v)||1));scene.zoom=v;$('#zoomLevel').value=Math.round(v*100);$('#zoomValue').textContent=Math.round(v*100)+'%';}
let savedZoom=null;try{
  if(localStorage.getItem('vanhai-wide-zoom')!=='1'){localStorage.setItem('vanhai-zoom','1');localStorage.setItem('vanhai-wide-zoom','1');}
  savedZoom=localStorage.getItem('vanhai-zoom');
}catch{}
const legacyOverlayZoom=overlay&&params.get('zoom')==='1.3'&&(params.get('v')==='44'||location.hash==='#tiktok.studio');
setZoom(legacyOverlayZoom?1:params.get('zoom')||savedZoom||1);
$('#zoomLevel').oninput=e=>{setZoom(e.target.value/100);try{localStorage.setItem('vanhai-zoom',String(scene.zoom));}catch{}};
// Lời tông sư khi cảnh vắng: sau ~90–150 giây không có giọng đọc nào, phát một câu (không lặp lại câu gần đây).
let idleOn=params.get('idle')==='1';try{if(!params.has('idle'))idleOn=localStorage.getItem('vanhai-idle')==='true';}catch{}
$('#idleToggle').checked=idleOn;$('#idleToggle').onchange=e=>{idleOn=e.target.checked;try{localStorage.setItem('vanhai-idle',String(idleOn));}catch{}};
// Trang tự báo tình trạng âm thanh về máy chủ (xem tại /api/client-status) để chẩn đoán LIVE Studio.
const clientId=Math.random().toString(36).slice(2,10);let lastAudioError='';
window.addEventListener('error',e=>{lastAudioError='JS: '+e.message;});
function reportStatus(){fetch('/api/client-status',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({diag:liveDiagSnapshot(),renderPerf:renderMetrics?.snapshot(scene),audioPerf:renderMetrics?cultivationAudio.voiceLoad():undefined,view:{w:innerWidth,h:innerHeight,dpr:devicePixelRatio,px:Math.round(innerWidth*devicePixelRatio)+"x"+Math.round(innerHeight*devicePixelRatio)},voiceLag:narrator.lagStats?.(),id:clientId,ua:navigator.userAgent.slice(-60),overlay,world:mode,visualStatus:{requested:scene.budget.mode,applied:scene.budget.level,vfx:VFX_LIMITS[cinematicQuality(scene)],shake:scene.shakeLevel,reduceMotion:!scene.motion,reduceFlash:scene.reduceFlash,reason:scene.budget.pressured?'Tải kéo dài':scene.budget.crowded?'Đông nhân vật':scene.budget.level!==scene.budget.mode&&scene.budget.mode!=='auto'?'FPS thấp':''},audioEnabled:cultivationAudio.enabled,audioLevels:{master:cultivationAudio.volume,music:cultivationAudio.ambient,sfx:cultivationAudio.sfx,ducked:cultivationAudio.ducked,musicOutput:cultivationAudio.music?.volume},ctx:cultivationAudio.ctx?.state||'none',music:cultivationAudio.music?(cultivationAudio.music.paused?'paused':'playing'):'none',voiceOn:narrator.enabled,idleOn,running:narrator.running,queue:narrator.queue.length,status:$('#audioStatus').textContent,error:lastAudioError,zoom:scene.zoom,camera:scene.cameraEnabled,motion:scene.motion,opportunityVisible:!!$('#opportunityHud')&&!$('#opportunityHud').hidden,caption:$('#voiceCaption').textContent,spot:$('#spotlight').textContent,residents:residentsOn,acts:residentActs,skip:residentSkip,q:queue.length,busy,fps:scene.fps,frameMs:scene.frameMs,frameP95:scene.frameP95,cacheMiB:scene.cacheMiB,active:state?.players?.filter(p=>p.active).length,onStage:scene.targets?.length,trips:scene.mover?[...scene.mover.trips.values()].filter(x=>x.kind!=='hover'&&performance.now()-x.t0<4200).length:0,bubbles:scene.mover?.bubbles.size,voiceQ:narrator.queue.length,activeVoiceId:narrator.activeVoiceId,voicePriorities:narrator.queue.map(x=>x.e.raceEntry?"race-entry":x.e.effect),version:90,managementOnly:!overlay,quality:scene.budget.level,renderWidth:scene.canvas.width,renderLayout:scene.renderLayout?.(),cachedActors:scene.characterFrames.frames.size,visualQueue:queue.length,coalesced:presentations.coalesced,solo:scene.presentation?.until>performance.now()})}).catch(()=>{});}
const renderMetrics=overlay&&params.get('perf')==='1'?new RenderMetrics():null;
if(overlay)scene.metrics=renderMetrics;
startLiveDiag(renderMetrics);setInterval(reportStatus,5000);setTimeout(reportStatus,1500);
let rankRenderedAt=0,lastRanksHTML='';
function renderLiveRanks(force=false){
  const el=$('#liveRanks');if(!state||!el||(!force&&Date.now()-rankRenderedAt<2000))return;
  rankRenderedAt=Date.now();
  // Luân phiên 8 giây: TOP TU VI ↔ TÂN TÚ 24H (người vào trong 24 giờ) để người mới có một bảng chen vào được.
  const realFirst=(a,b)=>(a.puppet?1:0)-(b.puppet?1:0); // tu sĩ giả luôn xếp sau người thật
  const rookies=[...state.players].filter(p=>!p.resident&&!p.puppet&&p.active&&Date.now()-(p.joinedAt||0)<86400000).sort((a,b)=>b.totalQi-a.totalQi).slice(0,3);
  const rookieTurn=rookies.length>0&&Math.floor(Date.now()/8000)%2===1;
  const ranked=rookieTurn?rookies:[...state.players].filter(p=>!p.resident&&!p.puppet&&p.active).sort((a,b)=>b.totalQi-a.totalQi).slice(0,3);
  const short=s=>Array.from(s||'Đạo hữu').slice(0,11).join('');
  const leader=topPatron(state.players.filter(p=>p.active&&!p.resident&&!p.puppet),state.patronCurrent);
  const qiHtml=state.halls?hallsRankHTML(state,esc,state.serverNow||Date.now()):'<div class="qi-leaders"><b>'+(rookieTurn?'🌱 TÂN TÚ 24H':'TOP TU VI')+'</b>'+ranked.map((p,i)=>`<span>${i+1}. ${esc(short(p.name))} <strong>${fmt(p.totalQi)}</strong><small class="rank-realm">${esc(realmWithStage(p.realmName||state.realms[p.realm]||'Phàm nhân',p.realmStage))}</small></span>`).join('')+'</div>';
  const giftHtml=((state.topGifters||[]).length?'<div class="qi-leaders gift-leaders"><b>TOP QUÀ</b>'+state.topGifters.slice(0,3).map((g,i)=>{const av=safeAvatar(g.avatar);return `<span class="gift-top gift-top-${i+1}"><i class="gift-top-portrait"><em>${esc(Array.from(g.name||'Đ')[0])}</em>${av?`<img src="${esc(av)}" alt="" referrerpolicy="no-referrer" onerror="this.remove()">`:''}<svg viewBox="${[1,2,0][i]*512} 0 512 512" aria-hidden="true"><image href="/assets/honor-frames-v2.png" width="1536" height="512" preserveAspectRatio="none"/></svg></i><span class="gift-top-text"><small class="gift-top-title">${['ĐỆ NHẤT CUNG PHỤNG','NHỊ CUNG PHỤNG','TAM CUNG PHỤNG'][i]}</small><span class="gift-top-line">${esc(short(g.name))} · <strong>${fmt(g.giftCoins)}</strong> coin</span></span></span>`;}).join('')+'</div>':(leader?`<div class="patron-leader"><b>${state.patronEnabled?'ĐẠI HỘ PHÁP':'TOP QUÀ'}</b> ${esc(short(leader.name))} · ${fmt(leader.giftCoins)} coin tích lũy</div>`:''));
  const giftEl=$('#giftRanks'),html=giftEl?qiHtml:qiHtml+giftHtml;
  if(force||html!==lastRanksHTML){el.innerHTML=html;lastRanksHTML=html;}
  if(giftEl&&(force||giftHtml!==giftEl.dataset.html)){giftEl.innerHTML=giftHtml;giftEl.dataset.html=giftHtml;giftEl.hidden=!giftHtml;}
}
let giftReceiptTimer;
// 08/11 tối: tông chủ ban lễ — thẻ thông báo hiện ngay (trước đây chỉ có hiệu ứng hoa sen, không chữ).
function showAdminReceipt(e){const el=$('#giftReceipt');if(!el)return;const r=e.reward||{},parts=[r.qi&&'+'+fmt(r.qi)+' tu vi',r.stones&&'+'+fmt(r.stones)+' linh thạch',r.herbs&&'+'+fmt(r.herbs)+' linh thảo'].filter(Boolean);
  el.innerHTML=`<strong>👑 Tông chủ ban ${esc(e.comboName||'phần thưởng')} · ${esc(e.name)}</strong>${parts.length?`<span>${parts.join(' · ')}</span>`:''}${e.buff?.mult?`<span>✦ Phúc duyên ×${String(e.buff.mult).replace('.',',')} trong ${e.buff.minutes} phút</span>`:''}`;el.hidden=false;clearTimeout(giftReceiptTimer);giftReceiptTimer=setTimeout(()=>el.hidden=true,10000);}
function showGiftReceipt(e){
  if(e.raceGift&&e.raceBoost){const el=$('#giftReceipt');if(!el)return;el.innerHTML=`<strong>⚡ ${esc(e.name)} · ${esc(e.gift||'Quà tặng')}${(Number(e.count)||1)>1?' ×'+e.count:''}</strong><span>Bứt tốc +${fmt(e.raceBoost)} trượng</span>`;el.hidden=false;clearTimeout(giftReceiptTimer);giftReceiptTimer=setTimeout(()=>el.hidden=true,6000);return;} // 07/11: đang đua chỉ báo bứt tốc
  const g=state?.gifts.find(g=>g.name===e.tier),count=Math.max(1,Number(e.count)||1),q=e.reward?.qi??Number(String(e.text).match(/\+(\d+) tu vi/)?.[1]||0),stones=e.reward?.stones??(g?.stones||0)*count,herbs=e.reward?.herbs??(g?.herbs||0)*count;
  const el=$('#giftReceipt');if(!el)return;
  el.innerHTML=`<strong>✓ ${esc(e.name)} · ${esc(e.gift||'Quà tặng')}${count>1?' ×'+count:''}</strong><span>Đã cộng +${fmt(q)} tu vi · +${fmt(stones)} linh thạch${herbs?' · +'+fmt(herbs)+' linh thảo':''}</span>${e.reward?.itemNames?.length?`<span>✦ Đã trao ${esc(e.reward.itemNames.join(' · '))}</span>`:''}${e.buff?.mult?`<span>✦ Phúc duyên ×${String(e.buff.mult).replace('.',',')} tu luyện trong ${e.buff.minutes} phút</span>`:''}`;
  el.hidden=false;clearTimeout(giftReceiptTimer);giftReceiptTimer=setTimeout(()=>el.hidden=true,12000);
}

let arrivalPending=true;
let lastVoiceAt=Date.now(),idleWait=100000,idleRecent=[],idleCount=0;
let checkinAt=Date.now(),checkinWait=120000;
async function idleLine(){
  const available=IDLE_LINES.map((l,i)=>i).filter(i=>!idleRecent.includes(i));const preferred=available.filter(i=>idleCount%3===2?IDLE_LINES[i].cta:!IDLE_LINES[i].cta);const pool=preferred.length?preferred:available;
  const i=pool[Math.floor(Math.random()*pool.length)]??0;
  lastVoiceAt=Date.now();idleWait=90000+Math.random()*60000;
  if(await narrator.idle(IDLE_LINES[i])){idleCount++;idleRecent=[...idleRecent,i].slice(-3);}
  lastVoiceAt=Date.now();
}
setInterval(()=>{
  if(!overlay)return;
  if(narrator.running||narrator.queue.length){lastVoiceAt=Date.now();return;}
  if(arrivalPending&&initialized&&cultivationAudio.enabled&&narrator.enabled){arrivalPending=false;if(!state?.environment?.ambience)narrator.idle(SCENE_ARRIVAL);lastVoiceAt=Date.now();return;}
  if(mode==='live'&&Date.now()-lastVoiceAt>=8000&&Date.now()-checkinAt>=checkinWait){checkinAt=Date.now();checkinWait=240000+Math.random()*120000;narrator.idle(CHECKIN_REMINDER).then(()=>lastVoiceAt=Date.now());return;}
  if(idleOn&&Date.now()-lastVoiceAt>=idleWait)idleLine();
},3000);
// Tu tiên giả thường trú tự hoạt động 4–8 giây một lần: tung chiêu, lĩnh ngộ, chế tạo tinh thể, đột phá, đánh yêu thú.
// Có khách thật thì nhường: không chen khi hàng trình diễn đang dài, giọng luôn xếp sau khách.
let residentsOn=true;try{residentsOn=localStorage.getItem('vanhai-residents')!=='false';}catch{}
const residentProgress={};let lastViewerAt=0,residentActs=0,residentSkip='';
function applyResidents(){scene.residents=residentsOn;$('#residentToggle').checked=residentsOn;if(state)scene.update(state,selected);}
$('#residentToggle').onchange=e=>{residentsOn=e.target.checked;try{localStorage.setItem('vanhai-residents',String(residentsOn));}catch{}applyResidents();};
applyResidents();
(function residentLoop(){
  if(!overlay)return;
  setTimeout(residentLoop,60000+Math.random()*30000); // nhân vật thường trú: 1–1,5 phút mới làm một việc (trước 4–8 giây)
  if(scene.stage&&!scene.stage.order.some(id=>String(id).startsWith('resident:'))){residentSkip='offstage';return;}
  if(state?.socialScene||state?.raceStatus?.active){residentSkip='social-event';return;}
  if(!residentsOn||!state||queue.length>2||Date.now()-lastViewerAt<30000){residentSkip=[!residentsOn&&'off',!state&&'nostate',queue.length>2&&'queue'+queue.length,Date.now()-lastViewerAt<30000&&'viewer'].filter(Boolean).join(',');return;}
  residentActs++;residentSkip='';
  const act=nextAct(residentProgress,{realms:state.realms,boss:!!state.boss,cycle:residentCycle()});
  if(act.effect==='breakthrough')return; // Dedicated round-robin below owns NPC breakthroughs.
  const free=!narrator.running&&!narrator.queue.length,roll=Math.random();
  if(free&&roll<.22&&idleOn){delete act.file;enqueue(act);idleLine();return;}
  if(!free||roll>.6)delete act.file;
  enqueue(act);
})();
// Cột phải: luôn giữ bảng Quà → Thưởng; các bảng phụ (Linh Thú Cốc, Cùng tu, sự kiện…) chỉ hiện MỘT cái, xoay vòng 8 giây,
// để cột không dài xuống đè lên nhân vật ở hàng ghế trên.
if(overlay)setInterval(()=>renderGearGuide(state,esc),1000);
if(overlay){
  const tower=document.getElementById('towerStage');
  setInterval(()=>{if(state?.tower||!tower.hidden)renderTower(tower,state,scene,esc);},250);
}
if(overlay)setInterval(()=>renderStageQueue(document.getElementById('stageQueue'),queue,Date.now(),current,esc),500);
// 09/11: thẻ luật quà (cột phải) bám NGAY DƯỚI bảng TOP QUÀ để không che người giữa sân; TOP QUÀ ẩn thì lên sát góc trên.
if(overlay){const placeRail=()=>{const shell=document.querySelector('.scene-shell'),rail=document.getElementById('phoneHudRight'),top=document.getElementById('giftRanks');if(!shell||!rail)return;
  let y='.8%';if(top&&!top.hidden&&getComputedStyle(top).display!=='none'){const a=shell.getBoundingClientRect(),b=top.getBoundingClientRect();if(b.height>0)y=Math.round(b.bottom-a.top+Math.max(3,a.height*.004))+'px';}
  if(rail.style.top!==y)rail.style.setProperty('top',y);};placeRail();setInterval(placeRail,1000);addEventListener('resize',placeRail);}
if(overlay){let railTurn=0;setInterval(()=>{const rail=document.getElementById('phoneHudRight');if(!rail)return;
  const extra=[...rail.children].filter(el=>!['giftBoard','giftRanks','eventInfoDock','basicCommands'].includes(el.id));for(const el of extra)el.classList.remove('rail-rotate-hide');
  const shown=extra.filter(el=>!el.hidden&&getComputedStyle(el).display!=='none'&&el.textContent.trim());
  if(shown.length<2)return;railTurn=(railTurn+1)%shown.length;shown.forEach((el,i)=>{if(i!==railTurn)el.classList.add('rail-rotate-hide');});},8000);}
// Lịch NPC: đúng mốc thì NPC đó đột phá (hiệu ứng + tiêu đề cảnh giới); đầu chu kỳ mới thì 3 NPC mới nhập môn.
// 4/11/2026: TikTok khóa quà vì "reproduced content" — NPC đột phá liên tục (1 giây sau màn trước) tạo đoạn lặp y hệt. Giờ 6–10 phút/lần.
const npcBreakGap=()=>360000+Math.floor(Math.random()*240000);
let npcBreakAt=Date.now()+180000,npcBreakTurn=0,npcBreakRunning=false,npcBreakEventId=null;
setInterval(()=>{
  if(!overlay)return;
  const now=Date.now();
  if(npcBreakRunning){if(queue.some(e=>e.id===npcBreakEventId)||scene.effects.some(e=>e.id===npcBreakEventId&&performance.now()-e.start<e.duration))return;npcBreakRunning=false;npcBreakAt=now+npcBreakGap();lastFullRitualAt=Date.now();return;}
  if(now<npcBreakAt||!residentsOn||!state||ascensionStage||state.socialScene||state.raceStatus?.active)return;
  const slots=residentCycle().slots,s=slots[npcBreakTurn%slots.length];
  const p=scene.playerIndex?.get(s.id);if(!p)return;
  const max=(state.realms?.length||19)-1,from=(p.realm||0)>=max?0:p.realm||0,to=from+1;
  npcBreakEventId=`resident-bt-${now}-${s.id}`;
  enqueue({id:npcBreakEventId,at:now,user:s.id,name:s.name,text:`ĐỘT PHÁ ${String(state.realms?.[to]||'').toUpperCase()}`,effect:'breakthrough',kind:'breakthrough',fromRealm:from,toRealm:to,visualFrom:{...p,realm:from},visualTo:{...p,realm:to},resident:true,actorKind:'npc',scheduled:true});
  npcBreakTurn++;npcBreakRunning=true;
  setResidentRealm(s.id,to); // Retain the new outfit when subsequent snapshots rebuild the plaza.
},1000);
if(overlay&&params.get('sound')!=='0'){
  enableAudio(true).catch(()=>{showAudioUnlock();$('#audioStatus').textContent='Bị chặn tự phát · bấm Bật âm thanh';$('#soundButton').title='Bấm để cho phép phát âm';});
}
// A click inside the source unlocks playback when autoplay has been blocked.
/* 10/11: không chỉ 1 lần — bấm/gõ phím lúc nào cũng thử mở lại; mỗi 5 s tự thử lại; đang bật mà nhạc/ctx bị dừng thì tự phát lại. */
if(overlay&&params.get('sound')!=='0'){const unlock=e=>{if(e?.target?.closest?.('#soundButton,#audioTest'))return;if(!cultivationAudio.enabled&&!userMuted)enableAudio(true).then(()=>document.getElementById('audioUnlock')?.remove()).catch(()=>{});};for(const k of ['pointerdown','keydown','touchstart'])document.addEventListener(k,unlock,{capture:true});setInterval(()=>{if(!cultivationAudio.enabled)unlock(null);else cultivationAudio.keepAlive();},5000);}
$('#audioSettings').onclick=()=>{$('#audioPanel').hidden=!$('#audioPanel').hidden;};$('#audioClose').onclick=()=>{$('#audioPanel').hidden=true;};
function tone(type){cultivationAudio.play(type);}
const isFollow=e=>String(e.text).startsWith('Kết duyên');
// Khi đông: chỉ quà / đột phá / ban phúc / skin / follow có khung tên riêng; việc thường → hiệu ứng nhẹ + bong bóng
// + bộ đếm "10 giây qua"; nhập môn dồn dập → đọc gộp. Hàng khung tên tối đa SPOT_MAX lượt.
const presentations=new PresentationQueue(12);queue=presentations.items;const pulse=[];let joinBatch=0;
const important=e=>e.petAward||e.gift||isFollow(e)||['breakthrough','blessing','skin','victory','dragon','ready','hint','status','title','opportunity','flower'].concat('transform').includes(e.effect);
const giftCombos=new GiftComboBuffer({quiet:350,maxWait:2000});
setInterval(()=>{for(const e of giftCombos.drain(Date.now()))enqueueReady(e);},150);
// 4/11/2026: chống lặp hình — Luyện Khí (tân thủ nào cũng có) chỉ chiếu màn toàn cảnh nếu 90 s qua chưa có màn đột phá nào; không thì hiệu ứng ngắn.
let lastFullRitualAt=0;
function throttleRitual(e){if(e?.effect!=="breakthrough"||ascensionStage||!e.resident&&e.actorKind!=='npc')return e;const now=Date.now();// 4/11 tối: mọi cảnh giới tối đa 1 màn toàn cảnh / 60 s (Luyện Khí 90 s) — nhiều người đột phá liền nhau từng tạo cảnh lặp nối đuôi.
  if(now-lastFullRitualAt<(breakthroughRealm(e)<=1?90000:60000))return {...e,effect:"qi",kind:undefined,ritualSkipped:true};lastFullRitualAt=now;return e;}
function enqueue(e){if(!overlay)return;e=throttleRitual(e);if(e?.card&&['bag','pets','skins'].includes(e.card.kind)){if(!ascensionStage)inventoryDeck?.show(e,state?.players?.find(p=>p.id===e.user));return;}if(ascensionStage){enqueueReady(e);return;}if(e.gift){scene.noteEvent(e);giftCombos.push(e,Date.now());return;}enqueueReady(e);}
let engagementSoundAt=-Infinity;
// 07/11/2026: QUÀ HIỆN NGAY LÚC TẶNG. Thẻ quà hiện lập tức; quà ưu tiên cao nhất và cắt ngang hiệu ứng thường.
// Quà lớn (≥99 coin hoặc quà VIP) cắt cả màn đột phá cảnh giới thấp (≤ Hóa Thần). Không cắt Thiên Đạo, đại điển, quà khác.
const GIFT_STALE_MS=10000;let current=null,currentTimer=null;
const giftValue=e=>(Number(e.coins)||0)*Math.max(1,Number(e.count)||1);
function giftMayPreempt(cur,g){if(!cur||cur.gift||cur.heavenStrike||cur.ceremony)return false;if(cur.effect==='breakthrough')return (giftValue(g)>=99||!!luxuryTier(g))&&breakthroughRealm(cur)<=5;return true;}
function interruptShow(){clearTimeout(spotTimer);clearTimeout(currentTimer);$('#spotlight').classList.remove('visible');scene.interruptPresentation?.();cultivationAudio.ritual(null);busy=false;current=null;}
function showDiscipleNotice(e){
 let box=document.getElementById('discipleNotices');
 if(!box){box=document.createElement('aside');box.id='discipleNotices';box.setAttribute('role','status');box.setAttribute('aria-live','polite');document.querySelector('.scene-shell').appendChild(box);}
 const card=document.createElement('div');card.className='disciple-notice';
 card.innerHTML=`<b>✦ KẾT NẠP CHÂN TRUYỀN THÀNH CÔNG ✦</b><strong>${esc(e.name||'Đạo hữu')}</strong><span>Đệ tử Chân Truyền · ${esc(e.achieve.item||'Ngũ Đường')}</span>`;
 box.appendChild(card);while(box.children.length>3)box.firstElementChild.remove();
 setTimeout(()=>card.remove(),6000);
}
function enqueueReady(e){
  // Event cards and the battlefield own these updates; never queue one spotlight/voice per hit or claim.
  if(e.miniStart||e.miniEnd||e.miniReward||e.hallWarAction||e.hallWarReward||e.hallWarStart||e.hallWarBattle||e.hallWarEnd){
    if(e.miniReward||e.hallWarReward||e.hallWarEnd)scene.feedbackFX?.add(e,performance.now(),scene);
    if(!ascensionStage&&(e.miniStart||e.miniEnd||e.hallWarStart||e.hallWarBattle||e.hallWarEnd))narrator.add(e);
    if(e.miniReward&&performance.now()-engagementSoundAt>1000){tone('lotus');engagementSoundAt=performance.now();}
    return;
  }
  if(raceOpeningVoice(e)&&state?.raceStatus?.entryAnnouncement)e={...e,...state.raceStatus.entryAnnouncement};
  // 4/11/2026: đưa vào hàng giọng NGAY khi nhận (trước khi hiệu ứng/chữ đến lượt hiện) — giọng đến sớm hơn chữ.
  if(!e.resident&&!isArrivalWelcome(e))narrator.add(e);
  if(ascensionStage&&!isAscensionEvent(scene,e)){if(!e.resident)narrator.add(e);return;}
  if(e.achieve?.kind==='disciple'){showDiscipleNotice(e);scene.noteEvent(e);tone('lotus');return;}
  if(isArrivalWelcome(e)){arrivalWelcomes.add(e);return;}
  if(e.engagementAction){scene.noteEvent(e);narrator.add(e);const now=performance.now();if(now-engagementSoundAt>800){tone(e.engagementAction==='follow'?'petal':'lotus');engagementSoundAt=now;}return;}
  if(isEventAnnouncement(e)||e.gift)narrator.add(e);
  if(e.adminGift)showAdminReceipt(e);
  if(e.gift&&!e.resident){e._arrivedAt??=Date.now();showGiftReceipt(e);if(!eventDonationContext(scene)&&busy&&current&&giftMayPreempt(current.e,e))interruptShow();}
  if(e.gift&&eventDonationContext(scene)){scene.noteEvent(e);scene.addEffect(e);return;}
  scene.noteEvent(e);if(!e.resident)pulse.push({t:Date.now(),e});
  if(e.resident&&!e.scheduled&&(busy||queue.length))return; // đột phá/nhập môn theo lịch của NPC không bị bỏ khi đang bận
  if(e.effect==='join'&&!e.vipReturn&&queue.length>=3){joinBatch++;return;}
  if(e.effect==='attack'&&e.technique&&!e.resident){pushAttack(e);return;}
  presentations.push(e);playNext();
}
// v76: đòn đánh yêu thú chạy LÀN RIÊNG song song (2 người cùng lúc, ≥12 người đang chơi → 3), không chờ hàng hiệu ứng chung.
// Mỗi người chỉ giữ đòn mới nhất trong hàng; đòn chờ quá 8 giây thì bỏ để không ai bị đánh trễ.
const attackQ=[];let attackRunning=0;
const attackSlots=()=>(state?.players||[]).filter(p=>p.active&&!p.resident).length>=12?3:2;
const TECH_TONE={thunder:'boss',soul:'dragon',lotus:'lotus',stars:'petal',celestial:'breakthrough',bamboo:'sword',vortex:'qi',frost:'sword',flame:'dragon',bell:'boss',dragon:'dragon',petal:'petal',meteor:'boss',flowersword:'petal',peachfan:'petal',flowercage:'lotus',starmirror:'breakthrough',stararrow:'sword',sevenstars:'boss',stardust:'qi'};
function pushAttack(e){const i=attackQ.findIndex(x=>x.user===e.user);const entry={...e,_at:Date.now()};if(i>=0)attackQ[i]=entry;else attackQ.push(entry);if(attackQ.length>12)attackQ.shift();pumpAttacks();}
function pumpAttacks(){
  const now=Date.now();while(attackQ.length&&now-attackQ[0]._at>8000)attackQ.shift();
  if(scene.presentation?.until>performance.now()){setTimeout(pumpAttacks,400);return;} // đang solo quà/đột phá → chờ
  while(attackRunning<attackSlots()&&attackQ.length){const e=attackQ.shift();attackRunning++;
    scene.addEffect(e);if(!scene.boss)tone(TECH_TONE[e.technique.id]||'attack');narrator.add(e);
    setTimeout(()=>{attackRunning=Math.max(0,attackRunning-1);pumpAttacks();},Math.round((e.technique.duration||2000)*.8));}
}

setInterval(()=>{if(joinBatch>=2)narrator.add({id:'sum-'+Date.now(),summary:'joins',count:joinBatch,effect:'join',text:''});joinBatch=0;},8000);
// Bộ đếm "10 giây qua" trên đầu cảnh: người không có ghế vẫn thấy hành động của mình được tính.
setInterval(()=>{const now=Date.now();while(pulse.length&&now-pulse[0].t>10000)pulse.shift();const el=$('#crowdPulse');if(!el)return;
  if(pulse.length<6){el.hidden=true;return;}
  const n={tu:0,join:0,gift:0,heart:0,other:0};for(const {e}of pulse){if(e.gift)n.gift++;else if(e.effect==='join')n.join++;else if(String(e.text).startsWith('Tụ linh'))n.heart++;else if(/^Vận|^Luận|^Hái/.test(String(e.text)))n.tu++;else n.other++;}
  el.innerHTML=`✦ 10 giây qua: <b>${pulse.length}</b> lượt`+[[n.tu,'tu luyện'],[n.join,'nhập môn'],[n.heart,'thả tim'],[n.gift,'quà']].filter(([k])=>k).map(([k,l])=>` · ${k} ${l}`).join('');el.hidden=false;},1000);
function playNext(){
 if(busy||state?.halls?.match)return;let e;for(;;){e=presentations.take(Date.now(),e=>!(majorEventActive(state)&&(e.effect==='breakthrough'||e.effect==='transform'||e.petAward)));if(!e)return;if(e.gift&&e._arrivedAt&&Date.now()-e._arrivedAt>GIFT_STALE_MS)continue;if(!presentations.start(e))continue;break;} // 07/11: quà quá trễ thì bỏ màn diễn (thẻ quà đã hiện lúc tặng)
 if(e.gift&&eventDonationContext(scene)){scene.noteEvent(e);scene.addEffect(e);showGiftReceipt(e);queueMicrotask(playNext);return;}
 busy=true;current={e,at:Date.now()};
 if(e.heavenStrike){scene.startHeavenStrike(e);const au=cultivationAudio;if(au.enabled&&au.ctx?.state==='running'){au.duck(true);scheduleHeavenStrikeAudio(au.ctx,au.fxBus,strikeProfile(e.heavenStrike.seed));}currentTimer=setTimeout(()=>{au.duck(false);busy=false;current=null;playNext();},HEAVEN_STRIKE_MS+200);return;} // 07/11: Thiên Đạo giáng lôi
 if(e.ceremony){showCeremony(document.getElementById('ceremony'),e);narrator.add(e);tone('breakthrough');currentTimer=setTimeout(()=>{busy=false;current=null;playNext();},presentationDuration(e)+200);return;} // v84: đại điển vinh danh
 const luxury=luxuryTier(e),duration=presentationDuration(e);
 if(e.petAward){const el=$('#giftReceipt');el.innerHTML=`<strong>${esc(e.name)} · Linh thú đồng hành</strong><span>${esc((e.petNames||[]).join(' · '))}</span>`;el.hidden=false;clearTimeout(giftReceiptTimer);giftReceiptTimer=setTimeout(()=>el.hidden=true,duration);}
 if(e.gift)showGiftReceipt(e);
 if(e.visitorProgress){const r=VISITOR_GIFT_REWARDS[e.visitorProgress.kind];$('#giftReceipt').insertAdjacentHTML('beforeend',`<span>✦ ${esc(r.skinName)}: đã góp ${Math.min(100,Math.round(e.visitorProgress.coins/(r.artifactCoins||500)*100))}% · ${giftTokenHTML(state.giftArt,r.skinCoins||100)} → skin · ${giftTokenHTML(state.giftArt,r.artifactCoins||500)} → ${esc(r.artifactName)}</span>`);}
 if(e.loyaltyAward||e.visitorAward){const el=$('#giftReceipt');el.innerHTML=`<strong>Tri ân ${esc(e.name)}</strong><span>${esc(e.itemNames.join(' · '))}</span>`;el.hidden=false;clearTimeout(giftReceiptTimer);giftReceiptTimer=setTimeout(()=>el.hidden=true,duration);}
 scene.addEffect(e);honorUI.show(e);if(e.effect!=='breakthrough'||![1,2,3,4,5,6,7,8,9,10].includes(breakthroughRealm(e)))tone(e.effect==='breakthrough'?'qi':e.technique?({thunder:'boss',soul:'dragon',lotus:'lotus',stars:'petal',celestial:'breakthrough',bamboo:'sword',vortex:'qi',frost:'sword',flame:'dragon',bell:'boss',dragon:'dragon',petal:'petal',meteor:'boss',flowersword:'petal',peachfan:'petal',flowercage:'lotus',starmirror:'breakthrough',stararrow:'sword',sevenstars:'boss',stardust:'qi'})[e.technique.id]||'attack':e.effect);narrator.add(e);
 if(shouldFocusEvent(e)&&!eventDonationContext(scene)&&!scene.raceStatus?.active&&!scene.socialStage?.length)scene.focus(e.user,duration);
 const label=e.raceGift?(e.raceBoost?'BỨT TỐC +'+e.raceBoost+' trượng':'Quà đã ghi nhận · chờ kết quả xếp hạng'):e.technique?.name||highGiftName(e)||luxury?.name||({breakthrough:'ĐỘT PHÁ · '+REALM_NAMES[breakthroughRealm(e)],join:'Nhập môn',attack:'Xuất chiêu',qi:'Tu luyện',sword:'Ngự kiếm',lotus:'Liên hoa trận',dragon:'Thanh long giáng thế',victory:'Bí cảnh hoàn tất',boss:'Yêu thú giáng thế',opportunity:e.opportunityEnd?'Cơ duyên kết thúc':'Thiên Đạo Cơ Duyên',transform:'BIẾN HÌNH · '+String(e.skinName||'').toUpperCase()})[e.effect]||e.text;
 // v39: trên cảnh LIVE chỉ còn 1 khung (khung tên này); phần thưởng gộp thành 1 dòng nhỏ thay cho khung biên nhận riêng.
 const r=e.reward,extra=r&&!e.raceGift&&(e.gift||e.flowerRank||e.loyaltyAward)?[r.qi&&`+${fmt(r.qi)} tu vi`,r.stones&&`+${fmt(r.stones)} linh thạch`,...(r.itemNames||e.itemNames||[]).slice(0,2),e.buff?.mult&&`Phúc duyên ×${String(e.buff.mult).replace('.',',')}`].filter(Boolean).join(' · '):'';
 $('#spotlight').innerHTML=`<strong>${esc(e.name)}</strong><span>${esc(label)}</span>${extra?`<small class="spot-reward">${esc(extra)}</small>`:''}`;
 if(e.achieve&&!e.gift&&showBaoHy(document.getElementById('baoHy'),e,scene,state?.players?.find(p=>p.id===e.user),esc,duration)){clearTimeout(spotTimer);spotTimer=setTimeout(()=>{busy=false;current=null;playNext();},duration+150);return;} // 11/11: rèn/học/ban thưởng/VIP → Báo Hỷ
 if(e.hallCard){
   const panel=$('#hallCard');panel.innerHTML=hallCardHTML(e.hallCard,esc);panel.hidden=false;
   clearTimeout(spotTimer);spotTimer=setTimeout(()=>{panel.hidden=true;busy=false;current=null;playNext();},duration);return;
 }
 if(e.card&&showLinhBai(document.getElementById('linhBai'),e,scene,state?.players?.find(p=>p.id===e.user),esc,duration)){clearTimeout(spotTimer);spotTimer=setTimeout(()=>{busy=false;current=null;playNext();},duration+150);return;} // 11/11: gõ 9 → Linh Bài thay khung tên
 $('#spotlight').classList.add('visible');clearTimeout(spotTimer);
 spotTimer=setTimeout(()=>{$('#spotlight').classList.remove('visible');busy=false;current=null;playNext();},duration+150);
}

// Compatibility for a LIVE server started before membership was added to snapshots.
// Stop reading exports automatically once snapshots supply the field themselves.
let legacyHallMembers=null,hallMembershipReadAt=0,hallMembershipLoading=false;
function withHallMembership(s){
 if(!s.halls||!s.players.some(p=>!Object.hasOwn(p,'sectHallIndex')))return s;
 if(!hallMembershipLoading&&Date.now()-hallMembershipReadAt>15000){
  hallMembershipLoading=true;hallMembershipReadAt=Date.now();
  fetch(`/api/export?world=${mode}`,{cache:'no-store',signal:AbortSignal.timeout(8000)})
   .then(r=>{if(!r.ok)throw Error('Hall membership unavailable');return r.json();})
   .then(w=>{
    legacyHallMembers=new Map(Object.entries(w.nguDuong?.members||{}).map(([id,m])=>[id,m.index]));
    if(state){state=withHallMembership(state);scheduleRender();}
   }).catch(()=>{}).finally(()=>{hallMembershipLoading=false;});
 }
 return legacyHallMembers?{...s,players:s.players.map(p=>Object.hasOwn(p,'sectHallIndex')?p:{...p,sectHallIndex:legacyHallMembers.get(p.id)??null})}:s;
}

function receive(s){
  s=withHallMembership(streamState(s,mode));
  ascensionLobby?.update(s,queue);
  document.querySelector('.live-disclosure').textContent=mode==='live'&&s.liveIntegrityVersion!==1?'M\u00c1Y CH\u1ee6 CH\u01afA \u00c1P D\u1ee4NG LU\u1eacT LIVE M\u1edaI':'TRÒ CHƠI TU TIÊN';
  const previous=state;state=s;if(overlay&&s.raceStatus?.entryAnnouncement)narrator.add(s.raceStatus.entryAnnouncement);honorUI.update(s);if(initialized&&previous){const previousPlayers=new Map(previous.players.map(p=>[p.id,p]));for(const p of s.players){const old=previousPlayers.get(p.id);if(old&&skinFor(p.giftCoins).level>skinFor(old.giftCoins).level)enqueue({id:'skin:'+p.id+':'+p.giftCoins,user:p.id,name:p.name,effect:'skin',text:skinFor(p.giftCoins).name});}}online=true;$('#disconnectBanner').hidden=true;$('#saveStatus').textContent='● Đã kết nối · tự lưu mỗi 3s';if(!selected||!state.players.some(p=>p.id===selected))selected=state.players[0]?.id||null;
  for(let e of s.events){if(e.effect==='breakthrough'){const old=previous?.players.find(p=>p.id===e.user),next=s.players.find(p=>p.id===e.user);e={...e,visualFrom:e.visualFrom||(old?{...old,realm:e.fromRealm??old.realm}:undefined),visualTo:e.visualTo||(next?{...next,realm:breakthroughRealm(e)}:undefined)};}if(!seen.has(e.id)&&(initialized||e.autoArrival&&s.serverNow-e.at<8000)){enqueue(e);lastViewerAt=Date.now();}seen.add(e.id);}if(seen.size>1000)seen=new Set([...seen].slice(-300));
  if(!visualSaving&&JSON.stringify(s.sourceVisual??null)!==JSON.stringify(sharedVisual)){
    sharedVisual=s.sourceVisual??null;applyVisualPreferences();
  }
  if(!initialized){initialized=true;const p=player();if(p)$('#simName').value=p.name;renderGifts();renderGuide();renderLiveRanks(true);}
  scheduleRender();
}
let renderPending=false;function scheduleRender(){if(renderPending)return;renderPending=true;setTimeout(()=>{renderPending=false;render();},100);}
// 08/11 tối: THẺ LUẬT QUÀ (ô #giftBoard cột phải) — ảnh quà thật → kết quả theo sự kiện đang mở.
function renderGiftRules(){const el=$('#giftBoard');if(!el)return;const r=giftRules(state,state?.serverNow);setHUD(el,giftRuleHTML(r,state?.giftArt));el.hidden=!r?.rows?.length;el.dataset.tone=r?.tone||'';el.classList.add('gift-rule-card');}
function setHUD(el,html){if(el._lastHUD!==html){el.innerHTML=html;el._lastHUD=html;}}
mountPetUI(post);
function render(){if(!state)return;const renderStart=renderMetrics?performance.now():0;document.body.classList.toggle('has-major-event',majorEventActive(state));if(overlay){document.body.classList.toggle('pet-cove-stage',state.environment?.id==='pet-cove');renderCompanionHUD(state);renderLikeGoal();renderEngagement();}renderPetUI(state,!overlay);if(!overlay){renderScenePicker();renderQuickGift();renderLiveControls();renderHeavenPanel();}renderSocialUI(state,!overlay);if(overlay)renderVisitorHud();const p=player();const sceneStart=renderMetrics?performance.now():0;scene.update(state,selected);const sceneCost=renderMetrics?performance.now()-sceneStart:0;cultivationAudio.setTrack(musicForState(state).index);if(majorEventActive(state)&&busy&&current&&(current.e.effect==='breakthrough'||current.e.effect==='transform'||current.e.petAward)){const deferred=current.e;interruptShow();if(deferred.effect!=='breakthrough')presentations.push(deferred);}if(overlay){if(!busy)playNext();renderFocus();}const active=state.players.filter(p=>p.active),counts=participantCounts(state.players);$('#statPlayers').textContent=fmt(counts.players);$('#statProfiles').textContent=`${fmt(state.playerCount??state.players.length)} hồ sơ được lưu`;$('#statQi').textContent=fmt(state.sectQi);$('#statInteractions').textContent=fmt(state.totalInteractions);$('#sceneCount').textContent=counts.players;$('#worldBadge').textContent=mode==='demo'?'THỬ NGHIỆM':'LIVE';$('#worldNote').textContent=mode==='demo'?'Dữ liệu thử · tách biệt LIVE':'Dữ liệu LIVE · lưu trên máy';$('#demoControls').hidden=mode!=='demo';$('#liveControlsNotice').hidden=mode==='demo';$('#simLabel').textContent=mode==='demo'?'KHÔNG DÙNG QUÀ THẬT':'ĐANG NHẬN SỰ KIỆN THẬT';
  const connected=state.connection.status==='connected';setHUD($('.scene-location'),'<i></i> '+esc(state.environment?.name||'Tụ Linh Đài').toUpperCase()+(mode==='demo'?'<small>THỬ</small>':connected?'<small>LIVE</small>':'<small>CHỜ KẾT NỐI</small>'));$('#connectionText').textContent=mode==='demo'?'Bộ mô phỏng sẵn sàng':connected?'TikFinity đã kết nối':'TikFinity chưa kết nối';$('#connectionDot').classList.toggle('off',mode==='live'&&!connected);$('#bridgeStatus').textContent=({connected:'Đã kết nối • đang nhận sự kiện',connecting:'Đang kết nối…',reconnecting:'Đang thử kết nối lại sau mỗi 5 giây',disconnected:'Chưa kết nối'})[state.connection.status]+` · ${fmt(state.connection.received)} sự kiện`;
  $('#bridgeError').textContent=state.connection.lastError||'';$('#bridgeButton').textContent=state.connection.enabled?'Ngắt kết nối':'Kết nối TikFinity';
  const remain=Math.max(0,Math.ceil(((state.boss?.endsAt||state.nextBossAt)-state.serverNow)/1000));$('#scenePhase').textContent=state.raceStatus?.active?'Vân Hải Thiên Lộ':state.socialScene?(state.socialScene==='tournament'?'Luận Kiếm':'Tam Sinh Ước'):state.boss?`Bí cảnh còn ${remain}s`:`♜ ${Math.floor(remain/60)}:${String(remain%60).padStart(2,'0')}`;
  const bh=$('#bossHud');bh.hidden=!state.boss||state.boss.species==='abyss-dragon';bh.classList.toggle('visible',!bh.hidden);document.body.classList.toggle('abyss-fight',state.boss?.species==='abyss-dragon'&&state.boss.hp>0); // 05/11: bảng yêu lực Ma Long vẽ trên canvas, ẩn bảng xếp hạng góc trái để không chồng
  if(state.boss)setHUD(bh,`<div class="boss-line"><span>♜ ${esc(state.boss.name)}</span><span>${fmt(state.boss.hp)} / ${fmt(state.boss.maxHp)}</span></div><div class="progress"><i style="width:${state.boss.hp/state.boss.maxHp*100}%"></i></div><small>Gõ <b>danh</b> · ${remain}s · ${esc(state.boss.encounter?.name||'Top công lực nhận thưởng')}</small>${Object.entries(state.boss.damage||{}).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,3).map(([id,d],i)=>`<small class="boss-rank">${i+1}. ${esc(state.players.find(p=>p.id===id)?.name||'Đạo hữu')} · ${fmt(d)} công lực</small>`).join('')}`);
  if(!overlay&&currentTab==='skins')renderSkinReview();if(overlay){renderFlowerHud();renderRail();renderLiveRanks();renderGiftRules();
    const duel=$('#hallDuel'),duelHTML=hallDuelHTML(state.halls,esc,state.serverNow);
    duel.hidden=!duelHTML;document.body.classList.toggle('hall-dueling',!!duelHTML);
    if(duelHTML)setHUD(duel,duelHTML);}else syncAutoEvents();
  const oh=$('#opportunityHud'),o=state.opportunity,seconds=o?Math.max(0,Math.ceil((o.endsAt-state.serverNow)/1000)):0;oh.hidden=!seconds;
  if(seconds){const offset=Math.floor(state.serverNow/7000)%Math.ceil(o.costs.length/4)*4;setHUD(oh,`<b>CƠ DUYÊN · ${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}</b><span>${o.costs.slice(offset,offset+4).map((cost,i)=>`${esc(state.realms[offset+i])} ${cost} coin`).join(' · ')}</span><small>Từ Hóa Thần: tối đa 1 đại cảnh/ngày · tiến độ dư được giữ · gõ cơ duyên</small>`);}
  if(overlay)return;
  const sig=JSON.stringify(p);if(sig!==lastProfile){lastProfile=sig;renderProfile(p);}
  renderEditor();
  const cardSig=JSON.stringify([selected,p?.stones,p?.herbs,p?.realm,p?.manuals,p?.artifacts,p?.equipped,p?.pills]);if(cardSig!==lastCards){lastCards=cardSig;renderCards(p);renderRank();}
  if(state.feed[0]?.id!==lastFeed){lastFeed=state.feed[0]?.id;renderFeed();}
  if(currentTab==='scene')renderRank(true);
  // Dynamic cooldowns without replacing focused action buttons.
  document.querySelectorAll('[data-cooldown]').forEach(b=>{const key=b.dataset.cooldown,secs=Number(b.dataset.seconds),left=Math.max(0,Math.ceil((secs*1000-(state.serverNow-(p?.cooldowns[key]||0)))/1000));b.textContent=left?`${b.dataset.label} · ${left}s`:b.dataset.label;b.disabled=mode!=='demo'||left>0;});
  if(renderMetrics)renderMetrics.add("hudAndDispatch",Math.max(0,performance.now()-renderStart-sceneCost));
}
// v37: Thiên Hoa Vũ — mưa hoa trên cảnh + bảng đếm ngược / Top 3 trực tiếp.
function renderFlowerHud(){
  const ev=state.flowerEvent,el=$('#flowerHud'),left=ev&&!ev.closedAt?Math.max(0,ev.endsAt-state.serverNow):0;
  scene.flowerUntil=left?Date.now()+left:0;scene.flowerKind=ev?.kind||'flower';if(left&&!scene.flowerFrom)scene.flowerFrom=Date.now()-Math.max(0,state.serverNow-ev.startedAt);if(!left)scene.flowerFrom=0;
  if(!el)return;el.hidden=!left;if(!left)return;const meteor=ev.kind==='meteor';el.classList.toggle('meteor',meteor);const s=Math.ceil(left/1000),name=id=>state.players.find(p=>p.id===id)?.name||'Đạo hữu';
  const top=Object.entries(ev.scores||{}).sort((a,b)=>b[1]-a[1]).slice(0,3);
  setHUD(el,`<b>${meteor?'TINH HÀ LƯU TINH':'THIÊN HOA VŨ'} · ${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}</b><span>${liveRulesActive(state)?'\u0110i\u1ec3m: l\u1ec7nh ch\u01a1i 5 \u00b7 qu\u00e0 100/coin':meteor?'Điểm tổng: cmt 5 · tim 1 · quà 100/coin':'Điểm tổng: tim 1 · quà 100/coin'}</span>${(()=>{ // v67: ghi rõ thưởng tu vi + linh thạch + pháp bảo + phúc duyên cho từng hạng
    const cfg=state.skyEvents?.[ev.kind||'flower'],item=id=>state.catalog?.find(i=>i.id===id)?.name||'pháp bảo',rw=t=>t?`+${fmt(t.qi)} tu vi`:'';
    const rows=[0,1,2].map(i=>{const e=top[i],t=cfg?.rewards?.[i];return `<small class="fh-rank">${['🥇','🥈','🥉'][i]} ${e?`<b>${esc(Array.from(name(e[0])).slice(0,10).join(''))}</b> ${fmt(e[1])}đ`:'<i>trống</i>'}${t?` <em>${rw(t)}</em>`:''}</small>`;}).join('');
    const pt=cfg?.participant;return rows+(pt?`<small class="fh-all">Top 3 + pháp bảo · ≥${pt.minScore}đ +${fmt(pt.qi)} tu vi</small>`:'')+(top.length?'':liveRulesActive(state)?'<small>G\u00f5 tuluyen / hai / danh \u0111\u1ec3 tham gia</small>':(meteor?'<small>Bình luận ngay để bắt sao!</small>':'<small>Thả tim ngay để lên bảng!</small>'));})()}`);
}
async function flowerEvent(minutes,kind='flower'){const r=await post('/api/flower-event',{minutes,kind});if(r.ok)toast((kind==='meteor'?'Tinh Hà Lưu Tinh':'Thiên Hoa Vũ')+' bắt đầu: '+minutes+' phút.');}
for(const b of document.querySelectorAll('[data-visitor]'))b.onclick=async()=>{const r=await post('/api/visitor-event',{kind:b.dataset.visitor});if(r.ok)toast('Tiên nhân đã đến · gõ coduyen trên LIVE');};
for(const b of document.querySelectorAll('[data-flower]'))b.onclick=()=>flowerEvent(Number(b.dataset.flower),b.dataset.kind||'flower');
// Tự động sự kiện: công tắc + khoảng cách (phút).
function syncAutoEvents(){const box=$('#autoEvents'),min=$('#autoEventMinutes'),note=$('#autoEventNote');if(!box||!state)return;const st=state.settings||{};if(document.activeElement!==box)box.checked=st.autoEvents!==false;const rnd=$('#autoRandom');if(rnd&&document.activeElement!==rnd)rnd.checked=!!st.autoRandom;if(document.activeElement!==min)min.value=st.autoEventMinutes??15;
  const next=state.nextAutoEventAt?Math.max(0,Math.round((state.nextAutoEventAt-state.serverNow)/60000)):null;note.textContent=st.autoEvents===false?'Đang tắt.':next!==null?`${st.autoRandom?'🎲 Random · ':''}Sự kiện tự động tiếp theo khoảng ${next} phút nữa (cần ≥2 người đang hoạt động, không có yêu thú).`:'Sẽ hẹn sự kiện đầu tiên sau 5 phút.';}
if($('#autoRandom'))$('#autoRandom').onchange=async e=>{const r=await post('/api/event-settings',{autoRandom:e.target.checked});if(r.ok)toast(e.target.checked?'Đã bật random tất cả sự kiện.':'Đã tắt random — quay lại luân phiên Hoa Vũ / Lưu Tinh.');};
if($('#autoEvents')){$('#autoEvents').onchange=async e=>{const r=await post('/api/event-settings',{autoEvents:e.target.checked});if(r.ok)toast(e.target.checked?'Đã bật sự kiện tự động.':'Đã tắt sự kiện tự động.');};$('#autoEventMinutes').onchange=async e=>{const r=await post('/api/event-settings',{autoEventMinutes:Number(e.target.value)});if(r.ok)toast('Sự kiện tự động mỗi '+e.target.value+' phút.');};}
function renderProfile(p){const el=$('#profile');if(!p){el.innerHTML='<div class="empty-state">Tiên môn đang đợi người hữu duyên.<br>Gõ <b>nhapmon</b> trong LIVE để bắt đầu.</div>';return;}const pct=Math.min(100,p.qi/p.neededQi*100),can=p.finalRealmEligible!==false&&p.progressionReady!==false&&p.qi>=p.neededQi&&p.stones>=p.neededStones&&p.realm<state.realms.length-1;const equipped=state.catalog.find(i=>i.id===p.equipped);el.innerHTML=`<div class="profile-portrait">${divineSelection(p)?divinePreview(divineSelection(p),visualGender(p)==='nu'?1:0):portrait(skinFor(p.giftCoins).robe)}</div><h2 class="profile-name">${esc(p.name)}</h2><p class="profile-social">Mã đạo hữu #${esc(p.socialCode||'')} · ${fmt(p.companionPoints)} điểm Đồng môn · ${fmt(p.tournamentMedals)} huy chương · ${fmt(p.tournamentWins)} lần vô địch${p.bondVip?'<br>'+esc(p.bondVip.name)+' · Đạo lữ '+p.bondVip.used+'/'+p.bondVip.limit:''}${(p.bondInfos||[p.bondInfo].filter(Boolean)).map(b=>'<br>♥ '+esc(b.a===p.id?b.bName:b.aName)+' · '+b.days+' ngày đồng hành').join('')}</p><span class="realm-chip">✧ ${esc(p.realmName)} · ${p.realm>1?'NỘI MÔN':'ĐỆ TỬ'}</span><div class="skin-profile" style="--skin-color:${skinFor(p.giftCoins).trim}"><b>✧ ${esc(appearanceFor(p).name)}</b><small>${fmt(p.giftCoins)} coin quà đã gửi${nextSkin(p.giftCoins)?' · '+fmt(nextSkin(p.giftCoins).min-p.giftCoins)+' tới bậc linh quang tiếp theo':' · Linh quang tối đa'}</small></div><div class="profile-qi"><span>Tu vi hiện tại</span><b>${fmt(p.qi)} / ${fmt(p.neededQi)}</b></div><div class="progress"><i style="width:${pct}%"></i></div><div class="profile-qi-note">Đột phá cần ${fmt(p.neededStones)} linh thạch</div><div class="profile-resources"><div><span>◈ LINH THẠCH</span><strong>${fmt(p.stones)}</strong></div><div><span>♧ LINH THẢO</span><strong>${fmt(p.herbs)}</strong></div><div><span>⚔ SỨC MẠNH</span><strong>${fmt(p.power)}</strong></div></div><div class="profile-actions"><button class="soft-button" data-action="cultivate" data-cooldown="cultivate" data-seconds="10" data-label="✦ Tu luyện">✦ Tu luyện</button><button class="soft-button" data-action="gather" data-cooldown="gather" data-seconds="30" data-label="♧ Hái linh thảo">♧ Hái linh thảo</button><button class="soft-button" data-action="checkin" ${mode==='live'?'disabled':''}>☀ Điểm danh</button><button class="soft-button" data-action="attack" data-cooldown="attack" data-seconds="4" data-label="⚔ Xuất chiêu">⚔ Xuất chiêu</button></div><button class="breakthrough" data-action="breakthrough" ${!can||mode==='live'?'disabled':''}>${can?'✺ Đột phá '+esc(state.realms[p.realm+1]):'✧ Tích lũy để đột phá'}</button><div class="profile-equipment">${p.dailyPracticeStatus?.enabled?'<p>Tu luyện hiệu suất cao hôm nay: '+fmt(p.dailyPracticeStatus.used)+' / '+fmt(p.dailyPracticeStatus.limit)+' điểm'+(p.dailyPracticeStatus.exhausted?' · Tiếp tục nhận 10% tu vi':'')+'<br><small>Làm mới lúc 0 giờ Việt Nam. Hết điểm vẫn tiếp tục tu luyện và nhận 10% tu vi. Vật phẩm vẫn nhận đầy đủ; đan dược giữ lại cho ngày sau để không hao phí.</small></p>':''}${p.dailyAscensionStatus?.enabled?'<p>Đột phá đại cảnh hôm nay: '+p.dailyAscensionStatus.used+' / '+p.dailyAscensionStatus.limit+' · làm mới 0 giờ</p>':''}${p.opportunityCredit?.balance?'<p>Tiến độ Cơ duyên đã lưu: '+fmt(p.opportunityCredit.balance)+'</p>':''}${p.reincarnations?'<p>✦ Chuyển sinh lần '+fmt(p.reincarnations)+' · đã từng đạt '+esc(state.realms[p.highestRealm]||'')+'</p>':''}${p.rebirthEligible?'<p>Đã mở chuyển sinh: gõ chuyển sinh, rồi chuyển sinh xác nhận trong 30 giây. Trở về Phàm nhân, tu vi hiện tại về 0; giữ tổng tu vi, đồ và thành tích.</p>':''}<h4>ĐẠO PHÁP & TRANG BỊ</h4><div class="equipment-row"><span class="equipment-icon">▤</span><span>${p.manuals.length?esc(state.catalog.find(x=>x.id===p.manuals.at(-1))?.name):'Chưa lĩnh ngộ bí pháp'}<small>${p.manuals.length} bí pháp đã học · hiệu lực cộng dồn</small></span></div><div class="equipment-row"><span class="equipment-icon">†</span><span>${esc(equipped?.name||'Chưa trang bị pháp bảo')}<small>${equipped?esc(equipped.description):'Đến Tàng Kinh Các để rèn pháp bảo'}</small></span></div></div>`;}
function renderCards(p){for(const [container,types]of [['libraryCards',['manual','artifact']],['alchemyCards',['pill']]]){$('#'+container).innerHTML=state.catalog.filter(i=>types.includes(i.type)).map(i=>{const own=i.type==='manual'?p?.manuals.includes(i.id):p?.artifacts.includes(i.id),count=p?.pills[i.id]||0;const action=i.type==='manual'?'learn':i.type==='artifact'?'craft':'brew';const afford=!i.exclusive&&p&&p.realm>=i.tier&&p.stones>=i.price&&p.herbs>=i.herbs;return `<article class="item-card"><div class="item-icon">${i.art?'<img src="'+esc(i.art)+'" alt="" width="42" height="42" style="object-fit:contain">':symbols[i.icon]||'✧'}</div><span class="eyebrow">${{manual:'BÍ PHÁP',artifact:'PHÁP BẢO',pill:'TINH THỂ GAME'}[i.type]} · ${esc(state.realms[i.tier])}</span><h3>${esc(i.name)}</h3><p>${esc(i.description)}</p><div class="price">◈ ${i.price} linh thạch${i.herbs?` · ♧ ${i.herbs} linh thảo`:''}${i.type==='pill'?` · Có ${count} viên`:''}</div><div class="card-actions"><button class="soft-button" data-action="${action}" data-item="${i.id}" ${mode==='live'||own||!afford?'disabled':''}>${own?'Đã sở hữu':i.exclusive?(i.eventReward?i.eventReward:i.loyaltyMinutes?'Tri ân '+i.loyaltyMinutes+' phút':'Thưởng Đại Hộ Pháp'):{manual:'Lĩnh ngộ',artifact:'Rèn pháp bảo',pill:'Tạo 1 tinh thể'}[i.type]}</button>${i.type==='pill'?`<button class="gold-button" data-action="use" data-item="${i.id}" ${!count||mode==='live'?'disabled':''}>Kích hoạt</button>`:''}${i.type==='artifact'&&own?`<button class="gold-button" data-action="equip" data-item="${i.id}" ${p.equipped===i.id||mode==='live'?'disabled':''}>${p.equipped===i.id?'Đang trang bị':'Trang bị'}</button>`:''}</div></article>`;}).join('');}}
// Bảng người trên LIVE: mặc định chỉ người hoạt động 5 phút gần đây; tìm theo tên; bấm để xem hồ sơ bên phải.
let lastPeopleHTML='',peopleRenderedAt=0;
function ago(ms){const s=Math.max(0,Math.round(ms/1000));return s<60?s+' giây':Math.round(s/60)+' phút';}
function renderRank(throttle=false){
  if(!state)return;if(throttle&&Date.now()-peopleRenderedAt<2000)return;peopleRenderedAt=Date.now();
  const filter=$('#peopleFilter').value,q=$('#peopleSearch').value.trim().toLocaleLowerCase('vi');
  const activeCount=state.players.filter(p=>p.active).length;
  let players=state.players.filter(p=>!p.resident&&(filter==='all'||p.active)&&(!q||String(p.name).toLocaleLowerCase('vi').includes(q)));
  players=filter==='all'?players.sort((a,b)=>b.realm-a.realm||b.totalQi-a.totalQi).slice(0,100):players.sort((a,b)=>b.lastActive-a.lastActive);
  $('#peopleCount').textContent=`· ${fmt(activeCount)} đang hoạt động`;
  const now=state.serverNow||Date.now();
  const html=`<div class="people-row people-header"><span>#</span><span>ĐẠO HỮU</span><span>CẢNH GIỚI</span><span>TU VI / CẦN</span><span>LINH THẠCH</span><span>QUÀ</span><span>GẦN NHẤT</span></div>${players.length?players.map((p,i)=>{const ready=p.realm<state.realms.length-1&&p.finalRealmEligible!==false&&p.progressionReady!==false&&p.qi>=p.neededQi&&p.stones>=p.neededStones;return `<button class="people-row${p.id===selected?' selected':''}" data-select="${esc(p.id)}"><b>${i+1}</b><span class="people-name">${esc(p.name)} <small>#${esc(p.socialCode||'')} ${p.bondInfo?'♥':''}</small>${p.gender==='nu'?' <small>♀</small>':p.gender==='nam'?' <small>♂</small>':''}${p.isPatronLeader?' <small class="tag">Hộ Pháp</small>':''}${ready?' <small class="tag ready">Đủ đột phá</small>':''}</span><span>${esc(p.realmName)}</span><span>${fmt(p.qi)} / ${fmt(p.neededQi)}</span><span>${fmt(p.stones)}</span><span>${p.giftCoins?fmt(p.giftCoins):'–'}</span><span>${ago(now-p.lastActive)}</span></button>`;}).join(''):`<div class="empty-state">${q?'Không tìm thấy tên này.':filter==='active'?'Chưa có ai tương tác trong 5 phút gần đây.':'Chưa có đạo hữu nhập môn.'}</div>`}`;
  if(html===lastPeopleHTML)return;lastPeopleHTML=html;
  $('#rankTable').innerHTML=html;$('#rankTable').querySelectorAll('[data-select]').forEach(b=>b.onclick=()=>{selectPlayer(b.dataset.select);renderRank();});
}
function renderFeed(){$('#feed').innerHTML=state.feed.slice(0,18).map(e=>`<div class="feed-item"><span class="feed-symbol">${symbols[e.effect]||'✦'}</span><div><strong>${esc(e.name)}</strong><p>${esc(e.text)}</p><time>${new Date(e.at).toLocaleTimeString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',hour:'2-digit',minute:'2-digit'})}</time></div></div>`).join('')||'<div class="empty-state">Ký sự sẽ xuất hiện khi có tương tác.</div>';}
// Thử từng loại quà TikTok (chỉ thế giới thử nghiệm, không phải quà thật).
const SAMPLE_GIFTS=[['Rose',1],['Finger Heart',5],['Cat paws',5],['Perfume',20],['Doughnut',30],['GG',1],['Corgi',299],['Crown',500],['Galaxy',1000],['Whale diving',2150],['Sports Car',7000],['Fireworks',1088],['Panda',5],['Dragon',30000],['Lion',29999]];
function renderGiftKinds(){const el=$('#giftKinds');if(!el)return;el.hidden=mode!=='demo';el.innerHTML='<span>Thử quà TikTok</span>'+SAMPLE_GIFTS.map(([n,c])=>`<button data-gname="${esc(n)}" data-coins="${c}">${esc(n)}</button>`).join('');el.querySelectorAll('[data-gname]').forEach(b=>b.onclick=()=>act('gift',{coins:Number(b.dataset.coins),giftName:b.dataset.gname,eventId:crypto.randomUUID()}));}
function renderGifts(){renderGiftKinds();$('#giftButtons').innerHTML=state.gifts.map(g=>`<button class="gift-button" data-gift="${g.id}"><span class="gift-symbol">${symbols[g.effect]}</span><span><strong>${esc(g.name)}</strong><small>${g.min} coin thử · +${g.qi} tu vi</small></span></button>`).join('');$('#giftButtons').querySelectorAll('[data-gift]').forEach(b=>b.onclick=()=>{const g=state.gifts.find(x=>x.id===b.dataset.gift);act('gift',{coins:g.min,eventId:crypto.randomUUID()});});$('#giftRows').innerHTML=state.gifts.map((g,i)=>`<div class="gift-row"><span>${symbols[g.effect]} ${esc(g.name)}</span>${[['min','Từ coin'],['qi','Tu vi'],['stones','Linh thạch'],['herbs','Linh thảo']].map(([key,label])=>`<label>${label}<input id="gift-${i}-${key}" aria-label="${esc(g.name)} ${label}" type="number" min="${key==='min'?1:0}" max="${key==='min'?100000:10000000}" step="1" value="${g[key]}" required></label>`).join('')}</div>`).join('');}
function renderGuide(){$('#guideContent').innerHTML=rulesSummaryHTML(state);}
async function refresh(){const r=await fetch(`/api/state?world=${mode}`,{cache:'no-store'});if(!r.ok)throw Error('Không đọc được thế giới.');receive(await r.json());}
function streamMessage(e){try{const s=JSON.parse(e.data);const changed=state&&JSON.stringify(s.gifts)!==JSON.stringify(state.gifts);receive(s);if(changed)renderGifts();}catch(err){console.error(err);toast('Không thể đọc bản cập nhật. Hãy tải lại trang.');}}
function streamError(){online=false;$('#saveStatus').textContent='○ Đang kết nối lại';$('#disconnectBanner').hidden=false;}
let events=null;
if(params.get('transport')==='poll'){
  // HTTPS preview relays may not support SSE. Never overlap snapshot requests.
  const poll=async()=>{try{const r=await fetch('/api/state?world=live',{cache:'no-store',signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error('Snapshot unavailable');streamMessage({data:await r.text()});}catch{streamError();}finally{setTimeout(poll,1000);}};poll();
}else{
  events=new EventSource(`/api/events?world=${mode}${overlay?'&view=overlay':''}`);events.onmessage=streamMessage;events.onerror=streamError;
}
window.addEventListener('beforeunload',()=>{events?.close();clearInterval(auto);narrator.stop();cultivationAudio.destroy();});

$('#visualButton').onclick=()=>{scene.showNames=!scene.showNames;localStorage.setItem('vanhai-show-names',String(scene.showNames));$('#visualButton').setAttribute('aria-pressed',String(scene.showNames));$('#visualButton').innerHTML=`◉ <span>${scene.showNames?'Ẩn tên':'Hiện tên'}</span>`;};
function renderFocus(){const target=scene.focusUntil>performance.now()?state.players.find(p=>p.id===(scene.focusId||selected)):null;const card=$('#focusCard');card.classList.toggle('visible',!!target);if(!target)return;card.innerHTML=`<span class="focus-sprite" style="background-position:${spriteCell(appearanceFor(target).level,visualGender(target))*25}% center"></span><div><strong>${esc(target.name)}</strong><small>${esc(target.realmName)} · ${esc(appearanceFor(target).name)}</small><div class="progress"><i style="width:${Math.min(100,target.qi/target.neededQi*100)}%"></i></div></div>`;}

scene.showNames=localStorage.getItem('vanhai-show-names')!=='false';$('#visualButton').setAttribute('aria-pressed',String(scene.showNames));$('#visualButton').innerHTML=`◉ <span>${scene.showNames?'Ẩn tên':'Hiện tên'}</span>`;

function renderSkinControls(){
  $('#skinPreview').hidden=mode!=='demo';$('#skinPreview').innerHTML='<span>Thử linh quang</span>'+SKINS.map(s=>`<button data-skin="${s.id}" style="--skin-color:${s.trim}">${esc(s.name)}</button>`).join('');
  $('#skinPreview').querySelectorAll('[data-skin]').forEach(b=>b.onclick=async()=>{const skin=SKINS.find(s=>s.id===b.dataset.skin),id='skin-preview:'+skin.id;const joined=await post('/api/action',{type:'join',userId:id,name:'Mẫu '+skin.name});if(!joined.ok)return;const data=await(await fetch('/api/state?world=demo')).json();const p=data.players.find(p=>p.id===id);const delta=Math.max(0,skin.min-(p?.giftCoins||0));if(delta)await post('/api/action',{type:'gift',userId:id,name:'Mẫu '+skin.name,coins:delta,eventId:crypto.randomUUID()});selected=id;scene.focusId=id;scene.focusUntil=performance.now()+5000;await refresh();toast('Skin thử '+skin.name+' · không dùng quà thật.');});
  $('#skinTiers').innerHTML=SKINS.map(s=>`<article style="--skin-color:${s.trim}"><div class="skin-sprite" style="background-position:${s.level*25}% center"></div><strong>${esc(s.name)}</strong><small>${fmt(s.min)} coin tích lũy</small><p>${esc(s.vfx)}</p></article>`).join('');
}
renderSkinControls();

const lifeKeys={npcs:'npcToggle',environment:'environmentToggle'};
function syncLife(){scene.worldLife??={};for(const [key,id]of Object.entries(lifeKeys)){const enabled=localStorage.getItem('vanhai-life-'+key)!=='false';scene.worldLife[key]=enabled;$('#'+id).checked=enabled;}}
for(const [key,id]of Object.entries(lifeKeys))$('#'+id).onchange=e=>{localStorage.setItem('vanhai-life-'+key,String(e.target.checked));syncLife();};
window.addEventListener('storage',e=>{if(e.key?.startsWith('vanhai-life-'))syncLife();});syncLife();

function renderVisitorHud(){
 const old=$('#visitorHud');if(old)old.hidden=true;
 const el=$('#visitorEventInfo'),e=state?.visitor;if(!el)return;
 el.hidden=!e||!!e.closedAt||state.serverNow>=e.endsAt;if(el.hidden)return;
 const cfg=VISITORS[e.kind],reward=VISITOR_GIFT_REWARDS[e.kind];
 const seconds=Math.max(0,Math.ceil((e.endsAt-state.serverNow)/1000)),clock=Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');
 const command=state.quick?.paused?'cơ duyên':'6 hoặc cơ duyên';
 const free=e.completed?'Đã mở thưởng · nhận quà miễn phí':'Nhận cơ duyên miễn phí';
 let html='<b>SỰ KIỆN · '+esc(cfg?.name||'Khách quý')+'</b><span class="event-time">Còn '+clock+'</span><p><code>Gõ '+esc(command)+'</code><span>'+esc(free)+'</span></p>';
 if(reward){
  html+='<div class="event-rewards"><strong>QUÀ SỰ KIỆN</strong><p><b>'+fmt(reward.skinCoins||100)+' coin</b><span>Nhận skin '+esc(reward.skinName)+'</span></p><p><b>'+fmt(reward.artifactCoins||500)+' coin</b><span>Nhận thêm '+esc(reward.artifactName)+'</span></p><small>Tính quà cộng dồn trong lượt khách quý này.</small></div>';
 }else if(e.goal)html+='<span>Truyền đạo: '+fmt(e.points||0)+' / '+fmt(e.goal)+'</span>';
 setHUD(el,html);
}


// v73: tab Tu sĩ giả
var puppetUI=initPuppetUI({root:document.getElementById('puppetPanel'),post,toast,getState:()=>state,openPlayer:id=>{tab('scene');selectPlayer(id);renderEditor(true);}});
if(location.hash==='#puppets')puppetUI.refresh();

// v78: chọn map nền ngay đầu tab "Người trên LIVE" — ảnh xem trước, bấm là đổi trên LIVE.
let scenePickerSig='';
function renderScenePicker(){const el=document.getElementById('scenePicker');if(!el||!state)return;const mode=state.settings?.sceneMode||'auto',cur=state.environment?.id;
  const sig=mode+'|'+cur+'|'+(state.environment?.changesAt||'')+'|'+(state.sectMaster?.username||'')+'|'+JSON.stringify(state.settings?.music||null)+'|'+musicForState(state).index;if(sig===scenePickerSig)return;scenePickerSig=sig;
  const left=state.environment?.changesAt?Math.max(0,Math.round((state.environment.changesAt-state.serverNow)/60000)):null;
  el.innerHTML='<div class="sp-head"><b>🗺 Map nền LIVE</b><span>Đang hiện: <strong>'+esc(state.environment?.name||'—')+'</strong>'+(mode==='auto'?' · tự đổi'+(left!==null?' sau ~'+left+' phút':''):' · giữ cố định')+'</span><button class="'+(mode==='auto'?'gold-button':'soft-button')+' small" data-map="auto">🔄 Tự đổi mỗi 5 phút</button></div>'+
   '<div class="sp-grid">'+MAP_SCENES.map(m=>'<button class="sp-card'+(mode===m.id?' chosen':'')+(cur===m.id?' showing':'')+'" data-map="'+m.id+'" title="Chọn '+esc(m.name)+'"><img src="'+m.image+'" alt="" loading="lazy"><span>'+esc(m.name)+'</span>'+(mode===m.id?'<i>✓ Đang chọn</i>':cur===m.id?'<i>Đang hiện</i>':'')+'</button>').join('')+'</div><p class="muted sp-note">Sự kiện có sân riêng (đua phi kiếm, luận kiếm, kết duyên) vẫn tạm dùng sân của sự kiện, xong sẽ quay về map đã chọn.</p>';
  el.insertAdjacentHTML('beforeend','<form id="sectMasterForm" class="sect-master-settings"><b>Ghế Tông chủ</b><label>TikTok của bạn <input name="username" maxlength="60" placeholder="@username" value="'+esc(state.sectMaster?.username||'')+'"></label><button class="soft-button small" type="submit">Lưu tài khoản</button><small>Đúng tài khoản này bình luận → Tông chủ hiện trên ghế. Không nhận diện bằng tên hiển thị.</small></form>');
  el.querySelector('#sectMasterForm').onsubmit=async e=>{e.preventDefault();const username=new FormData(e.target).get('username'),r=await post('/api/sect-master',{username,enabled:true});if(r.ok){scenePickerSig='';toast('Đã lưu tài khoản Tông chủ');}else toast(r.message||'Chưa lưu được Tông chủ');};
  {const mu=state.settings?.music,now=state.serverNow||Date.now(),playing=musicForState(state,now).index,fixed=mu?.followContext===false,ch=musicChangesAt(mu,now),mins=ch?Math.max(1,Math.round((ch-now)/60000)):null;
   el.insertAdjacentHTML('beforeend','<div class="music-picker sect-master-settings"><b>🎵 Nhạc nền LIVE</b><span>Đang phát: <strong>'+esc(BGM_LIST[playing].name)+'</strong>'+(fixed?' · giữ cố định':' · theo map / sự kiện')+'</span><label>Chọn bài <select id="musicPick"><option value="auto"'+(fixed?'':' selected')+'>🔄 Tự đổi theo map / sự kiện</option>'+BGM_LIST.map((t,i)=>'<option value="'+i+'"'+(fixed&&i===playing?' selected':'')+'>'+(i+1)+'. '+esc(t.name)+'</option>').join('')+'</select></label><button type="button" class="soft-button small" id="musicNext">⏭ Bài kế</button><small>Đổi nhạc có chuyển âm nhẹ. Music: Kevin MacLeod (incompetech.com), Shane Ivers (silvermansound.com) · CC BY 4.0. <a href="/assets/AUDIO.md" target="_blank" rel="noopener">Nguồn &amp; ghi công LIVE</a>.</small></div>');
   const send=async cmd=>{const r=await post('/api/music',{cmd});if(r.ok){state.settings=Object.assign(state.settings||{},{music:r.music});scenePickerSig='';renderScenePicker();toast('Nhạc nền: '+BGM_LIST[musicIndex(r.music,Date.now())].name+(r.music.mode==='fixed'?' (giữ cố định)':' (theo map / sự kiện)'));}else toast(r.message||'Chưa đổi được nhạc');};
   el.querySelector('#musicPick').onchange=e=>send(e.target.value);el.querySelector('#musicNext').onclick=()=>send('next');}
  el.querySelectorAll('[data-map]').forEach(b=>b.onclick=async()=>{const r=await post('/api/world-scene',{scene:b.dataset.map});if(r.ok){toast(b.dataset.map==='auto'?'Map tự đổi mỗi 5 phút.':'Đã đổi map: '+(MAP_SCENES.find(m=>m.id===b.dataset.map)?.name||''));scenePickerSig='';}});}

// v80: BAN THƯỞNG NHANH — chọn người trong bảng (hoặc ngẫu nhiên 1 người đang chơi) rồi bấm gói quà.
const QUICK_COMBOS=[['small','🎁 Tiểu Lễ','+10% tu vi cảnh giới · 30 linh thạch · 5 linh thảo'],['medium','🎁 Trung Lễ','+30% tu vi · 100 linh thạch · 15 linh thảo · phúc duyên ×3'],['large','💎 Đại Lễ','+60% tu vi · 250 linh thạch · 40 linh thảo · phúc duyên ×5'],['buff','🔥 Phúc Duyên ×8','10 phút tu luyện ×8'],['breakthrough','⚡ Đột Phá Đan','đủ tu vi + linh thạch để đột phá ngay']];
let quickSig='';
function renderQuickGift(){const el=document.getElementById('quickGift');if(!el||!state)return;const p=player(),sig=(p?.id||'')+'|'+(p?.name||'')+'|'+(p?.realm??'');if(sig===quickSig)return;quickSig=sig;
  const btns=target=>QUICK_COMBOS.map(([id,label,tip])=>'<button class="small '+(id==='large'||id==='breakthrough'?'gold-button':'soft-button')+'" data-qg="'+id+'" data-target="'+target+'" title="'+tip+'">'+label+'</button>').join('');
  el.innerHTML='<div class="qg-head"><b>🎁 Ban thưởng nhanh</b><span class="muted">Có hiệu ứng + giọng đọc như quà thật. Tu vi tính theo cảnh giới người nhận.</span></div>'+
   '<div class="qg-row"><span>'+(p?'Cho <strong>'+esc(p.name)+'</strong> <small>('+esc(state.realms?.[p.realm]||'')+')</small>':'<i class="muted">Bấm một người trong bảng bên dưới để chọn</i>')+'</span>'+(p?btns(p.id):'')+'</div>'+
   '<div class="qg-row"><span>🎲 Ngẫu nhiên 1 người đang chơi</span>'+btns('*')+'</div>'+'<div class="qg-row"><span>👑 Đại điển vinh danh top 3 quà <small class="muted">(tự diễn mỗi 20 phút)</small></span><button class="small gold-button" id="ceremonyNow">👑 Vinh danh ngay</button></div>'+'<div class="qg-row"><span>🎉 Hoạt động <small class="muted">(trò nhỏ miễn phí, luân phiên 1–2 phút)</small></span><button class="small gold-button" data-engage="envelope">🧧 Thả hồng bao</button><button class="small soft-button" data-engage="quiz">❓ Ra câu đố</button><button class="small soft-button" data-engage="rps">✊ Oẳn tù tì</button><button class="small soft-button" data-engage="lucky">🎒 Túi linh lộc</button><button class="small soft-button" data-engage="star">🌟 Bắt sao</button></div>';
  const cb=el.querySelector('#ceremonyNow');if(cb)cb.onclick=async()=>{const r=await post('/api/ceremony',{});if(r.ok)toast('Đại điển vinh danh: '+r.top.map(x=>x.name).join(', '));};
  el.querySelectorAll('[data-engage]').forEach(b=>b.onclick=async()=>{const r=await post('/api/engage',{kind:b.dataset.engage});if(r.ok)toast('Đã mở trò nhỏ.');});
  el.querySelectorAll('[data-qg]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{const r=await post('/api/admin-gift',{id:b.dataset.target,combo:b.dataset.qg});if(r.ok)toast('Đã ban '+r.combo+' cho '+r.name+(r.qi?' (+'+fmt(r.qi)+' tu vi)':''));}finally{b.disabled=false;}});}

// 4/11/2026: ĐIỀU KHIỂN LIVE — bật/tắt từng sự kiện + ban thưởng tùy chỉnh cho người đang chọn. Có hiệu lực ngay, không cần khởi động lại.
const LIVE_EVENT_TOGGLES=[['flower','🌸 Thiên Hoa Vũ'],['meteor','🌠 Tinh Hà Lưu Tinh'],['visitor-hanlap','🧙 Hàn Lập'],['visitor-vuonglam','🧙 Vương Lâm'],['visitor-shende','👑 Thần Đế'],['opportunity','🍀 Cơ duyên'],['tournament','⚔ Luận Kiếm'],['race','🗡 Đua phi kiếm'],['bond','💞 Kết duyên'],['boss','🐉 Yêu thú']];
let liveCtlSig='',liveCtlTarget='';
function renderLiveControls(){
  const host=document.getElementById('quickGift');if(!host||!state)return;
  let el=document.getElementById('liveControls');if(!el){el=document.createElement('section');el.id='liveControls';el.className='quick-gift live-controls';host.insertAdjacentElement('afterend',el);}
  if(el.contains(document.activeElement)&&document.activeElement.tagName==='INPUT'&&document.activeElement.type!=='checkbox')return; // đang gõ số thì không vẽ lại
  const st=state.settings||{},off=new Set(st.randomExclude||[]),p=player(),sig=JSON.stringify([st.randomExclude,st.quiz,st.envelope,st.heartPlay,st.scheduledCompetitions,st.huntBeforeCompetition,st.autoEvents,p?.id,p?.name]);
  if(sig===liveCtlSig)return;liveCtlSig=sig;
  const box=(key,label,on,extra='')=>'<label class="lc-toggle"><input type="checkbox" data-lc="'+key+'"'+(on?' checked':'')+extra+'> '+label+'</label>';
  el.innerHTML='<div class="qg-head"><b>🎛 Bật/tắt sự kiện</b><span class="muted">Có hiệu lực ngay trên LIVE · bỏ chọn = không tự bật sự kiện đó</span></div>'+
   '<div class="lc-grid">'+box('autoEvents','⏱ Sự kiện tự động',st.autoEvents!==false)+LIVE_EVENT_TOGGLES.map(([id,label])=>box('ev:'+id,label,!off.has(id))).join('')+'</div>'+
   '<div class="lc-grid">'+box('quiz','🤔 Câu đố',st.quiz!==false)+box('envelope','🧧 Hồng bao',st.envelope!==false)+box('scheduledCompetitions','📅 Tỷ thí/đua theo lịch',!!st.scheduledCompetitions)+box('huntBeforeCompetition','🐉 Săn yêu thú trước tỷ thí',!!st.huntBeforeCompetition)+box('heartPlay','❤ Chơi bằng tim',st.heartPlay!==false)+'</div>'+
   '<div class="qg-head"><b>✏️ Ban thưởng tùy chỉnh</b><span class="muted">'+(p?'Cho <strong>'+esc(p.name)+'</strong> ('+esc(state.realms?.[p.realm]||'')+')':'Bấm một người trong bảng để chọn, hoặc dùng 🎲 ngẫu nhiên')+'</span></div>'+
   '<div class="lc-gift"><label>Tu vi <input type="number" min="0" step="1" data-cg="qi" value="0"></label><label>Linh thạch <input type="number" min="0" step="1" data-cg="stones" value="0"></label><label>Linh thảo <input type="number" min="0" step="1" data-cg="herbs" value="0"></label>'+
   '<label>Phúc duyên <select data-cg="buff"><option value="0">không</option>'+[2,3,5,8,10].map(n=>'<option value="'+n+'">×'+n+'</option>').join('')+'</select></label><label>trong <input type="number" min="1" max="120" step="1" data-cg="minutes" value="10"> phút</label>'+
   (p?'<button class="small gold-button" data-cgo="'+esc(p.id)+'">🎁 Ban cho '+esc(p.name)+'</button>':'')+'<button class="small soft-button" data-cgo="*">🎲 Ngẫu nhiên 1 người</button></div>';
  el.querySelectorAll('[data-lc]').forEach(cb=>cb.onchange=async()=>{const k=cb.dataset.lc;let body;
    if(k.startsWith('ev:')){const id=k.slice(3),set=new Set(state.settings?.randomExclude||[]);cb.checked?set.delete(id):set.add(id);body={randomExclude:[...set]};}else body={[k]:cb.checked};
    cb.disabled=true;try{const r=await post('/api/event-settings',body);if(r.ok){Object.assign(state.settings??={},body,r.settings||{});toast((cb.checked?'Đã bật: ':'Đã tắt: ')+cb.parentElement.textContent.trim());}else cb.checked=!cb.checked;}finally{cb.disabled=false;liveCtlSig='';}});
  el.querySelectorAll('[data-cgo]').forEach(b=>b.onclick=async()=>{const custom={};el.querySelectorAll('[data-cg]').forEach(i=>custom[i.dataset.cg]=Number(i.value)||0);
    b.disabled=true;try{const r=await post('/api/admin-gift',{id:b.dataset.cgo,combo:'custom',custom});if(r.ok)toast('Đã ban thưởng riêng cho '+r.name+(r.qi?' (+'+fmt(r.qi)+' tu vi)':''));else toast(r.message||'Không ban được.');}finally{b.disabled=false;}});
}

// 07/11/2026: THIÊN ĐẠO — giáng thiên lôi xuống 1 người (chọn hoặc ngẫu nhiên). Trừ 20% tu vi, choáng 5 phút. Bấm 2 lần để xác nhận.
let heavenTarget='',heavenArm='',heavenArmTimer=null;
function renderHeavenPanel(){const el=document.getElementById('heavenPanel');if(!el||!state)return;
  if(!el.dataset.ready){el.dataset.ready='1';
    el.innerHTML='<div class="qg-head"><b>⚡ Thiên Đạo · Giáng thiên lôi</b><span class="muted">Trừ 20% tu vi hiện có · choáng 5 phút không tu luyện được (quà vẫn nhận đủ) · giọng đọc báo thiên kiếp ngẫu nhiên giáng xuống · mỗi lần cách nhau 60 giây</span></div>'+
     '<div class="qg-row hv-search"><input id="hvSearch" type="search" placeholder="Gõ tên người chơi…" autocomplete="off"><span id="hvPicked" class="hv-picked"></span></div>'+
     '<div id="hvList" class="hv-list"></div>'+
     '<div class="qg-row"><button id="hvStrike" class="small gold-button hv-strike" disabled>⚡ Giáng lôi</button><button id="hvRandom" class="small soft-button">🎲 Ngẫu nhiên 1 người đang chơi</button><span id="hvCooldown" class="muted"></span></div>'+
     '<div id="hvStunned" class="hv-stunned"></div>';
    el.querySelector('#hvSearch').oninput=()=>renderHeavenPanel();
    el.querySelector('#hvList').onclick=e=>{const b=e.target.closest('[data-hv]');if(!b)return;heavenTarget=b.dataset.hv;heavenArm='';renderHeavenPanel();};
    const fire=async(id,btn)=>{if(heavenArm!==id){heavenArm=id;clearTimeout(heavenArmTimer);heavenArmTimer=setTimeout(()=>{heavenArm='';renderHeavenPanel();},3500);renderHeavenPanel();return;}
      heavenArm='';clearTimeout(heavenArmTimer);btn.disabled=true;try{const r=await post('/api/heaven-strike',{id});if(r.ok)toast('⚡ Thiên lôi đánh trúng '+r.name+' · -'+fmt(r.loss)+' tu vi · choáng 5 phút');else toast(r.message||'Chưa giáng lôi được.');}finally{btn.disabled=false;renderHeavenPanel();}};
    el.querySelector('#hvStrike').onclick=e=>{if(heavenTarget)fire(heavenTarget,e.currentTarget);};
    el.querySelector('#hvRandom').onclick=e=>fire('*',e.currentTarget);}
  const now=state.serverNow||Date.now(),q=fold(el.querySelector('#hvSearch').value.trim()),sel=player();
  if(!heavenTarget&&sel)heavenTarget=sel.id;
  const pool=state.players.filter(p=>!p.resident&&!p.puppet&&(q?fold(p.name).includes(q):p.active)).sort((a,b)=>(b.active-a.active)||(b.realm-a.realm)).slice(0,14);
  el.querySelector('#hvList').innerHTML=pool.map(p=>'<button class="hv-chip'+(p.id===heavenTarget?' on':'')+(p.stunUntil>now?' stunned':'')+'" data-hv="'+esc(p.id)+'">'+esc(p.name)+' <small>'+esc(state.realms?.[p.realm]||'')+(p.stunUntil>now?' · ⚡':'')+'</small></button>').join('')||'<span class="muted">Không thấy ai'+(q?' tên này':' đang chơi')+'.</span>';
  const t=state.players.find(p=>p.id===heavenTarget);el.querySelector('#hvPicked').innerHTML=t?'Mục tiêu: <strong>'+esc(t.name)+'</strong> <small>('+esc(state.realms?.[t.realm]||'')+' · tu vi '+fmt(t.qi)+' → mất '+fmt(Math.floor(t.qi*.2))+')</small>':'<i class="muted">Chọn một người bên dưới</i>';
  const sb=el.querySelector('#hvStrike'),rb=el.querySelector('#hvRandom'),wait=Math.max(0,Math.ceil(((state.lastHeavenStrikeAt||0)+60000-now)/1000));
  sb.disabled=!t||wait>0;sb.textContent=heavenArm&&heavenArm===heavenTarget?'⚠ Bấm lần nữa để giáng lôi':'⚡ Giáng lôi'+(t?' xuống '+t.name:'');sb.classList.toggle('armed',!!heavenArm&&heavenArm===heavenTarget);
  rb.disabled=wait>0;rb.textContent=heavenArm==='*'?'⚠ Bấm lần nữa · ngẫu nhiên':'🎲 Ngẫu nhiên 1 người đang chơi';rb.classList.toggle('armed',heavenArm==='*');
  el.querySelector('#hvCooldown').textContent=wait>0?'Thiên lôi đang tụ lại · '+wait+' giây':'';
  const stunned=state.players.filter(p=>p.stunUntil>now).sort((a,b)=>b.stunUntil-a.stunUntil);
  el.querySelector('#hvStunned').innerHTML=stunned.length?'<b>Đang bị trấn áp:</b> '+stunned.map(p=>{const s=Math.ceil((p.stunUntil-now)/1000);return '<span class="hv-stun">'+esc(p.name)+' · '+Math.floor(s/60)+':'+String(s%60).padStart(2,'0')+'</span>';}).join(' '):'';}
const fold=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').replace(/Đ/g,'d').toLowerCase();

// v86: thanh MỤC TIÊU TIM toàn LIVE (cảnh LIVE)
function renderLikeGoal(){const el=document.getElementById('likeGoal');if(el)el.hidden=true;}


// v87: HỒNG BAO + CÂU ĐỐ trên cảnh LIVE (đếm ngược theo giờ máy chủ)
let engageTimer=null;
function renderEngagement(){const g=state.engagement||{},env=document.getElementById('envelopeBox'),qz=document.getElementById('quizBox');if(!env||!qz)return;
  const off=Date.now()-state.serverNow,left=t=>Math.max(0,Math.ceil((t-(Date.now()-off))/1000));
  if(g.envelope){if(env.hidden){env.innerHTML='<div class="env-card"><div class="env-top"></div><div class="env-seal">福</div><b>🧧 HỒNG BAO RƠI</b><span>Gõ <code>nhan</code> · miễn phí · vật phẩm game</span><small class="env-left"></small></div>'+Array.from({length:16},(_,i)=>'<i class="env-coin" style="--x:'+((i*41)%100)+'%;--d:'+((i%6)*.3)+'s"></i>').join('');env.hidden=false;}
    env.querySelector('.env-left').textContent=left(g.envelope.endsAt)+' giây · '+g.envelope.count+' người đã nhận';}
  else env.hidden=true;
  if(g.quiz){const key=g.quiz.q;if(qz.dataset.q!==key){qz.dataset.q=key;qz.innerHTML=g.quiz.options?'<b>'+(g.quiz.riddle?'🤔 CÂU ĐỐ MẸO':'❓ CÂU ĐỐ TU TIÊN')+'</b><p>'+esc(g.quiz.q)+'</p><ol>'+g.quiz.options.map((o,i)=>'<li><code>'+'abc'[i]+'</code> '+esc(o)+'</li>').join('')+'</ol><small class="quiz-left"></small>':'<b>🤔 CÂU ĐỐ MẸO</b><p>'+esc(g.quiz.q)+'</p><small class="quiz-left"></small>';qz.hidden=false;}
    qz.querySelector('.quiz-left').textContent=(g.quiz.options?'Gõ a, b hoặc c':'Gõ đáp án vào chat')+' · còn '+left(g.quiz.endsAt)+' giây · '+g.quiz.count+(g.quiz.options?' người đã trả lời':' người đã giải được');}
  else{qz.hidden=true;qz.dataset.q='';}
  renderMiniEvent(g.mini,state.serverNow,document.querySelector('.scene-shell'),scene.motion!==false);
  clearTimeout(engageTimer);if(g.envelope||g.quiz||g.mini)engageTimer=setTimeout(renderEngagement,500);}

// Refresh a deployed UI update after the current presentation, keeping event data on the server.
// 08/11: overlay có tiếng thì KHÔNG tự nạp lại — LIVE Studio chặn tự phát âm thanh sau reload (mất tiếng giữa LIVE). Bản mới lên khi làm mới nguồn Link.
if(overlay&&params.get('sound')!=='1'){let loadedBuild=null;setInterval(async()=>{try{const r=await fetch('/index.html',{method:'HEAD',cache:'no-store'}),etag=r.headers.get('ETag');if(!r.ok||!etag)return;if(!loadedBuild){loadedBuild=etag;return;}if(etag!==loadedBuild&&(!busy||!(scene.presentation?.until>performance.now()))&&!scene.effects?.some(e=>e.effect==='breakthrough'&&performance.now()-e.start<e.duration))location.reload();}catch{}},10000);}
