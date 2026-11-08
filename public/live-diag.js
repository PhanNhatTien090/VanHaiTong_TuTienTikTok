// 08/11/2026: chẩn đoán lag trong LIVE Studio (Electron/Chromium). Chỉ ĐO, không đổi hình/tiếng.
// Gửi kèm /api/client-status mỗi 5 s: nhịp rAF thật, thời gian luồng chính bị chặn, và đoạn code nào chặn
// (Long Animation Frames API, Chromium 123+). Chi phí: một vòng rAF đếm số + PerformanceObserver.
const W={raf:0,rafGapMax:0,lastRaf:0,longMs:0,longN:0,longMax:0,loafMs:0,loafN:0,blockMs:0,styleMs:0,scripts:new Map(),lagMax:0,hiddenMs:0,since:performance.now()};
let started=false,lastTick=0,hiddenAt=0;
function src(s){const u=String(s.sourceURL||'').split('/').pop().split('?')[0];return `${s.invoker||s.invokerType||'?'}@${u}${s.sourceFunctionName?':'+s.sourceFunctionName:''}`.slice(0,90);}
export function startLiveDiag(){
  if(started)return;started=true;
  const loop=t=>{W.raf++;if(W.lastRaf)W.rafGapMax=Math.max(W.rafGapMax,t-W.lastRaf);W.lastRaf=t;requestAnimationFrame(loop);};requestAnimationFrame(loop);
  try{new PerformanceObserver(l=>{for(const e of l.getEntries()){W.longN++;W.longMs+=e.duration;W.longMax=Math.max(W.longMax,e.duration);}}).observe({type:'longtask'});}catch{}
  try{new PerformanceObserver(l=>{for(const e of l.getEntries()){W.loafN++;W.loafMs+=e.duration;W.blockMs+=e.blockingDuration||0;W.styleMs+=Math.max(0,(e.startTime+e.duration)-(e.styleAndLayoutStart||e.startTime+e.duration));for(const s of e.scripts||[]){const k=src(s);W.scripts.set(k,(W.scripts.get(k)||0)+s.duration);}}}).observe({type:'long-animation-frame'});}catch{}
  // Độ trễ hẹn giờ: setInterval 100 ms bị trễ bao nhiêu (luồng chính bận).
  lastTick=performance.now();setInterval(()=>{const now=performance.now();W.lagMax=Math.max(W.lagMax,now-lastTick-100);lastTick=now;},100);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)hiddenAt=performance.now();else if(hiddenAt){W.hiddenMs+=performance.now()-hiddenAt;hiddenAt=0;}});
}
export function liveDiagSnapshot(){
  const now=performance.now(),sec=Math.max(.001,(now-W.since)/1000),r=n=>Math.round(n);
  const top=[...W.scripts].sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,ms])=>[k,r(ms)]);
  const out={win:+sec.toFixed(1),rafFps:+(W.raf/sec).toFixed(1),rafGapMax:r(W.rafGapMax),longN:W.longN,longMs:r(W.longMs),longMax:r(W.longMax),loafN:W.loafN,loafMs:r(W.loafMs),blockMs:r(W.blockMs),styleMs:r(W.styleMs),lagMax:r(W.lagMax),hidden:document.hidden,vis:document.visibilityState,hiddenMs:r(W.hiddenMs+(hiddenAt?now-hiddenAt:0)),heapMiB:performance.memory?r(performance.memory.usedJSHeapSize/1048576):null,top};
  Object.assign(W,{raf:0,rafGapMax:0,longMs:0,longN:0,longMax:0,loafMs:0,loafN:0,blockMs:0,styleMs:0,lagMax:0,hiddenMs:0,since:now});W.scripts.clear();if(hiddenAt)hiddenAt=now;
  return out;
}
