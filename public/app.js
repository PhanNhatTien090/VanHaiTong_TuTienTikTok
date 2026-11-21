import {sourceVisualPreferences} from './visual-preferences.js';
import {cinematicQuality,VFX_LIMITS} from './cinematic-vfx.js';
import {renderMiniEvent} from './mini-event-ui.js?v=polish-20261114';
import {eventDonationContext,majorEventActive,ascensionHeld} from './event-donations.js';
import {ManagementState} from './management-state.js';
import {startLiveDiag,liveDiagSnapshot,RenderMetrics} from './live-diag.js';
import {mountAscensionStage,isAscensionEvent,prepareAscensionStage} from './ascension-stage.js';
import {rulesSummaryHTML} from './rules-summary.js';
import {streamState,participantCounts,liveRulesActive} from './live-integrity.js';
import {smallGift,shouldFocusEvent,mountRitualHud} from './live-cinema.js';
import {isNewbie} from './vip.js';
import {ArrivalWelcomes,isArrivalWelcome} from './arrival-welcome.js';
import {WelcomeClips} from './welcome-lines.js?v=20261120';
import {initThuyMac} from './thuy-mac-hud.js?v=20261120go2';
import {addNhapMon} from './nhap-mon-fx.js?v=20261120';
import {hallGuideRows,renderSimpleGuide} from './simple-guide.js?v=hall-management';
import {mountHallAdmin} from './hall-admin.js';
import {GiftComboBuffer} from './gift-combos.js';
import {renderCompanionHUD} from './companion-fx.js';
import {mountPetUI,renderPetUI,showPetGiftAward} from './spirit-pet-ui.js?v=20261120gon';
import {ALL_PETS,petById} from './spirit-pets.js';
import {BAO_ITEMS,BAO_TIER,BAO_MAX_STARS} from './phap-bao-data.js'; // 18/11: quản lý thần khí
import {MOUNTS,MOUNT_TIERS,MAX_STARS as MOUNT_MAX_STARS} from './mounts.js'; // 18/11: quản lý tọa kỹ / linh châu
import {isEventAnnouncement} from './event-announcements.js';
import {breakthroughRealm,REALM_NAMES,breakthroughDuration} from './breakthrough-fx.js';
import {divineSelection} from './divine-wardrobe.js';
import {mountEventTab,renderSocialUI} from './social-ui.js?v=20261120kiep';
import {BLACK_GOLD_VISITOR} from './court-rewards.js';
import {VISITOR_GIFT_REWARDS} from './visitor-rewards.js';
import {VISITORS} from './visitor-event.js';
import {HonorUI} from './honor-ui.js';
import {PresentationQueue,presentationDuration,presentationPriority,isBlackGoldAward,urgentBreakthrough} from './presentation.js?v=bt-first-20261119';
import {strikeProfile,HEAVEN_STRIKE_MS} from './heaven-strike.js';
import {scheduleHeavenStrikeAudio} from './heaven-strike-audio.js';
import {luxuryTier} from './luxury-fx.js';
import {highGiftName} from './high-gift-fx.js';
import {railHTML} from './command-rail.js';
import {divinePreview} from './skin-guide.js';
let skinReviewRequest=null;
function renderSkinReview(){if(overlay||!state)return;skinReviewRequest??=import('./skin-review.js?v=dau-de-tieu-viem').then(m=>m.mountSkinReview(document.querySelector('#skinReview'),{Scene,realmNames:state.realms}));skinReviewRequest.then(view=>view.setActive(currentTab==='skins'));}
// v42: bảng lệnh / trang bị dọc bên phải, đổi trang mỗi 12 giây.
let railPage=0;function renderRail(){if(state)renderSimpleGuide(state,esc,railPage);const el=document.querySelector('#commandRail');if(!el||!state)return;const html=railHTML(state,railPage,esc);if(el._last!==html){el.innerHTML=html;el._last=html;}}
setInterval(()=>{railPage++;renderRail();},12000);
import {safeAvatar} from './honors.js';
import {topPatron,SPECIAL_SKINS} from './patrons.js';
import {appearanceFor} from './realm-outfits.js';
import {Scene,portrait,symbols} from './scene.js?v=duel-shake-x5-20261115';
import {VoiceQueue,raceOpeningVoice} from './voice.js';
import {IDLE_LINES,SCENE_ARRIVAL,CHECKIN_REMINDER} from './idle-lines.js';
import {nextAct,RESIDENT_VOICES} from './resident-acts.js';
import {residentCycle,setResidentRealm} from './residents.js';
import {CultivationAudio,PRERENDER_FROM,PRERENDER_KEEP} from './audio.js?v=prerender-20261120b';
import {initPuppetUI} from './puppet-ui.js';
import {showCeremony} from './ceremony.js';
import {forceSoLenh} from './so-lenh.js?v=20261120'; // 20/11: thay bảng thông tin góc dưới phải (info-spotlight.js) bằng Sổ lệnh trong cuộn Thiên Bảng
import {mountGearGuide,renderGearGuide} from './gear-guide.js?v=honor-legend-20261115';
import {renderStageQueue} from './stage-queue.js';
import {hallsRankHTML,hallCardHTML,hallDuelHTML} from './ngu-duong-ui.js?v=hall-management';
import {addMountReveal} from './mount-reveal-fx.js'; // 16/11
import {showLinhBai} from './linh-bai.js';
import {InventoryDeck,cardKind} from './inventory-multi.js?v=bang-xem-20261115';
import {OrbCard} from './orb-card.js'; // 18/11: thẻ Linh Châu tím/vàng
import {realmWithStage} from './realm-stage.js';
import {showBaoHy} from './bao-hy.js';
import {renderTower} from './tower.js';
import {giftTokenHTML,lineupSlotHTML} from './gift-icons.js';
import {giftRules,giftRuleHTML} from './gift-rule-card.js?v=20261120kiep';
import {SCENES as MAP_SCENES} from './world-rotation.js';
import {SKINS,skinFor,nextSkin,spriteCell,visualGender} from './cosmetics.js';
const cultivationAudio=new CultivationAudio();cultivationAudio.extraLeadMs=Number(new URLSearchParams(location.search).get('audioLead'))||0; // 20/11: chỉnh tay nếu âm đột phá vẫn chậm hơn hình trên LIVE (ms, tối đa 400)
import {BGM_LIST,musicIndex,musicForState,musicChangesAt} from './music-rotation.js?v=event-music-20261115';
import {bindLiveControls,renderScenePicker,renderQuickGift,renderLiveControls,renderHeavenPanel} from './admin/live-controls.js';
import {bindPlayerPanel,renderEditor,renderProfile,renderCards,renderRank} from './admin/player-panel.js';
// 21/11/2026: các khung quản lý đã tách sang public/admin/ — đọc biến app.js qua appCtx (getter sống).
const appCtx={get $(){return $},get esc(){return esc},get fmt(){return fmt},get mode(){return mode},get overlay(){return overlay},get player(){return player},get post(){return post},get refresh(){return refresh},get selectPlayer(){return selectPlayer},get selected(){return selected},set selected(v){selected=v},get state(){return state},set state(v){state=v},get toast(){return toast}};bindLiveControls(appCtx);bindPlayerPanel(appCtx);
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
  const orbCardEl=document.createElement('div');orbCardEl.id='orbCard';orbCardEl.hidden=true;root.appendChild(orbCardEl); // 18/11: thẻ Linh Châu
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
    root.appendChild(guideDock);
  }}
}

