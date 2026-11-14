import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {guardianTribulationState} from '../public/guardian-tribulation-v3.js';
import {inventoryDeckHTML,safeInventoryArt,InventoryDeck} from '../public/inventory-multi.js';
import {bagCard} from '../inventory.mjs';

const esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
test('all newly illustrated VFX are local, transparent SVGs with no external execution',()=>{
 for(const name of ['celestial-seal','celestial-impact','void-rift','crystal-blue','crystal-violet','crystal-gold','heart-spark']){
  const src=readFileSync(new URL('../public/assets/vfx-v35/'+name+'.svg',import.meta.url),'utf8');
  assert.match(src,/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(src,/<\/svg>$/);
  assert.doesNotMatch(src,/<script\b|<foreignObject\b|onload\s*=|https?:\/\/[^"]+\.(?:js|png)/i);
 }
});
test('inventory art is restricted to local assets and shows player items using actual catalog icons',()=>{
 assert.equal(safeInventoryArt({icon:'sword'},'artifact'),'/assets/ui-inventory/sword.svg');
 assert.equal(safeInventoryArt({icon:'bell'},'artifact'),'/assets/ui-inventory/bell.svg');
 assert.equal(safeInventoryArt({art:'https://evil.example/steal.png',icon:'orb'},'artifact'),'/assets/ui-inventory/orb.svg');
 assert.equal(safeInventoryArt({art:'assets/x.png'},'artifact'),'/assets/x.png');
 const player={stones:1234,herbs:22,equipped:'jade',equippedExtra:['orb'],artifacts:['jade','orb'],pills:{'qi-pill':2},manuals:['breath']};
 const catalog=[
  {id:'jade',name:'Thanh Ngọc Kiếm',icon:'sword',damage:8},
  {id:'orb',name:'Tinh Hà Châu',icon:'orb',damage:22,bonus:.2},
  {id:'qi-pill',name:'Tụ Khí Đan',icon:'pill'},
  {id:'breath',name:'Thanh Tâm Quyết',icon:'scroll',bonus:.15}
 ];
 const card=bagCard(player,catalog);
 assert.equal(card.equipped.id,'jade');
 assert.equal(card.secondaryEquipped,1);
 const html=inventoryDeckHTML({name:'Hỏa & <script>',card},esc);
 assert.match(html,/Thanh Ngọc Kiếm/);
 assert.match(html,/CHỦ PHÁP BẢO/);
 assert.match(html,/TRỢ PHÁP BẢO/);
 assert.match(html,/crystal\.svg/);
 assert.doesNotMatch(html,/<script>/);
});
test('inventory deck caps to 4 unique owners and removes stale event cards',()=>{
 const now=performance.now();
 const container={hidden:true,dataset:{},children:[],replaceChildren(){},set innerHTML(value){this.markup=value;},get innerHTML(){return this.markup;}};
 const deck=new InventoryDeck(container,{},esc);
 const bag={kind:'bag',stones:0,herbs:0,artifacts:{items:[],more:0},pills:{items:[],more:0},manuals:{items:[],more:0}};
 for(let i=0;i<6;i++)deck.show({user:'p'+i,name:'Player '+i,card:bag},null,now+i*10);
 assert.equal(deck.cards.length,4);
 assert.equal(deck.cards[0].user,'p2');
 deck.show({user:'p5',name:'Latest',card:bag},null,now+65);
 assert.equal(deck.cards.length,4);
 assert.equal(deck.cards.filter(c=>c.user==='p5').length,1);
 deck.clear();
 assert.equal(deck.cards.length,0);
 assert.equal(container.hidden,true);
});
test('guardian ritual only triggers for real helper IDs at major realm, and impact fades',()=>{
 assert.equal(guardianTribulationState({toRealm:5,guardHelpers:['a']},.55).active,false);
 assert.equal(guardianTribulationState({toRealm:6,guardHelpers:[]},.55).active,false);
 const o=guardianTribulationState({toRealm:10,guardHelpers:['a','b','c','d']},.6);
 assert.equal(o.active,true);
 assert.deepEqual(o.helpers,['a','b','c']);
 assert.ok(o.energy>0&&o.shield>0);
 assert.equal(guardianTribulationState({toRealm:10,guardHelpers:['a']},1).energy,0);
});
