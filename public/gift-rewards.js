export const GIFT_POLICY_VERSION=3; // v33: thưởng quà ×2
export const GIFT_ARTIFACTS=Object.freeze([
 {id:'vip-storm-sword',type:'artifact',name:'Cửu Thiên Lôi Kiếm',icon:'sword',tier:0,price:0,herbs:0,damage:65,bonus:.4,exclusive:true,giftMin:999,description:'Quà từ 999 coin/món: +65 công lực, +40% tu vi khi trang bị.'},
 {id:'vip-dragon-orb',type:'artifact',name:'Long Phượng Thần Châu',icon:'orb',tier:0,price:0,herbs:0,damage:95,bonus:.55,exclusive:true,giftMin:2999,description:'Quà từ 2.999 coin/món: +95 công lực, +55% tu vi khi trang bị.'},
 {id:'vip-heaven-seal',type:'artifact',name:'Thiên Đế Chí Tôn Ấn',icon:'orb',tier:0,price:0,herbs:0,damage:140,bonus:.75,exclusive:true,giftMin:9999,description:'Quà từ 9.999 coin/món: +140 công lực, +75% tu vi khi trang bị.'}
]);
export const GIFT_TIERS=Object.freeze([
 {id:'petal',name:'Linh hoa',min:1,qi:24,stones:6,herbs:0,effect:'petal'},
 {id:'sword',name:'Ngự kiếm',min:5,qi:70,stones:20,herbs:2,effect:'sword'},
 {id:'lotus',name:'Thanh Ngọc',min:30,qi:220,stones:60,herbs:6,effect:'lotus',artifact:'jade'},
 {id:'vase',name:'Tụ Linh',min:99,qi:720,stones:180,herbs:16,effect:'lotus',artifact:'spirit-vase'},
 {id:'chung',name:'Trấn Hồn',min:199,qi:1600,stones:360,herbs:30,effect:'dragon',artifact:'soul-bell'},
 {id:'cauldron',name:'Càn Khôn',min:499,qi:4400,stones:800,herbs:60,effect:'dragon',artifact:'cosmic-cauldron'},
 {id:'storm-sword',name:'Cửu Thiên',min:999,qi:10000,stones:1600,herbs:120,effect:'dragon',artifact:'vip-storm-sword'},
 {id:'dragon-orb',name:'Long Phượng',min:2999,qi:36000,stones:4400,herbs:300,effect:'dragon',artifact:'vip-dragon-orb',skin:'ivory-celestial'},
 {id:'heaven-seal',name:'Thiên Đế',min:9999,qi:140000,stones:13000,herbs:800,effect:'dragon',artifact:'vip-heaven-seal',skin:'azure-patron'}
]);
// Resource rewards scale with the actual unit price above 30 coins.
// A combo multiplies resources, but never duplicates permanent equipment.
export function giftReward(coins,gifts=GIFT_TIERS){
 const tier=[...gifts].sort((a,b)=>b.min-a.min).find(g=>coins>=g.min)||gifts[0];
 const factor=coins>=30?coins/tier.min:1;
 return {tier,qi:Math.round(tier.qi*factor),stones:Math.round(tier.stones*factor),herbs:Math.round(tier.herbs*factor)};
}
