export function simpleSteps(s={}){
 const rows=[
  // 4/11/2026 heartPlay: tim là cách vận công, trò chuyện để luận đạo — không cần spam tu luyện.
  // 4/11: chữ ngắn để bảng nhỏ, không che nhân vật.
  {cmd:'❤ thả tim',text:'vận công'},
  {cmd:'💬 trò chuyện',text:'+20% tu vi'},
  {cmd:'đột phá',text:'đột phá cảnh giới'},
  {cmd:'học · rèn',text:'bí pháp · pháp bảo'},
  {cmd:'giới tính nam/nữ',text:'đổi nam/nữ'}
 ];
 const race=s.raceStatus,t=s.socialStatus?.tournament;
 const hint=race?.phase==='registration'?'Đua: gõ bay':race?.phase==='running'?'Đua: thả tim tăng tốc':t?.phase==='registration'?'Tỷ thí: gõ tỷ thí':s.boss?.hp>0&&s.boss.endsAt>s.serverNow?'Yêu thú: thả tim':'';
 return {title:'CÁCH CHƠI',rows,hint};
}
export function renderSimpleGuide(s,esc){
 const el=document.querySelector('#basicCommands');if(!el)return;
 document.body.classList.add('simple-play');const p=simpleSteps(s),html='<b>'+esc(p.title)+'</b><ol>'+p.rows.map(r=>'<li><code>'+esc(r.cmd)+'</code><span>'+esc(r.text)+'</span></li>').join('')+'</ol>'+(p.hint?'<small class="corner-command-hint">'+esc(p.hint)+'</small>':'');
 if(el._simpleHTML!==html){el.innerHTML=html;el._simpleHTML=html;}
}