const params=new URLSearchParams(location.search),mode=params.get('world')==='live'?'live':'demo',overlay=params.get('overlay')==='1';
// 20/11: dựng trước âm đột phá (≥ Hóa Thần) cho người SẮP đột phá — lúc chiếu chỉ phát 1 nguồn âm, hết rè/trễ (audio.js prerenderRitual). (20/11 sửa: khối này từng nằm TRƯỚC khai báo overlay → ReferenceError, overlay chết trắng; phải đứng sau dòng params)
// Chỉ làm khi không có màn đột phá đang chiếu; mỗi lần 1 cảnh giới; người gần đủ (≥85% tu vi) xếp theo quà.
if(overlay)setInterval(()=>{const A=cultivationAudio;if(!A.enabled||A.qiSession||A.prerendering||!state?.players)return;
 const near=p=>p.active&&!p.puppet&&p.progressionReady!==false&&p.neededQi>0&&p.qi>=p.neededQi*.85&&(p.stones||0)>=(p.neededStones||0)*.85;
 const want=[...new Set(state.players.filter(p=>near(p)&&(p.realm||0)+1>=PRERENDER_FROM&&(p.realm||0)+1<REALM_NAMES.length).sort((a,b)=>(b.giftCoins||0)-(a.giftCoins||0)).map(p=>(p.realm||0)+1))].slice(0,PRERENDER_KEEP);
 const r=want.find(r=>!A.prerendered?.has(r));if(r)A.prerenderRitual(r,breakthroughDuration({effect:'breakthrough',fromRealm:r-1,toRealm:r}));},4000);
