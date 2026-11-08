import {test} from 'node:test';import assert from 'node:assert/strict';
import {MT,MA_THAN_DURATION,MT_CHAINS,MT_SNAPS,MT_SHARDS,maThanState,maThanHits} from '../public/ma-than-awakening.js';
import {MA_THAN_SCORE,maThanMusicDuck} from '../public/ma-than-audio.js';
import {ascensionProfile} from '../public/ascension-art.js';
test('Ma Thần dài hơn Hồng Mông 1–2 s, nổ trước rồi mới đổi skin, nhịp theo đúng thứ tự kịch bản',()=>{
 assert.equal(ascensionProfile(22).duration,MA_THAN_DURATION);const diff=MA_THAN_DURATION-ascensionProfile(21).duration;assert.ok(diff>=1000&&diff<=2000,'chênh '+diff);
 assert.ok(ascensionProfile(23).duration>MA_THAN_DURATION);
 const order=['moon','eclipse','cracks','chains','bound','face','eyes','roar','snap','freed','halberd','plant','shards','armor','horns','horned','dive','absorbed','converge','dark','impact','reveal','fade'];
 for(let i=1;i<order.length;i++)assert.ok(MT[order[i]]>MT[order[i-1]],order[i]+' sau '+order[i-1]);
 assert.ok(MT.reveal>MT.impact&&MT.reveal-MT.impact<.5);assert.equal(MT_CHAINS.length,9);assert.equal(MT_SNAPS.length,9);assert.equal(MT_SHARDS.length,12);
 assert.ok(MT_SNAPS.at(-1)<MT.freed&&MT_CHAINS.at(-1)<MT.bound);
 assert.equal(maThanState(MT.impact/MT.duration-.001).revealed,false);assert.equal(maThanState(MT.reveal/MT.duration+.001).revealed,true);
 const hits=maThanHits();assert.equal(Math.max(...hits.map(h=>h[1])),hits.find(h=>h[0]===MT.impact)[1],'cú nổ là cú mạnh nhất');
});
test('âm Ma Thần: mọi cue nằm trong cảnh, cue ngắn đánh dấu transient, nhạc nền nhường chỗ tới sau nổ',()=>{
 assert.ok(MA_THAN_SCORE.length>200);for(const cue of MA_THAN_SCORE){assert.ok(cue.at>=0&&cue.at+cue.len<=MT.duration+.5,cue.tag+' @'+cue.at);assert.ok(cue.level>0&&cue.level<.5,cue.tag);}
 for(const tag of ['heart-lub','chain-link','roar','snap','bolt-crack','release-crack'])assert.ok(MA_THAN_SCORE.some(c=>c.tag===tag&&c.transient),tag);
 assert.ok(MA_THAN_SCORE.some(c=>c.tag==='release-crack'&&Math.abs(c.at-MT.impact)<.01));
 assert.equal(maThanMusicDuck(10000),.08);assert.equal(maThanMusicDuck(46000),1);
});
