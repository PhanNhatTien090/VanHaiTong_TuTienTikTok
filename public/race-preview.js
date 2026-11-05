import {Scene} from './scene.js';import {REALM_NAMES} from './progression.js';
const scene=new Scene(document.querySelector('#preview'),()=>{});scene.residents=false;scene.zoom=1;scene.cameraEnabled=false;scene.setQuality('balanced');
const names=['Thanh Vân','Mộc Miên','Tiểu Ngư','Hàn Phong','Bạch Lộ','Vô Trần'];
const players=names.map((name,i)=>({id:'preview:'+i,name,active:true,joinedAt:i,realm:i%6,giftCoins:i<2?100+i*400:0,qi:30,neededQi:100,stones:0,neededStones:20,equipped:'soul-bell',spiritPet:'astral-dragon',raceSwordSkins:['race-emperor','race-moon','race-frost'],raceSwordChoice:['race-emperor','race-moon','race-frost'][i%3]}));
const now=Date.now(),race={id:'preview-race',active:true,phase:'running',startedAt:now-20000,endsAt:now+900000,racers:players.map((p,i)=>({id:p.id,name:p.name,startedAt:now-20000,speed:3,bonus:200-i*12,at:i})),giftTop:players.slice(0,5).map((p,i)=>({id:p.id,name:p.name,coins:10-i}))};
const update=()=>scene.update({players,boss:null,realms:REALM_NAMES,serverNow:Date.now(),raceStatus:race,raceStage:players.map(p=>p.id),environment:{id:'race',name:'Vân Hải Phi Kiếm',floorY:.82}},null);
document.querySelector('#boost').onclick=()=>{const r=race.racers[0],now=Date.now();r.bonus+=30;r.boostUntil=now+6000;r.lastBoostAt=now;r.giftAt=now;r.giftTier=1;r.giftUnits=30;update();};
document.querySelector('#finish').onclick=()=>{race.phase='finished';race.results=players.slice(0,5).map((p,i)=>({...p,finishAt:Date.now()+i}));update();};update();
