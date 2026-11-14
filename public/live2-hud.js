// Pure DOM HUD for Live 2.0: only updates on SSE state snapshots, never in the render loop.
// No innerHTML from user-controlled guild names or player data.
let root,teamNodes=[],resultNode,clock,style;
function make(tag,cls,parent){const n=document.createElement(tag);if(cls)n.className=cls;parent.appendChild(n);return n;}
function create(){
 if(root||typeof document==='undefined'||!document.body)return;
 if(!style){
  style=document.createElement('style');
  style.textContent='#live2-war-hud{position:fixed;z-index:19;top:21%;left:50%;transform:translateX(-50%);width:min(660px,87vw);max-width:90%;pointer-events:none;font-family:Segoe UI,Arial,sans-serif;color:#fff0c6;text-shadow:0 2px 4px #120d20;}#live2-war-hud[hidden]{display:none!important}#live2-war-hud .l2-wrap{padding:14px 18px;border:1px solid #d2a96599;border-radius:17px;background:linear-gradient(120deg,#090b20ed,#24142bea,#0c1932ec);box-shadow:0 8px 34px #000b;}#live2-war-hud .l2-head{font:bold 24px Georgia,serif;letter-spacing:2px;text-align:center;color:#ffe5a5;}#live2-war-hud .l2-time{text-align:center;font-size:15px;color:#e0daf0;margin:5px 0 9px;}#live2-war-hud .l2-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}#live2-war-hud .l2-team{min-width:0;}#live2-war-hud .l2-name{font-size:18px;font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}#live2-war-hud .l2-points{font-size:22px;font-weight:800;text-align:center;color:#fff;}#live2-war-hud .l2-track{margin-top:5px;background:#ffffff24;height:12px;border-radius:10px;overflow:hidden;}#live2-war-hud .l2-fill{height:100%;width:0%;background:linear-gradient(90deg,#47f2da,#8bdaff);transition:width .35s ease;}#live2-war-hud .l2-team:nth-child(2) .l2-fill{background:linear-gradient(90deg,#ffbe70,#ff6b9d)}#live2-war-hud .l2-tip{text-align:center;font-size:15px;font-weight:700;padding-top:9px;color:#cce8f3}';
  document.head.appendChild(style);
 }
 root=make('aside','',document.body);root.id='live2-war-hud';root.hidden=true;
 const wrap=make('div','l2-wrap',root),head=make('div','l2-head',wrap);head.textContent='⚔ CHƯ TÔNG HỘI CHIẾN ⚔';
 clock=make('div','l2-time',wrap);const grid=make('div','l2-grid',wrap);
 for(let i=0;i<2;i++){
  const team=make('div','l2-team',grid),name=make('div','l2-name',team),points=make('div','l2-points',team),track=make('div','l2-track',team),fill=make('div','l2-fill',track);
  teamNodes.push({name,points,fill});
 }
 resultNode=make('div','l2-tip',wrap);
}
function set(n,v){if(n.textContent!==v)n.textContent=v;}
function renderGuildWarHud(state,overlay){
 if(!overlay){if(root)root.hidden=true;return;}
 const e=state?.live2GuildWar;if(!e){if(root)root.hidden=true;return;}
 create();if(!root)return;
 root.hidden=false;
 const a=e.groups||[],max=Math.max(1,...a.map(g=>Number(g.score)||0));
 for(let i=0;i<2;i++){
  const team=a[i],n=teamNodes[i];if(!team){n.name.textContent='';n.points.textContent='';n.fill.style.width='0%';continue;}
  set(n.name,team.name||'Bang hội');set(n.points,String(team.score||0));
  const width=Math.max(0,Math.min(100,Math.round((team.score||0)/max*100)))+'%';
  if(n.fill.style.width!==width)n.fill.style.width=width;
 }
 const seconds=Math.max(0,Math.ceil((e.endsAt-(state.serverNow||Date.now()))/1000));
 set(clock,e.active?'Giao chiến còn '+seconds+' giây':'Hội Chiến đã kết thúc');
 const winner=e.result?.winner;
 set(resultNode,e.active?'Thành viên gõ: chiến hội · mỗi 6 giây':winner?'Chiến thắng: '+(a.find(g=>g.id===winner)?.name||'Bang hội'):'Hai bang hòa nhau');
}


