import {test} from 'node:test';
import assert from 'node:assert/strict';
import {live2Command} from '../live2-systems.mjs';

const N=1800000000000;
function setup(){
 const master={id:'m',name:'Sư Phụ',realm:8,lastActive:N};
 const students=Array.from({length:5},(_,i)=>({id:'s'+i,name:'Đệ tử '+i,realm:2,lastActive:N}));
 const players=Object.fromEntries([master,...students].map(p=>[p.id,p]));
 const world={mode:'live',settings:{live2Enabled:true},players};
 const ctx={emit:()=>{}},act=(p,cmd,t=N)=>live2Command(world,p,cmd.split(' '),t,ctx);
 return {master,students,world,act};
}
test('many viewers can request same master; no request overwrites another',()=>{
 const {master,students,act}=setup();
 for(let i=0;i<4;i++)assert.equal(act(students[i],'xin su Sư Phụ').ok,true);
 assert.equal(act(students[4],'xin su Sư Phụ').ok,false);
 assert.equal(master.live2.mentorInvites.length,4);
 assert.equal(act(master,'nhan do Đệ tử 1').ok,true);
 assert.equal(students[1].live2.masterId,'m');
 assert.equal(master.live2.mentorInvites.length,3);
 assert.equal(act(master,'nhan do').ok,true);
 assert.equal(students[0].live2.masterId,'m');
 assert.equal(master.live2.students.length,2);
 assert.equal(act(master,'nhan do Đệ tử 2').ok,false);
});
test('legacy invite still works after restart, expired invite cannot join',()=>{
 const {master,students,act}=setup();
 master.live2={mentorInvite:{from:'s0',until:N+5000},students:[]};
 assert.equal(act(master,'nhan do',N+100).ok,true);
 assert.equal(students[0].live2.masterId,'m');
 const {master:m2,students:st2,act:act2}=setup();
 m2.live2={mentorInvite:{from:'s0',until:N-1},students:[]};
 assert.equal(act2(m2,'nhan do',N+100).ok,false);
 assert.equal(st2[0].live2,undefined);
});
test('renamed or indistinguishable student lookup never accepts wrong user',()=>{
 const {master,students,act}=setup();
 students[0].name='Đạo Hữu';students[1].name='Đạo Hữu';
 assert.equal(act(students[0],'xin su Sư Phụ').ok,true);
 assert.equal(act(students[1],'xin su Sư Phụ').ok,true);
 assert.equal(act(master,'nhan do Đạo Hữu').ok,false);
 assert.equal(act(master,'nhan do s1').ok,true);
 assert.equal(students[1].live2.masterId,'m');
 assert.equal(students[0].live2.masterId,null);
});
