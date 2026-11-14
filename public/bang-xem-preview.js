// 15/11/2026: xem thử bảng xem (tu vi · túi · thú · skin) hiện giữa rồi bay ra 4 góc. Dữ liệu giả, không chạm LIVE.
import {Scene} from './scene.js';
import {REALM_NAMES} from './progression.js';
import {InventoryDeck,DECK_LIMITS} from './inventory-multi.js?v=bang-xem-20261115';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const scene=new Scene(document.querySelector('#preview'),()=>{});scene.residents=false;scene.zoom=1;scene.setQuality('balanced');
const P=(id,name,extra)=>({id,name,active:true,joinedAt:0,realm:9,qi:50,neededQi:100,giftCoins:600,stones:0,neededStones:20,gender:'nam',...extra});
const players=[
 P('a','Công Tài',{realm:9,skinChoice:'hac-kim-chien-y',rewardSkins:['hac-kim-chien-y']}),
 P('b','subang🌿',{realm:6,gender:'nu',equipped:'thanh-long-thuong'}),
 P('c','h tri',{realm:4,spiritPet:'ky-lan',spiritPets:['ky-lan','jade-rabbit','ember-fox','sun-phoenix']}),
 P('d','Nguyễn Thị Lan Anh tu tiên',{realm:7,gender:'nu',skinChoice:'khuy-niet-loi-ton',rewardSkins:['hac-kim-chien-y','khuy-niet-loi-ton','tudo-ma-ton','sea-dragon-heir','crimson-phoenix','ivory-celestial','nguyet-lien-tien-co']}),
 P('e','Vô Trần',{realm:2}),P('f','Bạch Lộ',{realm:3,gender:'nu'})
];
scene.update({players,realms:REALM_NAMES,serverNow:Date.now()},null);
const cards={
 a:{realm:9,realmName:'Đại Thừa',stage:2,next:'Chân Tiên',qi:6420000,needQi:9000000,stones:500,needStones:900,ready:false,rank:3,players:2400},
 b:{kind:'bag',stones:12840,herbs:356,artifacts:{items:[{id:'thanh-long-thuong',name:'Thanh Long Thương',icon:'sword',on:true},{id:'tu-loi-luan',name:'Tử Lôi Pháp Luân',icon:'orb',secondary:true},{id:'kim-cuong-chung',name:'Kim Cương Chung',icon:'bell'}],more:2},pills:{items:[{id:'p',name:'Ngưng Thần Đan',n:12},{id:'q',name:'Trúc Cơ Đan',n:3}],more:0},manuals:{items:['x','y'],more:1}},
 c:{kind:'pets',current:'Kỳ Lân',owned:{items:[{id:'ky-lan',name:'Kỳ Lân',on:true},{id:'jade-rabbit',name:'Ngọc Thố'},{id:'ember-fox',name:'Xích Diễm Hồ'},{id:'sun-phoenix',name:'Kim Vũ Phượng'}],more:0},total:13},
 d:{kind:'skins',current:'Khuy Niết Lôi Tôn',owned:{items:[{id:'khuy-niet-loi-ton',name:'Khuy Niết Lôi Tôn',on:true},{id:'hac-kim-chien-y',name:'Đấu Đế Tiêu Viêm'},{id:'tudo-ma-ton',name:'Tư Đồ Ma Tôn'},{id:'sea-dragon-heir',name:'Long Duệ Hải Lam'},{id:'crimson-phoenix',name:'Xích Phượng Chiến Y'},{id:'ivory-celestial',name:'Bạch Kim Tiên Đế'}],more:1}},
 e:{realm:2,realmName:'Trúc Cơ',stage:0,next:'Kim Đan',qi:120,needQi:400,stones:2,needStones:20,ready:false,rank:880,players:2400},
 f:{kind:'bag',stones:40,herbs:3,artifacts:{items:[],more:0},pills:{items:[],more:0},manuals:{items:[],more:0}}
};
const deck=new InventoryDeck(document.querySelector('#inventoryDeck'),scene,esc,{observe:false});
const show=id=>{const p=players.find(x=>x.id===id);deck.show({user:id,name:p.name,card:cards[id]},p);};
const q=s=>document.querySelector(s);
q('#one').onclick=()=>{deck.clear();show('b');};
q('#four').onclick=()=>{deck.clear();['a','b','c','d'].forEach(show);};
q('#six').onclick=()=>{deck.clear();['a','b','c','d','e','f'].forEach(show);};
q('#again').onclick=()=>{cards.b={...cards.b,stones:cards.b.stones+999};show('b');};
// Dừng thời gian ở góc để chụp/xem kỹ (giống lúc có đột phá).
q('#freeze').onclick=()=>deck.setPaused(!deck.paused);
const auto=new URLSearchParams(location.search).get('auto');
if(auto)setTimeout(()=>{['a','b','c','d','e','f'].slice(0,Number(auto)||4).forEach(show);},1500);
window.deck=deck;window.DECK_LIMITS=DECK_LIMITS;
