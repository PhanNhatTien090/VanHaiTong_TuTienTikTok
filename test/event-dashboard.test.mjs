import test from 'node:test';import assert from 'node:assert/strict';import {eventDashboardHTML} from '../public/event-dashboard.js';import {mountEventTab} from '../public/social-ui.js';
const N=1800000000000,state={serverNow:N,players:[],socialStatus:{tournament:null,bonds:[],invites:[]},settings:{}};
test('Ma Long is a prominent direct action, every activity remains reachable and extended rules collapse',()=>{
 const html=eventDashboardHTML(state);
 assert.match(html,/Mở Ma Long/);assert.match(html,/data-species="abyss-dragon"/);assert.ok(html.indexOf('abyss-dragon')<html.indexOf('data-panel="visitors"'));
 for(const action of ['sea-event','visitor','boss','start-race','start-tournament','start-lantern','start-bond-festival','flower','opportunity','world-scene','pet-start','blessing'])assert.ok(html.includes(`data-social="${action}"`),action);
 assert.match(html,/<details class="event-group" data-panel="help">/);assert.match(html,/Yêu lực ×10/);
});
test('occupied stage labels current event and disables starts while retaining explicit stop',()=>{
 const html=eventDashboardHTML({...state,boss:{name:'Hắc Uyên Ma Long',endsAt:N+45000}});
 assert.match(html,/0:45 còn lại/);assert.match(html,/data-social="stop-current" data-kind="boss"/);assert.match(html,/data-species="abyss-dragon" disabled/);
 const safe=eventDashboardHTML({...state,boss:{name:'<script>alert(1)</script>',endsAt:N+1000}});assert.ok(!safe.includes('<script>'));
});
test('boss/skin/pet buttons dispatch exactly one intended request, mounting never activates an event',()=>{
 const old=globalThis.document,calls=[],handlers={},host={appendChild(){}},root={addEventListener:(kind,fn)=>handlers[kind]=fn};
 globalThis.document={querySelector:s=>s==='#eventHub'?host:root,querySelectorAll:()=>[],createElement:()=>({className:'',innerHTML:'',lastElementChild:{appendChild(){}}})};
 try{mountEventTab((...a)=>calls.push(a));assert.equal(calls.length,0);
  const click=dataset=>handlers.click({target:{closest:()=>({dataset})}});
  click({social:'boss',species:'abyss-dragon'});click({social:'sea-event'});click({social:'pet-start'});
  assert.deepEqual(calls,[['/api/boss',{species:'abyss-dragon'}],['/api/visitor-event',{kind:'hailam'}],['/api/pet-event',{action:'start',minutes:5}]]);
 }finally{globalThis.document=old;}
});
