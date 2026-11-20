import test from 'node:test';
import assert from 'node:assert/strict';
import {SO_LENH,soLenhPage,forceSoLenh,soLenhForced,soLenhHTML,_resetSoLenh,BOARD_CYCLE_MS,FORCE_MS} from '../public/so-lenh.js';
import {hallsRankHTML} from '../public/ngu-duong-ui.js';
import {HINT_MAX,tanDeTuHint} from '../public/tan-de-tu.js';
import {IDLE_LINES} from '../public/idle-lines.js';
import {missingText} from '../engine.mjs';
import fs from 'node:fs';

const esc=s=>String(s);
test('sổ lệnh gọn: mỗi trang ≤4 dòng, lệnh số lõi 1–9 đều có mặt đúng việc',()=>{
 for(const p of SO_LENH){assert.ok(p.rows.length<=4,p.id);assert.match(p.title,/^SỔ LỆNH · /);}
 const nums=Object.fromEntries(SO_LENH.flatMap(p=>p.rows).filter(([k])=>/^\d$/.test(k)));
 assert.deepEqual(Object.keys(nums).sort(),['1','2','3','4','5','6','7','8','9']);
 assert.match(nums['1'],/tu luyện/);assert.match(nums['8'],/đột phá/);assert.match(nums['6'],/cơ duyên/);
});

test('cuộn Thiên Bảng xoay: Thiên Bảng 20 s → Sổ lệnh 12 s → Ngũ Đường 8 s',()=>{
 _resetSoLenh();const state={halls:{thienBang:[{rank:1,name:'A',totalQi:1,realm:1}],halls:[{index:0,name:'Đan Đỉnh Đường',mark:'丹',color:'#f00',points:1}]},realms:['','Luyện Khí'],players:[]};
 const at=ms=>hallsRankHTML(state,esc,BOARD_CYCLE_MS*100+ms);
 assert.match(at(1000),/THIÊN BẢNG/);assert.match(at(25000),/SỔ LỆNH/);assert.match(at(35000),/NGŨ ĐƯỜNG/);
});

test('gõ lệnh thiếu điều kiện → đúng trang hiện ngay, hết 15 s thì thôi; chống dồn 8 s',()=>{
 _resetSoLenh();const t=1e12;
 assert.equal(forceSoLenh({user:'u',cmdFail:true,cmd:'ren',text:'Chưa đủ linh thạch'},t),'bao');
 assert.equal(soLenhPage(t+1000).id,'bao');assert.ok(soLenhForced(t+FORCE_MS-1));assert.equal(soLenhForced(t+FORCE_MS+1),false);
 assert.equal(forceSoLenh({user:'u',cmdFail:true,cmd:'hai'},t+2000),null);
 assert.equal(forceSoLenh({user:'u',cmdFail:true,cmd:'hai'},t+9000),'dan');
 assert.equal(forceSoLenh({user:'u',gift:true,cmdFail:true,cmd:'ren'},t+30000),null);
 assert.match(soLenhHTML(SO_LENH[0],esc),/sl-key">1</);
});

test('nhãn trên sân tối đa 4; chữ gợi ý cùng một kiểu "Gõ <số>"',()=>{
 assert.equal(HINT_MAX,4);
 assert.equal(tanDeTuHint({realm:0,qi:0}),'Gõ 1 · nhập môn');
 assert.equal(tanDeTuHint({realm:1,qi:200,neededQi:100,stones:5,neededStones:1}),'Gõ 8 · đột phá');
 assert.match(missingText({realm:0,qi:0,stones:0,realmCount:28}),/gõ 1/);
});

test('giọng nhắc: chỉ lệnh số đọc "gõ số …", không còn lệnh cũ/sự kiện cũ, có file mp3',()=>{
 for(const l of IDLE_LINES){assert.doesNotMatch(l.text,/gõ (nhập môn|tu vi|gợi ý)|Huyền Giao/i);assert.ok(fs.existsSync('public'+l.file),l.file);}
 assert.ok(IDLE_LINES.filter(l=>l.cta).every(l=>/gõ số (một|tám|chín|sáu)/.test(l.text)));
});
