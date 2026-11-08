import {Scene} from './scene.js';import {REALM_NAMES} from './progression.js';
// Xem thử đua phi kiếm với dữ liệu giả; không gửi gì vào LIVE. ?n=200 để thử đông người.
const scene=new Scene(document.querySelector('#preview'),()=>{});scene.residents=false;scene.zoom=1;scene.cameraEnabled=false;scene.setQuality('balanced');window.raceScene=scene;
const NAMES=['Thanh Vân','Mộc Miên','Tiểu Ngư','Hàn Phong','Bạch Lộ','Vô Trần','Lăng Tiêu','Diệp Phàm','Tô Mạt','Hạ Vy','Lâm Uyên','Tử Yên','Công Tài','Kiếm Chủ'];
const SKINS=['race-cuu-thien','race-emperor','race-moon','race-frost'];
let players=[],race=null,cost=document.querySelector('#cost');
function build(n){const now=Date.now();
 players=Array.from({length:n},(_,i)=>({id:'preview:'+i,name:NAMES[i%NAMES.length]+(i>=NAMES.length?' '+i:''),active:true,joinedAt:i,realm:i%17,giftCoins:i%5===0?100+i*40:0,qi:30,neededQi:100,stones:0,neededStones:20,equipped:'soul-bell',spiritPet:'astral-dragon',raceSwordSkins:i%3?SKINS:[],raceSwordChoice:SKINS[i%3]}));
 race={id:'preview-race-'+n,active:true,phase:'running',startedAt:now-20000,endsAt:now+900000,racers:players.map((p,i)=>({id:p.id,name:p.name,startedAt:now-20000,speed:3,bonus:20+(i*37)%170,at:i,boosts:0})),giftTop:[],giftFx:[]};
 update();}
// Giống server: 8 người trong khung máy quay (top 3 + luân phiên); client tự đưa người tặng quà lên trước.
function stage(){const now=Date.now(),d=r=>Math.min(1000,(Math.min(now,r.finishAt||now)-r.startedAt)/1000*r.speed+r.bonus);const ranked=[...race.racers].sort((a,b)=>(a.finishAt||Infinity)-(b.finishAt||Infinity)||d(b)-d(a));const ids=ranked.slice(0,3).map(r=>r.id);const start=Math.floor((now-race.startedAt)/6000)*5%race.racers.length;for(let i=0;i<race.racers.length&&ids.length<8;i++){const id=race.racers[(start+i)%race.racers.length].id;if(!ids.includes(id))ids.push(id);}return ids;}
function update(){scene.update({players,boss:null,realms:REALM_NAMES,serverNow:Date.now(),raceStatus:race,raceStage:stage(),environment:{id:'race',name:'Vân Hải Phi Kiếm',floorY:.82}},null);}
// Tặng quà cho người đang KHÔNG có trên khung (để thử việc đưa người tặng lên sân khấu).
function gift(coins){const shown=new Set((scene.targets||[]).map(a=>a.id)),pool=race.racers.filter(r=>!r.finishAt&&!shown.has(r.id)),r=pool[Math.floor(Math.random()*pool.length)]||race.racers[0],now=Date.now(),dist=coins*30;
 r.bonus+=dist;r.boostUntil=now+6000;r.lastBoostAt=now;r.giftAt=now;r.giftTier=coins>=100?3:coins>=10?2:1;r.giftUnits=dist;r.giftCoins=coins;
 const elapsed=(now-r.startedAt)/1000*r.speed+r.bonus;if(elapsed>=1000&&!r.finishAt)r.finishAt=now;
 race.giftFx=[...race.giftFx.filter(x=>now-x.at<15000),{id:'pv-'+now,user:r.id,name:r.name,value:coins,count:1,at:now,mode:'race',boost:dist,fighter:true}].slice(-16);
 const top=new Map(race.giftTop.map(x=>[x.id,x.coins]));top.set(r.id,(top.get(r.id)||0)+coins);race.giftTop=[...top].sort((a,b)=>b[1]-a[1]).slice(0,5).map(([id,c])=>({id,name:race.racers.find(x=>x.id===id).name,coins:c}));update();}
for(const n of [12,60,200])document.querySelector('#n'+n).onclick=()=>build(n);
for(const c of [1,50,300,1000,3000])document.querySelector('#g'+c).onclick=()=>gift(c);
function finish(){if(!race.giftTop.length)race.giftTop=race.racers.slice(0,5).map((r,i)=>({id:r.id,name:r.name,coins:300-i*55}));race.phase='finished';race.podiumUntil=Date.now()+12000;race.results=race.racers.slice(0,5).map((p,i)=>({id:p.id,name:p.name,finishAt:Date.now()+i}));update();}
document.querySelector('#finish').onclick=finish;window.raceFinish=finish;
window.raceGift=gift;window.raceBuild=build;
setInterval(update,1000);setInterval(()=>{const f=scene.frameCosts||[];if(f.length&&cost)cost.textContent='vẽ '+(f.reduce((a,b)=>a+b,0)/f.length).toFixed(1)+' ms/khung · '+race.racers.length+' người';},1000);
build(Number(new URLSearchParams(location.search).get('n'))||12);
