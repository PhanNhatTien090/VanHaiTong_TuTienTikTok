const fs=require('fs');
// immortal-rituals: thay test Chân Tiên cũ (9 bậc, ngọc) bằng test v4; helper ảnh realm 8 = chanTienActor
let s=fs.readFileSync('test/immortal-rituals.test.mjs','utf8');
const a=s.indexOf("test('Chan Tien has nine sequential steps"),b=s.indexOf("test('both rituals preserve");if(a<0||b<0)throw Error('anchors');
s=s.slice(0,a)+`test('Chân Tiên v4: 31,6 s, 3 đợt kiếp, ngũ linh căn, Tiên Môn, phi thăng, tiên châu nhập thể rồi mới đổi skin',async()=>{
 const {CT_TIMING:CT,CT_WAVE1,CT_WAVE2,chanTienFormationState,ctBoltAt,rootSlot}=await import('../public/chan-tien-formation.js');const at=t=>chanTienFormationState(t,1600,true);
 assert.equal(breakthroughDuration({toRealm:8}),31600);assert.equal(chanTienState(27.59/31.6).revealed,false);assert.equal(chanTienState(27.61/31.6).revealed,true);
 assert.ok(CT.absorbed<CT.impact&&CT.impact<CT.reveal);for(const w of [...CT_WAVE1,...CT_WAVE2,CT.column])assert.ok(ctBoltAt(w+.02).p>.5,'sét tại '+w);
 assert.equal(at(6.9).rootsRise[0],0);assert.ok(at(9.2).rootsRise.every(x=>x>.99));assert.ok(at(10.5).morph>.99);assert.ok(at(17).merge>.99);
 assert.ok(at(18.5).gate>.99);assert.ok(at(19).beam>.99);assert.ok(at(21.9).climb>.9);assert.ok(at(23.5).heaven>.99);
 assert.ok(Math.abs(at(CT.absorbed-.01).pearlTravel-1)<.02,'tiên châu tới đan điền trước nổ');assert.equal(at(31.6).fade,0);assert.equal(chanTienState(.6,1600,false).motion,false);
 for(let i=0;i<5;i++){const p=rootSlot(i,at(10));assert.ok(p.x>200&&p.x<700&&p.y>0);}
});
`+s.slice(b);
s=s.replace("assert.ok((realm===7?scene.daiThuaActor:scene.hoaThanActor).frames.size<=2);","assert.ok((realm===7?scene.daiThuaActor:scene.chanTienActor).frames.size<=2);");
fs.writeFileSync('test/immortal-rituals.test.mjs',s);
// chan-tien-cinema: bỏ test đồng hồ cinematic cũ của Chân Tiên v3; giữ test prelude và cinematic-world (Huyền Tiên dùng)
let t=fs.readFileSync('test/chan-tien-cinema.test.mjs','utf8');
const c=t.indexOf("test('cinema adds six seconds"),d=t.indexOf("test('near objects accelerate");if(c<0||d<0)throw Error('cinema anchors');
t=t.slice(0,c)+t.slice(d);t=t.replace("import {chanTienState} from '../public/chan-tien-awakening.js';\n","");fs.writeFileSync('test/chan-tien-cinema.test.mjs',t);
console.log('tests patched');
