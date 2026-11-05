export function noteEngagementReaction(scene,e,t){
 if(!['follow','share'].includes(e.engagementAction)||!e.user)return;
 const rows=scene.engagementReactions??=new Map();rows.set(e.user,{...e,start:t});
 while(rows.size>8)rows.delete(rows.keys().next().value);
}
export function drawEngagementReactions(scene,c,t){
 const rows=scene.engagementReactions;if(!rows)return;
 for(const [id,e]of rows)if(t-e.start>3400)rows.delete(id);
 const visible=[...rows.values()].filter(e=>scene.targets?.some(a=>a.id===e.user)).slice(-(scene.budget?.level==='light'?3:5));
 for(const e of visible){const a=scene.targets.find(a=>a.id===e.user),motion=scene.motion!==false,k=motion?Math.max(0,Math.min(1,(t-e.start)/3400)):.45,fade=Math.min(1,k*7,(1-k)*5),s=Math.min(1.4,(a.scale||1.5)/1.5),x=a.x,y=a.y-65*s;
  c.save();c.globalAlpha=fade;c.strokeStyle=e.engagementAction==='follow'?'#9cf3d4':'#ffe5a1';c.fillStyle=c.strokeStyle;c.lineWidth=2;
  if(e.engagementAction==='follow'){
   for(let i=0;i<2;i++){const u=(k*1.4+i*.5)%1;c.globalAlpha=fade*(1-u*.65);c.beginPath();c.ellipse(x,y,(24+u*52)*s,(45+u*52)*s,0,0,Math.PI*2);c.stroke();}
   for(let i=0;i<5;i++){const q=i*Math.PI*2/5+k*4;c.save();c.translate(x+Math.cos(q)*50*s,y+Math.sin(q)*65*s);c.rotate(q);c.beginPath();c.ellipse(0,0,4*s,8*s,0,0,Math.PI*2);c.fill();c.restore();}
  }else{
   for(let i=0;i<3;i++){const u=(k+i*.17)%1,side=i%2?-1:1,xx=x+side*(12+u*65)*s,yy=y+20*s-u*145*s,wing=motion?Math.sin(t*.018+i)*10:5;
    c.globalAlpha=fade*(1-u*.45);c.save();c.translate(xx,yy);c.rotate(side*.2);
    c.beginPath();c.moveTo(-17*s,-wing*s);c.lineTo(0,3*s);c.lineTo(17*s,-wing*s);c.lineTo(4*s,10*s);c.lineTo(0,5*s);c.lineTo(-4*s,10*s);c.closePath();c.fill();
    c.beginPath();c.moveTo(0,3*s);c.lineTo(5*s,-8*s);c.lineTo(10*s,-5*s);c.stroke();c.restore();}
  }
  c.globalAlpha=fade;c.font='800 20px Segoe UI';c.textAlign='center';c.lineWidth=4;c.strokeStyle='#09222c';const label=e.engagementAction==='follow'?'ĐÃ THEO DÕI':'ĐÃ CHIA SẺ';
  c.strokeText(label,x,a.y+85*s);c.fillText(label,x,a.y+85*s);c.restore();
 }
}
