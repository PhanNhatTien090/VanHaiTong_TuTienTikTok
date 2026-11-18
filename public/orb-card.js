// 18/11/2026 (chủ game): THẺ LINH CHÂU — ai đạt / nhận / đang giữ Linh Châu tím hoặc vàng thì hiện thẻ to giữa màn cho họ thấy.
// stage: earned (quà Bí Cảnh vừa đủ mốc · nhận khi kết thúc) · got (đã vào túi) · remind (đang giữ, chưa truyền công — server hồi 20 phút/người).
// HTML dựng theo sự kiện, chuyển động chỉ bằng CSS transform/opacity; tối đa 1 thẻ hiện + 3 chờ, trùng người thì thay nội dung.
import {orbImage} from './mounts.js';
const SHOW_MS=4600,QUEUE_MAX=3;
const KIND={divine:{name:'LINH CHÂU VÀNG',cmd:'truyencong than',tone:'gold'},vip:{name:'LINH CHÂU TÍM',cmd:'truyencong vip',tone:'violet'},common:{name:'LINH CHÂU XANH',cmd:'truyencong',tone:'cyan'}};
const SHORT={divine:'vàng',vip:'tím',common:'xanh'};
const LINE={earned:'Quà đã đủ mốc · nhận khi Bí Cảnh kết thúc',got:'Đã vào túi · truyền công để tọa kỹ hiện thân',remind:'Truyền công để nở tọa kỹ'};
const countLine=c=>c.stage==='remind'&&c.counts?['divine','vip','common'].filter(x=>c.counts[x]>0).map(x=>c.counts[x]+' châu '+SHORT[x]).join(' · ')+' · ':'';
const HEAD={earned:'ĐẠT',got:'NHẬN',remind:'ĐANG GIỮ'};
export function orbCardHTML(e,esc){
 const c=e?.orbCard,k=c&&KIND[c.kind];if(!k||!LINE[c.stage])return '';
 const n=c.count>1?' ×'+c.count:'';
 return `<div class="oc-card oc-${k.tone} oc-${esc(c.stage)}"><div class="oc-rays"></div><img class="oc-orb" src="${esc(orbImage(c.kind,2))}" alt="" decoding="async">`
  +`<div class="oc-head">${HEAD[c.stage]} ${k.name}${n}</div><div class="oc-name">${esc(Array.from(String(e.name||'Đạo hữu')).slice(0,18).join(''))}</div>`
  +`<div class="oc-line">${countLine(c)}${LINE[c.stage]}</div>${c.stage==='earned'?'':`<div class="oc-cmd">gõ <b>${k.cmd}</b></div>`}</div>`;
}
export class OrbCard{
 constructor(root,esc){this.root=root;this.esc=esc;this.queue=[];this.cur=null;this.timer=0;}
 show(e){
  if(!this.root||!orbCardHTML(e,this.esc))return false;
  if(this.cur&&this.cur.user===e.user){this.render(e);return true;} // cùng người: đổi nội dung tại chỗ
  const q=this.queue.findIndex(x=>x.user===e.user);if(q>=0){this.queue[q]=e;return true;}
  if(this.cur){if(this.queue.length<QUEUE_MAX)this.queue.push(e);return true;}
  this.play(e);return true;
 }
 play(e){this.cur=e;this.render(e);this.root.hidden=false;this.root.classList.remove('oc-out');void this.root.offsetWidth;this.root.classList.add('oc-in');
  clearTimeout(this.timer);this.timer=setTimeout(()=>{this.root.classList.add('oc-out');this.timer=setTimeout(()=>{this.root.classList.remove('oc-in','oc-out');this.root.hidden=true;this.cur=null;const n=this.queue.shift();if(n)this.play(n);},380);},SHOW_MS);}
 render(e){this.root.innerHTML=orbCardHTML(e,this.esc);}
}
