// Procedural boss: one lightweight Canvas draw, no video or particle swarm.
export function drawThunderTiger(c,boss,now,x,y){
 const age=Math.max(0,now-(boss.startedAt??now-1400)),u=Math.min(1,age/1400),a=now*.002;
 const drop=-(1-u)*(1-u)*400,bounce=u<1?Math.sin(u*Math.PI)*-45:Math.sin(a)*4;
 c.save();c.translate(x,y);c.fillStyle='#10122c55';c.beginPath();c.ellipse(0,70,75*(.5+u*.5),13,0,0,7);c.fill();
 if(age>1000&&age<2600){const q=(age-1000)/1600;c.strokeStyle=`rgba(163,221,255,${1-q})`;c.lineWidth=3;c.beginPath();c.ellipse(0,70,30+q*180,8+q*38,0,0,7);c.stroke();}
 c.translate(0,drop+bounce);c.lineWidth=2;c.strokeStyle='#d2c1fa';
 const shape=(pts,fill)=>{c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();c.stroke();};
 // Tail, four paws, broad chest, ears and angular striped tiger face.
 c.strokeStyle='#a4a5e4';c.lineWidth=9;c.beginPath();c.moveTo(48,35);c.bezierCurveTo(100,45,95,-24+Math.sin(a)*9,66,-17);c.stroke();
 c.lineWidth=2;c.strokeStyle='#c9c3f5';
 for(const side of [-1,1]){shape([[side*29,8],[side*54,24],[side*61,65],[side*33,65]],'#535b95');shape([[side*16,18],[side*30,28],[side*26,71],[side*5,71]],'#8a91c9');}
 const g=c.createLinearGradient(0,-34,0,62);g.addColorStop(0,'#a6a7e4');g.addColorStop(1,'#39406b');
 c.beginPath();c.ellipse(0,14,43,46,0,0,7);c.fillStyle=g;c.fill();c.stroke();
 shape([[-35,-24],[-35,-55],[-12,-42]],'#56537f');shape([[35,-24],[35,-55],[12,-42]],'#56537f');
 shape([[-36,-32],[-19,-46],[19,-46],[36,-32],[30,-3],[14,12],[-14,12],[-30,-3]],g);
 c.strokeStyle='#272843';c.lineWidth=5;
 for(const side of [-1,1])for(let i=0;i<3;i++){c.beginPath();c.moveTo(side*(31-i),-28+i*10);c.lineTo(side*(16+i*2),-21+i*10);c.stroke();}
 c.beginPath();c.moveTo(-10,-37);c.lineTo(0,-32);c.lineTo(10,-37);c.moveTo(0,-43);c.lineTo(0,-24);c.stroke();
 c.fillStyle='#a9faff';for(const side of [-1,1]){c.beginPath();c.ellipse(side*16,-19,7,3,side*.2,0,7);c.fill();}
 shape([[-10,-6],[0,-11],[10,-6],[0,0]],'#dfe8ff');
 c.fillStyle='#f5f3e6';for(const side of [-1,1]){c.beginPath();c.moveTo(side*13,-1);c.lineTo(side*10,12);c.lineTo(side*6,1);c.fill();}
 c.strokeStyle='#9de9ff';c.lineWidth=1.5;
 for(let i=0;i<3;i++){const phase=a+i*2;c.beginPath();c.moveTo(-65+i*60,-45+Math.sin(phase)*7);c.lineTo(-73+i*60,-24);c.lineTo(-61+i*60,-28);c.lineTo(-69+i*60,-8);c.stroke();}
 c.restore();
}
