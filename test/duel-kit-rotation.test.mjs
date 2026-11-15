import {test} from 'node:test';
import assert from 'node:assert/strict';
import {duelSkillTech} from '../public/social-stage.js';

test('Luận Kiếm: chiêu thường xoay vòng 3 chiêu của bộ Lôi Đài, tuyệt kỹ giữ chiêu chính',()=>{
 const match={techniques:{a:{id:'thunder',name:'Cửu Tiêu Thần Lôi',color:'#fff'}},kits:{a:[{tech:'thunder',name:'Cửu Tiêu Thần Lôi'},{tech:'frost',name:'Hàn Băng Phong Ấn'},{tech:'lotus',name:'Nguyệt Linh Hồi Nguyên'}]}};
 const names=new Set();for(let turn=0;turn<12;turn++)names.add(duelSkillTech(match,'a',{turn:100+turn}).name);
 assert.equal(names.size,3);
 assert.equal(duelSkillTech(match,'a',{turn:301,ultimate:true}).id,'thunder');
 assert.equal(duelSkillTech({techniques:match.techniques},'a',{turn:5}).id,'thunder');
});
