// Giả lập đông người vào THẾ GIỚI THỬ NGHIỆM (không đụng LIVE).
// node scripts/load-test.mjs [số người=300] [sự kiện/giây=20] [giây=60]
const [users=300,rate=20,secs=60]=process.argv.slice(2).map(Number);
const base='http://127.0.0.1:4317/api/action?world=demo';
const cmds=['tuluyen','tuluyen','tuluyen','hai','diemdanh','tu vi','đột phá','hoc Thanh Tam Quyet','ren Thanh Ngoc Kiem','luyendan Tu Khi Dan','dung Tu Khi Dan','danh','chào cả nhà','goiy'];
const gifts=[['Rose',1],['Finger Heart',5],['Cat paws',5],['Doughnut',30],['Corgi',299],['Galaxy',1000]];
const pick=a=>a[Math.floor(Math.random()*a.length)];
let sent=0,ok=0,slow=0,maxMs=0;const t0=Date.now();
async function fire(){
  const u=Math.floor(Math.random()*users),id='load:'+u,name='Đạo hữu '+u,r=Math.random();
  const body=r<.04?{type:'gift',userId:id,name,coins:pick(gifts)[1],giftName:pick(gifts)[0],eventId:crypto.randomUUID()}
    :r<.12?{type:'like',userId:id,name,count:15}
    :{type:'chat',userId:id,name,text:Math.random()<.15?`nhapmon ${Math.random()<.5?'nam':'nu'}`:pick(cmds)};
  const s=Date.now();sent++;
  try{const res=await fetch(base,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});await res.json();ok++;}catch{}
  const ms=Date.now()-s;maxMs=Math.max(maxMs,ms);if(ms>200)slow++;
}
const timer=setInterval(()=>{for(let i=0;i<rate/10;i++)fire();},100);
setTimeout(()=>{clearInterval(timer);setTimeout(()=>{console.log(JSON.stringify({users,rate,secs,sent,ok,slow,maxMs,elapsed:Date.now()-t0}));},1500);},secs*1000);
