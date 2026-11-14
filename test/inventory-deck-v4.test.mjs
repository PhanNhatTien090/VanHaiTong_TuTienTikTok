import test from 'node:test';import assert from 'node:assert/strict';
import {InventoryDeck,DECK_LIMITS} from '../public/inventory-multi.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const bag=(n=0)=>({kind:'bag',stones:n,herbs:0,artifacts:{items:[{name:'Kiếm '+n,damage:10,on:true}],more:0},pills:{items:[],more:0},manuals:{items:[],more:0}});
const ev=(user,n=0)=>({user,name:'Đạo hữu '+user,card:bag(n)});
// DOM giả tối thiểu để kiểm phần thêm/bớt thẻ theo từng người.
function fakeDoc(){
 let created=0;
 const el=tag=>{const n={tag,children:[],parentNode:null,className:'',textContent:'',
  get lastElementChild(){return this.children.at(-1)||null;},
  get firstElementChild(){return this.children[0]||null;},
  set innerHTML(v){this.html=v;this.children=[];if(/<article/.test(v)){const c=el('article');c.html=v;c.parentNode=this;this.children.push(c);}},
  appendChild(c){c.remove?.();c.parentNode=this;this.children.push(c);return c;},
  insertBefore(c,ref){c.remove?.();c.parentNode=this;const i=ref?this.children.indexOf(ref):-1;i<0?this.children.push(c):this.children.splice(i,0,c);return c;},
  remove(){if(this.parentNode){const p=this.parentNode;p.children.splice(p.children.indexOf(this),1);this.parentNode=null;}},
  replaceWith(c){const p=this.parentNode;if(!p)return;const i=p.children.indexOf(this);p.children[i]=c;c.parentNode=p;this.parentNode=null;},
  querySelector(){return null;},getContext(){return null;}};created++;return n;};
 return {createElement:el,get created(){return created;}};
}
const container=()=>({hidden:true,dataset:{},children:[],get lastElementChild(){return this.children.at(-1)||null;},
 appendChild(c){c.remove?.();c.parentNode=this;this.children.push(c);return c;},
 insertBefore(c,ref){c.remove?.();c.parentNode=this;const i=ref?this.children.indexOf(ref):-1;i<0?this.children.push(c):this.children.splice(i,0,c);return c;}});

test('V4 túi đồ: người thứ 5+ vào hàng chờ theo thứ tự, mỗi người 1 chỗ, hiện badge chờ',()=>{
 const doc=fakeDoc(),box=container(),deck=new InventoryDeck(box,{},esc,{doc,observe:false});let t=1000;
 for(let i=0;i<7;i++)assert.equal(deck.show(ev('p'+i),null,t+=10),true);
 assert.deepEqual(deck.cards.map(x=>x.user),['p0','p1','p2','p3']);assert.deepEqual(deck.queue.map(x=>x.user),['p4','p5','p6']);
 deck.show(ev('p5',99),null,t+=10);assert.deepEqual(deck.queue.map(x=>x.user),['p4','p5','p6'],'gõ lại không chen hàng');assert.equal(deck.queue[1].event.card.stones,99,'nhưng nội dung được cập nhật');
 assert.equal(box.dataset.waiting,'3');assert.match(box.children.at(-1).textContent,/3 đạo hữu chờ/);assert.equal(box.children.length,5);
 deck.expire(t+DECK_LIMITS.ttl+1);assert.deepEqual(deck.cards.map(x=>x.user),['p4','p5','p6']);assert.equal(deck.queue.length,0);
 deck.clear();
});

test('V4 túi đồ: spam không giữ thẻ mãi, không gia hạn khi có người chờ',()=>{
 const deck=new InventoryDeck(container(),{},esc,{doc:fakeDoc(),observe:false}),t0=1000;
 deck.show(ev('spam'),null,t0);
 for(let t=t0;t<t0+60000;t+=2000){deck.expire(t);deck.show(ev('spam'),null,t);const c=deck.cards[0];assert.ok(c.until-c.shownAt<=DECK_LIMITS.maxHold,'một thẻ không giữ quá 2×TTL');}
 const busy=new InventoryDeck(container(),{},esc,{doc:fakeDoc(),observe:false});busy.show(ev('spam'),null,1000);for(let i=0;i<4;i++)busy.show(ev('o'+i),null,1001);
 busy.show(ev('spam'),null,5000);busy.expire(1000+DECK_LIMITS.ttl+1);assert.equal(busy.cards.some(x=>x.user==='spam'),false,'có người chờ thì phải nhường');
 busy.show(ev('spam'),null,1000+DECK_LIMITS.ttl+2);assert.equal(busy.queue.at(-1)?.user??busy.cards.at(-1).user,'spam','gõ lại thì xếp cuối');busy.clear();
 const d2=new InventoryDeck(container(),{},esc,{doc:fakeDoc(),observe:false});
 for(let i=0;i<5;i++)d2.show(ev('u'+i),null,1000);const before=d2.cards[0].until;
 d2.show(ev('u0'),null,5000);assert.equal(d2.cards[0].until,before,'đang có người chờ thì không gia hạn');
 d2.clear();
});

