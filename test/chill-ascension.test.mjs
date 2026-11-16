import test from 'node:test';import assert from 'node:assert/strict';
import {ascensionHeld,majorEventActive} from '../public/event-donations.js';
const now=1e12,open={endsAt:now+60000};
test('16/11: sự kiện chill (kết duyên, Linh Thú Cốc, Đêm Đèn, mưa hoa, cơ duyên, tiên nhân) vẫn diễn màn đột phá',()=>{
 for(const s of [{mainStage:'lễ hội kết duyên',socialStatus:{festival:{active:true}}},{mainStage:'Linh Thú Cốc',petEvent:open},{mainStage:'Đêm Đèn Đồng Môn',lanternFestival:{active:true}},{mainStage:'sao băng / mưa hoa',flowerEvent:open},{mainStage:'cơ duyên',opportunity:open},{mainStage:'tiên nhân',visitor:open}]){
  s.serverNow=now;assert.equal(majorEventActive(s),true);assert.equal(ascensionHeld(s),false,s.mainStage);}
});
test('16/11: sự kiện đánh nhau / đua / bí cảnh vẫn giữ màn đột phá lại',()=>{
 for(const s of [{mainStage:'yêu thú',boss:{hp:5,...open}},{mainStage:'đua phi kiếm',raceStatus:{active:true}},{mainStage:'Vân Hải Tháp',tower:{active:true}},{mainStage:'bí cảnh mê cung',maze:{active:true}},{mainStage:'Tọa Kỹ Bí Cảnh',mountRealm:{active:true}},{mainStage:'Lôi Đài'},{socialScene:{}},{mainStage:'Linh Thú Cốc',petEvent:open,tower:{active:true}}]){
  s.serverNow=now;assert.equal(ascensionHeld(s),true,JSON.stringify(s).slice(0,60));}
});
