import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {luyenHuState,drawLuyenHuAwakening,LUYEN_HU_DURATION,LUYEN_HU_REVEAL} from '../public/luyen-hu-awakening.js';
import {LH_TIMING as T,LH_RIFTS,LH_MIRROR_CELLS,luyenHuFormationState,luyenHuShardGrid,lhMirrorSlot,lhClonePos,lhCloneBreak} from '../public/luyen-hu-formation.js';
import {LUYEN_HU_SCORE,luyenHuMusicDuck} from '../public/luyen-hu-audio.js';
import {breakthroughDuration} from '../public/breakthrough-fx.js';
const at=s=>luyenHuFormationState(s,1600,true);
test('Luyện Hư v2: thời lượng giữ 20,8 s, đổi skin sau nổ, các nhịp đi đúng thứ tự nhân quả',()=>{
 assert.equal(breakthroughDuration({toRealm:6}),20800);assert.equal(LUYEN_HU_DURATION,20800);assert.ok(breakthroughDuration({toRealm:7})>20800);
 assert.equal(LUYEN_HU_REVEAL,17.55);assert.ok(T.absorbed<T.impact&&T.impact<T.reveal);
 assert.equal(luyenHuState(17.54/20.8).revealed,false);assert.equal(luyenHuState(17.56/20.8).revealed,true);
 assert.equal(at(.05).crack,0);assert.ok(at(1).crack>.5,'vết nứt lan nhanh ngay đầu cảnh');assert.equal(at(2.39).shatter,0);assert.ok(at(4.5).shatter>.99);
 assert.equal(at(4.7).gather,0);assert.ok(at(6.5).gather>.99);assert.ok(at(10.4).clones.every(x=>x>.99),'8 phân thân đứng đủ trước nhát rách đầu');
 assert.equal(at(12.7).eye,0);assert.ok(at(14).eye>.99);assert.ok(at(16.2).rewind>.99&&at(16.2).eye===0);
 assert.equal(at(17.2).blast,0);assert.ok(at(17.9).blast>0);assert.equal(at(20.8).fade,0);
 assert.deepEqual(at(10),at(10));assert.equal(luyenHuFormationState(5,1600,false).clock,0);
 // mỗi nhát rách làm vỡ đúng một cặp phân thân, sau khi chạm
 for(let k=0;k<8;k++){assert.equal(lhCloneBreak(k,at(LH_RIFTS[Math.floor(k/2)]+.19)),0);assert.equal(lhCloneBreak(k,at(LH_RIFTS[Math.floor(k/2)]+1)),1);}
});
test('lưới mảnh vỡ: cạnh nứt dùng chung giữa 2 mảnh kề, 8 gương, vị trí gương/phân thân nằm trong khung',()=>{
 const g=luyenHuShardGrid(1600);assert.equal(g.cells.length,37);assert.equal(g.cells.filter(c=>c.ring===1&&LH_MIRROR_CELLS.includes(c.i)).length,8);
 const count=new Map();for(const cell of g.cells)cell.pts.forEach((a,k)=>{const b=cell.pts[(k+1)%cell.pts.length],key=[a,b].map(p=>p.map(v=>v.toFixed(3)).join(',')).sort().join('|');count.set(key,(count.get(key)||0)+1);});
 assert.ok([...count.values()].every(n=>n<=2),'mỗi cạnh nứt thuộc tối đa 2 mảnh');assert.ok([...count.values()].filter(n=>n===2).length>100,'mảnh kề nhau khớp cạnh');
 const st=at(8);for(let k=0;k<8;k++){const m=lhMirrorSlot(k,st),c=lhClonePos(k,st);assert.ok(m.x>-50&&m.x<950&&m.y>0&&m.y<st.belly);assert.ok(c.x>40&&c.x<860);}
});
test('vẽ: ngoại hình cũ tới lúc đổi skin, khôi phục trạng thái canvas, không sửa sự kiện, khối lượng vẽ có giới hạn',()=>{
 const old=globalThis.document;globalThis.document={createElement:()=>createCanvas(1,1)};
 try{
  const p={id:'a',realm:5,gender:'nu'},e={id:'x',user:'a',name:'A',start:0,duration:20800,visualFrom:p,visualTo:{...p,realm:6}},before=JSON.stringify(e),seen=[];
  const scene={players:[p],motion:true,cameraEnabled:true,budget:{level:'light'},drawPlayer:(c,q)=>seen.push(q.realm)},c=createCanvas(900,1600).getContext('2d');
  let draws=0;const original=c.drawImage.bind(c);c.drawImage=(...a)=>{draws++;return original(...a);};
  for(const sec of [.5,3,7,9,11.4,13.6,15.4,16.8,17.3,18.2,20.5]){draws=0;const ui=drawLuyenHuAwakening(scene,c,e,sec*1000,1600);assert.equal(ui.realm,6);assert.equal(ui.subtitle,'Hư Không Khai Giới');assert.equal(ui.revealed,sec>=17.55);assert.ok(draws<140,'drawImage '+draws+' tại '+sec);assert.equal(c.globalAlpha,1);assert.equal(c.globalCompositeOperation,'source-over');}
  assert.deepEqual([...new Set(seen)],[5,6],'chỉ vẽ ngoại hình cũ rồi mới; cache theo sự kiện');assert.equal(JSON.stringify(e),before);
 }finally{globalThis.document=old;}
});
test('âm: nổ đúng mốc, mọi cue đột ngột là transient, nhạc nền lùi sâu nhất quanh cú nổ',()=>{
 assert.ok(LUYEN_HU_SCORE.some(c=>c.tag==='release-crack'&&c.at===T.impact&&c.transient));assert.ok(LUYEN_HU_SCORE.some(c=>c.tag==='first-crack'&&c.at===T.crack));
 for(const c of LUYEN_HU_SCORE){assert.ok(c.at>=0&&c.at<T.duration);if(['crack','thunder','glass','drum','rift-tear'].includes(c.tag)||c.kind==='crack')assert.equal(c.transient,true,c.tag);}
 assert.equal(LH_RIFTS.length,4);for(const r of LH_RIFTS)assert.ok(LUYEN_HU_SCORE.some(c=>c.tag==='rift-tear'&&c.at===r));
 assert.ok(luyenHuMusicDuck(17000)<luyenHuMusicDuck(5000));assert.equal(luyenHuMusicDuck(21000),1);
});
