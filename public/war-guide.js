// 15/11/2026: Chính Ma Đại Chiến — dọn các bảng thường (Thiên Bảng, Bí pháp, Đồng môn, Tiên Đế, trò vui) và hiện
// HƯỚNG DẪN trận ở cột trái. Số liệu khớp sect-war.mjs: gõ chinh/ma chọn phe, chiến = xuất chiêu (hồi 8 s),
// tim đẩy chiến tuyến (chưa chọn phe thì tự vào phe ít người), đẩy tới sơn môn đối phương là thắng.
// Không mồi tương tác (luật 09/11): chỉ nói lệnh làm gì trong trận, không hứa thưởng cho tim/follow.
export function warGuidePage(war){
 if(!war?.active)return null;
 if(war.phase==='registration')return {title:'CHÍNH MA ĐẠI CHIẾN · CHỌN PHE',rows:[
  ['chinh','vào Chính Đạo','chinh'],
  ['ma','vào Ma Đạo','ma'],
  ['chiến','xuất chiêu khi khai trận'],
  ['❤ tim','đẩy chiến tuyến về phe mình']],
  note:'Chọn phe rồi không đổi được giữa trận'};
 if(war.phase==='running')return {title:'CHÍNH MA ĐẠI CHIẾN · KHAI TRẬN',rows:[
  ['chinh · ma','chọn phe nếu chưa vào'],
  ['chiến','xuất chiêu đẩy chiến tuyến · hồi 8 giây'],
  ['❤ tim','đẩy chiến tuyến về phe mình'],
  ['🏯 thắng','đẩy tới sơn môn đối phương']],
  note:'Chưa chọn phe: thả tim tự vào phe ít người'};
 return {title:'CHÍNH MA ĐẠI CHIẾN · VINH DANH',rows:[['🏆','phe thắng và top 3 mỗi phe nhận thưởng']],note:''};
}
export function warGuideHTML(page,esc,counts){
 if(!page)return '';
 const side=r=>r[2]?' class="wg-'+r[2]+'"':'';
 const count=counts&&(counts.chinh||counts.ma)?'<small class="wg-count"><i class="wg-chinh">Chính '+(counts.chinh||0)+'</i> · <i class="wg-ma">Ma '+(counts.ma||0)+'</i></small>':'';
 return '<b>⚔ '+esc(page.title)+'</b><ol>'+page.rows.map(r=>'<li'+side(r)+'><code>'+esc(r[0])+'</code><span>'+esc(r[1])+'</span></li>').join('')+'</ol>'+count+(page.note?'<small>'+esc(page.note)+'</small>':'');
}
