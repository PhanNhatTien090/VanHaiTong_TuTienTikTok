import {test} from 'node:test';import assert from 'node:assert/strict';
import {gameText} from '../public/game-language.js';
import {createWorld,action,snapshot} from '../engine.mjs';
import {announcement} from '../speech.mjs';import {actionPose} from '../public/character-animation.js';
test('fictional crystals use activation language, accept both names and retain saved IDs',()=>{
 const w=createWorld();action(w,{type:'join',userId:'a'},1000000);const p=w.players.a;p.stones=100;p.herbs=100;
 assert.equal(action(w,{type:'chat',userId:'a',text:'luyendan Tinh The Tu Khi'},1000001).ok,true);
 assert.equal(p.pills['qi-pill'],1);
 assert.equal(action(w,{type:'chat',userId:'a',text:'dung Tu Khi Dan'},1004000).ok,true);
 const e=w.events.at(-1);assert.match(e.text,/Kích hoạt Tinh Thể/);assert.equal(actionPose(e),'cast');
 assert.match(announcement(e),/trong trò chơi/);assert.match(snapshot(w).catalog.find(i=>i.id==='qi-pill').name,/Tinh Thể/);
 assert.equal(gameText('Đang hấp thu đan dược'),'Tinh thể đang hồi chiêu');
});