if(overlay)document.body.classList.add('overlay');else{document.body.classList.add('management-only');document.title='Vân Hải Tông · Quản lý LIVE';const panel=$('#audioPanel');panel.hidden=false;$('#managementDisplaySettings').append(panel);}
$('#worldSelect').value=mode;
let state=null,selected=null,online=false,initialized=false,seen=new Set(),auto=null,sound=false,lastProfile='',lastFeed='',lastCards='',toastTimer,spotTimer,queue=[],busy=false,currentTab='scene';
const honorUI=new HonorUI($('#honorBanner'));
setInterval(()=>honorUI.tick(busy),1000);
const scene=overlay?new Scene($('#sceneCanvas'),id=>selectPlayer(id)):new ManagementState($('#sceneCanvas'));if(overlay)prepareAscensionStage(scene);
if(new URLSearchParams(location.search).has('qa'))window.__vhScene=scene; // 17/11: móc cho script QA chụp màn (chỉ khi link có ?qa)
const inventoryDeck=overlay?new InventoryDeck($('#inventoryDeck'),scene,esc):null;
const orbCard=overlay?new OrbCard($('#orbCard'),esc):null; // 18/11 // 4/11: nạp sẵn ảnh thiên đài
const ascensionStage=overlay&&params.get('stage')==='ascension';scene.showcase=ascensionStage;document.body.classList.toggle('ascension-stage',ascensionStage);const ascensionLobby=ascensionStage?mountAscensionStage($('.scene-shell'),scene):null;
const qualitySelect=$('#qualityMode');
const shakeSelect=$('#shakeMode'),motionToggle=$('#reduceMotion'),flashToggle=$('#reduceFlash');
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
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
function applyVisualPreferences(){
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
scene.onCinematicSound=(...args)=>cultivationAudio.cinematicCue(...args);
scene.onCinematicCancel=id=>cultivationAudio.cinematic?.cancel(id);
scene.onWarSound=(kind,side,strength)=>cultivationAudio.war(kind,side,strength);scene.onAlchemySound=(kind,strength)=>cultivationAudio.alchemy(kind,strength);scene.onSpectacleImpact=()=>cultivationAudio.play('impact',true);
scene.onFeedbackSound=(kind,level)=>cultivationAudio.feedback(kind,level);scene.onLuanHoiAudio=(cut,elapsed)=>cultivationAudio.luanHoi(cut,elapsed); /* 18/11: Niết Bàn Luân Hồi */
scene.onCombatSound=(kind,variant)=>cultivationAudio.combat(kind,variant);scene.onBonkSound=(kind,o)=>cultivationAudio.bonk(kind,o); /* 10/11: Hội Gõ Đầu */
scene.onGiftSound=kind=>cultivationAudio.play(kind,true);
scene.onMazePortalSound=()=>cultivationAudio.play('maze-portal',true);
scene.onKiepSound=kind=>cultivationAudio.play(kind==='reverse'?'ascension-screen-impact':'impact',true); // 20/11: Bách Nhân Độ Kiếp
scene.onTowerSound=kind=>cultivationAudio.play('tower-'+kind,true);
scene.onEventGiftSound=(kind,context)=>cultivationAudio.eventGift(kind,context);
if(overlay)mountRitualHud($('.scene-shell'),scene);
scene.onRitualAudio=(event,elapsed)=>cultivationAudio.ritual(event,elapsed);
scene.onRitualSound=kind=>cultivationAudio.play(kind.startsWith('qi-')?kind:kind==='gather'?'qi':kind==='reveal'?'victory':kind==='surge'?'ascension-charge':kind==='echo'?'ascension-echo':kind==='rush'?'ascension-rush':kind==='screen-impact'?'ascension-screen-impact':'impact');
let voicePlayers={src:null,map:new Map()};const voicePlayer=id=>{if(voicePlayers.src!==state?.players)voicePlayers={src:state?.players,map:new Map((state?.players||[]).map(p=>[p.id,p]))};return voicePlayers.map.get(id)||null;}; // 08/11: giảm giọng đọc theo người chơi
const welcomeClips=new WelcomeClips();if(overlay&&mode==='live'){welcomeClips.load();setInterval(()=>welcomeClips.load(),10*60000);} // 20/11: câu chào đọc sẵn (có file mới dùng)
const narrator=new VoiceQueue({world:mode,audio:cultivationAudio,player:voicePlayer,clips:welcomeClips,onStatus:text=>$('#audioStatus').textContent=text,onStart:(e,duration)=>{
  if(arrivalWelcomes.spoken(e,duration))return;
  if(shouldFocusEvent(e)&&!eventDonationContext(scene))scene.focus(e.user,duration+900);
  const caption=$('#voiceCaption');caption.textContent=e.name+' · '+String(e.clipText||e.text).split('•')[0];caption.hidden=false;
  clearTimeout(voiceCaptionTimer);voiceCaptionTimer=setTimeout(()=>caption.hidden=true,duration+300);
}});
const welcomeBanner=document.createElement('aside');welcomeBanner.className='arrival-welcome';welcomeBanner.hidden=true;welcomeBanner.setAttribute('aria-live','polite');$('.scene-shell').appendChild(welcomeBanner);
let welcomeBannerTimer,welcomeShownAt=0,welcomeMore=[];
initThuyMac(); // 19/11: giao diện Thủy Mặc (?ui=old = giao diện cũ)
const arrivalWelcomes=new ArrivalWelcomes({voice:narrator,show:(e,duration)=>{
 if(state)scene.update(state,selected);
 scene.noteEvent(e);scene.addEffect(e);
 // 19/11 (Thủy Mặc): lệnh bài nhập môn khắc tên + dấu son. Người vào trong 3 s sau đó → dải "Tân đệ tử" bên dưới, không đè lệnh bài.
 const t0=Date.now();
 if(!welcomeBanner.hidden&&t0-welcomeShownAt<3000){
  welcomeMore=[...welcomeMore.filter(n=>n!==e.name),String(e.name||'Đạo hữu').slice(0,18)].slice(-4);
  const strip=welcomeBanner.querySelector('.aw-more');if(strip)strip.textContent=(welcomeBanner.dataset.kind==='back'?'Đồng môn trở lại: ':'Tân đệ tử: ')+welcomeMore.join(' · ');
  clearTimeout(welcomeBannerTimer);welcomeBannerTimer=setTimeout(()=>welcomeBanner.hidden=true,Math.max(2200,duration*.6));return;
 }
 scene.welcomeFocus={id:e.user,until:performance.now()+duration};tone('join');welcomeShownAt=t0;welcomeMore=[];
 welcomeBanner.dataset.kind=e.returning?'back':'new';
 const away=e.returning&&e.awayDays>=1?e.awayDays:0; /* 19/11: vắng từ 1 ngày → chào mừng trở lại + số ngày *//* 20/11 (chủ game: chữ nhiều, nhỏ, rối): mỗi dòng một ý, chữ to */welcomeBanner.innerHTML='<div class="aw-token"><small>'+(away?'VẮNG '+away+' NGÀY':e.returning?'TRỞ LẠI':'ĐỆ TỬ MỚI')+'</small><strong>'+esc(e.name||'Đạo hữu')+'</strong><span>'+(e.returning?'Gõ <b>1</b><br>tu luyện tiếp':'Gõ <b>1</b><br>để nhập môn')+'</span>'+(e.golden&&!e.returning?'<em class="aw-golden">Giờ Vàng ×2</em>':'')+'<i class="aw-seal" aria-hidden="true">VÂN<br>HẢI<br>TÔNG</i></div><p class="aw-more"></p>';
 // 20/11 (chủ game): ảnh đại diện TikTok khắc lên lệnh bài, viền vàng–ngọc phát sáng. Lệnh bài hiện ngay; ảnh tải song song (thường xong trong lúc lệnh bài rơi xuống), lỗi/không có ảnh thì giữ tranh núi như cũ.
 const face=safeAvatar(e.avatar||voicePlayer(e.user)?.avatar);if(face){const box=document.createElement('div'),im=new Image();box.className='aw-face';im.alt='';im.decoding='async';im.referrerPolicy='no-referrer';im.onload=()=>box.classList.add('on');im.onerror=()=>box.remove();im.src=face;box.appendChild(im);welcomeBanner.querySelector('.aw-token')?.appendChild(box);welcomeBanner.classList.add('has-face');}else welcomeBanner.classList.remove('has-face');
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
  const v=source.visualStatus;
  if(v)el.textContent+=' · Yêu cầu '+v.requested+' / đang dùng '+v.applied+' · VFX '+v.vfx.particles+' hạt / '+v.vfx.rings+' vòng / '+v.vfx.glows+' glow · rung '+v.shake+' · giảm chuyển động '+(v.reduceMotion?'bật':'tắt')+' · giảm chớp '+(v.reduceFlash?'bật':'tắt')+' · '+(source.fps||'—')+' FPS'+(v.reason?' · '+v.reason:'');
 }catch{el.textContent='Chưa đọc được kích thước nguồn Link.';}};
 showSourceLayout();setInterval(showSourceLayout,10000);
}
$('#overlayUrl').textContent=overlayUrl();$('#exportLink').href=`/api/export?world=${mode}`;
const titles={halls:['NGŨ ĐƯỜNG','Quản lý Ngũ Đường','Danh sách Đường, thành viên và bảng xếp hạng theo tuần.'],puppets:['TU SĨ GIẢ','Tu sĩ giả','Tạo nhân vật và kích hoạt hành động bằng tay.'],skins:['SKIN','Xem skin',''],events:['SỰ KIỆN','Sự kiện tông môn','Mở hoạt động, theo dõi tỷ thí và quản lý lễ kết duyên.'],scene:['NGƯỜI TRÊN LIVE','Đạo hữu đang tu luyện','Quản lý người đang hoạt động, hồ sơ và trang bị từng đạo hữu.'],rules:['LỆNH & QUÀ','Lệnh và điều kiện nhận quà','Lệnh bình luận, mốc quà, skin và giá vật phẩm.'],settings:['THIẾT LẬP','Thiết lập','Kết nối TikFinity, link cảnh, sự kiện và sao lưu.']};
// Thế giới LIVE: ẩn bộ mô phỏng cho gọn (chỉ dùng ở thế giới thử nghiệm).
if(mode!=='demo')document.querySelector('.simulator').hidden=true;
$('#peopleSearch').addEventListener('input',()=>renderRank());$('#peopleFilter').addEventListener('change',()=>renderRank());
function tab(name){currentTab=name;document.body.classList.toggle('skin-review-open',!overlay&&name==='skins');document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===name+'View'));document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));const a=titles[name];$('#pageCrumb').textContent=a[0];$('#pageTitle').textContent=a[1];$('#pageSubtitle').textContent=a[2];if(name==='scene'){scene.resize();renderRank();}if(name==='skins')renderSkinReview();else skinReviewRequest?.then(view=>view.setActive(false));if(name==='puppets')puppetUI?.refresh();if(name==='halls')updateHallAdmin?.(state);}
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{tab(b.dataset.tab);history.replaceState(null,'','#'+b.dataset.tab);}));
mountEventTab(post);
const updateHallAdmin=overlay?null:mountHallAdmin($('#hallAdmin'),post,esc,mode);
if(titles[location.hash.slice(1)])tab(location.hash.slice(1));
window.addEventListener('hashchange',()=>{const name=location.hash.slice(1);if(titles[name])tab(name);});
$('#worldSelect').addEventListener('change',e=>{params.set('world',e.target.value);location.search=params.toString();});
$('#overlayButton').onclick=()=>window.open(overlayUrl(),'_blank','noopener');
$('#copyOverlay').onclick=async()=>{try{await navigator.clipboard.writeText(overlayUrl());toast('Đã sao chép link cảnh OBS.');}catch{toast(overlayUrl());}};
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3600);}
async function post(path,data={}){if(!online){toast('Máy chủ chưa kết nối.');return {ok:false};}try{const r=await fetch(`${path}?world=${mode}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const v=await r.json();if(!v.ok)toast(v.message||'Chưa thực hiện được.');return v;}catch{toast('Mất kết nối máy chủ. Thử lại khi kết nối phục hồi.');return {ok:false};}}
const player=()=>state?.players.find(p=>p.id===selected);
function selectPlayer(id){selected=id;scene.focusId=id;scene.focusUntil=performance.now()+5000;lastProfile='';const p=player();if(p)$('#simName').value=p.name;render();}
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
function reportStatus(){fetch('/api/client-status',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({diag:liveDiagSnapshot(),renderPerf:renderMetrics?.snapshot(scene),audioPerf:renderMetrics?cultivationAudio.voiceLoad():undefined,view:{w:innerWidth,h:innerHeight,dpr:devicePixelRatio,px:Math.round(innerWidth*devicePixelRatio)+"x"+Math.round(innerHeight*devicePixelRatio)},voiceLag:narrator.lagStats?.(),id:clientId,ua:navigator.userAgent.slice(-60),overlay,world:mode,visualStatus:{requested:scene.budget.mode,applied:scene.budget.level,vfx:VFX_LIMITS[cinematicQuality(scene)],shake:scene.shakeLevel,reduceMotion:!scene.motion,reduceFlash:scene.reduceFlash,reason:scene.budget.pressured?'Tải kéo dài':scene.budget.crowded?'Đông nhân vật':scene.budget.level!==scene.budget.mode&&scene.budget.mode!=='auto'?'FPS thấp':''},audioEnabled:cultivationAudio.enabled,audioLatency:cultivationAudio.ctx?{base:Math.round((cultivationAudio.ctx.baseLatency||0)*1000),output:Math.round((cultivationAudio.ctx.outputLatency||0)*1000),rate:cultivationAudio.ctx.sampleRate}:null,ritualBuild:cultivationAudio.ritualBuild||null, /* 18/11: chẩn đoán âm trễ */audioLevels:{master:cultivationAudio.volume,music:cultivationAudio.ambient,sfx:cultivationAudio.sfx,ducked:cultivationAudio.ducked,musicOutput:cultivationAudio.music?.volume},ctx:cultivationAudio.ctx?.state||'none',music:cultivationAudio.music?(cultivationAudio.music.paused?'paused':'playing'):'none',voiceOn:narrator.enabled,idleOn,running:narrator.running,queue:narrator.queue.length,status:$('#audioStatus').textContent,error:lastAudioError,zoom:scene.zoom,camera:scene.cameraEnabled,motion:scene.motion,opportunityVisible:!!$('#opportunityHud')&&!$('#opportunityHud').hidden,caption:$('#voiceCaption').textContent,spot:$('#spotlight').textContent,residents:residentsOn,acts:residentActs,skip:residentSkip,q:queue.length,busy,fps:scene.fps,frameMs:scene.frameMs,frameP95:scene.frameP95,cacheMiB:scene.cacheMiB,active:state?.players?.filter(p=>p.active).length,onStage:scene.targets?.length,trips:scene.mover?[...scene.mover.trips.values()].filter(x=>x.kind!=='hover'&&performance.now()-x.t0<4200).length:0,bubbles:scene.mover?.bubbles.size,voiceQ:narrator.queue.length,activeVoiceId:narrator.activeVoiceId,voicePriorities:narrator.queue.map(x=>x.e.raceEntry?"race-entry":x.e.effect),version:90,managementOnly:!overlay,quality:scene.budget.level,renderWidth:scene.canvas.width,renderLayout:scene.renderLayout?.(),cachedActors:scene.characterFrames.frames.size,screenShake:scene.screenShake,renderBuild:"screen-shake-v1",visualQueue:queue.length,coalesced:presentations.coalesced,solo:scene.presentation?.until>performance.now()})}).catch(()=>{});}
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
  const qiHtml=state.halls?hallsRankHTML(state,esc,state.serverNow||Date.now()):'<div class="qi-leaders"><b>'+(rookieTurn?'🌱 TÂN TÚ 24H':'TOP TU VI')+'</b>'+ranked.map((p,i)=>`<span>${i+1}. ${esc(short(p.name))} <strong class="tb-realm">${esc(realmWithStage(p.realmName||state.realms[p.realm]||'Phàm nhân',p.realmStage))}</strong></span>` /* 20/11: tên cảnh giới thay số tu vi */).join('')+'</div>';
  const giftHtml=((state.topGifters||[]).length?'<div class="qi-leaders gift-leaders"><b>TOP QUÀ</b>'+state.topGifters.slice(0,3).map((g,i)=>{const av=safeAvatar(g.avatar);return `<span class="gift-top gift-top-${i+1}"><i class="gift-top-portrait"><em>${esc(Array.from(g.name||'Đ')[0])}</em>${av?`<img src="${esc(av)}" alt="" referrerpolicy="no-referrer" onerror="this.remove()">`:''}<svg viewBox="${[1,2,0][i]*512} 0 512 512" aria-hidden="true"><image href="/assets/honor-frames-v2.webp" width="1536" height="512" preserveAspectRatio="none"/></svg></i><span class="gift-top-text"><small class="gift-top-title">${['ĐỆ NHẤT CUNG PHỤNG','NHỊ CUNG PHỤNG','TAM CUNG PHỤNG'][i]}</small><span class="gift-top-line">${esc(short(g.name))} · <strong>${fmt(g.giftCoins)}</strong> coin</span></span></span>`;}).join('')+'</div>':(leader?`<div class="patron-leader"><b>${state.patronEnabled?'ĐẠI HỘ PHÁP':'TOP QUÀ'}</b> ${esc(short(leader.name))} · ${fmt(leader.giftCoins)} coin tích lũy</div>`:''));
  const giftEl=$('#giftRanks'),html=giftEl?qiHtml:qiHtml+giftHtml;
  if(force||html!==lastRanksHTML){el.innerHTML=html;lastRanksHTML=html;}
  if(giftEl&&(force||giftHtml!==giftEl.dataset.html)){giftEl.innerHTML=giftHtml;giftEl.dataset.html=giftHtml;giftEl.hidden=!giftHtml;}
}
let giftReceiptTimer;
// 08/11 tối: tông chủ ban lễ — thẻ thông báo hiện ngay (trước đây chỉ có hiệu ứng hoa sen, không chữ).
function showAdminReceipt(e){const el=$('#giftReceipt');if(!el)return;const r=e.reward||{},parts=[r.qi&&(e.qiPct&&e.pill?'tu vi +'+e.qiPct+'% (+'+fmt(r.qi)+')':'+'+fmt(r.qi)+' tu vi'),r.stones&&'+'+fmt(r.stones)+' linh thạch',r.herbs&&'+'+fmt(r.herbs)+' linh thảo'].filter(Boolean);
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
if(overlay)setInterval(()=>renderLiveRanks(),2000); // 20/11: cuộn Thiên Bảng ↔ Sổ lệnh ↔ Ngũ Đường xoay theo đồng hồ, không chờ state mới
if(overlay){
  const tower=document.getElementById('towerStage');
  setInterval(()=>{if(state?.tower||!tower.hidden)renderTower(tower,state,scene,esc);},250);
}
if(overlay)setInterval(()=>renderStageQueue(document.getElementById('stageQueue'),state?.halls?.match?[]:queue,Date.now(),current,esc),500); // 20/11: trận Ngũ Đường → hàng chờ dừng (playNext) → ẩn bảng, khỏi báo "~1s" sai
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
function throttleRitual(e){if(e?.effect!=="breakthrough"||ascensionStage||!e.resident&&e.actorKind!=='npc'&&!e.firstStep)return e; /* 19/11: lượt NHẬP MÔN (bình luận đầu tiên) cũng giới hạn màn toàn cảnh */const now=Date.now();// 4/11 tối: mọi cảnh giới tối đa 1 màn toàn cảnh / 60 s (Luyện Khí 90 s) — nhiều người đột phá liền nhau từng tạo cảnh lặp nối đuôi.
  if(now-lastFullRitualAt<(breakthroughRealm(e)<=1?90000:60000))return {...e,effect:"qi",kind:undefined,ritualSkipped:true};lastFullRitualAt=now;return e;}
function enqueue(e){if(!overlay)return;if(forceSoLenh(e))renderLiveRanks(true);if(e?.firstStep&&!ascensionStage){/* 19/11 (chủ game: ~30 người cùng lúc phải đẹp): nhập môn = hiệu ứng TẠI CHỖ ngay, song song, không chiếm toàn màn */addNhapMon(scene,e);scene.noteEvent?.(e);return;}e=throttleRitual(e);if(e?.orbCard)orbCard?.show(e); /* 18/11: thẻ Linh Châu hiện ngay, giọng vẫn theo hàng */if(e?.card&&cardKind(e.card)){if(!ascensionStage)inventoryDeck?.show(e,state?.players?.find(p=>p.id===e.user));return;}if(ascensionStage){enqueueReady(e);return;}if(e.gift){scene.noteEvent(e);giftCombos.push(e,Date.now());return;}enqueueReady(e);}
let engagementSoundAt=-Infinity;
// 07/11/2026: QUÀ HIỆN NGAY LÚC TẶNG. Thẻ quà hiện lập tức; quà ưu tiên cao nhất và cắt ngang hiệu ứng thường.
// Quà lớn (≥99 coin hoặc quà VIP) cắt cả màn đột phá cảnh giới thấp (≤ Hóa Thần). Không cắt Thiên Đạo, đại điển, quà khác.
const GIFT_STALE_MS=10000;let current=null,currentTimer=null;
const giftValue=e=>(Number(e.coins)||0)*Math.max(1,Number(e.count)||1);
function giftMayPreempt(cur,g){if(!cur||cur.gift||cur.heavenStrike||cur.ceremony||isBlackGoldAward(cur))return false;if(cur.effect==='breakthrough')return giftValue(g)>=(breakthroughRealm(cur)<=5?500:1000);return true;} /* 19/11 chủ game: màn đột phá chỉ bị cắt bởi quà ≥500 coin (cảnh giới ≤5) hoặc ≥1000 coin (cảnh giới cao hơn); quà 99 chờ xếp hàng */
function interruptShow(){clearTimeout(spotTimer);clearTimeout(currentTimer);$('#spotlight').classList.remove('visible');scene.interruptPresentation?.();cultivationAudio.ritual(null);busy=false;current=null;}
function showDiscipleNotice(e,title=null,sub=null){
 let box=document.getElementById('discipleNotices');
 if(!box){box=document.createElement('aside');box.id='discipleNotices';box.setAttribute('role','status');box.setAttribute('aria-live','polite');document.querySelector('.scene-shell').appendChild(box);}
 const card=document.createElement('div');card.className='disciple-notice';
 card.innerHTML=`<b>${esc(title||'✦ KẾT NẠP CHÂN TRUYỀN THÀNH CÔNG ✦')}</b><strong>${esc(e.name||'Đạo hữu')}</strong><span>${esc(sub||'Đệ tử Chân Truyền · '+(e.achieve?.item||'Ngũ Đường'))}</span>`;
 box.appendChild(card);while(box.children.length>3)box.firstElementChild.remove();
 setTimeout(()=>card.remove(),6000);
}
function enqueueReady(e){
  // 15/11: nhắc gộp "đủ đột phá" — chỉ bong bóng trên đầu từng người + 1 câu giọng; không chiếm hàng hiệu ứng.
  if(e.readyReminder){const t0=performance.now();for(const id of e.ids||[])scene.mover?.onEvent({user:id,effect:'ready'},t0,scene.motion);if(!ascensionStage)narrator.add(e);return;}
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
  if(e.mountReveal&&!e.resident)addMountReveal(scene,e,performance.now()); // 16/11: màn nở tọa kỹ theo bậc
  if(e.achieve?.kind==='disciple'){showDiscipleNotice(e);scene.noteEvent(e);tone('lotus');return;}
  if(e.hallJoin){showDiscipleNotice(e,'✦ BÁI NHẬP '+String(e.hallJoin.name||'NGŨ ĐƯỜNG').toLocaleUpperCase('vi')+' ✦','Đệ tử mới · nhận lệnh bài Đường');scene.mover?.onEvent({user:e.user,effect:'ready'},performance.now(),scene.motion);scene.noteEvent(e);tone('petal');return;} // 16/11: vào Đường có thẻ + nhân vật nhấp sáng
  if(e.petAward&&e.giftFrom)showPetGiftAward(e);
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
  // 19/11: đột phá người thật đến lúc đang chiếu khung vặt (ưu tiên <3, không phải quà) → cắt ngang, chiếu đột phá NGAY (hình + tiếng cùng lúc).
  if(urgentBreakthrough(e)&&busy&&current&&!current.e.gift&&current.e.effect!=='breakthrough'&&presentationPriority(current.e)<3&&!ascensionHeld(state)&&!state?.halls?.match)interruptShow();
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
const ownVisitorReveal=(event,state)=>isBlackGoldAward(event)&&state?.visitor?.kind===event.transform
  &&!state.visitor.closedAt&&state.visitor.endsAt>state.serverNow;
function playNext(){
 if(busy||state?.halls?.match)return;let e;for(;;){e=presentations.take(Date.now(),e=>ownVisitorReveal(e,state)||!(e.effect==='breakthrough'?ascensionHeld(state):majorEventActive(state)&&(e.effect==='transform'||e.petAward)));if(!e)return;if(e.gift&&e._arrivedAt&&Date.now()-e._arrivedAt>GIFT_STALE_MS)continue;if(!presentations.start(e))continue;break;} // 07/11: quà quá trễ thì bỏ màn diễn (thẻ quà đã hiện lúc tặng)
 if(e.gift&&eventDonationContext(scene)){scene.noteEvent(e);scene.addEffect(e);showGiftReceipt(e);queueMicrotask(playNext);return;}
 busy=true;current={e,at:Date.now()};
 if(e.heavenStrike){scene.startHeavenStrike(e);const au=cultivationAudio;if(au.enabled&&au.ctx?.state==='running'){au.duck(true);scheduleHeavenStrikeAudio(au.ctx,au.fxBus,strikeProfile(e.heavenStrike.seed));}currentTimer=setTimeout(()=>{au.duck(false);busy=false;current=null;playNext();},HEAVEN_STRIKE_MS+200);return;} // 07/11: Thiên Đạo giáng lôi
 if(e.ceremony){showCeremony(document.getElementById('ceremony'),e);narrator.add(e);tone('breakthrough');currentTimer=setTimeout(()=>{busy=false;current=null;playNext();},presentationDuration(e)+200);return;} // v84: đại điển vinh danh
 const luxury=luxuryTier(e),duration=presentationDuration(e);
 if(e.petAward){const el=$('#giftReceipt');el.innerHTML=`<strong>${esc(e.name)} · Linh thú đồng hành</strong><span>${esc((e.petNames||[]).join(' · '))}</span>`;el.hidden=false;clearTimeout(giftReceiptTimer);giftReceiptTimer=setTimeout(()=>el.hidden=true,duration);}
 if(e.gift)showGiftReceipt(e);
 if(e.visitorProgress){const v=e.visitorProgress,t=v.toward,r=VISITOR_GIFT_REWARDS[t?.kind||v.kind];if(r&&t){const pct=Math.max(1,Math.min(99,Math.round((t.need-t.left)/t.need*100)));$('#giftReceipt').insertAdjacentHTML('beforeend',`<span>✦ ${esc(r.skinName)}: đã góp ${pct}% · giữ cho lần sau</span>`);}} // 20/11 A: ví tiên duyên giữ mãi — không ghi coin (luật bảng quà)
 if(e.loyaltyAward||e.visitorAward){const el=$('#giftReceipt');el.innerHTML=`<strong>Tri ân ${esc(e.name)}</strong><span>${esc(e.itemNames.join(' · '))}</span>`;el.hidden=false;clearTimeout(giftReceiptTimer);giftReceiptTimer=setTimeout(()=>el.hidden=true,duration);}
 scene.addEffect(e);honorUI.show(e);if(e.effect!=='breakthrough'||![1,2,3,4,5,6,7,8,9,10].includes(breakthroughRealm(e)))tone(e.effect==='breakthrough'?'qi':e.technique?({thunder:'boss',soul:'dragon',lotus:'lotus',stars:'petal',celestial:'breakthrough',bamboo:'sword',vortex:'qi',frost:'sword',flame:'dragon',bell:'boss',dragon:'dragon',petal:'petal',meteor:'boss',flowersword:'petal',peachfan:'petal',flowercage:'lotus',starmirror:'breakthrough',stararrow:'sword',sevenstars:'boss',stardust:'qi'})[e.technique.id]||'attack':e.effect);narrator.add(e);
 if(shouldFocusEvent(e)&&!isBlackGoldAward(e)&&!eventDonationContext(scene)&&!scene.raceStatus?.active&&!scene.socialStage?.length)scene.focus(e.user,duration);
 const label=e.raceGift?(e.raceBoost?'BỨT TỐC +'+e.raceBoost+' trượng':'Quà đã ghi nhận · chờ kết quả xếp hạng'):e.technique?.name||highGiftName(e)||luxury?.name||(e.hacKimArtifact?'KHAI ẤN · '+BLACK_GOLD_VISITOR.relic:null)||({breakthrough:'ĐỘT PHÁ · '+REALM_NAMES[breakthroughRealm(e)],join:'Nhập môn',attack:'Xuất chiêu',qi:'Tu luyện',sword:'Ngự kiếm',lotus:'Liên hoa trận',dragon:'Thanh long giáng thế',victory:'Bí cảnh hoàn tất',boss:'Yêu thú giáng thế',opportunity:e.opportunityEnd?'Cơ duyên kết thúc':'Thiên Đạo Cơ Duyên',transform:'BIẾN HÌNH · '+String(e.skinName||'').toUpperCase()})[e.effect]||e.text;
 // v39: trên cảnh LIVE chỉ còn 1 khung (khung tên này); phần thưởng gộp thành 1 dòng nhỏ thay cho khung biên nhận riêng.
 const r=e.reward,extra=r&&!e.raceGift&&(e.gift||e.flowerRank||e.loyaltyAward)?[r.qi&&`+${fmt(r.qi)} tu vi`,r.stones&&`+${fmt(r.stones)} linh thạch`,...(r.itemNames||e.itemNames||[]).slice(0,2),e.buff?.mult&&`Phúc duyên ×${String(e.buff.mult).replace('.',',')}`].filter(Boolean).join(' · '):'';
 $('#spotlight').innerHTML=`<strong>${esc(e.name)}</strong><span>${esc(label)}</span>${extra?`<small class="spot-reward">${esc(extra)}</small>`:''}`;
 if(e.achieve&&!e.gift&&showBaoHy(document.getElementById('baoHy'),e,scene,state?.players?.find(p=>p.id===e.user),esc,duration)){clearTimeout(spotTimer);spotTimer=setTimeout(()=>{busy=false;current=null;playNext();},duration+150);return;} // 11/11: rèn/học/ban thưởng/VIP → Báo Hỷ
 if(e.hallCard){
   const panel=$('#hallCard');panel.innerHTML=hallCardHTML(e.hallCard,esc);panel.hidden=false;
   clearTimeout(spotTimer);spotTimer=setTimeout(()=>{panel.hidden=true;busy=false;current=null;playNext();},duration);return;
 }
 if(e.card&&showLinhBai(document.getElementById('linhBai'),e,scene,state?.players?.find(p=>p.id===e.user),esc,duration)){clearTimeout(spotTimer);spotTimer=setTimeout(()=>{busy=false;current=null;playNext();},duration+150);return;} // 11/11: gõ 9 → Linh Bài thay khung tên
 $('#spotlight').classList.toggle('spot-transform',e.effect==='transform'); // 19/11: chữ biến hình xuống dưới chân, không đè mặt/hào quang người đang biến hình
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
  if(!visualSaving&&JSON.stringify(s.sourceVisual??null)!==JSON.stringify(sharedVisual)){
    sharedVisual=s.sourceVisual??null;applyVisualPreferences();
  }
  s=withHallMembership(streamState(s,mode));
  ascensionLobby?.update(s,queue);
  document.querySelector('.live-disclosure').textContent=mode==='live'&&s.liveIntegrityVersion!==1?'M\u00c1Y CH\u1ee6 CH\u01afA \u00c1P D\u1ee4NG LU\u1eacT LIVE M\u1edaI':'TRÒ CHƠI TU TIÊN';
  const previous=state;state=s;if(overlay&&s.raceStatus?.entryAnnouncement)narrator.add(s.raceStatus.entryAnnouncement);honorUI.update(s);if(initialized&&previous){const previousPlayers=new Map(previous.players.map(p=>[p.id,p]));for(const p of s.players){const old=previousPlayers.get(p.id);if(old&&skinFor(p.giftCoins).level>skinFor(old.giftCoins).level)enqueue({id:'skin:'+p.id+':'+p.giftCoins,user:p.id,name:p.name,effect:'skin',text:skinFor(p.giftCoins).name});}}online=true;$('#disconnectBanner').hidden=true;$('#saveStatus').textContent='● Đã kết nối · tự lưu mỗi 3s';if(!selected||!state.players.some(p=>p.id===selected))selected=state.players[0]?.id||null;
  for(let e of s.events){if(e.effect==='breakthrough'){const old=previous?.players.find(p=>p.id===e.user),next=s.players.find(p=>p.id===e.user);e={...e,visualFrom:e.visualFrom||(old?{...old,realm:e.fromRealm??old.realm}:undefined),visualTo:e.visualTo||(next?{...next,realm:breakthroughRealm(e)}:undefined)};}if(!seen.has(e.id)&&(initialized||e.autoArrival&&s.serverNow-e.at<8000)){enqueue(e);lastViewerAt=Date.now();}seen.add(e.id);}if(seen.size>1000)seen=new Set([...seen].slice(-300));
  if(!initialized){initialized=true;const p=player();if(p)$('#simName').value=p.name;renderGifts();renderGuide();renderLiveRanks(true);}
  scheduleRender();
}
let renderPending=false;function scheduleRender(){if(renderPending)return;renderPending=true;setTimeout(()=>{renderPending=false;render();},100);}
// 08/11 tối: THẺ LUẬT QUÀ (ô #giftBoard cột phải) — ảnh quà thật → kết quả theo sự kiện đang mở.
function renderGiftRules(){const el=$('#giftBoard');if(!el)return;const r=giftRules(state,state?.serverNow);setHUD(el,giftRuleHTML(r,state?.giftArt));el.hidden=!r?.rows?.length;el.dataset.tone=r?.tone||'';el.classList.add('gift-rule-card');}
function setHUD(el,html){if(el._lastHUD!==html){el.innerHTML=html;el._lastHUD=html;}}
function renderHallGuide(){
 const guide=$('#lowerRightGuide'),halls=state.halls?.halls;
 if(!guide)return;
 guide.hidden=!halls?.length;
 if(guide.hidden)return;
 // 16/11 (chủ game): tiêu đề 'Chọn đường phái tu luyện', bỏ dòng '1 Truyền Công · 2 …' (gõ lệnh là tự xem).
 setHUD(guide,`<b>CHỌN ĐƯỜNG PHÁI TU LUYỆN</b><ul>`
  +hallGuideRows(halls).map(({cmd,text})=>`<li><span>${text}:</span> <code>${cmd}</code></li>`).join('')+'</ul>');
}
mountPetUI(post);
function render(){if(!state)return;const renderStart=renderMetrics?performance.now():0;document.body.classList.toggle('has-major-event',majorEventActive(state)||!!state?.bonkFest?.active); /* 17/11: Hội Gõ Đầu cũng ẩn bảng hướng dẫn chung (không thêm vào majorEventActive: bonk.js dùng nó để tự nhường) */if(overlay){document.body.classList.toggle('pet-cove-stage',state.environment?.id==='pet-cove');renderCompanionHUD(state);renderLikeGoal();renderEngagement();}renderPetUI(state,!overlay);if(!overlay){renderScenePicker();renderQuickGift();renderLiveControls();renderHeavenPanel();}renderSocialUI(state,!overlay);if(overlay)renderVisitorHud();const p=player();const sceneStart=renderMetrics?performance.now():0;scene.update(state,selected);const sceneCost=renderMetrics?performance.now()-sceneStart:0;cultivationAudio.setTrack(musicForState(state).index);if(majorEventActive(state)&&busy&&current&&!ownVisitorReveal(current.e,state)&&(current.e.effect==='transform'||current.e.petAward)){const deferred=current.e;interruptShow();presentations.push(deferred);}if(overlay){if(!busy)playNext();renderFocus();}const active=state.players.filter(p=>p.active),counts=participantCounts(state.players);$('#statPlayers').textContent=fmt(counts.players);$('#statProfiles').textContent=`${fmt(state.playerCount??state.players.length)} hồ sơ được lưu`;$('#statQi').textContent=fmt(state.sectQi);$('#statInteractions').textContent=fmt(state.totalInteractions);$('#sceneCount').textContent=counts.players;$('#worldBadge').textContent=mode==='demo'?'THỬ NGHIỆM':'LIVE';$('#worldNote').textContent=mode==='demo'?'Dữ liệu thử · tách biệt LIVE':'Dữ liệu LIVE · lưu trên máy';$('#demoControls').hidden=mode!=='demo';$('#liveControlsNotice').hidden=mode==='demo';$('#simLabel').textContent=mode==='demo'?'KHÔNG DÙNG QUÀ THẬT':'ĐANG NHẬN SỰ KIỆN THẬT';
  const connected=state.connection.status==='connected';setHUD($('.scene-location'),'<i></i> '+esc(state.environment?.name||'Tụ Linh Đài').toUpperCase()+(mode==='demo'?'<small>THỬ</small>':connected?'<small>LIVE</small>':'<small>CHỜ KẾT NỐI</small>'));$('#connectionText').textContent=mode==='demo'?'Bộ mô phỏng sẵn sàng':connected?'TikFinity đã kết nối':'TikFinity chưa kết nối';$('#connectionDot').classList.toggle('off',mode==='live'&&!connected);$('#bridgeStatus').textContent=({connected:'Đã kết nối • đang nhận sự kiện',connecting:'Đang kết nối…',reconnecting:'Đang thử kết nối lại sau mỗi 5 giây',disconnected:'Chưa kết nối'})[state.connection.status]+` · ${fmt(state.connection.received)} sự kiện`;
  $('#bridgeError').textContent=state.connection.lastError||'';$('#bridgeButton').textContent=state.connection.enabled?'Ngắt kết nối':'Kết nối TikFinity';
  const remain=Math.max(0,Math.ceil(((state.boss?.endsAt||state.nextBossAt)-state.serverNow)/1000));$('#scenePhase').textContent=state.raceStatus?.active?'Vân Hải Thiên Lộ':state.socialScene?(state.socialScene==='tournament'?'Luận Kiếm':'Tam Sinh Ước'):state.boss?`Bí cảnh còn ${remain}s`:`♜ ${Math.floor(remain/60)}:${String(remain%60).padStart(2,'0')}`;
  const bh=$('#bossHud');bh.hidden=!state.boss||state.boss.species==='abyss-dragon';bh.classList.toggle('visible',!bh.hidden);document.body.classList.toggle('abyss-fight',state.boss?.species==='abyss-dragon'&&state.boss.hp>0); // 05/11: bảng yêu lực Ma Long vẽ trên canvas, ẩn bảng xếp hạng góc trái để không chồng
  if(state.boss)setHUD(bh,`<div class="boss-line"><span>♜ ${esc(state.boss.name)}</span><span>${fmt(state.boss.hp)} / ${fmt(state.boss.maxHp)}</span></div><div class="progress"><i style="width:${state.boss.hp/state.boss.maxHp*100}%"></i></div><small>Gõ <b>danh</b> · ${remain}s · ${esc(state.boss.encounter?.name||'Top công lực nhận thưởng')}</small>${Object.entries(state.boss.damage||{}).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,3).map(([id,d],i)=>`<small class="boss-rank">${i+1}. ${esc(state.players.find(p=>p.id===id)?.name||'Đạo hữu')} · ${fmt(d)} công lực</small>`).join('')}`);
  if(!overlay&&currentTab==='skins')renderSkinReview();
  if(!overlay&&currentTab==='halls')updateHallAdmin(state);
  if(overlay){renderHallGuide();renderFlowerHud();renderRail();renderLiveRanks();renderGiftRules();
    const duel=$('#hallDuel'),duelHTML=hallDuelHTML(state.halls,esc,state.serverNow);
    duel.hidden=!duelHTML;document.body.classList.toggle('hall-dueling',!!duelHTML);
    if(duelHTML)setHUD(duel,duelHTML);}else syncAutoEvents();
  const oh=$('#opportunityHud'),o=state.opportunity,seconds=o?Math.max(0,Math.ceil((o.endsAt-state.serverNow)/1000)):0;oh.hidden=!seconds;
  // 17/11: bỏ dãy số coin từng cảnh giới (tới 255999999, trái luật không ghi coin) → chỉ cách chơi.
  if(seconds){const cmd=state.quick?.paused?'cơ duyên':'6 hoặc cơ duyên';setHUD(oh,`<b>CƠ DUYÊN · ${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}</b><span>Quà tích điểm cơ duyên · đủ điểm tự đột phá</span><span>Gõ <code>${esc(cmd)}</code> xem điểm của mình</span><small>Từ Hóa Thần: tối đa 1 đại cảnh/ngày · điểm dư được giữ</small>`);}
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
for(const b of document.querySelectorAll('[data-visitor-sale]'))b.onclick=async()=>{const r=await post('/api/visitor-sale',{pct:Number(b.dataset.visitorSale)});if(r.ok)toast('Đã hạ giá '+r.pct+'% tới hết lượt');}; // 21/11 Song Tiên hạ giá
for(const b of document.querySelectorAll('[data-flower]'))b.onclick=()=>flowerEvent(Number(b.dataset.flower),b.dataset.kind||'flower');
// Tự động sự kiện: công tắc + khoảng cách (phút).
function syncAutoEvents(){const box=$('#autoEvents'),min=$('#autoEventMinutes'),note=$('#autoEventNote');if(!box||!state)return;const st=state.settings||{};if(document.activeElement!==box)box.checked=st.autoEvents!==false;const rnd=$('#autoRandom');if(rnd&&document.activeElement!==rnd)rnd.checked=!!st.autoRandom;if(document.activeElement!==min)min.value=st.autoEventMinutes??15;
  const next=state.nextAutoEventAt?Math.max(0,Math.round((state.nextAutoEventAt-state.serverNow)/60000)):null;note.textContent=st.autoEvents===false?'Đang tắt.':next!==null?`${st.autoRandom?'🎲 Random · ':''}Sự kiện tự động tiếp theo khoảng ${next} phút nữa (cần ≥2 người đang hoạt động, không có yêu thú).`:'Sẽ hẹn sự kiện đầu tiên sau 5 phút.';}
if($('#autoRandom'))$('#autoRandom').onchange=async e=>{const r=await post('/api/event-settings',{autoRandom:e.target.checked});if(r.ok)toast(e.target.checked?'Đã bật random tất cả sự kiện.':'Đã tắt random — quay lại luân phiên Hoa Vũ / Lưu Tinh.');};
if($('#autoEvents')){$('#autoEvents').onchange=async e=>{const r=await post('/api/event-settings',{autoEvents:e.target.checked});if(r.ok)toast(e.target.checked?'Đã bật sự kiện tự động.':'Đã tắt sự kiện tự động.');};$('#autoEventMinutes').onchange=async e=>{const r=await post('/api/event-settings',{autoEventMinutes:Number(e.target.value)});if(r.ok)toast('Sự kiện tự động mỗi '+e.target.value+' phút.');};}
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
 let html='<b>SỰ KIỆN · '+esc(e.lineup?.length>1?(e.bundle?'SONG TIÊN ĐẶC BIỆT':'SONG TIÊN GIÁNG LÂM'):cfg?.name||'Khách quý')+(e.sale?' · HẠ GIÁ':'')+'</b><span class="event-time">Còn '+clock+'</span><p><code>Gõ '+esc(command)+'</code><span>'+esc(free)+'</span></p>';
 if(e.lineup?.length){
  // 20/11 Tam Tiên → 21/11 SONG TIÊN: 1 dòng/vị: ảnh món → skin (cùng mốc thì kèm pháp bảo). Lượt đặc biệt (bundle): 1 dòng → cả 2 skin.
  // Hạ giá (chủ game chốt): KHÔNG chữ "coin" — số cũ gạch mờ, số mới sáng, kèm ảnh món (ảnh theo giá gốc; ví giữ phần dư).
  const cut=(base,price)=>e.sale&&price!==base?'<s class="ev-old">'+base+'</s><b class="ev-new">'+price+'</b>':'';
  const tok=(s,base,price)=>'<b class="ev-gift">'+cut(base,price)+lineupSlotHTML({...s,price:base},state.giftArt)+'</b>';
  html+='<div class="event-rewards"><strong>QUÀ SỰ KIỆN</strong>'+(e.bundle?'<p>'+tok({},e.bundle.base,e.bundle.price)+'<span>→ '+e.lineup.map(s=>esc(VISITOR_GIFT_REWARDS[s.kind]?.skinName||'')).join(' + ')+' (cả 2)</span></p>':e.lineup.map(s=>{const r=VISITOR_GIFT_REWARDS[s.kind];if(!r)return '';
   return '<p>'+tok(s,s.base??s.price,s.price)+'<span>→ '+esc(r.skinName)+(r.skinCoins&&r.skinCoins===r.artifactCoins?' + '+esc(r.artifactName):'')+'</span></p>';}).join(''))+'</div>';
 }else if(reward){
  const single=reward.skinCoins&&reward.skinCoins===reward.artifactCoins; // 14/11: Nhân Quả — 1 mốc nhận cả skin + pháp bảo
  // 17/11: luật bảng quà — ảnh quà thật thay số coin, không ghi chú dài.
  const tok=c=>'<b class="ev-gift">'+giftTokenHTML(state.giftArt,c)+'</b>';
  html+='<div class="event-rewards"><strong>QUÀ SỰ KIỆN</strong>'+(single?'<p>'+tok(reward.skinCoins)+'<span>→ skin '+esc(reward.skinName)+' + '+esc(reward.artifactName)+'</span></p>':'<p>'+tok(reward.skinCoins||100)+'<span>→ skin '+esc(reward.skinName)+'</span></p><p>'+tok(reward.artifactCoins||500)+'<span>→ thêm '+esc(reward.artifactName)+'</span></p>')+'</div>';
 }else if(e.goal)html+='<span>Truyền đạo: '+fmt(e.points||0)+' / '+fmt(e.goal)+'</span>';
 setHUD(el,html);
}


// v73: tab Tu sĩ giả
var puppetUI=initPuppetUI({root:document.getElementById('puppetPanel'),post,toast,getState:()=>state,openPlayer:id=>{tab('scene');selectPlayer(id);renderEditor(true);}});
if(location.hash==='#puppets')puppetUI.refresh();


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