// A small contextual help HUD (event-driven DOM, no canvas overdraw or timers).
let trialRoot=null,trialTitle=null,trialProgress=null,trialText=null;
function ensureTrial(){
 if(trialRoot||typeof document==='undefined')return;
 const css=document.createElement('style');
 css.textContent='#live2-trial-hud{position:fixed;z-index:15;right:15px;top:25%;width:min(286px,32vw);pointer-events:none;color:#ffe8aa;font:700 15px Segoe UI,Arial,sans-serif;text-shadow:0 2px 4px #050818}#live2-trial-hud[hidden]{display:none!important}#live2-trial-hud .l2-trial-panel{border:1px solid #b7a2f899;background:linear-gradient(130deg,#0a1029eb,#34244ce8);border-radius:16px;padding:11px 13px;box-shadow:0 4px 18px #0008}#live2-trial-hud .l2-trial-head{display:flex;align-items:center;gap:9px;font-weight:900;letter-spacing:1px}#live2-trial-hud .l2-trial-head img{width:36px;height:36px;object-fit:contain}#live2-trial-hud .l2-trial-name{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px 0;font-size:17px}#live2-trial-hud .l2-trial-step{font-size:14px;color:#cbddf0}#live2-trial-hud .l2-trial-hint{margin-top:6px;color:#fff1cd;font-size:13px;font-weight:500}body.ritual-active #live2-trial-hud,body.hall-dueling #live2-trial-hud{display:none!important}@media(max-width:620px){#live2-trial-hud{top:19%;right:5px;width:min(240px,43vw)}#live2-trial-hud .l2-trial-panel{padding:7px 9px}#live2-trial-hud .l2-trial-name{font-size:13px}}';
 document.head.appendChild(css);
 trialRoot=document.createElement('aside');trialRoot.id='live2-trial-hud';trialRoot.hidden=true;
 const p=make('div','l2-trial-panel',trialRoot),h=make('div','l2-trial-head',p),img=make('img','',h);
 img.src='/assets/live2-paths/tribulation.svg';img.alt='';img.decoding='async';
 const label=make('span','',h);label.textContent='✦ THIÊN KIẾP HỘ ĐẠO';
 trialTitle=make('div','l2-trial-name',p);trialProgress=make('div','l2-trial-step',p);trialText=make('div','l2-trial-hint',p);
 document.body.appendChild(trialRoot);
}
function renderTrialHud(state,overlay){
 const list=state?.live2Trial;
 if(!overlay||!Array.isArray(list)||!list.some(t=>!t.completed)){
  if(trialRoot)trialRoot.hidden=true;return;
 }
 const t=list.find(t=>!t.completed);
 if(!t||state?.live2GuildWar?.active||state?.boss?.hp>0||state?.tower?.active||state?.hallWar?.active){
  if(trialRoot)trialRoot.hidden=true;return;
 }
 ensureTrial();if(!trialRoot)return;
 trialRoot.hidden=false;
 set(trialTitle,String(t.name||'Đạo hữu'));
 set(trialProgress,String(Math.max(0,Math.min(3,t.helpers||0)))+'/3 đạo hữu • '+Math.max(0,Math.ceil((t.endsAt-(state.serverNow||Date.now()))/1000))+' giây');
 set(trialText,'Gõ hộ kiếp '+String(t.name||'tên')+' để góp hộ pháp');
}
export function renderLive2Hud(state,overlay){
 renderGuildWarHud(state,overlay);
 renderTrialHud(state,overlay);
}
