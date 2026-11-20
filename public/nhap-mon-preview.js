// Xem thử NHẬP MÔN tại chỗ (không chạm LIVE). ?n=24 số người trên sân. Nút: 3 người ghế sát nhau / 8 người cùng lúc.
import {Scene} from './scene.js';
import {REALM_NAMES} from './progression.js';
import {addNhapMon} from './nhap-mon-fx.js?v=20261120';
const params=new URLSearchParams(location.search),scene=new Scene(document.querySelector('#preview'),()=>{});
scene.residents=false;scene.setQuality(params.get('quality')||'balanced');
const names=['Minh Nguyệt','Hàn Phong','A Thanh','Võ Trần','Mộc Miên','Thiên Vũ','Lạc Yên','Tiểu Ngư','Lam Khê','Bạch Lộ','Trúc Linh','Thanh Vân'];
const n=Number(params.get('n')||18),now=Date.now();
const players=Array.from({length:n},(_,i)=>({id:'p'+i,name:names[i%names.length]+(i>=names.length?' '+i:''),gender:i%2?'nu':'nam',active:true,joinedAt:now-6e5,lastActive:now,realm:i<6?1:1+(i%4),realmName:REALM_NAMES[1],giftCoins:0,qi:10,neededQi:360,stones:5,neededStones:70}));
scene.update({players,serverNow:now,realms:REALM_NAMES,boss:null},null);
window.__scene=scene;
const fire=ids=>{for(const id of ids){const p=players.find(x=>x.id===id);addNhapMon(scene,{user:id,name:p.name});}};
const row=()=>{const ts=[...scene.targets].sort((a,b)=>a.y-b.y||a.x-b.x);let best=[];for(const a of ts){const r=ts.filter(b=>Math.abs(b.y-a.y)<8).sort((x,y)=>x.x-y.x);if(r.length>best.length)best=r;}return best;};
window.__nmRow=()=>{const r=row(),m=Math.max(0,Math.floor(r.length/2)-1);return r.slice(m,m+3).map(a=>a.id);};
document.querySelector('#go3').onclick=()=>fire(window.__nmRow());
document.querySelector('#go8').onclick=()=>fire(scene.targets.slice(0,8).map(a=>a.id));
