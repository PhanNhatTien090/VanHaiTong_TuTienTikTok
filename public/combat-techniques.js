import {drawCombatFx} from './combat-fx.js';
// One chat command, automatic visual selection. Damage remains authoritative in engine.power.
export const COMBAT_RELICS=Object.freeze([
 {id:'nine-heaven-seal',name:'Cửu Tiêu Lôi Ấn',cell:0,tier:5,price:1200,herbs:20,damage:65,bonus:.35,technique:'thunder'},
 {id:'celestial-lotus-mirror',name:'Thiên Liên Bảo Kính',cell:1,tier:5,price:1400,herbs:25,damage:60,bonus:.40,technique:'lotus'},
 {id:'azure-cloud-gourd',name:'Thanh Vân Hồ Lô',cell:2,tier:6,price:1800,herbs:35,damage:70,bonus:.45,technique:'vortex'},
 {id:'galaxy-dharma-wheel',name:'Tinh Hà Pháp Luân',cell:3,tier:7,price:2400,herbs:45,damage:85,bonus:.50,technique:'stars'}
].map(a=>({...a,type:'artifact',icon:'orb',description:`Pháp bảo có chiêu riêng khi gõ danh: +${a.damage} sát thương, +${Math.round(a.bonus*100)}% tu vi khi trang bị.`})));
export const TECHNIQUES=Object.freeze({
 'dora-door':{name:'Cánh Cửa Xuyên Không',color:'#ffb6de',pose:'cast',duration:2200},
 'dora-copter':{name:'Tụ Phong Lốc Xoáy',color:'#7de7ff',pose:'cast',duration:1900},
 'dora-cannon':{name:'Không Khí Phá Thiên',color:'#b8eeff',pose:'cast',duration:1900},
 slash:{name:'Thanh Phong Trảm',color:'#c6efff',pose:'slash',duration:1400},
 sword:{name:'Vạn Kiếm Quy Tông',color:'#a6ecff',pose:'slash',duration:1900},
 bamboo:{name:'Thanh Trúc Phong Vân Kiếm Trận',color:'#a0ffc5',pose:'cast',duration:2900,ultimate:true},
 soul:{name:'Hồn Phiên Vạn Hồn Phệ Thiên',color:'#c6a0ff',pose:'dragon',duration:2900,ultimate:true},
 thunder:{name:'Cửu Tiêu Thần Lôi',color:'#c4b5ff',pose:'cast',duration:2000},
 lotus:{name:'Thiên Liên Phá Trận',color:'#ffd2ed',pose:'lotus',duration:2000},
 vortex:{name:'Hồ Lô Thôn Vân',color:'#9ff4cf',pose:'cast',duration:2000},
 stars:{name:'Tinh Hà Luân Chuyển',color:'#b5d7ff',pose:'cast',duration:2200},
 celestial:{name:'Thiên Đế Trấn Giới',color:'#ffe4a4',pose:'ascend',duration:2400},
 // v58: chiêu theo pháp bảo trang bị
 frost:{name:'Băng Phách Hàn Tinh',color:'#9fe6ff',pose:'slash',duration:2000},
 flame:{name:'Xích Phượng Liệt Diễm',color:'#ff7a3a',pose:'cast',duration:2100},
 bell:{name:'Kim Chung Trấn Hồn',color:'#ffd36a',pose:'cast',duration:2200},
 dragon:{name:'Thương Long Xuất Hải',color:'#7fd8ff',pose:'dragon',duration:2300},
 petal:{name:'Bách Hoa Kiếm Vũ',color:'#ff9ec7',pose:'lotus',duration:2100},
 meteor:{name:'Lưu Tinh Trụy Nguyệt',color:'#b7c8ff',pose:'cast',duration:2200},
 // v59: chiêu riêng của pháp bảo sự kiện
 flowersword:{name:'Bách Hoa Tiên Kiếm Quyết',color:'#ff9ec7',pose:'slash',duration:2300},
 peachfan:{name:'Đào Hoa Phiến Phong',color:'#ffb3d1',pose:'cast',duration:2200},
 flowercage:{name:'Linh Lung Hoa Lao',color:'#ffd27a',pose:'cast',duration:2500},
 starmirror:{name:'Tinh Hà Kính Quang',color:'#9fc4ff',pose:'cast',duration:2300},
 stararrow:{name:'Lưu Tinh Xuyên Vân Tiễn',color:'#b7d4ff',pose:'slash',duration:2000},
 sevenstars:{name:'Thất Tinh Bắc Đẩu Trận',color:'#ffe08a',pose:'cast',duration:2500},
 stardust:{name:'Tinh Sa Phong Bạo',color:'#c9d6ff',pose:'cast',duration:2300}
});
// v58: pháp bảo → chiêu (trước khi rơi về chiêu theo cảnh giới)
const GEAR_TECH=Object.freeze({'vip-storm-sword':'thunder','storm-fang':'thunder','frost-sword':'frost','visitor-moon-sword':'frost','moon-fox-jade':'frost','phoenix-blade':'flame','visitor-phoenix-fan':'flame','rebirth-feather':'flame','soul-bell':'bell','bell':'bell','visitor-gold-bell':'bell','tiger-bell':'bell','vip-dragon-orb':'dragon','sea-dragon-heart':'dragon','dragon-pearl':'dragon','patron-seal':'dragon','kun-heart':'dragon','vip-heaven-seal':'celestial','visitor-purple-seal':'celestial','tournament-laurel':'celestial','jade':'sword','visitor-jade-sword':'sword','patron-sword':'sword','hoa-tien-kiem':'flowersword','dao-hoa-phien':'peachfan','hoa-linh-lung':'flowercage','bond-jade':'petal','festival-lotus-jade':'lotus','tinh-ha-kinh':'starmirror','tinh-sa-dai':'stardust','astral-shell':'stars','orb':'stars','celestial-orb':'stars','luu-tinh-cung':'stararrow','that-tinh-phu':'sevenstars','spirit-vase':'vortex','visitor-jade-vase':'vortex','cosmic-cauldron':'vortex'});
export function attackTechnique(p){
 let id;const gear=p.equipped||'';
 if(gear==='dora-anywhere-door')id='dora-door';
 else if(gear==='dora-bamboo-copter')id='dora-copter';
 else if(gear==='dora-air-cannon')id='dora-cannon';
 else if(gear==='hanlap-bamboo-swords')id='bamboo';
 else if(gear==='vuonglam-soul-banner')id='soul';
 else id=COMBAT_RELICS.find(a=>a.id===gear)?.technique||GEAR_TECH[gear];
 if(!id){if(/storm/.test(gear))id='thunder';else if(/heaven-seal/.test(gear)||p.realm>=8)id='celestial';else if(/kinh|orb|dragon/.test(gear)||p.realm>=7)id='stars';else if(/phoenix|phien/.test(gear)||p.manuals?.includes('lotus')&&p.realm>=3)id='lotus';else if(p.realm>=5)id='thunder';else if(p.realm>=2||p.manuals?.includes('sword'))id='sword';else id='slash';}
 const intensity=Math.min(3,1+Math.floor(Math.max(0,p.realm||0)/4)+(p.artifacts?.length>=8?1:0));
 return {id,...TECHNIQUES[id],intensity};
}
export function drawCombatTechnique(c,e,t,k,p,H,opts={}){drawCombatFx(c,e,t,k,p,H,opts);}
