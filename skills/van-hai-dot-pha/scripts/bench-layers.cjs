// Đo chi phí vẽ từng lớp (ms/khung) trong Chromium, phát hiện lớp tốn fill-rate. Cần server đang chạy (BASE=...).
// Sửa danh sách L bên dưới theo module của cảnh giới đang làm. Máy không GPU chậm hơn LIVE nhiều: chỉ so tương đối.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto((process.env.BASE||'http://127.0.0.1:4317')+'/ascension-preview.html?capture=1');
const r=await p.evaluate(async()=>{const m=await import('/luyen-khi-formation.js');const cv=document.createElement('canvas');cv.width=1080;cv.height=1920;const c=cv.getContext('2d');c.scale(1.2,1.2);
const scene={budget:{level:'balanced'}},s={feet:1024},v={flip:false,phase:.3},out={};
const L={sky:st=>m.drawLkSky(scene,c,st,1600,v),floor:st=>m.drawLkFloor(scene,c,st,s,1600),formation:st=>m.drawLkFormation(scene,c,st,s,v),vortex:st=>m.drawLkVortex(scene,c,st,s,1600,v),ground:st=>m.drawLkGroundQi(scene,c,st,s,v),meridian:st=>m.drawLkMeridians(scene,c,st,s,0),wheel:st=>m.drawLkWheel(scene,c,st,s,v),scatter:st=>m.drawLkScatter(scene,c,st,s)};
for(const [n,f] of Object.entries(L)){f(m.luyenKhiState(.5));c.getImageData(0,0,1,1);let t=performance.now();for(let i=0;i<60;i++){f(m.luyenKhiState(i/60));}c.getImageData(0,0,1,1);out[n]=((performance.now()-t)/60).toFixed(2);}return out;});
console.log(JSON.stringify(r));await b.close();})();
