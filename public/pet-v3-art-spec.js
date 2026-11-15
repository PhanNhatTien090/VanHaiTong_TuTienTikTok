// Vân Hải Tông 3.0 - TRUE BODY REDRAW art contract, not V2 overlays.
// Remains wholly inactive until all independent pose atlases are manually reviewed.
import {ALL_PETS} from './spirit-pets.js';
import {PREMIUM_PET_PERIODS} from './premium-pet-motion.js';
export const PET_V3_ART_VERSION='true-form-v1';
export const PET_V3_ART_APPROVED=false;
export const PET_V3_STAGES=Object.freeze([1,2,3]);
export const PET_V3_POSE_IDS_BASIC=Object.freeze(['rest','breath','anticipate']);
export const PET_V3_POSE_IDS_PREMIUM=Object.freeze(['rest','breath-up','anticipate','lean','step','release','recovery','settle']);
const SPECIES=Object.freeze({
 'jade-rabbit':{
  identity:'Thỏ trắng ngọc, tai cực dài viền ngọc lục, mắt xanh và đuôi bông ngắn; luôn có cơ thể và chân sau của thỏ, tuyệt đối không phải cáo hay sói.',
  stages:[
   'Thỏ trưởng thành, thân dài hơn, hai chân sau cao và khỏe, tai rộng dựng lên, đuôi tròn nhỏ, dáng ngồi vững.',
   'Nguyệt Thố linh hóa: cổ thanh thoát, chân sau phát triển rõ khớp gối và cổ chân, tai ánh nguyệt, hoa văn mọc trên lông; đuôi vẫn tròn ngắn.',
   'Nguyệt Thần Thố: thỏ thần toàn thân với đôi tai siêu dài, vóc dáng thỏ cao quý, bốn chân đầy đủ, bờm nguyệt mềm; tuyệt đối không có chín đuôi hay đuôi cáo.'
  ],
  prohibit:['fox tail','canine paws','wolf torso','nine tails']
 },
 'ember-fox':{
  identity:'Hồ ly đỏ cam, mõm cáo nhọn, tai tam giác, đuôi mềm, màu lửa đỏ cam.',
  stages:[
   'Hồ ly lớn với cổ vươn dài, chân săn chắc và đuôi lửa dày rõ.',
   'Cửu Hỏa Hồ: ngực và bờm lớn hơn, năm đuôi lông lửa phát triển từ gốc đuôi, thân hình điềm tĩnh hơn.',
   'Thiên Hồ cửu diễm: chín đuôi riêng biệt, vai cao, chân mạnh và đầu hồ ly trưởng thành; đuôi là lông thật chứ không chỉ vệt sáng.'
  ],
  prohibit:['dog','rabbit ears','single flame swirl pretending to be nine tails']
 },
 'frost-tiger':{
  identity:'Hổ trắng sọc lam, đầu mèo lớn, bốn chân hổ, đuôi dài sọc băng.',
  stages:[
   'Hổ bạch trưởng thành, vai rộng, chân đầy cơ bắp, đầu lớn hơn và răng nanh rõ.',
   'Thánh hổ băng tinh: bờm băng mềm mọc tự nhiên quanh cổ, sọc hổ hóa thành mảng băng trên lông, móng sắc.',
   'Băng Hoàng Hổ: hổ khổng lồ có trán rộng, giáp băng tự nhiên trên vai, vai cao và bốn chân lớn, mõm hổ dữ dội.'
  ],
  prohibit:['wolf muzzle','human armor over same tiger body']
 },
 'sun-phoenix':{
  identity:'Phượng hoàng vàng, mỏ chim, mào vàng, cánh hai bên, hai chân chim, lông đuôi dài.',
  stages:[
   'Chim phượng trưởng thành, cổ thon, cánh lớn và lông bay phân lớp rõ ràng.',
   'Phượng Kim Dương: mọc mào thái dương, cánh chồng lớp lông vàng, ba dải đuôi vũ dài có cấu trúc lông.',
   'Kim Dương Thần Phượng: phượng hoàng hoàng kim khổng lồ, bờm lông đầu và cánh mở to, đuôi thần điểu thực thể.'
  ],
  prohibit:['red-dominant crimson phoenix palette','dragon morphology']
 },
 'astral-dragon':{
  identity:'Thần long Á Đông thân rắn dài, sừng phân nhánh, râu dài, vuốt rồng, sắc tím ngân hà.',
  stages:[
   'Rồng trưởng thành với đầu có gờ sừng, vảy lớn, thân dài và nhiều đoạn uốn rõ ràng.',
   'Tinh Long: thân rồng dày hơn, gờ sống lưng tạo từ vảy, sừng chẻ nhánh, vảy ánh sao bám trên cơ thể.',
   'Thái Cổ Tinh Long: thần long nhiều khúc cuộn lớn, vây sống lưng và sừng cổ đại, bàn chân/long trảo rõ.'
  ],
  prohibit:['western winged dragon body','ribbon of stars without scales']
 },
 'loi-oa':{
  identity:'Lôi Oa là CÓC SÉT: thân tròn thấp, đầu rộng, mắt lồi cao, chân cóc ngắn, da tím sẫm.',
  stages:[
   'Cóc sét trưởng thành có thân bè rộng hơn, chân sau khỏe, mắt lồi và da lưng sần thật.',
   'Thiên Lôi Oa: nhiều mấu lôi tinh mọc từ da, cổ họng túi sét lớn, đầu bành rộng và chân có màng.',
   'Lôi Oa Vương: thần cóc cổ đại hùng vĩ, bụng rộng, giáp sần mọc theo giải phẫu, chân sau đồ sộ, không có sừng rồng.'
  ],
  prohibit:['dragon head','horned lizard','frog turned into a tiger']
 },
 'van-thu':{
  identity:'Muỗi thú huyết khí: đầu côn trùng, vòi dài, mắt lớn, thân đốt, chân mảnh sáu chân và cánh màng.',
  stages:[
   'Muỗi thú trưởng thành, vòi nhọn dài, ngực tách rõ ba đốt, chân côn trùng mở rộng và hai cánh dài.',
   'Huyết Văn: bụng đốt lớn hơn, các gân cánh huyết tinh, thêm bướu giáp thực thể quanh ngực.',
   'Huyết Văn Thú Vương: muỗi thần khổng lồ, bộ cánh bốn phiến màng phát triển, bụng dài nhiều đốt và sáu chân sắc.'
  ],
  prohibit:['dragonfly without proboscis','bird legs','human limbs']
 },
 'ky-lan':{
  identity:'Kỳ Lân Đông Á đầu thú linh, sừng nai, bờm lửa, vảy vàng đỏ, bốn vó.',
  stages:[
   'Kỳ Lân trưởng thành, chân dài khỏe, một sừng chính phân cành và bờm hỏa lớn.',
   'Thánh Kỳ Lân: gạc phân nhánh đa tầng, vảy mọc đều trên vai hông, móng linh thú và bờm dày.',
   'Thái Dương Kỳ Lân: thần thú có cổ cao, gạc đa nhánh cổ đại, thân vảy vàng lớn, vó lửa có cấu trúc.'
  ],
  prohibit:['horse without qilin scales','dragon body']
 },
 'bach-nguyet-ho':{
  identity:'Cửu Vĩ hồ ly trắng băng, tai cáo, mõm dài, chín đuôi có gốc rõ, mắt xanh ngọc.',
  stages:[
   'Cửu vĩ hồ trưởng thành với vai cao, chân dài và chín đuôi nhiều lớp lông.',
   'Nguyệt Đế Hồ: lông dài hơn quanh cổ, chín đuôi tỏa thành quạt rõ, hình thể cáo thanh thoát.',
   'Bạch Nguyệt Cửu Vĩ Bản Mệnh: linh hồ thần băng ngân, cơ thể cáo cao lớn, đuôi chín nhánh dày thật.'
  ],
  prohibit:['rabbit ears','dragon horns','single cloud tail divided by effects']
 },
 'ngoc-chau-long':{
  identity:'Thiên long màu ngọc bích, thân rồng Á Đông, vây thủy, râu, sừng và vảy, bay trên mây.',
  stages:[
   'Rồng ngọc trưởng thành với thân dài hơn, vảy lớn và râu dài thành đôi.',
   'Thương Hải Long: sừng san hô ngọc, vây trải từ sống lưng, thân nhiều khúc rõ vảy.',
   'Thương Hải Ngọc Long Bản Mệnh: thần long đại dương rộng lớn, vây nước hình lá lớn, long trảo rõ.'
  ],
  prohibit:['sea serpent with no dragon head','western dragon']
 },
 'xich-ha-phuong':{
  identity:'Thiên phượng đỏ thẫm hồng, mỏ chim, hai cánh, chân chim và đuôi lông dài.',
  stages:[
   'Thiên phượng trưởng thành, sải cánh rộng, đuôi lông đỏ nhiều lớp.',
   'Xích Hà Phượng: bộ mào như trâm hồng, cánh dài dạng lông thật, lông đuôi như dải bình minh.',
   'Xích Hà Thiên Phượng Bản Mệnh: phượng hoàng đỏ thẫm với thân chim uy nghi, cánh ba tầng, lông đuôi hỏa đỏ.'
  ],
  prohibit:['gold-dominant sun-phoenix palette','dragon head']
 },
 'tu-nguyet-lan':{
  identity:'Ngọc lân tím trắng, đầu linh thú bốn vó, sừng ngọc tím, vảy mềm và bờm tự nhiên.',
  stages:[
   'Ngọc lân cao lớn, hai cặp chân khỏe, đầu dài và cặp sừng bậc thấp.',
   'Tử Nguyệt Thánh Lân: sừng phân nhánh, vảy ngọc ánh tím chạy dọc vai và chân, bờm trăng dài.',
   'Tử Nguyệt Ngọc Lân Bản Mệnh: thần lân hình thể trưởng thành, sừng nguyệt phân nhiều nhánh, vảy cổ đại và chân vững.'
  ],
  prohibit:['white nine-tail fox','same silhouette as Kỳ Lân']
 },
 'hac-tinh-ho':{
  identity:'Hắc Tinh Linh Hổ là HỔ đen tím sọc sao, mõm hổ, bốn chân lớn, đuôi hổ.',
  stages:[
   'Hắc hổ trưởng thành, vai cao, hàm lớn, sọc tím ánh sao và cơ bắp.',
   'Thánh Hắc Tinh Hổ: vằn tinh tú mọc từ lớp lông, vuốt lớn, bờm hổ thiên thể.',
   'Hắc Tinh Hổ Vương: đại hổ đen thân khỏe, đầu lớn, sọc ngân hà chạy dọc thân và chân to.'
  ],
  prohibit:['wolf body','tiger disguised as dragon']
 }
});
export const PET_V3_SPECIES=SPECIES;
export const PET_V3_ASSETS=Object.freeze(ALL_PETS.flatMap(p=>{
 const premium=Object.hasOwn(PREMIUM_PET_PERIODS,p.id);
 return PET_V3_STAGES.map(stage=>Object.freeze({
   id:p.id,name:p.name,stage,type:'true-body-redraw',
   frames:premium?8:3,cols:premium?4:3,rows:premium?2:1,
   cellSize:256,
   poseIds:premium?PET_V3_POSE_IDS_PREMIUM:PET_V3_POSE_IDS_BASIC,
   path:'/assets/spirit-pets-v3/true-forms/'+p.id+'/stage-'+stage+'-'+PET_V3_ART_VERSION+'.webp',
   bodyBrief:SPECIES[p.id]?.stages[stage-1],
   identity:SPECIES[p.id]?.identity,
   prohibit:SPECIES[p.id]?.prohibit
 }));
}));
export const PET_V3_TOTAL_POSES=PET_V3_ASSETS.reduce((acc,a)=>acc+a.frames,0);
export const petV3Asset=(id,stage)=>PET_V3_ASSETS.find(x=>x.id===id&&x.stage===stage)||null;
// Keep completely separate from V2 until comprehensive artist review and LIVE QA.
export const petV3CanDisplay=()=>PET_V3_ART_APPROVED===true;
