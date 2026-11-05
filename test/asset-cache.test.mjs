import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {AssetCache} from '../asset-cache.mjs';
test('asset RAM cache reuses buffers, detects edits after revalidation and stays within budget',()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'vanhai-assets-')),a=path.join(dir,'a'),b=path.join(dir,'b'),cache=new AssetCache(10);
 writeFileSync(a,'hello');const first=cache.get(a,1000);assert.equal(cache.get(a,1300).body,first.body);
 writeFileSync(a,'new text');assert.equal(cache.get(a,2500).body.toString(),'new text');assert.notEqual(cache.get(a,2500).etag,first.etag);
 writeFileSync(b,'12345678');cache.get(b,2500);assert.ok(cache.bytes<=10);assert.equal(cache.entries.size,1);
});
