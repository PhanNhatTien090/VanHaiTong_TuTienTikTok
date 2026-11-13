// Rebuild the anatomical loops from the existing transparent artwork. No runtime deformation cost.
import fs from 'node:fs/promises';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {PREMIUM_PET_ATLAS as A,PREMIUM_PET_PERIODS,premiumPetWarp} from '../public/premium-pet-motion.js';
const dir='public/assets/spirit-pets-v1',N=A.size;
await fs.mkdir(dir+'/animated',{recursive:true});
for(const id of Object.keys(PREMIUM_PET_PERIODS)){
 const image=await loadImage(`${dir}/${id}.png`),source=createCanvas(N,N),c=source.getContext('2d');
 const sw=image.width/3,fit=Math.min((N-38)/sw,(N-38)/image.height);
 c.drawImage(image,0,0,sw,image.height,(N-sw*fit)/2,(N-image.height*fit)/2,sw*fit,image.height*fit);
 // Drop isolated generation specks and normalize the silhouette before rigging.
 const clean=c.getImageData(0,0,N,N),seen=new Uint8Array(N*N);
 for(let i=0;i<N*N;i++){
  if(seen[i]||clean.data[i*4+3]<8)continue;
  const points=[i];seen[i]=1;
  for(let q=0;q<points.length;q++){
   const k=points[q],x=k%N,y=Math.floor(k/N);
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
    const xx=x+dx,yy=y+dy,j=yy*N+xx;
    if(xx<0||xx>=N||yy<0||yy>=N||seen[j]||clean.data[j*4+3]<8)continue;
    seen[j]=1;points.push(j);
   }
  }
  if(points.length<45)for(const k of points)clean.data[k*4+3]=0;
 }
 c.putImageData(clean,0,0);
 let x0=N,y0=N,x1=0,y1=0;
 for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(clean.data[(y*N+x)*4+3]>32){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
 const normalized=createCanvas(N,N),nc=normalized.getContext('2d'),bw=x1-x0+3,bh=y1-y0+3,scale=Math.min((N-38)/bw,(N-38)/bh);
 nc.drawImage(source,x0-1,y0-1,bw,bh,(N-bw*scale)/2,(N-bh*scale)/2,bw*scale,bh*scale);
 const pixels=nc.getImageData(0,0,N,N).data,atlas=createCanvas(N*A.columns,N*Math.ceil(A.frames/A.columns)),ac=atlas.getContext('2d');
 for(let frame=0;frame<A.frames;frame++){
  const out=c.createImageData(N,N),dest=out.data;
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){
   // Two inverse iterations keep paws, feathers and tails connected at their joints.
   let sx=x/N,sy=y/N;
   for(let j=0;j<2;j++){const d=premiumPetWarp(id,sx,sy,frame/A.frames);sx=x/N-d.dx;sy=y/N-d.dy;}
   sx*=N;sy*=N;const x0=Math.floor(sx),y0=Math.floor(sy);
   if(x0<0||y0<0||x0>=N-1||y0>=N-1)continue;
   const fx=sx-x0,fy=sy-y0,weights=[(1-fx)*(1-fy),fx*(1-fy),(1-fx)*fy,fx*fy],idx=(y0*N+x0)*4;
   const offsets=[idx,idx+4,idx+N*4,idx+N*4+4],di=(y*N+x)*4;
   let alpha=0,r=0,g=0,b=0;
   for(let j=0;j<4;j++){const k=offsets[j],a=pixels[k+3]*weights[j];alpha+=a;r+=pixels[k]*a;g+=pixels[k+1]*a;b+=pixels[k+2]*a;}
   if(alpha){dest[di]=r/alpha;dest[di+1]=g/alpha;dest[di+2]=b/alpha;dest[di+3]=alpha;}
  }
  c.putImageData(out,0,0);ac.drawImage(source,(frame%A.columns)*N,Math.floor(frame/A.columns)*N);
 }
 const file=`${dir}/animated/${id}-${A.version}.webp`,buffer=await atlas.encode('webp',92);
 await fs.writeFile(file,buffer);console.log(id,A.frames+' frames',Math.round(buffer.length/1024)+' KiB');
}
