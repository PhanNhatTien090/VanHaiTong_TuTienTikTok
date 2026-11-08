import {test} from 'node:test';import assert from 'node:assert/strict';
import {giftFor,giftTokenHTML,safeGiftUrl} from '../public/gift-icons.js';
import {createWorld,ingest,snapshot} from '../engine.mjs';
const N=1800000000000,U='https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/abc~tplv-obj.png';
test('bảng sự kiện dùng ảnh quà thật × số lượng, không ghi số coin; chỉ nhận ảnh tiktokcdn',()=>{
 const art={'Trái tim':{coins:100,url:U},'Vương miện':{coins:500,url:U}};
 assert.deepEqual([giftFor(art,300).name,giftFor(art,300).count],['Trái tim',3]);assert.equal(giftFor(art,500).name,'Vương miện');
 assert.match(giftTokenHTML(art,300),/<img class="gift-ico"[^>]+> ×3$/);assert.doesNotMatch(giftTokenHTML(art,300),/coin|300/);
 assert.equal(giftFor({},200).name,'Baglama');assert.equal(giftFor({},300).count,3);
 for(const c of [100,200,300,500])assert.match(giftTokenHTML({},c),/^<img class="gift-ico" src="\/assets\/gifts\/[a-z-]+\.png"/);
 assert.equal(giftFor(art,200).name,'Baglama');assert.equal(giftFor({},500).name,'Money Gun');assert.equal(safeGiftUrl('https://evil.example/x.png'),null);
});
test('quà từ TikFinity được ghi ảnh vào thế giới và gửi xuống overlay',()=>{
 const w=createWorld('live');ingest(w,{event:'gift',data:{userId:'u1',uniqueId:'u1',nickname:'A',giftName:'Trái tim',diamondCount:100,repeatCount:1,giftType:2,giftPictureUrl:U,msgId:'m1'}},N);
 assert.equal(w.giftArt?.['Trái tim']?.url,U);assert.equal(snapshot(w,N).giftArt?.['Trái tim']?.coins,100);
});
