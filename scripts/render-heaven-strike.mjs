import {createCanvas,loadImage} from '@napi-rs/canvas';
import fs from 'node:fs';
const R=process.cwd().split(String.fromCharCode(92)).join('/');
const {drawHeavenStrike,strikeProfile}=await import('file:///'+R+'/public/heaven-strike.js');
const bg=await loadImage(R+'/public/assets/sect-morning-v20.png'),art=await loadImage(R+'/public/assets/cultivators-standing-v14.png');
const W=900,H=850,seed=Number(process.argv[2]||12345),times=[.7,1.5,2.2,2.5,2.62,2.72,2.95,3.6,5.0,6.8];const prof=strikeProfile(seed);
const cols=5,tw=450,th=425,sheet=createCanvas(tw*cols,th*Math.ceil(times.length/cols)),sc=sheet.getContext('2d');
times.forEach((t,i)=>{const cv=createCanvas(W,H),c=cv.getContext('2d');c.drawImage(bg,0,0,W,H);
 const fw=art.width/6,fh=art.height;for(let k=0;k<5;k++){const x=180+k*135,y=H*.78;c.drawImage(art,(k%6)*fw,0,fw,fh,x-45,y-130,90,130);}
 drawHeavenStrike(c,prof,t,{W,H,x:450,y:H*.78,scale:1.42},{name:'Nam nguyễn !',loss:43437351});
 c.fillStyle='#ff0';c.font='20px sans-serif';c.fillText('t='+t,20,30);sc.drawImage(cv,(i%cols)*tw,Math.floor(i/cols)*th,tw,th);});
fs.writeFileSync(R+`/output/heaven-strike/sheet-${seed}.png`,sheet.toBuffer('image/png'));console.log(prof.palette.id,prof.bolts.length,prof.title);
