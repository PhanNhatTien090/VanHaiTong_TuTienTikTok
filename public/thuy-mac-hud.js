// 19/11/2026 — GIAO DIỆN THỦY MẶC (chủ game chọn): bật class body.ui-tm cho overlay, dựng 3 LỆNH BÀI (1 tu luyện · 8 đột phá · 6 cơ duyên),
// đổi tên/bỏ số coin trên Công Đức Bảng (luật: không ghi coin). Chỉ đụng DOM khi nội dung đổi (MutationObserver), không chạy mỗi khung.
// ?ui=old → giữ giao diện cũ để so sánh.
const q=new URLSearchParams(location.search);
export const thuyMacOn=q.get('ui')!=='old';
const TOKENS=[['1','Tu luyện'],['8','Đột phá'],['6','Cơ duyên']];
function tokens(shell){
 if(shell.querySelector('.tm-tokens'))return;
 const box=document.createElement('div');box.className='tm-tokens';box.setAttribute('aria-label','Lệnh bài: gõ số trong bình luận');
 box.innerHTML=TOKENS.map(([n,w],i)=>`<div class="tm-token" style="--i:${i}"><b>${n}</b><span>${w}</span></div>`).join('');
 shell.appendChild(box);
}
// Công Đức Bảng: "Anh Tran · 6.293 coin" → "Anh Tran" (giữ danh vị Đệ Nhất/Nhị/Tam Cung Phụng).
function scrubCoins(root){
 for(const line of root.querySelectorAll('.gift-top-line')){if(line.dataset.tm)continue;const name=(line.firstChild?.textContent||'').replace(/\s*·\s*$/,'').trim();if(name){line.textContent=name;line.dataset.tm='1';}}
 const title=root.querySelector('.gift-leaders>b');if(title&&title.textContent!=='CÔNG ĐỨC BẢNG')title.textContent='CÔNG ĐỨC BẢNG';
 for(const s of root.querySelectorAll('#honorBanner small'))if(/coin/i.test(s.textContent))s.textContent='Công đức tông môn';
}
// Chữ lớn trên canvas (tiêu đề đột phá, chiếu riêng, biến hình…: ~30 file tự đặt font) → font khắc Noto Serif cho đồng bộ.
// Chỉ đổi họ font khi cỡ ≥26px; chữ tên/HUD nhỏ giữ nguyên. Chạy ở setter nên không tốn thêm khi vẽ.
function serifTitles(){
 const P=globalThis.CanvasRenderingContext2D?.prototype,d=P&&Object.getOwnPropertyDescriptor(P,'font');if(!d?.set||P.__tmFont)return;P.__tmFont=true;
 const re=/^((?:italic\s+|normal\s+|small-caps\s+)*(?:[1-9]00|bold|bolder|normal)?\s*)(\d+(?:\.\d+)?)px(\/[\d.]+)?\s+(.+)$/;
 Object.defineProperty(P,'font',{configurable:true,get(){return d.get.call(this);},set(v){const m=typeof v==='string'&&re.exec(v);
  if(m&&+m[2]>=26&&!/Noto Serif|monospace|emoji/i.test(m[4]))v=`${m[1]}${m[2]}px${m[3]||''} "Noto Serif",Georgia,serif`;d.set.call(this,v);}});
 try{document.fonts?.load('900 40px "Noto Serif"');document.fonts?.load('700 40px "Noto Serif"');}catch{}
}
export function initThuyMac(){
 if(!thuyMacOn)return false;
 document.body.classList.add('ui-tm');serifTitles();
 const shell=document.querySelector('.scene-shell');if(!shell)return true;
 tokens(shell);
 // bảng chữ cũ đã thay bằng lệnh bài → ẩn hẳn (inline !important thắng mọi CSS cũ)
 for(const id of ['basicCommands','lowerRightGuide'])document.getElementById(id)?.style.setProperty('display','none','important');
 const watch=el=>{if(!el)return;scrubCoins(el.parentElement||el);new MutationObserver(()=>scrubCoins(el.parentElement||el)).observe(el,{childList:true,subtree:true,characterData:true});};
 watch(document.getElementById('giftRanks'));watch(document.getElementById('honorBanner'));
 // Có sự kiện (khung sự kiện có nội dung, hoặc app báo sự kiện lớn) → body.tm-event: chiếu chỉ lên trên, ẩn bia + Công Đức Bảng.
 const dock=document.getElementById('eventInfoDock');
 const sync=()=>{const on=document.body.classList.contains('has-major-event')||!!dock&&[...dock.children].some(c=>!c.hidden&&getComputedStyle(c).display!=='none'&&c.textContent.trim());if(document.body.classList.contains('tm-event')!==on)document.body.classList.toggle('tm-event',on);};
 if(dock)new MutationObserver(sync).observe(dock,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class','style']});
 new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});sync();
 return true;
}
