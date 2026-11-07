import {test} from 'node:test';import assert from 'node:assert/strict';import {fastVoiceFile} from '../public/voice.js';
// 07/11/2026: không phát câu dự phòng "Tông môn đã ghi nhận…" cho thông báo thường — nghe như cảm ơn quà khi không ai tặng.
test('routine notices have no generic acknowledgement fallback; real gifts and cultivation keep theirs',()=>{
 for(const e of [{effect:'status',text:'Đang vận công'},{effect:'visitor',text:'Hàn Lập đã rời tiên môn'},{effect:'race',text:'Đua'}])assert.equal(fastVoiceFile(e),null);
 assert.match(fastVoiceFile({gift:'Hoa hồng',coins:1,user:'1',effect:'petal'}),/gift\.mp3$/);assert.match(fastVoiceFile({effect:'qi',text:'Vận'}),/qi\.mp3$/);
});
