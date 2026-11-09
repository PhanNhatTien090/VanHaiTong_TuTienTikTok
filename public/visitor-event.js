import {drawShendeVisitor} from './shende-art.js';
export const VISITORS=Object.freeze({
 hailam:{name:'Long Duệ Hải Lam',title:'LONG DUỆ HẢI LAM GIÁNG THẾ',cell:0,duration:300000,how:'Gõ cơ duyên để nhận quà, có thể sở hữu skin',color:'#69dcff'},
 doraemon:{name:'Doraemon',title:'DORAEMON GHÉ THĂM TÔNG MÔN',cell:3,how:'Gõ cơ duyên để nhận quà, có thể sở hữu skin',color:'#7de7ff'},
 shende:{name:'Thần Đế',title:'THẦN ĐẾ GIÁNG LÂM',cell:2,how:'Gõ cơ duyên để nhận quà, có thể sở hữu skin',color:'#ffd49a'},
 hanlap:{name:'Hàn Lập',title:'HÀN LẬP BAN CƠ DUYÊN',cell:1,how:'Gõ cơ duyên để nhận quà, có thể sở hữu skin',color:'#a5f0cf'},
 tudo:{name:'Tư Đồ Ma Tôn',title:'TƯ ĐỒ MA TÔN GIÁNG THẾ',cell:2,duration:300000,how:'Gõ cơ duyên để nhận quà, có thể sở hữu skin',color:'#ff6a5a'},
 khuyniet:{name:'Khuy Niết Lôi Tôn',title:'KHUY NIẾT LÔI TÔN GIÁNG THẾ',cell:0,duration:300000,how:'Gõ cơ duyên để nhận quà, có thể sở hữu skin',color:'#c69bff'},
 viemton:{name:'Tần Mục Hỏa Thần',title:'TẦN MỤC HỎA THẦN GIÁNG THẾ',cell:0,duration:300000,how:'Gõ cơ duyên để nhận quà, có thể sở hữu skin',color:'#ff7a2a'},
 vuonglam:{name:'Vương Lâm',title:'VƯƠNG LÂM TRUYỀN ĐẠO',cell:0,how:'Gõ cơ duyên để nhận quà, có thể sở hữu skin',color:'#d4c2ff'}
});
export const VISITOR_RELICS=Object.freeze([
 {id:'visitor-jade-sword',name:'Thanh Trúc Phi Kiếm',cell:0,damage:36,bonus:.22},
 {id:'visitor-jade-vase',name:'Lục Ngọc Linh Bình',cell:1,damage:30,bonus:.28},
 {id:'visitor-gold-bell',name:'Kim Văn Đạo Chung',cell:2,damage:34,bonus:.24},
 {id:'visitor-moon-sword',name:'Nguyệt Hoa Tiên Kiếm',cell:3,damage:36,bonus:.22},
 {id:'visitor-purple-seal',name:'Tử Vân Đạo Ấn',cell:4,damage:34,bonus:.24},
 {id:'visitor-phoenix-fan',name:'Xích Vũ Linh Phiến',cell:5,damage:32,bonus:.26}
].map(x=>({...x,type:'artifact',icon:x.cell===0||x.cell===3?'sword':x.cell===1?'vase':x.cell===2?'bell':'orb',tier:0,price:0,herbs:0,exclusive:true,eventReward:'Tiên nhân ghé thăm',description:'Pháp bảo cơ duyên miễn phí; các mẫu có tổng điểm sức mạnh ngang nhau.'})));
export function drawVisitor(c,event,sprites,t,H,signatures=null,shende=null){
 if(event?.kind==='shende'){drawShendeVisitor(c,event,shende,t,H);return;}
 if(!event||Date.now()>=event.endsAt)return;const spec=VISITORS[event.kind],img=sprites?.[spec?.cell];if(!img)return;
 const age=Math.max(0,(Date.now()-event.startedAt)/1000),rise=Math.min(1,age/1.5),bob=Math.sin(t*.0013)*5;
 c.save();c.globalAlpha=Math.min(1,rise,(event.endsAt-Date.now())/1000);c.translate(450,H*.32+(1-rise)*-60+bob);
 c.strokeStyle=spec.color;c.lineWidth=2;c.beginPath();c.ellipse(0,78,70,16,0,0,Math.PI*2);c.stroke();
 if(event.kind==='hanlap'&&signatures?.[0]){c.save();c.globalAlpha*=.65;c.translate(0,-50);c.rotate(t*.0002);c.drawImage(signatures[0],-110,-110,220,220);c.restore();}
 c.drawImage(img,-70,-145,140,224);c.restore();
}