test('V4 túi đồ: đột phá/đấu đường đóng băng thời gian, xong cảnh mới chạy tiếp; tràn hàng thì đếm, không im lặng',()=>{
 const deck=new InventoryDeck(container(),{},esc,{doc:fakeDoc(),observe:false});
 deck.show(ev('a'),null,1000);deck.setPaused(true,2000);
 assert.equal(deck.expire(60000),false);assert.equal(deck.cards.length,1,'không hết hạn khi đang ẩn');
 deck.show(ev('b'),null,61000);deck.setPaused(false,90000);
 const a=deck.cards.find(x=>x.user==='a'),b=deck.cards.find(x=>x.user==='b');
 assert.equal(a.until,90000+DECK_LIMITS.ttl-1000);assert.equal(b.until,90000+DECK_LIMITS.ttl,'thẻ đến lúc tạm dừng được đủ thời gian');
 const full=new InventoryDeck(container(),{},esc,{doc:fakeDoc(),observe:false});
 for(let i=0;i<DECK_LIMITS.active+DECK_LIMITS.queue+3;i++)full.show(ev('x'+i),null,1000);
 assert.equal(full.queue.length,DECK_LIMITS.queue);assert.equal(full.stats.dropped,3);
 deck.clear();full.clear();
});

test('V4 túi đồ: chỉ dựng lại thẻ thay đổi, thẻ khác giữ nguyên node',()=>{
 const doc=fakeDoc(),box=container(),deck=new InventoryDeck(box,{},esc,{doc,observe:false});
 deck.show(ev('a'),null,1000);deck.show(ev('b'),null,1010);deck.show(ev('c'),null,1020);
 const [na,nb,nc]=box.children;const made=doc.created;
 deck.show(ev('b',5),null,1030);
 assert.equal(box.children[0],na);assert.equal(box.children[2],nc);assert.notEqual(box.children[1],nb);assert.equal(doc.created-made,2,'chỉ dựng lại thẻ b (holder + thẻ)');
 deck.expire(1000+DECK_LIMITS.ttl+1);deck.render();assert.equal(box.children.length,2);assert.equal(box.children.includes(na),false);
 deck.clear();
});

test('V4 túi đồ: chỉ số pháp bảo là mức đóng góp thật (phụ 50% như extraStat), đồ cất ghi rõ',async()=>{
 const {itemStats}=await import('../public/inventory-multi.js');
 assert.equal(itemStats({on:true,damage:1200,bonus:.08}),'CHỦ · +1.200 công lực · +8% tu vi');
 assert.equal(itemStats({secondary:true,damage:600,bonus:.1}),'TRỢ ½ · +300 công lực · +5% tu vi');
 assert.equal(itemStats({damage:300}),'cất · +300 công lực');
 assert.equal(itemStats({name:'Vô danh'}),'','không có chỉ số thì không vẽ số giả');
 assert.equal(itemStats({n:3},'pill'),'×3');
});

test('V4 túi đồ: mỗi mục giới hạn số ô, phần dư cộng đúng vào "+N vật phẩm khác"',async()=>{
 const {inventoryDeckHTML}=await import('../public/inventory-multi.js');
 const arts=Array.from({length:8},(_,i)=>({name:'PB'+i,damage:1}));
 const html=inventoryDeckHTML({name:'A',card:{kind:'bag',stones:0,herbs:0,artifacts:{items:arts,more:3},pills:{items:[],more:0},manuals:{items:[],more:0}}},esc);
 assert.equal((html.match(/class="inv-item[ "]/g)||[]).length,6);assert.match(html,/\+ 5 vật phẩm khác/);
});
