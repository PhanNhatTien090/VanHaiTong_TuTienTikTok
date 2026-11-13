import {Scene} from './scene.js?v=hall-war-drawn-pets-20261114';import {REALM_NAMES} from './progression.js';import {SCENES} from './world-rotation.js';
const scene=new Scene(document.querySelector('#preview'),()=>{});scene.residents=false;scene.zoom=1;scene.setQuality('balanced');
const names=['Thanh Vân','Mộc Miên','Hàn Phong','Bạch Lộ'],players=Array.from({length:24},(_,i)=>({id:'preview:'+i,name:names[i%4]+' '+(i+1),active:true,joinedAt:i,realm:i%10,giftCoins:0,qi:30,neededQi:100,stones:0,neededStones:20}));
let petEvent=null;const update=()=>scene.update({players,boss:null,petEvent,realms:REALM_NAMES,serverNow:Date.now(),environment:SCENES.find(s=>s.id==='sect-hall')},null);
const open=()=>{petEvent={id:'preview-cove',startedAt:Date.now(),endsAt:Date.now()+300000,active:true,premium:new URLSearchParams(location.search).get('premium')||'bach-nguyet-ho',featured:new URLSearchParams(location.search).get('featured')??['loi-oa','van-thu','ky-lan'][Math.floor(Math.random()*3)]};update();};
document.querySelector('#open').onclick=open;document.querySelector('#close').onclick=()=>{petEvent=null;update();};open();
