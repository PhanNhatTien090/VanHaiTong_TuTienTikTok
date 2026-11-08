import {drawRealmSkinV2,ensureRealmSkinV2} from './realm-skins-v2.js';
import {drawHeavenStrike,drawStunMark,heavenStrikeShake,strikeProfile,HEAVEN_STRIKE_MS} from './heaven-strike.js';
import {liveAudienceCount} from './crowd-policy.js';
import {prepareHoaThanArt} from './hoa-than-formation.js';
import {prepareLuyenHuArt} from './luyen-hu-formation.js';
import {prepareDaiThuaWorld} from './dai-thua-formation.js';
import {prepareChanTienArt} from './chan-tien-formation.js';
import {prepareThaiAtArt} from './thai-at-awakening.js';
import {prepareDaiLaArt} from './dai-la-awakening.js';
import {prepareTienDeArt} from './tien-de-awakening.js';
import {prepareKimTienArt} from './kim-tien-awakening.js';
import {petCoveOn,petCoveTargets,drawPetCove,PET_COVE_MAP} from './pet-cove.js';
import {tickBattleSound} from './battle-audio.js';
import {seaWorn,loadSeaArt,drawSeaBody,drawSeaAdornment,drawSeaVisitor} from './sea-dragon-heir.js';
import {tudoWorn,loadTudoArt,drawTudoBody,drawTudoAdornment,drawTudoVisitor,TUDO_BLADE} from './tudo-ma-ton.js';
import {khuyWorn,loadKhuyArt,drawKhuyBody,drawKhuyAdornment,drawKhuyVisitor,KHUY_DRAGON} from './khuy-niet.js';
import {prepareAbyssArt,drawAbyssRetaliation,drawAbyssHealth,abyssPose} from './abyss-boss.js';
import {tributeProfile,drawGiftTribute,prepareGiftTribute} from './gift-tribute.js';
import {drawAscensionStageIdle,isAscensionEvent} from './ascension-stage.js';
import {prepareNguyenAnhArt} from './nguyen-anh-art.js';
import {sectHallTargets,drawSectCourt,sectElders,seatSectElders} from './sect-hall.js';
import {loadImpactArt} from './ascension-impact.js';
import {prepareBreakthroughSpectacle} from './breakthrough-spectacle.js';
import {smallGift,compactPlaza,crowdTargets,drawRitual} from './live-cinema.js';
import {loadDoraArt,doraWorn,drawDoraBody,drawDoraRelic,drawDoraVisitor,drawDoraTechnique} from './doraemon-art.js';
import {noteEngagementReaction,drawEngagementReactions} from './engagement-reactions.js';
import {artworkCrop,projectedGround,courtyardTargets,constrainGroundTargets} from './courtyard-layout.js';
import {godFormFor,drawGodAuras} from './god-forms.js';
import {raceFlightPose} from './race-motion.js';
import {drawComboBurst} from './gift-combos.js';
import {drawLanternFestival} from './lantern-fx.js';
import {companionPlaces,drawCompanionLinks} from './companion-fx.js';
import {petArrivalProfile,drawPetArrival,drawPetArrivalTitle} from './pet-arrival-fx.js';
import {loadPetArt,drawPet} from './spirit-pet-art.js';
import {linWanWorn,loadLinWanArt,drawLinWanBody,drawLinWanQi,drawLinWanVisitor} from './lin-wan-art.js';
import {loadSpiritBeasts} from './gift-spirit-beasts.js';
import {syncEventGiftFx,eventGiftImpulse,eventGiftCamera} from './event-gift-fx.js';
import {giftSpectacleTier,loadGiftSpectacle,drawGiftSpectacle,spectacleShake} from './gift-spectacle.js';
import {loadFish,floatingTargets,drawWorldAmbience} from './world-ambience.js';
import {loadShendeArt,shendeWorn,drawShendeBody,drawShendeRelic} from './shende-art.js';
import {prepareAscensionArt} from './ascension-art.js';
import {divineSelection,drawDivineBody,drawDivineHalo} from './divine-wardrobe.js';
import {loadCelestialArt} from './celestial-bosses.js';
import {loadPrestigeArt,notePrestigeGift,drawPrestigeAura} from './sword-prestige.js';
import {syncRace,raceTargets,drawRace,raceActorIds} from './sword-race.js';
import {syncWar,warTargets,drawWar,drawWarResult} from './sect-war.js';
import {syncAlchemy,alchemyTargets,drawAlchemy,drawAlchemyResult,drawAlchemySoot} from './alchemy.js';
import {syncSocialStage,socialTargets,drawSocialStage,drawBondLinks} from './social-stage.js';
import {drawCombatTechnique} from './combat-techniques.js';
import {shownRelicPlayer} from './relic-rotation.js';
import {visitorSkinCell} from './visitor-rewards.js';
import {loadImmortalArt,robeCell,outfitArt,drawPngRelic,drawImmortalGift,drawBackRelic} from './immortal-art.js';
import {drawVisitor} from './visitor-event.js';
import {drawBossSprite,SCENES} from './world-rotation.js';
import {sealingBoss,drawBossSeal} from './boss-seal.js';
import {luxuryTier,queueLuxury,drawLuxuryFx} from './luxury-fx.js';
import {drawThunderTiger} from './thunder-tiger.js';
import {specialSkinFor,PATRON_SWORD} from './patrons.js';
import {drawRelic} from './artifact-visuals.js';
import {appearanceFor,drawRealmClothes,drawRealmAscension,drawRealmQiFront,REALM_STYLES,drawImmortalAura} from './realm-outfits.js';
import {RenderBudget,CharacterFrames,makeSurface,FrameClock,inView,actorSample,BitmapCache,renderDimensions} from './performance.js';
import {CharacterAnimator,drawArticulated,drawSeatedAnimated} from './character-animation.js';
import {drawWorldLife,drawAtmosphere} from './world-life.js';
import {skinFor,layoutPlayers,layoutLabels,wrapName,spriteCell,visualGender} from './cosmetics.js';
import {residentPlayers} from './residents.js';
import {arenaOn,arenaBackground,arenaTargets,drawWings,drawArenaShots,drawArenaCasts,ARENA_BOSS_Y} from './boss-arena.js';
import {drawGiftFx} from './gift-fx.js';
import {StageDirector} from './stage.js';
import {Mover} from './motion.js';
import {drawBreakthroughFx,drawBreakthroughTitle,breakthroughTitleLayout,breakthroughDuration,breakthroughRealm} from './breakthrough-fx.js';
import {drawGiftStage} from './gift-stage-fx.js';
import {drawTransform,TRANSFORM_MS,REVEAL_AT} from './transform-fx.js';
import {drawHighGift} from './high-gift-fx.js';
import {drawFlowerRain,drawMeteorShower} from './flower-event-fx.js';
const TAU=Math.PI*2;
const palette=['#9dcbbc','#b4bfd0','#d6c29b','#d5aeb3','#b4c69f','#c3b2d5'];
export const symbols={scroll:'▤',swords:'⚔',sword:'†',lotus:'❋',bell:'♧',orb:'◉',pill:'●',petal:'❀',dragon:'龍',join:'✧',qi:'✦',breakthrough:'✺',attack:'⚔',boss:'♜',victory:'✧'};
export function portrait(color='#8bc5b1') {
  return `<svg viewBox="0 0 80 90" aria-hidden="true"><ellipse cx="40" cy="79" rx="29" ry="6" fill="#102e28"/><path d="M36 36Q19 39 17 66L29 63 20 77Q40 87 60 77L51 63 63 66Q61 39 44 36" fill="${color}"/><path d="m40 38-7 20 7 17 7-17Z" fill="#e1dfc5"/><path d="M25 49Q20 63 37 63M55 49Q60 63 43 63" fill="none" stroke="${color}" stroke-width="10"/><ellipse cx="40" cy="26" rx="10" ry="13" fill="#ddc5a2"/><path d="M30 28Q25 12 40 11Q55 12 50 28L46 21Q37 24 34 18Z" fill="#182a2a"/><circle cx="40" cy="10" r="5" fill="#172d2a"/><path d="M34 10h12" stroke="#d7bd7c" stroke-width="2"/><path d="M40 43v29" stroke="#c6b57b" stroke-width="1"/></svg>`;
}
export class Scene {
  constructor(canvas,onSelect){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.onSelect=onSelect;this.players=[];this.selected=null;this.effects=[];this.targets=[];this.width=900;this.height=850;this.boss=null;this.visible=true;this.crowdMode=true;this.showNames=true;this.focusId=null;this.focusUntil=0;this.worldLife={npcs:true,environment:true};this.cameraEnabled=true;this.zoom=1.25;this.camera={s:1,x:0,y:0};this.sprites=new Map();this.labels=[];this.budget=new RenderBudget();this.characterFrames=new CharacterFrames();this.environmentLayers=new Map();this.animator=new CharacterAnimator();this.standingArt=new Image();this.standingArt.src='/assets/cultivators-standing-v14.png';this.characterArt=new Image();this.characterArt.src='/assets/cultivators-v3.png';this.empressArt=new Image();this.empressArt.onload=()=>this.characterFrames.clear();this.empressArt.src=new URLSearchParams(location.search).get('spriteStyle')==='mobile'?'/assets/celestial-empress-mobile-v1.png':'/assets/celestial-empress-seated-v2.png';this.specialAtlas=new Image();this.specialAtlas.onload=()=>{this.specialArt=[];for(const [y,h]of [[0,590],[600,424]]){const sheet=makeSurface(this.specialAtlas.naturalWidth,h);if(!sheet)continue;sheet.getContext('2d').drawImage(this.specialAtlas,0,y,this.specialAtlas.naturalWidth,h,0,0,sheet.width,h);sheet.naturalWidth=sheet.width;sheet.naturalHeight=sheet.height;sheet.complete=true;this.specialArt.push(sheet);}this.characterFrames.clear();};this.specialAtlas.src='/assets/patron-sets-v18.png';this.bossAtlas=new Image();this.bossAtlas.onload=()=>{this.bossSprites=[];const sw=this.bossAtlas.naturalWidth/3;for(let i=0;i<3;i++){const frame=makeSurface(320,320);if(!frame)continue;frame.getContext('2d').drawImage(this.bossAtlas,i*sw,0,sw,this.bossAtlas.naturalHeight,0,0,320,320);this.bossSprites.push(frame);}this.bossAtlas=null;};this.bossAtlas.src='/assets/boss-atlas.png';this.formationImage=new Image();this.formationImage.onload=()=>{const sprite=makeSurface(384,384);if(sprite){sprite.getContext('2d').drawImage(this.formationImage,0,0,384,384);this.formationArt=sprite;}this.formationImage=null;};this.formationImage.src='/assets/sword-formation.png';this.art=new Image();this.art.onload=()=>this.resize();this.art.src='/assets/sect-morning-v20.png';loadImmortalArt(this);this.motion=!matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas);
    canvas.addEventListener('click',e=>{const r=canvas.getBoundingClientRect(),sx=(e.clientX-r.left)/r.width*900,sy=(e.clientY-r.top)/r.height*this.height,x=(sx-(this.camera?.x||0))/(this.camera?.s||1),y=(sy-(this.camera?.y||0))/(this.camera?.s||1);const label=this.labels.find(l=>x>=l.x&&x<=l.x+l.w&&y>=l.y&&y<=l.y+l.h);const p=label||this.targets.find(p=>Math.hypot(p.x-x,(p.y-y)*.7)<35);if(p)this.onSelect(p.id);});
    document.addEventListener('visibilitychange',()=>{this.visible=!document.hidden;if(!this.visible)this.onRitualAudio?.(null);});this.resize();requestAnimationFrame(t=>this.frame(t));
  }
  resize(){const r=this.canvas.getBoundingClientRect();if(!r.width||!r.height)return;const size=renderDimensions(r,this.budget?.config,this.renderPreview,1080);const logicalHeight=900*r.height/r.width;if(this.background&&this.canvas.width===size.width&&this.canvas.height===size.height&&this.height===logicalHeight&&this.paintedArt===this.art)return;this.paintedArt=this.art;this.canvas.width=size.width;this.canvas.height=size.height;this.ctx.imageSmoothingEnabled=true;this.ctx.imageSmoothingQuality='high';this.height=900*r.height/r.width;this.background=document.createElement('canvas');this.background.width=this.canvas.width;this.background.height=this.canvas.height;const ctx=this.background.getContext('2d');ctx.setTransform(this.canvas.width/900,0,0,this.canvas.height/this.height,0,0);this.paintWorld(ctx);this.environmentLayers?.clear();}
  update(state,selected){this.lastState=state;this.lastSelected=selected;this.petEvent=state.petEvent;if(state.visitor?.kind==='hailam'||state.players.some(seaWorn))loadSeaArt(this);if(state.visitor?.kind==='khuyniet'||state.players.some(p=>khuyWorn(p)||p.equipped===KHUY_DRAGON))loadKhuyArt(this);if(state.visitor?.kind==='tudo'||state.players.some(p=>tudoWorn(p)||p.equipped===TUDO_BLADE))loadTudoArt(this);if(state.visitor?.kind==='doraemon'||state.players.some(p=>doraWorn(p)||String(p.equipped||'').startsWith('dora-')))loadDoraArt(this);this.lanternFestival=state.lanternFestival;this.companionStatus=state.companionStatus;loadPetArt(this,state.players);this.realmCount=state.realms?.length||REALM_STYLES.length;if(state.visitor?.kind==='vuonglam'||state.players.some(linWanWorn))loadLinWanArt(this);if(state.visitor?.kind==='shende'||state.players.some(p=>shendeWorn(p)||p.equipped==='shende-dao-seal'))loadShendeArt(this);loadCelestialArt(this); // v61: luôn tải — ảnh Thương Long dùng cho hiệu ứng vinh danh/quà lớn
loadPrestigeArt(this);syncRace(this,state);syncWar(this,state);syncAlchemy(this,state);syncSocialStage(this,state);syncEventGiftFx(this,state);this.visitor=state.visitor;
    this.sectMaster=state.sectMaster;this.stateServerNow=state.serverNow||Date.now();this.stateReceivedAt=performance.now();
    const activeCount=liveAudienceCount(state);this.audienceCount=activeCount;
    this.crowded=activeCount>=10;this.heavyCrowd=activeCount>20;this.minimalCrowd=activeCount>30; // 08/11: >30 người chỉ vẽ ảnh skin (bỏ cánh, pháp bảo, hào quang, hiệu ứng skin)
    this.reducePresence=activeCount>=20;
    if(this.budget?.setAudience(activeCount)){this.characterFrames?.clear();if(this.canvas?.getBoundingClientRect)this.resize();}
    this.sectElders=sectElders(state.players,this.sectMaster?.userId);
    const currentEnv=state.environment?.id==='sect-hall'?{...state.environment,...SCENES.find(s=>s.id==='sect-hall')}:state.environment;const env=petCoveOn({...this,boss:state.boss})?PET_COVE_MAP:currentEnv;this.environment=env;if(env?.ambience==='underwater')loadFish(this);
    if(env?.image&&this.environmentImage!==env.image){this.environmentImage=env.image;const next=new Image();next.onload=()=>{if(this.environmentImage!==env.image)return;const previous=this.background;this.art=next;this.resize();this.previousBackground=previous;this.backgroundChangedAt=performance.now();};next.src=env.image;}
    this.realPlayers=state.players.filter(p=>!(this.environment?.layout==='sect'&&p.id===this.sectMaster?.userId)).filter(p=>p.active||this.socialStage?.includes(p.id)||this.raceStage?.includes(p.id)||this.warStage?.includes(p.id)||this.alcStage?.includes(p.id)||(this.heavenStrike&&p.id===this.heavenStrike.user)).sort((a,b)=>a.joinedAt-b.joinedAt);this.residentActors=this.residents===false?[]:residentPlayers();this.players=[...this.residentActors,...this.realPlayers];for(const actor of this.players)ensureRealmSkinV2(this,actor);this.playerIndex=new Map(this.players.map(p=>[p.id,p]));if(this.sectMaster?.player)this.playerIndex.set(this.sectMaster.player.id,this.sectMaster.player);this.selected=selected;this.boss=state.boss||sealingBoss(state);}
  // v51: strength = độ zoom khi vinh danh (quà lớn zoom sâu hơn). Gọi lại cùng người mà không truyền strength thì giữ nguyên độ zoom.
  // 07/11/2026: quà vừa tặng cắt ngang màn đang diễn (app.js quyết định khi nào được cắt).
  interruptPresentation(){this.presentation=null;this.effects=[];this.fxQueue=[];this.luxuryQueue=[];this.transforming=null;this.focusUntil=0;this.welcomeFocus=null;}
  // 07/11/2026: Thiên Đạo giáng lôi — khóa ống kính vào người bị đánh suốt cảnh.
  startHeavenStrike(e){if(!e?.heavenStrike)return;this.heavenStrike={user:e.user,name:e.name,loss:e.heavenStrike.loss,profile:strikeProfile(e.heavenStrike.seed),start:performance.now()};this.focusId=null;this.presentation={id:e.user,kind:'strike',until:performance.now()+HEAVEN_STRIKE_MS};this.effects=[];this.fxQueue=[];this.welcomeFocus=null;if(this.lastState&&!this.playerIndex?.has(e.user))this.update(this.lastState,this.lastSelected);this.focus(e.user,HEAVEN_STRIKE_MS,1.45);this.heavenStrike.locked=true;}
  focus(id,duration=5200,strength=null){if(this.heavenStrike?.locked&&performance.now()-this.heavenStrike.start<HEAVEN_STRIKE_MS&&id!==this.heavenStrike.user)return;if(this.welcomeFocus?.until>performance.now()&&this.welcomeFocus.id!==id&&!(this.presentation?.until>performance.now()))return;if(this.presentation?.until>performance.now()&&this.presentation.id!==id)return;if(strength)this.focusStrength=strength;else if(id!==this.focusId)this.focusStrength=null;this.focusId=id;this.focusUntil=Math.max(this.focusId===id?this.focusUntil||0:0,performance.now()+duration);}
  moveCamera(t){if(petCoveOn(this)&&!(this.presentation?.until>t)){this.camera={s:1,x:0,y:0};this.cameraTime=t;return this.camera;}
    const H=this.height,enabled=this.motion&&this.cameraEnabled;
    const socialPair=this.raceStatus?.active||this.socialStage?.length===2&&!(this.presentation?.until>t);
    const target=!socialPair&&enabled&&this.focusUntil>t?this.targets.find(p=>p.id===this.focusId):null;
    const base=Math.max(1,Math.min(1.8,this.zoom||1));if(!target&&!socialPair){const cam=this.camera||(this.camera={s:1,x:0,y:0});cam.s=1;cam.x=0;cam.y=0;return cam;}
    const ritual=(this.presentation?.kind==='breakthrough'||this.presentation?.spectacle)&&this.presentation.until>t;
    const scale=socialPair?1:target?(ritual?Math.min(1.6,Math.max(1.35,base)):Math.min(2.4,Math.max(base*1.3,this.focusStrength||1.55))):base;
    const cx=target?target.x:450;
    const cy=socialPair?H*.55:target?target.y-45:(this.floorY||H*.54)-H*.075+(enabled?Math.sin(t*.00007)*H*.05/base:0); // hạ khung nhìn: nhân vật nằm thấp hơn một chút
    const x=Math.min(0,Math.max(900*(1-scale),450-cx*scale));
    const y=Math.min(0,Math.max(H*(1-scale),H*.55-cy*scale));
    const cam=this.camera||(this.camera={s:1,x:0,y:0});
    const dt=Math.min(100,Math.max(0,t-(this.cameraTime??t)));this.cameraTime=t;
    const ease=1-Math.exp(-dt/(target?650:1500));
    cam.s+=(scale-cam.s)*ease;cam.x+=(x-cam.x)*ease;cam.y+=(y-cam.y)*ease;
    return cam;
  }
  /** Gọi ngay khi nhận sự kiện (kể cả khi chưa tới lượt trình diễn): giúp người vừa bình luận được lên sân khấu sớm. */
  noteEvent(e){if(this.showcase&&!isAscensionEvent(this,e))return;if(e.engagementAction){noteEngagementReaction(this,e,performance.now());(this.animator??=new CharacterAnimator()).trigger(e,performance.now());(this.mover??=new Mover()).onEvent(e,performance.now(),this.motion);}if(e.petAward){loadPetArt(this,[{spiritPet:e.petId}]);this.petArrivals??=new Map();this.petArrivals.set(e.user,performance.now());if(this.petArrivals.size>64)this.petArrivals.delete(this.petArrivals.keys().next().value);}if(giftSpectacleTier(e)){loadGiftSpectacle(this);loadSpiritBeasts(this);}if(e.effect==='breakthrough'){for(const actor of [e.visualFrom,e.visualTo])if(actor)ensureRealmSkinV2(this,actor);if(breakthroughRealm(e)===13)prepareTienDeArt(this);if(breakthroughRealm(e)===12)prepareDaiLaArt(this);if(breakthroughRealm(e)===11)prepareThaiAtArt(this);if(breakthroughRealm(e)===10)prepareKimTienArt(this);else{if(breakthroughRealm(e)===4)prepareNguyenAnhArt(this);if(breakthroughRealm(e)===5)prepareHoaThanArt(this);if(breakthroughRealm(e)===6)prepareLuyenHuArt(this);if(breakthroughRealm(e)===7)prepareDaiThuaWorld(this);if(breakthroughRealm(e)===8)prepareChanTienArt(this);prepareAscensionArt(this,breakthroughRealm(e));prepareBreakthroughSpectacle(this);if(breakthroughRealm(e)>=6)loadImpactArt(this);}}notePrestigeGift(this,e,performance.now());this.stageDirty=true;(this.stage??=new StageDirector()).note(e,performance.now());this.recentEvents=(this.recentEvents||0)+1;}
  addEffect(event){if(this.alcStatus?.active&&!event.gift)return;if(this.showcase&&!isAscensionEvent(this,event)&&!event.gift)return;if(!event.effect)return;if(this.presentation?.kind==='breakthrough'&&this.presentation.until>performance.now()&&event.effect!=='breakthrough'&&!luxuryTier(event)){if(event.gift)queueLuxury(this.luxuryQueue??=[],event);return;}if(event.eventGiftFx&&(this.raceStatus?.active||this.socialStage?.length))return;if(this.raceStatus?.active&&!event.petAward&&!this.showcase){this.presentation=null;return;}(this.mover??=new Mover()).onEvent(event,performance.now(),this.motion);
    if(event.gift)prepareGiftTribute(this);if(tributeProfile(event)?.value>=99)loadGiftSpectacle(this);if(giftSpectacleTier(event))loadSpiritBeasts(this);const luxury=event.luxury||luxuryTier(event);if(luxury)event={...event,luxury};
    // Quà có tên lạ (vd. "You're awesome") không khớp loại nào → vẫn có hoạt cảnh theo giá coin, không chỉ vài chấm nhỏ.
    if(event.gift&&!event.kind){const coins=Number(event.coins)||1;event={...event,kind:coins<5?'heart':coins<30?'flower':coins<99?'firework':'cosmos'};}
    const petArrival=petArrivalProfile(event);if(petArrival?.vip&&!this.raceStatus?.active){this.presentation={id:event.user,kind:'pet',until:performance.now()+petArrival.duration};this.focus(event.user,petArrival.duration,1.7);}
    const big=luxury||event.effect==='breakthrough';
    if(big&&this.presentation?.until>performance.now()&&this.effects.some(e=>e.luxury||e.effect==='breakthrough')){queueLuxury(this.luxuryQueue??=[],event);return;}
    if(big&&event.user){this.presentation={id:event.user,kind:event.effect==='breakthrough'?'breakthrough':'gift',spectacle:!!giftSpectacleTier(event),until:performance.now()+(luxury?.duration||breakthroughDuration(event))};this.effects=[];this.fxQueue=[];this.focus(event.user,luxury?.duration||breakthroughDuration(event),luxury?1.45:2.1);}
    // v33: quà thường cũng "solo" người tặng (giống đột phá) trong 4,5 giây, trừ khi đang có màn đột phá / quà lớn.
    else if(event.transform&&event.user&&!smallGift(event)){this.presentation={id:event.user,until:performance.now()+TRANSFORM_MS};this.transforming={id:event.user,revealAt:performance.now()+TRANSFORM_MS*REVEAL_AT};this.effects=[];this.fxQueue=[];this.focus(event.user,TRANSFORM_MS,2.3);}
    else if((event.gift||event.flowerRank)&&event.user&&!this.effects.some(e=>e.luxury||e.effect==='breakthrough')){const d=event.flowerRank?7000:tributeProfile(event)?.duration||4500,value=(Number(event.coins)||0)*(Number(event.count)||1);this.presentation={id:event.user,kind:event.gift?'gift':'flower',until:performance.now()+d};this.effects=[];this.fxQueue=[];this.focus(event.user,d,event.gift?1.45:2.2);}
    // Giữ hoạt cảnh quà đang chạy; hành động thường (tim, bình luận, thường trú) không được xóa nó giữa chừng.
    else this.effects=this.effects.filter(e=>e.luxury||e.effect==='breakthrough'||(e.kind&&e.gift)||(e.effect==='attack'&&e.technique)); // v76: giữ các đòn đánh song song
    if(luxury&&this.effects.some(e=>e.luxury)){queueLuxury(this.luxuryQueue??=[],event);return;}
    if(!luxury&&event.kind&&event.kind!=='blessing'&&this.effects.filter(x=>x.kind&&x.kind!=='blessing').length>=(this.budget?.level==='light'?1:2)){(this.fxQueue??=[]).push(event);if(this.fxQueue.length>6)this.fxQueue.shift();return;}
    if(event.effect==='attack'&&this.boss)this.onCombatSound?.('cast',event.technique?.id||'slash');
    (this.animator??=new CharacterAnimator()).trigger(event,performance.now());const cinematic=event.gift&&giftSpectacleTier(event);if(cinematic){const action=this.animator.actions.get(event.user);if(action)action.duration=cinematic.duration*.85;}
    this.effects.push({...event,start:performance.now(),duration:petArrival?.duration||luxury?.duration||event.technique?.duration||(event.gift?tributeProfile(event)?.duration||2200:event.transform?TRANSFORM_MS:event.flowerRank?7000:event.effect==='breakthrough'?breakthroughDuration(event):event.kind?(event.gift?4500:3000):['dragon','victory','skin'].includes(event.effect)?2400:1100)});
    const limit=this.budget?.config.effects||5;while(this.effects.length>limit){const i=this.effects.findIndex(e=>!e.luxury&&e.effect!=='breakthrough');this.effects.splice(i<0?0:i,1);}
  }

  path(c,points,fill,stroke){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();}}
  ellipse(c,x,y,rx,ry,fill,stroke){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();}}
  mountain(c,x,y,width,height,color,seed=1){const pts=[[x-width/2,y]];for(let i=0;i<=20;i++){const t=i/20;const bump=Math.sin(t*Math.PI);pts.push([x-width/2+t*width,y-height*(bump*.76+Math.sin(i*seed+1)*.13*bump)]);}pts.push([x+width/2,y]);this.path(c,pts,color);}
  cloud(c,x,y,scale,alpha=.08){c.save();c.globalAlpha=alpha;c.fillStyle='#d7e2c8';for(let i=0;i<6;i++){this.ellipse(c,x+(i-2.5)*55*scale,y+Math.sin(i*1.8)*12*scale,(60+Math.sin(i)*15)*scale,18*scale,'#d4e4d0');}c.restore();}
  roof(c,x,y,w,h){this.path(c,[[x-w*.62,y+3],[x-w*.52,y+10],[x-w*.4,y+5],[x,y-h],[x+w*.4,y+5],[x+w*.52,y+10],[x+w*.62,y+3],[x+w*.48,y+20],[x,y+14],[x-w*.48,y+20]],'#254c44','#8d9a69');this.path(c,[[x-w*.53,y+10],[x,y+5],[x+w*.53,y+10],[x+w*.45,y+17],[x,y+12],[x-w*.45,y+17]],'#587365');c.strokeStyle='#a9ae79';c.lineWidth=1;c.beginPath();c.moveTo(x,y-h);c.lineTo(x,y+9);c.stroke();for(let i=-4;i<=4;i++){c.strokeStyle='#91ac7d30';c.beginPath();c.moveTo(x+i*w*.07,y-h+Math.abs(i)*h*.22);c.lineTo(x+i*w*.1,y+11);c.stroke();}}
  temple(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);this.path(c,[[-125,74],[125,74],[142,84],[-142,84]],'#7d8c70','#a0aa84');c.fillStyle='#426355';c.fillRect(-108,4,216,70);c.fillStyle='#b6b783';for(let i=-2;i<=2;i++)c.fillRect(i*43-2,8,4,65);c.fillStyle='#203b31';c.fillRect(-31,16,62,57);c.fillStyle='#bda970';c.fillRect(-27,19,54,48);c.fillStyle='#53634b';c.fillRect(-22,23,44,43);for(let i=-2;i<=2;i++){c.fillStyle='#cca667';this.ellipse(c,i*40,25,4,7,'#d3af6c');}this.roof(c,0,-4,245,30);c.fillStyle='#729277';c.fillRect(-69,-59,138,40);c.fillStyle='#beaf72';for(let i=-1;i<=1;i++)c.fillRect(i*50-2,-53,4,37);this.roof(c,0,-60,175,35);c.fillStyle='#c2b782';this.ellipse(c,0,-99,3,5,'#c2b782');c.fillStyle='#182f28';c.fillRect(-29,-1,58,16);c.font='9px Georgia';c.textAlign='center';c.fillStyle='#d7c793';c.fillText('望 仙 臺',0,10);c.restore();}
  tree(c,x,y,s=1,pink=false){c.save();c.translate(x,y);c.scale(s,s);c.strokeStyle='#3c4f3c';c.lineCap='round';c.lineWidth=8;c.beginPath();c.moveTo(0,8);c.bezierCurveTo(-15,-25,18,-42,3,-76);c.stroke();c.lineWidth=4;for(let i=0;i<5;i++){c.beginPath();c.moveTo(0,-20-i*10);c.lineTo(Math.sin(i*2)*30,-42-i*12);c.stroke();}for(let i=0;i<28;i++){let a=i*2.399,r=Math.sqrt(i/28)*46;this.ellipse(c,Math.cos(a)*r,-65+Math.sin(a)*r*.6,12+Math.sin(i)*4,9,pink?['#b27f87','#d0a6a4','#c3a08f'][i%3]:['#547f64','#6c9474','#426f5a'][i%3]);}c.restore();}
  lantern(c,x,y){c.strokeStyle='#a79661';c.lineWidth=2;c.beginPath();c.moveTo(x,y+30);c.lineTo(x,y);c.stroke();this.path(c,[[x-10,y],[x,y-9],[x+10,y],[x,y+4]],'#687e62','#9b9e70');c.fillStyle='#d2bd7c';c.fillRect(x-4,y+3,8,10);c.shadowColor='#e7cf85';c.shadowBlur=12;this.ellipse(c,x,y+8,2,3,'#f6dda1');c.shadowBlur=0;}
  paintWorld(c){const H=this.height;if(this.art?.complete&&this.art.naturalWidth){this.paintArtwork(c);return;}
    const grad=c.createLinearGradient(0,0,0,H);grad.addColorStop(0,'#13383a');grad.addColorStop(.5,'#36645a');grad.addColorStop(1,'#183e36');c.fillStyle=grad;c.fillRect(0,0,900,H);
    const glow=c.createRadialGradient(690,H*.18,5,690,H*.18,220);glow.addColorStop(0,'#d0d1a532');glow.addColorStop(1,'#a8c4a000');c.fillStyle=glow;c.fillRect(0,0,900,H);
    this.ellipse(c,695,H*.19,39,39,'#d3d3aa80');this.ellipse(c,695,H*.19,35,35,'#d5d5ad70');
    for(let i=0;i<10;i++)this.mountain(c,40+i*110,H*.53+(i%3)*17,160+(i%2)*120,150+(i%4)*35,'#567b6c50',i+1);
    for(let i=0;i<6;i++)this.mountain(c,45+i*180,H*.64,240,150+(i%3)*50,'#345c50',i+3);
    this.cloud(c,150,H*.44,1.8,.12);this.cloud(c,780,H*.5,2,.12);this.cloud(c,310,H*.56,2,.10);
    // Distant floating pavilions, waterfalls and small islands.
    for(const [x,y,s] of [[730,H*.34,.34],[125,H*.43,.25]]){this.path(c,[[x-85*s,y+40*s],[x+85*s,y+40*s],[x+25*s,y+115*s],[x-13*s,y+135*s]],'#214b40');this.ellipse(c,x,y+39*s,92*s,22*s,'#729276');this.temple(c,x,y,s);c.fillStyle='#c0d9be35';c.fillRect(x+25*s,y+48*s,6*s,100*s);}
    const y=H*.70;const islandGrad=c.createLinearGradient(0,y,0,y+180);islandGrad.addColorStop(0,'#345745');islandGrad.addColorStop(1,'#102f2b');
    this.path(c,[[100,y-30],[806,y-22],[830,y+25],[751,y+77],[708,y+128],[621,y+109],[539,y+197],[465,y+131],[379,y+172],[280,y+93],[191,y+89],[118,y+20]],islandGrad,'#70907040');
    for(let i=0;i<14;i++){let x=140+i*45;this.path(c,[[x,y+5],[x+27,y+26],[x+9,y+80+(i%3)*21],[x-12,y+45]],'#95b78b0b');}
    this.ellipse(c,455,y-2,368,104,'#718b69','#91a27c');this.ellipse(c,455,y-9,350,98,'#9ca182','#b8b393');
    this.ellipse(c,455,y-15,330,88,'#718773','#adad8a');
    // Courtyard paving.
    c.save();c.beginPath();c.ellipse(455,y-15,328,87,0,0,TAU);c.clip();for(let i=-8;i<=8;i++){c.strokeStyle='#c5c3a126';c.lineWidth=1;c.beginPath();c.moveTo(455+i*60,y-110);c.lineTo(455+i*100,y+90);c.stroke();}for(let i=0;i<8;i++){c.beginPath();c.moveTo(60,y-85+i*25);c.lineTo(850,y-85+i*25);c.stroke();}c.restore();
    // Spiritual circle on the terrace.
    for(let r=0;r<3;r++)this.ellipse(c,450,y-4,130+r*14,37+r*4,null,'#d6c79850');
    c.save();c.translate(450,y-4);c.scale(1,.29);c.strokeStyle='#d6c79850';c.beginPath();for(let i=0;i<6;i++){const a=i*TAU/6;c.moveTo(Math.cos(a)*144,Math.sin(a)*144);c.lineTo(Math.cos(a+TAU/3)*144,Math.sin(a+TAU/3)*144);}c.stroke();c.restore();
    // Steps and approach path.
    for(let i=0;i<7;i++){const sy=y+65+i*9;this.path(c,[[390-i*7,sy],[520+i*7,sy],[526+i*7,sy+8],[384-i*7,sy+8]],i%2?'#849277':'#a5aa89','#bec4a130');}
    this.temple(c,460,y-158,1.25);
    for(const xx of [205,715]){c.fillStyle='#799071';c.fillRect(xx-3,y-125,6,100);this.roof(c,xx,y-130,62,14);c.fillStyle='#bba66b';c.fillRect(xx-21,y-117,42,35);c.fillStyle='#394f38';c.fillRect(xx-18,y-113,36,27);c.font='10px Georgia';c.textAlign='center';c.fillStyle='#d8ce9b';c.fillText(xx===205?'丹 房':'藏 經',xx,y-94);}
    this.tree(c,158,y-85,1.1,true);this.tree(c,757,y-80,1.15,true);this.tree(c,226,y-139,.65);this.tree(c,690,y-148,.7);
    for(const [xx,yy] of [[190,y+4],[720,y+10],[304,y+63],[611,y+65]])this.lantern(c,xx,yy-22);
    this.ellipse(c,245,y+22,51,16,'#477e70','#a6b48a');for(let i=0;i<7;i++)this.ellipse(c,216+i*10,y+22+Math.sin(i*2)*7,5,2.5,'#adc5a1');
    // Waterfall spills from the island.
    const water=c.createLinearGradient(0,y+15,0,H);water.addColorStop(0,'#c7e1c28a');water.addColorStop(.7,'#9bc7bb24');water.addColorStop(1,'#9bc7bb00');this.path(c,[[748,y+17],[768,y+14],[778,H],[735,H]],water);for(let i=0;i<5;i++){c.strokeStyle='#e3e8c720';c.beginPath();c.moveTo(751+i*4,y+25);c.lineTo(745+i*7,H);c.stroke();}
    this.cloud(c,180,H*.92,1.7,.13);this.cloud(c,730,H*.96,2,.14);
    // Silhouette foliage frames the scene.
    for(let side=0;side<2;side++){c.save();if(side){c.translate(900,0);c.scale(-1,1);}c.strokeStyle='#102f2b';c.lineWidth=5;for(let j=0;j<3;j++){let bx=-15+j*19;c.beginPath();c.moveTo(bx,H);c.quadraticCurveTo(bx+50,H*.6,bx+15,H*.39);c.stroke();for(let k=0;k<9;k++){let yy=H*.45+k*H*.055;this.path(c,[[bx+25,yy],[bx+90+(k%3)*9,yy-20],[bx+40,yy+5]],'#123b30');}}c.restore();}
    const shade=c.createLinearGradient(0,H*.78,0,H);shade.addColorStop(0,'#08232100');shade.addColorStop(1,'#082321c0');c.fillStyle=shade;c.fillRect(0,H*.78,900,H*.22);
    c.fillStyle='#e0dbb306';for(let i=0;i<2000;i++)c.fillRect((i*7919)%900,(i*3527)%Math.ceil(H),1,1);
  }
  paintArtwork(c){const H=this.height;const iw=this.art.naturalWidth,ih=this.art.naturalHeight;const {sx,sy,sw,sh}=artworkCrop(iw,ih,H);c.drawImage(this.art,sx,sy,sw,sh,0,0,900,H);const shade=c.createLinearGradient(0,0,0,H);shade.addColorStop(0,'#09192430');shade.addColorStop(.4,'#0a1a2200');shade.addColorStop(.8,'#09192405');shade.addColorStop(1,'#09192485');c.fillStyle=shade;c.fillRect(0,0,900,H);}
  drawPlayer(c,p,x,y,t){const skin=skinFor(p.giftCoins);const color=skin.level?skin.robe:palette[hash(p.id)%palette.length];const focus=this.focusUntil>t&&(this.focusId||this.selected)===p.id;const selected=focus||(!document.body.classList.contains('overlay')&&this.selected===p.id);const bob=this.motion?Math.sin(t*.0018+hash(p.id))*1.3:0;y+=bob;if(this.boss?.species==='abyss-dragon'&&!this.boss.sealing&&this.motion){const hit=abyssPose(this.boss,Date.now()).strike;y+=hit*7;x+=Math.sin(t*.04+hash(p.id))*hit*3;}const scale=this.targets.find(a=>a.id===p.id)?.scale||1.42;
    c.save();c.translate(x,y);c.scale(scale,scale);if(this.characterArt.complete&&this.characterArt.naturalWidth){this.drawSprite(c,p,skin,t);c.restore();return;}
    this.drawSkinVFX(c,specialSkinFor(p)||skin,t,p);
    if(p.realm>0||selected){c.save();c.globalCompositeOperation='screen';const glow=c.createRadialGradient(0,-5,1,0,-5,38);glow.addColorStop(0,color+'45');glow.addColorStop(1,color+'00');c.fillStyle=glow;c.fillRect(-40,-45,80,85);c.strokeStyle=selected?'#ffe1a4':'#9bd9cc80';c.lineWidth=1.1;this.ellipse(c,0,10,22,7,null,c.strokeStyle);c.restore();}
    this.ellipse(c,0,9,18,5,'#344854','#a4c3c35c');
    const robe=c.createLinearGradient(-13,-9,14,22);robe.addColorStop(0,'#edf1e2');robe.addColorStop(.22,color);robe.addColorStop(.65,color);robe.addColorStop(1,'#344b65');
    c.fillStyle=robe;c.beginPath();c.moveTo(-5,-15);c.bezierCurveTo(-13,-13,-18,-1,-21,7);c.quadraticCurveTo(-14,12,-7,7);c.quadraticCurveTo(-10,15,-22,17);c.quadraticCurveTo(0,25,22,17);c.quadraticCurveTo(10,15,7,7);c.quadraticCurveTo(14,12,21,7);c.bezierCurveTo(18,-1,13,-13,5,-15);c.closePath();c.fill();c.strokeStyle='#dce7d885';c.lineWidth=.7;c.stroke();
    this.path(c,[[-5,-14],[0,-7],[5,-14],[3,7],[-3,7]],'#f6edd5');this.path(c,[[-4,-13],[0,-7],[-8,10]],'#7a8b9a');c.strokeStyle='#e5ca8c';c.lineWidth=1;c.beginPath();c.moveTo(-7,7);c.quadraticCurveTo(0,10,7,7);c.moveTo(1,9);c.quadraticCurveTo(7,13,4,20);c.stroke();c.strokeStyle='#e4eadc70';c.lineWidth=.7;for(let j=-1;j<=1;j++){c.beginPath();c.moveTo(j*5,9);c.lineTo(j*11,18);c.stroke();}
    c.strokeStyle=color;c.lineWidth=6;c.lineCap='round';c.beginPath();c.moveTo(-11,-4);c.quadraticCurveTo(-15,7,-3,7);c.moveTo(11,-4);c.quadraticCurveTo(15,7,3,7);c.stroke();this.ellipse(c,-2,6,3,1.8,'#f1d6bc');this.ellipse(c,2,6,3,1.8,'#f1d6bc');
    c.fillStyle='#172634';c.beginPath();c.moveTo(-7,-19);c.bezierCurveTo(-13,-6,-9,3,-13,6);c.quadraticCurveTo(-3,1,-4,-18);c.fill();this.ellipse(c,0,-24,7.5,9.5,'#ecd5bb');
    this.path(c,[[-8,-21],[-9,-29],[-4,-35],[4,-35],[9,-29],[8,-21],[4,-28],[0,-26],[-4,-29]],'#142535');this.ellipse(c,0,-35,4,3.5,'#162a3b');c.strokeStyle='#e0c58a';c.lineWidth=1.3;c.beginPath();c.moveTo(-6,-35);c.lineTo(8,-36);c.stroke();c.strokeStyle='#374452';c.lineWidth=.6;c.beginPath();c.moveTo(-4,-23);c.lineTo(-1,-22.5);c.moveTo(1,-22.5);c.lineTo(4,-23);c.stroke();
    if(p.equipped){const a=(this.motion?t*.001:0)+hash(p.id);c.save();c.translate(Math.cos(a)*25,-12+Math.sin(a)*12);c.rotate(a+.7);c.shadowColor='#b8e5ff';c.shadowBlur=9;this.path(c,[[-1.5,-20],[1.5,-20],[2,7],[0,13],[-2,7]],'#e5f4fc','#91c7dc');c.shadowBlur=0;c.strokeStyle='#dfc08b';c.lineWidth=2;c.beginPath();c.moveTo(-6,-15);c.lineTo(6,-15);c.stroke();c.restore();}
    c.restore();}
  drawSprite(c,p,skin,t){
    const config=this.ritualDrawing?{...this.budget?.config,spriteScale:4.5,poseFps:18}:this.budget?.config;
    if(config&&this.characterFrames){
      const {tick,at}=actorSample(this.compact&&!this.raceStatus?.active?0:t,config.poseFps,p.id,this.motion&&(!this.compact||this.raceStatus?.active));
      const action=this.animator?.actions.get(p.id);
      const key=[!!this.raceStatus?.active,this.raceStatus?.active?Math.floor(t/65):0,this.raceStatus?.active?this.targets?.find(a=>a.id===p.id)?.boost:false,tick,this.compact,skin.level,p.realm,p.gender,robeCell(p),this.transforming?.id===p.id&&performance.now()<this.transforming.revealAt,p.relicVariant,p.equipped,p.skinChoice,p.skinChoiceSource,p.divineRoles?.join(),p.divineRoleChoice,p.divineRoleHidden,p.rewardSkins?.join(),action?.id,this.motion,config.mesh,!!this.minimalCrowd].join(':');
      if(this.characterFrames.draw(c,p.id,key,x=>{this.ellipse(x,0,12,22,6,'#081c2770');if(!this.minimalCrowd){const ga=x.globalAlpha;if(this.compact)x.globalAlpha=ga*.55;this.drawSkinVFX(x,specialSkinFor(p)||skin,at,p);x.globalAlpha=ga;}this.drawCharacterBody(x,p,skin,at);},Math.min(8,Math.max(config.spriteScale||2,Math.ceil(Math.hypot(c.getTransform().a,c.getTransform().b)*2)/2))))return;
    }
    this.ellipse(c,0,12,22,6,'#081c2770');this.drawSkinVFX(c,specialSkinFor(p)||skin,t,p);this.drawCharacterBody(c,p,skin,t);
  }
  // Skin đặc biệt có ảnh riêng cho giới tính này không (Bạch Kim Tiên Đế chỉ có bản nam).
  // Ảnh + ô dùng để vẽ nhân vật; tự lùi về bộ ảnh cũ nếu sheet chưa tải xong.
  artFor(p){const sa=this.specialArtFor(p);let a=sa?{sheet:'special',cell:sa.atlas+(visualGender(p)==='nu'&&sa.atlas<4?1:0)}:outfitArt(p);
    if(a.sheet==='special'&&this.specialArt?.length!==2)a=null;else if(a.sheet==='robe'&&!this.robeArt)a=null;
    return a||{sheet:'legacy',cell:spriteCell(appearanceFor(p).level,visualGender(p))};}
  specialArtFor(p){const s=specialSkinFor(p);return s&&!(s.atlas>=4&&visualGender(p)==='nu')?s:null;}
  drawCharacterBody(c,p,skin,t){
    const special=specialSkinFor(p),oldStanding=this.standingArt,oldSeated=this.characterArt;
    // v48: skin đặc biệt đang chọn luôn thắng; không thì ảnh theo nấc áo cảnh giới (outfitArt).
    const art=this.artFor(p);
    if(art.sheet==='special'){this.standingArt=this.specialArt[0];this.characterArt=this.specialArt[1];}
    else if(art.sheet==='robe'){this.characterArt=this.robeArt;if(this.robeStandingArt)this.standingArt=this.robeStandingArt;}
    try{this.paintCharacterBody(c,p,special||skin,t);}finally{this.standingArt=oldStanding;this.characterArt=oldSeated;}
  }
  paintCharacterBody(c,p,skin,t){
    const pose=(this.animator??=new CharacterAnimator()).pose(p,t,this.motion&&!this.compact),outfit=appearanceFor(p),cell=this.artFor(p).cell;
    if(this.raceStatus?.active){Object.assign(pose,raceFlightPose(this.targets?.find(a=>a.id===p.id)||{id:p.id},t,this.motion));}
    if(this.cinematicPose)Object.assign(pose,this.cinematicPose);if(this.huyenRitualPose)Object.assign(pose,this.huyenRitualPose);
    const standing=pose.stand>.001&&this.standingArt?.complete&&this.standingArt.naturalWidth;
    const divine=divineSelection(p);
    if(!this.crowded&&!this.raceStatus?.active&&!this.compact&&!divine)drawRealmAscension(c,p,pose,t,this.motion,this.budget?.level);
    // Back halo is rendered once in the shared background pass, above Chân Tiên only. // v52: hào quang cảnh giới cao, sau lưng
    // 3/11: đang đột phá thì ẩn pháp bảo bay vòng quanh (trước và sau lưng) cho hiệu ứng đột phá gọn.
    const breaking=pose.mode==='ascend'||this.effects?.some(e=>e.effect==='breakthrough'&&e.user===p.id);
    if(!this.raceStatus?.active&&!this.compact&&!this.minimalCrowd&&!breaking)drawBackRelic(c,p,t,this.signatureSprites,this.motion,pose); // pháp bảo sau lưng (vẽ trước thân)
    // Giữ nguyên màu ảnh nhân vật gốc (bỏ lớp nhuộm theo cảnh giới của v33 — người dùng thấy xanh lè, mất đẹp).
    c.save();c.shadowColor=skin.color;c.shadowBlur=0;
    const hideNew=this.transforming?.id===p.id&&performance.now()<this.transforming.revealAt; // đang biến hình: giữ hình cũ tới lúc chớp sáng
    const visitorCell=hideNew?null:visitorSkinCell(p),visitorArt=visitorCell===null?null:this.visitorSprites?.[visitorCell];
    if(!hideNew&&drawKhuyBody(this,c,p,pose,t)){}
    else if(!hideNew&&drawTudoBody(this,c,p,pose,t)){}
    else if(!hideNew&&drawSeaBody(this,c,p,pose,t)){}
    else if(!hideNew&&drawDoraBody(this,c,p,pose,t)){}
    else if(!hideNew&&drawRealmSkinV2(this,c,p,pose,t)){}
    else if(!hideNew&&godFormFor(p)&&drawDivineBody(this,c,p,pose,t)){}
    else if(!hideNew&&drawShendeBody(this,c,p,pose,t)){}
    else if(!hideNew&&drawLinWanBody(this,c,p,pose,t)){}
    else if(visitorArt){c.save();c.translate(0,pose.lift||0);c.rotate(pose.lean||0);c.drawImage(visitorArt,-35,-88,70,112);c.restore();}
    else if(drawDivineBody(this,c,p,pose,t)){}
    else{
    if(standing){c.globalAlpha=pose.stand;drawArticulated(c,this,p,outfit,t,cell,pose);drawRealmClothes(c,p,pose,true);c.globalAlpha=1-pose.stand;}
    if(!standing||pose.stand<.999){c.save();if(standing){c.translate(0,-9*pose.stand);c.scale(1-.12*pose.stand,1+.22*pose.stand);}const cleanEmpress=this.artFor(p).sheet==='legacy'&&cell===4&&this.empressArt?.naturalWidth;
    if(cleanEmpress){c.save();c.translate(0,pose.lift||0);c.rotate(pose.lean||0);const breath=this.motion?Math.sin(t*.0018)*.003:0;c.scale(1+breath,1-breath);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';const im=this.empressArt,w=92,h=w*im.naturalHeight/im.naturalWidth;c.drawImage(im,-w/2,25-h,w,h);c.restore();}
    else drawSeatedAnimated(c,this.characterArt,cell,pose,this.budget?.level==='light'?4:8);drawRealmClothes(c,p,pose,false);c.restore();}
    }
    c.restore();
    if(this.heavyCrowd||this.compact||this.raceStatus?.active)return;
    if(!divine&&!this.minimalCrowd)drawRealmQiFront(c,p,pose,t,this.motion);
    if(breaking){}
    else if(drawDoraRelic(this,c,p,t)){}
    else if(drawShendeRelic(c,p,t,this.shendeArt,this.motion)){}
    else if(drawPngRelic(c,p,t,this.relicSprites,this.motion,this.signatureSprites,this.combatSprites)){}
    else if(drawRelic(c,p.equipped,t,this.motion)){}
    else if(p.equipped===PATRON_SWORD){this.drawFlyingSword(c,-35,-18,Math.sin(t*.001)*.15,'#81eaff');this.drawFlyingSword(c,35,-18,-Math.sin(t*.001)*.15,'#d8faff');}
    else if(p.equipped&&(!pose.blade||pose.energy<.15)){const phase=this.motion?t*.001:0;this.drawFlyingSword(c,Math.cos(phase)*32,-12+Math.sin(phase)*15,phase+.7,skin.trim);}
  }
  drawCompactGear(c,target,t,layer){
    if(this.heavyCrowd)return;
    const p=target.player;if(this.raceStatus?.active||!p.equipped||this.effects?.some(e=>e.effect==='breakthrough'&&e.user===p.id))return;
    c.save();c.translate(target.x,target.y);c.scale(target.scale||1.4,target.scale||1.4);
    if(layer==='back')drawBackRelic(c,p,t,this.signatureSprites,this.motion);
    else if(drawDoraRelic(this,c,p,t)){}
    else if(drawShendeRelic(c,p,t,this.shendeArt,this.motion)){}
    else if(drawPngRelic(c,p,t,this.relicSprites,this.motion,this.signatureSprites,this.combatSprites)){}
    else if(drawRelic(c,p.equipped,t,this.motion)){}
    else this.drawFlyingSword(c,30,-24,Math.sin(t*.001)*.15,'#adf0ff');
    c.restore();
  }
  drawFlyingSword(c,x,y,a,color){c.save();c.translate(x,y);c.rotate(a);c.shadowColor=color;c.shadowBlur=8;const metal=c.createLinearGradient(-2,0,2,0);metal.addColorStop(0,'#aac4db');metal.addColorStop(.5,'#fff6d2');metal.addColorStop(1,color);this.path(c,[[-1.4,-22],[1.4,-22],[2,4],[0,12],[-2,4]],metal);c.shadowBlur=0;c.strokeStyle=color;c.lineWidth=2;c.beginPath();c.moveTo(-6,-16);c.lineTo(6,-16);c.stroke();c.fillStyle='#182c43';c.fillRect(-1,-26,2,8);c.restore();}
  drawSkinVFX(c,skin,t,p){if(this.crowded||this.raceStatus?.active)return;const level=0,a=this.motion?t*.0006+hash(p.id):hash(p.id);c.save();c.globalCompositeOperation='screen';
    const glow=c.createRadialGradient(0,-8,2,0,-8,43);glow.addColorStop(0,skin.color+(level?'30':'15'));glow.addColorStop(1,skin.color+'00');c.fillStyle=glow;c.fillRect(-44,-52,88,90);
    c.strokeStyle=skin.color+(level?'b0':'55');c.lineWidth=.8;this.ellipse(c,0,16,25+level*2,7+level,null,c.strokeStyle);
    if(level>=1){c.save();c.translate(0,-21);c.rotate(Math.sin(a)*.10);c.strokeStyle=skin.color+'90';c.lineWidth=1.2;c.beginPath();c.arc(0,0,27+level*2,-Math.PI*.9,Math.PI*.6);c.stroke();if(level>=2){c.strokeStyle=skin.trim+'a0';c.setLineDash([2,4]);c.beginPath();c.arc(0,0,32+level*2,0,TAU);c.stroke();c.setLineDash([]);}c.restore();}
    for(let i=0;i<2+level*2;i++){const r=20+level*4,theta=a+i*TAU/(2+level*2);const xx=Math.cos(theta)*r,yy=-14+Math.sin(theta)*r*.6;this.ellipse(c,xx,yy,level>=3?1.4:1,.8,skin.color+'c0');}
    if(level>=3){c.strokeStyle=skin.trim+'b0';c.lineWidth=1.3;c.beginPath();for(let i=0;i<42;i++){const theta=i*.14+a,xx=Math.cos(theta)*(35+level),yy=Math.sin(theta)*13-3; i?c.lineTo(xx,yy):c.moveTo(xx,yy);}c.stroke();}
    if(level>=4){for(let i=0;i<7;i++){const theta=i*TAU/7+a*.5;this.ellipse(c,Math.cos(theta)*40,-18+Math.sin(theta)*30,1.7,1.7,'#fff6cd');}c.save();c.translate(0,-22);c.rotate(a*.2);for(let i=0;i<8;i++){const th=i*TAU/8;this.path(c,[[Math.cos(th)*32,Math.sin(th)*32],[Math.cos(th+.08)*43,Math.sin(th+.08)*43],[Math.cos(th+.16)*32,Math.sin(th+.16)*32]],skin.trim+'50');}c.restore();}
    c.restore();if(level>=2){const n=level>=4?4:level>=3?3:2;for(let i=0;i<n;i++){const phase=a+i*TAU/n;this.drawFlyingSword(c,Math.cos(phase)*38,-7+Math.sin(phase)*14,phase+.6,skin.trim);}}
  }
  drawNames(c,t){if(this.raceStatus?.active){this.labels=[];return;}
    c.font='700 24px Georgia'; // 4/11: đo đúng cỡ chữ khi vẽ (trước đo 17px nhưng vẽ 24px → tên nào cũng bị thu nhỏ rồi cắt)
    const targets=this.targets.filter(a=>a.player.puppet||a.player.resident||this.showNames||this.selected===a.id||this.focusUntil>t&&this.focusId===a.id);
    this.nameWidths??=new Map();if(this.nameWidths.size>1000)this.nameWidths.clear();
    this.labels=layoutLabels(targets,name=>{if(!this.nameWidths.has(name))this.nameWidths.set(name,c.measureText(name).width);return this.nameWidths.get(name);});
    const cache=this.nameBitmaps??=new BitmapCache(160);
    for(const l of this.labels){
      const skin=skinFor(l.player.giftCoins),selected=l.id===this.selected,focus=this.focusId===l.id&&this.focusUntil>t&&this.focusId===l.id;
      const paint=(x,offscreen=true)=>{
        // 3/11: tên rõ hơn — nền đậm hơn, chữ trắng đậm có viền tối, chữ tối thiểu 11px (thà rút gọn còn hơn chữ li ti).
        if(offscreen)x.setTransform(2,0,0,2,2,2);x.fillStyle=selected||focus?'#06121df8':'#04101af2';x.beginPath();x.roundRect(0,0,l.w,l.h,5);x.fill();
        x.strokeStyle=skin.level?skin.trim+'d0':selected?'#e6d1a1':'#cfe6e870';x.lineWidth=1.2;x.stroke();
        x.textAlign='center';x.textBaseline='middle';x.font='700 24px Georgia';
        // 4/11: giữ nguyên cỡ chữ, không ép dẹt (bỏ maxWidth), không cắt "…" — tên dài đã xuống dòng ở layoutLabels.
        if(l.scroll)return; // tên chạy chữ: chữ vẽ riêng bên dưới
        const lines=l.lines||[l.name],lh=l.lineH||25;x.lineJoin='round';x.lineWidth=3;x.strokeStyle='#000000d0';
        lines.forEach((line,i)=>{const yy=l.h/2+(i-(lines.length-1)/2)*lh;x.strokeText(line,l.w/2,yy);x.fillStyle=skin.level?'#fff6dc':'#ffffff';x.fillText(line,l.w/2,yy);});
      };
      const key=[l.name,l.w,l.h,l.scroll?1:0,skin.level,skin.trim,selected,focus].join(':');
      const bitmap=cache.get(key,Math.ceil((l.w+2)*2),(l.h+2)*2,paint);
      if(bitmap)c.drawImage(bitmap,l.x-1,l.y-1,bitmap.width/2,bitmap.height/2);
      else{c.save();c.translate(l.x,l.y);paint(c,false);c.restore();}
      // 4/11/2026: đông người → tên dài chạy chữ trong khung (giữ cỡ chữ 24, không che mặt hàng dưới).
      // Dừng 1,5 s ở đầu → trượt 35 đv/s → dừng 1,2 s ở cuối → trượt về. Ảnh chữ vẽ một lần, mỗi khung chỉ dịch + cắt.
      if(l.scroll){const tw=Math.ceil(l.textW)+12,paintText=x=>{x.setTransform(2,0,0,2,2,2);x.textAlign='left';x.textBaseline='middle';x.font='700 24px Georgia';x.lineJoin='round';x.lineWidth=3;x.strokeStyle='#000000d0';x.strokeText(l.name,6,l.h/2);x.fillStyle=skin.level?'#fff6dc':'#ffffff';x.fillText(l.name,6,l.h/2);};
        const text=cache.get('txt:'+l.name+':'+l.h+':'+skin.level,(tw+2)*2,(l.h+2)*2,paintText),inner=l.w-10,travel=Math.max(0,tw-inner),move=travel/35*1000,cycle=2*(move)+2700,u=this.motion===false?0:(t+(String(l.id).length*397))%cycle;
        const off=u<1500?0:u<1500+move?travel*(u-1500)/move:u<2700+move?travel:travel*(1-(u-2700-move)/move);
        c.save();c.beginPath();c.rect(l.x+5,l.y,inner,l.h);c.clip();if(text)c.drawImage(text,l.x+5-off-1,l.y-1,text.width/2,text.height/2);c.restore();}
      this.drawQiBar(c,l,t);
      if(l.player.honor){c.save();c.textAlign='center';c.font='700 13px Georgia';c.fillStyle=['#a9f1e0','#ffe3a0','#d9c2ff'][l.player.honor.frame]||'#ffe3a0';c.fillText(l.player.honor.title,l.x+l.w/2,l.y-7);c.restore();}
    }
    this.drawTalkBubbles(c,t,cache);
  }
  // 4/11/2026: bong bóng thoại — câu trò chuyện thường (đã lọc ở server, talk.mjs) hiện trên đầu nhân vật ~6 s.
  // Thời gian tính ở máy khách (lần đầu thấy câu đó), vì có thể vài giây không có snapshot mới. Chữ 20px, không thu nhỏ.
  drawTalkBubbles(c,t,cache){
    const seen=this.talkSeen??=new Map(),now=performance.now();
    for(const a of this.targets||[]){
      const text=a.player?.talk;if(!text){seen.delete(a.id);continue;}
      let row=seen.get(a.id);if(!row||row.text!==text){row={text,at:now};seen.set(a.id,row);}
      const age=now-row.at;if(age>6000)continue;
      const alpha=Math.min(1,age/180,(6000-age)/400);
      c.font='700 20px Georgia';const lines=wrapName(text,s=>c.measureText(s).width,230),lh=24,w=Math.ceil(Math.max(...lines.map(s=>c.measureText(s).width)))+22,h=lines.length*lh+12;
      const bitmap=cache.get('talk:'+text,(w+2)*2,(h+12)*2,x=>{x.setTransform(2,0,0,2,2,2);x.fillStyle='#fffdf2f2';x.strokeStyle='#183238';x.lineWidth=1.6;x.beginPath();x.roundRect(0,0,w,h,10);x.moveTo(w/2-8,h);x.lineTo(w/2,h+9);x.lineTo(w/2+8,h);x.fill();x.stroke();x.fillStyle='#fffdf2';x.fillRect(w/2-7,h-2,14,3);
        x.font='700 20px Georgia';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#14202a';lines.forEach((s,i)=>x.fillText(s,w/2,6+lh/2+i*lh));});
      const bx=Math.max(8,Math.min(892-w,a.x-w/2)),by=a.y-62*(a.scale||1)-h-12;
      c.save();c.globalAlpha=alpha;if(bitmap)c.drawImage(bitmap,bx-1,by-1,bitmap.width/2,bitmap.height/2);c.restore();
    }
  }
  // Thanh tu vi dưới tên: xanh = đang tích lũy, vàng nhấp nháy + "✦ Gõ đột phá" trên đầu = đủ đột phá.
  drawQiBar(c,l,t){const p=l.player;if(p.resident||p.puppet||!p.neededQi)return;
    const ready=p.finalRealmEligible!==false&&p.progressionReady!==false&&p.qi>=p.neededQi&&p.stones>=p.neededStones&&p.realm<(this.realmCount??REALM_STYLES.length)-1,k=Math.max(0,Math.min(1,p.qi/p.neededQi)),pulse=.5+.5*Math.sin(t*.008);
    const bx=l.x+5,by=l.y+l.h-6,bw=l.w-10;c.save();c.fillStyle='#ffffff26';c.fillRect(bx,by,bw,3.5);
    c.fillStyle=ready?`hsl(45,100%,${55+20*pulse}%)`:'#7fdcc6';c.fillRect(bx,by,bw*k,3.5);
    if(ready&&!this.warStatus?.active){const a=this.targets.find(x=>x.id===p.id);if(a){const y=a.y-a.scale*62-14-pulse*4;c.font='700 16px Georgia';const label='✦ Gõ đột phá',w=c.measureText(label).width+18;
      c.shadowColor='#ffd76a';c.shadowBlur=10+pulse*10;c.fillStyle='#3a2a08ee';c.beginPath();c.roundRect(a.x-w/2,y-13,w,26,13);c.fill();c.shadowBlur=0;
      c.strokeStyle=`rgba(255,215,106,${.6+.4*pulse})`;c.lineWidth=1.5;c.stroke();c.fillStyle='#ffe7a3';c.textAlign='center';c.textBaseline='middle';c.fillText(label,a.x,y+1);}}
    c.restore();}
  drawEffect(c,e,t,layer='front'){if(this.raceStatus?.active)return;const age=t-e.start,k=age/e.duration;if(k<0||k>1)return;
    const p=this.targets.find(x=>x.id===e.user)||{x:450,y:this.floorY||this.height*.65};
    if(layer==='front'&&e.gift&&tributeProfile(e)?.value>=30&&!giftSpectacleTier(e)&&!e.tributeImpact&&k>=.46){e.tributeImpact=true;if(k<.58)this.onGiftSound?.('ascension-screen-impact');}
    if(layer==='front'&&e.gift)drawComboBurst(c,e,t,k,p,this.height,this.budget?.level==='light',this.motion);
    if(e.petAward){drawPetArrival(this,c,e,t,p,this.height,layer);return;}
    if(e.gift&&giftSpectacleTier(e)){drawGiftTribute(this,c,e,t,k,p,this.height,layer);drawGiftSpectacle(c,e,t,k,p,this.height,{light:this.budget?.level==='light',art:this.giftSpectacleArt,beasts:this.spiritBeasts,layer,motion:this.motion});return;}
    // v43: hiệu ứng lớn vẽ SAU nhân vật, hiệu ứng nhỏ vẽ TRƯỚC. Quà thường: sân khấu (đèn, hoa nở, lụa) ở sau, hoạt cảnh quà nhỏ ở trước.
    if(e.gift){drawGiftTribute(this,c,e,t,k,p,this.height,layer);if(e.transform)drawTransform(c,e,t,k,p,this.height,layer);return;}
    if(e.transform){drawTransform(c,e,t,k,p,this.height,layer);return;}
    const big=e.effect==='breakthrough'||e.flowerRank||e.luxury;if(e.effect!=='breakthrough'&&(big?layer!=='back':layer==='back'&&!e.gift))return;if(e.effect==='attack'&&e.technique){if(arenaOn(this)&&!e.target)e.target={x:450,yRatio:ARENA_BOSS_Y+.02};if(drawDoraTechnique(this,c,e,t,k,p))return;drawCombatTechnique(c,e,t,k,p,this.height,{light:this.budget?.level==='light',signatures:this.signatureSprites,relics:this.combatSprites});return;}if(e.effect==='breakthrough'){drawBreakthroughFx(c,e,t,k,p,this.height,{light:this.budget?.level==='light',formation:this.formationArt,art:this.ascensionArt,layer,viewScale:this.camera?.s||1,motion:this.motion,title:false});return;}if(e.flowerRank){const fake={...e,gift:'Sự kiện',kind:e.eventKind==='meteor'?'cosmos':'flower',coins:[0,2999,1200,600][e.flowerRank]||600,count:1};drawGiftStage(c,fake,t,k,p,this.height,this.budget?.level==='light');drawHighGift(c,fake,t,k,p,this.height,{light:this.budget?.level==='light',phoenix:this.bossSprites?.[2],dragon:this.celestialSprites?.[0]});return;}if(e.luxury){drawLuxuryFx(c,e,t,k,p,this.height,this.budget?.level,this.formationArt);drawImmortalGift(c,e,t,k,p,this.height,this.relicSprites,this.budget?.level==='light',this.signatureSprites,this.shendeArt);drawHighGift(c,e,t,k,p,this.height,{light:this.budget?.level==='light',phoenix:this.bossSprites?.[2],dragon:this.celestialSprites?.[0]});return;}if(e.gift&&layer==='back'){drawGiftStage(c,e,t,k,p,this.height,this.budget?.level==='light');return;}if(e.kind){drawGiftFx(c,e,t,k,p,this.height);if(k>.4)return;}const alpha=Math.min(1,k*5,(1-k)*4);c.save();c.globalAlpha=alpha;
    if(['qi','petal','join'].includes(e.effect)){for(let i=0;i<14;i++){const a=i*2.399;const r=16+k*55;const x=p.x+Math.cos(a)*r,y=p.y-30+Math.sin(a)*r*.5-k*55;this.ellipse(c,x,y,e.effect==='petal'?4:2,e.effect==='petal'?2:2,e.effect==='petal'?'#e3b4b7':'#d7dda7');}}
    if(['lotus','breakthrough','victory','boss','skin'].includes(e.effect)){c.shadowColor='#ead49b';c.shadowBlur=18;for(let r=0;r<4;r++)this.ellipse(c,p.x,p.y+11,25+k*70+r*15,8+k*20+r*5,null,r%2?'#e3ce80':'#b4dec5');for(let i=0;i<12;i++){const a=i*TAU/12+k*1.3;const rr=45+k*60;this.path(c,[[p.x+Math.cos(a)*rr,p.y+Math.sin(a)*rr*.4],[p.x+Math.cos(a+.2)*(rr+30),p.y+Math.sin(a+.2)*(rr+30)*.4],[p.x+Math.cos(a+.4)*rr,p.y+Math.sin(a+.4)*rr*.4]],'#d6d29e50');}}
    if(['sword','attack','breakthrough','skin'].includes(e.effect)){const n=e.effect==='attack'?3:9;for(let i=0;i<n;i++){const a=i*TAU/n+k*4;const r=40+Math.sin(k*Math.PI)*45;c.save();c.translate(p.x+Math.cos(a)*r,p.y-22+Math.sin(a)*r*.45);c.rotate(a+k*3);c.shadowColor='#b9f3d6';c.shadowBlur=12;this.path(c,[[-2,-25],[2,-25],[2,10],[0,17],[-2,10]],'#d9e8c6');c.fillStyle='#cabd82';c.fillRect(-6,-17,12,2);c.restore();}}
    if(e.effect==='dragon'){c.save();c.shadowColor='#9ce0b4';c.shadowBlur=18;c.lineCap='round';const points=[];for(let i=0;i<=65;i++){const a=i*.12+k*4;points.push([450+Math.cos(a)*230, this.height*.48+Math.sin(a)*85+i*.3]);}c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.lineWidth=13;c.strokeStyle='#8dbf93';c.stroke();c.lineWidth=4;c.strokeStyle='#d5d3a1';c.stroke();const [x,y]=points.at(-1);this.path(c,[[x-15,y-9],[x+7,y-14],[x+27,y],[x+12,y+10],[x-13,y+7]],'#c9d3a5','#e4d59b');this.ellipse(c,x+12,y-3,2,2,'#f6dc85');c.strokeStyle='#e8d6a0';c.lineWidth=2;c.beginPath();c.moveTo(x,y-10);c.lineTo(x-9,y-28);c.moveTo(x+4,y-12);c.lineTo(x+9,y-29);c.stroke();c.restore();}
    if(e.effect==='breakthrough'){c.strokeStyle='#f7e9b2';c.lineWidth=2;for(let i=0;i<3;i++){c.beginPath();c.moveTo(p.x+Math.sin(i*9)*60,10);for(let j=0;j<8;j++)c.lineTo(p.x+Math.sin(j*3+i)*30,(p.y-20)*j/8);c.lineTo(p.x,p.y-20);c.stroke();}}
    c.restore();}
  drawBreakthrough(c,e,t,k,p){
    const fade=Math.min(1,k/.15,(1-k)/.18),r=100+Math.sin(k*Math.PI)*80,y=p.y-70;
    c.save();c.globalAlpha=Math.max(0,fade);c.fillStyle='#10223655';c.fillRect(0,0,900,this.height);
    const beam=c.createLinearGradient(p.x-100,0,p.x+100,0);beam.addColorStop(0,'#ffe3a000');beam.addColorStop(.5,'#ffe3a080');beam.addColorStop(1,'#ffe3a000');c.fillStyle=beam;c.fillRect(p.x-100,0,200,p.y+50);
    if(this.formationArt){c.save();c.globalAlpha*=.7;c.translate(p.x,p.y+65);c.scale(1,.42);c.rotate(t*.00035);c.drawImage(this.formationArt,-r,-r,r*2,r*2);c.restore();}
    c.strokeStyle='#ffe5a7';c.lineWidth=2;
    for(let i=0;i<3;i++)this.ellipse(c,p.x,y,r+i*22,(r+i*22)*.75,null,c.strokeStyle);
    const n=this.budget?.level==='light'?10:22;for(let i=0;i<n;i++){const a=i*TAU/n+t*.0004;c.fillStyle=i%2?'#a9f3e2':'#ffe5a7';c.fillRect(p.x+Math.cos(a)*r,y+Math.sin(a)*r*.75,3,7);}
    c.restore();
  }
  // Khi phóng to cho điện thoại, nén hàng nhân vật vào vùng nhìn thấy để không ai bị cắt ở mép.
  layoutTargets(players,H){if(this.environment?.layout==='sect')return sectHallTargets(players,H);const targets=courtyardTargets(players,H,this.courtyardY(H),this.environment,this.art);if(!targets.length)return targets;const half=450*.96/Math.max(1,this.zoom||1),body=33*targets[0].scale,reach=Math.max(...targets.map(a=>Math.abs(a.x-450)));if(reach+body>half&&reach>0){const fit=Math.max(.5,(half-body)/reach);for(const a of targets)a.x=450+(a.x-450)*fit;}return targets;}
  courtyardY(H){const ground=projectedGround(this.environment,H,this.art);if(ground)return ground.cy;if(this.environment?.floorY)return H*this.environment.floorY;if(!this.art?.naturalWidth)return H*.70-24;const ratio=this.art.naturalWidth/this.art.naturalHeight;const fullH=900/ratio;return H<fullH?(fullH*.54-(fullH-H)*.52):H*.54;}
  atmosphere(c,t,layer){if(this.heavyCrowd||this.raceStatus?.active)return;
    const config=this.budget?.config;if(!config){if(this.environment?.ambience){drawWorldAmbience(this,c,t,layer);return;}drawAtmosphere(this,c,t,layer);return;}
    if(!this.worldLife?.environment)return;
    if(this.budget.level==='light'&&layer==='front'&&this.environment?.ambience!=='underwater')return;
    const cache=this.environmentLayers??=new Map(),tick=Math.floor(t*(this.environment?.ambience==='underwater'?Math.max(10,config.atmosphereFps):config.atmosphereFps)/1000);
    let item=cache.get(layer);
    if(!item){const w=this.canvas.width,h=this.canvas.height,surface=makeSurface(w,h);if(!surface)return;item={surface,tick:-1};cache.set(layer,item);}
    if(item.tick!==tick){const x=item.surface.getContext('2d');x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,item.surface.width,item.surface.height);x.setTransform(item.surface.width/900,0,0,item.surface.height/this.height,0,0);if(this.environment?.ambience)drawWorldAmbience(this,x,t,layer);else drawAtmosphere(this,x,t,layer);item.tick=tick;}
    c.drawImage(item.surface,0,0,900,this.height);
  }
  drawAscensionTitle(c,t){const e=this.effects.find(e=>e.effect==='breakthrough'),k=e?(t-e.start)/e.duration:0,p={x:450,y:this.height*.32+300},active=!!e&&!!breakthroughTitleLayout(e,k,p,this.height,1,this.motion);document.body.classList.toggle('breakthrough-title-active',active);if(active)drawBreakthroughTitle(c,e,k,p,this.height,1,this.motion);}
  setQuality(mode){(this.budget??=new RenderBudget()).set(mode);this.characterFrames?.clear();this.resize();}
  frame(t){requestAnimationFrame(n=>this.frame(n));if(!this.visible||!this.background||this.canvas.clientWidth===0)return;if(!(this.clock??=new FrameClock()).ready(t,this.motion?(this.effects.some(e=>e.effect==='breakthrough'&&t-e.start<e.duration)?(this.effects.some(e=>e.effect==='breakthrough'&&breakthroughRealm(e)===1&&t-e.start<e.duration)?60:30):this.renderPreview?12:(this.budget?.config.fps||30)):5))return;this.lastFrame=t;const c=this.ctx;const H=this.height;this.frames=(this.frames||0)+1;if(t-(this.fpsAt||0)>=1000){this.fps=Math.round(this.frames*1000/(t-(this.fpsAt||t-1000)));this.frames=0;this.fpsAt=t;this.frameMs=this.lastCost||0;const samples=[...(this.frameCosts||[])].sort((a,b)=>a-b);this.frameP95=samples[Math.floor(samples.length*.95)]||0;this.cacheMiB=+([...this.characterFrames.frames.values()].reduce((n,f)=>n+f.canvas.width*f.canvas.height*4,0)/1048576).toFixed(2);}const cost0=performance.now();const ritual=this.effects.find(e=>e.effect==='breakthrough'&&t-e.start<e.duration);if(ritual&&(!this.raceStatus?.active||this.showcase)){this.compact=false;this.soloVisible=true;document.body.classList.toggle('performance-solo',true);document.body.classList.toggle('ritual-active',true);c.setTransform(this.canvas.width/900,0,0,this.canvas.height/H,0,0);const phase=drawRitual(this,c,ritual,t,H);this.onRitualAudio?.(phase.realm<=13?ritual:null,t-ritual.start);if(phase.realm>13){if(!ritual.ritualGather&&phase.k>=.14){ritual.ritualGather=true;this.onRitualSound?.('gather');}if(!ritual.ritualSurge&&phase.k>=.53){ritual.ritualSurge=true;if(phase.k<.65)this.onRitualSound?.('surge');}if(!ritual.ritualRush&&phase.realm>=6&&phase.k>=.59){ritual.ritualRush=true;if(phase.k<.65)this.onRitualSound?.('rush');}if(!ritual.ritualEcho&&phase.realm>=10&&phase.k>=.80){ritual.ritualEcho=true;if(phase.k<.86)this.onRitualSound?.('echo');}if(!ritual.ritualImpact&&phase.k>=.70){ritual.ritualImpact=true;if(phase.k<.80)this.onRitualSound?.(phase.realm>=6?'screen-impact':'impact');}if(!ritual.ritualReveal&&phase.revealed){ritual.ritualReveal=true;this.onRitualSound?.('reveal');}}this.lastCost=Math.round((performance.now()-cost0)*10)/10;(this.frameCosts??=[]).push(this.lastCost);if(this.frameCosts.length>60)this.frameCosts.shift();if(this.budget?.sample(this.lastCost,t,this.fps))this.resize();return;}document.body.classList.toggle('ritual-active',false);this.onRitualAudio?.(null);this.onRitualFrame?.(null);if(this.showcase){this.soloVisible=false;document.body.classList.toggle('performance-solo',false);this.effects=this.effects.filter(e=>t-e.start<e.duration);c.setTransform(this.canvas.width/900,0,0,this.canvas.height/H,0,0);drawAscensionStageIdle(this,c,t,H);this.lastCost=Math.round((performance.now()-cost0)*10)/10;(this.frameCosts??=[]).push(this.lastCost);if(this.frameCosts.length>60)this.frameCosts.shift();return;}for(const e of this.effects){if(!e.gift||!giftSpectacleTier(e))continue;const k=(t-e.start)/e.duration;for(const [i,at]of [[0,.32],[1,.66]]){const key='impactPlayed'+i;if(!e[key]&&k>=at){e[key]=true;if(k<at+.08)this.onSpectacleImpact?.();}}}c.setTransform(1,0,0,1,0,0);const movedCam=this.moveCamera(t),baseCam=eventGiftCamera(movedCam,eventGiftImpulse(this,t),H),shakeEvent=!this.raceStatus?.active&&this.effects.find(e=>e.gift&&giftSpectacleTier(e)),jolt=(j=>{const hs=this.heavenStrike&&this.motion&&this.cameraEnabled?heavenStrikeShake(this.heavenStrike.profile,(t-this.heavenStrike.start)/1000):null;return hs?{x:j.x+hs.x,y:j.y+hs.y}:j;})(shakeEvent?spectacleShake(shakeEvent,t,this.motion&&this.cameraEnabled):{x:0,y:0}),cam={...baseCam,x:Math.min(0,Math.max(900*(1-baseCam.s),baseCam.x+jolt.x)),y:Math.min(0,Math.max(H*(1-baseCam.s),baseCam.y+jolt.y))},sx=this.canvas.width/900,sy=this.canvas.height/H;this.lastCam=cam;c.setTransform(sx*cam.s,0,0,sy*cam.s,sx*cam.x,sy*cam.y);c.drawImage(arenaBackground(this,this.background),0,0,900,H);if(this.previousBackground&&!arenaOn(this)){const k=Math.min(1,(t-this.backgroundChangedAt)/1200);c.globalAlpha=1-k;c.drawImage(this.previousBackground,0,0,900,H);c.globalAlpha=1;if(k>=1)this.previousBackground=null;}
    if(this.motion&&!this.environment?.ambience){for(let i=0;i<(this.budget?.level==='light'?10:20);i++){const x=(i*173+t*(.008+(i%3)*.002))%940-20,y=(i*93+Math.sin(t*.0005+i)*15)%(H*.9);c.globalAlpha=.16+.18*Math.sin(t*.001+i);this.ellipse(c,x,y,i%5===0?3:1.5,i%5===0?1.4:1.5,i%5===0?'#eac2bc':'#e2dd9a');}c.globalAlpha=1;}
    if(this.motion&&!this.environment?.ambience){c.save();c.globalCompositeOperation='screen';for(let i=0;i<3;i++){const x=150+i*320+Math.sin(t*.00012+i)*65;this.cloud(c,x,H*(.43+i*.20),1.4,.028);}c.restore();c.save();c.translate((t*.014)%1100-100,H*.26+Math.sin(t*.0002)*30);c.strokeStyle='#e9e9d7bb';c.lineWidth=2;c.beginPath();c.moveTo(-18,Math.sin(t*.004)*7);c.quadraticCurveTo(-7,-6,0,0);c.quadraticCurveTo(7,-6,18,Math.sin(t*.004)*7);c.stroke();c.restore();}
    this.atmosphere(c,t,'back');drawLanternFestival(this,c,t);
    const solo=!this.raceStatus?.active&&!this.warStatus?.active&&!this.alcStatus?.active&&this.presentation?.until>t?this.presentation:null;if(this.soloVisible!==!!solo){this.soloVisible=!!solo;document.body.classList.toggle('performance-solo',!!solo);}drawWorldLife(this,c,t,{crowd:this.players.length,...this.worldLife,environment:!this.environment?.ambience&&this.worldLife.environment,npcs:this.environment?.layout!=='sect'&&!['cosmos','underwater'].includes(this.environment?.ambience)&&!this.raceStatus?.active&&!solo&&!this.socialStage?.length&&this.budget?.level==='high'&&this.worldLife.npcs});
    // Đạo diễn sân khấu chọn tối đa 16/24/32 người theo chất lượng (ưu tiên người vừa bình luận/tặng quà); Mover lo bay vào/ra và bay đi làm việc.
    this.compact=compactPlaza(this)&&!solo;const st=this.stage??=new StageDirector(),mv=this.mover??=new Mover();
    // 08/11 LIVE: >20 người tối đa 30 ghế, >30 người tối đa 50 ghế (chỉ ảnh skin) (ghế xoay theo người vừa tương tác/tặng quà). Vẽ cả 80 người làm GPU tích hợp tụt 2-3 FPS và mất tiếng.
    st.seats=this.heavyCrowd?Math.min(this.minimalCrowd?50:30,Math.max(this.budget?.config.seats||16,(this.realPlayers||[]).length)):Math.max(this.budget?.config.seats||16,(this.realPlayers||[]).length);const required=new Set([...(this.focusUntil>t?[this.focusId]:[]),...(document.body.classList.contains('overlay')?[]:[this.selected]),...this.effects.map(e=>e.user),...[...(this.engagementReactions||new Map()).values()].filter(e=>t-e.start<3400).map(e=>e.user)].filter(Boolean));
    if(!this.compact&&this.motion&&t-(this.calmAt||0)>12000){if((this.recentEvents||0)<3)st.calmSwap();this.calmAt=t;this.recentEvents=0;}
    if(!solo&&!this.socialScene&&!this.raceStatus?.active){const pairs=this.companionStatus?.pairs||[];if(pairs.length){const pair=pairs[Math.floor(t/12000)%pairs.length];required.add(pair.a);required.add(pair.b);}}
    const soloPlayer=solo&&this.playerIndex?.get(solo.id);
    if(!soloPlayer&&(this.stageDirty||!this.orderedIds||t-(this.stageUpdatedAt||0)>=250)){this.orderedIds=st.update(this.realPlayers||this.players.filter(p=>!p.resident),this.residentActors||[],t,required).map(p=>p.id);this.stageUpdatedAt=t;this.stageDirty=false;}
    const socialActors=(this.raceStatus?.active?raceActorIds(this,t):this.warStatus?.active?(this.warStage||[]):this.alcStatus?.active?(this.alcStage||[]):this.socialStage||[]).map(id=>this.playerIndex?.get(id)).filter(Boolean);
    const ordered=this.raceStatus?.active?socialActors:soloPlayer?[soloPlayer]:socialActors.length?socialActors:(this.orderedIds||[]).map(id=>this.playerIndex?.get(id)||this.players.find(p=>p.id===id)).filter(Boolean);
    this.floorY=this.courtyardY(H);this.targets=!solo&&!socialActors.length&&!this.raceStatus?.active&&this.environment?.layout==='sect'?sectHallTargets(ordered.filter(p=>!this.sectElders?.some(e=>e.id===p.id)),H):this.compact?crowdTargets(ordered,H):!solo&&!socialActors.length&&this.environment?.layout==='float'?floatingTargets(this,ordered,H,t):this.raceStatus?.active?raceTargets(this,ordered,H,t):!solo&&socialActors.length?socialTargets(this,ordered,H):this.layoutTargets(ordered,H);if(!solo&&!socialActors.length&&!this.raceStatus?.active&&this.environment?.layout==='sect')this.targets=seatSectElders(this.targets,this.sectElders||[],H);if(soloPlayer&&solo.kind==='gift')this.targets=[{id:soloPlayer.id,player:soloPlayer,x:450,y:H*.65,scale:4.2,lift:0}];companionPlaces(this,this.targets,t,this.environment?.layout!=='sect'&&!solo&&!this.socialScene&&!this.raceStatus?.active);if(!this.compact&&!this.raceStatus?.active&&!socialActors.length&&this.environment?.layout!=='float')constrainGroundTargets(this.targets,projectedGround(this.environment,H,this.art));if(!this.compact&&!['sect','float'].includes(this.environment?.layout)&&!this.raceStatus?.active&&!solo&&!socialActors.length)mv.place(this.targets,t,H,this.floorY,this.motion);if(!this.raceStatus?.active&&!solo&&!socialActors.length){if(this.environment?.layout==='float')for(const a of this.targets){mv.pos.set(a.id,{x:a.x,y:a.y});mv.info.set(a.id,{player:a.player,scale:a.scale});}mv.drawLeaving(c,this,st.left,t);}
    if(this.warStatus?.active)this.targets=warTargets(this,ordered,H,t);
    if(this.alcStatus?.active)this.targets=alchemyTargets(this,ordered,H,t);
    const arena=!solo&&arenaOn(this);tickBattleSound(this,arena&&!this.boss?.sealing?this.boss:null,Date.now());if(arena)this.targets=arenaTargets(ordered,H);else if(!solo&&petCoveOn(this))this.targets=petCoveTargets(ordered,H); // màn đánh boss: tu sĩ xếp hàng phía dưới
    {const nowMs=Date.now();if(!this.raceStatus?.active&&this.flowerUntil>nowMs)(this.flowerKind==='meteor'?drawMeteorShower:drawFlowerRain)(c,t,this.height,Math.min(1,(this.flowerUntil-nowMs)/1500,(nowMs-(this.flowerFrom||0))/1500),this.budget?.level==='light');}
    drawCompanionLinks(this,c,t,!solo&&!this.socialScene&&!this.raceStatus?.active);
    drawRace(this,c,t,'back');drawWar(this,c,t,'back');drawAlchemy(this,c,t,'back');
    drawSocialStage(this,c,t,'back',solo);
    // v49: yêu thú vẽ TRƯỚC hiệu ứng và nhân vật → nhân vật + chiêu thức đè lên quái.
    if(!solo)drawPetCove(this,c,t,H);
    if(!solo&&this.boss){prepareAbyssArt(this);const by=this.boss.species==='abyss-dragon'?H*.32:arena?H*ARENA_BOSS_Y:H*.37,sprite=()=>{if(!drawBossSprite(c,this.boss,this.motion?Date.now():(this.boss.startedAt||0)+2000,450,by,this.bossSprites,this.celestialSprites,this.abyssArt,this.motion))drawThunderTiger(c,this.boss,Date.now(),450,by);};if(this.boss.sealing)drawBossSeal(this,c,this.boss,H,450,by,sprite);else sprite();}
    if(!solo&&!this.boss?.sealing)drawAbyssRetaliation(this,c,this.boss,this.motion?Date.now():(this.boss?.startedAt||0)+1000,H,'back');
    for(const e of this.effects)this.drawEffect(c,e,t,'back');
    // All wearable auras are behind ALL bodies, never interleaved with another player.
    // 07/11: skin nạp tiền (Hải Lam / Tư Đồ / Khuy Niết + pháp bảo) LUÔN có hiệu ứng kể cả sân đông (>20 người): bản nhẹ, tối đa 8 người.
    const premium=p=>seaWorn(p)||tudoWorn(p)||p?.equipped===TUDO_BLADE||khuyWorn(p)||p?.equipped===KHUY_DRAGON;
    this.premiumTargets=this.raceStatus?.active?[]:this.heavyCrowd?this.targets.filter(a=>premium(a.player)).slice(0,8):this.targets;
    for(const target of this.minimalCrowd?[]:this.premiumTargets){drawSeaAdornment(this,c,target,t,'back');drawTudoAdornment(this,c,target,t,'back');drawKhuyAdornment(this,c,target,t,'back');if(this.compact&&!this.heavyCrowd)this.drawCompactGear(c,target,t,'back');}
    if(!this.raceStatus?.active&&!solo&&!arena&&!petCoveOn(this))drawSectCourt(this,c,t); // màn đánh boss: ẩn ngai tông chủ để yêu thú chiếm trời
    if(!this.reducePresence&&!this.minimalCrowd&&!this.raceStatus?.active)drawGodAuras(this,c,t,'back');
    {const ga=c.globalAlpha;if(this.compact)c.globalAlpha=ga*.35; // chế độ gọn: hào quang cảnh giới mờ nhẹ, không bỏ hẳn
     for(const target of this.minimalCrowd?[]:this.targets){if(!inView(target,this.camera,H))continue;drawWings(this,c,target,t);if(!this.heavyCrowd&&!this.raceStatus?.active&&!this.compact)drawLinWanQi(this,c,target,t);if(!this.raceStatus?.active)drawDivineHalo(this,c,target,t);}c.globalAlpha=ga;}
    for(const target of this.targets){if(!inView(target,this.camera,H))continue;if(!solo&&!this.minimalCrowd&&this.environment?.layout!=='float')mv.under(c,target,t);this.drawPlayer(c,shownRelicPlayer(target.player,t),target.x,target.y,t);if(target.player?.stunUntil>Date.now()&&!(this.heavenStrike&&this.heavenStrike.user===target.id))drawStunMark(c,target,t,Date.now());if(!this.heavyCrowd&&!this.raceStatus?.active)drawPet(this,c,target,t);if(this.compact&&!this.minimalCrowd)this.drawCompactGear(c,target,t,'front');}
    for(const target of this.minimalCrowd?[]:this.premiumTargets||[]){drawSeaAdornment(this,c,target,t,'front');drawTudoAdornment(this,c,target,t,'front');drawKhuyAdornment(this,c,target,t,'front');}
    if(arena){drawArenaShots(this,c,t,H);if(this.boss?.species!=='abyss-dragon')drawArenaCasts(this,c,t,H);if(!this.boss?.sealing)drawAbyssRetaliation(this,c,this.boss,this.motion?Date.now():(this.boss?.startedAt||0)+1000,H,'front');}
    if(!this.reducePresence&&!this.minimalCrowd&&!this.raceStatus?.active)drawGodAuras(this,c,t,'front');
    if(!solo&&!arena&&!petCoveOn(this)&&!this.raceStatus?.active&&!drawTudoVisitor(this,c,this.visitor,this.motion?t:0,H)&&!drawKhuyVisitor(this,c,this.visitor,this.motion?t:0,H)&&!drawSeaVisitor(this,c,this.visitor,this.motion?t:0,H)&&!drawDoraVisitor(this,c,this.visitor,this.motion?t:0,H)&&!drawLinWanVisitor(c,this.visitor,this,this.motion?t:0,H,this.signatureSprites))drawVisitor(c,this.visitor,this.armedVisitorSprites||this.visitorSprites,this.motion?t:0,H,this.signatureSprites,this.shendeArt);
    this.effects=this.effects.filter(e=>t-e.start<e.duration);if(this.luxuryQueue?.length&&!this.effects.some(e=>e.luxury||e.effect==='breakthrough'))this.addEffect(this.luxuryQueue.shift());if(!solo&&this.fxQueue?.length&&this.effects.filter(x=>x.kind&&x.kind!=='blessing').length<2)this.addEffect(this.fxQueue.shift());for(const e of this.effects)this.drawEffect(c,e,t,'front');drawSocialStage(this,c,t,'front',solo);drawRace(this,c,t,'front');drawWar(this,c,t,'front');drawAlchemy(this,c,t,'front');drawAlchemySoot(this,c,t);if(!this.raceStatus?.active)drawBondLinks(this,c,t);this.atmosphere(c,t,'front');if(!this.raceStatus?.active&&!this.alcStatus?.active)drawEngagementReactions(this,c,t);this.drawNames(c,t);if(!this.raceStatus?.active&&solo?.kind!=='gift')this.mover?.drawBubbles(c,this.targets,t);c.setTransform(sx,0,0,sy,0,0);this.atmosphere(c,t,'screen');drawWarResult(this,c,t);drawAlchemyResult(this,c,t);if(this.heavenStrike){const hs=this.heavenStrike,k=(t-hs.start)/1000;if(k*1000>HEAVEN_STRIKE_MS)this.heavenStrike=null;else{const tg=this.targets.find(x=>x.id===hs.user),cm=this.lastCam||{s:1,x:0,y:0};drawHeavenStrike(c,hs.profile,k,{W:900,H,x:tg?cm.x+tg.x*cm.s:450,y:tg?cm.y+tg.y*cm.s:H*.72,scale:(tg?.scale||1.42)*cm.s},{light:this.budget?.level==='light',name:hs.name,loss:hs.loss});}}drawAbyssHealth(c,this.boss,Date.now(),H);if(!this.raceStatus?.active)this.drawAscensionTitle(c,t);for(const e of this.effects)if(!this.raceStatus?.active&&e.petAward)drawPetArrivalTitle(c,e,t,H,this.motion);this.lastCost=Math.round((performance.now()-cost0)*10)/10;(this.frameCosts??=[]).push(this.lastCost);if(this.frameCosts.length>60)this.frameCosts.shift();if(this.budget?.sample(this.lastCost,t,this.fps))this.resize();
  }
}
function hash(s){let n=0;for(const ch of s)n=(Math.imul(n,31)+ch.charCodeAt(0))|0;return Math.abs(n);}
