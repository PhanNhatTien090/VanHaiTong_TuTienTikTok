import {test} from 'node:test';
import assert from 'node:assert/strict';
import {commandWords} from '../engine.mjs';
test('vietnamese two-word Tower commands become single tokens',()=>{
 assert.deepEqual(commandWords('phá trận'),['phatran']);
 assert.deepEqual(commandWords('hộ pháp'),['hophap']);
 assert.deepEqual(commandWords('tâm tĩnh'),['tamtinh']);
 assert.deepEqual(commandWords('tâm linh'),['tamlinh']);
});
test('legacy short and guild hall commands stay untouched',()=>{
 assert.deepEqual(commandWords('3'),['3']);
 assert.deepEqual(commandWords('đường chiến'),['duong','chien']);
});
