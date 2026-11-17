import {test} from 'node:test';import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,adminEditPlayer,autoEquipBest} from '../engine.mjs';
test('Tông chủ ghim pháp bảo chính: tự trang bị không đổi sang món mạnh hơn; bỏ ghim thì về món mạnh nhất',()=>{
 const w=createWorld('demo'),p=ensurePlayer(w,'a','A',1);p.artifacts=['galaxy-dharma-wheel'];autoEquipBest(p);assert.equal(p.equipped,'galaxy-dharma-wheel');
 assert.equal(adminEditPlayer(w,'a',{addItems:['hanlap-bamboo-swords'],equipped:'hanlap-bamboo-swords'},2).ok,true);
 autoEquipBest(p);assert.equal(p.equipped,'hanlap-bamboo-swords');assert.ok(!p.equippedExtra.includes('hanlap-bamboo-swords'),'không trùng ô phụ');
 p.artifacts.push('phoenix-blade');autoEquipBest(p);assert.equal(p.equipped,'hanlap-bamboo-swords','nhận món mới vẫn giữ ghim');
 adminEditPlayer(w,'a',{equipped:null},3);autoEquipBest(p);assert.notEqual(p.equipped,'hanlap-bamboo-swords');
});
