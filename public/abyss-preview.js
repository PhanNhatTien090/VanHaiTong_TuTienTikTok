import {CultivationAudio} from './audio.js';
import {Scene} from './scene.js';
import {ABYSS_BOSS} from './abyss-boss.js';
import {REALM_NAMES} from './progression.js';
const audio=new CultivationAudio();
const scene=new Scene(document.querySelector('#preview'),()=>{});scene.onCombatSound=(kind,variant)=>audio.combat(kind,variant);scene.residents=false;scene.zoom=1;scene.setQuality('balanced');
const names=['Thanh Vân','Mộc Miên','Hàn Phong','Tiểu Ngư','Bạch Lộ','Vô Trần'];
const players=Array.from({length:24},(_,i)=>({id:'preview:'+i,name:names[i%6]+' '+(i+1),active:true,joinedAt:i,realm:i%12,qi:50,neededQi:100,giftCoins:0,stones:0,neededStones:20}));
const boss={...ABYSS_BOSS,id:'preview-abyss',kind:'raid',startedAt:Date.now(),endsAt:Date.now()+300000,hp:14800,maxHp:14800,participants:{},damage:{}};
const update=()=>scene.update({players,boss,realms:REALM_NAMES,serverNow:Date.now()},null);update();
const phase=(hp,age)=>{boss.hp=hp;boss.startedAt=Date.now()-age;boss.endsAt=Date.now()+300000;update();};
document.querySelector('#charge').onclick=()=>phase(14800,1500);
document.querySelector('#strike').onclick=()=>phase(11840,3900);
document.querySelector('#rage').onclick=()=>phase(3700,3000);
document.querySelector('#full').onclick=()=>phase(14800,0);

document.querySelector("#sound").onclick=async e=>{await audio.enable(!audio.enabled);e.target.textContent=audio.enabled?"Tắt âm chiến đấu":"Bật âm chiến đấu";};
