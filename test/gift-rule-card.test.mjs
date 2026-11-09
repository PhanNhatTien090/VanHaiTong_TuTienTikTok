import {test} from 'node:test';import assert from 'node:assert/strict';
import {giftRules,giftRuleHTML,RACE_TRUONG_PER_COIN,WAR_TRUONG_PER_COIN} from '../public/gift-rule-card.js';
import {GIFT_RACE_PER_COIN} from '../sword-race.mjs';
import {WAR,TRUONG_PER_POINT} from '../sect-war.mjs';
const now=1e12;
test('thẻ luật quà: đúng sự kiện, số khớp server, ảnh quà thật, không ghi coin',async()=>{
 assert.equal(RACE_TRUONG_PER_COIN,GIFT_RACE_PER_COIN);assert.equal(WAR_TRUONG_PER_COIN,Math.round(WAR.giftUnitsPerCoin*WAR.unit*TRUONG_PER_POINT));
 const cases=[[{},'default'],[{raceStatus:{phase:'running'}},'race'],[{sectWar:{active:true,phase:'running'}},'war'],[{alchemy:{active:true,phase:'brewing'}},'alchemy'],[{flowerEvent:{kind:'meteor',startedAt:0,endsAt:2e12}},'flower'],[{opportunity:{startedAt:0,endsAt:2e12,costs:[10]}},'opportunity'],[{petEvent:{active:true,rules:[{name:'Kim Vũ Phượng',coins:100},{name:'Kỳ Lân',coins:200}]}},'pets']];
 for(const [s,kind] of cases){const r=giftRules({...s,serverNow:now});assert.equal(r.kind,kind);const html=giftRuleHTML(r,{});
  if(r.rows.length)assert.match(html,/<img class="gift-ico" src="\/assets\/gifts\/[a-z-]+\.png"/);assert.doesNotMatch(html,/coin/i);}
 assert.equal(giftRules({visitor:{startedAt:0,endsAt:2e12},serverNow:now}),null,'tiên nhân đã có bảng skin riêng');
 const d=giftRules({sectWar:{active:false,phase:'finished'},serverNow:now});assert.equal(d.kind,'default');
 const {MASTER_COINS}=await import('../master-rewards.mjs');const master=d.rows.find(r=>/TÔNG CHỦ/.test(r[1]));assert.ok(master&&master[0]>=MASTER_COINS);assert.match(giftRuleHTML(d,{}),/crown.png/);assert.doesNotMatch(giftRuleHTML(d,{}),/×4/);assert.ok(d.rows.some(r=>r[0]>=500&&/ĐẠI LỄ/.test(r[1])));assert.ok(!d.rows.some(r=>/Phượng hoàng/.test(r[1])),'09/11: bỏ chữ Phượng hoàng cho thẻ gọn');
});
