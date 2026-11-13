// Packs separately drawn poses. Never deforms anatomy or interpolates one pose into another.
import fs from 'node:fs/promises';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {PREMIUM_PET_ATLAS as A,PREMIUM_PET_PERIODS} from '../public/premium-pet-motion.js';
const dir='public/assets/spirit-pets-v1/animated',N=A.size;
await fs.mkdir(dir,{recursive:true});
for(const id of Object.keys(PREMIUM_PET_PERIODS)){
 const image=await loadImage('art-source/spirit-pets-v2/'+id+'.png');
 const atlas=createCanvas(N*A.columns,N*2),c=atlas.getContext('2d'),sw=image.width/4,sh=image.height/2;
 for(let i=0;i<8;i++){
  const fit=Math.min((N-12)/sw,(N-12)/sh),x=(i%4)*N+(N-sw*fit)/2,y=Math.floor(i/4)*N+(N-sh*fit)/2;
  c.drawImage(image,(i%4)*sw,Math.floor(i/4)*sh,sw,sh,x,y,sw*fit,sh*fit);
 }
 const bytes=c.getImageData(0,0,atlas.width,atlas.height);
 // Remove near-transparent export residue, keeping the drawn translucent fur and feathers.
 for(let i=3;i<bytes.data.length;i+=4)if(bytes.data[i]<28)bytes.data[i]=0;
 c.putImageData(bytes,0,0);
 const data=await atlas.encode('webp',94);await fs.writeFile(dir+'/'+id+'-'+A.version+'.webp',data);
 console.log(id+' · 8 separately drawn poses · '+Math.round(data.length/1024)+' KiB');
}
