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
export function renderLive2Hud(state,overlay){
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
