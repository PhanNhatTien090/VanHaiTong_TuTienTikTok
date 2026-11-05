import {SCENES} from './world-rotation.js';
import {Scene} from './scene.js';
import {REALM_NAMES} from './progression.js';
import {mountRitualHud} from './live-cinema.js';
import {CultivationAudio} from './audio.js';
const scene=new Scene(document.getElementById('preview'),()=>{}),audio=new CultivationAudio();scene.residents=false;scene.zoom=1;scene.setQuality('balanced');mountRitualHud(document.querySelector('.scene-shell'),scene);
scene.onGiftSound=kind=>audio.play(kind);
scene.onSpectacleImpact=()=>audio.play('impact');
scene.onRitualAudio=(event,elapsed)=>audio.ritual(event,elapsed);
scene.onRitualSound=kind=>audio.play(kind.startsWith('qi-')?kind:kind==='gather'?'qi':kind==='reveal'?'victory':kind==='surge'?'ascension-charge':kind==='echo'?'ascension-echo':kind==='rush'?'ascension-rush':kind==='screen-impact'?'ascension-screen-impact':'impact');
const names=['Thanh Vân','Mộc Miên','Hàn Phong','Tiểu Ngư','Bạch Lộ','Vô Trần','Lạc Yên','Minh Nguyệt'];
const players=Array.from({length:48},(_,i)=>({id:'preview:'+i,name:names[i%names.length]+' '+(i+1),active:true,joinedAt:i,realm:i%10,giftCoins:0,qi:30,neededQi:100,stones:0,neededStones:20}));
const state={players,boss:null,realms:REALM_NAMES,environment:SCENES.find(m=>m.id==='sect-hall')};scene.update(state,null);
const select=document.getElementById('realm');REALM_NAMES.forEach((name,i)=>{if(i){const option=document.createElement('option');option.value=i;option.textContent=name;select.appendChild(option);}});select.value=new URLSearchParams(location.search).get('realm')||1;
function reset(){audio.ritual(null);scene.effects=[];scene.presentation=null;scene.focusUntil=0;scene.luxuryQueue=[];scene.fxQueue=[];scene.update(state,null);}
document.getElementById('crowd').onclick=reset;
document.getElementById('ritual').onclick=()=>{reset();const toRealm=Number(select.value),p=players[1],e={id:'preview:'+Date.now(),user:p.id,name:p.name,effect:'breakthrough',fromRealm:toRealm-1,toRealm,visualFrom:{...p,realm:toRealm-1},visualTo:{...p,realm:toRealm}};scene.noteEvent(e);scene.addEffect(e);};
document.getElementById('rose').onclick=()=>{if(scene.presentation?.until>performance.now())return;const e={id:'rose:'+Date.now(),user:players[0].id,name:players[0].name,effect:'petal',gift:'Hoa hồng',coins:1,count:1};scene.noteEvent(e);scene.addEffect(e);audio.play('petal');};
document.getElementById('sound').onclick=async e=>{try{await audio.enable(!audio.enabled);e.target.textContent=audio.enabled?'Tắt âm thanh':'Bật âm thanh';}catch(err){e.target.textContent='Bấm để thử âm lại';console.warn(err);}};

document.getElementById('master').onclick=()=>{reset();const now=Date.now();scene.update({...state,serverNow:now,sectMaster:{active:true,username:'preview',userId:'not-a-player',name:'Tông chủ',text:'Chư vị đạo hữu, cùng tu luyện!',at:now,until:now+22000}},null);};

if(new URLSearchParams(location.search).get("autoplay")==="1")setTimeout(()=>document.getElementById("ritual").click(),900);

document.getElementById("qiReplay").onclick=()=>{select.value=1;document.getElementById("ritual").click();};
document.getElementById("trucCoReplay").onclick=()=>{select.value=2;document.getElementById("ritual").click();};
document.getElementById("kimDanReplay").onclick=()=>{select.value=3;document.getElementById("ritual").click();};
document.getElementById("nguyenAnhReplay").onclick=()=>{select.value=4;document.getElementById("ritual").click();};

// Isolated gift preview. Uses the production scene, never calls a game action API.
const sampleGift=coins=>{reset();const p=players[1],e={id:'gift-preview:'+Date.now(),user:p.id,name:p.name,effect:coins<5?'petal':'lotus',gift:coins===1?'Hoa hồng':'Quà tri ân',kind:coins<30?'rose':'cosmos',coins,count:1};scene.noteEvent(e);scene.addEffect(e);audio.play(coins<30?'petal':'ascension-charge');};
document.querySelector('#rose').onclick=()=>sampleGift(1);
document.querySelector('#giftReplay').onclick=()=>sampleGift(Number(document.querySelector('#giftValue').value));
const giftParam=Number(new URLSearchParams(location.search).get('gift'));
if(giftParam>0)setTimeout(()=>sampleGift(giftParam),900);
