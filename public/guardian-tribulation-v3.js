// Guardian Tribulation V3.5 — shows real pre-registered disciples assisting.
const TAU=Math.PI*2,clamp=n=>Math.max(0,Math.min(1,n));
export function guardianTribulationState(event,phase){
 const helpers=Array.isArray(event?.guardHelpers)?event.guardHelpers.slice(0,3):[];
 const realm=Number(event?.toRealm||event?.realm||0);
 const active=realm>=6&&helpers.length>0;
 const energy=clamp((phase-.18)/.35)*(1-clamp((phase-.86)/.14));
 const shield=clamp((phase-.42)/.22)*(1-clamp((phase-.80)/.18));
 return {active,helpers,energy:active?energy:0,shield:active?shield:0};
}
export function drawGuardianTribulation(scene,c,event,phase,H){
 const g=guardianTribulationState(event,phase);if(!g.active||g.energy<.005)return;
 const reduced=scene.motion===false,light=scene.budget?.pressured||scene.budget?.level==='light',clock=reduced?0:phase*TAU;
 const py=Math.max(H*.24,H*.61-520),targetY=H*.58;
 c.save();c.globalAlpha*=g.energy;
 const positions=g.helpers.length===1?[450]:g.helpers.length===2?[295,605]:[205,450,695];
 // The three seals represent actual helpers, not fictitious players or gifts.
 for(let i=0;i<g.helpers.length;i++){
  const x=positions[i],y=py+(i%2)*18,glow=.42+g.shield*.38;
  c.save();c.translate(x,y);
  c.strokeStyle=i%2?'#c7beff':'#9feae2';c.lineWidth=light?2:3;c.globalAlpha=glow;
  for(let j=0;j<(light?1:2);j++){
   c.beginPath();c.ellipse(0,0,35+j*13,35+j*13,clock*(j?-.25:.15)+i,0,TAU);c.stroke();
  }
  c.beginPath();
  for(let n=0;n<=6;n++){const a=n*TAU/6+clock*.05,r=20+g.shield*6;n?c.lineTo(Math.cos(a)*r,Math.sin(a)*r):c.moveTo(Math.cos(a)*r,Math.sin(a)*r);}
  c.stroke();
  c.restore();
  const toX=450,toY=targetY-110;
  c.globalAlpha=g.energy*(.22+.25*g.shield);
  c.strokeStyle='#bdece6';c.lineWidth=light?1.5:2.5;c.beginPath();c.moveTo(x,py+32);c.quadraticCurveTo((x+toX)/2,py+90,toX,toY);c.stroke();
  const name=String(scene.playerIndex?.get(g.helpers[i])?.name||'Hộ pháp').slice(0,16);
  c.globalAlpha=g.energy;c.font='700 14px Segoe UI,Arial';c.fillStyle='#f6e7bd';c.textAlign='center';c.fillText(name,x,py-52,152);
 }
 if(g.shield>.01){
  c.globalAlpha=g.energy*g.shield*.6;c.strokeStyle='#ffda96';c.lineWidth=light?2:3;
  c.beginPath();c.ellipse(450,targetY-112,95+g.shield*80,32+g.shield*50,0,0,TAU);c.stroke();
 }
 c.globalAlpha=g.energy*.87;c.font='700 22px Georgia';c.textAlign='center';c.fillStyle='#fff0b8';
 c.fillText('ĐỒNG MÔN HỘ KIẾP · '+g.helpers.length+' HỘ PHÁP',450,H*.195,690);
 c.restore();
}
