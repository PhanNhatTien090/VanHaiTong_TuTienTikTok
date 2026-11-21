// 21/11/2026 tối: tab QUẢN LÝ DANH HIỆU — điều kiện từng danh hiệu, gán tay có thời hạn, gỡ, tìm người.
import {test} from 'node:test';import assert from 'node:assert/strict';
import {createWorld,ensurePlayer} from '../engine.mjs';
import {titleHolders,titleView} from '../titles.mjs';
import {TITLE_RULES,titleAdminView,titleAdminAction,findTitlePlayer} from '../title-admin.mjs';
import {TITLE_LIST} from '../public/title-data.js';
const N=1_800_000_000_000;
function world(){const w=createWorld('live');Object.assign(w.settings,{residents:false,autoEvents:false});
 for(const [id,name] of [['a','Đế giang'],['b','Tiểu Muội'],['c','Tiểu Muội Hai']])ensurePlayer(w,id,name,N);return w;}
test('mọi danh hiệu đều có điều kiện + thời hạn giữ cho trang quản lý',()=>{
 for(const t of TITLE_LIST){assert.ok(TITLE_RULES[t.key]?.rule,t.key);assert.ok(TITLE_RULES[t.key]?.keep,t.key);}
 const v=titleAdminView(world(),N);assert.equal(v.titles.length,TITLE_LIST.length);assert.ok(v.titles.every(t=>Array.isArray(t.holders)));
});
test('gán tay có hạn: hiện trên đầu ngay, hết hạn tự mất; gán lại thay dòng cũ',()=>{
 const w=world();const r=titleAdminAction(w,{action:'grant',key:'kiem-khoi',who:'đế giang',minutes:60},N);assert.equal(r.ok,true,r.message);
 assert.ok(titleHolders(w,N).get('kiem-khoi').has('a'));assert.equal(titleView(w,w.players.a,N).key,'kiem-khoi');
 const row=titleAdminView(w,N).titles.find(t=>t.key==='kiem-khoi').holders.find(h=>h.id==='a');assert.equal(row.source,'grant');assert.equal(row.until,N+3600000);
 assert.ok(!titleHolders(w,N+3600001).get('kiem-khoi').has('a'),'hết hạn tự mất');
 titleAdminAction(w,{action:'grant',key:'kiem-khoi',who:'a',minutes:0},N+10);assert.equal(w.titleGrants.filter(g=>g.key==='kiem-khoi'&&g.id==='a').length,1);
 assert.ok(titleHolders(w,N+1e12).get('kiem-khoi').has('a'),'0 phút = vĩnh viễn');
});
test('gỡ chỉ gỡ danh hiệu gán tay; không đeo ngay thì giữ lựa chọn cũ',()=>{
 const w=world();titleAdminAction(w,{action:'grant',key:'lam-mom',who:'a',minutes:30,wear:false},N);assert.equal(w.players.a.titlePick,undefined);
 assert.equal(titleAdminAction(w,{action:'revoke',key:'lam-mom',id:'a'},N+1).ok,true);assert.ok(!titleHolders(w,N+5000).get('lam-mom').has('a'));
 assert.equal(titleAdminAction(w,{action:'revoke',key:'lam-mom',id:'a'},N+2).ok,false);
});
test('tìm người: trùng nhiều → trả danh sách chọn; id/tên đúng → chọn thẳng',()=>{
 const w=world();const r=titleAdminAction(w,{action:'grant',key:'dau-sat',who:'tiểu muội',minutes:30},N);
 assert.equal(r.ok,true,'tên đúng hẳn "Tiểu Muội" được chọn dù có "Tiểu Muội Hai"');assert.ok(titleHolders(w,N).get('dau-sat').has('b'));
 const amb=findTitlePlayer(w,'muội');assert.ok(!amb.player);assert.equal(amb.candidates.length,2);
 assert.equal(titleAdminAction(w,{action:'grant',key:'nope',who:'a',minutes:1},N).ok,false);
 assert.equal(titleAdminAction(w,{action:'grant',key:'dau-sat',who:'không ai',minutes:1},N).ok,false);
});
test('trận thách Trưởng Lão trên Lôi Đài không trao nhầm Lôi Đài Bá Chủ',()=>{
 const w=world();w.players.a.arenaTitle='Lôi Đài Bá Chủ';w.arena={phase:'closed',champion:'a',closedAt:N,hall:{index:0}};
 assert.ok(!titleHolders(w,N+1).get('loi-dai-ba-chu').has('a'));
});
