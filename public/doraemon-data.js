export const DORA_SKIN='doraemon-avatar';
export const DORA_RELICS=Object.freeze([
 {id:'dora-bamboo-copter',name:'Chong Chóng Tụ Phong',art:'copter',damage:36,bonus:.22},
 {id:'dora-air-cannon',name:'Pháo Không Khí Thiên Thanh',art:'cannon',damage:40,bonus:.20}
].map(r=>({...r,type:'artifact',icon:'orb',tier:0,price:0,herbs:0,exclusive:true,eventReward:'Doraemon · gõ coduyen nhận một bảo bối miễn phí',description:`Bảo bối Doraemon: +${r.damage} sát thương, +${Math.round(r.bonus*100)}% tu vi. Gõ danh dùng chiêu riêng.`})));
export const doraRelicArt=id=>id==='dora-anywhere-door'?'door':DORA_RELICS.find(r=>r.id===id)?.art;
export const doraWorn=p=>p.skinChoice===DORA_SKIN&&p.rewardSkins?.includes(DORA_SKIN);
