import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {drawPetV2CoveScene} from '../public/pet-v2-cove-fx.js';
const H=1400;
function render(phase,{light=false,motion=true}={}){
 const canvas=createCanvas(900,H),c=canvas.getContext('2d');
 const scene={petCovePhase:{phase,progress:phase==='opening'?.02:phase==='exploration'?.25:phase==='community'?.83:.96},motion,budget:{level:light?'light':'medium'}};
 const initial=JSON.stringify(scene),transform=c.getTransform().toString();
 assert.equal(drawPetV2CoveScene(scene,c,1500,H,'back'),true);
 assert.equal(drawPetV2CoveScene(scene,c,1500,H,'front'),true);
 assert.equal(JSON.stringify(scene),initial);
 assert.equal(c.getTransform().toString(),transform);
 const bytes=c.getImageData(0,0,900,H).data;let coverage=0,hash=2166136261;
 for(let i=0;i<bytes.length;i+=4){if(bytes[i+3])coverage++;if(i%100===0)hash=Math.imul(hash^bytes[i]^bytes[i+1]^bytes[i+2]^bytes[i+3],16777619);}
 return {coverage,hash:hash>>>0};
}
test('all 4 Linh Thu Coc phases have visually distinct Canvas effects with reduced-motion fallback',()=>{
 const phases=['opening','exploration','community','settlement'];
 const images=phases.map(p=>render(p));
 assert.equal(new Set(images.map(x=>x.hash)).size,4);
 assert.ok(images.every(x=>x.coverage>500));
 for(const phase of phases){assert.ok(render(phase,{light:true,motion:false}).coverage>100);}
 assert.equal(drawPetV2CoveScene({petCovePhase:null},createCanvas(900,H).getContext('2d'),0,H,'back'),false);
});
